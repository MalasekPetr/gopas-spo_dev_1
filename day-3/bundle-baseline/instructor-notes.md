# Instructor notes — Výkon I: baseline balíčku

## Timing

- ~15 min výklad + 40 min lab + 5 min shrnutí dne.
- Pointa je krok 3–4 (PnPjs v Rozcestníku). Výklad o tom předem **neprozrazovat** — nechat
  studenty v treemapě najít `@pnp` sami.

## Go/no-go — otestovat před během

- Referenční čísla 2026-10-16: 238 632 / 234 791 / 452 625 B, `.sppkg` 310 897 B,
  s přímým importem Rozcestník 206 511 B. Po změně verzí balíčků přeměřit.
- `webpack-bundle-analyzer@4.10.2` se nainstaluje na učebně (stahuje se z npm).
- Skript `Measure-BundleSize.ps1` v repu (studenti ho volají z klonu repa).

## Tripwires

- **Studenti „opraví" barrel hned** a nevrátí ho — pak nemají ve čtvrtek co měřit. Krok 4
  končí vrácením; kontrolovat delta 0.
- **`build.stats.json` má ~100 MB** — v `temp/`, gitignorované; neotevírat v editoru.
- **„Proč je Evidence tak velká?"** — `DetailsList`, `Panel`, `Dropdown` z Fluent UI + PnPjs.
  Odpověď ve čtvrtek (lazy loading).
- **Rozdílná čísla mezi studenty** — jiný kód (dohnaný skluz, upravené komponenty) nebo jiná
  verze `@fluentui/react` (`^8.106.4` v `package.json` povolí novější). Nezamlčet — je to
  argument pro lockfile.

## Vazby

- Zpět: `react-fluent-ui` (206 511 B), `pnpjs` (barrel).
- Dopředu: `performance-caching` (oprava + nové měření), `ci-cd-quality` (`-MaxBytes`
  v pipeline), `capstone` (obhajoba delty).
