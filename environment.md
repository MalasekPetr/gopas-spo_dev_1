# Prostředí kurzu

Referenční údaje, na které se odkazují laby.

> [!IMPORTANT] Publikace
> Repo je **public** — tento soubor obsahuje jen student-facing část. Instructor-only údaje
> (tenant ID, adresa SharePointu tenantu, admin účty, hesla, lifecycle účtů) jsou drženy mimo
> repo.

## Tenant `cloudedu.cz`

| Položka | Hodnota |
|---|---|
| Typ tenantu | Microsoft 365 Developer tenant |
| Účty studentů | `jmeno.prijmeni@cloudedu.cz` — přidělí lektor první ráno |
| Role studentů | **Global Administrator** (celý týden) |
| MFA | **povinné** — při prvním přihlášení registrace Microsoft Authenticatoru |
| Adresa SharePointu | sdělí lektor; v labech jako `<tenant>.sharepoint.com` |
| Web studenta | `https://<tenant>.sharepoint.com/sites/spodev-<iniciály>` — zakládá student v `dev-environment` |
| Řešení studenta | `vltava-portal-<iniciály>` — generuje student v `project-anatomy` |

> [!IMPORTANT] Všichni jsou Global Administrator na jednom tenantu
> Pohodlné pro laby (nikdo nečeká na admina) a zároveň největší riziko kurzu. Tři pravidla:
>
> 1. **Pracuj jen na svém webu a se svým řešením.** Tenantové akce (tenantový App Catalog,
>    schválení API oprávnění, nastavení tenantu) dělej jen tam, kde to lab výslovně říká.
> 2. **Schválení API oprávnění platí pro celý tenant** — pro všechna řešení všech studentů.
>    Neschvaluj nic, co lab neříká. Podrobně den 3, `permissions-consent`.
> 3. **Kurzovní účet jen v odděleném profilu prohlížeče.** Global Administrator ve špatném
>    okně je reálný dopad.

## Učební stroj

Na stroji je **jen VS Code a PowerShell 7**. Všechno ostatní se instaluje první den v bloku
[`dev-environment`](./day-1/dev-environment/), do uživatelského profilu, bez admin práv
tam, kde to jde.

| Nástroj | Verze v kurzu | Instalace |
|---|---|---|
| fnm | aktuální | `winget`, fallback ZIP — viz lab |
| Node.js | **22.x LTS** (ověřeno na 22.22.0) | `fnm install 22` |
| npm | ta, kterou přinese Node.js 22 | **neupgradovat** |
| git | aktuální | `winget`, fallback stažení repa jako ZIP |
| Yeoman | `yo` aktuální | `npm install --global` |
| Generátor SPFx | **`@microsoft/generator-sharepoint@1.23.2`** | `npm install --global` |
| Heft | `@rushstack/heft` aktuální | `npm install --global` |
| Prohlížeč | Microsoft Edge, **samostatný profil** pro `cloudedu.cz` | — |

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> SPFx 1.23.2 podporuje Node.js **v22** (tabulka
> [kompatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility),
> updated 2026-07-07). Vygenerovaný `package.json` má `"engines": { "node": ">=22.14.0 < 23.0.0" }`
> — Node.js 24 je pro 1.23.2 mimo rozsah. SPFx 1.24 má přinést podporu Node.js 24/26; pokud
> vyjde během kurzu, **na učebních strojích neměnit**.

## Matice požadavků per blok

`W` = student mění vlastní web / řešení · `T` = zásah do celého tenantu (výslovný krok labu) ·
`D` = instruktorské demo · `L` = jen lokální stroj

