# Lab · KendoReact Grid nad knihovnou Site Pages

> Modul: `opt-kendo-react` · Odhad: 45 min · Režim: hands-on, samostatný projekt
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Samostatný web part s KendoReact Gridem (řazení, filtr, stránkování) nad stránkami vlastního
webu a změřená velikost jeho balíčku.

**Jak lab číst:** začni u **Startovní čáry** — tady to není předchozí modul, ale čerstvý
scaffold. Pak jdi po krocích; každý říká, **který soubor** měníš, **co** do něj patří
a **proč**, a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**:
cílový kód, se kterým se můžeš porovnat.

## Předpoklady

- Hotový den 1 (prostředí, vlastní web `spodev-<ini>`). Řešení `vltava-portal-<ini>` se
  v tomto labu **nemění**.
- Iniciály `<ini>` od lektora — stejné jako ve `vltava-portal-<ini>`.

## Startovní čára

Lab **nestaví** na `solution/` žádného modulu: KendoReact přidává globální CSS, které by
změnilo vzhled Rozcestníku, proto vlastní projekt `kendo-sandbox-<ini>`. Startem je
**čerstvý scaffold** generátoru SPFx 1.23.2 (krok 2) s vlastní identitou ze
`Set-StudentIdentity.ps1` — stejný postup identity jako při
[převzetí startovního kódu](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution),
jen bez `robocopy`.

- Skript odvozuje ID z iniciál **a názvu projektu** (`kendo-sandbox` vs. `vltava-portal`) —
  s Rozcestníkem se nikdy nepotká, ani když oba nasadíš do stejného App Catalogu.
- Rozbije-li se ti projekt během labu, převezmi cílový kód
  [`solution/kendo-sandbox/`](solution/kendo-sandbox/) stejným postupem jako ve
  [scénáři](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution) — jen
  `$from` je `$HOME\gopas-spo_dev_1\day-2\opt-kendo-react\solution\kendo-sandbox` a `$to`
  `$HOME\spodev\kendo-sandbox-<ini>`. **`Set-StudentIdentity.ps1` nevynechat:** referenční
  projekt nese šablonová ID kurzu; skript mu doplní `-<ini>` do názvu i titulku a dá mu
  stejná ID, jaká má tvůj vlastní `kendo-sandbox-<ini>`.

**Checkpoint:** po kroku 2 je ve `$HOME\spodev\kendo-sandbox-<ini>` scaffold s web partem
`KendoGrid` a souborem `.student-identity` — to je startovní čára kroků 3–7.

## Kroky

### 1. Zjisti, proč ne nejnovější verze

V projektu `vltava-portal-<ini>` (React 17) spusť jen zkoušku nanečisto:

```powershell
npm install @progress/kendo-react-grid@latest --dry-run
```

**Checkpoint (negativní):** npm skončí `ERESOLVE` s řádky `Found: react@17.0.1` a
`peer react@"^18.0.0 || ^19.0.0"`. Nic se nenainstalovalo (`--dry-run`).

### 2. Vygeneruj samostatný projekt a dej mu svou identitu

```powershell
Set-Location "$HOME\spodev"
yo @microsoft/sharepoint `
    --solution-name kendo-sandbox-<ini> `
    --component-type webpart `
    --component-name KendoGrid `
    --framework react `
    --environment spo `
    --package-manager npm `
    --skip-feature-deployment `
    --no-insight
```

Generátor tentokrát dependencies nainstaluje sám (bez `--skip-install`).

Scaffold má **náhodná** ID od generátoru a titulek `KendoGrid` — v App Catalogu by nešel
odlišit od kolegů. Hned po scaffoldu mu dej identitu:

```powershell
$project = "$HOME\spodev\kendo-sandbox-<ini>"
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath $project
```

- Projekt se jmenuje `kendo-sandbox-<ini>`; skript odřízne příponu `-<ini>` a ID odvodí
  z `<ini>/kendo-sandbox/…` — jiná než u `vltava-portal`.
