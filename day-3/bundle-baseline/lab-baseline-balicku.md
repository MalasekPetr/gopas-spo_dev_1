# Lab · Baseline balíčku a analýza

> Modul: `bundle-baseline` · Odhad: 40 min · Režim: hands-on, jen lokálně
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Uložený soubor `measurements/baseline.json` s velikostmi všech bundlů a vysvětlení, proč je
Rozcestník větší než na konci dne 2.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

## Předpoklady

- Řešení se třemi web party (stav po `pnpjs`).

## Kroky

### 1. Změř baseline

```powershell
npm run build
& "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" -ProjectPath . -OutFile .\measurements\baseline.json
```

**Checkpoint:** tabulka se třemi bundly `*-web-part` a soubor `measurements\baseline.json`
s dnešním datem. Čísla nahlas lektorovi (referenční: 238 632 / 234 791 / 452 625 B).

### 2. Zapoj analýzu balíčku

```powershell
npm install webpack-bundle-analyzer@4.10.2 --save-dev --save-exact
New-Item -ItemType Directory -Path .\config\webpack-patch -Force | Out-Null
```

Zkopíruj ze [solution](solution/vltava-portal/config/) soubory
`config/webpack-patch.json` a `config/webpack-patch/webpack-bundle-analyzer.js`.

```powershell
npm run build
Invoke-Item .\temp\webpack\build.stats.html
```

**Checkpoint:** v prohlížeči se otevře treemapa se třemi bloky (`portal-web-part`,
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
