# Samostudium a mapování na katalog

Co z katalogové osnovy se v běhu odučí kde, co se neodučí a kde to student najde.

## Mapování katalogových bloků na moduly

| Katalogový blok (h) | Kde v kurzu | Poznámka |
|---|---|---|
| Přehled platformy Microsoft 365 & SPFx (2) | `platform-positioning` (D1) | 45 min; historie jen jako tabulka zlomů |
| Vývojové prostředí & nástroje (2,5) | `dev-environment` (D1) | **Heft místo gulp**; instalace od holého stroje |
| Struktura projektu & první Web Part (2,5) | `project-anatomy`, `first-webpart` (D1) | lokalizace jen mechanismus, plně v D2 |
| Property panes & dynamická konfigurace (2,5) | `property-pane` (D2) | |
| React & Fluent UI integrace (2,5) | `react-fluent-ui` (D2) | |
| Bonus — KendoReact (1,5–2) | `opt-kendo-react` (D2) | volitelný; KendoReact 13.3.0 (poslední s Reactem 17), jen funkce Free — bez licence |
| Přístup k datům: REST, PnPjs & Graph (2,5) | `data-access-clients`, `pnpjs` (D3) | rozděleno na dva bloky |
| Výkon & cachování (2,5) | `bundle-baseline` (D3), `performance-caching` (D4) | měření před a po |
| SPFx Extensions (2,5) | `extensions` (D4) | |
| Bezpečnost & oprávnění (2,5) | `permissions-consent` (D3) | přesunuto před PnPjs — Graph bez schválení nefunguje |
| Lokalizace & více jazyků (2,5) | `localization` (D2) | **zkráceno na 45 min** |
| Balení & App Catalog nasazení (2,5) | `permissions-consent` (D3, první nasazení), `packaging-deployment` (D4) | |
| CI/CD & Quality gates (2,5) | `ci-cd-quality` (D5) | |
| Telemetrie & diagnostika (2,5) | `diagnostics-hardening` (D5) | **sloučeno** s hardeningem |
| Hardening & governance (2,5) | `diagnostics-hardening` (D5) | polyfill strategie → runtime baseline |
| Capstone & review (2–2,5) | `capstone` (D5) | |
| — | `spfx-whats-next` (D5) | **nové**: SPFx 1.24/1.25, React 18, Copilot UX components, SPFx CLI |

## Co se neodučí jako blok

| Téma | Proč | Kde to student najde |
|---|---|---|
| Gulp toolchain | Od SPFx 1.22 legacy, od 1.24 bez podpory. Pro nové projekty irelevantní. | Zmínka v `dev-environment` a [GLOSSARY](./GLOSSARY.md); migrace v [Learn — Heft toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft) |
| Polyfill strategie | Microsoft 365 ukončil podporu IE 11 k 2021-08-17 a SharePoint Online přístup z IE 11 i z IE módu Edge blokuje ([lifecycle](https://learn.microsoft.com/en-us/lifecycle/announcements/m365-ie11-microsoft-edge-legacy), [SharePoint](https://learn.microsoft.com/en-us/sharepoint/prepare-ie11)). Polyfilly pro starý prohlížeč tím ztratily cíl. | `diagnostics-hardening` — runtime baseline (co SPFx 1.23 cílí za ES verzi) |
| Vlastní backend API za AadHttpClient | Vyžaduje hosting mimo tenant (Azure) — mimo rozsah 5 dní i mimo podmínku scénáře „data zůstávají v tenantu". | [Connect to Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) |
| Azure DevOps pipeline | Kurz staví pipeline na GitHub Actions; Azure DevOps varianta jen zmínkou. | `ci-cd-quality` — tabulka rozdílů |
| SPFx pro SharePoint Server | On-premises podporuje jen SPFx do 1.5; jiný toolchain i jiné API. | [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) |
| Adaptive Card Extensions (Viva Connections) | Jiný hostitel, jiný model UI. | `platform-positioning` — zmínka; [Viva Connections](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/overview-viva-connections) |