- Název balíčku a řešení příponu už mají, skript je nechá; doplní příponu `(<ini>)` do titulku.

**Checkpoint:** složka `$HOME\spodev\kendo-sandbox-<ini>` s `node_modules`. Skript vypíše
tabulku 3 slotů (`solution`, `feature/0`, `component/KendoGridWebPart`) se **sloupci `Old`
a `New` různými** a mezi změnami `KendoGridWebPart.manifest.json (title suffix)`;
v manifestu je `"title": { "default": "KendoGrid (<ini>)" }`.

**Checkpoint (negativní):** ID komponenty ve `src\webparts\kendoGrid\KendoGridWebPart.manifest.json`
**není** stejné jako ID Rozcestníku ve `vltava-portal-<ini>` (`PortalWebPart.manifest.json`).

### 3. Nainstaluj KendoReact 13.3.0

```powershell
Set-Location "$HOME\spodev\kendo-sandbox-<ini>"
$kendo = @(
    'grid', 'common', 'data-tools', 'dateinputs', 'dropdowns', 'inputs', 'intl', 'popup',
    'buttons', 'animation', 'dialogs', 'form', 'labels', 'layout', 'indicators', 'conversational-ui'
) | ForEach-Object { "@progress/kendo-react-$_@13.3.0" }
npm install @kendo `
    @progress/kendo-data-query @progress/kendo-drawing @progress/kendo-svg-icons@4 `
    @progress/kendo-licensing @progress/kendo-theme-default@12.3.0 axios `
    @microsoft/sp-http@1.23.2 --save-exact
```

Grid má v `peerDependencies` 16 dalších balíčků KendoReact ve **stejné** verzi — proto seznam.
`@kendo` je splatting pole `$kendo` (PowerShell předá každý prvek jako samostatný argument),
ne překlep. npm při zápisu `package.json` závislosti seřadí abecedně.

**Checkpoint:** `npm ls @progress/kendo-react-grid react` ukáže `@progress/kendo-react-grid@13.3.0`
a `react@17.0.1`, bez `invalid` a bez `UNMET PEER DEPENDENCY`.

### 4. Napiš web part

Web part načte stránky webu (REST) a předá komponentě funkci `loadPages`; komponenta drží
data a stav Gridu (řazení, filtr, stránka) a vykreslí `Grid` z KendoReact.

#### 4a. Props komponenty

Soubor `src/webparts/kendoGrid/components/IKendoGridProps.ts` — **změna**: nahraď celý obsah:

```typescript
export interface IPageItem {
  Id: number;
  Title: string;
  FileLeafRef: string;
  Modified: Date;
}

export interface IKendoGridProps {
  loadPages: () => Promise<IPageItem[]>;
}
```

Komponenta nedostává data, ale **funkci**, která je načte — SPFx kontext (`spHttpClient`)
zůstává ve web partu.

**Checkpoint:** šablonové props `description`, `isDarkTheme`, `environmentMessage`,
`userDisplayName` v souboru nejsou.

#### 4b. Komponenta s Gridem

Soubor `src/webparts/kendoGrid/components/KendoGrid.tsx` — **změna**: nahraď celý obsah:

```tsx
import * as React from 'react';
import { Grid, GridColumn, type GridDataStateChangeEvent } from '@progress/kendo-react-grid';
import { process, type State } from '@progress/kendo-data-query';
import '@progress/kendo-theme-default/dist/all.css';
import styles from './KendoGrid.module.scss';
import type { IKendoGridProps, IPageItem } from './IKendoGridProps';

