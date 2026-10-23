# Lab · Adresář zaměstnanců nad Microsoft Graph

> Modul: `data-access-clients` · Odhad: 50 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Druhý web part řešení — Adresář zaměstnanců s vyhledáváním přes Microsoft Graph — a změřené,
co z adresáře uvidí **před** schválením oprávnění.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Řešení `vltava-portal-<ini>` ve stavu po dni 2, server zastavený.
- Iniciály `<ini>` od lektora (tytéž jako v pondělí).

## Startovní čára

Lab začíná u stavu po modulu [`react-fluent-ui`](../../day-2/react-fluent-ui/): referenční kód
[`../../day-2/react-fluent-ui/solution/vltava-portal/`](../../day-2/react-fluent-ui/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde, ve `src/webparts/` je jen složka `portal` a v kořeni
projektu je soubor `.student-identity` s tvými iniciálami.

## Část A — Nový web part a jeho identita (10 min)

### 1. Přidej do řešení nový web part

Generátor přidá komponentu do **existujícího** řešení: novou složku, nový bundle v
`config/config.json` a ikony pro Teams. Řešení samo (`package-solution.json`) nechá být.
V kořeni projektu:

```powershell
yo @microsoft/sharepoint `
    --component-type webpart `
    --component-name EmployeeDirectory `
    --framework react `
    --skip-install `
    --no-insight
```

**Checkpoint:** `config/config.json` má nový bundle `employee-directory-web-part` a klíč
`EmployeeDirectoryWebPartStrings`, existuje složka `src/webparts/employeeDirectory`
a ve `teams/` přibyly dva soubory `<nové-id>_color.png` a `<nové-id>_outline.png`.
Generátor **nezměnil** `package-solution.json`. V `.yo-rc.json` se změnilo `componentName`,
`isCreatingSolution` a podle tvého Node.js i `nodeVersion`.

### 2. Dej nové komponentě svou identitu

Generátor dal web partu **náhodné** ID. Na sdíleném tenantu musí mít tvoje komponenta ID
odvozené z tvých iniciál — stejné, jaké by měla v kódu převzatém ze `solution/`. Skript je
idempotentní: na Rozcestníku a řešení nic nezmění, přemapuje jen nové ID.

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
```

**Checkpoint:** výpis obsahuje řádek `component/EmployeeDirectoryWebPart` a v seznamu změn
je `EmployeeDirectoryWebPart.manifest.json` a přejmenované ikony ve `teams/`. Titulek v
manifestu je `EmployeeDirectory (<ini>)`.

**Checkpoint (negativní):** řádky `solution` a `component/PortalWebPart` mají ve sloupcích
`Old` a `New` **totéž** ID — řešení i Rozcestník zůstaly tvoje.

### 3. Doinstaluj typy Microsoft Graph

Služba bude pracovat s typem `User` z Graphu. Typy nejsou kód — do balíčku se nedostanou,
proto `--save-dev`.

```powershell
npm install @microsoft/microsoft-graph-types@2.43.1 --save-dev --save-exact
```

**Checkpoint:** `package.json` má v `devDependencies` řádek
`"@microsoft/microsoft-graph-types": "2.43.1"` (bez `^`).

## Část B — Model, služba a hooky (15 min)

Data tečou ve třech vrstvách ze dne 2: **služba** zná Graph, **hook** drží stav pro React,
**komponenta** jen kreslí. Komponenta proto nikdy neuvidí `this.context`.

### 4. Model zaměstnance

Jen pole, která Adresář zobrazuje — menší odpověď a jasnější příběh oprávnění.

Soubor `src/models/IEmployee.ts` — **nový**:

```typescript
export interface IEmployee {
  id: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  mail?: string;
  businessPhones: string[];
}

/** Graph presence availability, e.g. Available, Busy, Away, Offline. */
export type PresenceMap = Record<string, string>;
```

Soubor `src/models/index.ts` — **změna**: najdi

```typescript
export type { IPortalLink } from './IPortalLink';
```

a přidej za něj:

```typescript
export type { IEmployee, PresenceMap } from './IEmployee';
```

**Checkpoint:** `PresenceMap` je obyčejný slovník `id -> availability`; model neimportuje nic
z Graphu ani ze SPFx.

### 5. Služba nad Graphem

Služba dostane hotového klienta `MSGraphClientV3` — web part ho vytvoří jednou a službě ho
předá. Tak jde služba později testovat s podvrženým klientem.

Soubor `src/services/employeeService.ts` — **nový**:

```typescript
import type { MSGraphClientV3 } from '@microsoft/sp-http';
import type { User } from '@microsoft/microsoft-graph-types';
import type { IEmployee, PresenceMap } from '../models';

// Only the fields the directory shows: smaller response, clearer permission story.
const SELECT_FIELDS: string = 'id,displayName,jobTitle,department,mail,businessPhones';
const PAGE_SIZE: number = 25;

export interface IEmployeeService {
  search(query: string): Promise<IEmployee[]>;
  getPresence(ids: string[]): Promise<PresenceMap>;
}

function toEmployee(user: User): IEmployee {
  return {
    id: user.id || '',
    displayName: user.displayName || '',
    jobTitle: user.jobTitle || undefined,
    department: user.department || undefined,
    mail: user.mail || undefined,
    businessPhones: user.businessPhones || []
  };
}

export function createEmployeeService(client: MSGraphClientV3): IEmployeeService {
  return {
    async search(query: string): Promise<IEmployee[]> {
      // $search and $count are "advanced queries": they need the ConsistencyLevel header.
      let request = client
        .api('/users')
        .header('ConsistencyLevel', 'eventual')
        .count(true)
        .select(SELECT_FIELDS)
        .orderby('displayName')
        .top(PAGE_SIZE);

      const needle: string = query.replace(/"/g, '').trim();
      if (needle) {
        request = request.search(`"displayName:${needle}"`);
      }

      const response: { value: User[] } = await request.get();
      return response.value.map(toEmployee);
    },

    async getPresence(ids: string[]): Promise<PresenceMap> {
      if (ids.length === 0) {
        return {};
      }
      // Needs the Presence.Read.All delegated permission; throws 403 when not granted.
      const response: { value: { id: string; availability: string }[] } = await client
        .api('/communications/getPresencesByUserId')
        .post({ ids });
      const presence: PresenceMap = {};
      response.value.forEach(item => {
        presence[item.id] = item.availability;
      });
      return presence;
    }
  };
}
```

- `$search` a `$count` jsou v Graphu *advanced queries*: bez hlavičky
  `ConsistencyLevel: eventual` vrátí 400.
- Hledaný text jde do `$search` **v uvozovkách** (`"displayName:jan"`); uvozovky z vstupu se
  proto nejdřív odstraní.
- `getPresence` volá `/communications/getPresencesByUserId` — bez schváleného
  `Presence.Read.All` skončí chybou. Co s ní, řeší hook.

**Checkpoint:** v `employeeService.ts` není žádný import z `@fluentui/react` ani z
`@microsoft/sp-webpart-base` — služba nezná UI ani web part.

### 6. Hooky: debounce a načítání zaměstnanců

`useDebounce` (převzato z learn-spfx-growth) vrátí hodnotu, až se přestane měnit — jinak by
každé písmeno bylo jedno volání Graphu.

Soubor `src/hooks/useDebounce.ts` — **nový**:

```typescript
import * as React from 'react';

/** Returns the value only after it stopped changing for `delay` ms. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

`useEmployees` načte lidi a **potom** dostupnost. Když dostupnost selže, adresář funguje dál
a hook jen nastaví `presenceAvailable: false`.

Soubor `src/hooks/useEmployees.ts` — **nový**:

```typescript
import * as React from 'react';
import type { IEmployee, PresenceMap } from '../models';
import type { IEmployeeService } from '../services/employeeService';

export interface IUseEmployeesResult {
  employees: IEmployee[];
  presence: PresenceMap;
  /** false when presence could not be loaded (typically permission not granted). */
  presenceAvailable: boolean;
  loading: boolean;
  error: string | undefined;
}

export function useEmployees(service: IEmployeeService, query: string): IUseEmployeesResult {
  const [employees, setEmployees] = React.useState<IEmployee[]>([]);
  const [presence, setPresence] = React.useState<PresenceMap>({});
  const [presenceAvailable, setPresenceAvailable] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    // Ignore responses of searches that were superseded by a newer query.
    let cancelled = false;
    setLoading(true);
    setError(undefined);

    const load = async (): Promise<void> => {
      try {
        const found: IEmployee[] = await service.search(query);
        if (cancelled) {
          return;
        }
        setEmployees(found);
        setLoading(false);
        try {
          const map: PresenceMap = await service.getPresence(found.map(e => e.id));
          if (!cancelled) {
            setPresence(map);
            setPresenceAvailable(true);
          }
        } catch {
          // Degrade gracefully: the directory works, presence is just not shown.
          if (!cancelled) {
            setPresenceAvailable(false);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    };
    load().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [service, query]);

  return { employees, presence, presenceAvailable, loading, error };
}
```

Soubor `src/hooks/index.ts` — **změna**: najdi

```typescript
export { useFilteredLinks } from './useFilteredLinks';
```

a přidej za něj:

```typescript
export { useDebounce } from './useDebounce';
export { useEmployees } from './useEmployees';
export type { IUseEmployeesResult } from './useEmployees';
```

- `cancelled` zahazuje odpovědi starších hledání: když odpověď na `ja` dorazí až po odpovědi
  na `jan`, nepřepíše ji.
- Hook importuje ze služby jen **typ** (`import type`) — do Rozcestníku, který importuje
  barrel `hooks`, se tím Graph nedostane.

**Checkpoint:** `src/hooks/index.ts` má 4 řádky a `useEmployees.ts` nikde nevolá
`msGraphClientFactory`.

## Část C — Web part Adresář (15 min)

Generátor v kroku 1 vytvořil kostru web partu s ukázkovým obsahem. Soubory v této části proto
**celé nahrazuješ** — kromě manifestu, který nese ID tvé komponenty.

### 7. Texty

Soubor `src/webparts/employeeDirectory/loc/mystrings.d.ts` — **změna**, nahraď celý obsah:

```typescript
declare interface IEmployeeDirectoryWebPartStrings {
  PropertyPaneDescription: string;
  DisplayGroupName: string;
  ShowPresenceFieldLabel: string;
  Title: string;
  SearchPlaceholder: string;
  Loading: string;
  LoadError: string;
  NoResults: string;
  PresenceNotAvailable: string;
}

declare module 'EmployeeDirectoryWebPartStrings' {
  const strings: IEmployeeDirectoryWebPartStrings;
  export = strings;
}
```

Soubory s texty **zkopíruj ze solution** (nejsou podstatou labu a čeština do nich nepatří
psát ručně):

```powershell
$from = "$HOME\gopas-spo_dev_1\day-3\data-access-clients\solution\vltava-portal\src\webparts\employeeDirectory\loc"
Copy-Item "$from\en-us.js", "$from\cs-cz.js" .\src\webparts\employeeDirectory\loc\ -Force
```

`cs-cz.js` je **nový** soubor — generátor vytváří jen `en-us.js`.

**Checkpoint:** ve složce `loc/` jsou tři soubory a oba `.js` mají 9 klíčů, stejných jako
`mystrings.d.ts`.

### 8. Komponenta

Soubor `src/webparts/employeeDirectory/components/IEmployeeDirectoryProps.ts` — **změna**,
nahraď celý obsah:

```typescript
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IEmployeeService } from '../../../services/employeeService';

export interface IEmployeeDirectoryProps {
  service: IEmployeeService;
  showPresence: boolean;
  theme: IReadonlyTheme | undefined;
}
```

Soubor `src/webparts/employeeDirectory/components/EmployeeDirectory.module.scss` — **změna**,
nahraď celý obsah:

```scss
.employeeDirectory {
  overflow: hidden;
  padding: 1em;
}

.title {
  margin-top: 0;
}

.message {
  margin: 8px 0;
}

.list {
  list-style: none;
  padding-left: 0;
  margin-top: 12px;
}

.item {
  margin-bottom: 12px;
}
```

Soubor `src/webparts/employeeDirectory/components/EmployeeDirectory.tsx` — **změna**, nahraď
celý obsah:

```tsx
import * as React from 'react';
import {
  MessageBar,
  MessageBarType,
  Persona,
  PersonaPresence,
  PersonaSize,
  SearchBox,
  Spinner,
  ThemeProvider,
  type PartialTheme
} from '@fluentui/react';
import * as strings from 'EmployeeDirectoryWebPartStrings';
import styles from './EmployeeDirectory.module.scss';
import type { IEmployeeDirectoryProps } from './IEmployeeDirectoryProps';
import type { IEmployee } from '../../../models';
import { useDebounce } from '../../../hooks/useDebounce';
import { useEmployees } from '../../../hooks/useEmployees';

// Graph availability -> Fluent UI persona presence.
function toPersonaPresence(availability: string | undefined): PersonaPresence {
  switch (availability) {
    case 'Available':
    case 'AvailableIdle':
      return PersonaPresence.online;
    case 'Busy':
    case 'BusyIdle':
      return PersonaPresence.busy;
    case 'DoNotDisturb':
      return PersonaPresence.dnd;
    case 'Away':
    case 'BeRightBack':
      return PersonaPresence.away;
    case 'Offline':
      return PersonaPresence.offline;
    default:
      return PersonaPresence.none;
  }
}

export default function EmployeeDirectory(props: IEmployeeDirectoryProps): JSX.Element {
  const { service, showPresence, theme } = props;
  const [query, setQuery] = React.useState<string>('');
  // Wait until the user stops typing; every keystroke would be a Graph request.
  const debouncedQuery: string = useDebounce(query, 400);
  const { employees, presence, presenceAvailable, loading, error } = useEmployees(service, debouncedQuery);

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.employeeDirectory}>
      <h2 className={styles.title}>{strings.Title}</h2>
      <SearchBox
        placeholder={strings.SearchPlaceholder}
        ariaLabel={strings.SearchPlaceholder}
        value={query}
        onChange={(_event, newValue) => setQuery(newValue || '')}
      />

      {showPresence && !presenceAvailable && (
        <MessageBar messageBarType={MessageBarType.info} className={styles.message}>
          {strings.PresenceNotAvailable}
        </MessageBar>
      )}

      {error && (
        <MessageBar messageBarType={MessageBarType.error} className={styles.message}>
          {strings.LoadError} {error}
        </MessageBar>
      )}

      {loading && <Spinner label={strings.Loading} className={styles.message} />}

      {!loading && !error && employees.length === 0 && <p>{strings.NoResults}</p>}

      <ul className={styles.list} aria-busy={loading}>
        {employees.map((employee: IEmployee) => (
          <li key={employee.id} className={styles.item}>
            <Persona
              text={employee.displayName}
              secondaryText={[employee.jobTitle, employee.department].filter(Boolean).join(' | ')}
              tertiaryText={employee.businessPhones[0] || employee.mail}
              size={PersonaSize.size48}
              presence={showPresence && presenceAvailable ? toPersonaPresence(presence[employee.id]) : PersonaPresence.none}
            />
          </li>
        ))}
      </ul>
    </ThemeProvider>
  );
}
```

- Komponenta dostane **službu**, ne SPFx kontext — o Graphu neví nic.
- Hooky importuje přímo ze souborů (`hooks/useDebounce`, `hooks/useEmployees`), ne z barrelu.
- Pruh `PresenceNotAvailable` se ukáže jen tehdy, když dostupnost zapnutá v property pane
  selhala — to je fallback, který v `permissions-consent` uvidíš na stránce.

**Checkpoint:** `EmployeeDirectory.tsx` neobsahuje `this.context` ani `msGraphClientFactory`.

### 9. Web part

Web part v `onInit` jednou vytvoří klienta Graphu (`getClient('3')`) a z něj službu. `render`
čeká, až služba existuje.

Soubor `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.ts` — **změna**, nahraď celý
obsah:

```typescript
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { MSGraphClientV3 } from '@microsoft/sp-http';

