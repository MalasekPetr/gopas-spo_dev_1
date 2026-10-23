# Lab · Konfigurovatelný Rozcestník

> Modul: `property-pane` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Rozcestník, jehož nadpis, odkazy a knihovnu dokumentů nastaví editor v nereaktivním property
pane s validací — bez jediné změny kódu.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Hotový den 1: vlastní web `spodev-<ini>` a testovací stránka s debug parametry.
- Server zastavený (**Ctrl+C**) — měníme rozhraní vlastností i manifest.

## Startovní čára

Lab začíná u stavu po modulu [`first-webpart`](../../day-1/first-webpart/): referenční kód
[`../../day-1/first-webpart/solution/vltava-portal/`](../../day-1/first-webpart/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde; v `src/webparts/portal/components/Portal.tsx` je
napevno pole `links` se třemi odkazy a manifest web partu má v `properties` jen
`"description": "Portal"`. Složky `src/models` a `src/utils` zatím **nejsou**.

## Část A — model, parser a texty (15 min)

### 1. Doinstaluj HTTP klienta SPFx

Web part bude v property pane číst seznam knihoven webu přes REST — k tomu potřebuje
`SPHttpClient` z balíčku `@microsoft/sp-http`. Verze přesně jako zbytek SPFx (`--save-exact`).

```powershell
npm install @microsoft/sp-http@1.23.2 --save-exact
```

npm při zápisu do `package.json` seřadí `dependencies` i `devDependencies` abecedně — proto
se v diffu `package.json` pohne víc řádků, než kolik jsi přidal.

**Checkpoint:** v `package.json` je v `dependencies` řádek `"@microsoft/sp-http": "1.23.2"`
— přesná verze, bez `^`.

### 2. Vytvoř sdílený model odkazu

Typ odkazu dosud žil uvnitř `Portal.tsx`. Přesouvá se **do `src/models/`, ne do složky web
partu** — ve středu ho budou používat i další web party.

Soubor `src/models/IPortalLink.ts` — **nový**:

```typescript
export interface IPortalLink {
  title: string;
  url: string;
}
```

Soubor `src/models/index.ts` — **nový**:

```typescript
export type { IPortalLink } from './IPortalLink';
```

- `index.ts` je „barrel" — ostatní soubory importují `'../../../models'`, ne konkrétní soubor.
- `export type` = jen typ, do JavaScriptu se nic nepřeloží.

**Checkpoint:** obě složky existují, `src/models/index.ts` exportuje `IPortalLink`.

### 3. Vytvoř parser a validátor odkazů

Editor zadá odkazy jako víceřádkový text `Název|https://adresa`. Převod textu na pole odkazů
a kontrola řádků jsou čistá logika bez SPFx — patří do `src/utils/`, ne do web partu.

Soubor `src/utils/links.ts` — **nový**:

```typescript
import type { IPortalLink } from '../models';

// One link per line in the format "Title|https://address".
const SEPARATOR: string = '|';

export type LinkErrorReason = 'format' | 'url';

export interface ILinkError {
  line: number;
  reason: LinkErrorReason;
}

function splitLine(line: string): IPortalLink | undefined {
  const index: number = line.indexOf(SEPARATOR);
  if (index < 1) {
    return undefined;
  }
  const title: string = line.substring(0, index).trim();
  const url: string = line.substring(index + 1).trim();
  return title && url ? { title, url } : undefined;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Returns the first invalid line, or undefined when all lines are valid. */
export function validateLinks(text: string | undefined): ILinkError | undefined {
  const lines: string[] = (text || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i].trim();
    if (!line) {
      continue;
    }
    const link: IPortalLink | undefined = splitLine(line);
    if (!link) {
      return { line: i + 1, reason: 'format' };
    }
    if (!isHttpsUrl(link.url)) {
      return { line: i + 1, reason: 'url' };
    }
  }
  return undefined;
}

/** Parses valid lines into links; invalid lines are skipped. */
export function parseLinks(text: string | undefined): IPortalLink[] {
  const links: IPortalLink[] = [];
  (text || '').split('\n').forEach((raw: string) => {
    const link: IPortalLink | undefined = splitLine(raw.trim());
    if (link && isHttpsUrl(link.url)) {
      links.push(link);
    }
  });
  return links;
}
```

Soubor `src/utils/index.ts` — **nový**:

```typescript
export { parseLinks, validateLinks } from './links';
export type { ILinkError, LinkErrorReason } from './links';
```

- `validateLinks` vrací **první** chybný řádek a důvod (`format` / `url`); prázdné řádky
  přeskakuje.
- `parseLinks` neplatné řádky **tiše přeskočí** — web part tak nikdy nespadne na rozepsaném
  řádku.
- Texty chyb v souboru nejsou — vrací se jen číslo řádku a důvod, lokalizuje je web part.

**Checkpoint:** umíš říct, co vrátí `validateLinks('HR|https://a.cz\nServis http://b.cz')` —
`{ line: 2, reason: 'format' }` (chybí `|`).

### 4. Nahraď texty web partu

Šablonové klíče `BasicGroupName` a `DescriptionFieldLabel` patřily k poli `description`, které
mizí. Přibude 15 klíčů pro skupiny, popisky a chybové hlášky property pane.

Soubor `src/webparts/portal/loc/mystrings.d.ts` — **změna**: nahraď celý obsah:

```typescript
declare interface IPortalWebPartStrings {
  PropertyPaneDescription: string;
  ContentGroupName: string;
  LibraryGroupName: string;
  DisplayGroupName: string;
  TitleFieldLabel: string;
  TitleTooLong: string;
  LinksFieldLabel: string;
  LinksFieldDescription: string;
  LinksFormatError: string;
  LinksUrlError: string;
  LibraryFieldLabel: string;
  NoLibraryOption: string;
  LibrariesLoadError: string;
  LibraryLinkTitle: string;
  ShowEnvironmentFieldLabel: string;
  PortalTitle: string;
  Greeting: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
}

declare module 'PortalWebPartStrings' {
  const strings: IPortalWebPartStrings;
  export = strings;
}
```

Soubor `src/webparts/portal/loc/en-us.js` — **změna**: nahraď celý obsah:

```javascript
define([], function() {
  return {
    "PropertyPaneDescription": "Configure the department portal",
    "ContentGroupName": "Content",
    "LibraryGroupName": "Department documents",
    "DisplayGroupName": "Display",
    "TitleFieldLabel": "Title",
    "TitleTooLong": "The title can have at most {0} characters.",
    "LinksFieldLabel": "Links",
    "LinksFieldDescription": "One link per line: Title|https://address",
    "LinksFormatError": "Line {0}: use the format Title|https://address.",
    "LinksUrlError": "Line {0}: the address must start with https://.",
    "LibraryFieldLabel": "Document library",
    "NoLibraryOption": "(none)",
    "LibrariesLoadError": "Document libraries could not be loaded.",
    "LibraryLinkTitle": "Department documents",
    "ShowEnvironmentFieldLabel": "Show environment information",
    "PortalTitle": "Vltava Servis portal",
    "Greeting": "Hello",
    "AppLocalEnvironmentSharePoint": "The app is running on your local environment as SharePoint web part",
    "AppLocalEnvironmentTeams": "The app is running on your local environment as Microsoft Teams app",
    "AppLocalEnvironmentOffice": "The app is running on your local environment in office.com",
    "AppLocalEnvironmentOutlook": "The app is running on your local environment in Outlook",
    "AppSharePointEnvironment": "The app is running on SharePoint page",
    "AppTeamsTabEnvironment": "The app is running in Microsoft Teams",
    "AppOfficeEnvironment": "The app is running in office.com",
    "AppOutlookEnvironment": "The app is running in Outlook",
    "UnknownEnvironment": "The app is running in an unknown environment"
  }
});
```

- `{0}` je zástupný symbol — web part ho nahradí číslem řádku nebo délkou (`replace`).
- Pořadí klíčů v obou souborech je stejné — kontrola chybějícího klíče je pak pohledem.

**Checkpoint:** oba soubory mají **stejnou sadu klíčů** — spočítej je:

```powershell
(Select-String -Path .\src\webparts\portal\loc\mystrings.d.ts -Pattern '^\s+\w+: string;').Count
(Select-String -Path .\src\webparts\portal\loc\en-us.js -Pattern '^\s+"\w+":').Count
```

Obě čísla jsou **26**.

### 5. Změň výchozí vlastnosti v manifestu

`properties` v manifestu jsou hodnoty, se kterými se web part vloží na stránku. Odkazy, které
byly napevno v komponentě, se stávají výchozí hodnotou vlastnosti `links`.

Soubor `src/webparts/portal/PortalWebPart.manifest.json` — **změna**: najdi

```json
    "properties": {
      "description": "Portal"
    }
```

a nahraď:

```json
    "properties": {
      "title": "",
      "links": "HR portal|https://www.example.com/hr\nService desk|https://www.example.com/servicedesk\nCanteen menu|https://www.example.com/canteen",
      "libraryUrl": "",
      "showEnvironment": false
    }
```

- Prázdný `title` = „použij lokalizovaný výchozí nadpis" — rozhodne o tom web part.
- `\n` v JSON řetězci je konec řádku — v poli **Links** se zobrazí tři řádky.

**Checkpoint:** vlastnost `description` v manifestu už není.

## Část B — třída web partu (20 min)

### 6. Přestav třídu web partu

Všechny dílčí kroky 6a–6h mění `src/webparts/portal/PortalWebPart.ts`. Editor bude během
nich hlásit chyby — zmizí na konci kroku 6h.

#### 6a. Doplň importy

Property pane dostane rozbalovací seznam, popisek a přepínač; web part volá REST a parser.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: najdi

```typescript
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
```

a nahraď:

```typescript
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneLabel,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
```

Za řádek `import { IReadonlyTheme } from '@microsoft/sp-component-base';` přidej:

```typescript
import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';
```

Za řádek `import { IPortalProps } from './components/IPortalProps';` přidej:

```typescript
import { parseLinks, validateLinks, type ILinkError } from '../../utils';
```

**Checkpoint:** v hlavičce souboru jsou importy ze `sp-http` a `../../utils`.

#### 6b. Nahraď vlastnosti web partu

`IPortalWebPartProps` je tvar dat, která SharePoint ukládá se stránkou. Místo `description`
4 vlastnosti; pod rozhraní přibude typ odpovědi REST a limit délky nadpisu.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: najdi

```typescript
export interface IPortalWebPartProps {
  description: string;
}
```

a nahraď:

```typescript
export interface IPortalWebPartProps {
  title: string;
  links: string;
  libraryUrl: string;
  showEnvironment: boolean;
}

interface ILibraryInfo {
  Title: string;
  RootFolder: { ServerRelativeUrl: string };
}

const MAX_TITLE_LENGTH: number = 60;
```

**Checkpoint:** `IPortalWebPartProps` má 4 vlastnosti, `description` mezi nimi není.

#### 6c. Nahraď pole třídy

`_isDarkTheme` ze šablony komponenta nepoužívá — pryč s ním. Přibude stav seznamu knihoven
pro property pane: možnosti, příznak načítání a chybová hláška.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: najdi

```typescript
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
```

a nahraď:

```typescript
  private _environmentMessage: string = '';
  private _libraryOptions: IPropertyPaneDropdownOption[] = [];
  private _librariesLoading: boolean = false;
  private _librariesError: string = '';
```

V `onThemeChanged()` smaž řádek:

```typescript
    this._isDarkTheme = !!currentTheme.isInverted;
```

a mezi metodami `onInit()` a `_getEnvironmentMessage()` smaž dva ze tří prázdných řádků ze
šablony (zůstane jeden, jako všude jinde).

**Checkpoint:** v souboru není `_isDarkTheme` (Ctrl+F nic nenajde).

#### 6d. Předej komponentě nová data

`render()` převádí uložené vlastnosti na props komponenty: prázdný nadpis → výchozí
lokalizovaný, text odkazů → pole, serverově relativní URL knihovny → absolutní, informace
o prostředí jen se zapnutým přepínačem.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: v `render()` najdi

```typescript
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
```

a nahraď:

```typescript
        title: this.properties.title || strings.PortalTitle,
        links: parseLinks(this.properties.links),
        libraryUrl: this._toAbsoluteUrl(this.properties.libraryUrl),
        environmentMessage: this.properties.showEnvironment ? this._environmentMessage : '',
```

**Checkpoint:** v `render()` není `this.properties.description`.

#### 6e. Zapni nereaktivní režim

Výchozí property pane je **reaktivní** — web part se překreslí po každém znaku. S validací
odkazů to znamená blikání rozepsaných řádků. Nereaktivní režim změny použije až po **Apply**.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: před řádek
`protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {` vlož:

```typescript
  // Non-reactive: changes are applied only after the Apply button.
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

```

**Checkpoint:** getter `disableReactivePropertyChanges` vrací `true` a stojí hned před
`getPropertyPaneConfiguration`.

#### 6f. Načti knihovny při otevření property pane

Knihovny se načítají až když je editor opravdu potřebuje — při **prvním** otevření property
pane, ne při každém zobrazení stránky.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: opět před řádek
`protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {` vlož:

```typescript
  protected async onPropertyPaneConfigurationStart(): Promise<void> {
    if (this._libraryOptions.length > 0 || this._librariesLoading) {
      return;
    }

    this._librariesLoading = true;
    this.context.propertyPane.refresh();

    try {
      this._libraryOptions = await this._loadLibraries();
      this._librariesError = '';
    } catch {
      this._libraryOptions = [];
      this._librariesError = strings.LibrariesLoadError;
    }

    this._librariesLoading = false;
    this.context.propertyPane.refresh();
  }

  private async _loadLibraries(): Promise<IPropertyPaneDropdownOption[]> {
    const url: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists` +
      '?$filter=BaseTemplate eq 101 and Hidden eq false' +
      '&$select=Title,RootFolder/ServerRelativeUrl&$expand=RootFolder';
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data: { value: ILibraryInfo[] } = await response.json();
    const options: IPropertyPaneDropdownOption[] = data.value.map((library: ILibraryInfo) => ({
      key: library.RootFolder.ServerRelativeUrl,
      text: library.Title
    }));
    return [{ key: '', text: strings.NoLibraryOption }, ...options];
  }

  private _toAbsoluteUrl(serverRelativeUrl: string): string {
    if (!serverRelativeUrl) {
      return '';
    }
    return new URL(serverRelativeUrl, this.context.pageContext.web.absoluteUrl).toString();
  }

