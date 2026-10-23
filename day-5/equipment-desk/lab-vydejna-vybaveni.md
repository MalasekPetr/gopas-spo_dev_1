# Lab · Výdejna vybavení

> Modul: `equipment-desk` · Odhad: ~108 min jádro (součet kroků) + bonusy · Režim: hands-on, **samostatně**, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Full-page aplikace **Výdejna vybavení** na webu `spodev-<ini>`, nasazená jako verze 1.2.0.0:
vydáš notebook kolegovi z adresáře, vrátíš ho, historie výpůjček sedí se stavem v seznamu
`Equipment` — a sedí i tehdy, když vydáš přes příkaz **Vydat zařízení** ze dne 4.

**Jak lab číst:** pracuješ sám, lektor nepředvádí. Začni u **Startovní čáry** — ověř, že
tvůj kód je tam, kde lab začíná. Pak jdi po částech; každý krok říká, **který soubor**
měníš, **co** do něj patří a **proč**, a končí **Checkpointem** — nesedí-li, nepokračuj a
zavolej lektora. Na konci je **Výstupní stav**: cílový kód, se kterým se můžeš porovnat.
Časy u kroků jsou orientační; kdo je v 13:30 před krokem 11, převezme Výstupní stav ze
solution (postup ve [scénáři](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution))
a dokončí jen krok 12.

## Předpoklady

- Řešení `vltava-portal-<ini>` ve verzi 1.1.0.0 nasazené na webu `spodev-<ini>` (den 4).
- Seznam `Equipment` na webu (den 3), schválené `User.Read.All` (den 3).
- Client ID aplikace PnP pro `cloudedu.cz` od lektora.

## Startovní čára

Lab začíná u stavu po modulu [`diagnostics-hardening`](../diagnostics-hardening/): referenční
kód [`../diagnostics-hardening/solution/vltava-portal/`](../diagnostics-hardening/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**). Vlastní `HARDENING.md`
  a `.student-identity` zůstanou — `robocopy /E` nic nemaže.

**Checkpoint:** `npm run build` projde (`Successes: 15`), v `src/components/` je
`ErrorBoundary.tsx`, v `src/webparts/` jsou tři složky (`portal`, `employeeDirectory`,
`equipment`) a `config/package-solution.json` má verzi řešení `1.1.0.0`.

## Část A — Seznam výpůjček (10 min)

### 1. Zřiď seznam výpůjček skriptem (5 min)

```powershell
& "$HOME\gopas-spo_dev_1\scripts\New-EquipmentLoansList.ps1" `
    -SiteUrl "https://<tenant>.sharepoint.com/sites/spodev-<ini>" `
    -ClientId <client-id-od-lektora>
```

Skript nejdřív ověří, že na webu je `Equipment`: lookup ukazuje na seznam **podle jeho ID**,
proto musí cílový seznam existovat dřív a na stejném webu.

**Checkpoint:** na webu je seznam **EquipmentLoans**; počet výpůjček bez data vrácení
(*ReturnedOn*) se rovná počtu položek *Issued* v `Equipment` (po dni 3 a 4 typicky 3 nebo 4),
plus 2 vrácené.

**Checkpoint (negativní):** druhé spuštění vypíše jen šedé *exists* / *seed skipped*.

### 2. Podívej se, jak lookup vypadá v REST (5 min)

Do adresního řádku (přihlášený profil `cloudedu`):

```text
https://<tenant>.sharepoint.com/sites/spodev-<ini>/_api/web/getList('/sites/spodev-<ini>/Lists/EquipmentLoans')/items?$select=Title,EquipmentId,Equipment/Title&$expand=Equipment
```

Pak totéž **bez** `&$expand=Equipment`.

**Checkpoint:** s `expand` vidíš u každé položky `EquipmentId` (číslo) **i** objekt `Equipment`
s `Title`. Bez `expand` vrátí SharePoint chybu — `Equipment/Title` nejde vybrat bez rozbalení.
Odtud pravidlo labu: **čte se objekt, zapisuje se číslo** (`EquipmentId`).

## Část B — Nový web part a jeho identita (8 min)

### 3. Přidej web part (5 min)

V kořeni projektu:

```powershell
yo @microsoft/sharepoint --component-type webpart --component-name EquipmentDesk `
    --framework react --skip-install --no-insight
```

Soubor `src/webparts/equipmentDesk/EquipmentDeskWebPart.manifest.json` — **změna**
(vygenerovaný soubor). `id` neměň — přepíše ho skript v kroku 4. Řádek `supportedHosts`
nahraď:

```json
  // SharePointFullPage: the web part can be the only content of a page (single part app page).
  "supportedHosts": ["SharePointWebPart", "SharePointFullPage", "TeamsTab"],
```

V `preconfiguredEntries` nastav:

```json
    "title": { "default": "Vltava Equipment Desk" },
    "description": { "default": "Issue and return equipment, loan history" },
    "officeFabricIconFontName": "Handwriting",
    "properties": {}
