# SPFx v Microsoft 365 — pozice a hranice tenantu

> Typ: povinný · Den: 1 · Odhad: 45 min
> Tenant: `cloudedu.cz` · Režim: výklad + návrhový lab (papír/MD)
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Úvodní blok týdne. Než se cokoli nainstaluje, musí být jasné, **kdy** se SPFx vyplatí a kdy je
to zbytečný kód na údržbu — a **kam** tečou data, když SPFx komponenta běží.

## Cíle

- Vysvětlit, jak SPFx komponenta běží: v prohlížeči, v kontextu přihlášeného uživatele,
  přímo v DOM stránky.
- Rozhodnout pro daný požadavek mezi SPFx, JSON formátováním, Power Platform, Teams aplikací
  a deklarativním agentem — a odůvodnit to.
- Pojmenovat, kdy data opouštějí tenant zákazníka a kdo to musí schválit.

## Výklad

### Co SPFx je

SharePoint Framework je model pro **client-side** komponenty: web party, rozšíření stránek
a seznamů, Adaptive Card Extensions pro Viva Connections a nově Copilot UX components. Podle
dokumentace komponenta:

- běží **v kontextu aktuálního uživatele a jeho připojení v prohlížeči**,
- **nepoužívá iframe** — JavaScript se vkládá přímo do stránky a vykresluje do normálního DOM,
- je hostovaná **automaticky v SharePointu** (App Catalog), bez vlastního serveru.

Zdroj: [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview).

> [!IMPORTANT] DOM stránky SharePointu není API
> Dokumentace to říká výslovně: na struktuře HTML a CSS stránky nesmíš záviset — mění se bez
> ohlášení. Jediná podporovaná cesta je API, které SPFx nabízí (placeholdery, kontext,
> HTTP klienti). Vrátíme se k tomu ve čtvrtek u extensions.

### Technologické zlomy

| Kdy | Zlom | Co z toho plyne dnes |
|---|---|---|
| 2017-02 | první verze SPFx (jen web party) | základ, na kterém stavíme |
| 2024-11-01 | SharePoint Add-ins přestaly fungovat **na nových tenantech** | tenant `cloudedu.cz` Add-ins nikdy neměl |
| 2026-04-02 | SharePoint Add-ins přestaly fungovat **na všech tenantech** | jediná náhrada pro UI v SharePointu je SPFx |
| SPFx 1.22 | toolchain gulp → **Heft** | návody s `gulp` na internetu jsou pro starý toolchain |
| SPFx 1.24 (preview) | **Copilot UX components** — SPFx komponenty uvnitř Microsoft 365 Copilot | SPFx už není „jen SharePoint" |

Zdroje: [SPFx roadmap](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/roadmap),
[SharePoint Add-In retirement](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/retirement-announcement-for-add-ins),
[Heft-based toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft).

> [!NOTE] SharePoint Server je jiný svět
> On-premises SharePoint Server Subscription Edition podporuje SPFx jen v1.0–v1.5, SharePoint
> Server 2019 v1.0–v1.4.1 ([compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)).
> Vše v tomto kurzu je pro SharePoint Online.

### Kdy SPFx, a kdy ne

Nejdražší SPFx řešení je to, které nemuselo vzniknout. Rozhodovací osa jde od nejlevnějšího
na údržbu k nejdražšímu:

| Potřeba | První volba | Kód? | Kdo udržuje |
|---|---|---|---|
| jinak zobrazit sloupec nebo zobrazení seznamu | **JSON formátování** | ne | správce webu |
| formulář, schvalování, automatizace nad seznamem | **Power Apps / Power Automate** | low-code | citizen developer |
| odpovídat nad obsahem v přirozeném jazyce | **deklarativní agent** (SharePoint agent) | ne | vlastník obsahu |
| vlastní UI na stránce, data z více zdrojů, logika v prohlížeči | **SPFx web part** | ano | vývojář |
| chování na **každé** stránce nebo v **každém** seznamu (banner, akce, vykreslení sloupce) | **SPFx extension** | ano | vývojář |
| samostatná aplikace s vlastním backendem, hlavně v Teams | **Teams aplikace** (Microsoft 365 Agents Toolkit) | ano | vývojář + provoz backendu |

Zdroje: [Column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting),
[Declarative agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent),
[SPFx for Teams](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview).

### Hranice tenantu

SPFx komponenta je JavaScript, který si prohlížeč uživatele stáhne z App Catalogu tenantu
a spustí na stránce. Všechno, co komponenta udělá, dělá **jménem přihlášeného uživatele**:

```mermaid
flowchart LR
  subgraph T[Tenant zakaznika]
    AC[App Catalog<br/>hostuje JS] --> B[Prohlizec uzivatele<br/>SPFx komponenta]
    B -->|SPHttpClient| SP[SharePoint REST]
    B -->|MSGraphClient| G[Microsoft Graph]
  end
  B -.->|AadHttpClient / fetch| X[API mimo tenant]
  A[Admin tenantu] -->|schvaluje API opravneni| B
```

Tři důsledky, které budou celý týden zpátky:

1. **Komponenta nemá vlastní identitu.** Uvidí přesně to, co uživatel — ani víc, ani míň.
   Pro vývojáře to znamená, že „funguje mi to" platí jen pro jeho oprávnění.
2. **Volání Graphu a dalších API vyžaduje oprávnění, které schvaluje admin tenantu** —
   a schválení platí pro **všechna** SPFx řešení v tenantu. Podrobně ve středu
   v [`../../day-3/permissions-consent/`](../../day-3/permissions-consent/).
3. **Data opouštějí tenant jen tam, kde to kód výslovně udělá** — volání externího API,
   načtení skriptu z cizího CDN, telemetrie do vlastní služby. Každé takové místo je
   rozhodnutí, které musí znát zákazník.

## Klíčové rozlišení

- **SPFx vs. SharePoint Add-in** — Add-in běžel mimo stránku (iframe, vlastní hosting nebo app
  web) a v SharePoint Online je retirovaný; SPFx běží na stránce jako uživatel a hostuje ho
  SharePoint.
- **SPFx web part vs. JSON formátování** — formátování mění jen vzhled dat, která seznam už
  má; web part může data kombinovat, počítat a volat API.
- **Komponenta vs. aplikace** — SPFx nemá backend. Jakmile řešení potřebuje vlastní server,
  není to „SPFx řešení", ale aplikace, která SPFx používá jako UI.

## Naše prostředí

Výklad bez tenantu. Lab je návrhový — student nic neinstaluje ani nemění.

## Lab

Viz [`lab-volba-technologie.md`](lab-volba-technologie.md).

## Nosná linka

Student poprvé čte zadání Vltava Servis
([`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)) a u každého ze tří
požadavků rozhoduje, jestli je SPFx správná volba. Podmínka „data zůstávají v tenantu" se tu
překládá do konkrétních míst v kódu, která budeme hlídat celý týden.

## Zdroje (Microsoft)

- [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [SharePoint Add-In retirement in Microsoft 365](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/retirement-announcement-for-add-ins)
- [SharePoint Framework roadmap](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/roadmap)
- [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting)
- [Declarative agents for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent)
- [Overview of Copilot UX components](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/copilot/overview-copilot-apps)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Copilot UX components jsou podle dokumentace (ms.date 2026-09-23) v **preview**, bez nutnosti
> licence Microsoft 365 Copilot během preview; licencování po GA není potvrzené. SPFx 1.24,
> se kterou mají přejít do GA, byla k 2026-10-16 ve stavu RC. Před během ověřit stav
> v [release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/roadmap).
