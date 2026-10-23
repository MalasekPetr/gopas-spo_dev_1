# Diagnostika a hardening

> Typ: povinný · Den: 5 · Odhad: 45 min
> Tenant: `cloudedu.cz` · Režim: hands-on, vlastní web
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Řešení funguje. Teď musí být provozovatelné: když se něco pokazí, chceme to vidět, a jedna
chyba nesmí shodit stránku. A než ho dostane zákazník, projde kontrolou: závislosti, licence,
co je v kódu vidět a kam tečou data.

## Cíle

- Logovat přes `Log` z SPFx a číst výstup v Developer Dashboardu.
- Měřit dobu volání API přes performance marks.
- Zabránit tomu, aby chyba vykreslení jednoho web partu rozbila stránku (error boundary).
- Zkontrolovat závislosti (`npm audit`, licence) a výstup buildu (adresy mimo tenant,
  tajemství) a umět výsledek obhájit.

## Výklad

### Logování a Developer Dashboard

`Log.verbose/info/warn/error(source, message)` z `@microsoft/sp-core-library` zapisuje do
záložky **Trace** v Developer Dashboardu (**Ctrl+F12** na moderní stránce i ve workbenchi).
Dashboard má i záložku **Performance** (čas načtení, inicializace a vykreslení každé
komponenty) a **Manifests** (verze a URL načtených komponent).

Dvě omezení z dokumentace:

- zprávy existují **jen v dashboardu a jen do obnovení stránky** — pro produkci je potřeba
  jiné řešení (dokumentace jmenuje Azure Application Insights),
- `source` se ořízne na 20 znaků (proto `VltavaDirectory`, ne `EmployeeDirectoryWebPart`).

