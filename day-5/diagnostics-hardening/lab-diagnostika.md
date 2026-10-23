# Lab · Logy, měření, error boundary a kontrola před předáním

> Modul: `diagnostics-hardening` · Odhad: 35 min · Režim: hands-on, vlastní web (kroky 1–4); kroky 5–6 demo lektora
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení, které loguje a měří volání API, přežije chybu vykreslení jednoho web partu, a soubor
`HARDENING.md` s výsledky kontroly závislostí a výstupu buildu.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Hotový `ci-cd-quality` (testy v buildu).
- Testovací stránka na webu `spodev-<ini>` s Rozcestníkem a Adresářem (den 2 a 3).

## Startovní čára

Lab začíná u stavu po modulu [`ci-cd-quality`](../ci-cd-quality/): referenční kód
[`../ci-cd-quality/solution/vltava-portal/`](../ci-cd-quality/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde s `Successes: 15`, `Failures: 0` a složka
`src/components` ještě **neexistuje**.

## Část A — Měření volání API (8 min)

### 1. Měření a logování volání API

Jedna pomocná funkce obalí volání API dvěma značkami `performance.mark`, spočítá dobu a
zapíše ji přes `Log.info` do Developer Dashboardu. Měří se jen skutečná volání — co vrátí
cache ze dne 4, do měřené funkce nedojde.

Soubor `src/utils/perf.ts` — **nový**:

```typescript
import { Log } from '@microsoft/sp-core-library';

/**
 * Runs an async action between two performance marks and logs the duration.
 * The measure is visible in the browser Performance panel (User Timings) and the log line in
 * the SPFx developer dashboard (Ctrl+F12, Trace tab).
 * Log source is truncated by SPFx to 20 characters -- keep it short.
 */
export async function measure<T>(source: string, name: string, action: () => Promise<T>): Promise<T> {
  const start: string = `${name}:start`;
  const end: string = `${name}:end`;
  performance.mark(start);
  try {
    return await action();
  } finally {
    performance.mark(end);
    performance.measure(name, start, end);
    const entries: PerformanceEntryList = performance.getEntriesByName(name, 'measure');
    const duration: number = entries.length > 0 ? entries[entries.length - 1].duration : 0;
    Log.info(source, `${name}: ${Math.round(duration)} ms`);
  }
}
```

Soubor `src/services/employeeService.ts` — **změna**: najdi

```typescript
import { cached } from '../utils/sessionCache';
```

a přidej za něj:

```typescript
import { measure } from '../utils/perf';
```

Soubor `src/services/employeeService.ts` — **změna**: najdi

```typescript
    const response: { value: User[] } = await request.get();
```

a nahraď:

```typescript
    // Only real Graph calls are measured; cache hits never reach this function.
    const response: { value: User[] } = await measure('VltavaDirectory', 'vltava-graph-users', () => request.get());
```

Soubor `src/services/equipmentService.ts` — **změna**: najdi

```typescript
import type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from '../models';
```

a přidej za něj:

```typescript
import { measure } from '../utils/perf';
```

Soubor `src/services/equipmentService.ts` — **změna**: najdi

```typescript
        return await query<IEquipmentItem[]>();
```

a nahraď:

```typescript
        return await measure('VltavaEquipment', 'vltava-equipment-load', () => query<IEquipmentItem[]>());
```

- Zdroj logu (`VltavaDirectory`) má nejvýš 20 znaků — SPFx delší zkrátí.
- `measure` vrací výsledek akce beze změny; volající kód nic dalšího neví.

**Checkpoint:** `npm run build` projde (15 testů).

## Část B — Error boundary (12 min)

### 2. Error boundary

Výjimka při vykreslení React komponenty bez error boundary odpojí celý strom — místo web
partu zůstane prázdné místo. Error boundary musí být **třídní** komponenta; jedna společná
pro všechny web party.

Soubor `src/components/ErrorBoundary.tsx` — **nový**:

```typescript
import * as React from 'react';
import { Log } from '@microsoft/sp-core-library';
import styles from './ErrorBoundary.module.scss';

export interface IErrorBoundaryProps {
  /** Log source, max. 20 characters (SPFx truncates longer values). */
  source: string;
  fallbackText: string;
  children?: React.ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches errors thrown while rendering the component tree below it, so one broken web part
 * shows a message instead of an empty box. Errors in event handlers and promises are NOT
 * caught here -- those are handled where they happen (hooks, services).
 * Error boundaries must be class components (React 17 and 18).
 * The fallback is plain markup: Fluent UI MessageBar would add ~8 KB to web parts that do not
 * use it otherwise (measured on Portal, 2026-10-16).
 */
export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public state: IErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): IErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    Log.error(this.props.source, error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <div role="alert" className={styles.error}>{this.props.fallbackText}</div>;
    }
    return this.props.children;
  }
}
```

Soubor `src/components/ErrorBoundary.module.scss` — **nový**:

```scss
.error {
  padding: 8px 12px;
  border-left: 4px solid #a4262c;
  background-color: #fde7e9;
  color: #323130;
  font-size: 14px;
}
```

Teď každý ze tří web partů obal: původní `element` se přejmenuje na `component` a nový
`element` je `ErrorBoundary` s ním uvnitř. Zdroj logu: `VltavaPortal`, `VltavaDirectory`,
`VltavaEquipment`.

**Rozcestník.** Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: najdi

```typescript
import Portal from './components/Portal';
```

a přidej za něj:

```typescript
import { ErrorBoundary } from '../../components/ErrorBoundary';
```

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: najdi

```typescript
    const element: React.ReactElement<IPortalProps> = React.createElement(
```

a nahraď:

```typescript
    const component: React.ReactElement<IPortalProps> = React.createElement(
```

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**: najdi

```typescript
    ReactDom.render(element, this.domElement);
```

a nahraď:

```typescript
    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaPortal', fallbackText: strings.RenderError }, component);

    ReactDom.render(element, this.domElement);
```

**Adresář.** Soubor `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.ts` — **změna**: najdi

```typescript
import EmployeeDirectory from './components/EmployeeDirectory';
```

a přidej za něj:

```typescript
import { ErrorBoundary } from '../../components/ErrorBoundary';
```

Soubor `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.ts` — **změna**: najdi

```typescript
    const element: React.ReactElement<IEmployeeDirectoryProps> = React.createElement(
```

a nahraď:

```typescript
    const component: React.ReactElement<IEmployeeDirectoryProps> = React.createElement(
```

Soubor `src/webparts/employeeDirectory/EmployeeDirectoryWebPart.ts` — **změna**: najdi

```typescript
    ReactDom.render(element, this.domElement);
```

a nahraď:

```typescript
    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaDirectory', fallbackText: strings.RenderError }, component);

    ReactDom.render(element, this.domElement);
```

**Evidence vybavení.** Soubor `src/webparts/equipment/EquipmentWebPart.ts` — **změna**: najdi

```typescript
import Equipment from './components/Equipment';
```

a přidej za něj:

```typescript
import { ErrorBoundary } from '../../components/ErrorBoundary';
```

Soubor `src/webparts/equipment/EquipmentWebPart.ts` — **změna**: najdi

```typescript
    const element: React.ReactElement<IEquipmentProps> = React.createElement(
```

a nahraď:

```typescript
    const component: React.ReactElement<IEquipmentProps> = React.createElement(
```

Soubor `src/webparts/equipment/EquipmentWebPart.ts` — **změna**: najdi

```typescript
    ReactDom.render(element, this.domElement);
```

a nahraď:

```typescript
    // One failing web part must not break the page: render errors end in a message.
    const element: React.ReactElement = React.createElement(
      ErrorBoundary, { source: 'VltavaEquipment', fallbackText: strings.RenderError }, component);

    ReactDom.render(element, this.domElement);
```

Spusť `npm run build`.

**Checkpoint (negativní):** build **spadne** dvakrát za sebou:

1. na TypeScriptu — `RenderError` není v `mystrings.d.ts` (3× `TS2339 Property 'RenderError'
   does not exist`, jednou za každý web part). Oprav to v kroku 2a a spusť build znovu,
2. na testu lokalizace — klíč je deklarovaný, ale chybí v `loc/*.js`. Oprav to v kroku 2b.

Pak build projde. Druhou chybu by bez testu z `ci-cd-quality` našel až uživatel.

#### 2a. Deklaruj klíč

Soubor `src/webparts/portal/loc/mystrings.d.ts` — **změna**: najdi

```typescript
declare interface IPortalWebPartStrings {
```

a přidej za něj:

```typescript
  RenderError: string;
```

Soubor `src/webparts/employeeDirectory/loc/mystrings.d.ts` — **změna**: najdi

```typescript
declare interface IEmployeeDirectoryWebPartStrings {
```

a přidej za něj:

```typescript
  RenderError: string;
```

Soubor `src/webparts/equipment/loc/mystrings.d.ts` — **změna**: najdi

```typescript
declare interface IEquipmentWebPartStrings {
```

a přidej za něj:

```typescript
  RenderError: string;
```

**Checkpoint (negativní):** `npm run build` projde TypeScriptem, ale skončí
`FAIL lib-commonjs\loc.test.js` se `Successes: 9`, `Failures: 6` — chybí `"RenderError"`
v šesti souborech `loc/*.js` (ověřeno 2026-10-23).

#### 2b. Doplň texty

Ve všech třech složkách `loc/` přidej klíč jako **první** řádek objektu, hned za
`return {`. V `en-us.js`:

```javascript
    "RenderError": "This part of the page could not be displayed. Reload the page; if the problem persists, contact the IT service desk.",
```

V `cs-cz.js` je český text — řádek `"RenderError"` zkopíruj ze
[solution](solution/vltava-portal/src/webparts/portal/loc/cs-cz.js) (ve všech třech web
partech je stejný).

**Checkpoint:** `npm run build` projde, `Successes: 15`, `Failures: 0`.

### 3. Vyvolej chybu vykreslení

Dočasně přidej na začátek funkce `Portal` v `Portal.tsx`:

```typescript
if (title === 'boom') {
  throw new Error('Simulated render error');
}
```

`npm start -- --nobrowser`, testovací stránka s debug parametry, na stránce Rozcestník
**a** Adresář. V property pane Rozcestníku nastav nadpis `boom` → **Apply**.

**Checkpoint:** místo Rozcestníku je červený pruh *This part of the page could not be
displayed…*; Adresář vedle funguje dál.

**Checkpoint (negativní):** stránka **není** prázdná a ostatní web party nezmizely.

Ctrl+F12 → **Trace**: je tam chyba se zdrojem `VltavaPortal`. Kód s `boom` odstraň — do
Výstupního stavu nepatří.

## Část C — Měření v prohlížeči (5 min)

### 4. Přečti měření

V Adresáři hledej nové jméno. Pak:

1. Ctrl+F12 → **Trace** — řádek `vltava-graph-users: <N> ms`.
2. Ctrl+F12 → **Performance** — časy načtení a vykreslení tvých komponent.
3. Stejné hledání zopakuj.

**Checkpoint:** po prvním hledání je v Trace řádek s dobou volání Graphu; po opakovaném
**nový řádek nepřibude** (cache z dne 4 — do měřené funkce se nedojde).

## Část D — Kontrola před předáním (demo lektora, 10 min)

### 5. Kontrola závislostí (demo lektora)

```powershell
npm audit
npm audit --omit=dev
npm sbom --sbom-format cyclonedx --omit dev | ConvertFrom-Json |
    Select-Object -ExpandProperty components | ForEach-Object {
        if ($_.licenses) { $_.licenses | ForEach-Object { if ($_.license.id) { $_.license.id } elseif ($_.expression) { $_.expression } else { $_.license.name } } }
        else { '(no SPDX: ' + $_.name + ')' }
    } | Group-Object | Sort-Object Count -Descending | Select-Object Count, Name
```

**Checkpoint:** umíš říct, kolik zranitelností jde **k uživateli** (`--omit=dev`) a které
licence mají produkční závislosti (referenční: 0 a MIT/0BSD/Apache-2.0/BSD-2-Clause + SPFx EULA).

**Checkpoint (negativní):** `npm audit fix` jsi **nespustil**.

### 6. Kontrola výstupu buildu (demo lektora)

```powershell
npm run build
"--- addresses"
Get-ChildItem .\release\assets\*.js | Select-String -Pattern 'https://[a-zA-Z0-9.-]+' -AllMatches |
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
"--- secret-like patterns"
$secret = '(?i)(client_?secret|api[_-]?key|password|connectionstring|sig=|eyJ[a-zA-Z0-9_-]{20,})'
Get-ChildItem .\src -Recurse -File | Select-String -Pattern $secret
Get-ChildItem .\release\assets\*.js | Select-String -Pattern $secret -AllMatches |
    ForEach-Object { $_.Matches.Value } | Group-Object | Select-Object Count, Name
```

Výsledky kroků 5 a 6 zapiš do `HARDENING.md` v kořeni projektu: každý nález s jednou větou
„co to je a proč to (ne)vadí".

**Checkpoint:** `HARDENING.md` vysvětluje každou adresu a každý nález (referenční nálezy
a jejich vysvětlení: [`mereni-hardening.md`](mereni-hardening.md)).

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/utils/perf.ts` | nový | `measure`: performance mark + `Log.info` s dobou volání |
| `src/services/employeeService.ts` | změněný | měří volání Graph `/users` (`vltava-graph-users`) |
| `src/services/equipmentService.ts` | změněný | měří čtení seznamu `Equipment` (`vltava-equipment-load`) |
| `src/components/ErrorBoundary.tsx` | nový | chyba vykreslení skončí hláškou, ne prázdným web partem |
| `src/components/ErrorBoundary.module.scss` | nový | vzhled hlášky bez Fluent UI (žádné KB navíc) |
| `src/webparts/{portal,employeeDirectory,equipment}/*WebPart.ts` | změněné (3) | komponenta obalená `ErrorBoundary` |
| `src/webparts/{portal,employeeDirectory,equipment}/loc/mystrings.d.ts` | změněné (3) | klíč `RenderError` |
| `src/webparts/{portal,employeeDirectory,equipment}/loc/{en-us,cs-cz}.js` | změněné (6) | text `RenderError` |

`package.json` se v tomto labu nemění. `HARDENING.md` je tvůj vlastní výstup — v `solution/`
není, referenční nálezy jsou v [`mereni-hardening.md`](mereni-hardening.md).

Tento stav je **Startovní čárou** modulu [`equipment-desk`](../equipment-desk/). Když ti něco
nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Volání Graphu a seznamu se měří a loguje do Developer Dashboardu.
- [ ] Chyba vykreslení jednoho web partu nerozbije stránku.
- [ ] Test lokalizace zachytil chybějící `RenderError`.
- [ ] `HARDENING.md` s vysvětlenými nálezy.
- [ ] **Negativní:** stránka s chybou není prázdná; `npm audit fix` nespuštěn.

## Fallback

- **Developer Dashboard se neotevře** — Ctrl+F12 musí jít do stránky (klikni do ní); ve
  Firefoxu může klávesu zachytit prohlížeč.
- **Trace je prázdný** — `Log.info` z `localhost` se zapisuje jen po načtení debug skriptů.
- **`npm sbom` neznámý příkaz** — starší npm; `npm --version` musí být 10.x.
- **Při časové tísni:** krok 4 bod 2 a krok 6 jako demo; `HARDENING.md` jen s výsledky kroku 5.
  Kdo nestihne kroky 1–2, převezme [Výstupní stav](#výstupní-stav) podle scénáře a pokračuje
  krokem 3.

## Zdroje (Microsoft)

- [Use the developer dashboard](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-developer-dashboard)
- [Understanding npm audit vulnerabilities in SPFx projects](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/npm-vulnerabilities)
