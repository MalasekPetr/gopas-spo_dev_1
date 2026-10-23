# Lab · Banner oznámení a akce „Vydat zařízení"

> Modul: `extensions` · Odhad: 85 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Application Customizer s bannerem na stránkách webu a Command Set „Vydat zařízení" v seznamu
`Equipment` — oba běžící z `localhost` na skutečných stránkách. Štítky stavů ve sloupci
`Status` přes JSON formátování.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Seznam `Equipment` na webu `spodev-<ini>` (den 3, skript `New-EquipmentList.ps1`).
- Profil prohlížeče `cloudedu` přihlášený do tenantu.

## Startovní čára

Lab začíná u stavu po modulu [`bundle-baseline`](../../day-3/bundle-baseline/): referenční kód
[`../../day-3/bundle-baseline/solution/vltava-portal/`](../../day-3/bundle-baseline/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde; v `src/webparts/` jsou složky `portal`,
`employeeDirectory` a `equipment`; složka `src/extensions` **neexistuje**; v kořeni projektu
je soubor `.student-identity` s tvými iniciálami.

## Část A — Generátor a identita (15 min)

### 1. Přidej obě extensions

Generátor přidá do existujícího řešení dvě komponenty. Z kořene projektu
(`$HOME\spodev\vltava-portal-<ini>`):

```powershell
yo @microsoft/sharepoint --component-type extension --extension-type ApplicationCustomizer `
    --component-name PortalBanner --framework none --skip-install --no-insight
yo @microsoft/sharepoint --component-type extension --extension-type ListViewCommandSet `
    --component-name IssueEquipment --framework none --skip-install --no-insight
npm install
```

- Bez `--framework none` generátor v React projektu skončí chybou
  `ENOENT ... templates\applicationCustomizer\react` — extensions React šablonu nemají.
- První příkaz vytvoří `sharepoint/assets/elements.xml` a `ClientSideInstance.xml`
  s registrací banneru a zapíše je do `config/package-solution.json`. Druhý hlásí
  `Elements.xml already exists` — registraci příkazu **nepřidá**. Doplní se v
  [`packaging-deployment`](../packaging-deployment/); dnes extensions běží z `localhost`.
- Generátor přepíše i `config/serve.json` (ladicí konfigurace), `config/config.json`
  (bundly, lokalizace), `package.json` (čtyři balíčky `@microsoft/*`), `.yo-rc.json`
  a v `eslint.config.js` přepne profil z `react` na `default`. Build s ním projde; nic z toho
  ručně neopravuj.

**Checkpoint:** existuje `src/extensions/portalBanner` a `src/extensions/issueEquipment`;
`package.json` má `@microsoft/sp-application-base`, `@microsoft/sp-listview-extensibility`,
`@microsoft/sp-dialog` a `@microsoft/decorators` ve verzi 1.23.2.

### 2. Přiděl novým komponentám svou identitu

Generátor dal oběma extensions **náhodná** ID — v manifestech, v `elements.xml`,
`ClientSideInstance.xml` i v `serve.json`. Skript je přepíše na tvoje odvozená ID všude
najednou (stejně jako ve středu u web partů):

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
```

Ověř, že každé ID v registracích existuje v některém tvém manifestu:

```powershell
$ids = Get-ChildItem .\src\extensions -Recurse -Filter '*.manifest.json' |
    ForEach-Object { [regex]::Match((Get-Content $_.FullName -Raw), '"id"\s*:\s*"([0-9a-f-]{36})"').Groups[1].Value }
Select-String -Path .\sharepoint\assets\*.xml, .\config\serve.json `
    -Pattern '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' -AllMatches |
    ForEach-Object { $_.Matches } | ForEach-Object { "$($_.Value) : $($ids -contains $_.Value)" }
```

> [!IMPORTANT] ID nikdy nepiš ručně
> Skript přepisuje ID, která **právě jsou v manifestech**. ID vložené odjinud (z cizího
> projektu, ze `solution/`, z návodu) do `elements.xml` nebo `serve.json` nepřepíše — zůstane
> cizí. Proto kroky dnešních labů ID v těchto souborech nemění a kde nové ID potřebují, berou
> ho příkazem z tvého manifestu.

**Checkpoint:** výpis skriptu obsahuje řádky `component/PortalBannerApplicationCustomizer`
a `component/IssueEquipmentCommandSet`; kontrolní příkaz vypíše pět řádků (dva v XML, tři
v `serve.json`) a **všechny** končí `True`.

## Část B — Banner (30 min)

### 3. Napiš texty banneru

Banner potřebuje jediný lokalizovaný text — popisek tlačítka pro čtečku obrazovky.
Generátorové `Title` nahraď.

Soubor `src/extensions/portalBanner/loc/myStrings.d.ts` — **celý obsah nahraď**:

```typescript
declare interface IPortalBannerApplicationCustomizerStrings {
  Dismiss: string;
}

declare module 'PortalBannerApplicationCustomizerStrings' {
  const strings: IPortalBannerApplicationCustomizerStrings;
  export = strings;
}
```

Soubor `src/extensions/portalBanner/loc/en-us.js` — **celý obsah nahraď**:

```javascript
define([], function() {
  return {
    "Dismiss": "Dismiss announcement"
  }
});
```

Soubor `src/extensions/portalBanner/loc/cs-cz.js` — **nový**, zkopíruj ze solution (český
text s diakritikou):

```powershell
$sol = "$HOME\gopas-spo_dev_1\day-4\extensions\solution\vltava-portal"
Copy-Item "$sol\src\extensions\portalBanner\loc\cs-cz.js" .\src\extensions\portalBanner\loc\
```

**Checkpoint:** `Get-ChildItem .\src\extensions\portalBanner\loc` ukáže tři soubory:
`cs-cz.js`, `en-us.js`, `myStrings.d.ts`.

### 4. Napiš banner

Banner běží na **každé** stránce webu, proto je bez Reactu a bez Fluent UI — jen DOM API
a CSS modul (měření ve výkladu: 5 499 B proti 188 628 B s React + Fluent).

Soubor `src/extensions/portalBanner/PortalBanner.module.scss` — **nový**:

```scss
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  font-size: 14px;
  color: "[theme:bodyText, default: #323130]";
}

.info {
  background-color: "[theme:themeLighter, default: #deecf9]";
}

.warning {
  background-color: #fff4ce;
}

.error {
  background-color: #fde7e9;
}

.close {
  border: none;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: inherit;
}
```

Soubor `src/extensions/portalBanner/PortalBannerApplicationCustomizer.ts` — **celý obsah
nahraď**:

```typescript
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  type PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'PortalBannerApplicationCustomizerStrings';
import styles from './PortalBanner.module.scss';

export type BannerLevel = 'info' | 'warning' | 'error';

export interface IPortalBannerApplicationCustomizerProperties {
  message: string;
  level?: BannerLevel;
}

const LOG_SOURCE: string = 'PortalBannerApplicationCustomizer';
const DISMISS_KEY: string = 'vltava-portal-banner-dismissed';

/**
 * Renders an announcement banner into the Top placeholder of every page.
 * Runs on every page load: deliberately no React and no Fluent UI, only DOM API.
 */
export default class PortalBannerApplicationCustomizer
  extends BaseApplicationCustomizer<IPortalBannerApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized');
    // Placeholders are created and re-created during navigation; react to every change.
    this.context.placeholderProvider.changedEvent.add(this, this._render);
    this._render();
    return Promise.resolve();
  }

  private _render(): void {
    const message: string = (this.properties.message || '').trim();
    if (!message || this._isDismissed(message) || this._topPlaceholder) {
      return;
    }

    // Never assume the placeholder exists (some page types have no Top placeholder).
    this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    if (!this._topPlaceholder) {
      Log.warn(LOG_SOURCE, 'Top placeholder not available');
      return;
    }

    const banner: HTMLDivElement = document.createElement('div');
    banner.className = `${styles.banner} ${styles[this.properties.level || 'info']}`;
    banner.setAttribute('role', 'status');

    const text: HTMLSpanElement = document.createElement('span');
    // textContent, not innerHTML: the message comes from configuration and must not inject HTML.
    text.textContent = message;

    const close: HTMLButtonElement = document.createElement('button');
    close.type = 'button';
    close.className = styles.close;
    close.setAttribute('aria-label', strings.Dismiss);
    close.textContent = '\u00D7'; // multiplication sign as the close glyph
    close.addEventListener('click', () => {
      this._dismiss(message);
      banner.remove();
    });

    banner.appendChild(text);
    banner.appendChild(close);
    this._topPlaceholder.domElement.appendChild(banner);
  }

  private _isDismissed(message: string): boolean {
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === message;
    } catch {
      return false; // storage can be blocked by browser policy
    }
  }

  private _dismiss(message: string): void {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, message);
    } catch {
      // ignore: the banner just comes back on the next page
    }
  }
}
```

- `properties` (`message`, `level`) přicházejí z registrace — dnes z ladicí adresy, zítra
  z `elements.xml`. Generátorové `testMessage` už neplatí.
- `tryCreateContent` může vrátit `undefined`; `changedEvent` zavolá `_render` znovu po
  navigaci, `_topPlaceholder` brání dvojímu vykreslení.
- Zavření platí pro **kartu** (`sessionStorage`) a jen pro **tuto** zprávu — nový text se
  ukáže znovu.

**Checkpoint:** `Select-String .\src\extensions\portalBanner\*.ts -Pattern 'innerHTML|React|@fluentui'`
nevrátí **nic**; text se vkládá přes `textContent`.

### 5. Oprav ladicí konfiguraci v `serve.json`

Generátor do `config/serve.json` zapsal stránku `SitePages/myPage.aspx`, která neexistuje,
a vlastnosti ze šablony (`testMessage`, `sampleText...`). Oprav je, ať konfigurace odpovídá
kódu — ID v klíčích `customActions` **neměň** (jsou už tvoje z kroku 2).

Soubor `config/serve.json` — **změna**: v konfiguracích `default` a `portalBanner` (dvakrát)
najdi

```json
      "pageUrl": "https://{tenantDomain}/SitePages/myPage.aspx",
```

a nahraď:

```json
      "pageUrl": "https://{tenantDomain}/SitePages/Home.aspx",
```

Na stejných dvou místech najdi

```json
          "properties": {
            "testMessage": "Test message"
          }
```

a nahraď:

```json
          "properties": {
            "message": "Planned maintenance of the service desk on Friday 17:00-19:00.",
            "level": "warning"
          }
```

V konfiguraci `issueEquipment` najdi

```json
      "pageUrl": "https://{tenantDomain}/SitePages/myPage.aspx",
```

a nahraď:

```json
      "pageUrl": "https://{tenantDomain}/Lists/Equipment/AllItems.aspx",
```

a o pár řádků níž najdi

```json
          "location": "ClientSideExtension.ListViewCommandSet.CommandBar",
          "properties": {
            "sampleTextOne": "One item is selected in the list",
            "sampleTextTwo": "This command is always visible."
          }
```

a nahraď:

```json
          "location": "ClientSideExtension.ListViewCommandSet",
          "properties": {}
```

- `serve.json` čte `npm start -- --serve-config portalBanner`, který ale otevře **výchozí**
  prohlížeč. Na kurzu sestavíme adresu sami (krok 6) a otevřeme ji v profilu `cloudedu`;
  `serve.json` zůstává popisem ladicích stránek a vlastností.
- `ListViewCommandSet` = panel příkazů **i** kontextové menu; `...CommandBar` jen panel.

**Checkpoint:** `Select-String .\config\serve.json -Pattern 'myPage|testMessage|sampleText|CommandBar'`
nevrátí **nic**; kontrolní příkaz z kroku 2 pořád vypíše samé `True`.

### 6. Spusť banner na stránce

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

### 7. Ověř zavření a bezpečnost

1. Klikni na křížek a obnov stránku (F5).
2. Otevři stejnou adresu v **nové kartě**.
3. V příkazu z kroku 6 změň v `$actions` text zprávy na `<img src=x onerror=alert(1)>`,
   sestav adresu znovu a otevři ji.

**Checkpoint:** po F5 banner nesvítí (stejná karta), v nové kartě se vrátí (`sessionStorage`).

**Checkpoint (negativní):** v bodě 3 se zobrazí doslova text `<img src=x onerror=alert(1)>`
a **žádné** okno `alert` — zpráva je text, ne HTML.

## Část C — Příkaz „Vydat zařízení" (30 min)

### 8. Rozšiř službu o vydání zařízení

Příkaz zapíše do položky stav *Issued* a osobu. Osoba se do pole `AssignedTo` zapisuje jako
ID uživatele **webu** — `ensureUser` ho založí, když na webu ještě není. Logika patří do
služby z dne 3, ne do extension.

Soubor `src/services/equipmentService.ts` — **změna**: najdi

```typescript
import '@pnp/sp/batching';
```

a přidej za něj:

```typescript
import '@pnp/sp/site-users/web';
```

Najdi

```typescript
  setStatus(ids: number[], status: EquipmentStatus): Promise<void>;
}
```

a nahraď:

```typescript
  setStatus(ids: number[], status: EquipmentStatus): Promise<void>;
  issue(id: number, email: string): Promise<void>;
}
```

Na konci souboru najdi

```typescript
        await execute();
        await Promise.all(updates);
      });
    }
  };
}
```

a nahraď:

```typescript
        await execute();
        await Promise.all(updates);
      });
    },

    issue(id: number, email: string): Promise<void> {
      return translateError(async () => {
        // ensureUser adds the person to the site's user list if needed and returns its ID.
        const user = await sp.web.ensureUser(email);
        await sp.web.getList(listUrl).items.getById(id).update({ Status: 'Issued', AssignedToId: user.Id });
      });
    }
  };
}
```

- `'@pnp/sp/site-users/web'` je selektivní import PnPjs: bez něj `sp.web.ensureUser`
  neexistuje (chyba typu při buildu).
- Chyba 404 se překládá stejně jako u ostatních metod (`translateError`).

**Checkpoint:** `npm run build` projde; `Select-String .\src\services\equipmentService.ts -Pattern 'ensureUser'`
najde jeden řádek.

### 9. Napiš texty a kód příkazu

Soubor `src/extensions/issueEquipment/loc/myStrings.d.ts` — **celý obsah nahraď**:

```typescript
declare interface IIssueEquipmentCommandSetStrings {
  PromptEmail: string;
  Issued: string;
  IssueFailed: string;
}

declare module 'IssueEquipmentCommandSetStrings' {
  const strings: IIssueEquipmentCommandSetStrings;
  export = strings;
}
```

Soubor `src/extensions/issueEquipment/loc/en-us.js` — **celý obsah nahraď**:

```javascript
define([], function() {
  return {
    "PromptEmail": "Issue {0} to (employee e-mail):",
    "Issued": "{0} was issued to {1}.",
    "IssueFailed": "The equipment could not be issued:"
  }
});
```

Soubor `src/extensions/issueEquipment/loc/cs-cz.js` — **nový**, zkopíruj ze solution:

```powershell
$sol = "$HOME\gopas-spo_dev_1\day-4\extensions\solution\vltava-portal"
Copy-Item "$sol\src\extensions\issueEquipment\loc\cs-cz.js" .\src\extensions\issueEquipment\loc\
```

Soubor `src/extensions/issueEquipment/IssueEquipmentCommandSet.ts` — **celý obsah nahraď**:

```typescript
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs,
  type RowAccessor
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'IssueEquipmentCommandSetStrings';
import { initSP } from '../../services/pnp';
import { createEquipmentService, EQUIPMENT_LIST_URL, type IEquipmentService } from '../../services/equipmentService';

export type IIssueEquipmentCommandSetProperties = Record<string, never>;

const LOG_SOURCE: string = 'IssueEquipmentCommandSet';
const ISSUE_COMMAND: string = 'ISSUE';

export default class IssueEquipmentCommandSet extends BaseListViewCommandSet<IIssueEquipmentCommandSetProperties> {

  private _service: IEquipmentService | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized');
    this._service = createEquipmentService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
    this._updateVisibility();
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    if (event.itemId !== ISSUE_COMMAND) {
      throw new Error('Unknown command');
    }
    const row: RowAccessor | undefined = this.context.listView.selectedRows?.[0];
    if (!row || !this._service) {
      return;
    }
    const id: number = Number(row.getValueByName('ID'));
    const title: string = String(row.getValueByName('Title'));
    this._issue(id, title).catch((e: unknown) => Log.error(LOG_SOURCE, e as Error));
  }

  private async _issue(id: number, title: string): Promise<void> {
    const email: string | undefined = await Dialog.prompt(strings.PromptEmail.replace('{0}', title));
    if (!email || !email.trim() || !this._service) {
      return;
    }
    try {
      await this._service.issue(id, email.trim());
      await Dialog.alert(strings.Issued.replace('{0}', title).replace('{1}', email.trim()));
      // The list view has no public refresh API; reload to show the new state.
      window.location.reload();
    } catch (e) {
      await Dialog.alert(`${strings.IssueFailed} ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    this._updateVisibility();
    this.raiseOnChange();
  };

  // Visible only in the Equipment list, for exactly one item that is Available.
  private _updateVisibility(): void {
    const command: Command | undefined = this.tryGetCommand(ISSUE_COMMAND);
    if (!command) {
      return;
    }
    const listUrl: string = this.context.listView.list?.serverRelativeUrl || '';
    const isEquipmentList: boolean = listUrl.toLowerCase().endsWith(`/${EQUIPMENT_LIST_URL.toLowerCase()}`);
    const rows: readonly RowAccessor[] = this.context.listView.selectedRows || [];
    command.visible = isEquipmentList
      && rows.length === 1
      && rows[0].getValueByName('Status') === 'Available';
  }
}
```

- Registrace platí pro **všechny** seznamy daného typu; na seznam `Equipment` příkaz omezuje
  až kód (`_updateVisibility`).
- `initSP` a `createEquipmentService` jsou tytéž jako ve web partu Evidence — extension
  sdílí služby, nepíše vlastní REST.
- `this.raiseOnChange()` řekne list view, že se změnila viditelnost příkazu.

**Checkpoint:** `npm run build` projde. Příkaz `ISSUE` v manifestu ještě není —
`tryGetCommand` vrátí `undefined` a příkaz by se zatím neukázal; to řeší další krok.

### 10. Nahraď příkazy v manifestu

Generátor v manifestu nechal dva vzorové příkazy `COMMAND_1` a `COMMAND_2` s ikonami.
Řešení má jediný příkaz `ISSUE` s titulkem *Issue equipment* a českým *Vydat zařízení*
(`cs-CZ`), bez ikony. Kvůli českému titulku manifest **zkopíruj** ze solution — nese
šablonové ID kurzu, proto hned po kopii znovu spusť skript identity. Ten ID z manifestu
převede na tvoje (stejné, jaké už mají `serve.json` a ostatní soubory):

```powershell
$sol = "$HOME\gopas-spo_dev_1\day-4\extensions\solution\vltava-portal"
Copy-Item "$sol\src\extensions\issueEquipment\IssueEquipmentCommandSet.manifest.json" `
    .\src\extensions\issueEquipment\ -Force
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
```

