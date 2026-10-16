# Měření · Velikost bundlu po přidání Fluent UI

Surová data k tvrzení v [`README.md`](README.md).

## 2026-10-16 — lektorský stroj

Windows 11 Pro, Node.js 22.22.0, npm 10.9.9, SPFx 1.23.2, `npm run build` (produkční).
Měřený soubor: `release/assets/portal-web-part_<hash>.js` (bez lokalizačních souborů).

| Stav řešení | Fluent UI v kódu | Bundle | Build |
|---|---|---|---|
| konec dne 1 (`first-webpart`) | žádné | 7 182 B | 7 s |
| po `property-pane` | žádné; přibyl `SPHttpClient` a validace | 11 693 B | — |
| po `localization` | žádné; přibyl `cs-cz.js` (samostatný soubor 1 705 B) | 11 693 B | — |
| po `react-fluent-ui` | `Text`, `SearchBox`, `Link`, `Icon`, `ThemeProvider`, `getId` z `@fluentui/react` | **206 511 B** | 12 s |
| totéž, importy z `@fluentui/react/lib/<Komponenta>` | dtto | 206 532 B | — |

## Co z toho plyne

- Fluent UI v8 přidal ~195 KB nekomprimovaného JavaScriptu. Webpack produkčního buildu
  nepoužité komponenty odstraní (proto importy přes `lib/…` nic neušetří); zbytek je sdílené
  jádro — styly, motivy, utility.
- Lokalizace velikost bundlu nemění: každý jazyk je samostatný soubor a stránka stáhne jen
  jeden.

## Otevřené otázky

- Velikost přenosu po kompresi (gzip/brotli z CDN SharePointu) — neměřeno. Změřit ve středu
  v `bundle-baseline` v nástrojích prohlížeče.
- Kolik z 206 KB připadá na `ThemeProvider` — změřit ve čtvrtek v `performance-caching`.

## Jak měření zopakovat

```powershell
npm run build
Get-ChildItem .\release\assets\*-web-part_*.js | Select-Object Name, Length
```
