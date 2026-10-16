# Měření · Optimalizace a experimenty dne 4

Surová data k tvrzením v [`README.md`](README.md) a v
[`../extensions/README.md`](../extensions/README.md). Lektorský stroj, Windows 11 Pro,
Node.js 22.22.0, npm 10.9.9, SPFx 1.23.2, `npm run build`, měřeno skriptem
[`../../scripts/Measure-BundleSize.ps1`](../../scripts/Measure-BundleSize.ps1).

## 2026-10-16 — stav po `extensions` (výchozí pro tento blok)

| Bundle | Raw | Gzip |
|---|---|---|
| `portal-web-part` | 239 962 B | 73 447 B |
| `employee-directory-web-part` | 234 791 B | 71 218 B |
| `equipment-web-part` | 454 270 B | 131 596 B |
| `issue-equipment-command-set` | 43 212 B | 14 237 B |
| `portal-banner-application-customizer` | 5 499 B | 2 412 B |

Banner s Reactem a `MessageBar` z Fluent UI (experiment, nepoužito): **188 628 B**.

## Experiment 1 — oprava barrelu (ponecháno)

`Portal.tsx` importuje `useFilteredLinks` přímo, ne přes `src/hooks/index.ts`.

| Bundle | Před | Po | Delta |
|---|---|---|---|
| `portal-web-part` raw | 239 962 B | 206 511 B | **−33 451 B** |
| `portal-web-part` gzip | 73 447 B | 62 953 B | −10 494 B |

## Experiment 2 — lazy loading panelu „Přidat vybavení" (zamítnuto)

`AddEquipmentPanel` (Panel, TextField, Dropdown) přes `React.lazy` + `import()`.

| Soubor | Bez lazy | S lazy |
|---|---|---|
| `equipment-web-part` | 454 270 B | 464 162 B (**+9 892 B**) |
| `chunk.add-equipment-panel` | — | 16 831 B |
| celkem | 454 270 B | 480 993 B |

Panel sdílí jádro Fluent UI s `DetailsList`; oddělit nebylo co, přibyla režie načítání chunků.

## Experiment 3 — lazy loading celé komponenty Evidence (zamítnuto)

`EquipmentWebPart` vykresluje `React.lazy(() => import('./components/Equipment'))`.

| Soubor | Velikost |
|---|---|
| `equipment-web-part` (načte se hned) | 50 872 B |
| `chunk.741` (vyčleněný vendor chunk, Fluent UI + PnPjs) | 432 113 B |
| `chunk.equipment-ui` | 5 271 B |
| celkem | 488 256 B (**+33 986 B** proti 454 270 B) |

Počáteční bundle je 9× menší, celkem se stahuje víc. Pro web part, který se vykresluje hned
po načtení stránky, to nic nezrychlí — UI se stejně musí stáhnout celé.

## Stav po bloku (ponechané změny: barrel + cache hledání)

Proti baseline ze středy (`../../day-3/bundle-baseline/mereni-baseline.md`):

| Bundle | Středa | Čtvrtek | Delta |
|---|---|---|---|
| `portal-web-part` | 238 632 B | 206 519 B | **−32 113 B** |
| `employee-directory-web-part` | 234 791 B | 235 354 B | +563 B (cache) |
| `equipment-web-part` | 452 625 B | 454 270 B | +1 645 B (`ensureUser`) |

## Otevřené otázky

- Počet požadavků na `/users` při opakovaném hledání s cache a bez ní — měří student v labu
  (Network), neměřeno na tenantu.
- Doba vykreslení — pátek, `diagnostics-hardening`.
