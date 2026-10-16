# Lab · Rozcestník česky i anglicky

> Modul: `localization` · Odhad: 30 min · Režim: hands-on, vlastní weby
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Rozcestník se na českém webu `spodev-<ini>-cs` zobrazí česky a na anglickém `spodev-<ini>`
anglicky, z jednoho buildu.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

## Předpoklady

- Hotový lab [`../property-pane/`](../property-pane/).

## Kroky

### 1. Založ český web

**Create site** → **Communication site** → název `SPO DEV <ini> CS`, adresa
**`spodev-<ini>-cs`**, jazyk **Čeština**.

**Checkpoint:** `https://<tenant>.sharepoint.com/sites/spodev-<ini>-cs` má české menu (*Domů*,
*Upravit*).

### 2. Přidej české texty

Zkopíruj [`../react-fluent-ui/solution/vltava-portal/src/webparts/portal/loc/cs-cz.js`](../react-fluent-ui/solution/vltava-portal/src/webparts/portal/loc/cs-cz.js)
do `src/webparts/portal/loc/cs-cz.js`. Soubor obsahuje 5 klíčů navíc pro odpolední blok —
neškodí, `mystrings.d.ts` je zatím nezná.

**Checkpoint:** každý klíč z `mystrings.d.ts` je v `cs-cz.js`:

```powershell
$loc = '.\src\webparts\portal\loc'
$keys = Select-String -Path "$loc\mystrings.d.ts" -Pattern '^\s+(\w+): string;' |
    ForEach-Object { $_.Matches[0].Groups[1].Value }
$keys | Where-Object { -not (Select-String -Path "$loc\cs-cz.js" -Pattern "`"$_`":" -Quiet) }
```

Příkaz nevypíše **nic**.

### 3. Lokalizuj manifest

V `src/webparts/portal/PortalWebPart.manifest.json` doplň do `preconfiguredEntries[0]`
české hodnoty (vlastní iniciály ponech):

```json
"title": { "default": "Vltava Portal (<ini>)", "cs-CZ": "Rozcestnik Vltava (<ini>)" },
"description": { "default": "Welcome and company links for Vltava Servis", "cs-CZ": "Uvitani a firemni odkazy Vltava Servis" },
```

V souboru použij českou diakritiku (*Rozcestník*, *Uvítání a firemní odkazy*) — manifest je
UTF-8.

**Checkpoint:** `npm run build` projde a v `release\manifests\` je v manifestu web partu mapa
jazyků:

```powershell
Get-ChildItem .\release\manifests\*.json | ForEach-Object {
    (Get-Content $_.FullName -Raw | ConvertFrom-Json).loaderConfig.scriptResources.PortalWebPartStrings.paths
}
```

Výpis obsahuje `cs-CZ` i `en-US`.

### 4. Ověř oba jazyky

```powershell
npm start -- --nobrowser
```

Otevři hosted workbench **českého** webu
`https://<tenant>.sharepoint.com/sites/spodev-<ini>-cs/_layouts/workbench.aspx` s query
stringem z terminálu a vlož Rozcestník.

**Checkpoint:** nadpis *Portál Vltava Servis*, pozdrav *Dobrý den*, v property pane skupiny
*Obsah*, *Dokumenty oddělení*, *Zobrazení*. Chybný řádek odkazů hlásí *Řádek N: …*.

**Checkpoint:** tentýž běžící server na **anglickém** webu `spodev-<ini>` zobrazí anglické texty.

### 5. Ověř lokalizovaný název v toolboxu

Na českém webu vytvoř stránku (koncept), připoj
`?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`, otevři
toolbox.

**Checkpoint:** v toolboxu je **Rozcestník Vltava (<ini>)**. Ve workbenchi je i na českém webu
anglický název — workbench lokalizovaný manifest nepoužívá. (Pokud se český název neukáže ani
na stránce, zapiš to lektorovi — ověří se ve středu po nasazení.)

### 6. Najdi chybějící překlad dřív než uživatel

V `cs-cz.js` dočasně smaž řádek s klíčem `"Greeting"` a obnov workbench na českém webu.

**Checkpoint (negativní):** na českém webu pozdrav začíná čárkou — SPFx **nepoužil** anglický
text jako zálohu. Na anglickém webu je pozdrav v pořádku. Kontrola z kroku 2 vypíše
`Greeting`. Řádek vrať.

## Ověření

- [ ] Web `spodev-<ini>-cs` v češtině existuje.
- [ ] Rozcestník je na českém webu česky, na anglickém anglicky, z jednoho běžícího serveru.
- [ ] Release manifest obsahuje `cs-CZ` a `en-US`.
- [ ] **Negativní:** chybějící klíč v `cs-cz.js` se projeví jen na českém webu a kontrolní
      příkaz ho najde.

## Fallback

- **Na českém webu je všechno anglicky** — soubor se nejmenuje přesně `cs-cz.js` (malá písmena),
  nebo server běžel před jeho vytvořením (restart).
- **Build hlásí chybu JSON v manifestu** — chybějící čárka mezi `"default"` a `"cs-CZ"`.
- **Při časové tísni:** krok 5 jako demo lektora. Krok 6 nevynechávat — je to jádro bloku.

## Zdroje (Microsoft)

- [Localize SharePoint Framework client-side web parts](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/localize-web-parts)