export default function KendoGrid(props: IKendoGridProps): JSX.Element {
  const { loadPages } = props;
  const [items, setItems] = React.useState<IPageItem[]>([]);
  const [error, setError] = React.useState<string>('');
  const [dataState, setDataState] = React.useState<State>({
    skip: 0,
    take: 10,
    sort: [{ field: 'Modified', dir: 'desc' }]
  });

  React.useEffect(() => {
    loadPages().then(setItems, (e: Error) => setError(e.message));
  }, [loadPages]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className={styles.kendoGrid}>
      <Grid
        data={process(items, dataState)}
        {...dataState}
        onDataStateChange={(event: GridDataStateChangeEvent) => setDataState(event.dataState)}
        sortable={true}
        filterable={true}
        pageable={true}
      >
        <GridColumn field="Title" title="Title" />
        <GridColumn field="FileLeafRef" title="File" />
        <GridColumn field="Modified" title="Modified" filter="date" format="{0:d}" />
      </Grid>
    </div>
  );
}
```

- `import '@progress/kendo-theme-default/dist/all.css';` — **globální** CSS, platí pro celou
  stránku, ne jen pro tento web part (krok 7).
- `process()` z `kendo-data-query` aplikuje řazení, filtr a stránkování na pole v paměti;
  `dataState` je celý stav Gridu v jednom objektu.
- Obrázky `welcome-*.png` a třídy ze šablonového SCSS se už nepoužívají; soubory zůstávají.

**Checkpoint:** v komponentě není `this` ani `escape`.

#### 4c. Načtení stránek ve web partu

Soubor `src/webparts/kendoGrid/KendoGridWebPart.ts` — **změna**: před řádek
`import * as strings from 'KendoGridWebPartStrings';` vlož:

```typescript
import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';

```

Najdi

```typescript
import { IKendoGridProps } from './components/IKendoGridProps';
```

a nahraď:

```typescript
import { IKendoGridProps, IPageItem } from './components/IKendoGridProps';
```

V `render()` najdi

```typescript
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        userDisplayName: this.context.pageContext.user.displayName
```

a nahraď:

```typescript
        loadPages: this._loadPages