Funguje to jen proto, že šablonové ID je **v manifestu** — skript převádí ID manifestů.
Šablonové ID vložené jen do `elements.xml` nebo `serve.json` by nepřevedl (viz krok 2).

**Checkpoint:** skript hlásí `Changed 1 item(s)` s manifestem příkazu; kontrolní příkaz
z kroku 2 vypíše samé `True`; `npm run build` projde.

**Checkpoint (negativní):** `Select-String .\src\extensions\issueEquipment\*.manifest.json -Pattern 'COMMAND_1|iconImageUrl'`
nevrátí **nic**.

### 11. Vyzkoušej příkaz v seznamu

Stejným postupem jako v kroku 6 sestav adresu, jen s ID z `IssueEquipmentCommandSet.manifest.json`,
lokací `ClientSideExtension.ListViewCommandSet`, `properties` `{}` a stránkou
`Lists/Equipment/AllItems.aspx`.

1. Vyber jednu položku ve stavu *Available*.
2. Vyber položku ve stavu *Issued*; pak dvě položky najednou.
3. Vyber znovu jednu *Available* → **Issue equipment** → zadej svůj e-mail.

**Checkpoint:** v bodě 1 je v panelu příkazů **Issue equipment**.

**Checkpoint (negativní):** v bodě 2 příkaz **není vidět**.

