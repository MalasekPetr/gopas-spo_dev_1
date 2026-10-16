# Výkon I — měřený baseline balíčku

> Typ: povinný · Den: 3 · Odhad: 60 min
> Tenant: `cloudedu.cz` · Režim: hands-on, jen lokálně
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Konec dne 3: řešení má tři web party a poprvé se změří, kolik váží. Toto číslo je baseline,
proti kterému se ve čtvrtek obhajuje optimalizace — a přinese první překvapení.

## Cíle

- Změřit velikost každého bundlu (raw a gzip) a uložit ji jako baseline s datem.
- Zapojit analýzu balíčku do Heft buildu a číst její treemapu.
- Najít v balíčku závislost, která tam nemá co dělat, a vysvětlit proč tam je.

## Výklad

### Co se měří

Po `npm run build` jsou v `release/assets/` hotové soubory, které si stáhne prohlížeč:
jeden bundle na web part a jeden soubor na jazyk. Skript
[`Measure-BundleSize.ps1`](../../scripts/Measure-BundleSize.ps1) je změří, spočítá gzip
(odhad přenosu) a uloží JSON — stejný skript ve čtvrtek porovná stav s baseline a v pátek
v pipeline hlídá limit.

Co do bundlu **nejde**: React, ReactDOM a knihovny SPFx (`@microsoft/sp-*`). Ty načítá stránka
SharePointu jednou pro všechny web party; seznam je v
`release/component-dependency-audit/*.json`. Do bundlu jde všechno ostatní — Fluent UI,
PnPjs, vlastní kód.

### Analýza balíčku v Heftu

Gulp toolchain měl na úpravu webpacku `gulpfile.js`. Heft toolchain má **Webpack Patch
plugin**: soubor `config/webpack-patch.json` vyjmenuje skripty, které dostanou konfiguraci
webpacku a vrátí ji upravenou. Dokumentace tak přidává Webpack Bundle Analyzer; výsledkem je
`temp/webpack/build.stats.html` — treemapa modulů v každém bundlu.

Zdroj: [Customize webpack with the Heft Webpack Patch plugin](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-customize-webpack-config).

### Baseline

> [!IMPORTANT] Rozcestník přibral 32 KB, aniž se v něm změnil řádek — změřeno (2026-10-16)
>
> | Bundle | Raw | Gzip |
> |---|---|---|
> | Rozcestník | 238 632 B | 73 108 B |
> | Adresář zaměstnanců | 234 791 B | 71 218 B |
> | Evidence vybavení | 452 625 B | 131 228 B |
>
> Rozcestník měl na konci dne 2 **206 511 B**. Jeho kód se dnes nezměnil — změnil se barrel
> `src/hooks/index.ts`, který teď exportuje i `useEquipment`, a ten přes službu vtáhne PnPjs.
> S přímým importem `from '../../../hooks/useFilteredLinks'` má Rozcestník zase přesně
> 206 511 B. Data: [`mereni-baseline.md`](mereni-baseline.md).
>
> **Barrel soubor je pohodlný pro import a drahý pro balíček, jakmile některý jeho export
> táhne knihovnu s vedlejšími efekty.**

Proč to tree shaking nevyřeší: `import '@pnp/sp/items'` nic neexportuje — jen rozšíří objekt
`sp`. Pro webpack je to vedlejší efekt, který odstranit nesmí. Čtvrteční `performance-caching`
problém opraví a změří.

### Kontext: kolik je hodně

Baseline není dobré ani špatné číslo — je to výchozí bod. Pro představu ze stejného kurzu:
Rozcestník bez Fluent UI 11 693 B, KendoReact Grid s tématem 1 442 440 B
([`../../day-2/opt-kendo-react/`](../../day-2/opt-kendo-react/)).

## Klíčové rozlišení

- **Raw vs. gzip** — raw rozhoduje o parsování v prohlížeči, gzip o přenosu po síti.
- **Bundle vs. závislosti stránky** — React a SPFx knihovny platí stránka jednou; bundle platí
  každý web part zvlášť.
- **Export vs. vedlejší efekt** — nepoužitý export tree shaking odstraní, import kvůli
  vedlejšímu efektu ne.

## Naše prostředí

Jen lokální build. Měření z lektorského stroje je v README; studenti měří svůj build a čísla
by se měla shodovat (stejné verze balíčků), pokud se jejich kód neliší.

## Lab

Viz [`lab-baseline-balicku.md`](lab-baseline-balicku.md).

## Nosná linka

Řešení má **změřený baseline** — tři čísla s datem. Středa končí otevřenou otázkou: proč
Rozcestník platí za PnPjs, které nepoužívá? Odpověď a oprava jsou ve čtvrtek.

Stav po dni 3: [`solution/vltava-portal/`](solution/vltava-portal/).

## Zdroje (Microsoft)

- [Customize webpack with the Heft Webpack Patch plugin](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-customize-webpack-config)
- [Understanding the Heft-based toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-overview)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Webpack Bundle Analyzer 4.10.2 s Heft 1.2.17 / SPFx 1.23.2 ověřen buildem 2026-10-16.
> Verze 5.x analyzátoru netestována.