```

a do `title` i `description` doplň český překlad `"cs-CZ"` — oba řetězce s diakritikou
zkopíruj ze [solution manifestu](solution/vltava-portal/src/webparts/equipmentDesk/EquipmentDeskWebPart.manifest.json).
`(<ini>)` do titulku **nepiš** — doplní ho skript v kroku 4. `SharePointFullPage` je to, co
z web partu udělá aplikaci na celou stránku.

**Checkpoint:** `config/config.json` má bundle `equipment-desk-web-part` a v
`localizedResources` klíč `EquipmentDeskWebPartStrings`.

### 4. Dej novému web partu svou identitu (3 min)

`yo` vygeneroval **náhodné** ID komponenty a titulek bez iniciál. Dokud to tak je, web part
se s ostatními v tenantovém App Catalogu nesnese (viz
[scénář](../../scenario-vltava-portal.md#identita-řešení-na-sdíleném-tenantu)). Spusť skript
znovu — co už identitu má, nechá být, a nový web part doplní:

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
```

**Checkpoint:** v tabulce `Slot` je řádek `component/EquipmentDeskWebPart` a výpis
`Changed … item(s)` obsahuje `EquipmentDeskWebPart.manifest.json (title suffix)`. Titulek
v manifestu končí mezerou a `(<ini>)` v obou jazycích.

**Checkpoint (negativní):** u ostatních slotů (`solution`, `component/PortalWebPart`, …) se
sloupce `Old` a `New` **shodují** — skript nezměnil nic, co už identitu mělo.

## Část C — Datová vrstva (28 min)

### 5. Model a služba výpůjček (18 min)

Model popisuje jeden řádek `EquipmentLoans` — přesně tak, jak ho vrací REST z kroku 2.

Soubor `src/models/ILoan.ts` — **nový**:

```typescript
/**
 * One row of the EquipmentLoans list. Equipment is a lookup column:
 * read as the expanded object (Equipment/Title), written as the number EquipmentId.
 */
export interface ILoan {
  Id: number;
  EquipmentId: number;
  Equipment?: { Title: string };
  Borrower?: { Title: string; EMail: string };
  IssuedOn: string;
  /** Empty = the loan is still open (SharePoint returns null for an empty date). */
  ReturnedOn?: string;
}
```

Soubor `src/models/index.ts` — **změna**: najdi

```typescript
export { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from './IEquipmentItem';
```

a přidej za něj:

```typescript
export type { ILoan } from './ILoan';
```

`Borrower` je lookup taky (na uživatele webu) — stejný vzor jako `AssignedTo` ze dne 3.
Zapisované pole se proto bude jmenovat `BorrowerId`.

Služba čte oba seznamy a zapisuje výdej a vrácení.

Soubor `src/services/loanService.ts` — **nový**:

```typescript
import type { SPFI } from '@pnp/sp';
import type { HttpRequestError } from '@pnp/queryable';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/site-users/web';
import type { IEquipmentItem, ILoan } from '../models';
import { EQUIPMENT_LIST_URL, ListNotFoundError } from './equipmentService';

export const LOANS_LIST_URL: string = 'Lists/EquipmentLoans';

const LOAN_FIELDS: string[] = [
  'Id', 'EquipmentId', 'Equipment/Title', 'Borrower/Title', 'Borrower/EMail', 'IssuedOn', 'ReturnedOn'
];

export class NotAvailableError extends Error {
  public constructor(title: string) {
    super(`${title} is not available`);
  }
}

export interface ILoanService {
  getOpen(): Promise<ILoan[]>;
  getHistory(): Promise<ILoan[]>;
  getAvailable(): Promise<IEquipmentItem[]>;
  issue(equipmentId: number, email: string): Promise<void>;
  giveBack(loan: ILoan): Promise<void>;
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

export function createLoanService(sp: SPFI, webServerRelativeUrl: string): ILoanService {
  const web: string = webServerRelativeUrl.replace(/\/$/, '');
  const loansUrl: string = `${web}/${LOANS_LIST_URL}`;
  const equipmentUrl: string = `${web}/${EQUIPMENT_LIST_URL}`;

  const loans = (): ReturnType<typeof sp.web.getList> => sp.web.getList(loansUrl);

  return {
    getOpen(): Promise<ILoan[]> {
      return translateError(() => loans().items
        .select(...LOAN_FIELDS)
        .expand('Equipment', 'Borrower')
        .filter('ReturnedOn eq null')
        .orderBy('IssuedOn', false)
        .top(500)<ILoan[]>());
    },

    getHistory(): Promise<ILoan[]> {
      return translateError(() => loans().items
        .select(...LOAN_FIELDS)
        .expand('Equipment', 'Borrower')
        .orderBy('IssuedOn', false)
        .top(100)<ILoan[]>());
    },

    getAvailable(): Promise<IEquipmentItem[]> {
      return translateError(() => sp.web.getList(equipmentUrl).items
        .select('Id', 'Title', 'AssetTag', 'Category', 'Status')
        .filter("Status eq 'Available'")
        .orderBy('Title', true)
        .top(500)<IEquipmentItem[]>());
    },

    issue(equipmentId: number, email: string): Promise<void> {
      return translateError(async () => {
        // Read the current state first: the list may have changed since the page loaded.
        const item: IEquipmentItem = await sp.web.getList(equipmentUrl).items.getById(equipmentId)
          .select('Id', 'Title', 'Status')<IEquipmentItem>();
        if (item.Status !== 'Available') {
          throw new NotAvailableError(item.Title);
        }
        const user = await sp.web.ensureUser(email);

        // One HTTP request, but NOT a transaction: each write succeeds or fails on its own.
        const [batchedSP, execute] = sp.batched();
        const writes: Promise<unknown>[] = [
          batchedSP.web.getList(loansUrl).items.add({
            Title: item.Title,
            EquipmentId: equipmentId,
            BorrowerId: user.Id,
            IssuedOn: new Date().toISOString()
          }),
          batchedSP.web.getList(equipmentUrl).items.getById(equipmentId)
            .update({ Status: 'Issued', AssignedToId: user.Id })
        ];
        await execute();
        await Promise.all(writes);
      });
    },

    giveBack(loan: ILoan): Promise<void> {
      return translateError(async () => {
        const [batchedSP, execute] = sp.batched();
        const writes: Promise<unknown>[] = [
          batchedSP.web.getList(loansUrl).items.getById(loan.Id)
            .update({ ReturnedOn: new Date().toISOString() }),
          batchedSP.web.getList(equipmentUrl).items.getById(loan.EquipmentId)
            .update({ Status: 'Available', AssignedToId: null })
        ];
        await execute();
        await Promise.all(writes);
      });
    }
  };
}
```

