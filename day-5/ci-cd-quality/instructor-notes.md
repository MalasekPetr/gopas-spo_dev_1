# Instructor notes — CI/CD a quality gates

## Timing

- ~20 min výklad + 50 min lab + 5 min shrnutí.
- Kroky 1–5 jsou lokální a spolehlivé; krok 6 je **vždy demo lektora**. Studenti s vlastním
  GitHub účtem ho mohou zopakovat — nikoho k tomu nenutit (soukromí, commity jsou veřejně
  podepsané jménem a e-mailem).

## Go/no-go — otestovat před během

- **Pipeline jednou proběhnout na GitHubu** s referenčním řešením (vlastní repo lektora).
  Ověřeno jen lokálně 2026-10-16: build + 15 testů + brána velikosti. Na GitHubu **neověřeno**.
- Demo repozitář lektora připravený (soukromý), workflow jednou zelený.
- Studentské GitHub účty se **nezakládají** a nevyžadují. Kdo chce vlastní běh, potřebuje git
  identitu z volitelného kroku 11 v `dev-environment` (noreply e-mail).

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
