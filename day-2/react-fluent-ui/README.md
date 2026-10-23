# React a Fluent UI

> Typ: povinný · Den: 2 · Odhad: 120 min
> Tenant: `cloudedu.cz` · Režim: hands-on, vlastní web
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Rozcestník dostane podobu, se kterou půjde do zbytku týdne: funkční komponenta s hooks,
komponenty Fluent UI, barvy podle sekce stránky a ovládání z klávesnice. A první překvapení
týdne v číslech.

## Cíle

- Převést třídní komponentu na funkční s `useState`, `useMemo` a vlastním hookem.
- Rozvrhnout zdrojáky tak, aby je sdílely další web party (`src/models`, `src/utils`,
  `src/hooks`).
- Použít Fluent UI v8 a předat mu motiv sekce stránky.
- Ověřit přístupnost: klávesnice, popisky, oznámení nové karty.
- Změřit, kolik Fluent UI přidá do balíčku.

## Výklad

### Verze: React 17 a Fluent UI v8

| Knihovna | Verze v SPFx 1.23.2 | Proč ne novější |
|---|---|---|
| React | **17.0.1**, přesně | SPFx ho sdílí se stránkou; jiná verze se může tiše rozbít za běhu ([compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)) |
| Fluent UI React | **v8** (`@fluentui/react`) | dokumentace doporučuje verzi, kterou nasadí generátor ([Fluent UI in SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)) |

React 17 nemá `useId` (přišel v Reactu 18) — stabilní ID pro `aria-labelledby` proto dává
`getId` z Fluent UI. Fluent UI v9 (`@fluentui/react-components`) dokumentace SPFx nezmiňuje;
v kurzu ji nepoužíváme — proč, a co jsme naměřili, je v sekci *Fluent UI 9 — proč počkat* níže.

**React do bundlu nepatří.** Manifest z buildu uvádí `react` a `react-dom` 17.0.1 jako
komponenty SPFx s pevným ID; načte je zavaděč SPFx ze SharePointu a sdílí je všechna řešení
na stránce. Proto musí verze v `package.json` přesně odpovídat verzi SPFx — jinak řešení
počítá s jiným Reactem, než jaký dostane. Fluent UI naopak v bundlu **je**.

### React za 10 minut

Podrobně v [`explainer-react.md`](explainer-react.md). Minimum pro tento blok:

- **Komponenta** = funkce `props → JSX`. **Props** jsou vstupy (komponenta je nemění),
  **state** je paměť komponenty (`useState`); změna state vyvolá nové vykreslení a React do DOM
  zapíše jen rozdíl.
- **Hooky** používané v kurzu: `useState` (paměť), `useEffect` (načítání dat, časovače —
  s cleanupem), `useMemo` / `useCallback` (nepočítat a nevytvářet znovu), vlastní hooky
  (`useFilteredLinks`, později `useEquipment`, `useEmployees`).