import * as strings from 'EmployeeDirectoryWebPartStrings';
import EmployeeDirectory from './components/EmployeeDirectory';
import type { IEmployeeDirectoryProps } from './components/IEmployeeDirectoryProps';
import { createEmployeeService, type IEmployeeService } from '../../services/employeeService';

export interface IEmployeeDirectoryWebPartProps {
  showPresence: boolean;
}

export default class EmployeeDirectoryWebPart extends BaseClientSideWebPart<IEmployeeDirectoryWebPartProps> {

  private _service: IEmployeeService | undefined;
  private _theme: IReadonlyTheme | undefined;

  protected async onInit(): Promise<void> {
    await super.onInit();
    // The Graph client is created once; the component gets a service, not the SPFx context.
    const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    this._service = createEmployeeService(client);
  }

  public render(): void {
    if (!this._service) {
      return;
    }
    const element: React.ReactElement<IEmployeeDirectoryProps> = React.createElement(
      EmployeeDirectory,
      {
        service: this._service,
        showPresence: this.properties.showPresence,
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
          groups: [
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneToggle('showPresence', {
                  label: strings.ShowPresenceFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
```

**Checkpoint:** jediné místo v projektu, kde se objevuje `msGraphClientFactory`, je tento
soubor:

```powershell
Get-ChildItem .\src -Recurse -File | Select-String msGraphClientFactory -List | Select-Object Path
```

vypíše jediný řádek s `EmployeeDirectoryWebPart.ts`.

### 10. Manifest: titulek, ikona a výchozí vlastnost

V manifestu měníš **jen** pole `preconfiguredEntries` — `id` nahoře je ID tvé komponenty
z kroku 2 a nesmí se přepsat. Otevři
[`solution/.../EmployeeDirectoryWebPart.manifest.json`](solution/vltava-portal/src/webparts/employeeDirectory/EmployeeDirectoryWebPart.manifest.json),
zkopíruj z něj celé pole `"preconfiguredEntries": [ ... ]` (titulky jsou s diakritikou)
a nahraď jím totéž pole ve svém `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.manifest.json`.

| Klíč v `preconfiguredEntries[0]` | Po generátoru | Po změně |
|---|---|---|
| `title` | `EmployeeDirectory (<ini>)` | anglický a český titulek *Vltava Employee Directory* / *Adresář zaměstnanců Vltava* |
| `description` | `EmployeeDirectory description` | anglický a český popis |
| `officeFabricIconFontName` | `Page` | `People` |
| `properties` | `description` | `showPresence: true` |

Zkopírované titulky nemají příponu s iniciálami — doplní ji znovu skript:

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
npm run build
```

**Checkpoint:** skript hlásí jedinou změnu `EmployeeDirectoryWebPart.manifest.json (title
suffix)`, oba titulky končí ` (<ini>)` a `id` v manifestu je stejné jako po kroku 2.
`npm run build` projde bez chyb.

## Část D — Měření bez schválení (10 min)

> [!WARNING] Hosted workbench končí 2026-12-01
> SPFx 1.23 je podle release notes **poslední verze s podporou** hosted workbenche: je
> deprecated od 2026-05-13 a 2026-12-01 se retiruje
> ([SPFx v1.23.0 release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.0#deprecations)).
> **Po tomto datu nebo v projektu na SPFx 1.24+** udělej kroky 11–13 na testovací stránce svého
> webu s parametry `?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`
> (postup: [`first-webpart`, krok 9](../../day-1/first-webpart/lab-prvni-webpart.md#9-otestuj-na-skutečné-stránce)).

### 11. Změř, co Adresář vidí bez schválení

`npm start`, workbench vlastního webu + query string → web part **Vltava Employee Directory
(<ini>)**. Vyplň tabulku a nahlas ji lektorovi:

| Otázka | Výsledek |
|---|---|
| Zobrazí se seznam zaměstnanců? (ano / chyba + kód) | |
| Je u lidí vidět oddělení a telefon? | |
| Zobrazí se hláška o nedostupné dostupnosti (presence)? | |

**Checkpoint:** tabulka vyplněná. Žádná odpověď není „špatná" — je to měření výchozího stavu
tenantu, se kterým pracuje blok `permissions-consent`.

### 12. Ověř debounce

F12 → **Network**, filtr `users`. Napiš do hledání rychle `jan` a počkej.

**Checkpoint (negativní):** po dopsání odešel **jeden** požadavek na `/users`, ne tři (jeden
na každé písmeno).

### 13. Porovnej dvě cesty k datům

Ve stejném panelu Network najdi:

1. požadavek na `graph.microsoft.com/v1.0/users` — záložka *Headers*,
2. požadavek na `/_api/web/lists` z property pane Rozcestníku (otevři jeho property pane).

**Checkpoint:** požadavek na Graph má hlavičku `Authorization: Bearer …` a `ConsistencyLevel:
eventual`; požadavek na `/_api/…` žádný `Authorization` nemá — jede na relaci SharePointu.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `.yo-rc.json` | změněný (generátor) | `componentName`, `isCreatingSolution: false`; `nodeVersion` podle stroje |
| `config/config.json` | změněný (generátor) | bundle `employee-directory-web-part` a jeho texty |
| `package.json` | změněný | typy `@microsoft/microsoft-graph-types` v `devDependencies` |
| `teams/<id>_color.png`, `teams/<id>_outline.png` | nové (generátor) | ikony nové komponenty, jméno nese její ID |
| `src/models/IEmployee.ts`, `src/models/index.ts` | nový, změněný | model zaměstnance a dostupnosti |
| `src/services/employeeService.ts` | nový | `$select`, `$search`, `ConsistencyLevel`, presence |
| `src/hooks/useDebounce.ts`, `src/hooks/useEmployees.ts`, `src/hooks/index.ts` | nové, změněný | debounce, zahazování starých odpovědí, fallback presence |
| `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.ts` | nový | klient Graphu jednou v `onInit`, toggle `showPresence` |
| `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.manifest.json` | nový | `preconfiguredEntries` z kroku 10, ID z kroku 2 |
| `src/webparts/employeeDirectory/components/*` | nové | `SearchBox`, `Persona`, pruh fallbacku |
| `src/webparts/employeeDirectory/loc/*` | nové | 9 textů, angličtina a čeština |
| `src/webparts/employeeDirectory/assets/*` | nové (generátor) | beze změny po generátoru |

V `solution/` nesou manifest a ikony **šablonová ID kurzu** a titulky jsou bez iniciál —
tvůj projekt má po krocích 2 a 10 svoje.

Tento stav je **Startovní čárou** modulu [`permissions-consent`](../permissions-consent/). Když
ti něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution) a do dalšího
bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Řešení má web part Adresář zaměstnanců se stejným `solution.id` jako ráno.
- [ ] Nová komponenta má ID ze `Set-StudentIdentity.ps1` a oba titulky končí ` (<ini>)`.
- [ ] Hledání volá Graph s `$select`, `$search` a `ConsistencyLevel`.
- [ ] Tabulka výchozího stavu oprávnění je vyplněná a předaná lektorovi.
- [ ] **Negativní:** psaní v hledání nevyvolá požadavek na každý znak.
- [ ] **Negativní:** komponenta `EmployeeDirectory.tsx` neobsahuje `this.context` ani
      `msGraphClientFactory`.
- [ ] **Negativní:** `Set-StudentIdentity.ps1` nezměnil ID řešení ani Rozcestníku.

## Fallback

- **Skript hlásí `Project already belongs to '...'`** — spouštíš ho s jinými iniciálami, než
  s jakými jsi projekt v pondělí označil. Použij ty z `.student-identity`.
- **`Request_UnsupportedQuery` / 400** — chybí hlavička `ConsistencyLevel` nebo `$count`.
- **403 u `/users`** — tenant nedává Graph bez schválení; to je výsledek měření, ne chyba.
  Zapsat do tabulky a pokračovat — blok `permissions-consent` to vyřeší.
- **Prázdný seznam bez chyby** — na tenantu nejsou uživatelé s vyplněným jménem, které hledáš;
  zkus prázdné hledání.
- **Build hlásí chybu v manifestu** — při kopírování `preconfiguredEntries` zůstala navíc nebo
  chybí čárka či hranatá závorka. Porovnat se `solution/`.
- **Při časové tísni:** krok 13 jako demo lektora. Kdo nestihne části B a C, převezme cílový
  kód podle scénáře a měří od kroku 11.

## Zdroje (Microsoft)

- [Use the MSGraphClientV3 to connect to Microsoft Graph](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-msgraph)
- [List users (Microsoft Graph)](https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0)