Soubor `src/services/index.ts` — **změna**: najdi

```typescript
export { initSP } from './pnp';
```

a přidej za něj:

```typescript
export { createLoanService, LOANS_LIST_URL, NotAvailableError } from './loanService';
export type { ILoanService } from './loanService';
```

Čti kód, ne jen kopíruj:

- `select('Equipment/Title')` + `expand('Equipment')` = čtení lookupu, `EquipmentId` = zápis.
- `filter('ReturnedOn eq null')` běží na serveru — otevřené výpůjčky, ne všechny.
- `issue` nejdřív **znovu přečte** stav položky. Stránka může být otevřená půl hodiny a mezitím
  ten notebook vydal někdo jiný.
- `sp.batched()` znáš z `setStatus` (den 3): dva zápisy, jeden HTTP požadavek — **ne transakce**.

**Checkpoint:** `npm start -- --nobrowser` zkompiluje bez chyb (web part zatím službu nepoužívá).

### 6. Hook (10 min)

Stejný vzor jako `useEquipment` (den 3), jen čte tři věci najednou.

Soubor `src/hooks/useLoans.ts` — **nový**:

```typescript
import * as React from 'react';
import type { IEquipmentItem, ILoan } from '../models';
import { ListNotFoundError } from '../services/equipmentService';
import type { ILoanService } from '../services/loanService';

export interface IUseLoansResult {
  open: ILoan[];
  history: ILoan[];
  available: IEquipmentItem[];
  loading: boolean;
  error: string | undefined;
  listMissing: boolean;
  issue: (equipmentId: number, email: string) => Promise<void>;
  giveBack: (loan: ILoan) => Promise<void>;
}

export function useLoans(service: ILoanService): IUseLoansResult {
  const [open, setOpen] = React.useState<ILoan[]>([]);
  const [history, setHistory] = React.useState<ILoan[]>([]);
  const [available, setAvailable] = React.useState<IEquipmentItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [listMissing, setListMissing] = React.useState<boolean>(false);
  const [version, setVersion] = React.useState<number>(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    // Three independent reads in parallel: all tabs stay consistent after every write.
    Promise.all([service.getOpen(), service.getHistory(), service.getAvailable()]).then(
      ([openLoans, allLoans, availableItems]) => {
        if (!cancelled) {
          setOpen(openLoans);
          setHistory(allLoans);
          setAvailable(availableItems);
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
  }, [service, version]);

  const issue = React.useCallback(async (equipmentId: number, email: string): Promise<void> => {
    try {
      await service.issue(equipmentId, email);
    } finally {
      // Reload also after a failure: a half-done batch must be visible, not hidden.
      setVersion(v => v + 1);
    }
  }, [service]);

  const giveBack = React.useCallback(async (loan: ILoan): Promise<void> => {
    try {
      await service.giveBack(loan);
    } finally {
      setVersion(v => v + 1);
    }
  }, [service]);

  return { open, history, available, loading, error, listMissing, issue, giveBack };
}
```

Soubor `src/hooks/index.ts` — **změna**: najdi

```typescript
export type { IUseEquipmentResult } from './useEquipment';
```

a přidej za něj:

```typescript
export { useLoans } from './useLoans';
export type { IUseLoansResult } from './useLoans';
```

**Checkpoint:** umíš říct, proč je `setVersion` ve `finally`, ne až po úspěchu.

## Část D — Uživatelské rozhraní (35 min)

