# Názvosloví

Jediný zdroj pravdy pro názvy produktů, nástrojů a pojmů v materiálech SPO_DEV_1. Nepsat
názvy „od oka" — SPFx a jeho okolí má za sebou vlnu přejmenování a výměnu toolchainu a staré
návody na internetu jsou většinou o verzi, která už neplatí.

## Dvojice, které se v tomto kurzu pletou nejčastěji

| Pojem | Co to je | Nezaměňovat s |
|---|---|---|
| **Heft** | orchestrátor build úloh od SPFx 1.22 (Rush Stack) | gulp — legacy toolchain SPFx 1.0–1.21.1 |
| **Rig** (`@microsoft/spfx-web-build-rig`) | sdílená výchozí konfigurace buildu, na kterou projekt odkazuje z `config/rig.json` | konfigurací v projektu — rig je balíček v `node_modules` |
| **Řešení** (solution, `.sppkg`) | balíček, který se nahrává do App Catalogu; má vlastní `solution.id` | komponentou |
| **Komponenta** (web part, extension) | jedna nasaditelná část řešení s vlastním manifestem a `id` | řešením — jedno řešení nese víc komponent |
| **Tenantový App Catalog** | katalog aplikací pro celý tenant; v kurzu odtud vznikají žádosti o API oprávnění | **site collection App Catalogem** — katalog jednoho webu |
| **Hosted workbench** | `/_layouts/workbench.aspx` na webu v tenantu; **deprecated** od SPFx 1.23.0 (2026-05-13), 1.23 je poslední verze s podporou, **retirement 2026-12-01** | lokálním workbenchem — ten je retirovaný už dřív |
| **Debug na moderní stránce** | skutečná stránka + `?loadSPFX=true&debugManifestsFile=...`; zobrazí **Debug Toolbar** | hosted workbenchem — není to skutečná stránka |
| **Reaktivní** property pane | změna pole se projeví hned | **nereaktivním** — změna až po tlačítku Použít |
| **SPHttpClient** | volání SharePoint REST API v kontextu uživatele | **AadHttpClient** — volání API chráněných Entra ID |

## Přejmenování a lineage

Vlevo je to, co student uvidí ve starých návodech, na Stack Overflow nebo na screenshotu;
vpravo to, co píšeme my.

| Starý název | Aktuální název |
|---|---|
| Azure AD, Azure Active Directory | **Microsoft Entra ID** |
| Office UI Fabric, Office UI Fabric React | **Fluent UI** (`@fluentui/react` = Fluent UI v8) |
| Teams Toolkit | **Microsoft 365 Agents Toolkit** |
| `gulp serve`, `gulp bundle --ship`, `gulp package-solution --ship` | **`heft start`**, **`heft build --production`**, **`heft package-solution --production`** (v projektu přes `npm start` / `npm run build`) |
| `gulp trust-dev-cert` | **`heft trust-dev-cert`** |
| lokální workbench (`localhost:4321/temp/workbench.html`) | retirovaný — **hosted workbench** nebo **debug na moderní stránce** |
| `https://localhost:4321/temp/manifests.js` | **`https://localhost:4321/temp/build/manifests.js`** (od SPFx 1.21) |
| SharePoint Add-ins (SharePoint-hosted, provider-hosted) | retirované v SharePoint Online — náhradou je **SPFx**, resp. aplikace s Entra ID |
| SharePoint Copilot Apps | **Copilot UX components** (preview) — viz delta níže |
| `.eslintrc.js` | **`eslint.config.js`** (ESLint 9, flat config — generátor SPFx 1.23) |

