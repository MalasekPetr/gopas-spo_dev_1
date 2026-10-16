# Měření · Diagnostika a hardening referenčního řešení

Surová data k [`README.md`](README.md). Referenční řešení
[`solution/vltava-portal/`](solution/vltava-portal/), lektorský stroj, Node.js 22.22.0,
npm 10.9.9, SPFx 1.23.2.

## 2026-10-16 — cena error boundary

| Varianta záložní hlášky | `portal-web-part` | Delta proti stavu bez error boundary (206 519 B) |
|---|---|---|
| Fluent UI `MessageBar` | 214 865 B | +8 346 B |
| `<div role="alert">` + CSS modul (ponecháno) | 207 166 B | +647 B |

## 2026-10-16 — závislosti

`npm audit` (všechny závislosti): 54 — 0 critical, 21 high, 33 moderate, 0 low.
High mimo jiné v `@microsoft/spfx-heft-plugins`, `@microsoft/spfx-web-build-rig`,
`@rushstack/heft` a jeho pluginech (nástroje buildu).

`npm audit --omit=dev` (jen produkční, 210 balíčků): **0**.

`npm sbom --sbom-format cyclonedx --omit dev` — 171 komponent:

| Licence | Počet |
|---|---|
| MIT | 138 |
| bez SPDX v SBOM | 24 |
| 0BSD | 6 |
| Apache-2.0 | 2 |
| BSD-2-Clause | 1 |

Bez SPDX: 23 balíčků `@microsoft/sp-*` a souvisejících (licence v `package.json` je odkaz
`https://aka.ms/spfx/license` — Microsoft EULA) a `raw-loader`.

## 2026-10-16 — obsah bundlů

Adresy `https://…` v `release/assets/*.js` (mimo texty z lokalizačních souborů):

| Adresa | Kde | Je to požadavek? |
|---|---|---|
| `res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets` | Fluent UI, výchozí `fontBaseUrl` | jen pokud stránka nenastaví `FabricConfig` — ověřit v Network |
| `pnp.github.io/pnpjs/...` | text chybové hlášky PnPjs | ne |
| `github.com/microsoft/fluentui/wiki/Using-icons` | text varování Fluent UI | ne |

Hledání vzorů tajemství (`client_secret`, `api_key`, `password`, `connectionstring`, SAS
`sig=`/`sv=`, JWT `eyJ…`, `bearer …`):

- `src/`: 0 nálezů
- bundly: 10× `password` — vše Fluent UI (`type="password"` v seznamu typů vstupu,
  `isRevealingPassword` v TextField). Falešné poplachy.

## Otevřené otázky

- Stahuje stránka SharePointu fonty z `res-1.cdn.office.net`, nebo je obsluhuje vlastní
  konfigurace? Ověřit v Network na kurzovním tenantu.
