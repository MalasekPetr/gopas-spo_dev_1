# Lab · Baseline balíčku a analýza

> Modul: `bundle-baseline` · Odhad: 40 min · Režim: hands-on, jen lokálně
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Uložený soubor `measurements/baseline.json` s velikostmi všech bundlů a vysvětlení, proč je
Rozcestník větší než na konci dne 2.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Řešení se třemi web party (stav po `pnpjs`), server zastavený.
- Klon repa kurzu v `$HOME\gopas-spo_dev_1` (skript `Measure-BundleSize.ps1`).

## Startovní čára

Lab začíná u stavu po modulu [`pnpjs`](../pnpjs/): referenční kód
[`../pnpjs/solution/vltava-portal/`](../pnpjs/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**). Čísla se pak budou shodovat
  s referenčními — měříš stejný kód.

**Checkpoint:** `npm run build` projde, ve `src/webparts/` jsou složky `portal`,
`employeeDirectory` a `equipment` a v `config/` ještě **není** `webpack-patch.json`.

## Část A — Baseline (10 min)

### 1. Změř baseline

```powershell
npm run build
& "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" -ProjectPath . -OutFile .\measurements\baseline.json
```

`measurements/` je tvoje složka mimo `solution/` — převzetí kódu podle scénáře ji nesmaže.

**Checkpoint:** tabulka se třemi bundly `*-web-part` a soubor `measurements\baseline.json`
s dnešním datem. Čísla nahlas lektorovi (referenční: 238 632 / 234 791 / 452 625 B).

## Část B — Analýza balíčku (25 min)

### 2. Zapoj analýzu balíčku

V Heft toolchainu se konfigurace webpacku needituje přímo, ale **patchem** — funkcí, která
dostane hotovou konfiguraci a vrátí upravenou (viz Zdroje). Patch přidá `webpack-bundle-analyzer`, který při každém
produkčním buildu zapíše treemapu do `temp/webpack/`.

```powershell
npm install webpack-bundle-analyzer@4.10.2 --save-dev --save-exact
New-Item -ItemType Directory -Path .\config\webpack-patch -Force | Out-Null
```

Soubor `config/webpack-patch.json` — **nový**:

```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/spfx-build/webpack-patch.schema.json",
  "patchFiles": [
    "./config/webpack-patch/webpack-bundle-analyzer.js"
  ]
}
```

Soubor `config/webpack-patch/webpack-bundle-analyzer.js` — **nový**:

```javascript
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Writes temp/webpack/build.stats.html and build.stats.json on every production build.
module.exports = function (webpackConfig) {
  const projectPath = path.join(__dirname, './../..');
  const webpackStats = path.join(projectPath, 'temp', 'webpack');

  if (!webpackConfig.plugins) {
    webpackConfig.plugins = [];
  }

  webpackConfig.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    generateStatsFile: true,
    reportFilename: path.join(webpackStats, 'build.stats.html'),
    statsFilename: path.join(webpackStats, 'build.stats.json'),
    logLevel: 'error'
  }));

  return webpackConfig;
};
```

- `analyzerMode: 'static'` zapíše HTML, `openAnalyzer: false` neotevírá prohlížeč při každém
  buildu.
- `generateStatsFile` uloží i `build.stats.json` (~100 MB) — v `temp/`, tedy mimo git.

```powershell
npm run build
Invoke-Item .\temp\webpack\build.stats.html
```

**Checkpoint:** `package.json` má v `devDependencies` `"webpack-bundle-analyzer": "4.10.2"`
a v prohlížeči se otevře treemapa se třemi bloky (`portal-web-part`,
`employee-directory-web-part`, `equipment-web-part`).

### 3. Najdi cizí závislost

V treemapě najeď na blok `portal-web-part` a hledej `@pnp`.

**Checkpoint:** v Rozcestníku jsou moduly `@pnp/sp` a `@pnp/queryable` — přestože
`Portal.tsx` ani `PortalWebPart.ts` PnPjs neimportují.

### 4. Ověř hypotézu experimentem

V `src/webparts/portal/components/Portal.tsx` změň **dočasně**

```typescript
import { useFilteredLinks } from '../../../hooks';
```

na

```typescript
import { useFilteredLinks } from '../../../hooks/useFilteredLinks';
```

a změř znovu proti baseline:

```powershell
npm run build
& "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" -ProjectPath . -BaselineFile .\measurements\baseline.json
```

**Checkpoint:** `portal-web-part` má `RawDelta` kolem **−32 000 B** a ostatní bundly delta 0.

**Změnu vrať** na import z `'../../../hooks'` a znovu `npm run build`. Baseline má popisovat
stav, který je — opravuje se ve čtvrtek.

**Checkpoint (negativní):** po vrácení je `RawDelta` u všech bundlů **0** — baseline sedí.

## Část C — Co do balíčku nejde (5 min)

### 5. Najdi, co do balíčku nejde

```powershell
Get-Content .\release\component-dependency-audit\*.json -Raw | ConvertFrom-Json |
    Select-Object -ExpandProperty bundles | Select-Object -ExpandProperty portal-web-part |
    Select-Object -ExpandProperty dependencies | Select-Object componentName, componentVersion -First 6
```

**Checkpoint:** výpis obsahuje `react` 17.0.1 a `@microsoft/sp-core-library` — knihovny, které
dodává stránka. Bez `-First 6` uvidíš i interní balíčky SharePointu (`@msinternal/…`,
`@ms/office-ui-fabric-react-bundle`) — to je Fluent UI, které používá SharePoint sám.
**Náš** `@fluentui/react` mezi nimi **není**: Fluent UI si každý web part nese sám
(`Select-String -Path .\release\component-dependency-audit\*.json -Pattern '"@fluentui/react"'`
nevrátí nic).

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `package.json` | změněný | `webpack-bundle-analyzer` 4.10.2 v `devDependencies` |
| `config/webpack-patch.json` | nový | registrace patche webpacku pro Heft |
| `config/webpack-patch/webpack-bundle-analyzer.js` | nový | treemapa a statistiky do `temp/webpack/` |

`Portal.tsx` je po kroku 4 **beze změny** — barrel import zůstává jako měřitelný dluh na
čtvrtek. Mimo `solution/`: tvůj `measurements/baseline.json`.

Tento stav je **Startovní čárou** dne 4 (modul [`extensions`](../../day-4/extensions/)). Když
ti něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution) a do dalšího
bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] `measurements/baseline.json` s dnešním datem a třemi bundly.
- [ ] Treemapa ukazuje PnPjs v Rozcestníku.
- [ ] Experiment s přímým importem potvrdil ~32 KB a byl vrácen.
- [ ] **Negativní:** po vrácení experimentu se build shoduje s baseline (delta 0).

## Fallback

- **`temp\webpack` neexistuje** — chybí `config/webpack-patch.json`, nebo v něm vede cesta jinam
  než na `./config/webpack-patch/webpack-bundle-analyzer.js`.
- **Skript hlásí *No build output*** — spouštíš ho mimo kořen projektu, nebo build neproběhl.
- **Čísla se liší od referenčních o víc než pár bajtů** — jiný kód nebo jiné verze balíčků;
  porovnat `package.json` se solution.
- **Při časové tísni:** krok 5 jako demo lektora. Krok 4 nevynechávat — je to pointa bloku.

## Zdroje (Microsoft)

- [Customize webpack with the Heft Webpack Patch plugin](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-customize-webpack-config)
