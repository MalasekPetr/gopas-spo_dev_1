# Měření · Instalace a build projektu SPFx 1.23.2

Surová data k tvrzením v [`README.md`](README.md). Projekt: `vltava-portal` (React šablona,
jeden web part `Portal`), stav [`../first-webpart/solution/vltava-portal/`](../first-webpart/solution/vltava-portal/).

## 2026-10-16 — lektorský stroj

Windows 11 Pro, PowerShell 7.6, Node.js 22.22.0, generátor `@microsoft/generator-sharepoint@1.23.2`.
**Není to učební stroj** — jiný disk, jiná síť, jiný antivir.

| Krok | Výsledek |
|---|---|
| `yo @microsoft/sharepoint --skip-install` (včetně stažení `yo` a generátoru přes `npx`) | 86 s |
| `npm install`, **npm 11.19.0, prázdná cache** | stahování a řešení stromu ~7 min; rozbalení ~140 000 souborů do ~12. minuty; **pak npm přestal reagovat** (žádný zápis do logu ani do `node_modules`) a po 22 min byl ukončen |
| `npm install`, **npm 10.9.9, teplá cache** | **192 s**, 1 317 balíčků |
| Velikost `node_modules` | 140 456 souborů, 703 MB |
| `npm run build` (lint, TypeScript, webpack, Jest, balení) | **7 s** |
| `.sppkg` | 17 438 B |
| Bundle web partu `portal-web-part_*.js` | 7 182 B |
| Verze v buildu | TypeScript 5.8.3, ESLint 9.37.0, Webpack 5.105.4, Jest 30.2.0 |

## Co z toho plyne

- **Instalace je řádově dražší než build** (minuty vs. sekundy). Plánovat den 1 podle
  instalace, ne podle buildu.
- **Na Windows je úzkým hrdlem rozbalení ~140 000 souborů**, ne stahování. Zaseknutí po
  rozbalení s npm 11 se s npm 10 nezopakovalo — příčina neověřená. Proto v kurzu npm,
  které přinese Node.js 22, a žádný upgrade npm.

## Otevřené otázky

- Studená instalace s **npm 10** a prázdnou cache na **učebním stroji** — neměřeno.
  Změřit při go/no-go den předem a zapsat sem s datem.
- Časy studentů z kroku 2 a 5 labu — doplnit po 2026-10-19.

## Jak měření zopakovat

```powershell
$install = Measure-Command { npm install }
$build = Measure-Command { npm run build }
"install {0:N0} s, build {1:N0} s" -f $install.TotalSeconds, $build.TotalSeconds
Get-ChildItem .\sharepoint\solution\*.sppkg | Select-Object Name, Length
```

Prázdnou cache bez zásahu do vlastní cache npm: `npm install --cache <prázdná složka>`.
