# Lab · KendoReact Grid nad knihovnou Site Pages

> Modul: `opt-kendo-react` · Odhad: 45 min · Režim: hands-on, samostatný projekt
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Samostatný web part s KendoReact Gridem (řazení, filtr, stránkování) nad stránkami vlastního
webu a změřená velikost jeho balíčku.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Referenční
projekt: [`solution/kendo-sandbox/`](solution/kendo-sandbox/).

## Předpoklady

- Hotový den 1 (prostředí). Řešení `vltava-portal-<ini>` se v tomto labu **nemění**.

## Kroky

### 1. Zjisti, proč ne nejnovější verze

V projektu `vltava-portal-<ini>` (React 17) spusť jen zkoušku nanečisto:

```powershell
npm install @progress/kendo-react-grid@latest --dry-run
```

**Checkpoint (negativní):** npm skončí `ERESOLVE` s řádky `Found: react@17.0.1` a
`peer react@"^18.0.0 || ^19.0.0"`. Nic se nenainstalovalo (`--dry-run`).

### 2. Vygeneruj samostatný projekt

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

**Checkpoint:** složka `$HOME\spodev\kendo-sandbox-<ini>` s `node_modules`.

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

**Checkpoint:** `npm ls @progress/kendo-react-grid react` ukáže `@progress/kendo-react-grid@13.3.0`
a `react@17.0.1`, bez `invalid` a bez `UNMET PEER DEPENDENCY`.

### 4. Napiš web part

1. `src/webparts/kendoGrid/components/IKendoGridProps.ts` — nahraď obsahem ze
   [`solution/.../IKendoGridProps.ts`](solution/kendo-sandbox/src/webparts/kendoGrid/components/IKendoGridProps.ts).
2. `src/webparts/kendoGrid/components/KendoGrid.tsx` — nahraď obsahem ze
   [`solution/.../KendoGrid.tsx`](solution/kendo-sandbox/src/webparts/kendoGrid/components/KendoGrid.tsx).
   Všimni si řádku `import '@progress/kendo-theme-default/dist/all.css';` — globální CSS.
3. V `src/webparts/kendoGrid/KendoGridWebPart.ts` nahraď metodu `render()` a přidej
   `_loadPages` podle [`solution/.../KendoGridWebPart.ts`](solution/kendo-sandbox/src/webparts/kendoGrid/KendoGridWebPart.ts)
   (včetně importu `SPHttpClient`). `_loadPages` čte knihovnu stránek přes `GetList` — adresou,
   ne názvem, takže funguje i na českém webu.

**Checkpoint:** `npm run build` projde bez chyb. (Řádky s `LICENSE.txt` jsou licenční
hlavičky open-source závislostí, ne licence KendoReact.)

### 5. Změř balíček

```powershell
Get-ChildItem .\release\assets\kendo-grid-web-part_*.js | Select-Object Name, Length
```

**Checkpoint:** velikost zapiš a porovnej s Rozcestníkem (referenční: 1 442 440 B vs.
206 511 B).

### 6. Vyzkoušej Grid

```powershell
npm start -- --nobrowser
```

Workbench vlastního webu + query string z terminálu → web part **KendoGrid**.

**Checkpoint:** tabulka stránek webu (aspoň *Home.aspx*); klik na záhlaví *Title* řadí;
řádek filtru pod záhlavím filtruje; dole je stránkování. **Žádný** vodoznak ani licenční
pruh (funkce KendoReact Free).

### 7. Ověř, co dělá globální CSS

Na testovací stránce (debug parametry) vlož vedle sebe Rozcestník (`vltava-portal-<ini>`
musí běžet na jiném portu — nebo jen KendoGrid a standardní web party) a porovnej písmo
a tlačítka.

**Checkpoint:** umíš ukázat v nástrojích prohlížeče (F12 → Elements → Styles) aspoň jedno
pravidlo `.k-…` z `all.css`, které platí bez ohledu na to, ve kterém web partu prvek je.

## Ověření

- [ ] Projekt `kendo-sandbox-<ini>` s KendoReact 13.3.0 a Reactem 17.0.1.
- [ ] Grid řadí, filtruje, stránkuje nad stránkami webu, bez vodoznaku.
- [ ] Velikost balíčku zapsaná a porovnaná s Rozcestníkem.
- [ ] **Negativní:** `kendo-react-grid@latest` se do projektu s Reactem 17 nenainstaluje.
- [ ] **Negativní:** řešení `vltava-portal-<ini>` nemá v `package.json` žádný balíček
      `@progress/…`.

## Fallback

- **`ERESOLVE` v kroku 3** — některý balíček KendoReact nemá verzi `13.3.0`; porovnat se
  seznamem v [`solution/kendo-sandbox/package.json`](solution/kendo-sandbox/package.json).
- **Grid bez stylů** — chybí import `all.css` nebo téma jiné verze.
- **Prázdná tabulka s chybou 404** — web nemá knihovnu `SitePages` na obvyklé adrese.
- **Při časové tísni:** kroky 1 a 5 jako demo lektora, krok 7 vynechat.

## Zdroje (Microsoft)

- [Using Fluent UI in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)

## Zdroje (třetí strana — Progress Telerik KendoReact)

- [KendoReact — Free vs. Premium](https://www.telerik.com/kendo-react-ui/components/getting-started/free-vs-premium)
- [KendoReact — licence](https://www.telerik.com/kendo-react-ui/components/my-license)
