# Instructor notes — První web part

## Timing

- ~25 min výklad + 60 min lab + 5 min shrnutí dne.
- Chránit kroky 2–5 a 9–10 (smyčka, lokalizační past, moderní stránka, „kód je jen u mě").
  Kroky 6 a 8 padají první.
- Kdo je pozadu z `project-anatomy`, nedohání mapu ani měření — převezme celý
  `project-anatomy/solution/` podle scénáře (`robocopy`, `npm install`, `Set-StudentIdentity.ps1`).

## Go/no-go — otestovat před během

- Na kurzovním tenantu ověřit, že **hosted workbench** (`/_layouts/workbench.aspx`) ještě
  funguje (deprecated od 2026-05-13, retirement 2026-12-01). Pokud ne, krok 3 a 7–8 dělat
  rovnou na moderní stránce (krok 9) — lab funguje i tak.
- Edge na učebním stroji: verze ≥ 142 → dotaz na **Local Network Access** přijde. Vyzkoušet,
  jestli ho nezakazuje politika prohlížeče na učebně (pak se web part nenačte nikde).
- `heft trust-dev-cert` vyžaduje potvrzení dialogu Windows — ověřit, že ho politika učebny
  nezakazuje (instalace do `CurrentUser\Root`).

## Tripwires

- **`npm start` otevře výchozí prohlížeč** s jiným účtem nebo bez přihlášení. Proto
  `--nobrowser` a ruční otevření v profilu `cloudedu`.
- **Zapomenutý query string** u workbenche nebo stránky — web part chybí v toolboxu, bez
  chybové hlášky.
- **Odmítnutý dotaz na lokální síť** — prohlížeč si odpověď pamatuje. Opravit v nastavení
  webu (ikona zámku → Site permissions → Local network access → Allow).
- **Publikovaná testovací stránka** — po skončení `npm start` uvidí ostatní na stránce chybu
  web partu. Trvat na *Save as draft* / *Discard*.
- **Manifest se neprojeví** — server restartovat, ne jen uložit.
- **Ladění ve VS Code** — vygenerovaný `.vscode/launch.json` má v `url` doslova
  `{tenantDomain}`; VS Code proměnnou nedosazuje. Pro demo lektora přepsat URL ručně
  (a necommitovat).

## Vazby

- Zpět: `project-anatomy` (projekt, manifest, `loc/`).
- Dopředu: `property-pane` (odkazy natvrdo → konfigurace), `localization` (`cs-cz.js`,
  fallback), `react-fluent-ui` (třídní komponenta → funkční), `extensions` (testování jen
  na moderní stránce).
