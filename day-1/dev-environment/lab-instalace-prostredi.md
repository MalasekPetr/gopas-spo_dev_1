# Lab · Instalace prostředí a vlastní web

> Modul: `dev-environment` · Odhad: 80 min · Režim: hands-on, lokální stroj + vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Učební stroj s Node.js 22, generátorem SPFx 1.23.2 a Heftem, vlastní web
`/sites/spodev-<iniciály>` a výstup kontrolního skriptu `Environment ready`.

**Jak lab číst:** instalační lab bez kódu. **Startovní čára** říká, s čím začínáš, každý
krok končí **Checkpointem** — nesedí-li, nepokračuj — a **Výstupní stav** shrnuje, co je po
labu nainstalované a založené. Všechny příkazy jsou pro **PowerShell 7** (`pwsh`), ne pro
Windows PowerShell 5.1.

## Předpoklady

- Účet `jmeno.prijmeni@cloudedu.cz` a dočasné heslo od lektora.
- Telefon s aplikací Microsoft Authenticator (MFA je na tenantu povinné).
- Adresa SharePointu tenantu `<tenant>.sharepoint.com` od lektora.
- Iniciály, které budeš celý týden používat — malými písmeny, bez diakritiky, např. `pm`.
  Kde lab píše `<ini>`, dosaď je.

## Startovní čára

Učební stroj tak, jak ho připravila učebna: **VS Code a PowerShell 7**, nic dalšího.
Rozhodnutí z [`platform-positioning`](../platform-positioning/) se tu nepoužívají — lab
začíná od nuly.

**Checkpoint:** `$PSVersionTable.PSVersion` vypíše `7.` a `code --version` vypíše verzi.
`node --version` může skončit chybou — Node.js přijde v kroku 5.

## Část A — účet a vlastní web

### 1. Založ oddělený profil prohlížeče a přihlas se

1. V Microsoft Edge: ikona profilu → **Add profile** → profil **bez přihlášení do Edge**.
   Pojmenuj ho `cloudedu`.
2. V novém profilu otevři `https://www.office.com` a přihlas se kurzovním účtem.
3. Při prvním přihlášení projdi registraci MFA (Microsoft Authenticator) a změnu hesla.
4. Pokud se objeví dotaz, zda organizace smí spravovat zařízení, zvol **ne** / *this app only*.

**Checkpoint:** v profilu `cloudedu` vidíš Microsoft 365 jako `jmeno.prijmeni@cloudedu.cz`.
Tvůj běžný profil Edge (pokud nějaký máš) zůstal nepřihlášený ke kurzovnímu tenantu.

### 2. Založ vlastní web

1. Otevři `https://<tenant>.sharepoint.com/_layouts/15/sharepoint.aspx` → **Create site** →
   **Communication site** → šablona *Standard communication*.
2. Název: `SPO DEV <ini>`. Adresa webu: **`spodev-<ini>`**. Jazyk: **English**.

**Checkpoint:** `https://<tenant>.sharepoint.com/sites/spodev-<ini>` se otevře a v pravém
horním rohu je volba **Edit** — jsi vlastník.

## Část B — Node.js a nástroje SPFx

### 3. Nainstaluj fnm

```powershell
winget install Schniz.fnm
```

