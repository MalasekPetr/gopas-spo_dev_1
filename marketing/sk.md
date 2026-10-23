# SPO_DEV_1 — obsah pre web (gopas.sk)

> [!NOTE] Pre editora
> Každý nadpis „##" nižšie zodpovedá jednému poľu na stránke kurzu; text pod ním vlož do daného
> poľa. Bloky „Pre editora" samotné nie sú obsah stránky — nekopírovať na web.
>
> **Stav k 2026-10.** Osnova nižšie zodpovedá pripravenému kurzu (referenčné riešenie každého
> dňa prechádza buildom). Namerané časy z prvého behu (2026-10-19 až 2026-10-23) sa do textu
> premietnu dodatočne.

## Delta — čo sa mení proti aktuálne živej stránke a prečo

> [!NOTE] Pre editora
> Táto sekcia **nie je** obsah stránky. Je to odôvodnenie zmien pre schvaľovacie kolo.
> Stĺpec „Aktuálne na webe" je preložený z českej stránky (gopas.cz) k 2026-10-23.

### Vecné chyby, ktoré treba opraviť

| Aktuálne na webe | Novo | Dôvod |
| --- | --- | --- |
| „Node.js LTS, správcovia balíkov, Yeoman, **Gulp**" | Node.js 22, fnm, Yeoman, **Heft** | Od SPFx 1.22 je toolchain projektu **Heft**; gulp je legacy a od SPFx 1.24 bez podpory. Kurz, ktorý sľubuje gulp, predáva nástroj, s ktorým nový projekt už nevznikne. |
| „Kontrola závislostí, licencie, **polyfill stratégia**" | Kontrola závislostí, licencie, **runtime baseline** | Microsoft 365 ukončil podporu IE 11 a SharePoint Online prístup z IE 11 aj z IE režimu Edge blokuje. Polyfilly pre starý prehliadač nemajú cieľ. |
| „Prehľad knižnice KendoReact a **licencovanie (komerčné)**" | KendoReact **13.3.0, len funkcie Free**, voliteľný blok | Kurz pracuje bez licencie — 13.3.0 je posledný rad s podporou Reactu 17, na ktorom SPFx 1.23 stojí. Komerčné licencovanie sa len spomenie. |
| Predchádzajúci kurz „Jazyk C# – programovanie II [**GOC2125**]" | vypustiť | V kurze sa C# nepoužíva. Odkaz láka nesprávne publikum. |
| „Tvorba WWW stránok v HTML/**XHTML** a CSS" | „Tvorba WWW stránok v HTML a CSS" | XHTML je pre moderný web irelevantné; SPFx komponenty vykresľujú HTML cez React. |
| Cieľová skupina „**Power users** prechádzajúci k udržateľnému a štruktúrovanému vývoju" | „Vývojári prechádzajúci z klasického SharePointu a Add-inov" | Celý týždeň sa píše TypeScript a React. Power user bez JS/TS kurz neutiahne. |

### Obsahové zmeny

| Aktuálne na webe | Novo | Dôvod |
| --- | --- | --- |
| 15 modulov po 2–2,5 h (súčet ~37 h) | **bloky po dňoch** rôznej dĺžky, bez hodín pri blokoch | Povinný obsah má ~23,75 h čistého výkladu a labov (5. deň končí o 15:00). Hodiny pri moduloch sľubovali viac, než sa fyzicky zmestí. |
| „Analýza balíka, code splitting, **lazy loading**" | **meraný baseline balíka** (deň 3) a optimalizácia **rozhodnutá podľa čísel** (deň 4) | Lazy loading sme na riešení kurzu zmerali: na oboch skúšaných miestach celkový objem **zväčšil** (+9,9 KB, +34 KB). Kurz učí merať a rozhodnúť, nie aplikovať techniku naslepo. |
| „Miestne úložisko/**indexedDB**" | porovnanie úložísk cache (pamäť, `sessionStorage`, IndexedDB) | IndexedDB je riadok v porovnávacej tabuľke — čo zostáva na zariadení a čo nie — nie samostatná téma. |
| „GitHub Actions / **Azure DevOps** pipeline" | **GitHub Actions**; Azure DevOps tabuľkou rozdielov | Pipeline sa stavia jedna. Variant pre Azure DevOps je v materiáloch ako porovnanie. |
| „Lokalizácia & viac jazykov" (2,5 h) | 45 min, hneď za property pane | Mechanizmus `loc/` je malý; prakticky sa testuje na druhom webe v inom jazyku. 2,5 h bolo priveľa. |
| „Telemetria & diagnostika" a „Hardening & governance" ako dva bloky | **jeden blok Diagnostika a hardening** | Oba odpovedajú na rovnakú otázku: je riešenie prevádzkovateľné a obhájiteľné pred odovzdaním. |
| „Bezpečnosť & oprávnenia" ako modul 9 | **deň 3, pred PnPjs** | Microsoft Graph bez schválených oprávnení nefunguje; prvé nasadenie do App Catalogu je preto už na 3. deň. |
| „**Code review rubrika** & backlog zlepšení" | **ukážka výsledku a backlog** s obhajobou nameraných čísel | Capstone stojí na samostatnom labe 5. dňa a na číslach z týždňa. |
| — (chýba) | **jedno riešenie celým týždňom** (fiktívna firma Vltava Servis) | Kurz nie je séria Hello World projektov. Každý blok pridá do jedného SPFx riešenia vrstvu — web party, extensions, full-page aplikáciu. |
| — (chýba) | **samostatný lab 5. dňa**: full-page aplikácia Výdajňa vybavenia | Účastník sám podľa krokov postaví aplikáciu nad dvoma zoznamami s lookupom — test, že týždeň naozaj vie použiť. |
| — (chýba) | **Čo prináša SPFx 1.24 a 1.25** | 1.24 prechádza na React 18 a pridáva podporu Node.js 24; účastník odhadne, čo by upgrade stál jeho riešenie. |
| — (chýba) | **ladenie na modernej stránke** namiesto hosted workbenchu | Hosted workbench je od SPFx 1.23.0 deprecated a 2026-12-01 sa retiruje. |
| — (chýba) | **inštalácia prostredia od holého stroja** ako plnohodnotný blok | Na stroji je len VS Code a PowerShell; inštalácia s checkpointmi je obsah, nie predohra. |

## URL

> [!NOTE] Pre editora
> Titulok sa nemení, presmerovanie nie je potrebné. Stránku na gopas.sk sa 2026-10-23
> nepodarilo overiť (cyklické presmerovanie) — potvrdiť existujúci slug, alebo stránku založiť.

## Titulok kurzu

SharePoint Framework (SPFx) – Základy vývoja aplikácií

## Krátky popis (meta description / teaser)

Praktický päťdňový kurz moderného vývoja pre SharePoint Online. Od holého stroja k vlastnému
SPFx riešeniu s web partmi, extensions a full-page aplikáciou — React a Fluent UI, dáta cez
Microsoft Graph a PnPjs, schválené API oprávnenia, nasadenie cez App Catalog a pipeline
s testami a limitom veľkosti balíka.

## Popis kurzu

Päťdňový kurz pre front-end vývojárov, ktorí chcú rozširovať SharePoint Online a Microsoft
365 modernou cestou — SharePoint Frameworkom. **Celý týždeň sa stavia jedno riešenie** pre
fiktívnu firmu Vltava Servis a každý blok mu pridá vrstvu: rozcestník, ktorý si oddelenia
nastavia sami, adresár zamestnancov nad Microsoft Graph, evidenciu vybavenia nad zoznamom
SharePointu, banner a akciu v zozname a nakoniec full-page aplikáciu na výdaj vybavenia.

Kurz začína **na holom stroji** — inštalácia Node.js a nástrojov je plnohodnotný blok, nie
domáca úloha. Nasleduje anatómia projektu s aktuálnym toolchainom Heft, prvý web part na
vlastnom webe, property pane, lokalizácia, React a Fluent UI. Tretí deň patrí dátam:
SPHttpClient, MSGraphClientFactory, AadHttpClient a PnPjs, a najmä **API oprávneniam** —
kto ich schvaľuje a čo sa stane, keď schválené nie sú. Štvrtý deň prinesie extensions,
optimalizáciu balíka a verziovanie s upgradom riešenia. Piaty deň doplní pipeline s testami,
diagnostiku a kontrolu pred odovzdaním — a samostatný lab, v ktorom účastník postaví
aplikáciu bez vedenia lektora.

**Všetko sa meria.** Veľkosť balíka sa zmeria v stredu, optimalizuje vo štvrtok a v piatok
ju stráži pipeline. Účastník sa naučí rozhodnúť podľa čísel — napríklad kedy lazy loading
pomôže a kedy balík naopak zväčší.

Celý týždeň platí jedna podmienka: **dáta zostávajú v tenante**. Každé oprávnenie k API musí
byť vedome schválené a účastník vie povedať, kam dáta z jeho riešenia tečú.

Kurz stojí na aktuálnej verzii SPFx (stav k 2026-10: SPFx 1.23, React 17, Fluent UI 8,
TypeScript, Node.js 22) a ukazuje, čo prinesie SPFx 1.24.

## Pre koho je kurz určený

- Front-end vývojári v Microsoft 365
- Vývojári prechádzajúci z klasického SharePointu a Add-inov k modernému vývoju
- Tímy, ktoré chcú rozširovať intranet na SharePoint Online vlastnými komponentmi

## Predpoklady

- Tvorba WWW stránok v HTML a CSS
- Základy jazyka JavaScript na úrovni kurzu JS_PROG1
- Základy jazyka TypeScript na úrovni kurzu JS_TS1
- Základy Reactu — výhodou
- Znalosť zoznamov a knižníc SharePointu — výhodou

## Formát a dĺžka

- 5 dní, kurz vedený inštruktorom s praktickými labmi
- úroveň: **mierne pokročilý**
- kód v **TypeScripte** (React, Fluent UI)
- každý účastník pracuje na vlastnom webe v cvičnom tenante Microsoft 365

> [!NOTE] Pre editora
> Cena zámerne vynechaná — doplní ju obchodné oddelenie GOPAS priamo v CMS/cenníku.

## Osnova kurzu

### Deň 1 — Platforma, nástroje, prvý web part

- **SPFx v Microsoft 365** — pozícia voči Power Platform, Teams aplikáciám a Add-inom; kód
  beží ako používateľ v jeho tenante; stručná história pro-code prístupov.
- **Vývojové prostredie od nuly** — Node.js, fnm, git, Yeoman a generátor SPFx; kontrola
  prostredia skriptom.
- **Anatómia projektu** — `package.json`, `tsconfig.json`, `serve.json`, manifesty, toolchain
  Heft a čo je v balíku `.sppkg`.
- **Prvý web part** — vývojový server, ladenie na modernej stránke, živé zmeny, základ
  property pane.

### Deň 2 — Konfigurácia a UI

- **Property pane a dynamická konfigurácia** — reaktívne vs. nereaktívne polia, validácia,
  konfigurácia bez zásahu vývojára.
- **Lokalizácia a viac jazykov** — priečinok `loc`, fallbacky, test na webe v inom jazyku.
- **React a Fluent UI** — verzie a kompatibilita, funkčné komponenty a hooks, theming
  a prístupnosť, štruktúra komponentov pre zvyšok týždňa; čo Fluent UI stojí vo veľkosti
  balíka.
- **KendoReact v SPFx** *(voliteľný blok)* — Grid nad dátami knižnice SharePointu, téma vedľa
  Fluent UI, dopad na veľkosť balíka.

### Deň 3 — Dáta a oprávnenia

- **SPHttpClient, MSGraphClientFactory, AadHttpClient** — kedy ktorý klient a čo ktorý posiela.
- **API oprávnenia, admin consent a fallback** — žiadosť o oprávnenie v balíku, schválenie
  administrátorom, platnosť pre celý tenant, správanie pri odmietnutí; prvé nasadenie do App
  Catalogu.
- **PnPjs** — CRUD nad zoznamom, selektívna projekcia, batching, ošetrenie chýb.
- **Výkon I — meraný baseline balíka** — prvá zmeraná veľkosť, analýza závislostí.

### Deň 4 — Rozšírenia, výkon, nasadenie

- **SPFx Extensions** — Application Customizer, Command Set, Field Customizer; JSON
  formátovanie ako lacnejšia alternatíva; životný cyklus a bezpečná práca s DOM.
- **Výkon II — code splitting, lazy loading, cache** — optimalizácia rozhodnutá podľa merania;
  stratégie cachovania (pamäť, session, PnPjs) a čo zostáva na zariadení.
- **Balenie a App Catalog** — `.sppkg`, verziovanie, upgrade riešenia, nasadenie na tenant
  vs. web.

### Deň 5 — Kvalita a prevádzka

- **CI/CD a quality gates** — GitHub Actions pipeline, lint, unit testy (Jest), kontrola
  prekladov, limit veľkosti balíka.
- **Diagnostika a hardening** — logovanie a Developer Dashboard, performance marks, error
  boundary; kontrola závislostí a licencií, čo v builde nesmie byť a kam smú tiecť dáta.
- **Výdajňa vybavenia — samostatný lab** — full-page aplikácia nad dvoma zoznamami
  s lookupom, formulár v paneli, výdaj a vrátenie, súbežné úpravy.
- **Čo prináša SPFx 1.24 a 1.25** — React 18, podpora Node.js 24, SPFx CLI; odhad dopadu
  upgradu na vlastné riešenie.
- **Capstone** — ukážka výsledku, obhajoba nameraných čísel, backlog zlepšení.

### Sprievodný materiál na samoštúdium

- **TypeScript pre SPFx** — jazyk a konfigurácia (`tsconfig`, cieľová verzia ECMAScriptu) pre
  tých, ktorí si chcú zopakovať predpoklad kurzu.
- Výkladové texty ku každému dňu a referenčné riešenie po každom bloku — účastník môže
  kedykoľvek dobehnúť sklz alebo si stav porovnať.

## Výstup kurzu

Účastník odchádza s **vlastným SPFx riešením nasadeným v tenante**: web party s konfiguráciou
a dvoma jazykmi, dáta z Microsoft Graph a zo zoznamov SharePointu cez schválené oprávnenia,
banner a akcia v zozname, full-page aplikácia, verziovaný balík s upgradom — a pipeline, ktorá
stráži testy a veľkosť balíka. K tomu **namerané čísla** o svojom riešení a schopnosť obhájiť
podľa nich technické rozhodnutia.

## Nadväzné kurzy

> [!NOTE] Pre editora
> Upraviť polia predchádzajúcich a súvisiacich kurzov; názvy prevziať zo slovenského katalógu.

- Predchádzajúce: [PRG], [JS_PROG1], [JS_TS1], [JS_REACT1], [JS_PROG2]
- Súvisiace: [MS-4010], [SPO_COPILOT]

## Pred publikáciou — kontrolný zoznam pre editora

- [ ] Vymeniť osnovu z 15 modulov s hodinami za **osnovu po dňoch** vyššie.
- [ ] Skontrolovať, že v texte nezostal **„Gulp"** ani **„polyfill stratégia"**.
- [ ] Pri bloku KendoReact odstrániť „licencovanie (komerčné)" a označiť ho ako **voliteľný**.
- [ ] V cieľovej skupine **nahradiť power users** podľa textu vyššie.
- [ ] Z predchádzajúcich kurzov **odobrať GOC2125**, do súvisiacich **pridať SPO_COPILOT**
      (SPFx naň nadväzuje cez SharePoint Copilot Apps).
- [ ] Doplniť cenu kurzu (obchodné oddelenie GOPAS).
- [ ] **Overiť k dátumu publikácie verziu SPFx** — 1.24 bola k 2026-10-23 v stave release
      candidate s GA ohlásenou na október 2026. Po GA upraviť posledný odsek popisu.
- [ ] Skontrolovať, že žiadny blok „Pre editora" ani delta tabuľka nezostali skopírované
      do publikovaného textu.
