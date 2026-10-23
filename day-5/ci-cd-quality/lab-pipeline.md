# Lab · Testy, brány a pipeline

> Modul: `ci-cd-quality` · Odhad: 35 min · Režim: hands-on lokálně (kroky 1–4); krok 5 společně, krok 6 demo lektora
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení s 15 unit testy, které build spouští automaticky, a GitHub Actions pipeline, která
vyrobí `.sppkg` jen tehdy, když projdou testy i limit velikosti.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Řešení po dni 4. Kroky 1–5 jsou lokální.
- Krok 6 je **demo lektora**. Vlastní běh je volitelný: GitHub účet a git identita
  (volitelný krok 11 v [`dev-environment`](../../day-1/dev-environment/lab-instalace-prostredi.md)).

## Startovní čára

Lab začíná u stavu po modulu [`packaging-deployment`](../../day-4/packaging-deployment/)
(konec dne 4, verze 1.1.0.0): referenční kód
[`../../day-4/packaging-deployment/solution/vltava-portal/`](../../day-4/packaging-deployment/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

V kořeni projektu:

```powershell
npm run build
Get-ChildItem .\src -Recurse -Filter *.test.ts
```

**Checkpoint:** build projde a druhý příkaz nevypíše nic — v projektu zatím není žádný test.
V `config/package-solution.json` je verze řešení `1.1.0.0`.

## Část A — Testy v buildu (20 min)

### 1. Přidej unit testy logiky odkazů

`validateLinks` a `parseLinks` (den 2) jsou čisté funkce bez SPFx kontextu — ideální první
test. Heft najde soubory `*.test.ts`, přeloží je do `lib-commonjs` a spustí v Jestu při
každém `npm run build`.

Soubor `src/utils/links.test.ts` — **nový**:

```typescript
import { parseLinks, validateLinks } from './links';

describe('validateLinks', () => {
  it('accepts valid lines and ignores empty ones', () => {
    expect(validateLinks('HR|https://example.com/hr\n\nWiki|https://example.com/wiki')).toBeUndefined();
  });

  it('reports a line without the separator as a format error', () => {
    expect(validateLinks('HR|https://example.com/hr\nServis https://example.com')).toEqual({ line: 2, reason: 'format' });
  });

  it('rejects http addresses', () => {
    expect(validateLinks('Wiki|http://example.com/wiki')).toEqual({ line: 1, reason: 'url' });
  });

  it('treats undefined as valid (empty property)', () => {
    expect(validateLinks(undefined)).toBeUndefined();
  });
});

describe('parseLinks', () => {
  it('returns only valid links, trimmed', () => {
    expect(parseLinks(' HR | https://example.com/hr \nbroken line\nWiki|http://example.com')).toEqual([
      { title: 'HR', url: 'https://example.com/hr' }
    ]);
  });
});
```

- Testy stojí na **chování** z dne 2: prázdné řádky se ignorují, řádek bez `|` je chyba
  formátu, `http://` neprojde, `parseLinks` vrátí jen platné odkazy.
- Adresy jsou `example.com` — žádná reálná data v testech.

```powershell
npm run build
```

**Checkpoint:** ve výstupu je `PASS lib-commonjs\utils\links.test.js (… 5 passed, 0 failed)`.

### 2. Přidej test parity překladů

TypeScript hlídá klíče jen proti `mystrings.d.ts`; že klíč chybí v `loc/cs-cz.js`, se pozná
až za běhu (`undefined` na stránce). Test to přečte z disku — potřebuje typy Node.js.

```powershell
npm install @types/node@22.20.5 --save-dev --save-exact
```

Soubor `package.json` — **změna** (udělá ji příkaz, ručně nic nepiš): v `devDependencies`
přibude

```json
    "@types/node": "22.20.5",
```

a npm při zápisu **seřadí** `dependencies` abecedně — čtyři balíčky extensions ze dne 4
(`@microsoft/decorators`, `sp-application-base`, `sp-dialog`, `sp-listview-extensibility`)
se přesunou z konce seznamu na své abecední místo. Verze se nemění (ověřeno 2026-10-23,
npm 10.9: výsledek je bajt po bajtu `package.json` ze solution).

Soubor `src/loc.test.ts` — **nový**:

```typescript
/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

// Every key declared in a mystrings.d.ts must exist in every locale file next to it.
// TypeScript does not check this; a missing key is `undefined` at runtime (see day 1 and 2).
// The test runs in Node.js (Jest), not in the browser, so it may read files from disk.

const SRC: string = path.join(process.cwd(), 'src');

function findLocFolders(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full: string = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'loc') {
        found.push(full);
      } else {
        found.push(...findLocFolders(full));
      }
    }
  }
  return found;
}

function collect(content: string, pattern: RegExp): string[] {
  const keys: string[] = [];
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match) {
    keys.push(match[1]);
    match = pattern.exec(content);
  }
  return keys;
}

describe('localization files', () => {
  for (const folder of findLocFolders(SRC)) {
    const dts: string | undefined = fs.readdirSync(folder).find((f: string) => f.toLowerCase() === 'mystrings.d.ts');
    if (!dts) {
      continue;
    }
    const keys: string[] = collect(fs.readFileSync(path.join(folder, dts), 'utf8'), /^\s+(\w+): string;/gm);
    const locales: string[] = fs.readdirSync(folder).filter((f: string) => /^[a-z]{2}-[a-z]{2}\.js$/.test(f));

    for (const locale of locales) {
      it(`${path.relative(SRC, folder)}/${locale} has all ${keys.length} keys`, () => {
        const present: string[] = collect(fs.readFileSync(path.join(folder, locale), 'utf8'), /^\s+"(\w+)":/gm);
        expect(keys.filter((k: string) => present.indexOf(k) < 0)).toEqual([]);
      });
    }
  }
});
```

- `/// <reference types="node" />` zpřístupní `fs` a `path` jen tomuto souboru; bez něj
  build spadne na `Cannot find module 'fs'`.
- Test se sám přizpůsobí: najde každou složku `loc` v `src/` a pro každý jazykový soubor
  vytvoří jeden test. Nový web part nebo jazyk = nové testy bez úpravy kódu.

```powershell
npm run build
```

**Checkpoint:** `Successes: 15`, `Failures: 0` (počet testů lokalizace závisí na počtu
`loc` složek a jazyků — v referenčním řešení 5 složek × 2 jazyky = 10).

### 3. Ověř, že test opravdu hlídá

Dočasně smaž z `src/webparts/portal/loc/cs-cz.js` řádek s `"Greeting"` a spusť build.

**Checkpoint (negativní):** build skončí chybou, výstup obsahuje `FAIL lib-commonjs\loc.test.js`
a `"Greeting"`. Řádek vrať a build znovu projde.

## Část B — Brána velikosti a pipeline (15 min)

### 4. Přidej bránu velikosti

Skript `Measure-BundleSize.ps1` znáš ze dne 3 a 4 (měření). Teď ho zkopíruješ **do
projektu**, aby ho pipeline měla po ruce — s `-MaxBytes` vrací exit kód 1, když některý
bundle překročí limit. Skript je nástroj kurzu, ne podstata labu, proto se kopíruje.

```powershell
New-Item -ItemType Directory -Path .\scripts -Force | Out-Null
Copy-Item "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" .\scripts\
& .\scripts\Measure-BundleSize.ps1 -ProjectPath . -MaxBytes 500000; "exit $LASTEXITCODE"
& .\scripts\Measure-BundleSize.ps1 -ProjectPath . -MaxBytes 400000; "exit $LASTEXITCODE"
```

**Checkpoint:** limit 500 000 → `exit 0`; limit 400 000 → `Bundle equipment-web-part has … B`
a `exit 1` (referenční řešení: 454 270 B, měřeno 2026-10-23 na stroji lektora).

### 5. Přidej workflow (společně s lektorem)

GitHub Actions čte workflow ze složky `.github/workflows/` v kořeni **repozitáře** — tady
je repozitářem projekt sám.

Soubor `.github/workflows/build.yml` — **nový**:

```yaml
# CI for the vltava-portal SPFx solution: lint, TypeScript, unit tests, bundle size gate, .sppkg.
name: build

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm

      # npm ci installs exactly what package-lock.json says (the lock file must be committed).
      - run: npm ci

      # heft: lint + TypeScript + Jest (unit and localization tests) + webpack + .sppkg
      - run: npm run build

      - name: Bundle size gate
        shell: pwsh
        run: ./scripts/Measure-BundleSize.ps1 -ProjectPath . -MaxBytes 500000

      - uses: actions/upload-artifact@v7
        with:
          name: sppkg
          path: sharepoint/solution/*.sppkg
          if-no-files-found: error
```

- `npm ci` instaluje přesně podle `package-lock.json` — lockfile proto musí být v repozitáři.
- Pořadí je brána: když spadne test, `.sppkg` nevznikne; když projde test a neprojde
  velikost, artefakt se nenahraje.

Ověř, že `package-lock.json` **není** v `.gitignore` projektu.

**Checkpoint:** `Select-String .\.gitignore -Pattern 'package-lock'` nevrátí nic.

### 6. Pipeline na GitHubu (demo lektora, vlastní běh volitelně)

Lektor krok ukáže na svém repozitáři. Sleduj, co se v běhu `build` děje. Následující postup
je pro ty, kdo si ho chtějí zopakovat na **vlastním** GitHub účtu — nikdo nemusí.

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

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/utils/links.test.ts` | nový | 5 unit testů validace a parsování odkazů |
| `src/loc.test.ts` | nový | parita klíčů `mystrings.d.ts` ↔ `loc/*.js` (10 testů) |
| `package.json` | změněný | `@types/node` 22.20.5 pro test lokalizace; npm seřadil `dependencies` |
| `scripts/Measure-BundleSize.ps1` | nový (kopie nástroje kurzu) | brána velikosti s `-MaxBytes` |
| `.github/workflows/build.yml` | nový | CI: `npm ci`, build s testy, brána velikosti, artefakt `.sppkg` |

Verze řešení zůstává `1.1.0.0` — testy a pipeline nic nenasazují.

Tento stav je **Startovní čárou** modulu [`diagnostics-hardening`](../diagnostics-hardening/).
Když ti něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] `npm run build` spouští 15 testů, chybějící překlad build zastaví.
- [ ] Brána velikosti vrací exit kód podle limitu.
- [ ] Pipeline v demu lektora je zelená a vyrobí artefakt `.sppkg` (volitelně i ve vlastním
      repozitáři).
- [ ] **Negativní:** v repozitáři nejsou build výstupy ani identifikátory tenantu.

## Fallback

- **`Cannot find module 'fs'`** při buildu — chybí `@types/node` nebo řádek
  `/// <reference types="node" />` na začátku `loc.test.ts`.
- **`npm ci` v pipeline hlásí chybějící lockfile** — `package-lock.json` nebyl commitnut.
- **Bez GitHub účtu (výchozí):** kroky 1–5 lokálně, krok 6 sleduj na projektoru.
- **Při časové tísni:** vlastní běh kroku 6 vynechat — demo lektora stačí. Kdo nestihne
  kroky 1–5, převezme [Výstupní stav](#výstupní-stav) podle scénáře.

## Zdroje (Microsoft)

- [Heft-based toolchain](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft)

## Zdroje (třetí strana — GitHub Actions)

- [GitHub Actions — workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
