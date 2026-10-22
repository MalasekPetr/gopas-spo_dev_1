# Lab · Banner oznámení a akce „Vydat zařízení"

> Modul: `extensions` · Odhad: 85 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Application Customizer s bannerem na stránkách webu a Command Set „Vydat zařízení" v seznamu
`Equipment` — oba běžící z `localhost` na skutečných stránkách. Štítky stavů ve sloupci
`Status` přes JSON formátování.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`../packaging-deployment/solution/vltava-portal/`](../packaging-deployment/solution/vltava-portal/).

## Předpoklady

- Řešení ve stavu po dni 3, seznam `Equipment` na webu `spodev-<ini>`.

## Kroky

### 1. Přidej obě extensions

```powershell
yo @microsoft/sharepoint --component-type extension --extension-type ApplicationCustomizer `
    --component-name PortalBanner --framework none --skip-install --no-insight
yo @microsoft/sharepoint --component-type extension --extension-type ListViewCommandSet `
    --component-name IssueEquipment --framework none --skip-install --no-insight
npm install
```

Bez `--framework none` generátor v React projektu skončí chybou
`ENOENT ... templates\applicationCustomizer\react` — extensions React šablonu nemají.

**Checkpoint:** existuje `src/extensions/portalBanner` a `src/extensions/issueEquipment`;
`package.json` má `@microsoft/sp-application-base`, `@microsoft/sp-listview-extensibility`
a `@microsoft/sp-dialog` ve verzi 1.23.2.

### 2. Napiš banner

Ze [solution](../packaging-deployment/solution/vltava-portal/src/extensions/portalBanner/)
zkopíruj do `src/extensions/portalBanner/`: `PortalBannerApplicationCustomizer.ts`,
`PortalBanner.module.scss`, `loc/myStrings.d.ts`, `loc/en-us.js`, `loc/cs-cz.js`
(**manifest nepřepisuj**). Z kořene projektu (`$HOME\spodev\vltava-portal-<ini>`):

```powershell
$sol = "$HOME\gopas-spo_dev_1\day-4\packaging-deployment\solution\vltava-portal"
$src = "$sol\src\extensions\portalBanner"
$dst = '.\src\extensions\portalBanner'
Copy-Item "$src\PortalBannerApplicationCustomizer.ts", "$src\PortalBanner.module.scss" $dst -Force
Copy-Item "$src\loc\*" "$dst\loc\" -Force
```

**Checkpoint:** v kódu banneru není `innerHTML`, `React` ani `@fluentui`. Text se vkládá přes
`textContent`.

### 3. Spusť banner na stránce

```powershell
npm start -- --nobrowser
```

Ve druhém terminálu sestav ladicí adresu (ID bere z tvého manifestu):

```powershell
$manifest = '.\src\extensions\portalBanner\PortalBannerApplicationCustomizer.manifest.json'
$id = (Select-String -Path $manifest -Pattern '"id":\s*"([0-9a-f-]{36})"').Matches[0].Groups[1].Value
$actions = '{"' + $id + '":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"message":"Planned maintenance on Friday 17:00-19:00.","level":"warning"}}}'
"https://$env:SPFX_SERVE_TENANT_DOMAIN/SitePages/Home.aspx?loadSPFX=true" +
    "&debugManifestsFile=https://localhost:4321/temp/build/manifests.js" +
    "&customActions=" + [uri]::EscapeDataString($actions)
```

Výslednou adresu otevři v profilu `cloudedu` a potvrď **Load debug scripts**.

**Checkpoint:** nahoře nad obsahem stránky je žlutý pruh s textem oznámení a křížkem.

### 4. Ověř zavření a bezpečnost

1. Klikni na křížek a obnov stránku (F5).
2. Otevři stejnou adresu v **nové kartě**.
3. V příkazu z kroku 3 změň v `$actions` text zprávy na `<img src=x onerror=alert(1)>`,
   sestav adresu znovu a otevři ji.

**Checkpoint:** po F5 banner nesvítí (stejná karta), v nové kartě se vrátí (`sessionStorage`).

**Checkpoint (negativní):** v kroku 3 se zobrazí doslova text `<img src=x onerror=alert(1)>`
a **žádné** okno `alert` — zpráva je text, ne HTML.

