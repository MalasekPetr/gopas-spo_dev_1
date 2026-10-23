# Lab · Rozcestník na workbenchi a na moderní stránce

> Modul: `first-webpart` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Web part `Portal` s identitou Rozcestníku Vltava Servis běží z tvého stroje v hosted
workbenchi i na testovací stránce webu `/sites/spodev-<ini>` s Debug Toolbarem.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Hotový [`../project-anatomy/`](../project-anatomy/): projekt `vltava-portal-<ini>`
  s `node_modules` a s identitou ze `Set-StudentIdentity.ps1`, `npm run build` prošel.
- Profil Edge `cloudedu` přihlášený na tenant, `SPFX_SERVE_TENANT_DOMAIN` nastavená.

## Startovní čára

Lab začíná u stavu po modulu [`project-anatomy`](../project-anatomy/): čistý výstup
generátoru, referenční kód
[`../project-anatomy/solution/vltava-portal/`](../project-anatomy/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** v kořeni projektu je soubor `.student-identity` s tvými iniciálami,
`src/webparts/portal/components/Portal.tsx` obsahuje text `Well done` a
`src/webparts/portal/PortalWebPart.manifest.json` má titulek `Portal (<ini>)`.

## Část A — lokální server a workbench

### 1. Důvěřuj vývojovému certifikátu

Lokální server běží na `https://localhost:4321` a prohlížeč mu musí věřit. Certifikát
vytvoří a do úložiště Windows zapíše Heft. V kořeni projektu:

```powershell
npx heft trust-dev-cert
```

(`npx` spustí Heft ve verzi z `node_modules` projektu.)

Windows zobrazí bezpečnostní dotaz na instalaci certifikátu — potvrď **Ano**. Je to jednou
na stroj, ne na projekt.

**Checkpoint:** příkaz skončí bez chyby a
`Get-ChildItem Cert:\CurrentUser\Root | Where-Object Subject -like '*localhost*'` vrátí
aspoň jeden certifikát.

### 2. Spusť lokální server bez otevření prohlížeče

`npm start` by otevřel **výchozí** prohlížeč — ten nemusí být přihlášený na kurzovní tenant.
Proto bez prohlížeče:

```powershell
npm start -- --nobrowser
```

Počkej na řádek `To load your scripts, use this query string:` a pod ním řetězec začínající
`?debugManifestsFile=`. Terminál nech běžet.

**Checkpoint:** v terminálu je `compiled successfully` a řádek s query stringem.

### 3. Otevři hosted workbench

V profilu Edge `cloudedu` otevři:

```text
https://<tenant>.sharepoint.com/sites/spodev-<ini>/_layouts/workbench.aspx
```

a na konec adresy připoj query string z terminálu (krok 2). Na dotaz prohlížeče
*„Allow this site to access devices on your local network?"* odpověz **Allow**. Pak
**+** → v toolboxu **Portal (<ini>)**.

**Checkpoint:** na plátně je web part s textem `Well done, <tvé jméno>!` a řádkem
o prostředí (*The app is running on your local environment as SharePoint web part*).

## Část B — ze šablony Rozcestník

Server nech běžet: každé uložení spustí novou kompilaci a workbench po obnovení (F5) ukáže
změnu. Kroky 4–7 jsou celý rozdíl mezi startovním a cílovým kódem.

### 4. Nahraď komponentu šablony Rozcestníkem

Šablona generátoru ukazuje uvítací obrázek a odkazy na dokumentaci SPFx. Rozcestník
potřebuje nadpis, pozdrav, popis z property pane a seznam odkazů firmy.

Soubor `src/webparts/portal/components/Portal.tsx` — **změna**: nahraď celý obsah:

```tsx
import * as React from 'react';
import styles from './Portal.module.scss';
import type { IPortalProps } from './IPortalProps';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'PortalWebPartStrings';

interface IPortalLink {
  title: string;
  url: string;
}

// Hard-coded on purpose: day 2 moves the links to the property pane.
const links: IPortalLink[] = [
  { title: 'HR portal', url: 'https://www.example.com/hr' },
  { title: 'Service desk', url: 'https://www.example.com/servicedesk' },
  { title: 'Canteen menu', url: 'https://www.example.com/canteen' }
];

export default class Portal extends React.Component<IPortalProps> {
  public render(): React.ReactElement<IPortalProps> {
    const { description, environmentMessage, userDisplayName } = this.props;

    return (
      <section className={styles.portal}>
        <h2>{strings.PortalTitle}</h2>
        <p>{strings.Greeting}, {escape(userDisplayName)}!</p>
        <p>{escape(description)}</p>
        <ul className={styles.links}>
          {links.map(link => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">{link.title}</a>
            </li>
          ))}
        </ul>
        <p className={styles.environment}>{environmentMessage}</p>
      </section>
    );
  }
}
```

- Importy `welcome-dark.png` a `welcome-light.png` zmizely — obrázky ve složce `assets/`
  zůstávají, jen je nic nenačítá. `isDarkTheme` zůstává v `IPortalProps`, komponenta ho
  teď nečte.
- Texty jdou přes modul `PortalWebPartStrings`, ne natvrdo — klíče `PortalTitle` a
  `Greeting` zatím neexistují.
- `key={link.url}` — React potřebuje u položek seznamu stabilní klíč.

Komponenta používá třídu `styles.environment`, kterou šablona nemá. Soubor
`src/webparts/portal/components/Portal.module.scss` — **změna**: na konec souboru přidej:

```scss

.environment {
  font-size: 12px;
  opacity: 0.7;
}
```

- `*.module.scss` je **CSS modul**: build z něj vygeneruje typ se jmény tříd a
  `styles.environment` bez této třídy neprojde kompilací
  (`Property 'environment' does not exist on type 'IStyles'`).

Ulož oba soubory. Terminál ukáže novou kompilaci — **s chybou**.

**Checkpoint:** v terminálu jsou chyby TypeScriptu `Property 'PortalTitle' does not exist on
type 'IPortalWebPartStrings'` a totéž pro `Greeting` — a žádná jiná. To je správně —
pokračuj krokem 5.

### 5. Přidej lokalizované texty — a zjisti, co TypeScript nehlídá

Lokalizace má dvě půlky: **deklaraci** typu (`mystrings.d.ts`) hlídá TypeScript, **hodnoty**
(`en-us.js`) se načtou až za běhu. Pořadí kroků je schválně „špatné", abys viděl, co build
nepozná.

1. Soubor `src/webparts/portal/loc/mystrings.d.ts` — **změna**: najdi

   ```typescript
     UnknownEnvironment: string;
   ```

   a přidej za něj:

   ```typescript
     PortalTitle: string;
     Greeting: string;
   ```

2. Ulož. Kompilace teď **projde**. Obnov workbench (F5).
3. Prohlédni si web part: nadpis chybí úplně a pozdrav začíná čárkou (`, <jméno>!`).
   Hodnoty jsou `undefined` a React je nevykreslí.
4. Teprve teď doplň hodnoty. Soubor `src/webparts/portal/loc/en-us.js` — **změna**: najdi

   ```javascript
   define([], function() {
     return {
   ```

   a přidej za řádek `return {` (čárky na konci řádků pak sedí):

   ```javascript
       "PortalTitle": "Vltava Servis portal",
       "Greeting": "Hello",
   ```

5. Ulož a obnov workbench.

**Checkpoint (negativní, bod 3):** s klíčem jen v `.d.ts` build prošel, ale web part neměl
nadpis a pozdrav začínal čárkou. **Checkpoint (bod 5):** web part ukazuje *Vltava Servis portal*,
*Hello, <jméno>!* a tři odkazy.

### 6. Uprav styl

Odkazy mají být bez odrážek a pod sebou.

Soubor `src/webparts/portal/components/Portal.module.scss` — **změna**: najdi

```scss
.links {
  a {
```

a přidej za řádek `.links {`:

```scss
  list-style: none;
  padding-left: 0;
```

**Checkpoint:** odkazy jsou bez odrážek pod sebou a řádek o prostředí je menším písmem.

### 7. Dej web partu jméno v toolboxu

Název, popis a ikonu v toolboxu nedává kód, ale manifest komponenty.

Soubor `src/webparts/portal/PortalWebPart.manifest.json` — **změna**: v
`preconfiguredEntries[0]` najdi

```json
"title": { "default": "Portal (<ini>)" },
"description": { "default": "Portal description" },
"officeFabricIconFontName": "Page",
```

(v referenčním `solution/` je titulek bez přípony, `"Portal"`) a nahraď:

```json
"title": { "default": "Vltava Portal" },
"description": { "default": "Welcome and company links for Vltava Servis" },
"officeFabricIconFontName": "Globe",
```

Iniciály do titulku **nepiš** — doplní je skript identity. Spusť ho znovu; ID nechá být
a jen přidá k novému titulku příponu `(<ini>)`:

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> `
    -ProjectPath "$HOME\spodev\vltava-portal-<ini>"
```

Iniciály v názvu nejsou ozdoba: ve středu nasadí celá třída do jednoho tenantového App
Catalogu a bez nich by toolbox obsahoval patnáct stejně pojmenovaných web partů.

Změny manifestu se při běžícím serveru nemusí projevit — zastav server (**Ctrl+C**) a spusť
znovu `npm start -- --nobrowser`.

**Checkpoint:** skript vypíše jedinou změnu `PortalWebPart.manifest.json (title suffix)` a
v toolboxu workbenche je web part pod názvem **Vltava Portal (<ini>)** s ikonou zeměkoule.

## Část C — property pane a skutečná stránka

### 8. Ověř reaktivní property pane

Ve workbenchi klikni na web part → ikona tužky → v property pane přepiš *Description Field*
na `Rozcestník oddělení IT`.

**Checkpoint:** text ve web partu se mění **během psaní**, bez tlačítka Použít. (Reaktivní
režim — v úterý ho přepneš.)

### 9. Otestuj na skutečné stránce

1. Na webu `/sites/spodev-<ini>`: **New** → **Page** → prázdná stránka, název `Test portal`.
   Ulož jako koncept (**Save as draft**) — **nepublikuj**.
2. Otevři stránku a na konec adresy připoj:

   ```text
   ?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js
   ```

   Pokud adresa už obsahuje `?` (například `?Mode=Edit`), připoj parametry s `&` místo `?`.
3. Potvrď **Load debug scripts** a případně znovu **Allow** pro lokální síť.
4. **Edit** → **+** → web part **Vltava Portal (<ini>)**.

**Checkpoint:** web part je na stránce v barvách motivu webu a nahoře je **Debug Toolbar**.
V Debug Toolbaru **Show info** ukáže načtený manifest s ID tvého web partu.

### 10. Ověř, odkud kód opravdu běží

Zastav server v terminálu (**Ctrl+C**) a obnov testovací stránku (F5).

**Checkpoint (negativní):** web part se nenačte (chybová hláška nebo prázdné místo).
Kód existuje jen na tvém stroji — nic se nenasadilo do tenantu. Stránku zavři **bez
publikování** (*Discard changes*).

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/webparts/portal/components/Portal.tsx` | změněný (celý) | Rozcestník místo uvítací šablony: nadpis, pozdrav, popis, tři odkazy |
| `src/webparts/portal/loc/mystrings.d.ts` | změněný | deklarace klíčů `PortalTitle` a `Greeting` |
| `src/webparts/portal/loc/en-us.js` | změněný | hodnoty klíčů `PortalTitle` a `Greeting` |
| `src/webparts/portal/components/Portal.module.scss` | změněný | třída `.environment` (krok 4), odkazy bez odrážek (krok 6) |
| `src/webparts/portal/PortalWebPart.manifest.json` | změněný | titulek, popis a ikona v toolboxu |

Tvůj projekt se od `solution/` liší navíc jen identitou (ID, `-<ini>` v názvech,
`(<ini>)` v titulku) a souborem `.student-identity`.

Tento stav je **Startovní čárou** modulu [`property-pane`](../../day-2/property-pane/). Když ti
něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Web part **Vltava Portal (<ini>)** běží ve workbenchi i na stránce `Test portal` s Debug Toolbarem.
- [ ] Rozcestník ukazuje nadpis, pozdrav, popis a tři odkazy; texty jsou v `en-us.js`.
- [ ] Property pane je reaktivní.
- [ ] **Negativní:** klíč jen v `.d.ts` prošel buildem a za běhu chyběl.
- [ ] **Negativní:** po zastavení serveru se web part na stránce nenačte; stránka zůstala
      nepublikovaná a v App Catalogu tenantu nic nového není.

## Fallback

- **Web part ve workbenchi chybí v toolboxu** — nepovolený přístup do lokální sítě
  (krok 3) nebo nedůvěryhodný certifikát (krok 1). Otevřít v tomtéž profilu
  `https://localhost:4321/temp/build/manifests.js` — musí se zobrazit JavaScript, ne
  varování o certifikátu.
- **Workbench se otevřel na cizím webu nebo s `{tenantDomain}` v adrese** — proměnná
  `SPFX_SERVE_TENANT_DOMAIN` není vidět v terminálu (zavřít celé VS Code) nebo je špatně
  zadaná.
- **Chyby TypeScriptu po kroku 4 nezmizí** — porovnat s
  [`solution/vltava-portal/src/webparts/portal/`](solution/vltava-portal/src/webparts/portal/).
- **Titulek v toolboxu je bez iniciál** — po kroku 7 neproběhl znovu `Set-StudentIdentity.ps1`.
- **Při časové tísni:** kroky 6 a 8 vynechat. Pro dohnání převzít cílový kód ze
  [`solution/vltava-portal/`](solution/vltava-portal/) podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (celý projekt, `npm install`, `Set-StudentIdentity.ps1`).

## Zdroje (Microsoft)

- [Build your first SharePoint client-side web part](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part)
- [Debug SharePoint Framework solutions on modern SharePoint pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)
- [SharePoint Framework Debug Toolbar](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-toolbar)
