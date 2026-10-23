# Lab · Oprava importu, zkouška lazy loadingu, cache hledání

> Modul: `performance-caching` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení s opraveným importem a cache hledání, soubor `measurements/day4.json` a tabulka delty
proti středečnímu baseline — včetně jednoho změřeného a vráceného experimentu.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- `measurements/baseline.json` ze středy (lab [`bundle-baseline`](../../day-3/bundle-baseline/)).
  Kdo ho nemá, převezme ho od souseda — jde jen o čísla, ne o kód.

## Startovní čára

Lab začíná u stavu po modulu [`extensions`](../extensions/): referenční kód
[`../extensions/solution/vltava-portal/`](../extensions/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**). `robocopy /E` nic nemaže —
  složka `measurements/` zůstane.

**Checkpoint:** `npm run build` projde; v `src/extensions/` jsou složky `portalBanner`
a `issueEquipment`; soubor `src/utils/sessionCache.ts` **neexistuje**.

## Část A — Měření a oprava importu (20 min)

### 1. Změř výchozí stav dne

Každá optimalizace se porovnává s číslem, ne s dojmem. Výchozí stav dne si ulož zvlášť.

```powershell
npm run build
$measure = "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1"
& $measure -ProjectPath . -OutFile .\measurements\day4-start.json
```

**Checkpoint:** tabulka má i `portal-banner-application-customizer` a `issue-equipment-command-set`.

### 2. Oprav import v Rozcestníku

Rozcestník bere hook přes barrel `src/hooks/index.ts`. Barrel exportuje i `useEquipment`,
ten táhne `equipmentService` s vedlejšími efekty PnPjs — a webpack vedlejší efekty odstranit
nesmí. Přímý import do souboru hooku PnPjs z bundlu Rozcestníku vyřadí.

Soubor `src/webparts/portal/components/Portal.tsx` — **změna**: najdi

```typescript
import { useFilteredLinks } from '../../../hooks';
```

a nahraď:

```typescript
// Direct import, not the hooks barrel: the barrel also exports hooks that pull in PnPjs.
import { useFilteredLinks } from '../../../hooks/useFilteredLinks';
```

```powershell
npm run build
& $measure -ProjectPath . -BaselineFile .\measurements\day4-start.json
```

**Checkpoint:** `portal-web-part` má `RawDelta` kolem **−33 000 B**; ostatní bundly 0.

## Část B — Experiment: lazy loading (15 min)

### 3. Vyzkoušej lazy loading celé Evidence — a vrať ho

Experiment **nepatří** do výsledného kódu: změříš ho a vrátíš. Ve `solution/` není.

Soubor `src/webparts/equipment/EquipmentWebPart.ts` — **dočasná změna**:

1. najdi `import Equipment from './components/Equipment';` a nahraď řádkem

   ```typescript
   const Equipment = React.lazy(() => import(/* webpackChunkName: 'equipment-ui' */ './components/Equipment'));
   ```

2. v `render()` obal vytvoření komponenty do `Suspense`:

   ```typescript
   const element: React.ReactElement = React.createElement(React.Suspense, { fallback: null },
     React.createElement(Equipment, {
       service: this._service,
       listUrl: `${this.context.pageContext.web.absoluteUrl}/Lists/Equipment`,
       theme: this._theme
     } as IEquipmentProps));
   ```

```powershell
npm run build
& $measure -ProjectPath . -BaselineFile .\measurements\day4-start.json
```

Sečti všechny řádky začínající `equipment-web-part` a `chunk.`.

**Checkpoint:** `equipment-web-part` je kolem 50 000 B, ale součet s chunky je **větší** než
ve výchozím stavu (referenční: 488 256 B vs. 454 270 B).

**Vrať změnu** (`import Equipment from ...` a původní `render()`). Kdo používá Git:
`git checkout -- src/webparts/equipment/EquipmentWebPart.ts`.

**Checkpoint (negativní):** po vrácení a buildu nejsou v `release\assets` žádné soubory
`chunk.*`.