| Den | Blok | Režim | Co je potřeba nad rámec základu |
|---|---|---|---|
| 1 | `platform-positioning` | — (výklad + návrh) | — |
| 1 | `dev-environment` | L + W | síť na npm registry, GitHub, nodejs.org; založení webu |
| 1 | `project-anatomy` | L | — |
| 1 | `first-webpart` | W | důvěryhodný dev certifikát; povolení *Local Network Access* v Edge |
| 2 | `property-pane` | W | — |
| 2 | `localization` | W | druhý web `spodev-<ini>-cs` v češtině |
| 2 | `react-fluent-ui` | W | — |
| 2 | `opt-kendo-react` | L | KendoReact 13.3.0 (React 17), jen funkce Free — bez licence |
| 3 | `data-access-clients` | W | fiktivní uživatelé s oddělením a telefonem |
| 3 | `permissions-consent` | **T** | tenantový App Catalog; schvaluje **jen lektor** na stránce API access |
| 3 | `pnpjs` | W | seznam `Equipment` (skript `New-EquipmentList.ps1`, modul PnP.PowerShell, Client ID aplikace PnP) |
| 3 | `bundle-baseline` | L | — |
| 4 | `extensions` | W | — |
| 4 | `performance-caching` | W | — |
| 4 | `packaging-deployment` | W + **T** | tenantový App Catalog (upgrade na 1.1.0.0); site collection katalog jen demo |
| 5 | `ci-cd-quality` | L | GitHub účet studenta a git (otevřená položka) |
| 5 | `diagnostics-hardening` | W | — |
| 5 | `spfx-whats-next` | D | — |
| 5 | `capstone` | W | — |

## Go/no-go před během — otevřené položky

- [ ] **Platnost Developer tenantu.** Developer tenant má omezenou platnost — ověřit datum
      expirace, aby nepadlo do týdne kurzu.
- [ ] **Počet licencovaných účtů.** Každý studentský účet má licenci se SharePoint Online
      a Exchange (adresář zaměstnanců v D3 čte uživatele přes Graph).
- [ ] **Global Administrator** přiřazený všem studentským účtům.
- [ ] **MFA registrace.** Rozhodnout, zda studenti registrují Authenticator první ráno
      (odhad +10 min do `dev-environment`), nebo je registrace hotová předem.
- [ ] **Síť učebny.** Z učebního stroje projde `npm install` (registry.npmjs.org), stažení fnm
      (github.com) a Node.js (nodejs.org). Proxy = konec dne 1.
- [ ] **winget na učebním stroji** funguje pod účtem studenta. Pokud ne, lab má fallback.
- [ ] **Tenantový App Catalog existuje** — den 3 do něj nasazují všichni.
- [ ] **Fiktivní uživatelé** v tenantu (adresář zaměstnanců v D3) — aspoň 20 s vyplněným
      oddělením a telefonem.
- [ ] **Úklid po předchozím běhu**: weby `spodev-*`, řešení `vltava-portal-*` v tenantovém
      App Catalogu, schválená API oprávnění.
- [ ] **API access čisté** — žádné schválené `User.Read.All` ani `Presence.Read.All` pro
      Microsoft Graph (jinak den 3 neměří výchozí stav a fallback nenastane).
- [ ] **Aplikace PnP pro interaktivní přihlášení** v `cloudedu.cz` (den 3, skript seznamu
      `Equipment`) — Client ID v lektorském souboru, ne v repu.
- [ ] **GitHub účty studentů** (den 5, pipeline) — nebo pipeline jako demo lektora.
- [ ] **Zkušební průchod labů na čistém účtu** — u každého dne jsou v `instructor-notes.md`
      kroky označené „neověřeno na tenantu".

## Úklid po běhu

Po kurzu zůstane na tenantu: 2 weby na studenta (`spodev-<ini>`, `spodev-<ini>-cs`), ~1 řešení
na studenta v tenantovém App Catalogu, seznamy `Equipment` a **schválená API oprávnění**. Oprávnění se
neodstraní smazáním řešení — odvolávají se zvlášť v SharePoint admin centru (*API access*)
([Connect to Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient),
sekce *Removing the solution doesn't revoke permissions*). Postup úklidu je otevřená položka.