```

Za konec metody `render()` (řádky `ReactDom.render(element, this.domElement);` a `}`) vlož:

```typescript

  // Arrow function keeps a stable reference across renders (used as an effect dependency).
  private _loadPages = async (): Promise<IPageItem[]> => {
    const listUrl: string = `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SitePages`;
    const url: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/GetList(@u)/items` +
      `?@u='${encodeURIComponent(listUrl)}'&$select=Id,Title,FileLeafRef,Modified&$top=500`;
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data: { value: { Id: number; Title: string; FileLeafRef: string; Modified: string }[] } = await response.json();
    return data.value.map(item => ({ ...item, Modified: new Date(item.Modified) }));
  };
```

- `GetList(@u)` čte knihovnu stránek **adresou**, ne názvem — funguje i na českém webu, kde se
  knihovna jmenuje *Stránky webu*.
- Šipková funkce jako pole třídy má stálou referenci; komponenta ji má v závislostech
  `useEffect`, takže se stránky nenačítají při každém renderu znovu.
- Zbytek šablony (`_isDarkTheme`, `onThemeChanged`, property pane s `description`) zůstává —
  není podstatou labu.

**Checkpoint:** `npm run build` projde bez chyb. (Řádky s `LICENSE.txt` jsou licenční
hlavičky open-source závislostí, ne licence KendoReact.)

### 5. Změř balíček

```powershell
Get-ChildItem .\release\assets\kendo-grid-web-part_*.js | Select-Object Name, Length
```

**Checkpoint:** velikost zapiš a porovnej s Rozcestníkem (referenční: 1 442 440 B vs.
206 511 B).

> [!WARNING] Hosted workbench končí 2026-12-01
> SPFx 1.23 je podle release notes **poslední verze s podporou** hosted workbenche: je
> deprecated od 2026-05-13 a 2026-12-01 se retiruje
> ([SPFx v1.23.0 release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.0#deprecations)).
> **Po tomto datu nebo v projektu na SPFx 1.24+** udělej krok 6 na testovací stránce svého
> webu s parametry `?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`
> (postup: [`first-webpart`, krok 9](../../day-1/first-webpart/lab-prvni-webpart.md#9-otestuj-na-skutečné-stránce)).

### 6. Vyzkoušej Grid

```powershell
npm start -- --nobrowser
```

Workbench vlastního webu + query string z terminálu → web part **KendoGrid (<ini>)**.

**Checkpoint:** tabulka stránek webu (aspoň *Home.aspx*); klik na záhlaví *Title* řadí;
řádek filtru pod záhlavím filtruje; dole je stránkování. **Žádný** vodoznak ani licenční
pruh (funkce KendoReact Free).

### 7. Ověř, co dělá globální CSS

Na testovací stránce (debug parametry) vlož vedle sebe Rozcestník (`vltava-portal-<ini>`
musí běžet na jiném portu — nebo jen KendoGrid a standardní web party) a porovnej písmo
a tlačítka.

**Checkpoint:** umíš ukázat v nástrojích prohlížeče (F12 → Elements → Styles) aspoň jedno
pravidlo `.k-…` z `all.css`, které platí bez ohledu na to, ve kterém web partu prvek je.

## Výstupní stav

Cílový kód: [`solution/kendo-sandbox/`](solution/kendo-sandbox/) (šablonová ID kurzu, název
bez `-<ini>`). Proti čerstvému scaffoldu se změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `package.json` | změněný | KendoReact 13.3.0 (16 balíčků), data-query, téma 12.3.0, licensing, `sp-http`; npm seřadil abecedně |
| `.yo-rc.json`, `config/package-solution.json`, `*.manifest.json`, `teams/*.png` | změněné | identita ze `Set-StudentIdentity.ps1` (jen ve vlastním projektu) |
| `src/webparts/kendoGrid/components/IKendoGridProps.ts` | změněný | `IPageItem` a funkce `loadPages` místo šablonových props |
| `src/webparts/kendoGrid/components/KendoGrid.tsx` | změněný | funkční komponenta s `Grid`, globální téma Kendo |
| `src/webparts/kendoGrid/KendoGridWebPart.ts` | změněný | `_loadPages` přes `SPHttpClient` a `GetList` |

Modul je **leaf** — žádný další blok na `kendo-sandbox` nestaví a `vltava-portal` se nezměnil.

## Ověření

- [ ] Projekt `kendo-sandbox-<ini>` s KendoReact 13.3.0 a Reactem 17.0.1.
- [ ] Projekt má vlastní identitu: `.student-identity`, titulek **KendoGrid (<ini>)**.
- [ ] Grid řadí, filtruje, stránkuje nad stránkami webu, bez vodoznaku.
- [ ] Velikost balíčku zapsaná a porovnaná s Rozcestníkem.
- [ ] **Negativní:** `kendo-react-grid@latest` se do projektu s Reactem 17 nenainstaluje.
- [ ] **Negativní:** řešení `vltava-portal-<ini>` nemá v `package.json` žádný balíček
      `@progress/…` a ID jeho web partu se liší od ID `KendoGrid`.

## Fallback

- **`ERESOLVE` v kroku 3** — některý balíček KendoReact nemá verzi `13.3.0`; porovnat se
  seznamem v [`solution/kendo-sandbox/package.json`](solution/kendo-sandbox/package.json).
- **Skript identity skončí *Project already belongs to …*** — projekt už má jiné iniciály
  v `.student-identity`; spouštíš ho ve špatné složce nebo s překlepem v iniciálách.
- **Grid bez stylů** — chybí import `all.css` nebo téma jiné verze.
- **Prázdná tabulka s chybou 404** — web nemá knihovnu `SitePages` na obvyklé adrese.
- **Při časové tísni:** kroky 1 a 5 jako demo lektora, krok 7 vynechat.

## Zdroje (Microsoft)

- [Using Fluent UI in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)

## Zdroje (třetí strana — Progress Telerik KendoReact)

- [KendoReact — Free vs. Premium](https://www.telerik.com/kendo-react-ui/components/getting-started/free-vs-premium)
- [KendoReact — licence](https://www.telerik.com/kendo-react-ui/components/my-license)