## Část C — Cache hledání v Adresáři (20 min)

### 4. Přidej cache do `utils`

Opakované hledání stejného jména nemá jít znovu do Graphu. Cache drží výsledek v paměti
a v `sessionStorage` — data adresáře tak po zavření karty na zařízení nezůstanou.

Soubor `src/utils/sessionCache.ts` — **nový**:

```typescript
// Small read-through cache: memory first, then sessionStorage, then the loader.
// sessionStorage lives only for the browser tab: tenant data does not stay on the device
// after the tab is closed (unlike localStorage or IndexedDB).

interface ICacheEntry<T> {
  expires: number;
  value: T;
}

const PREFIX: string = 'vltava-portal:';
const memory: Map<string, ICacheEntry<unknown>> = new Map<string, ICacheEntry<unknown>>();

function readSession<T>(key: string): ICacheEntry<T> | undefined {
  try {
    const raw: string | null = window.sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) as ICacheEntry<T> : undefined;
  } catch {
    return undefined; // storage blocked or corrupted entry
  }
}

function writeSession<T>(key: string, entry: ICacheEntry<T>): void {
  try {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota exceeded or storage blocked: memory cache still works
  }
}

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now: number = Date.now();
  const hit: ICacheEntry<T> | undefined = (memory.get(key) as ICacheEntry<T> | undefined) || readSession<T>(key);
  if (hit && hit.expires > now) {
    memory.set(key, hit);
    return hit.value;
  }
  const value: T = await load();
  const entry: ICacheEntry<T> = { expires: now + ttlMs, value };
  memory.set(key, entry);
  writeSession(key, entry);
  return value;
}
```

Soubor `src/utils/index.ts` — **změna**: na konec souboru přidej:

```typescript
export { cached } from './sessionCache';
```

- `PREFIX` odliší klíče řešení od všeho ostatního v `sessionStorage` tenantu.
- Prošlý záznam se nemaže, jen přepíše dalším načtením — `sessionStorage` zanikne s kartou.

**Checkpoint:** `npm run build` projde (`cached` zatím nikdo nevolá).

### 5. Pošli hledání přes cache

Hledání se přesune do vnitřní funkce `searchGraph`; veřejné `search` jen normalizuje text
a volá `cached(...)`. Presence se **necachuje** — mění se každou minutu.

Soubor `src/services/employeeService.ts` — **změna**: najdi

```typescript
import type { IEmployee, PresenceMap } from '../models';
```

a přidej za něj:

```typescript
import { cached } from '../utils/sessionCache';
```

Najdi

```typescript
const PAGE_SIZE: number = 25;
```

a přidej za něj:

```typescript
const SEARCH_CACHE_MS: number = 5 * 60 * 1000;
```

Najdi celý začátek funkce `createEmployeeService` až po konec metody `search`:

```typescript
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
```

a nahraď:

```typescript
export function createEmployeeService(client: MSGraphClientV3): IEmployeeService {

  async function searchGraph(needle: string): Promise<IEmployee[]> {
    // $search and $count are "advanced queries": they need the ConsistencyLevel header.
    let request = client
      .api('/users')
      .header('ConsistencyLevel', 'eventual')
      .count(true)
      .select(SELECT_FIELDS)
      .orderby('displayName')
      .top(PAGE_SIZE);
    if (needle) {
      request = request.search(`"displayName:${needle}"`);
    }
    const response: { value: User[] } = await request.get();
    return response.value.map(toEmployee);
  }

  return {
    search(query: string): Promise<IEmployee[]> {
      const needle: string = query.replace(/"/g, '').trim();
      // The same search within 5 minutes is served from the cache, not from Graph.
      return cached(`users:${needle.toLocaleLowerCase()}`, SEARCH_CACHE_MS, () => searchGraph(needle));
    },
```

V `getPresence` najdi

```typescript
      // Needs the Presence.Read.All delegated permission; throws 403 when not granted.
```

a přidej **před** něj:

