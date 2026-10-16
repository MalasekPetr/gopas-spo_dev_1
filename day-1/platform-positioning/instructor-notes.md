# Instructor notes — SPFx v Microsoft 365 — pozice a hranice tenantu

## Timing

- ~25 min výklad + 15 min lab + 5 min společné srovnání.
- Historii držet na tabulce zlomů (5 min). Chránit „Kdy SPFx, a kdy ne" a hranici tenantu —
  na obojí se týden vrací.
- Blok běží ráno, kdy se ještě dobíhá s účty a MFA. Pokud studenti čekají na účty, lab
  pustit dřív a výklad o hranici tenantu dát po labu.

## Go/no-go — otestovat před během

- Studentské účty a hesla připravené (bez nich nejde navazující `dev-environment`).
- Stav SPFx 1.24 a Copilot UX components ověřit v den běhu (roadmap / npm `latest`).
  Pokud 1.24 mezitím vyšla GA, jen to říct — kurz zůstává na 1.23.2.

## Tripwires

- **„SPFx umí všechno"** — studenti z .NET světa chtějí SPFx pro automatizaci (řádek 4 labu).
  Zdůraznit: SPFx nemá backend a neběží bez otevřené stránky.
- **„Komponenta má vlastní oprávnění"** — nemá, běží jako uživatel. Tohle se vrátí
  ve středu, kdy schválené oprávnění platí pro celý tenant.
- **Add-ins** — někdo bude mít doma SharePoint Server s Add-iny. Odpověď: on-prem jiná
  kapitola, kurz je o SharePoint Online (viz NOTE v README).

## Vazby

- Zpět: —
- Dopředu: `dev-environment` (instalace), `permissions-consent` (schválení oprávnění),
  `extensions` (placeholdery místo DOM), `diagnostics-hardening` (data mimo tenant).