### 7. Formulář výdeje v panelu (15 min)

Vygenerované soubory v `src/webparts/equipmentDesk/components/` přepisuješ. Komponenta
dostane **dvě služby**, ne kontext SPFx.

Soubor `src/webparts/equipmentDesk/components/IEquipmentDeskProps.ts` — **nový obsah**
(vygenerovaný soubor přepiš celý):

```typescript
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { ILoanService } from '../../../services/loanService';
import type { IEmployeeService } from '../../../services/employeeService';

export interface IEquipmentDeskProps {
  loans: ILoanService;
  employees: IEmployeeService;
  listUrl: string;
  theme: IReadonlyTheme | undefined;
}
```

Panel hledá osobu přes `useEmployees` — **stejný hook jako Adresář zaměstnanců** ze dne 3,
včetně debounce a cache hledání.

Soubor `src/webparts/equipmentDesk/components/IssuePanel.tsx` — **nový**:

```typescript
import * as React from 'react';
import {
  ChoiceGroup,
  DefaultButton,
  Dropdown,
  type IChoiceGroupOption,
  MessageBar,
  MessageBarType,
  Panel,
  PrimaryButton,
  SearchBox,
  Spinner,
  Stack
} from '@fluentui/react';
import * as strings from 'EquipmentDeskWebPartStrings';
import type { IEquipmentItem } from '../../../models';
import type { IEmployeeService } from '../../../services/employeeService';
import { useDebounce } from '../../../hooks/useDebounce';
import { useEmployees } from '../../../hooks/useEmployees';

export interface IIssuePanelProps {
  isOpen: boolean;
  available: IEquipmentItem[];
  /** Item chosen in the Stock tab, if any. */
  equipmentId: number | undefined;
  employees: IEmployeeService;
  onIssue: (equipmentId: number, email: string) => Promise<void>;
  onDismiss: () => void;
}

export default function IssuePanel(props: IIssuePanelProps): JSX.Element {
  const { isOpen, available, employees, onIssue, onDismiss } = props;
  const [equipmentId, setEquipmentId] = React.useState<number | undefined>(props.equipmentId);
  const [query, setQuery] = React.useState<string>('');
  const [email, setEmail] = React.useState<string | undefined>(undefined);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // Every opening starts clean, with the item preselected from the Stock tab.
  React.useEffect(() => {
    if (isOpen) {
      setEquipmentId(props.equipmentId);
      setQuery('');
      setEmail(undefined);
      setError(undefined);
    }
  }, [isOpen, props.equipmentId]);

  const debouncedQuery: string = useDebounce(query, 300);
  const found = useEmployees(employees, debouncedQuery);

  // Only people with a mailbox can be resolved by ensureUser.
  const people: IChoiceGroupOption[] = found.employees
    .filter(e => !!e.mail)
    .slice(0, 8)
    .map(e => ({ key: e.mail as string, text: e.department ? `${e.displayName} (${e.department})` : e.displayName }));

  const issue = (): void => {
    if (!equipmentId || !email) {
      return;
    }
    setBusy(true);
    setError(undefined);
    onIssue(equipmentId, email).then(
      () => {
        setBusy(false);
        onDismiss();
      },
      (e: unknown) => {
        setBusy(false);
        setError(e instanceof Error ? e.message : String(e));
      }
    );
  };

  return (
    <Panel
      isOpen={isOpen}
      headerText={strings.IssuePanelTitle}
      onDismiss={onDismiss}
      closeButtonAriaLabel={strings.Close}
      onRenderFooterContent={() => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text={strings.IssueButton} onClick={issue} disabled={busy || !equipmentId || !email} />
          <DefaultButton text={strings.Cancel} onClick={onDismiss} />
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <Stack tokens={{ childrenGap: 12 }}>
        <Dropdown
          label={strings.EquipmentLabel}
          required
          placeholder={strings.EquipmentPlaceholder}
          options={available.map(item => ({ key: item.Id, text: `${item.Title} (${item.AssetTag})` }))}
          selectedKey={equipmentId}
          onChange={(_event, option) => setEquipmentId(option ? Number(option.key) : undefined)}
        />
        <SearchBox
          placeholder={strings.PersonSearchPlaceholder}
          value={query}
          onChange={(_event, value) => setQuery(value || '')}
        />
        {found.loading ? (
          <Spinner label={strings.Searching} />
        ) : (
          <ChoiceGroup
            label={strings.PersonLabel}
            required
            options={people}
            selectedKey={email}
            onChange={(_event, option) => setEmail(option ? String(option.key) : undefined)}
          />
        )}
        {(error || found.error) && (
          <MessageBar messageBarType={MessageBarType.error}>{error || found.error}</MessageBar>
        )}
      </Stack>
    </Panel>
  );
}
```

`Dropdown` nabízí **jen** vybavení skladem — to je první obrana proti výdeji vydaného kusu.
Druhá je kontrola ve službě (krok 5).

**Checkpoint:** soubor nemá chyby v editoru, kromě `EquipmentDeskWebPartStrings` — klíče
doplníš v kroku 8.