**Checkpoint:** po bodu 3 a obnovení má položka stav *Issued* a ve sloupci *AssignedTo* tebe.

## Část D — Bez kódu (10 min)

### 12. Štítky stavů bez kódu

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

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/extensions/portalBanner/PortalBannerApplicationCustomizer.ts` | nový (generátor), přepsaný | banner z DOM API do `Top` placeholderu |
| `src/extensions/portalBanner/PortalBanner.module.scss` | nový | vzhled banneru podle úrovně |
| `src/extensions/portalBanner/loc/*` | nové (generátor), přepsané; `cs-cz.js` ze solution | popisek tlačítka zavření |
| `src/extensions/portalBanner/*.manifest.json` | nový (generátor) | beze změny proti generátoru |
| `src/extensions/issueEquipment/IssueEquipmentCommandSet.ts` | nový (generátor), přepsaný | příkaz *Issue equipment* s viditelností |
| `src/extensions/issueEquipment/loc/*` | nové (generátor), přepsané; `cs-cz.js` ze solution | dialogy příkazu |
| `src/extensions/issueEquipment/*.manifest.json` | ze solution + skript identity | jediný příkaz `ISSUE` |
| `src/services/equipmentService.ts` | změněný | metoda `issue` (`ensureUser` + update) |
| `config/serve.json` | generátor + oprava | ladicí stránky a vlastnosti odpovídají kódu |
| `config/config.json`, `package.json`, `.yo-rc.json`, `eslint.config.js` | generátor | bundly, lokalizace, balíčky `@microsoft/*`, profil ESLint |
| `config/package-solution.json` | generátor | feature odkazuje na `elements.xml` a `ClientSideInstance.xml`; verze zůstává 1.0.0.0 |
| `sharepoint/assets/elements.xml`, `ClientSideInstance.xml` | nové (generátor) | registrace jen banneru; upraví se v `packaging-deployment` |

Ve `solution/` jsou šablonová ID kurzu, u tebe tvoje; `.yo-rc.json` se může lišit
v `nodeVersion`.

Tento stav je **Startovní čárou** modulu [`performance-caching`](../performance-caching/).
Když ti něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] ID v `elements.xml`, `ClientSideInstance.xml` a `serve.json` existují v tvých manifestech.
- [ ] Banner se zobrazí na stránce z `localhost`, zavření platí pro kartu.
- [ ] Příkaz je vidět jen pro jednu položku *Available* v seznamu `Equipment` a vydá ji.
- [ ] Štítky stavů jsou JSON formátováním.
- [ ] **Negativní:** HTML ve zprávě banneru se nevykoná.
- [ ] **Negativní:** příkaz není vidět pro *Issued* ani pro víc vybraných položek.
- [ ] **Negativní:** v manifestu příkazu nezůstal `COMMAND_1` ani ikona.

## Fallback

- **Banner se neukáže** — v `customActions` je jiné ID než v manifestu, nebo chybí
  *Load debug scripts* / *Allow* pro lokální síť. Debug Toolbar → **Show info** ukáže, co se
  načetlo.
- **Kontrolní příkaz z kroku 2 vypíše `False`** — ID v souboru nepochází z tvého manifestu
  (vložené ručně nebo z cizího projektu). Nahraď ho ID z manifestu; skript to neopraví.
- **Skript identity odmítne běh** (`Project already belongs to ...`) — v projektu je
  `.student-identity` s jinými iniciálami; pracuješ v cizí kopii.
- **Příkaz nikde** — lokace `ClientSideExtension.ListViewCommandSet` vs. `...CommandBar`;
  a filtr v kódu: seznam musí mít adresu `Lists/Equipment`.
- **`ensureUser` hlásí chybu** — e-mail neexistuje v tenantu; použij vlastní kurzovní účet.
- **Při časové tísni:** krok 7 (bod 3) a krok 12 jako demo lektora; Field Customizer vůbec
  (jen výklad). Kdo nestihne kód, převezme cílový stav podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).

## Zdroje (Microsoft)

- [Use page placeholders from Application Customizer](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions)
- [Build your first ListView Command Set extension](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api)
- [Use column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting)
