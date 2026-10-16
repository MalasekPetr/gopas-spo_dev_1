# Lab · Testy, brány a pipeline

> Modul: `ci-cd-quality` · Odhad: 50 min · Režim: hands-on, lokálně + GitHub
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení s 15 unit testy, které build spouští automaticky, a GitHub Actions pipeline, která
vyrobí `.sppkg` jen tehdy, když projdou testy i limit velikosti.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`../diagnostics-hardening/solution/vltava-portal/`](../diagnostics-hardening/solution/vltava-portal/).

## Předpoklady

- Řešení po dni 4. Pro kroky 5–6 GitHub účet a git.

## Kroky

### 1. Přidej unit testy logiky odkazů

Ze solution zkopíruj `src/utils/links.test.ts` a spusť build:

```powershell
npm run build
```

**Checkpoint:** ve výstupu je `PASS lib-commonjs\utils\links.test.js (… 5 passed, 0 failed)`.

### 2. Přidej test parity překladů

```powershell
npm install @types/node@22 --save-dev --save-exact
```

Ze solution zkopíruj `src/loc.test.ts` a spusť `npm run build`.

**Checkpoint:** `Successes: 15`, `Failures: 0` (počet testů lokalizace závisí na počtu
`loc` složek a jazyků — v referenčním řešení 10).

### 3. Ověř, že test opravdu hlídá

Dočasně smaž z `src/webparts/portal/loc/cs-cz.js` řádek s `"Greeting"` a spusť build.

**Checkpoint (negativní):** build skončí chybou, výstup obsahuje `FAIL lib-commonjs\loc.test.js`
a `"Greeting"`. Řádek vrať a build znovu projde.

### 4. Přidej bránu velikosti

```powershell
New-Item -ItemType Directory -Path .\scripts -Force | Out-Null
Copy-Item "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" .\scripts\
& .\scripts\Measure-BundleSize.ps1 -ProjectPath . -MaxBytes 500000; "exit $LASTEXITCODE"
& .\scripts\Measure-BundleSize.ps1 -ProjectPath . -MaxBytes 400000; "exit $LASTEXITCODE"
```

**Checkpoint:** limit 500 000 → `exit 0`; limit 400 000 → `Bundle equipment-web-part has … B`
a `exit 1`.

### 5. Přidej workflow

Ze solution zkopíruj `.github/workflows/build.yml` do kořene **projektu**. Ověř, že
`package-lock.json` **není** v `.gitignore` projektu.

**Checkpoint:** `Select-String .\.gitignore -Pattern 'package-lock'` nevrátí nic.

### 6. Spusť pipeline na GitHubu

1. Na GitHubu vytvoř **soukromý** repozitář `vltava-portal-<ini>`.
2. V kořeni projektu:

   ```powershell
   git init
   git add .
   git commit -m "vltava-portal: day 5"
   git branch -M main
   git remote add origin https://github.com/<github-ucet>/vltava-portal-<ini>.git
   git push -u origin main
   ```

3. Na GitHubu → **Actions** → běh `build`.

**Checkpoint:** běh je zelený a v jeho souhrnu je artefakt **sppkg**.

**Checkpoint (negativní):** v repozitáři **není** `node_modules`, `lib`, `temp` ani `*.sppkg`
(vygenerovaný `.gitignore` je vylučuje) a nikde v něm není tenant ID, Client ID ani adresa
kurzovního tenantu.

## Ověření

- [ ] `npm run build` spouští 15 testů, chybějící překlad build zastaví.
- [ ] Brána velikosti vrací exit kód podle limitu.
- [ ] Pipeline na GitHubu je zelená a vyrobí artefakt `.sppkg` (nebo demo lektora).
- [ ] **Negativní:** v repozitáři nejsou build výstupy ani identifikátory tenantu.

## Fallback

- **`Cannot find module 'fs'`** při buildu — chybí `@types/node` nebo řádek
  `/// <reference types="node" />` na začátku `loc.test.ts`.
- **`npm ci` v pipeline hlásí chybějící lockfile** — `package-lock.json` nebyl commitnut.
- **Bez GitHub účtu:** kroky 1–4 lokálně, kroky 5–6 sleduj na projektoru.
- **Při časové tísni:** krok 6 jako demo lektora.

## Zdroje (Microsoft)

- [Heft-based toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft)

## Zdroje (třetí strana — GitHub Actions)

- [GitHub Actions — workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
