# Měření · Baseline balíčku po dni 3

Surová data k tvrzením v [`README.md`](README.md). Projekt: referenční řešení
[`solution/vltava-portal/`](solution/vltava-portal/), stav na konci dne 3.

## 2026-10-16 — lektorský stroj

Windows 11 Pro, Node.js 22.22.0, npm 10.9.9, SPFx 1.23.2, `npm run build` (produkční, 14 s),
měřeno skriptem [`../../scripts/Measure-BundleSize.ps1`](../../scripts/Measure-BundleSize.ps1).
Gzip = odhad přenosu (.NET `GZipStream`, optimální úroveň); skutečný přenos závisí na CDN.

| Bundle | Raw | Gzip |
|---|---|---|
| `portal-web-part` (Rozcestník) | 238 632 B | 73 108 B |
| `employee-directory-web-part` (Adresář) | 234 791 B | 71 218 B |
| `equipment-web-part` (Evidence) | 452 625 B | 131 228 B |
| lokalizační soubory (6×) | 572–1 945 B | 332–751 B |
| `.sppkg` celkem | 310 897 B | — |

## Rozcestník vyrostl, aniž se změnil

| Stav | `portal-web-part` |
|---|---|
| konec dne 2 | 206 511 B |
| konec dne 3, `Portal.tsx` importuje `from '../../../hooks'` (barrel) | 238 632 B |
| konec dne 3, `Portal.tsx` importuje `from '../../../hooks/useFilteredLinks'` | 206 511 B |

Barrel `src/hooks/index.ts` po bloku `pnpjs` exportuje i `useEquipment`. Ten importuje
`equipmentService` a s ním vedlejší efekty `@pnp/sp/webs`, `/lists`, `/items`, `/batching`.
Webpack vedlejší efekty odstranit nesmí, takže **PnPjs (+32 121 B) skončí i v Rozcestníku**,
který PnPjs nepoužívá.

## Otevřené otázky

- Skutečná velikost přenosu z CDN SharePointu (F12 → Network → *Transferred*) — neměřeno;
  změřit ve čtvrtek po nasazení nové verze.
- Doba prvního vykreslení web partu — měří se v pátek v `diagnostics-hardening`
  (performance marks).

## Jak měření zopakovat

```powershell
npm run build
& "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" -ProjectPath . -OutFile .\measurements\baseline.json
```
