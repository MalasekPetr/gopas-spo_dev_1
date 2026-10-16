# Instructor notes — Anatomie projektu

## Timing

- ~20 min výklad (během `npm install`) + 40 min lab.
- Dramaturgie stojí na souběhu: krok 1–2 labu **před** výkladem, výklad mapy projektu
  běží, zatímco se instaluje. Kdo začne výkladem, ztratí s třídou čas instalace.
- Čas instalace na učebně **neměřen** — viz měření na lektorském stroji v README. Sesbírat
  čísla studentů (krok 2 a 5) na tabuli a zapsat do `mereni-instalace.md` s datem.

## Go/no-go — otestovat před během

- Na učebním stroji (ne na svém) jednou projít `yo` + `npm install` + `npm run build` den
  předem. Pokud instalace na učebně trvá déle než ~15 min, připravit plán B: lektor nasdílí
  `node_modules` jako ZIP na síťový disk (stejná verze Node.js!).
- Generátor `1.23.2` dává `"useGulp": false` — ověřit v `.yo-rc.json` po vygenerování.

## Tripwires

- **Parametry generátoru s `<ini>`** — studenti zkopírují příkaz i se špičatými závorkami.
  Název řešení pak obsahuje `<` a generátor selže nebo vytvoří nesmyslnou složku.
- **Antivir na Windows** — rozbalování desítek tisíc souborů do `node_modules` je na Windows
  pomalejší než stahování. Pokud instalace „visí" bez výstupu, sledovat počet souborů
  v `node_modules`, ne log npm.
- **`npm audit fix`** — npm na konci instalace hlásí zranitelnosti a studenti ho spustí.
  Nespouštět: aktualizuje závislosti mimo testovanou sadu SPFx. Release notes 1.23.2
  vysvětlují, proč hlášené `moderate` zranitelnosti toolchainu nejdou do `.sppkg`.
- **„Kde je `.sppkg`?"** — v `sharepoint\solution\`, ne v `solution\` v kořeni.
- **Mapa projektu jako opisování** — trvat na cestě k souboru u každé odpovědi; bez ní se
  nenaučí, kde hledat.

## Vazby

- Zpět: `dev-environment`.
- Dopředu: `first-webpart` (tentýž projekt), `bundle-baseline` (velikost balíčku poprvé
  měřeně), `packaging-deployment` (`package-solution.json` do hloubky).