Pokud `winget` na stroji nefunguje, použij fallback ze sekce [Fallback](#fallback).
**Zavři a znovu otevři terminál** (PATH se načítá při startu).

**Checkpoint:** `fnm --version` vypíše verzi.

### 4. Napoj fnm na PowerShell

fnm musí při každém startu terminálu nastavit PATH. Řádek patří do profilu pro **všechny
hostitele** — platí pak ve Windows Terminalu i v terminálu VS Code:

```powershell
$profilePath = $PROFILE.CurrentUserAllHosts
if (-not (Test-Path $profilePath)) { New-Item -ItemType File -Path $profilePath -Force | Out-Null }
Add-Content -Path $profilePath -Value 'fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression'
```

Zavři a znovu otevři terminál.

**Checkpoint:** `Get-Content $PROFILE.CurrentUserAllHosts` obsahuje řádek s `fnm env`
**právě jednou** a nový terminál se otevře bez chybové hlášky.

### 5. Nainstaluj Node.js 22

```powershell
fnm install 22
fnm default 22
fnm use 22
node --version
npm --version
```

**Checkpoint:** `node --version` vypíše `v22.` a cokoli ≥ `v22.14.0`. **Ne** `v24` ani `v20`.

### 6. Nainstaluj git

```powershell
winget install --id Git.Git -e --source winget
```

Zavři a znovu otevři terminál.

**Checkpoint:** `git --version` vypíše verzi. Git potřebuješ hlavně k tomu, abys měl každé
ráno **aktuální materiály kurzu** (krok 10). Pokud instalace vyžaduje admin práva, která nemáš,
**pokračuj dál** — materiály pak budeš stahovat jako ZIP a kontrolní skript to vypíše jen jako
varování.

### 7. Nainstaluj globální nástroje SPFx

```powershell
npm install --global yo @microsoft/generator-sharepoint@1.23.2 @rushstack/heft @pnp/cli-microsoft365
npm ls --global --depth=0
```

Varování `npm warn deprecated ...` během instalace jsou běžná. Chyba je jen `npm error`.
CLI for Microsoft 365 (`m365`) poprvé použijeme ve čtvrtek při upgradu projektu; přihlašovat
se k tenantu teď **nemusíš**.

**Checkpoint:** výpis `npm ls` obsahuje `yo@…`, `@microsoft/generator-sharepoint@1.23.2`,
`@rushstack/heft@…` a `@pnp/cli-microsoft365@…`. **Neobsahuje** `gulp` ani `gulp-cli`.

## Část C — nastavení a kontrola

### 8. Nastav adresu workbenche

Hodnota je **bez** `https://` a končí cestou k tvému webu:

```powershell
$domain = '<tenant>.sharepoint.com/sites/spodev-<ini>'
[Environment]::SetEnvironmentVariable('SPFX_SERVE_TENANT_DOMAIN', $domain, 'User')
$env:SPFX_SERVE_TENANT_DOMAIN = $domain
```

Proměnná na úrovni uživatele platí pro **nově spuštěné** programy. VS Code, který už běží,
ji nevidí — zavři **celé VS Code**, ne jen terminál.

**Checkpoint:** v novém terminálu `$env:SPFX_SERVE_TENANT_DOMAIN` vypíše tvou hodnotu
s `/sites/spodev-<ini>`.

### 9. Nainstaluj rozšíření VS Code

```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension m365pnp.viva-connections-toolkit
```

Druhé je **SharePoint Framework Toolkit** (komunitní, volitelné) — v kurzu ho nepotřebuješ,
ale doma se hodí, mimo jiné pro AI asistovaný vývoj (pátek, `spfx-whats-next`).

**Checkpoint:** `code --list-extensions` obsahuje `dbaeumer.vscode-eslint`.

### 10. Stáhni repo kurzu a ověř prostředí

```powershell
git clone https://github.com/MalasekPetr/gopas-spo_dev_1.git "$HOME\gopas-spo_dev_1"
pwsh -File "$HOME\gopas-spo_dev_1\scripts\Test-DevEnvironment.ps1"
```

Bez gitu: stáhni `https://github.com/MalasekPetr/gopas-spo_dev_1/archive/refs/heads/main.zip`,
rozbal do `$HOME\gopas-spo_dev_1` a spusť `Get-ChildItem "$HOME\gopas-spo_dev_1" -Recurse | Unblock-File`
před spuštěním skriptu.

**Checkpoint:** skript skončí zeleným `Environment ready` — všechny řádky `[PASS]`, nanejvýš
`[WARN]` u gitu.

> [!IMPORTANT] Repo kurzu je jen ke čtení
> Materiály se během týdne opravují a doplňují. Každé ráno je aktualizuj:
>
> ```powershell
> git -C "$HOME\gopas-spo_dev_1" pull
> ```
>
> V klonu nic neměň a nic do něj necommituj — vlastní projekt máš v `$HOME\spodev`. Když
> `pull` hlásí konflikt, něco jsi v klonu změnil; čistý stav vrátí
> `git -C "$HOME\gopas-spo_dev_1" reset --hard origin/main`. Bez gitu stáhni a rozbal ZIP
> každé ráno znovu.

### 11. (Volitelné) Git identita pro vlastní repozitář

**Jen pokud chceš** v pátek pustit pipeline v `ci-cd-quality` na **vlastním** GitHub účtu.
Výchozí je demo lektora — bez tohoto kroku o nic nepřijdeš.

```powershell
git config --global user.name "<jmeno nebo prezdivka>"
git config --global user.email "<id>+<ucet>@users.noreply.github.com"
```

Jméno a e-mail se zapíšou do každého commitu a na GitHubu jsou vidět. Použij **noreply adresu**
z GitHubu (*Settings → Emails*), ne pracovní ani kurzovní e-mail. Na učebním stroji nastavení
po kurzu smaž: `git config --global --unset user.name` a `--unset user.email`.

**Checkpoint:** `git config --global user.email` vypíše noreply adresu — nebo krok přeskočíš.

## Výstupní stav

Kód nevzniká, `solution/` modul nemá. Po labu máš:

| Co | Kde | Ověří |
|---|---|---|
| profil Edge `cloudedu`, MFA | Edge | krok 1 |
| web `/sites/spodev-<ini>` (vlastník) | tenant | krok 2 |
| fnm + Node.js 22 jako výchozí | `$PROFILE.CurrentUserAllHosts`, fnm | kroky 4–5 |
| git (nebo ZIP materiálů) | stroj | krok 6 |
| `yo`, `@microsoft/generator-sharepoint@1.23.2`, `@rushstack/heft`, `@pnp/cli-microsoft365` | globální npm pro Node 22 | krok 7 |
| `SPFX_SERVE_TENANT_DOMAIN` | proměnná uživatele | krok 8 |
| rozšíření ESLint (a volitelně SharePoint Framework Toolkit) | VS Code | krok 9 |
| materiály kurzu | `$HOME\gopas-spo_dev_1` (jen ke čtení) | krok 10 |

Tento stav je **Startovní čárou** modulu [`project-anatomy`](../project-anatomy/) — tam
vznikne první kód.

## Ověření

- [ ] Profil Edge `cloudedu` přihlášený kurzovním účtem, MFA zaregistrované.
- [ ] Web `/sites/spodev-<ini>` existuje a jsi jeho vlastník.
- [ ] `Test-DevEnvironment.ps1` → `Environment ready`.
- [ ] **Negativní:** `npm ls --global --depth=0` neobsahuje `gulp` ani `gulp-cli`.
- [ ] **Negativní:** na tenantu jsi nezaložil nic kromě `/sites/spodev-<ini>` a nikomu jinému
      jsi na jeho webu nic nezměnil.

## Fallback

- **winget nefunguje (krok 3)** — fnm ručně do profilu uživatele, bez admin práv:

  ```powershell
  $dir = Join-Path $env:LOCALAPPDATA 'fnm'
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Invoke-WebRequest -Uri 'https://github.com/Schniz/fnm/releases/latest/download/fnm-windows.zip' `
      -OutFile "$env:TEMP\fnm-windows.zip"
  Expand-Archive -Path "$env:TEMP\fnm-windows.zip" -DestinationPath $dir -Force
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($userPath -notlike "*$dir*") {
      [Environment]::SetEnvironmentVariable('Path', "$userPath;$dir", 'User')
  }
  ```

  Pak zavřít a otevřít terminál a pokračovat krokem 4.
- **`node` není rozpoznaný po kroku 5** — řádek s `fnm env` chybí v profilu nebo terminál
  nebyl restartován. Ověřit `Get-Content $PROFILE.CurrentUserAllHosts`.
- **Po `fnm use` jiné verze chybí `yo`** — globální balíčky patří ke konkrétní verzi Node.js.
  `fnm use 22` a znovu krok 7.
- **`npm install` visí nebo končí `ETIMEDOUT`** — síť učebny (proxy). Hlásit lektorovi,
  neopakovat donekonečna.
- **Skript nejde spustit („not digitally signed")** — soubory ze ZIPu mají značku stažení
  z internetu: `Get-ChildItem "$HOME\gopas-spo_dev_1" -Recurse | Unblock-File`.
- **Při časové tísni:** kroky 9 a 11 vynechat, krok 6 přeskočit a materiály stáhnout jako ZIP.
  Kroky 1–5, 7, 8 a 10 jsou nutné pro zbytek dne.

## Zdroje (Microsoft)

- [Set up your SharePoint Framework development environment](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment)
- [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
