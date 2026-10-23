# Anatomie `.sppkg` — co přesně nahráváš do App Catalogu

Deep-dive k [`README.md`](README.md). `.sppkg` je ZIP; dá se rozbalit a přečíst. Kdo jednou
viděl, co v něm je, pozná většinu chyb nasazení dřív, než balíček nahraje do tenantu.

## Jak si obsah vypsat

Z kořene projektu po `npm run build`:

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead((Resolve-Path '.\sharepoint\solution\vltava-portal.sppkg'))
try {
    $zip.Entries | Select-Object FullName, Length | Format-Table -AutoSize
}
finally {
    $zip.Dispose()
}
```

Totéž rozbalené (bez ZIPu) je ve složce `sharepoint/solution/debug` — dokumentace ji uvádí
jako místo, kde je vidět, co se do balíčku dostalo
([Provision SharePoint assets](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/provision-sp-assets-from-package)).

## Výpis balíčku dne 4

Build 2026-10-16, lektorský stroj, SPFx 1.23.2, řešení verze 1.1.0.0. GUID nahrazeny
zástupci, hash v názvech souborů zkrácen.

```text
AppManifest.xml                                    1 168 B
[Content_Types].xml                                1 035 B
_rels/.rels, _rels/AppManifest.xml.rels
feature_<feature-guid>.xml                           304 B
feature_<feature-guid>.xml.config.xml                189 B
_rels/feature_<feature-guid>.xml.rels              1 865 B
<feature-guid>/elements.xml                          930 B
<feature-guid>/upgrade-actions-v1.1.xml              264 B
<feature-guid>/WebPart_<component-id>.xml          x3
<feature-guid>/Extension_<component-id>.xml        x2
ClientSideAssets.xml                                 312 B
_rels/ClientSideAssets.xml.rels                    5 795 B
ClientSideAssets/<bundle>_<hash>.js                x5
ClientSideAssets/<bundle>_<hash>.js.LICENSE.txt    x5
ClientSideAssets/<Component>Strings_cs-cz_<hash>.js   x5
ClientSideAssets/<Component>Strings_en-us_<hash>.js   x5
ClientSideAssets/<component-id>_color.png          x3
ClientSideAssets/<component-id>_outline.png        x3
```

Velikost celého (komprimovaného) balíčku: 324 557 B. Nekomprimované velikosti bundlů uvnitř
jsou stejné jako v
[`../performance-caching/mereni-den-4.md`](../performance-caching/mereni-den-4.md) — do
balíčku jde přesně výstup produkčního buildu.

## Co je v souborech vidět

**`AppManifest.xml`** — atributy z `package-solution.json`: `Name`, `ProductID` (= `solution.id`),
`Version="1.1.0.0"` (= `solution.version`), `SkipFeatureDeployment="true"`,
`IsDomainIsolated="false"`, `IsClientSideSolution="true"` a sekce `developer`.

**`WebPart_*.xml`, `Extension_*.xml`** — každý obsahuje element `ClientSideComponent`, jehož
atribut `ComponentManifest` je celý manifest komponenty jako JSON. Z něj:

- `"version":"1.1.0"` — verze z `package.json` (manifest v projektu má `"version": "*"`).
- `loaderConfig.internalModuleBaseUrls` = `HTTPS://SPCLIENTSIDEASSETLIBRARY/` — štítek místo
  skutečné adresy. Produkční build podle dokumentace používá dynamický štítek, který se po
  nasazení doplní podle nastavení CDN tenantu
  ([Host your client-side web part from Microsoft 365 CDN](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/hosting-webpart-from-office-365-cdn)).
- `scriptResources` — bundle a jazykové soubory s hashem v názvu.

**`<feature-guid>/elements.xml` a `upgrade-actions-v1.1.xml`** — beze změny zkopírované ze
`sharepoint/assets/`. Název složky je GUID feature; proto `Location` v upgrade action začíná
`<feature-guid>\`.

**`ClientSideAssets/`** — všechno, co stáhne prohlížeč. Při `includeClientSideAssets: true`
se po nasazení servíruje z Microsoft 365 Public CDN, nebo z knihovny `ClientSideAssets`
v site collection App Catalogu (tamtéž).

## Kontrola balíčku před nahráním

| Kontrola | Kde | Chyba, kterou chytí |
|---|---|---|
| `Version` v `AppManifest.xml` je nová | `AppManifest.xml` | zapomenutá verze řešení — katalog nepozná novou verzi |
| složka `<feature-guid>/` odpovídá `Location` v upgrade action | výpis | GUID řešení místo GUID feature |
| `elements.xml` má tolik `CustomAction`, kolik je extensions | `<feature-guid>/elements.xml` | druhá extension bez registrace |
| `ClientSideAssets/` není prázdná | výpis | `includeClientSideAssets: false` bez vlastního hostingu |
| v balíčku není `ClientSideInstance.xml` | výpis | nechtěná tenant-wide registrace |
| bundly mají očekávanou velikost | výpis vs. `mereni-*.md` | ladicí build místo produkčního, nečekaná knihovna |

## Co z balíčku nevyčteš

Kde se assety po nasazení skutečně servírují (CDN, nebo knihovna), závisí na nastavení
tenantu, ne na balíčku. Ověřuje se až na stránce v F12 — viz
[`../performance-caching/explainer-page-loading.md`](../performance-caching/explainer-page-loading.md).