- **Pravidla hooků:** jen na nejvyšší úrovni komponenty, nikdy v podmínce nebo cyklu.
- **Třída vs. funkce:** třída web partu (`BaseClientSideWebPart`) je třída **SPFx**, ne
  komponenta Reactu. Komponenty píšeme jako funkce; jediná třída mezi nimi je `ErrorBoundary`
  (den 5), protože error boundary jako funkci napsat nejde
  ([Component](https://react.dev/reference/react/Component)).
- **Kdy se vykresluje:** web part volá `ReactDom.render(...)` při každé změně vlastnosti;
  React komponentu nevytvoří znovu, jen ji vykreslí s novými props a zachová její state.

### Fluent UI v praxi

Podrobně, včetně zapojení komponenty krok za krokem (`Panel` s formulářem), v
[`explainer-fluent-ui.md`](explainer-fluent-ui.md). Pravidla:

1. Komponentu najdi v [katalogu v8](https://developer.microsoft.com/fluentui#/controls/web),
   importuj **pojmenovaně** z `@fluentui/react`.
2. Vstupy řiď ze state: `value` dovnitř, `onChange(event, newValue)` ven.
3. Texty z `strings`, rozvržení přes `Stack`, vlastní vzhled přes CSS modul nebo prop `styles`.
4. Motiv sekce přes `ThemeProvider` (níže), ikony přes `Icon` / `iconProps`.
5. Po přidání komponenty změř bundle.

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> SPFx 1.24 má podle roadmapy přinést **React 18** jako výchozí. Funkční komponenty s hooks
> přechod snesou; `ReactDom.render` ve vygenerované třídě web partu React 18 označuje za
> zastaralé. Co přesně upgrade změní, se posoudí v pátek v `spfx-whats-next`.

### Struktura převzatá z learn-spfx-growth

```text
src/
├─ models/      IPortalLink — sdílené typy (dopoledne)
├─ utils/       parseLinks, validateLinks — čisté funkce bez Reactu (dopoledne)
├─ hooks/       useFilteredLinks — logika komponent bez UI (teď)
└─ webparts/portal/
   ├─ PortalWebPart.ts       # hranice SPFx: kontext, vlastnosti, motiv
   └─ components/Portal.tsx  # jen UI, dostane vše v props
```

Pravidlo: **komponenta nesahá na `this.context`**. Všechno, co potřebuje ze SPFx (uživatel,
motiv, URL), jí předá web part v props. Ve středu díky tomu půjde komponenty testovat bez
SharePointu.

### Funkční komponenta a hooks

| Hook | K čemu v Rozcestníku |
|---|---|
| `useState` | text hledání; stabilní ID nadpisu |
| `useMemo` | seznam odkazů + knihovna — přepočítá se jen při změně vstupů |
| `useFilteredLinks` (vlastní) | filtrování podle hledaného textu, znovupoužitelné |

### Motiv a pozadí sekce

Manifest web partu má `"supportsThemeVariants": true`. Když editor nastaví sekci stránky
barevné pozadí, SPFx zavolá `onThemeChanged` s variantou motivu. Web part ji uloží a předá
komponentě, která ji dá **`ThemeProvider`** z Fluent UI — komponenty Fluent pak použijí barvy
sekce místo výchozích.

Zdroj: [Supporting section backgrounds](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/supporting-section-backgrounds).

### Globální CSS je zakázané území

Fluent UI i SharePoint sdílejí stránku. Dokumentace varuje před **globálními CSS styly**:
nová verze SharePointu je může přepsat nebo ony přepíšou stránku. Proto CSS moduly
(`*.module.scss`, generují unikátní názvy tříd) a styly Fluent UI — ne globální třídy
`ms-*` v markupu.

Zdroj: [Using Fluent UI in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)
(updated 2026-03-31).

### `escape()` do JSX nepatří

Vygenerovaná komponenta i pondělní lab volají `escape(userDisplayName)`. React ale text
v JSX escapuje sám — `escape()` navíc z `R&D` udělá `R&amp;D` a React to vypíše doslova.
`escape()` patří jen tam, kde se HTML skládá z řetězců (`innerHTML`).

### Kolik stojí Fluent UI

> [!IMPORTANT] Šest komponent Fluent UI zvětšilo bundle 17,7× — změřeno (2026-10-16)
> `portal-web-part_*.js` po `npm run build`, lektorský stroj, SPFx 1.23.2:
>
> | Stav | Bundle |
> |---|---|
> | Rozcestník po `property-pane` (čisté HTML) | 11 693 B |
> | Rozcestník po tomto bloku (`Text`, `SearchBox`, `Link`, `Icon`, `ThemeProvider`, `getId`) | 206 511 B |
> | Totéž s importy přes cesty `@fluentui/react/lib/…` | 206 532 B |
>
> Data a postup: [`mereni-bundle-fluent.md`](mereni-bundle-fluent.md).
>
> **Cenu tvoří sdílený runtime Fluent UI (styly, motiv), ne jednotlivé komponenty — a importy
> přes `lib/…` na ní nic nezmění.**

Neznamená to „Fluent UI nepoužívat". Znamená to vědět, kolik stojí — středeční baseline
a čtvrteční optimalizace na tomto čísle stojí.

### Fluent UI 9 — proč počkat

> [!IMPORTANT] Samotná v9 je menší, smíšená v8 + v9 nejdražší — změřeno (2026-10-23)
> Stejné UI (popisek, pole, tlačítko, motiv): v8 **213 195 B**, v9 **95 280 B**, v9 s převodem
> motivu SPFx **104 201 B**, v8 a v9 v jednom web partu **307 135 B**.
> Data a postup: [`mereni-fluent-v9.md`](mereni-fluent-v9.md).

Velikost tedy proti v9 nemluví. Proti přechodu v SPFx 1.23 mluví:

- **podpora** — Learn pro SPFx 1.18+ popisuje jen v8 a verzi z generátoru označuje za jediný
  oficiálně podporovaný přístup ([Fluent UI in SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration#fluent-ui-react-formerly-office-ui-fabric-react));
- **motiv** — SPFx dává motiv sekce ve tvaru v8; pro v9 se musí převádět (`createV9Theme`);
- **smíšený stav** — existující řešení s v8 + jedna komponenta z v9 = obě knihovny v bundlu
  (+44 %); totéž přinesou PnP SPFx controls, které závisí na obou verzích;
- **`FluentProvider` v každém web partu** — web party nemají společný kořen.

Kdy v9 ano a podrobnosti: [`explainer-fluent-ui.md`](explainer-fluent-ui.md#proč-zatím-ne-fluent-ui-9).

## Klíčové rozlišení

- **Komponenta vs. web part** — web part zná SPFx, komponenta jen props.
- **Hook vs. utilita** — `parseLinks` je čistá funkce (testuje se bez Reactu),
  `useFilteredLinks` je hook (potřebuje React kvůli `useMemo`).
- **CSS modul vs. globální CSS** — `styles.portal` je unikátní název; `.ms-Grid` v markupu je
  globální třída, kterou ti SharePoint může změnit pod rukama.
- **Velikost importu vs. velikost knihovny** — tree shaking odstraní nepoužité komponenty,
  ne sdílené jádro.

## Naše prostředí

- Test motivu: na testovací stránce webu `spodev-<ini>` nastavit sekci pozadí (*Section
  background*). Nastavení motivu webu (*Change the look*) mění motiv pro všechny — na vlastním
  webu je to v pořádku.

## Lab

Viz [`lab-fluent-rozcestnik.md`](lab-fluent-rozcestnik.md).

## Nosná linka

Rozcestník je **hotový web part**: konfigurovatelný, dvojjazyčný, s hledáním, v barvách sekce
a ovladatelný klávesnicí. Struktura `src/models` · `src/utils` · `src/hooks` je připravená pro
Adresář zaměstnanců a Evidenci vybavení ve středu. Velikost balíčku 206 511 B je výchozí bod
měřicí nitě.

Stav po dni 2: [`solution/vltava-portal/`](solution/vltava-portal/).

## Zdroje (Microsoft)

- [Using Fluent UI in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)
- [Supporting section backgrounds](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/supporting-section-backgrounds)
- [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)

## Zdroje (třetí strana — React, Fluent UI)

> [!IMPORTANT] Proč odkaz mimo Learn
> API Reactu a komponent Fluent UI v8 dokumentují jejich projekty, ne Learn.

- [React — Hooks reference](https://react.dev/reference/react/hooks)
- [Fluent UI React v8 — komponenty](https://developer.microsoft.com/en-us/fluentui#/controls/web)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> React 17.0.1 a Fluent UI v8 platí pro SPFx 1.23.2. SPFx 1.24 mění výchozí React na 18 —
> velikost balíčku a chování `ThemeProvider` po upgradu znovu změřit.