Zdroje: [Use the developer dashboard](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-developer-dashboard),
[Log class](https://learn.microsoft.com/en-us/javascript/api/sp-core-library/log?view=sp-typescript-latest).

> [!IMPORTANT] Produkční telemetrie = data mimo tenant
> Application Insights nebo jakákoli jiná telemetrie posílá data z prohlížeče uživatele do
> služby mimo SharePoint. Čí je to služba, kde fyzicky běží a co se do ní posílá (jména, URL
> stránek, chyby s daty), je rozhodnutí zákazníka — ne vývojáře. Řešení `vltava-portal`
> produkční telemetrii nemá.

### Performance marks

`src/utils/perf.ts` obalí volání API dvojicí `performance.mark` a `performance.measure`. Měření
je vidět v prohlížeči (F12 → **Performance** → *Timings*) a doba se zapíše přes `Log.info`
do dashboardu. Měří se volání Graphu (`vltava-graph-users`) a načtení seznamu
(`vltava-equipment-load`) — ne cache, ta do měřené funkce nedojde.

### Error boundary

`src/components/ErrorBoundary.tsx` je třídní komponenta s `getDerivedStateFromError`
a `componentDidCatch`. Obaluje komponentu každého web partu: když vykreslení vyhodí výjimku,
uživatel uvidí srozumitelnou hlášku místo prázdného místa a chyba jde do `Log.error`.

Error boundary **nechytá** chyby v obsluze událostí a v `Promise` — ty řeší služby a hooky
(`useEquipment`, `useEmployees`), které mají vlastní chybové stavy.

> [!IMPORTANT] Hláška přes Fluent `MessageBar` by Rozcestníku přidala 8 KB — změřeno (2026-10-16)
> Rozcestník s error boundary: s `MessageBar` +8 346 B, s prostým `<div role="alert">` a CSS
> modulem **+647 B**. Data: [`mereni-hardening.md`](mereni-hardening.md).
>
> **I kód pro chybový stav je kód v balíčku — sdílené komponenty piš bez těžkých závislostí.**

### Hardening: čtyři kontroly před předáním

| Kontrola | Jak | Výsledek referenčního řešení (2026-10-16) |
|---|---|---|
| Zranitelnosti | `npm audit` a `npm audit --omit=dev` | 54 (33 moderate, 21 high) — **všechny ve vývojových závislostech**; produkční 0 |
| Licence produkčních závislostí | `npm sbom --sbom-format cyclonedx --omit dev` | 171 komponent: 138 MIT, 6 0BSD, 2 Apache-2.0, 1 BSD-2-Clause; 24 bez SPDX — balíčky SPFx (Microsoft EULA) a `raw-loader` |
| Adresy v bundlu | hledání `https://` v `release/assets/*.js` | `res-1.cdn.office.net` (výchozí adresa fontů Fluent UI), `pnp.github.io` a `github.com` jen v textech chybových hlášek |
| Tajemství v kódu | hledání klíčů, tokenů, hesel v `src` a bundlu | žádná |

K zranitelnostem toolchainu dokumentace SPFx říká, že balíčky pro build a ladění **nejsou
součástí `.sppkg`**, takže se nedostanou k uživatelům
([npm audit vulnerabilities in SPFx](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/npm-vulnerabilities)).
`npm audit fix` v SPFx projektu se nespouští — aktualizuje balíčky mimo testovanou sadu.

> [!IMPORTANT] Všechno v `.sppkg` si může přečíst každý uživatel
> Bundle je JavaScript, který si stáhne prohlížeč. Klíč k API, heslo nebo connection string
> v kódu SPFx řešení **není tajemství** — je to veřejný text. Tajemství patří na server
> (Azure Function za AadHttpClient), ne do web partu.

### Runtime baseline místo polyfillů

Rig SPFx kompiluje **náš** kód do ES5 (`"target": "es5"` v `tsconfig-base.json` rigu).
Webpack ale **nepřekládá závislosti** — PnPjs 4 přichází jako moderní JavaScript (`async`,
`Reflect`) a v bundlu tak zůstane. Skutečné minimum prohlížeče tedy určují závislosti, ne
`tsconfig`. SharePoint Online sám vyžaduje moderní prohlížeč — IE 11 je blokovaný
([self-study](../../self-study.md)) — takže polyfilly nemají cíl.

## Klíčové rozlišení

- **Log vs. telemetrie** — `Log` je ladicí nástroj na jednu stránku; telemetrie je služba
  s daty mimo tenant.
- **Chyba vykreslení vs. chyba volání** — první chytí error boundary, druhou hook/služba.
- **Vývojová vs. produkční zranitelnost** — `npm audit --omit=dev` říká, co jde k uživateli.
- **Konfigurace vs. tajemství** — URL a text oznámení smí být v balíčku, klíč nikdy.

## Naše prostředí

Diagnostika na workbenchi/stránce vlastního webu; hardening lokálně nad buildem.

## Lab

Viz [`lab-diagnostika.md`](lab-diagnostika.md).

## Nosná linka

Řešení je **provozovatelné**: loguje do dashboardu, měří volání API, jedna chyba nerozbije
stránku a existuje zápis kontroly závislostí a toku dat, který lze předat zákazníkovi.

Stav po dni 5: [`solution/vltava-portal/`](solution/vltava-portal/).

## Zdroje (Microsoft)

- [Use the developer dashboard](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-developer-dashboard)
- [Log class (sp-core-library)](https://learn.microsoft.com/en-us/javascript/api/sp-core-library/log?view=sp-typescript-latest)
- [Understanding npm audit vulnerabilities in SPFx projects](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/npm-vulnerabilities)

## Zdroje (třetí strana — React, npm)

> [!IMPORTANT] Proč odkaz mimo Learn
> Error boundaries dokumentuje React, `npm sbom` dokumentuje npm.

- [React — catching rendering errors with an error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [npm sbom](https://docs.npmjs.com/cli/v10/commands/npm-sbom)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Výsledky `npm audit` se mění s každým novým advisory — zopakovat v den běhu. Release notes
> 1.23.2 (2026-06-30) uváděly opravené critical a high zranitelnosti; k 2026-10-16 audit hlásí
> 21 high v nástrojích buildu.