```

- `propertyPane.refresh()` překreslí panel — jednou se zapnutým indikátorem načítání, jednou
  s výsledkem.
- `BaseTemplate eq 101` = knihovna dokumentů; `Hidden eq false` vyřadí systémové knihovny.
- Klíčem možnosti je **serverově relativní** adresa (`/sites/.../Shared Documents`) — uloží se
  se stránkou a funguje i po přesunu domény; absolutní z ní dělá až `_toAbsoluteUrl`.
- První možnost `(none)` s prázdným klíčem = odkaz na knihovnu vypnutý.

**Checkpoint:** metody `onPropertyPaneConfigurationStart`, `_loadLibraries` a `_toAbsoluteUrl`
stojí v tomto pořadí za getterem z kroku 6e.

#### 6g. Přidej validátory

`onGetErrorMessage` pole property pane volá validátor po každé změně: **prázdný řetězec =
platné**, jiný text = chyba pod polem a neaktivní **Apply**.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: před řádek
`protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {` vlož:

```typescript
  private _validateTitle(value: string): string {
    return (value || '').length > MAX_TITLE_LENGTH
      ? strings.TitleTooLong.replace('{0}', MAX_TITLE_LENGTH.toString())
      : '';
  }

  private _validateLinks(value: string): string {
    const error: ILinkError | undefined = validateLinks(value);
    if (!error) {
      return '';
    }
    const template: string = error.reason === 'url' ? strings.LinksUrlError : strings.LinksFormatError;
    return template.replace('{0}', error.line.toString());
  }

```

**Checkpoint:** text chyby skládá web part z lokalizovaného řetězce a čísla řádku z
`validateLinks` — v `links.ts` žádný text není.

#### 6h. Přestav konfiguraci property pane

Jedna šablonová skupina s polem `description` se mění na 3 skupiny: **Obsah** (nadpis, odkazy),
**Dokumenty oddělení** (knihovna), **Zobrazení** (přepínač prostředí).

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: nahraď celou metodu
`getPropertyPaneConfiguration()`:

```typescript
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      showLoadingIndicator: this._librariesLoading,
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.ContentGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel,
                  placeholder: strings.PortalTitle,
                  onGetErrorMessage: this._validateTitle.bind(this)
                }),
                PropertyPaneTextField('links', {
                  label: strings.LinksFieldLabel,
                  description: strings.LinksFieldDescription,
                  multiline: true,
                  rows: 6,
                  onGetErrorMessage: this._validateLinks.bind(this)
                })
              ]
            },
            {
              groupName: strings.LibraryGroupName,
              groupFields: [
                PropertyPaneDropdown('libraryUrl', {
                  label: strings.LibraryFieldLabel,
                  options: this._libraryOptions,
                  disabled: this._libraryOptions.length === 0
                }),
                ...(this._librariesError ? [PropertyPaneLabel('libraryError', { text: this._librariesError })] : [])
              ]
            },
            {
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneToggle('showEnvironment', {
                  label: strings.ShowEnvironmentFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
```

- `.bind(this)` — validátor volá SharePoint, bez `bind` by v něm `this` nebyl web part.
- Dropdown je `disabled`, dokud knihovny nejsou načtené; chybový `PropertyPaneLabel` se
  přidá jen při chybě (spread prázdného pole jinak nic nepřidá).

**Checkpoint:** soubor `PortalWebPart.ts` je bez červeného podtržení — kromě volání
`Portal` v `render()`: komponenta ještě čeká stará data (krok 7).

## Část C — komponenta a ověření (25 min)

> [!WARNING] Hosted workbench končí 2026-12-01
> SPFx 1.23 je podle release notes **poslední verze s podporou** hosted workbenche: je
> deprecated od 2026-05-13 a 2026-12-01 se retiruje
> ([SPFx v1.23.0 release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.0#deprecations)).
> **Po tomto datu nebo v projektu na SPFx 1.24+** udělej checkpointy s workbenchem na testovací stránce svého
> webu s parametry `?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`
> (postup: [`first-webpart`, krok 9](../../day-1/first-webpart/lab-prvni-webpart.md#9-otestuj-na-skutečné-stránce)).

### 7. Uprav komponentu

Dílčí kroky 7a–7b mění složku `src/webparts/portal/components/`.

#### 7a. Uprav props komponenty

Soubor `src/webparts/portal/components/IPortalProps.ts` — **změna**: nahraď celý obsah:

```typescript
import type { IPortalLink } from '../../../models';

export interface IPortalProps {
  title: string;
  links: IPortalLink[];
  libraryUrl: string;
  environmentMessage: string;
  userDisplayName: string;
}
```

**Checkpoint:** `description` ani `isDarkTheme` v props nejsou.

#### 7b. Přepiš komponentu

Komponenta už nemá vlastní data — nadpis i odkazy dostává v props. Je pořád **třídní**;
funkční bude odpoledne v [`react-fluent-ui`](../react-fluent-ui/).

Soubor `src/webparts/portal/components/Portal.tsx` — **změna**: nahraď celý obsah:

```tsx
import * as React from 'react';
import styles from './Portal.module.scss';
import type { IPortalProps } from './IPortalProps';
import type { IPortalLink } from '../../../models';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'PortalWebPartStrings';

export default class Portal extends React.Component<IPortalProps> {
  public render(): React.ReactElement<IPortalProps> {
    const { title, links, libraryUrl, environmentMessage, userDisplayName } = this.props;
    const allLinks: IPortalLink[] = libraryUrl
      ? [...links, { title: strings.LibraryLinkTitle, url: libraryUrl }]
      : links;

    return (
      <section className={styles.portal}>
        <h2>{title}</h2>
        <p>{strings.Greeting}, {escape(userDisplayName)}!</p>
        <ul className={styles.links}>
          {allLinks.map(link => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">{link.title}</a>
            </li>
          ))}
        </ul>
        {environmentMessage && <p className={styles.environment}>{environmentMessage}</p>}
      </section>
    );
  }
}
```

- Lokální `IPortalLink` a pole `links` zmizely — typ je ze `src/models`, data z props.
- Odkaz na knihovnu se přidá **na konec** seznamu jen tehdy, když je knihovna vybraná.
- Odstavec s informací o prostředí se bez přepínače vůbec nevykreslí.

```powershell
npm start -- --nobrowser
```

**Checkpoint:** kompilace bez chyb; po vložení web partu do workbenche (nebo na testovací
stránku s debug parametry) se Rozcestník zobrazí s nadpisem *Vltava Servis portal* a třemi
odkazy.

### 8. Ověř validaci

Otevři property pane (tužka) a do pole **Links** přidej řádky:

```text
Intranet https://www.example.com/intranet
Wiki|http://www.example.com/wiki
```

**Checkpoint:** pod polem je chyba `Line 4: use the format Title|https://address.` Po opravě
4. řádku (doplň `|`) se chyba změní na `Line 5: the address must start with https://.`

**Checkpoint (negativní):** dokud chyba trvá, je tlačítko **Apply** neaktivní a web part
ukazuje původní tři odkazy.

Oprav 5. řádek na `https://` a klikni **Apply**.

**Checkpoint:** Rozcestník ukazuje 5 odkazů.

### 9. Ověř nereaktivní režim

Do pole **Title** napiš `Rozcestník IT` — **neklikej** Apply.

**Checkpoint:** nadpis web partu se **nezmění**, dokud neklikneš **Apply**. Text delší než
60 znaků vyvolá chybu *The title can have at most 60 characters.*

### 10. Vyber knihovnu dokumentů

Zavři property pane a otevři ho znovu. Při prvním otevření po načtení stránky proběhne krátké
načítání; pak v dropdownu **Document library** vyber **Documents** a **Apply**.

**Checkpoint:** Rozcestník má poslední odkaz *Department documents* a vede na
`https://<tenant>.sharepoint.com/sites/spodev-<ini>/Shared%20Documents` (adresa knihovny
podle jazyka webu se může lišit).

### 11. Porovnej s reaktivním režimem

Dočasně změň v `PortalWebPart.ts` návratovou hodnotu `disableReactivePropertyChanges` na
`false`, ulož, obnov stránku a piš do pole **Links** nový řádek po znacích.

**Checkpoint:** web part se překresluje po každém znaku a rozepsaný (zatím neplatný) řádek se
neobjeví — `parseLinks` ho přeskočí. Vrať hodnotu na `true`.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `package.json` | změněný | `@microsoft/sp-http` 1.23.2; npm závislosti seřadil abecedně |
| `src/models/IPortalLink.ts`, `index.ts` | nové | sdílený typ odkazu pro všechny web party |
| `src/utils/links.ts`, `index.ts` | nové | parser a validátor textu odkazů bez závislosti na SPFx |
| `src/webparts/portal/loc/mystrings.d.ts` | změněný | 26 klíčů: −2 šablonové, +15 pro property pane |
| `src/webparts/portal/loc/en-us.js` | změněný | anglické texty pro nové klíče |
| `src/webparts/portal/PortalWebPart.manifest.json` | změněný | výchozí `title`, `links`, `libraryUrl`, `showEnvironment` |
| `src/webparts/portal/PortalWebPart.ts` | změněný | 4 vlastnosti, nereaktivní pane, načtení knihoven, validace, 3 skupiny |
| `src/webparts/portal/components/IPortalProps.ts` | změněný | `title`, `links`, `libraryUrl` místo `description`, `isDarkTheme` |
| `src/webparts/portal/components/Portal.tsx` | změněný | data z props, odkaz na knihovnu, podmíněné prostředí |

Tento stav je **Startovní čárou** modulu [`localization`](../localization/). Když ti něco
nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Nadpis, odkazy, knihovna a přepínač prostředí se nastavují v property pane.
- [ ] Neplatný řádek odkazů zobrazí lokalizovanou chybu s číslem řádku.
- [ ] Knihovny se načítají z webu, odkaz na knihovnu je absolutní adresa tvého webu.
- [ ] `mystrings.d.ts` a `en-us.js` mají stejný počet klíčů (26).
- [ ] **Negativní:** s neplatnou hodnotou je Apply neaktivní a web part drží poslední platný
      stav.

## Fallback

- **Dropdown knihoven zůstane prázdný a pod ním je *Document libraries could not be
  loaded.*** — volání REST selhalo. V nástrojích prohlížeče (F12 → Network) najít požadavek
  `_api/web/lists` a jeho stavový kód. Ve workbenchi i na stránce běží jako ty; 403 znamená,
  že nejsi na správném webu.
- **`Cannot find module '@microsoft/sp-http'`** — krok 1 neproběhl nebo běží starý server.
- **Nadpis je prázdný** — chybí klíč `PortalTitle` v `en-us.js` (krok 4). Prázdná vlastnost
  `title` se nahrazuje výchozím lokalizovaným nadpisem.
- **Chyby v `PortalWebPart.ts` po části B** — porovnej soubor s
  [`solution/.../PortalWebPart.ts`](solution/vltava-portal/src/webparts/portal/PortalWebPart.ts);
  nejčastěji metoda vložená **za** `getPropertyPaneConfiguration` místo před ni (funguje, ale
  liší se od cíle) nebo chybějící import.
- **Při časové tísni:** kroky 9 a 11 vynechat. Celý stav převzít ze
  [`solution/vltava-portal/`](solution/vltava-portal/) podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).

## Zdroje (Microsoft)

- [Make your web part configurable](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/integrate-with-property-pane)
- [Validate web part property values](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/validate-web-part-property-values)
- [Use cascading dropdowns in web part properties](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-cascading-dropdowns-in-web-part-properties)
