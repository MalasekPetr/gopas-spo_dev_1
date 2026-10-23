# Instructor notes — Vývojové prostředí od nuly

## Timing

- ~20 min výklad + 80 min lab + 5 min rezerva. **Neměřeno** — první běh. Zapsat skutečné
  časy kroků 1, 7 a 10 do `mereni-instalace.md` po hodině.
- Krok 1 (MFA) je nejméně předvídatelný: noví uživatelé, telefony, SMS. Pokud se registrace
  táhne, pustit krok 3–7 souběžně (lokální stroj účet nepotřebuje) a krok 1–2 dokončit potom.
- Krok 7 je síťově nejtěžší (stahování z npm registry). Spustit ho co nejdřív a během
  stahování dělat krok 8–9.

## Go/no-go — otestovat před během

- Z učebního stroje pod studentským účtem Windows: `winget --version`, přístup na
  `registry.npmjs.org`, `github.com`, `nodejs.org`. **Bez sítě na npm registry den 1 nestojí
  na ničem** — rozhodnout: offline npm cache na USB, nebo instruktorský stroj + demo.
- Studentské účty existují, mají Global Administrator a licenci se SharePointem.
- Adresa SharePointu tenantu na tabuli (`<tenant>.sharepoint.com`) — není v repu.
- Repo `gopas-spo_dev_1` je na GitHubu veřejné a `main` obsahuje `scripts/Test-DevEnvironment.ps1`.

## Tripwires

- **Stejné iniciály u dvou studentů** — kolidují adresa webu `spodev-<ini>`, název řešení,
  název web partu v toolboxu a hlavně **všechna ID** ze `Set-StudentIdentity.ps1` (odvozená
  z iniciál). Iniciály rozdat ráno a zapsat na tabuli, při shodě přidat číslici (`pm`, `pm2`).
  Skript přijme jen vzor `^[a-z]{2,3}[0-9]?$`.

- **Windows PowerShell 5.1 místo pwsh 7** — studenti otevřou „PowerShell" z nabídky Start.
  `$PSVersionTable.PSVersion` musí být 7.x. Skript to hlásí jako FAIL.
- **Profil jen pro aktuálního hostitele** — kdo použije `$PROFILE` místo
  `$PROFILE.CurrentUserAllHosts`, má fnm ve Windows Terminalu, ale ne ve VS Code.
- **VS Code nevidí `SPFX_SERVE_TENANT_DOMAIN`** — běžel při nastavení proměnné. Zavřít celé
  VS Code (všechna okna), ne jen terminál.
- **Hodnota s `https://`** nebo bez `/sites/spodev-<ini>` — workbench se pak otevře na
  špatné adrese. Skript odhalí `https://`, chybějící cestu ne.
- **Generátor bez verze** (`@microsoft/generator-sharepoint` bez `@1.23.2`) — pokud mezitím
  vyjde 1.24 GA, student vygeneruje jiný projekt než zbytek třídy. Skript to hlásí jako FAIL.
- **Edge s přihlášeným pracovním účtem** — kdo se přihlásí přímo do profilu Edge, může omylem
  zaregistrovat zařízení do `cloudedu.cz`. Proto profil bez přihlášení.
- **Upgrade npm** (`npm install -g npm`) — na lektorském stroji npm 11.19 po rozbalení
  `node_modules` přestal reagovat, npm 10.9.9 ne (`project-anatomy/mereni-instalace.md`).
  Studentům npm neupgradovat.
- **Duplikovaný řádek fnm v profilu** po opakovaném kroku 4 — neškodí, ale zpomaluje start.

## Vazby

- Zpět: `platform-positioning`.
- Dopředu: `project-anatomy` (generátor), `first-webpart` (`SPFX_SERVE_TENANT_DOMAIN`,
  web studenta), `ci-cd-quality` (git).