> [!IMPORTANT] Názvosloví — `gulp` v návodech na internetu
> Většina článků, videí a odpovědí o SPFx na internetu je psaná pro gulp toolchain. Příkaz
> `gulp serve` v projektu vygenerovaném SPFx 1.23 **neexistuje**. Když student najde návod
> s `gulp`, je to návod pro jiný toolchain — princip může platit, příkazy a konfigurační
> soubory ne. Zdroj: [Heft-based toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft).

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Microsoft v dokumentaci mluví o stejné funkci jako o „SharePoint Copilot Apps"
> ([přehled SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview))
> i jako o „Copilot UX components"
> ([přehled funkce](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/copilot/overview-copilot-apps),
> ms.date 2026-09-23). Píšeme **Copilot UX components** podle novější stránky. Před během
> ověřit, jak se funkce jmenuje v release notes SPFx 1.24.

## Toolchain a nástroje

| Název | Balíček / příkaz | K čemu v kurzu |
|---|---|---|
| **Node.js** (LTS) | `node` | runtime toolchainu; verze podle tabulky kompatibility SPFx |
| **fnm** | `fnm` | správce verzí Node.js — přepnutí verze bez admin práv |
| **npm** | `npm` | správce balíčků; v kurzu jediný (pnpm/yarn ne) |
| **Yeoman** + generátor SPFx | `yo`, `@microsoft/generator-sharepoint` | scaffold projektu a přidávání komponent |
| **Heft** | `@rushstack/heft` | build, serve, testy, balení |
| **SPFx CLI** | — | budoucí náhrada Yeoman generátoru; v kurzu jen jako delta |
| **CLI for Microsoft 365** | `@pnp/cli-microsoft365` | instalované globálně (den 1); upgrade projektů (`m365 spfx project upgrade`, pracuje se složkou projektu), nasazení. `m365 login` vyžaduje vlastní registraci aplikace v Entra ID (`appId` + `tenant`, průvodce `m365 setup`) |
| **PnPjs** | `@pnp/sp`, `@pnp/graph` | fluent API nad SharePoint REST a Microsoft Graph |
| **Fluent UI v8** | `@fluentui/react` | UI knihovna, kterou generátor SPFx dává do React šablony |
| **Fluent UI v9** | `@fluentui/react-components` | novější generace Fluent UI; v SPFx volitelná |

## Typy komponent SPFx

| Komponenta | Kde se zobrazí | V kurzu |
|---|---|---|
| **Web part** | stránka, Teams tab, Teams personal app | celý týden |
| **Application Customizer** | každá stránka webu (placeholdery Top/Bottom) | D4 |
| **ListView Command Set** | panel příkazů a kontextové menu seznamu | D4 |
| **Field Customizer** | vykreslení sloupce v zobrazení seznamu | D4 |
| **Form Customizer** | nový/editační/zobrazovací formulář seznamu | zmínka D4 |
| **Adaptive Card Extension** (ACE) | Viva Connections | zmínka D1 |
| **Copilot UX component** | Microsoft 365 Copilot (preview) | delta D5 |

## Balení a nasazení

| Pojem | Význam |
|---|---|
| `solution.id` | GUID řešení v `config/package-solution.json` — **unikátní na tenant** |
| `id` v manifestu | GUID komponenty — podle něj SharePoint komponentu najde |
| `skipFeatureDeployment` | `true` = komponenty dostupné na všech webech hned po nasazení do tenantového katalogu |
| `includeClientSideAssets` | `true` = JS a assety jsou uvnitř `.sppkg` a hostuje je SharePoint |
| `isDomainIsolated` | izolovaný web part ve vlastní doméně (iframe) — v kurzu `false` |
| `webApiPermissionRequests` | žádosti o oprávnění k API (Graph, vlastní API) v `package-solution.json` |

## Fiktivní zákazník kurzu

**Vltava Servis s.r.o.** — servisní firma, 240 zaměstnanců, 6 oddělení. Stejná fiktivní firma
jako v kurzu GOC222. Veškerá data v labech jsou **fiktivní kurzovní data**. Reálná
zákaznická ani personální data do labů nikdy nepatří. Scénář:
[`scenario-vltava-portal.md`](./scenario-vltava-portal.md).
