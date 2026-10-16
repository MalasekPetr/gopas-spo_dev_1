# Instructor notes — Property pane a dynamická konfigurace

## Timing

- ~25 min výklad + 60 min lab + 5 min shrnutí.
- Kroky 2–7 jsou převážně kopírování a čtení kódu (~20 min). Hlídat, aby studenti **četli**
  `links.ts` a tabulku v kroku 6 — jinak odpoledne nerozumí, co přestavují.
- Chránit kroky 8 a 10 (validace, asynchronní dropdown). Kroky 9 a 11 padají první.

## Go/no-go — otestovat před během

- Na kurzovním tenantu ověřit, že `/_api/web/lists?$filter=BaseTemplate eq 101 ...` na novém
  komunikačním webu vrátí aspoň knihovnu *Documents* (a v jakém názvu — anglický web).
- Snapshot `solution/vltava-portal/` ověřený buildem 2026-10-16 (bundle 11 693 B). Po změně
  verze SPFx znovu sestavit.

## Tripwires

- **Server běží při změně manifestu** — nové výchozí vlastnosti se neprojeví. Restart.
- **Hosted workbench si pamatuje plátno** — staré instance web partu se starými vlastnostmi
  můžou matoucí. Pro test vložit web part znovu.
- **„Proč ne PnP property controls?"** — padne vždy. Odpověď: lze, ale je to závislost s vlastním
  cyklem vydání a vlastní velikostí; kurz chce nejdřív vidět, co umí platforma.
- **Dropdown prázdný bez chyby** — student otevřel property pane dřív, než doběhlo načtení,
  a zavřel ho. Načítání proběhne jen jednou za načtení stránky; F5 a znovu.
- **Odkazy s `http://`** — validace je odmítne schválně (smíšený obsah na HTTPS stránce).

## Vazby

- Zpět: `first-webpart` (odkazy natvrdo, `loc/`).
- Dopředu: `localization` (texty z kroku 4 do češtiny), `react-fluent-ui` (komponenta),
  `data-access-clients` (SPHttpClient podrobně), `ci-cd-quality` (unit testy `links.ts`).
