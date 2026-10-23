# Lab · Evidence vybavení s PnPjs

> Modul: `pnpjs` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Seznam `Equipment` na vlastním webu a web part Evidence vybavení, který ho čte, filtruje,
přidává položky a vrací vybrané kusy jednou dávkou.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Hotové `data-access-clients` a `permissions-consent`, server zastavený.
- Client ID aplikace PnP pro `cloudedu.cz` od lektora.

## Startovní čára

Lab začíná u stavu po modulu [`permissions-consent`](../permissions-consent/): referenční kód
[`../permissions-consent/solution/vltava-portal/`](../permissions-consent/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde, `config/package-solution.json` má
`webApiPermissionRequests`, ve `src/webparts/` jsou složky `portal` a `employeeDirectory`
a ve `src/services/` je jen `employeeService.ts`.

## Část A — Seznam na webu (10 min)

### 1. Zřiď seznam skriptem

Seznam je na webu **studenta**, ne v řešení: web part ho jen čte a zapisuje. Skript ho založí
se sloupci a 12 ukázkovými položkami.

```powershell
if (-not (Get-Module -ListAvailable PnP.PowerShell)) {
    Install-Module PnP.PowerShell -Scope CurrentUser
}
& "$HOME\gopas-spo_dev_1\scripts\New-EquipmentList.ps1" `
    -SiteUrl "https://<tenant>.sharepoint.com/sites/spodev-<ini>" `
    -ClientId <client-id-od-lektora>
```

Přihlášení proběhne v prohlížeči (MFA) — vyber kurzovní účet.

**Checkpoint:** na webu je seznam **Equipment** s 12 položkami; 3 mají stav *Issued*
a ve sloupci *AssignedTo* tebe.

**Checkpoint (negativní):** druhé spuštění téhož příkazu vypíše jen šedé řádky *exists* /
*seed skipped* — nic nezaloží podruhé.

## Část B — PnPjs a nový web part (10 min)

### 2. Doinstaluj PnPjs

PnPjs je na rozdíl od typů Graphu **kód** — jde do balíčku, proto `dependencies`.

```powershell
npm install @pnp/sp@4.22.0 --save-exact
```

**Checkpoint:** `package.json` má v `dependencies` řádek `"@pnp/sp": "4.22.0"`.

### 3. Přidej web part

```powershell
yo @microsoft/sharepoint `
    --component-type webpart `
    --component-name Equipment `
    --framework react `
    --skip-install `
    --no-insight
```

**Checkpoint:** `config/config.json` má bundle `equipment-web-part` a klíč
`EquipmentWebPartStrings`, existuje složka `src/webparts/equipment` a ve `teams/` přibyly dvě
ikony nové komponenty.

### 4. Dej nové komponentě svou identitu

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
```

**Checkpoint:** výpis obsahuje řádek `component/EquipmentWebPart`, změněný je
`EquipmentWebPart.manifest.json` a ikony nové komponenty; titulek v manifestu je
`Equipment (<ini>)`.

**Checkpoint (negativní):** řádky `solution`, `component/PortalWebPart` a
`component/EmployeeDirectoryWebPart` mají `Old` a `New` stejné.

## Část C — Model, služby a hook (15 min)

### 5. Model položky

Hodnoty stavů jsou anglické (data seznamu) a jako typ `EquipmentStatus` je hlídá překladač;
překládají se až popisky v komponentě.

Soubor `src/models/IEquipmentItem.ts` — **nový**:

```typescript
export type EquipmentStatus = 'Available' | 'Issued' | 'Repair' | 'Retired';

export const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Available', 'Issued', 'Repair', 'Retired'];

export const EQUIPMENT_CATEGORIES: string[] = ['Laptop', 'Phone', 'Monitor', 'Accessory'];

export interface IEquipmentItem {
  Id: number;
  Title: string;
  AssetTag: string;
  Category: string;
  Status: EquipmentStatus;
  AssignedTo?: { Title: string; EMail: string };
}

export interface INewEquipmentItem {
  Title: string;
  AssetTag: string;
  Category: string;
}
```

Soubor `src/models/index.ts` — **změna**: najdi

```typescript
export type { IEmployee, PresenceMap } from './IEmployee';
```

a přidej za něj:

```typescript
export type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from './IEquipmentItem';
export { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from './IEquipmentItem';
```

**Checkpoint:** `src/models/index.ts` má 4 řádky; poslední exportuje **hodnoty** (`export`,
ne `export type`).

### 6. Jedna instance PnPjs

`spfi().using(SPFx(context))` se vytvoří jednou na stránku; všechny služby sdílejí stejnou
konfiguraci.

Soubor `src/services/pnp.ts` — **nový**:

```typescript
import { spfi, SPFx, type SPFI } from '@pnp/sp';

// One shared PnPjs instance per page, created once from the SPFx context.
let instance: SPFI | undefined;

export function initSP(context: Parameters<typeof SPFx>[0]): SPFI {
  if (!instance) {
    instance = spfi().using(SPFx(context));
  }
  return instance;
}
```

**Checkpoint:** typ parametru `context` je odvozený z `SPFx` (`Parameters<typeof SPFx>[0]`) —
služba neimportuje `WebPartContext`.

### 7. Služba nad seznamem

Soubor `src/services/equipmentService.ts` — **nový**:

```typescript
import type { SPFI } from '@pnp/sp';
import type { HttpRequestError } from '@pnp/queryable';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from '../models';

// The list is addressed by URL, not by title: titles can be renamed or translated.
export const EQUIPMENT_LIST_URL: string = 'Lists/Equipment';

export class ListNotFoundError extends Error {
  public constructor() {
    super('Equipment list not found');
  }
}

export interface IEquipmentService {
  getAll(status?: EquipmentStatus): Promise<IEquipmentItem[]>;
  add(item: INewEquipmentItem): Promise<void>;
  setStatus(ids: number[], status: EquipmentStatus): Promise<void>;
}

function isHttpError(error: unknown): error is HttpRequestError {
  return !!error && (error as HttpRequestError).isHttpRequestError === true;
}

async function translateError<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isHttpError(error) && error.status === 404) {
      throw new ListNotFoundError();
    }
    throw error;
  }
}

export function createEquipmentService(sp: SPFI, webServerRelativeUrl: string): IEquipmentService {
  const listUrl: string = `${webServerRelativeUrl.replace(/\/$/, '')}/${EQUIPMENT_LIST_URL}`;

  return {
    getAll(status?: EquipmentStatus): Promise<IEquipmentItem[]> {
      return translateError(async () => {
        let query = sp.web.getList(listUrl).items
          .select('Id', 'Title', 'AssetTag', 'Category', 'Status', 'AssignedTo/Title', 'AssignedTo/EMail')
          .expand('AssignedTo')
          .orderBy('Title', true)
          .top(500);
        if (status) {
          query = query.filter(`Status eq '${status}'`);
        }
        return await query<IEquipmentItem[]>();
      });
    },

    add(item: INewEquipmentItem): Promise<void> {
      return translateError(async () => {
        await sp.web.getList(listUrl).items.add({ ...item, Status: 'Available' });
      });
    },

    setStatus(ids: number[], status: EquipmentStatus): Promise<void> {
      return translateError(async () => {
        // One HTTP request for all updates instead of one per item.
        const [batchedSP, execute] = sp.batched();
        const list = batchedSP.web.getList(listUrl);
        const fields: Record<string, unknown> = status === 'Available'
          ? { Status: status, AssignedToId: null }
          : { Status: status };
        const updates: Promise<unknown>[] = ids.map(id => list.items.getById(id).update(fields));
        await execute();
        await Promise.all(updates);
      });
    }
  };
}
```

- Seznam se adresuje **URL** (`getList`), ne titulkem — titulek jde přejmenovat nebo přeložit.
- `select` + `expand` vrátí z osoby jen `Title` a `EMail`, ne celý profil.
- `sp.batched()`: všechny `update` jdou do fronty, `execute()` je pošle **jedním** požadavkem.
  Na jednotlivé promisy se čeká až po `execute()` — `await` uvnitř fronty by dávku zablokoval.
- HTTP 404 se mění na `ListNotFoundError` — komponenta z ní udělá srozumitelné varování.

**Checkpoint:** jediné importy s vedlejším efektem jsou `'@pnp/sp/webs'`, `'/lists'`,
`'/items'` a `'/batching'`; z `@pnp/sp` a `@pnp/queryable` se berou jen typy.

### 8. Barrel služeb

Soubor `src/services/index.ts` — **nový**:

```typescript
export { createEmployeeService } from './employeeService';
export type { IEmployeeService } from './employeeService';
export { createEquipmentService, EQUIPMENT_LIST_URL, ListNotFoundError } from './equipmentService';
export type { IEquipmentService } from './equipmentService';
export { initSP } from './pnp';
```

**Checkpoint:** barrel exportuje obě služby a `initSP`; web party ho zatím nepoužívají —
importují přímo ze souborů.

### 9. Hook pro evidenci

`version` je počítadlo: po každém zápisu se zvýší a efekt načte data znovu.

Soubor `src/hooks/useEquipment.ts` — **nový**:

```typescript
import * as React from 'react';
import type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from '../models';
import { ListNotFoundError, type IEquipmentService } from '../services/equipmentService';

export interface IUseEquipmentResult {
  items: IEquipmentItem[];
  loading: boolean;
  error: string | undefined;
  listMissing: boolean;
  add: (item: INewEquipmentItem) => Promise<void>;
  setStatus: (ids: number[], status: EquipmentStatus) => Promise<void>;
}

export function useEquipment(service: IEquipmentService, status: EquipmentStatus | undefined): IUseEquipmentResult {
  const [items, setItems] = React.useState<IEquipmentItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [listMissing, setListMissing] = React.useState<boolean>(false);
  const [version, setVersion] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    service.getAll(status).then(
      found => {
        if (!cancelled) {
          setItems(found);
          setListMissing(false);
          setLoading(false);
        }
      },
      (e: unknown) => {
        if (!cancelled) {
          setListMissing(e instanceof ListNotFoundError);
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [service, status, version]);

  const add = React.useCallback(async (item: INewEquipmentItem): Promise<void> => {
    await service.add(item);
    setVersion(v => v + 1);
  }, [service]);

  const setStatusFor = React.useCallback(async (ids: number[], newStatus: EquipmentStatus): Promise<void> => {
    await service.setStatus(ids, newStatus);
    setVersion(v => v + 1);
  }, [service]);

  return { items, loading, error, listMissing, add, setStatus: setStatusFor };
}
```

Soubor `src/hooks/index.ts` — **změna**: najdi

```typescript
export type { IUseEmployeesResult } from './useEmployees';
```

a přidej za něj:

```typescript
export { useEquipment } from './useEquipment';
export type { IUseEquipmentResult } from './useEquipment';
```

**Checkpoint:** `src/hooks/index.ts` má 6 řádků. `useEquipment.ts` importuje
`ListNotFoundError` jako **hodnotu** (bez `type`) — tím barrel `hooks` poprvé táhne kód PnPjs.
Co to udělá s Rozcestníkem, změří `bundle-baseline`; teď to neopravuj.

## Část D — Web part Evidence vybavení (15 min)

Soubory po generátoru v této části **celé nahrazuješ** — kromě manifestu.

### 10. Texty

Soubor `src/webparts/equipment/loc/mystrings.d.ts` — **změna**, nahraď celý obsah:

```typescript
declare interface IEquipmentWebPartStrings {
  PropertyPaneDescription: string;
  Title: string;
  FilterLabel: string;
  FilterAll: string;
  StatusAvailable: string;
  StatusIssued: string;
  StatusRepair: string;
  StatusRetired: string;
  ColumnTitle: string;
  ColumnAssetTag: string;
  ColumnCategory: string;
  ColumnStatus: string;
  ColumnAssignedTo: string;
  AddButton: string;
  ReturnButton: string;
  AddPanelTitle: string;
  Save: string;
  Cancel: string;
  Close: string;
  Loading: string;
  ListMissing: string;
  SelectionColumnLabel: string;
  SelectRowLabel: string;
}

declare module 'EquipmentWebPartStrings' {
  const strings: IEquipmentWebPartStrings;
  export = strings;
}
```

Soubory s texty **zkopíruj ze solution**:

```powershell
$from = "$HOME\gopas-spo_dev_1\day-3\pnpjs\solution\vltava-portal\src\webparts\equipment\loc"
Copy-Item "$from\en-us.js", "$from\cs-cz.js" .\src\webparts\equipment\loc\ -Force
```

**Checkpoint:** ve složce `loc/` jsou tři soubory; `cs-cz.js` je nový a stav `Issued` v něm
má popisek *Vydáno*.

### 11. Komponenta

Soubor `src/webparts/equipment/components/IEquipmentProps.ts` — **změna**, nahraď celý obsah:

```typescript
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IEquipmentService } from '../../../services/equipmentService';

export interface IEquipmentProps {
  service: IEquipmentService;
  listUrl: string;
  theme: IReadonlyTheme | undefined;
}
```

Soubor `src/webparts/equipment/components/Equipment.module.scss` — **změna**, nahraď celý obsah:

```scss
.equipment {
  overflow: hidden;
  padding: 1em;
}

.title {
  margin-top: 0;
}

.filter {
  min-width: 180px;
}

.message {
  margin: 8px 0;
}
```

Soubor `src/webparts/equipment/components/Equipment.tsx` — **změna**, nahraď celý obsah:

```tsx
import * as React from 'react';
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  type IColumn,
  type IDropdownOption,
  Link,
  MessageBar,
  MessageBarType,
  Panel,
  PrimaryButton,
  Selection,
  Spinner,
  Stack,
  TextField,
  ThemeProvider,
  type PartialTheme
} from '@fluentui/react';
import * as strings from 'EquipmentWebPartStrings';
import styles from './Equipment.module.scss';
import type { IEquipmentProps } from './IEquipmentProps';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUSES,
  type EquipmentStatus,
  type IEquipmentItem,
  type INewEquipmentItem
} from '../../../models';
import { useEquipment } from '../../../hooks/useEquipment';

// Stored values are English (list data); labels are localized.
const STATUS_LABELS: Record<EquipmentStatus, string> = {
  Available: strings.StatusAvailable,
  Issued: strings.StatusIssued,
  Repair: strings.StatusRepair,
  Retired: strings.StatusRetired
};

const ALL: string = 'all';

const EMPTY_ITEM: INewEquipmentItem = { Title: '', AssetTag: '', Category: EQUIPMENT_CATEGORIES[0] };

export default function Equipment(props: IEquipmentProps): JSX.Element {
  const { service, listUrl, theme } = props;
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [draft, setDraft] = React.useState<INewEquipmentItem>(EMPTY_ITEM);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);
  const [busy, setBusy] = React.useState<boolean>(false);

  const status: EquipmentStatus | undefined = statusFilter === ALL ? undefined : statusFilter as EquipmentStatus;
  const { items, loading, error, listMissing, add, setStatus } = useEquipment(service, status);

  const selection: Selection = React.useMemo(() => new Selection({
    onSelectionChanged: () => setSelectedIds(selection.getSelection().map(item => (item as IEquipmentItem).Id))
  }), []);

  const filterOptions: IDropdownOption[] = [
    { key: ALL, text: strings.FilterAll },
    ...EQUIPMENT_STATUSES.map(s => ({ key: s, text: STATUS_LABELS[s] }))
  ];

  const columns: IColumn[] = [
    { key: 'title', name: strings.ColumnTitle, fieldName: 'Title', minWidth: 140, isResizable: true },
    { key: 'tag', name: strings.ColumnAssetTag, fieldName: 'AssetTag', minWidth: 90 },
    { key: 'category', name: strings.ColumnCategory, fieldName: 'Category', minWidth: 90 },
    {
      key: 'status', name: strings.ColumnStatus, minWidth: 90,
      onRender: (item: IEquipmentItem) => STATUS_LABELS[item.Status] || item.Status
    },
    {
      key: 'assigned', name: strings.ColumnAssignedTo, minWidth: 140,
      onRender: (item: IEquipmentItem) => item.AssignedTo ? item.AssignedTo.Title : ''
    }
  ];

  const run = async (action: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setActionError(undefined);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = (): void => {
    run(async () => {
      await add(draft);
      setDraft(EMPTY_ITEM);
      setPanelOpen(false);
    }).catch(() => undefined);
  };

  const returnSelected = (): void => {
    run(() => setStatus(selectedIds, 'Available')).catch(() => undefined);
  };

  if (listMissing) {
    return (
      <MessageBar messageBarType={MessageBarType.warning}>
        {strings.ListMissing} <Link href={listUrl} target="_blank" rel="noreferrer">{listUrl}</Link>
      </MessageBar>
    );
  }

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.equipment}>
      <h2 className={styles.title}>{strings.Title}</h2>

      <Stack horizontal wrap tokens={{ childrenGap: 8 }} verticalAlign="end">
        <Dropdown
          label={strings.FilterLabel}
          options={filterOptions}
          selectedKey={statusFilter}
          onChange={(_event, option) => setStatusFilter(option ? String(option.key) : ALL)}
          className={styles.filter}
        />
        <PrimaryButton text={strings.AddButton} iconProps={{ iconName: 'Add' }} onClick={() => setPanelOpen(true)} />
        <DefaultButton
          text={strings.ReturnButton.replace('{0}', selectedIds.length.toString())}
          iconProps={{ iconName: 'Undo' }}
          disabled={selectedIds.length === 0 || busy}
          onClick={returnSelected}
        />
      </Stack>

      {(error || actionError) && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.message}>
          {actionError || error}
        </MessageBar>
      )}

      {loading ? (
        <Spinner label={strings.Loading} className={styles.message} />
      ) : (
        <DetailsList
          items={items}
          columns={columns}
          selection={selection}
          layoutMode={DetailsListLayoutMode.justified}
          ariaLabelForSelectionColumn={strings.SelectionColumnLabel}
          checkButtonAriaLabel={strings.SelectRowLabel}
          setKey="equipment"
        />
      )}

      <Panel
        isOpen={panelOpen}
        headerText={strings.AddPanelTitle}
        onDismiss={() => setPanelOpen(false)}
        closeButtonAriaLabel={strings.Close}
        onRenderFooterContent={() => (
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text={strings.Save} onClick={saveDraft} disabled={busy || !draft.Title.trim() || !draft.AssetTag.trim()} />
            <DefaultButton text={strings.Cancel} onClick={() => setPanelOpen(false)} />
          </Stack>
        )}
        isFooterAtBottom={true}
      >
        <TextField
          label={strings.ColumnTitle}
          required
          value={draft.Title}
          onChange={(_event, value) => setDraft({ ...draft, Title: value || '' })}
        />
        <TextField
          label={strings.ColumnAssetTag}
          required
          value={draft.AssetTag}
          onChange={(_event, value) => setDraft({ ...draft, AssetTag: value || '' })}
        />
        <Dropdown
          label={strings.ColumnCategory}
          options={EQUIPMENT_CATEGORIES.map(c => ({ key: c, text: c }))}
          selectedKey={draft.Category}
          onChange={(_event, option) => setDraft({ ...draft, Category: option ? String(option.key) : EQUIPMENT_CATEGORIES[0] })}
        />
      </Panel>
    </ThemeProvider>
  );
}
```

- `Selection` se vytvoří jednou (`useMemo`) — jinak by `DetailsList` při každém renderu
  ztratil výběr.
- `listMissing` vrací místo tabulky žluté varování s odkazem; ostatní chyby jsou červený pruh.
- Filtr mění parametr hooku `status` — nový dotaz s `$filter` jde na server, nefiltruje se
  v prohlížeči.

**Checkpoint:** komponenta nevolá `sp` ani `fetch` — všechny zápisy jdou přes `add` a
`setStatus` z hooku.

### 12. Web part

Soubor `src/webparts/equipment/EquipmentWebPart.ts` — **změna**, nahraď celý obsah:

```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import type { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EquipmentWebPartStrings';
import Equipment from './components/Equipment';
import type { IEquipmentProps } from './components/IEquipmentProps';
import { initSP } from '../../services/pnp';
import { createEquipmentService, type IEquipmentService } from '../../services/equipmentService';

// No configurable properties: the list is fixed by URL (Lists/Equipment).
export type IEquipmentWebPartProps = Record<string, never>;

export default class EquipmentWebPart extends BaseClientSideWebPart<IEquipmentWebPartProps> {

  private _service: IEquipmentService | undefined;
  private _theme: IReadonlyTheme | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._service = createEquipmentService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
  }

  public render(): void {
    if (!this._service) {
      return;
    }
    const element: React.ReactElement<IEquipmentProps> = React.createElement(
      Equipment,
      {
        service: this._service,
        listUrl: `${this.context.pageContext.web.absoluteUrl}/Lists/Equipment`,
        theme: this._theme
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this._theme = currentTheme;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: []
        }
      ]
    };
  }
}
```

**Checkpoint:** služba dostane `serverRelativeUrl` aktuálního webu — web part čte seznam
`Lists/Equipment` webu, na kterém stránka je.

### 13. Manifest a build

V manifestu měníš **jen** pole `preconfiguredEntries`. Otevři
[`solution/.../EquipmentWebPart.manifest.json`](solution/vltava-portal/src/webparts/equipment/EquipmentWebPart.manifest.json),
zkopíruj z něj celé pole `"preconfiguredEntries": [ ... ]` a nahraď jím totéž pole ve svém
`src/webparts/equipment/EquipmentWebPart.manifest.json`.

| Klíč v `preconfiguredEntries[0]` | Po generátoru | Po změně |
|---|---|---|
| `title` | `Equipment (<ini>)` | *Vltava Equipment* / *Evidence vybavení Vltava* |
| `description` | `Equipment description` | anglický a český popis |
| `officeFabricIconFontName` | `Page` | `Devices3` |
| `properties` | `description` | `{}` — web part nemá žádnou vlastnost |

Příponu s iniciálami doplní znovu skript:

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
npm run build
```

**Checkpoint:** skript hlásí jedinou změnu `EquipmentWebPart.manifest.json (title suffix)`,
oba titulky končí ` (<ini>)`, `id` je stejné jako po kroku 4 a `npm run build` projde.

## Část E — Vyzkoušej na vlastním webu (10 min)

> [!WARNING] Hosted workbench končí 2026-12-01
> SPFx 1.23 je podle release notes **poslední verze s podporou** hosted workbenche: je
> deprecated od 2026-05-13 a 2026-12-01 se retiruje
> ([SPFx v1.23.0 release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.0#deprecations)).
> **Po tomto datu nebo v projektu na SPFx 1.24+** udělej kroky 14–17 (krok 17 na české stránce) na testovací stránce svého
> webu s parametry `?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`
> (postup: [`first-webpart`, krok 9](../../day-1/first-webpart/lab-prvni-webpart.md#9-otestuj-na-skutečné-stránce)).

### 14. Čti a filtruj

`npm start`, workbench vlastního webu + query string → **Vltava Equipment (<ini>)**.

**Checkpoint:** tabulka s 12 položkami seřazenými podle modelu; sloupec *Assigned to* ukazuje
tvoje jméno u 3 kusů. Filtr **Issued** nechá 3 řádky (F12 → Network: nový požadavek s
`$filter=Status eq 'Issued'`).

### 15. Přidej položku

**Add equipment** → model `HP EliteBook 840`, inventární číslo `VS-NB-005`, kategorie
*Laptop* → **Save**.

**Checkpoint:** položka je v tabulce i v seznamu **Equipment** se stavem *Available* —
výchozí hodnotu nastavila služba, ne uživatel.

### 16. Vrať vybrané jednou dávkou

Filtr **All**, vyber 3 položky ve stavu *Issued* → **Return selected (3)**.

**Checkpoint:** všechny 3 jsou *Available* a bez přiřazené osoby. V Network je **jeden**
požadavek na `_api/$batch`, ne tři `MERGE`.

### 17. Ověř chybějící seznam

Na **českém** webu `spodev-<ini>-cs` (seznam tam není) otevři workbench a vlož Evidenci.

**Checkpoint (negativní):** místo tabulky je žluté varování *Seznam Equipment na tomto webu
neexistuje…* s odkazem — ne červená technická chyba ani prázdná tabulka.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `package.json` | změněný | `@pnp/sp` 4.22.0 v `dependencies` |
| `.yo-rc.json` | změněný (generátor) | `componentName: Equipment`; `nodeVersion` podle stroje |
| `config/config.json` | změněný (generátor) | bundle `equipment-web-part` a jeho texty |
| `teams/<id>_color.png`, `teams/<id>_outline.png` | nové (generátor) | ikony nové komponenty |
| `src/models/IEquipmentItem.ts`, `src/models/index.ts` | nový, změněný | položka, stavy, kategorie |
| `src/services/pnp.ts` | nový | jedna instance `spfi` na stránku |
| `src/services/equipmentService.ts` | nový | `getList`, `select`/`expand`, `$filter`, dávka, `ListNotFoundError` |
| `src/services/index.ts` | nový | barrel služeb |
| `src/hooks/useEquipment.ts`, `src/hooks/index.ts` | nový, změněný | načítání, `version` po zápisu |
| `src/webparts/equipment/EquipmentWebPart.ts` | nový | služba z `initSP` a URL webu |
| `src/webparts/equipment/EquipmentWebPart.manifest.json` | nový | `preconfiguredEntries` z kroku 13, ID z kroku 4 |
| `src/webparts/equipment/components/*` | nové | `DetailsList`, filtr, `Panel` pro novou položku |
| `src/webparts/equipment/loc/*` | nové | 23 textů, angličtina a čeština |
| `src/webparts/equipment/assets/*` | nové (generátor) | beze změny po generátoru |

Mimo kód: seznam `Equipment` na `/sites/spodev-<ini>`.

Tento stav je **Startovní čárou** modulu [`bundle-baseline`](../bundle-baseline/). Když ti něco
nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution) a do dalšího
bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Seznam `Equipment` vznikl skriptem, opakované spuštění nic nezdvojí.
- [ ] Nová komponenta má ID ze `Set-StudentIdentity.ps1` a oba titulky končí ` (<ini>)`.
- [ ] Web part čte, filtruje, přidává a vrací vybrané kusy.
- [ ] Vrácení N kusů = jeden požadavek `$batch`.
- [ ] **Negativní:** na webu bez seznamu web part ukáže srozumitelné varování.
- [ ] **Negativní:** `Set-StudentIdentity.ps1` nezměnil ID řešení ani starších web partů.

## Fallback

- **`Connect-PnPOnline` hlásí chybu aplikace / AADSTS** — špatné Client ID nebo jiný tenant.
  Ověřit hodnotu od lektora; přihlásit se kurzovním účtem.
- **`Install-Module` chce potvrdit nedůvěryhodné úložiště** — potvrdit `Y` (PSGallery).
- **Skript nejde spustit vůbec** — ruční fallback: na webu **New** → **List** → **Blank list**
  `Equipment`, adresa `Lists/Equipment`; sloupce podle tabulky v README s **přesně** těmito
  interními názvy (při zakládání sloupce zadat nejdřív anglický název bez mezer).
- **Prázdná tabulka bez chyby** — sloupce mají jiné interní názvy; v nastavení seznamu
  zkontrolovat URL sloupce (`Field=AssetTag`).
- **Build hlásí chybu v manifestu** — při kopírování `preconfiguredEntries` zůstala navíc nebo
  chybí čárka či hranatá závorka. Porovnat se `solution/`.
- **Při časové tísni:** krok 17 jako demo lektora. Kdo nestihne části C a D, převezme cílový
  kód podle scénáře a pokračuje krokem 14.

## Zdroje (Microsoft)

- [Working with lists and list items with REST](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)

## Zdroje (třetí strana — PnPjs)

- [PnPjs — batching](https://pnp.github.io/pnpjs/concepts/batching/)