### 5. Napiš příkaz „Vydat zařízení"

Ze [solution](../packaging-deployment/solution/vltava-portal/src/extensions/issueEquipment/)
zkopíruj do `src/extensions/issueEquipment/`: `IssueEquipmentCommandSet.ts`,
`loc/myStrings.d.ts`, `loc/en-us.js`, `loc/cs-cz.js` a celý `src/services/equipmentService.ts`
(proti dni 3 přibyl jen import `'@pnp/sp/site-users/web'` a metoda `issue`):

```powershell
$sol = "$HOME\gopas-spo_dev_1\day-4\packaging-deployment\solution\vltava-portal"
$src = "$sol\src\extensions\issueEquipment"
$dst = '.\src\extensions\issueEquipment'
Copy-Item "$src\IssueEquipmentCommandSet.ts" $dst -Force
Copy-Item "$src\loc\*" "$dst\loc\" -Force
Copy-Item "$sol\src\services\equipmentService.ts" .\src\services\ -Force
```

V manifestu nahraď celý blok `items`:

```json
"items": {
  "ISSUE": {
    "title": { "default": "Issue equipment", "cs-CZ": "Vydat zarizeni" },
    "type": "command"
  }
}
```

(v souboru s diakritikou: *Vydat zařízení*).

**Checkpoint:** `npm start` zkompiluje bez chyb; `equipmentService.ts` má metodu `issue`.

### 6. Vyzkoušej příkaz v seznamu

Stejným postupem jako v kroku 3 sestav adresu, jen s ID z `IssueEquipmentCommandSet.manifest.json`,
lokací `ClientSideExtension.ListViewCommandSet`, `properties` `{}` a stránkou
`Lists/Equipment/AllItems.aspx`.

1. Vyber jednu položku ve stavu *Available*.
2. Vyber položku ve stavu *Issued*; pak dvě položky najednou.
3. Vyber znovu jednu *Available* → **Issue equipment** → zadej svůj e-mail.

**Checkpoint:** v bodě 1 je v panelu příkazů **Issue equipment**.

**Checkpoint (negativní):** v bodě 2 příkaz **není vidět**.

**Checkpoint:** po bodu 3 a obnovení má položka stav *Issued* a ve sloupci *AssignedTo* tebe.

### 7. Štítky stavů bez kódu

V seznamu `Equipment`: záhlaví sloupce **Status** → **Column settings** → **Format this
column** → **Advanced mode** → vlož:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "attributes": {
    "class": "=if(@currentField == 'Available', 'sp-field-severity--good', if(@currentField == 'Issued', 'sp-field-severity--low', if(@currentField == 'Repair', 'sp-field-severity--warning', 'sp-field-severity--blocked')))"
  },
  "children": [
    { "elmType": "span", "txtContent": "@currentField" }
  ]
}
```

**Checkpoint:** sloupec `Status` má barevné štítky — bez buildu, bez nasazení, bez kódu
v řešení.

## Ověření

- [ ] Banner se zobrazí na stránce z `localhost`, zavření platí pro kartu.
- [ ] Příkaz je vidět jen pro jednu položku *Available* v seznamu `Equipment` a vydá ji.
- [ ] Štítky stavů jsou JSON formátováním.
- [ ] **Negativní:** HTML ve zprávě banneru se nevykoná.
- [ ] **Negativní:** příkaz není vidět pro *Issued* ani pro víc vybraných položek.

## Fallback

- **Banner se neukáže** — v `customActions` je jiné ID než v manifestu, nebo chybí
  *Load debug scripts* / *Allow* pro lokální síť. Debug Toolbar → **Show info** ukáže, co se
  načetlo.
- **Příkaz nikde** — lokace `ClientSideExtension.ListViewCommandSet` vs. `...CommandBar`;
  a filtr v kódu: seznam musí mít adresu `Lists/Equipment`.
- **`ensureUser` hlásí chybu** — e-mail neexistuje v tenantu; použij vlastní kurzovní účet.
- **Při časové tísni:** krok 4 (bod 3) a krok 7 jako demo lektora; Field Customizer vůbec
  (jen výklad).

## Zdroje (Microsoft)

- [Use page placeholders from Application Customizer](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions)
- [Build your first ListView Command Set extension](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api)
- [Use column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting)