```typescript
      // Presence changes every minute: never cached.
```

- Klíč je normalizovaný (`trim`, malá písmena): `Jan` a ` jan ` jsou jedna položka cache.
- `search` už není `async` — vrací rovnou slib z `cached`.

**Checkpoint:** `npm run build` projde; `Select-String .\src\services\employeeService.ts -Pattern 'cached\('`
najde jeden řádek.

> [!WARNING] Hosted workbench končí 2026-12-01
> SPFx 1.23 je podle release notes **poslední verze s podporou** hosted workbenche: je
> deprecated od 2026-05-13 a 2026-12-01 se retiruje
> ([SPFx v1.23.0 release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.0#deprecations)).
> **Po tomto datu nebo v projektu na SPFx 1.24+** udělej krok 6 na testovací stránce svého
> webu s parametry `?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`
> (postup: [`first-webpart`, krok 9](../../day-1/first-webpart/lab-prvni-webpart.md#9-otestuj-na-skutečné-stránce)).

### 6. Ověř cache v prohlížeči

```powershell
npm start -- --nobrowser
```

Workbench + Adresář. F12 → **Network**, filtr `users`:

1. Hledej `jan`, počkej na výsledek.
2. Smaž hledání a napiš znovu `jan`.
3. F12 → **Application** → **Session storage** → adresa tenantu.

**Checkpoint:** v bodě 2 **nepřibyl** nový požadavek na `/users`. V Session storage je klíč
`vltava-portal:users:jan`.

**Checkpoint (negativní):** v **Local storage** žádný klíč `vltava-portal:` není — data
adresáře nezůstanou na zařízení po zavření karty.

## Část D — Delta proti středě (5 min)

### 7. Změř stav dne proti středě

```powershell
npm run build
& $measure -ProjectPath . -BaselineFile .\measurements\baseline.json -OutFile .\measurements\day4.json
```

**Checkpoint:** `portal-web-part` má proti středě zápornou deltu kolem −32 000 B. Tabulku si
ulož — v pátek ji obhajuješ.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/webparts/portal/components/Portal.tsx` | změněný | přímý import hooku, PnPjs mimo bundle Rozcestníku |
| `src/utils/sessionCache.ts` | nový | cache v paměti a `sessionStorage` s expirací |
| `src/utils/index.ts` | změněný | export `cached` |
| `src/services/employeeService.ts` | změněný | hledání přes `cached(...)`, presence bez cache |
| `src/webparts/equipment/EquipmentWebPart.ts` | **beze změny** | experiment s lazy loadingem vrácený |

Mimo `solution/` máš navíc `measurements/day4-start.json` a `measurements/day4.json`.

Tento stav je **Startovní čárou** modulu [`packaging-deployment`](../packaging-deployment/).
Když ti něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Import v Rozcestníku opravený, úspora změřená.
- [ ] Experiment s lazy loadingem změřený a vrácený.
- [ ] Opakované hledání nejde do Graphu; data jsou v Session storage, ne v Local storage.
- [ ] `measurements/day4.json` s deltou proti středě.
- [ ] **Negativní:** po vrácení experimentu nejsou v buildu chunky.

## Fallback

- **Delta po kroku 2 je 0** — Portal.tsx importuje ještě odjinud z barrelu; hledat
  `from '../../../hooks'` v `src/webparts/portal`.
- **TypeScript chyba v kroku 3** — `React.ReactElement` bez typového parametru a `as
  IEquipmentProps` u props.
- **Cache nefunguje** — hledaný text se liší mezerou nebo velikostí písmen? Klíč je
  normalizovaný (`trim`, malá písmena); jinak porovnat se solution.
- **Při časové tísni:** krok 3 jako demo lektora (data jsou v README). Kód kroků 4–5 převzít
  podle [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).

## Zdroje (Microsoft)

- [Debug SharePoint Framework solutions on modern pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)

## Zdroje (třetí strana — React)

- [React — lazy](https://react.dev/reference/react/lazy)
