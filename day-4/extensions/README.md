# Extensions — Application Customizer, Command Set, Field Customizer

> Typ: povinný · Den: 4 · Odhad: 120 min
> Tenant: `cloudedu.cz` · Režim: hands-on, vlastní web
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Web party žijí tam, kam je editor vloží. Extensions běží **všude**: na každé stránce webu,
v každém seznamu. Řešení dostane banner oznámení a akci „Vydat zařízení" přímo v seznamu
vybavení.

## Cíle

- Rozlišit tři typy extensions podle toho, kde a kdy běží.
- Vykreslit obsah do placeholderu stránky bez závislosti na DOM SharePointu.
- Přidat příkaz do seznamu, který se zobrazí jen tehdy, kdy dává smysl.
- Rozhodnout mezi Field Customizerem a JSON formátováním — a zvolit levnější cestu.

## Výklad

### Tři typy

| Typ | Kde běží | V řešení |
|---|---|---|
| **Application Customizer** | na každé stránce webu; placeholdery `Top` a `Bottom` | `PortalBanner` — oznámení |
| **ListView Command Set** | panel příkazů a kontextové menu seznamu | `IssueEquipment` — Vydat zařízení |
| **Field Customizer** | vykreslení buňky jednoho sloupce | **ne** — JSON formátování stačí |
| Form Customizer | nový / edit / zobrazovací formulář | zmínka (SPFx 1.23.2: příprava na panel v seznamu) |

Extensions se testují **jen na skutečné stránce** — hosted workbench je nenačte
([Debug on modern pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)).
Pondělní Debug Toolbar je tu jediná cesta.

### Placeholdery, ne DOM

Application Customizer nesmí hledat prvky stránky selektorem — DOM SharePointu není API a mění
se. Dostane **placeholder** (`this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top)`)
a kreslí jen do jeho `domElement`. Podle dokumentace extension:

- **nesmí předpokládat, že placeholder existuje** (`tryCreateContent` může vrátit `undefined`),
- reaguje na `placeholderProvider.changedEvent` — placeholdery vznikají a zanikají při
  navigaci.

Zdroj: [Use page placeholders from Application Customizer](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions).

### Banner běží na každé stránce — a to stojí

> [!IMPORTANT] Banner s Reactem a Fluent UI by byl 34× větší — změřeno (2026-10-16)
>
> | Varianta `PortalBanner` | Bundle |
> |---|---|
> | DOM API (`createElement`, `textContent`), CSS modul | **5 499 B** |
> | React + `MessageBar` z Fluent UI | 188 628 B |
>
> Lektorský stroj, SPFx 1.23.2, `npm run build`. Data:
> [`../performance-caching/mereni-den-4.md`](../performance-caching/mereni-den-4.md).
>
> **Kód, který běží na každé stránce, platí každá stránka — v extensions šetři víc než ve web
> partech.**

Text oznámení se vkládá přes `textContent`, ne `innerHTML`: pochází z konfigurace a nesmí
do stránky vložit HTML ani skript.

### Command Set: viditelnost podle kontextu

Generátor SPFx 1.23 už používá událost `this.context.listView.listViewStateChangedEvent`
(starší návody: `onListViewUpdated`). Příkaz *Vydat zařízení* je viditelný, jen když:

1. seznam je `Lists/Equipment` (registrace v `elements.xml` platí pro všechny seznamy typu
   100 na webu — filtr je v kódu),
2. je vybraná **právě jedna** položka,
3. její `Status` je `Available`.

Akce se zeptá na e-mail (`Dialog.prompt` z `@microsoft/sp-dialog`), přes PnPjs zavolá
`ensureUser` a zapíše `Status = Issued` a `AssignedToId`.

Zdroj: [Build your first ListView Command Set](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api).

### Field Customizer vs. JSON formátování

Barevný štítek stavu ve sloupci `Status` jde udělat Field Customizerem (kód, build, nasazení,
údržba) — nebo JSON formátováním sloupce (nastavení v seznamu, bez kódu). Pro „jinak zobrazit
hodnotu, kterou seznam má" je správně JSON — stejná osa jako v pondělí
([`../../day-1/platform-positioning/`](../../day-1/platform-positioning/)). Field Customizer
dává smysl, až když vykreslení potřebuje data, která v řádku nejsou, nebo vlastní logiku.

Zdroj: [Use column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting).

### Registrace: `elements.xml`, ne `ClientSideInstance.xml`

Generátor při první extension přidá dva soubory:

| Soubor | Co dělá | V kurzu |
|---|---|---|
| `sharepoint/assets/elements.xml` | `CustomAction` na webu, kam se aplikace přidá | **ano** |
| `sharepoint/assets/ClientSideInstance.xml` | registrace extension **pro celý tenant** při nasazení „na všechny weby" | **odstraněno** |

Na sdíleném tenantu by `ClientSideInstance.xml` při nesprávné volbě v dialogu nasazení dal
banner jednoho studenta na weby všech. Řešení ho proto nemá.

Zdroj: [Tenant wide deployment of extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/basics/tenant-wide-deployment-extensions).

## Klíčové rozlišení

- **Placeholder vs. DOM stránky** — placeholder je API, selektor na DOM je tichá chyba za půl roku.
- **`textContent` vs. `innerHTML`** — text vs. kód.
- **Registrace vs. viditelnost** — `elements.xml` určuje, kde se extension načte; kód, kdy je
  příkaz vidět.
- **Field Customizer vs. JSON formátování** — kód a nasazení vs. nastavení sloupce.

## Naše prostředí

- Seznam `Equipment` z dne 3 na webu `spodev-<ini>`; test na moderní stránce s debug
  parametry (stránka Home webu).
- Při testu z `localhost` extension nikde neregistrujeme — žije jen v URL.

## Lab

Viz [`lab-banner-a-prikaz.md`](lab-banner-a-prikaz.md).

## Nosná linka

Řešení dostane **banner oznámení** (Application Customizer, 5,5 KB) a akci **Vydat zařízení**
v seznamu (Command Set). Štítky stavů ve sloupci řeší JSON formátování, ne kód.

## Zdroje (Microsoft)

- [Use page placeholders from Application Customizer](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions)
- [Build your first ListView Command Set extension](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api)
- [Debug SharePoint Framework solutions on modern pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)
- [Use column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting)
- [Tenant wide deployment of extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/basics/tenant-wide-deployment-extensions)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> SPFx 1.23 ohlásila vylepšení Command Setů (seskupování); SPFx 1.25 má přinést navigation
> customizers. Přidání extension do React projektu generátorem 1.23.2 vyžaduje
> `--framework none` (jinak chyba šablony — viz lab).
