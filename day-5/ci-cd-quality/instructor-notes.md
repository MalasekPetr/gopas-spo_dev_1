# Instructor notes — CI/CD a quality gates

## Timing

- ~20 min výklad + 50 min lab + 5 min shrnutí.
- Kroky 1–4 jsou lokální a spolehlivé; krok 6 závisí na GitHub účtech a síti. Při první
  zádrhelu krok 6 jako demo.

## Go/no-go — otestovat před během

- **Pipeline jednou proběhnout na GitHubu** s referenčním řešením (vlastní repo lektora).
  Ověřeno jen lokálně 2026-10-16: build + 15 testů + brána velikosti. Na GitHubu **neověřeno**.
- Mají studenti GitHub účty? (otevřená položka v `environment.md`). Pokud ne, rozhodnout
  předem: demo, nebo založení účtů první hodinu dne 5 (+10 min).
- Git na učebních strojích (instalován v pondělí, krok 6 `dev-environment` — kdo ho přeskočil,
  instaluje teď).

## Tripwires

- **Public repozitář** — studenti založí veřejný. Kód je fiktivní, ale návyk je špatný: `.sppkg`
  a konfigurace zákazníka nepatří veřejně. Trvat na *Private*.
- **`package-lock.json` v `.gitignore`** — učebnice learn-spfx-growth ho ignorovala; generátor
  1.23.2 ne. `npm ci` bez lockfile selže.
- **Přihlášení gitu přes HTTPS** — GitHub chce token nebo Git Credential Manager; okno
  přihlášení se otevře v prohlížeči (pozor na profil).
- **„Nasadíme to rovnou z pipeline"** — odpověď v README (proč ne bez dohody se správcem).

## Vazby

- Zpět: `bundle-baseline` (skript), `localization` (parita klíčů), `property-pane` (`links.ts`).
- Dopředu: `diagnostics-hardening` (`npm audit` v kontextu pipeline), `capstone`.
