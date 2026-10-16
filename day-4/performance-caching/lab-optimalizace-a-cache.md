# Lab · Oprava importu, zkouška lazy loadingu, cache hledání

> Modul: `performance-caching` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení s opraveným importem a cache hledání, soubor `measurements/day4.json` a tabulka delty
proti středečnímu baseline — včetně jednoho změřeného a vráceného experimentu.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`../packaging-deployment/solution/vltava-portal/`](../packaging-deployment/solution/vltava-portal/).

## Předpoklady

- Hotový `extensions`; `measurements/baseline.json` ze středy.

## Kroky

### 1. Změř výchozí stav dne

```powershell
npm run build
$measure = "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1"
& $measure -ProjectPath . -OutFile .\measurements\day4-start.json
```

**Checkpoint:** tabulka má i `portal-banner-application-customizer` a `issue-equipment-command-set`.

### 2. Oprav import v Rozcestníku

V `src/webparts/portal/components/Portal.tsx` nahraď import hooku:

```typescript
// Direct import, not the hooks barrel: the barrel also exports hooks that pull in PnPjs.
import { useFilteredLinks } from '../../../hooks/useFilteredLinks';
```

```powershell
npm run build
& $measure -ProjectPath . -BaselineFile .\measurements\day4-start.json
```

**Checkpoint:** `portal-web-part` má `RawDelta` kolem **−33 000 B**; ostatní bundly 0.

### 3. Experiment: lazy loading celé Evidence

V `src/webparts/equipment/EquipmentWebPart.ts` **dočasně**:

1. nahraď `import Equipment from './components/Equipment';` řádkem

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

**Vrať změnu** (`import Equipment from ...` a původní `render()`).

**Checkpoint (negativní):** po vrácení a buildu nejsou v `release\assets` žádné soubory
`chunk.*`.

### 4. Přidej cache hledání

Ze solution zkopíruj `src/utils/sessionCache.ts`, do `src/utils/index.ts` přidej
`export { cached } from './sessionCache';` a nahraď `src/services/employeeService.ts`
souborem ze solution (hledání jde přes `cached(...)`, presence ne).

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

### 5. Změř stav dne proti středě

```powershell
npm run build
& $measure -ProjectPath . -BaselineFile .\measurements\baseline.json -OutFile .\measurements\day4.json
```

**Checkpoint:** `portal-web-part` má proti středě zápornou deltu kolem −32 000 B. Tabulku si
ulož — v pátek ji obhajuješ.

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
- **Při časové tísni:** krok 3 jako demo lektora (data jsou v README).

## Zdroje (Microsoft)

- [Debug SharePoint Framework solutions on modern pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)

## Zdroje (třetí strana — React)

- [React — lazy](https://react.dev/reference/react/lazy)
