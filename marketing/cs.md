# SPO_DEV_1 — obsah pro web (gopas.cz)

> [!NOTE] Pro editora
> Každý nadpis „##" níže odpovídá jednomu poli na stránce kurzu; text pod ním vlož do daného
> pole. Bloky „Pro editora" samotné nejsou obsah stránky — nekopírovat na web.
>
> **Stav k 2026-10.** Osnova níž odpovídá připravenému kurzu (referenční řešení každého dne
> prochází buildem). Naměřené timingy z prvního běhu (2026-10-19 až 2026-10-23) se do textu
> promítnou dodatečně.

## Delta — co se mění proti aktuálně živé stránce a proč

> [!NOTE] Pro editora
> Tato sekce **není** obsah stránky. Je to odůvodnění změn pro schvalovací kolečko.
> Citace ve sloupci „Aktuálně na webu" jsou ze stránky ke dni 2026-10-23.

### Věcné chyby, které je potřeba opravit

| Aktuálně na webu | Nově | Důvod |
| --- | --- | --- |
| „Node.js LTS, správci balíčků, Yeoman, **Gulp**" | Node.js 22, fnm, Yeoman, **Heft** | Od SPFx 1.22 je toolchain projektu **Heft**; gulp je legacy a od SPFx 1.24 bez podpory. Kurz, který slibuje gulp, prodává nástroj, se kterým nový projekt už nevznikne. |
| „Kontrola závislostí, licence, **polyfill strategie**" | Kontrola závislostí, licence, **runtime baseline** | Microsoft 365 ukončil podporu IE 11 a SharePoint Online přístup z IE 11 i z IE módu Edge blokuje. Polyfilly pro starý prohlížeč nemají cíl. |
| „Přehled knihovny KendoReact a **licencování (komerční)**" | KendoReact **13.3.0, jen funkce Free**, volitelný blok | Kurz pracuje bez licence — 13.3.0 je poslední řada s podporou Reactu 17, na kterém SPFx 1.23 stojí. Komerční licencování se jen zmíní. |
| Předchozí kurz „Jazyk C# – programování II [**GOC2125**]" | vypustit | V kurzu se C# nepoužívá. Odkaz láká špatné publikum. |
| „Tvorba WWW stránek v HTML/**XHTML** a CSS" | „Tvorba WWW stránek v HTML a CSS" | XHTML je pro moderní web irelevantní; SPFx komponenty vykreslují HTML přes React. |
| Cílová skupina „**Power users** přecházející k udržitelnému a strukturovanému vývoji" | „Vývojáři přecházející z klasického SharePointu a Add-inů" | Celý týden se píše TypeScript a React. Power user bez JS/TS kurz neutáhne. |

### Obsahové změny

| Aktuálně na webu | Nově | Důvod |
| --- | --- | --- |
| 15 modulů po 2–2,5 h (součet ~37 h) | **bloky po dnech** různé délky, bez hodin u bloků | Povinný obsah má ~23,75 h čistého výkladu a labů (5. den končí v 15:00). Hodiny u modulů slibovaly víc, než se fyzicky vejde. |
| „Analýza balíčku, code splitting, **lazy loading**" | **měřený baseline balíčku** (den 3) a optimalizace **rozhodnutá podle čísel** (den 4) | Lazy loading jsme na řešení kurzu změřili: v obou zkoušených místech celkový objem **zvětšil** (+9,9 KB, +34 KB). Kurz učí měřit a rozhodnout, ne aplikovat techniku naslepo. |
| „Místní úložiště/**indexedDB**" | srovnání úložišť cache (paměť, `sessionStorage`, IndexedDB) | IndexedDB je řádek ve srovnávací tabulce — co zůstává na zařízení a co ne — ne samostatné téma. |
| „GitHub Actions / **Azure DevOps** pipeline" | **GitHub Actions**; Azure DevOps tabulkou rozdílů | Pipeline se staví jedna. Azure DevOps varianta je v materiálech jako srovnání. |
| „Lokalizace & více jazyků" (2,5 h) | 45 min, hned za property pane | Mechanismus `loc/` je malý; prakticky se testuje na druhém webu v jiném jazyce. 2,5 h bylo nafouknuté. |
| „Telemetrie & diagnostika" a „Hardening & governance" jako dva bloky | **jeden blok Diagnostika a hardening** | Oba odpovídají na stejnou otázku: je řešení provozovatelné a obhajitelné před předáním. |
| „Bezpečnost & oprávnění" jako modul 9 | **den 3, před PnPjs** | Microsoft Graph bez schválených oprávnění nefunguje; první nasazení do App Catalogu je proto už na dni 3. |
| „**Code review rubrika** & backlog zlepšení" | **ukázka výsledku a backlog** s obhajobou naměřených čísel | Capstone stojí na samostatném labu 5. dne a na číslech z týdne. |
| — (chybí) | **jedno řešení celým týdnem** (fiktivní firma Vltava Servis) | Kurz není série Hello World projektů. Každý blok přidá do jednoho SPFx řešení vrstvu — web party, extensions, full-page aplikaci. |
| — (chybí) | **samostatný lab 5. dne**: full-page aplikace Výdejna vybavení | Účastník sám podle kroků postaví aplikaci nad dvěma seznamy s lookupem — test, že týden opravdu umí použít. |
| — (chybí) | **Co přináší SPFx 1.24 a 1.25** | 1.24 přechází na React 18 a přidává podporu Node.js 24; účastník odhadne, co by upgrade stál jeho řešení. |
| — (chybí) | **ladění na moderní stránce** místo hosted workbenche | Hosted workbench je od SPFx 1.23.0 deprecated a 2026-12-01 se retiruje. |
| — (chybí) | **instalace prostředí od holého stroje** jako plnohodnotný blok | Na stroji je jen VS Code a PowerShell; instalace s checkpointy je obsah, ne předehra. |

## URL

Beze změny: `sharepoint-framework-(spfx)--zaklady-vyvoje-aplikaci_spo_dev_1`

## Titulek kurzu

SharePoint Framework (SPFx) – Základy vývoje aplikací

## Krátký popis (meta description / teaser)

Praktický pětidenní kurz moderního vývoje pro SharePoint Online. Od holého stroje k vlastnímu
SPFx řešení s web party, extensions a full-page aplikací — React a Fluent UI, data přes
Microsoft Graph a PnPjs, schválená API oprávnění, nasazení přes App Catalog a pipeline
s testy a limitem velikosti balíčku.

## Popis kurzu

Pětidenní kurz pro front-end vývojáře, kteří chtějí rozšiřovat SharePoint Online a Microsoft
365 moderní cestou — SharePoint Frameworkem. **Celý týden se staví jedno řešení** pro
fiktivní firmu Vltava Servis a každý blok mu přidá vrstvu: rozcestník konfigurovatelný
odděleními, adresář zaměstnanců nad Microsoft Graph, evidenci vybavení nad seznamem
SharePointu, banner a akci v seznamu, a nakonec full-page aplikaci pro výdej vybavení.

Kurz začíná **na holém stroji** — instalace Node.js a nástrojů je plnohodnotný blok, ne
domácí úkol. Následuje anatomie projektu s aktuálním toolchainem Heft, první web part na
vlastním webu, property pane, lokalizace, React a Fluent UI. Třetí den patří datům:
SPHttpClient, MSGraphClientFactory, AadHttpClient a PnPjs, a hlavně **API oprávněním** —
kdo je schvaluje a co se stane, když schválená nejsou. Čtvrtý den přinese extensions,
optimalizaci balíčku a verzování s upgradem řešení. Pátý den doplní pipeline s testy,
diagnostiku a kontrolu před předáním — a samostatný lab, ve kterém účastník postaví
aplikaci bez vedení lektora.

**Všechno se měří.** Velikost balíčku se změří ve středu, optimalizuje ve čtvrtek a v pátek
ji hlídá pipeline. Účastník se naučí rozhodnout podle čísel — například kdy lazy loading
pomůže a kdy balíček naopak zvětší.

Celý týden platí jedna podmínka: **data zůstávají v tenantu**. Každé oprávnění k API musí být
vědomě schválené a účastník umí říct, kam data z jeho řešení tečou.

Kurz stojí na aktuální verzi SPFx (stav k 2026-10: SPFx 1.23, React 17, Fluent UI 8,
TypeScript, Node.js 22) a ukazuje, co přinese SPFx 1.24.

## Pro koho je kurz určen

- Front-end vývojáři v Microsoft 365
- Vývojáři přecházející z klasického SharePointu a Add-inů k modernímu vývoji
- Týmy, které chtějí rozšiřovat intranet na SharePoint Online vlastními komponentami

## Předpoklady

- Tvorba WWW stránek v HTML a CSS
- Základy jazyka JavaScript na úrovni kurzu JS_PROG1
- Základy jazyka TypeScript na úrovni kurzu JS_TS1
- Základy Reactu — výhodou
- Znalost seznamů a knihoven SharePointu — výhodou

## Formát a délka

- 5 dní, instruktorem vedený kurz s praktickými laby
- úroveň: **mírně pokročilý**
- kód v **TypeScriptu** (React, Fluent UI)
- každý účastník pracuje na vlastním webu ve cvičném tenantu Microsoft 365

> [!NOTE] Pro editora
> Cena záměrně vynechána — doplní ji obchodní oddělení GOPAS přímo v CMS/ceníku.

## Osnova kurzu

### Den 1 — Platforma, nástroje, první web part

- **SPFx v Microsoft 365** — pozice vůči Power Platform, Teams aplikacím a Add-inům; kód běží
  jako uživatel v jeho tenantu; stručná historie pro-code přístupů.
- **Vývojové prostředí od nuly** — Node.js, fnm, git, Yeoman a generátor SPFx; kontrola
  prostředí skriptem.
- **Anatomie projektu** — `package.json`, `tsconfig.json`, `serve.json`, manifesty, toolchain
  Heft a co je v balíčku `.sppkg`.
- **První web part** — vývojový server, ladění na moderní stránce, živé změny, základ property
  pane.

### Den 2 — Konfigurace a UI

- **Property pane a dynamická konfigurace** — reaktivní vs. nereaktivní pole, validace,
  konfigurace bez zásahu vývojáře.
- **Lokalizace a více jazyků** — složka `loc`, fallbacky, test na webu v jiném jazyce.
- **React a Fluent UI** — verze a kompatibilita, funkční komponenty a hooks, theming
  a přístupnost, struktura komponent pro zbytek týdne; co Fluent UI stojí ve velikosti balíčku.
- **KendoReact v SPFx** *(volitelný blok)* — Grid nad daty knihovny SharePointu, téma vedle
  Fluent UI, dopad na velikost balíčku.

### Den 3 — Data a oprávnění

- **SPHttpClient, MSGraphClientFactory, AadHttpClient** — kdy který klient a co který posílá.
- **API oprávnění, admin consent a fallback** — žádost o oprávnění v balíčku, schválení
  administrátorem, platnost pro celý tenant, chování při odepření; první nasazení do App
  Catalogu.
- **PnPjs** — CRUD nad seznamem, selektivní projekce, batching, ošetření chyb.
- **Výkon I — měřený baseline balíčku** — první změřená velikost, analýza závislostí.

### Den 4 — Rozšíření, výkon, nasazení

- **SPFx Extensions** — Application Customizer, Command Set, Field Customizer; JSON formátování
  jako levnější alternativa; životní cyklus a bezpečná práce s DOM.
- **Výkon II — code splitting, lazy loading, cache** — optimalizace rozhodnutá podle měření;
  strategie cachování (paměť, session, PnPjs) a co zůstává na zařízení.
- **Balení a App Catalog** — `.sppkg`, verzování, upgrade řešení, nasazení na tenant vs. web.

### Den 5 — Kvalita a provoz

- **CI/CD a quality gates** — GitHub Actions pipeline, lint, unit testy (Jest), kontrola
  překladů, limit velikosti balíčku.
- **Diagnostika a hardening** — logování a Developer Dashboard, performance marks, error
  boundary; kontrola závislostí a licencí, co v buildu nesmí být a kam smějí téct data.
- **Výdejna vybavení — samostatný lab** — full-page aplikace nad dvěma seznamy s lookupem,
  formulář v panelu, výdej a vrácení, souběžné úpravy.
- **Co přináší SPFx 1.24 a 1.25** — React 18, podpora Node.js 24, SPFx CLI; odhad dopadu upgradu na
  vlastní řešení.
- **Capstone** — ukázka výsledku, obhajoba naměřených čísel, backlog zlepšení.

### Doprovodný materiál k samostudiu

- **TypeScript pro SPFx** — jazyk a konfigurace (`tsconfig`, cílová verze ECMAScriptu) pro
  ty, kdo chtějí zopakovat předpoklad kurzu.
- Výkladové texty ke každému dni a referenční řešení po každém bloku — účastník může kdykoli
  dohnat skluz nebo si stav porovnat.

## Výstup kurzu

Účastník odchází s **vlastním SPFx řešením nasazeným v tenantu**: web party s konfigurací
a dvěma jazyky, data z Microsoft Graph a ze seznamů SharePointu přes schválená oprávnění,
banner a akce v seznamu, full-page aplikace, verzovaný balíček s upgradem — a pipeline, která
hlídá testy a velikost balíčku. K tomu **naměřená čísla** o svém řešení a schopnost obhájit
technická rozhodnutí podle nich.

## Návazné kurzy

> [!NOTE] Pro editora
> Upravit pole předchozích a souvisejících kurzů.

- Předchozí: Základy programování a algoritmizace [PRG], JavaScript I: Základy [JS_PROG1],
  TypeScript - typová kontrola pro JavaScript [JS_TS1], React I: Základy [JS_REACT1],
  JavaScript II: Pokročilé techniky [JS_PROG2]
- Související: Rozšíření Microsoft 365 Copilot o deklarativní agenty pomocí aplikace VS Code
  [MS-4010]; kurz [SPO_COPILOT] (název převzít z katalogu)

## Před publikací — kontrolní seznam pro editora

- [ ] Vyměnit osnovu z 15 modulů s hodinami za **osnovu po dnech** výše.
- [ ] Zkontrolovat, že v textu nezůstal **„Gulp"** ani **„polyfill strategie"**.
- [ ] U bloku KendoReact odstranit „licencování (komerční)" a označit ho jako **volitelný**.
- [ ] V cílové skupině **nahradit power users** podle textu výše.
- [ ] Z předchozích kurzů **odebrat GOC2125**, do souvisejících **přidat SPO_COPILOT**
      (SPFx na něj navazuje přes SharePoint Copilot Apps).
- [ ] Doplnit cenu kurzu (obchodní oddělení GOPAS).
- [ ] **Ověřit k datu publikace verzi SPFx** — 1.24 byla ke 2026-10-23 ve stavu release
      candidate s GA ohlášenou na říjen 2026. Po GA upravit poslední odstavec popisu.
- [ ] Zkontrolovat, že žádný blok „Pro editora" ani delta tabulka nezůstal zkopírovaný
      do publikovaného textu.