### 8. Aplikace s Pivot záložkami (15 min)

Lokalizaci nepiš ručně — ze [solution](solution/vltava-portal/src/webparts/equipmentDesk/loc/)
zkopíruj celé soubory `loc/mystrings.d.ts`, `loc/en-us.js` a `loc/cs-cz.js` přes vygenerované
(31 klíčů včetně `RenderError` z `diagnostics-hardening`).

Soubor `src/webparts/equipmentDesk/components/EquipmentDesk.module.scss` — **nový obsah**
(vygenerovaný soubor přepiš celý; stavové štítky *Vydáno* / *Vráceno*):

```scss
.desk {
  overflow: hidden;
  padding: 1em;
}

.title {
  margin-top: 0;
}

.message {
  margin: 8px 0;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.open {
  background: #deecf9;
  color: #004578;
}

.returned {
  background: #dff6dd;
  color: #107c10;
}
```

Soubor `src/webparts/equipmentDesk/components/EquipmentDesk.tsx` — **nový obsah**
(vygenerovaný soubor přepiš celý):

```typescript
import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  DefaultButton,
  type IColumn,
  Link,
  MessageBar,
  MessageBarType,
  Pivot,
  PivotItem,
  PrimaryButton,
  SelectionMode,
  Spinner,
  ThemeProvider,
  type PartialTheme
} from '@fluentui/react';
import * as strings from 'EquipmentDeskWebPartStrings';
import styles from './EquipmentDesk.module.scss';
import type { IEquipmentDeskProps } from './IEquipmentDeskProps';
import IssuePanel from './IssuePanel';
import type { IEquipmentItem, ILoan } from '../../../models';
import { useLoans } from '../../../hooks/useLoans';
import { NotAvailableError } from '../../../services/loanService';

function formatDate(value: string | undefined): string {
  return value ? new Date(value).toLocaleDateString() : '';
}

function LoanBadge(props: { loan: ILoan }): JSX.Element {
  const isOpen: boolean = !props.loan.ReturnedOn;
  return (
    <span className={`${styles.badge} ${isOpen ? styles.open : styles.returned}`}>
      {isOpen ? strings.BadgeOpen : strings.BadgeReturned}
    </span>
  );
}

export default function EquipmentDesk(props: IEquipmentDeskProps): JSX.Element {
  const { loans, employees, listUrl, theme } = props;
  const { open, history, available, loading, error, listMissing, issue, giveBack } = useLoans(loans);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [preselected, setPreselected] = React.useState<number | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);
  const [busyId, setBusyId] = React.useState<number | undefined>(undefined);

  const openPanel = (equipmentId?: number): void => {
    setPreselected(equipmentId);
    setPanelOpen(true);
  };

  const onIssue = async (equipmentId: number, email: string): Promise<void> => {
    try {
      await issue(equipmentId, email);
    } catch (e) {
      // Translate the one business error; everything else is shown as it came.
      throw e instanceof NotAvailableError ? new Error(strings.NotAvailable) : e;
    }
  };

  const onReturn = (loan: ILoan): void => {
    setBusyId(loan.Id);
    setActionError(undefined);
    giveBack(loan).then(
      () => setBusyId(undefined),
      (e: unknown) => {
        setBusyId(undefined);
        setActionError(e instanceof Error ? e.message : String(e));
      }
    );
  };

  const loanColumns: IColumn[] = [
    {
      key: 'equipment', name: strings.ColumnEquipment, minWidth: 160, isResizable: true,
      // Read side of the lookup: the expanded object, not the stored ID.
      onRender: (loan: ILoan) => loan.Equipment ? loan.Equipment.Title : `#${loan.EquipmentId}`
    },
    {
      key: 'borrower', name: strings.ColumnBorrower, minWidth: 140, isResizable: true,
      onRender: (loan: ILoan) => loan.Borrower ? loan.Borrower.Title : ''
    },
    { key: 'issued', name: strings.ColumnIssuedOn, minWidth: 90, onRender: (loan: ILoan) => formatDate(loan.IssuedOn) }
  ];

  const openColumns: IColumn[] = [
    ...loanColumns,
    {
      key: 'action', name: '', minWidth: 100,
      onRender: (loan: ILoan) => (
        <DefaultButton
          text={strings.ReturnButton}
          iconProps={{ iconName: 'Undo' }}
          disabled={busyId !== undefined}
          onClick={() => onReturn(loan)}
        />
      )
    }
  ];

  const historyColumns: IColumn[] = [
    ...loanColumns,
    { key: 'returned', name: strings.ColumnReturnedOn, minWidth: 90, onRender: (loan: ILoan) => formatDate(loan.ReturnedOn) },
    { key: 'state', name: strings.ColumnState, minWidth: 90, onRender: (loan: ILoan) => <LoanBadge loan={loan} /> }
  ];

  const stockColumns: IColumn[] = [
    { key: 'title', name: strings.ColumnEquipment, fieldName: 'Title', minWidth: 160, isResizable: true },
    { key: 'tag', name: strings.ColumnAssetTag, fieldName: 'AssetTag', minWidth: 90 },
    { key: 'category', name: strings.ColumnCategory, fieldName: 'Category', minWidth: 90 },
    {
      key: 'action', name: '', minWidth: 100,
      onRender: (item: IEquipmentItem) => (
        <DefaultButton text={strings.IssueButton} iconProps={{ iconName: 'Handwriting' }} onClick={() => openPanel(item.Id)} />
      )
    }
  ];

  if (listMissing) {
    return (
      <MessageBar messageBarType={MessageBarType.warning}>
        {strings.ListMissing} <Link href={listUrl} target="_blank" rel="noreferrer">{listUrl}</Link>
      </MessageBar>
    );
  }

  const list = (items: unknown[], columns: IColumn[], key: string): JSX.Element => (
    <DetailsList
      items={items}
      columns={columns}
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      setKey={key}
    />
  );

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.desk}>
      <h2 className={styles.title}>{strings.Title}</h2>

      <PrimaryButton text={strings.NewIssueButton} iconProps={{ iconName: 'Add' }} onClick={() => openPanel()} />

      {(error || actionError) && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.message}>
          {actionError || error}
        </MessageBar>
      )}

      {loading ? (
        <Spinner label={strings.Loading} className={styles.message} />
      ) : (
        <Pivot>
          <PivotItem headerText={strings.TabOpen} itemCount={open.length}>
            {open.length ? list(open, openColumns, 'open') : <p>{strings.EmptyOpen}</p>}
          </PivotItem>
          <PivotItem headerText={strings.TabStock} itemCount={available.length}>
            {available.length ? list(available, stockColumns, 'stock') : <p>{strings.EmptyStock}</p>}
          </PivotItem>
          <PivotItem headerText={strings.TabHistory}>
            {list(history, historyColumns, 'history')}
          </PivotItem>
        </Pivot>
      )}

      <IssuePanel
        isOpen={panelOpen}
        available={available}
        equipmentId={preselected}
        employees={employees}
        onIssue={onIssue}
        onDismiss={() => setPanelOpen(false)}
      />
    </ThemeProvider>
  );
}
```

**Checkpoint:** `import` ze `@fluentui/react` je **jeden pojmenovaný** — žádný barrel ze
`src/` s vedlejšími efekty (den 3, +32 121 B).

### 9. Třída web partu (5 min)

Vzor `EmployeeDirectoryWebPart` (Graph) + `EquipmentWebPart` (PnPjs) v jednom, obalený
`ErrorBoundary` z `diagnostics-hardening`.

Soubor `src/webparts/equipmentDesk/EquipmentDeskWebPart.ts` — **nový obsah** (vygenerovaný
soubor přepiš celý):

```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import type { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { MSGraphClientV3 } from '@microsoft/sp-http';

import * as strings from 'EquipmentDeskWebPartStrings';
import EquipmentDesk from './components/EquipmentDesk';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { IEquipmentDeskProps } from './components/IEquipmentDeskProps';
import { initSP } from '../../services/pnp';
import { createLoanService, type ILoanService } from '../../services/loanService';
import { createEmployeeService, type IEmployeeService } from '../../services/employeeService';

// No configurable properties: both lists are fixed by URL.
export type IEquipmentDeskWebPartProps = Record<string, never>;

export default class EquipmentDeskWebPart extends BaseClientSideWebPart<IEquipmentDeskWebPartProps> {

  private _loans: ILoanService | undefined;
  private _employees: IEmployeeService | undefined;
  private _theme: IReadonlyTheme | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    // Two services, two sources: SharePoint lists (PnPjs) and the directory (Graph).
    this._loans = createLoanService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
    const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    this._employees = createEmployeeService(client);
  }

  public render(): void {
    if (!this._loans || !this._employees) {
      return;
    }
    const component: React.ReactElement<IEquipmentDeskProps> = React.createElement(
      EquipmentDesk,
      {
        loans: this._loans,
        employees: this._employees,
        listUrl: `${this.context.pageContext.web.absoluteUrl}/Lists/EquipmentLoans`,
        theme: this._theme
      }
    );

    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaEquipmentDesk', fallbackText: strings.RenderError }, component);

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

Smaž vygenerovanou složku `src/webparts/equipmentDesk/assets/` (uvítací obrázky šablony) —
nová třída na ni neodkazuje:

```powershell
Remove-Item .\src\webparts\equipmentDesk\assets -Recurse
```

**Checkpoint:** `npm run build` projde — lint bez varování a **všechny** testy zelené, včetně
testu parity překladů pro nový `loc/` (`Successes: 17`).

## Část E — Výdej, vrácení a příkaz ze dne 4 (15 min)

### 10. Vyzkoušej výdej a vrácení (10 min)

`npm start`, testovací stránka vlastního webu s debug query stringem (jako den 3) → přidej
**Vltava Equipment Desk (<ini>)**.

1. Záložka **Skladem** → u libovolného kusu **Vydat** → najdi kolegu (stačí 2–3 písmena) →
   **Vydat**.
2. Záložka **Vydáno** → u téže položky **Vrátit**.

**Checkpoint:** po výdeji je kus v záložce *Vydáno* s dnešním datem a jménem kolegy; v seznamu
`Equipment` má stav *Issued* a kolegu v *AssignedTo*. Po vrácení je v *Historii* se štítkem
*Vráceno* a v `Equipment` znovu *Available*. F12 → Network: výdej = **jeden** požadavek
`$batch` (plus čtení stavu a `ensureuser` před ním).

**Checkpoint (negativní):** otevři stránku ve **dvou** záložkách prohlížeče. V obou otevři
panel výdeje pro **stejný** kus; v první vydej. Ve druhé dej **Vydat** — musí skončit hláškou
*Toto vybavení už není skladem* a v `EquipmentLoans` **nesmí** přibýt druhá otevřená výpůjčka.

### 11. Ať historie sedí i z příkazu „Vydat zařízení" (5 min)

Command Set ze dne 4 mění `Equipment`, ale výpůjčku nezapíše — historie by lhala. Vyměň mu
službu za `loanService`.

Soubor `src/extensions/issueEquipment/IssueEquipmentCommandSet.ts` — **změna**: najdi

```typescript
import { createEquipmentService, EQUIPMENT_LIST_URL, type IEquipmentService } from '../../services/equipmentService';
```

a nahraď:

```typescript
import { EQUIPMENT_LIST_URL } from '../../services/equipmentService';
import { createLoanService, type ILoanService } from '../../services/loanService';
```

Soubor `src/extensions/issueEquipment/IssueEquipmentCommandSet.ts` — **změna**: najdi

```typescript
  private _service: IEquipmentService | undefined;
```

a nahraď:

```typescript
  private _service: ILoanService | undefined;
```

Soubor `src/extensions/issueEquipment/IssueEquipmentCommandSet.ts` — **změna**: najdi

```typescript
    this._service = createEquipmentService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
```

a nahraď:

```typescript
    // Issue through the loan service: the same write as the Equipment desk, so history stays complete.
    this._service = createLoanService(initSP(this.context), this.context.pageContext.web.serverRelativeUrl);
```

Volání `this._service.issue(id, email)` zůstává — `ILoanService` má metodu se stejným tvarem.
Tohle je výhoda služby místo kódu v komponentě: druhé místo, které vydává, nic nového nepíše.

**Checkpoint:** `npm run build` projde. Velikost `issue-equipment-command-set` vzroste
(o `loanService`) — o kolik, ukáže krok 12.

## Část F — Verze 1.2.0.0 a nasazení (15 min)

### 12. Změř, zvyš verzi a nasaď (15 min)

```powershell
npm run build
& "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" -ProjectPath . -MaxBytes 500000
```

Soubor `package.json` — **změna**: najdi

```json
  "version": "1.1.0",
```

a nahraď:

```json
  "version": "1.2.0",
```

Soubor `config/package-solution.json` — **změna**: najdi (verze **řešení**, ne feature)

```json
    "version": "1.1.0.0",
    "includeClientSideAssets": true,
```

a nahraď:

```json
    "version": "1.2.0.0",
    "includeClientSideAssets": true,
```

**Verzi feature nech `1.1.0.0`** — nová verze nepřidává žádné elementy; vyšší verze feature
by znovu spustila upgrade action ze dne 4.

Nasazení a aktualizace aplikace na webu: kroky 4, 5 a 7 z
[`lab-verze-a-upgrade.md`](../../day-4/packaging-deployment/lab-verze-a-upgrade.md)
(s verzí 1.2.0.0).

Nakonec aplikace na celou stránku: web `spodev-<ini>` → **New** → **Page** → v nabídce šablon
**Apps** → **Vltava Equipment Desk (<ini>)** → název stránky *Vydejna* → **Publish**.

**Checkpoint:** brána velikosti `exit 0` (referenční řešení: `equipment-desk-web-part`
469 664 B). Stránka *Vydejna* ukazuje jen Výdejnu, bez sekcí a bez tlačítka **Edit**, a běží
**bez** `localhost`. Příkaz **Vydat zařízení** v seznamu `Equipment` teď přidá řádek
do `EquipmentLoans`.

## Bonusy — pro rychlé, v libovolném pořadí

Bonusy nejsou ve Výstupním stavu — `solution/` končí krokem 12.

### B1. Teams tab

Manifest už má `TeamsTab`. App Catalog → řádek řešení → **Sync to Teams** → v týmu kurzu
přidej záložku **Vltava Equipment Desk (<ini>)**.

**Checkpoint:** Výdejna běží v Teams a výdej z Teams se objeví v seznamu na webu.

### B2. Filtr „moje oddělení"

Přidej do záložky *Vydáno* přepínač, který ukáže jen výpůjčky lidí z tvého oddělení
(`department` z Graph `/me`). Hodnotu do OData filtru **nikdy** neskládej interpolací bez
ošetření apostrofu (`'` → `''`) — `O'Brien` jinak rozbije dotaz.

**Checkpoint:** umíš vysvětlit, proč to **není** bezpečnostní hranice (kdo má přístup
k seznamu, přečte ho přes REST celý). V kurzovním tenantu je `department` většinou prázdný —
prázdný výsledek je v pořádku.

### B3. Napůl hotový výdej

`$batch` není transakce. Navrhni (stačí do `README.md` projektu), jak by Výdejna poznala a
opravila stav „`Equipment` je *Issued*, ale žádná otevřená výpůjčka neexistuje". Kdo to umí
v kódu: záložka *Nesoulad* nad daty, která už hook načetl.

**Checkpoint:** návrh má podmínku, kdy nesoulad vzniká, a kdo ho smí opravit.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/) — finální stav kurzu,
verze 1.2.0.0. Proti Startovní čáře se změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/webparts/equipmentDesk/EquipmentDeskWebPart.manifest.json` | nový (`yo`) | full-page a Teams host, titulek s iniciálami ze skriptu |
| `config/config.json` | změněný (`yo`) | bundle `equipment-desk-web-part` a `EquipmentDeskWebPartStrings` |
| `src/models/ILoan.ts`, `src/models/index.ts` | nový / změněný | model řádku `EquipmentLoans` |
| `src/services/loanService.ts`, `src/services/index.ts` | nový / změněný | čtení a zápis výdeje a vrácení přes `$batch` |
| `src/hooks/useLoans.ts`, `src/hooks/index.ts` | nový / změněný | tři čtení paralelně, reload po každém zápisu |
| `src/webparts/equipmentDesk/components/IEquipmentDeskProps.ts` | nový | dvě služby místo kontextu SPFx |
| `src/webparts/equipmentDesk/components/IssuePanel.tsx` | nový | formulář výdeje v `Panel` |
| `src/webparts/equipmentDesk/components/EquipmentDesk.tsx`, `.module.scss` | nový | `Pivot` se záložkami Vydáno / Skladem / Historie |
| `src/webparts/equipmentDesk/EquipmentDeskWebPart.ts` | nový | Graph + PnPjs, `ErrorBoundary` |
| `src/webparts/equipmentDesk/loc/*` | nový (kopie ze solution) | 31 klíčů, cs-CZ a en-US |
| `src/extensions/issueEquipment/IssueEquipmentCommandSet.ts` | změněný | příkaz vydává přes `loanService`, historie je úplná |
| `package.json`, `config/package-solution.json` | změněný | verze 1.2.0 / řešení 1.2.0.0, feature zůstává 1.1.0.0 |

Tento stav je vstupem bloků [`spfx-whats-next`](../spfx-whats-next/) a
[`capstone`](../capstone/). Kdo Výdejnu nedokončil, převezme ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution) a nasadí
krokem 12.

## Ověření

- [ ] Seznam `EquipmentLoans` vznikl skriptem; opakované spuštění nic nezdvojí.
- [ ] Nový web part má po `Set-StudentIdentity.ps1` vlastní ID a titulek s iniciálami.
- [ ] Výdej a vrácení z Výdejny mění **oba** seznamy; historie má štítky *Vydáno* / *Vráceno*.
- [ ] Příkaz **Vydat zařízení** zapisuje výpůjčku taky.
- [ ] Verze řešení 1.2.0.0 z App Catalogu, stránka *Vydejna* jako aplikace na celou stránku.
- [ ] Brána velikosti prošla, číslo máš zapsané pro capstone.
- [ ] **Negativní:** druhý výdej téhož kusu skončil hláškou a nepřidal výpůjčku.
- [ ] **Negativní:** skript identity v kroku 4 nezměnil ID, která už projekt měl.

## Fallback

- **Skript končí „List Lists/Equipment not found":** nejdřív `New-EquipmentList.ps1` (den 3).
- **Lookup sloupec chybí nebo ukazuje jinam:** smaž seznam `EquipmentLoans` a spusť skript
  znovu — lookup se po vytvoření na jiný seznam přesměrovat nedá.
- **`Set-StudentIdentity.ps1` odmítne běžet („Project already belongs to …"):** spouštíš ho
  s jinými iniciálami, než jaké projekt má v `.student-identity` — použij ty původní.
- **V panelu nejsou lidé:** Graph `/users` potřebuje schválené `User.Read.All` (den 3); ve
  `found.error` je důvod.
- **V nabídce šablon stránky chybí Apps:** stránku vytvoř normálně s web partem a přepni ji
  PnP PowerShellem (`Connect-PnPOnline ... -ClientId <client-id-od-lektora>`, pak
  `Set-PnPPage -Identity Vydejna -LayoutType SingleWebPartAppPage`).
- **Při časové tísni:** převezmi Výstupní stav ze [solution](solution/vltava-portal/) podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution) (a hned `Set-StudentIdentity.ps1`!)
  a dokonči jen krok 12.

## Zdroje (Microsoft)

- [Working with lists and list items with REST](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)
- [Single part app pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/single-part-app-pages)
- [Use @pnp/sp (PnPjs) with SPFx web parts](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-sp-pnp-js-with-spfx-web-parts)
