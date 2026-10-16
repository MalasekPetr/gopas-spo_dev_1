# Instructor notes — Lokalizace a více jazyků

## Timing

- ~15 min výklad + 30 min lab.
- Krok 1 (založení českého webu) pustit **na začátku výkladu** — zřízení webu chvíli trvá.
- Krok 6 je jádro bloku (záloha po souborech, ne po klíčích). Nekrátit.

## Go/no-go — otestovat před během

- Den předem na kurzovním tenantu: hosted workbench na webu založeném v češtině opravdu načte
  `cs-cz.js` (dokumentace to tvrdí pro jazyk kontextového webu). Pokud ne, plán B:
  `npm start -- --nobrowser --locales cs-cz` (dokumentace ho uvádí pro lokální workbench)
  — ověřit, zda platí i pro hosted.
- Krok 5: zobrazí debug manifest lokalizovaný název v toolboxu moderní stránky? **Neověřeno.**
  Výsledek zapsat sem a do README.

## Tripwires

- **Diakritika v manifestu** — editor uloží soubor v jiném kódování (zřídka ve VS Code,
  častěji v Notepadu). Výsledek: rozsypané znaky v toolboxu.
- **`cs-CZ` vs. `cs-cz`** — v manifestu velká druhá část, název souboru malými.
- **„Proč se nepřeložily odkazy?"** — jsou to data od editora, ne texty aplikace.
- **Uživatel má jiný preferovaný jazyk** — na webu s více jazyky (MUI) rozhoduje preference
  uživatele, na webu s jedním jazykem jazyk webu. Kurzovní weby mají jeden jazyk.

## Vazby

- Zpět: `first-webpart` (`.d.ts` vs. `.js`), `property-pane` (nové klíče).
- Dopředu: `ci-cd-quality` (test parity klíčů v pipeline).
