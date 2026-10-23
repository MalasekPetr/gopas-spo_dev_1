# Lab · Vygeneruj řešení a zmapuj ho

> Modul: `project-anatomy` · Odhad: 40 min · Režim: hands-on, jen lokálně
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Vlastní řešení `vltava-portal-<ini>` s nainstalovanými závislostmi, vyplněná mapa projektu
(8 odpovědí s cestou k souboru) a první `.sppkg` se změřeným časem buildu.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že máš prostředí, ze kterého lab
vychází. Pak jdi po částech; každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Na
konci je **Výstupní stav**: referenční projekt, se kterým se můžeš porovnat a který je
startem modulu `first-webpart`.

## Předpoklady

- Hotový [`../dev-environment/`](../dev-environment/) — `Test-DevEnvironment.ps1` hlásí
  `Environment ready`.

## Startovní čára

Lab začíná u stavu po modulu [`dev-environment`](../dev-environment/): nainstalované
prostředí, **žádný kód**. Projekt teprve vzniká v kroku 1.

- Ve složce `$HOME\spodev` zatím není `vltava-portal-<ini>`.
- Kdyby generátor na tvém stroji selhal a lektor nepomůže hned, výstup tohoto labu je
  v [`solution/vltava-portal/`](solution/vltava-portal/) — převezmi ho podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**) a pokračuj krokem 3.

**Checkpoint:** `pwsh -File "$HOME\gopas-spo_dev_1\scripts\Test-DevEnvironment.ps1"` hlásí
`Environment ready` a `yo --version` vypíše verzi.

## Část A — vygeneruj řešení a dej mu identitu

### 1. Vygeneruj řešení

Generátor spustíme s parametry, aby měla celá třída stejné odpovědi. Instalaci závislostí
(`--skip-install`) pustíme zvlášť a změříme ji.

```powershell
New-Item -ItemType Directory -Path "$HOME\spodev" -Force | Out-Null
Set-Location "$HOME\spodev"
yo @microsoft/sharepoint `
    --solution-name vltava-portal-<ini> `
    --component-type webpart `
    --component-name Portal `
    --framework react `
    --environment spo `
    --package-manager npm `
    --skip-feature-deployment `
    --skip-install `
    --no-insight
```

**Checkpoint:** existuje složka `$HOME\spodev\vltava-portal-<ini>` a v jejím `.yo-rc.json`
je `"version": "1.23.2"` a `"useGulp": false`.

Hned potom dej projektu **svou identitu** — ID řešení, feature a komponent odvozená z tvých
iniciál:

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> `
    -ProjectPath "$HOME\spodev\vltava-portal-<ini>"
```

Celá třída nasazuje do **jednoho** App Catalogu. Generátor dává náhodná ID, ale když později
převezmeš kód ze `solution/` některého modulu, musí mít tvůj projekt pořád stejná ID — jinak
katalog uvidí jiné řešení a web party na stránkách zmizí. Skript dává stejnému studentovi vždy
stejná ID a dvěma studentům nikdy stejná
([`scenario-vltava-portal.md`](../../scenario-vltava-portal.md#identita-řešení-na-sdíleném-tenantu)).
K titulku web partu přidá tvé iniciály — ručně je nikam nepiš.

**Checkpoint:** skript vypíše tabulku `Slot / Old / New` a v projektu je soubor
`.student-identity` s tvými iniciálami. V `src/webparts/portal/PortalWebPart.manifest.json`
je titulek `Portal (<ini>)`. Druhé spuštění vypíše *nothing changed*.

### 2. Otevři projekt a spusť měřenou instalaci

```powershell
Set-Location "$HOME\spodev\vltava-portal-<ini>"
code .
```

V terminálu VS Code (**Ctrl+`**):

```powershell
$install = Measure-Command { npm install }
"npm install: {0:N0} s" -f $install.TotalSeconds
```

Instalace trvá minuty. **Nečekej na ni** — pokračuj krokem 3 v editoru.

**Checkpoint:** po doběhnutí vypíše řádek `npm install: <N> s` a v projektu je složka
`node_modules`. Číslo nahlas lektorovi — sbíráme ho za celou třídu.

## Část B — zmapuj projekt

### 3. Zmapuj projekt

Vytvoř v kořeni projektu soubor `mapa-projektu.md` a ke každé otázce napiš odpověď **a cestu
k souboru**, kde jsi ji našel:

1. Jaké je `id` řešení?
2. Jaké je `id` web partu `Portal`?
3. Jaký název web partu uvidí uživatel v toolboxu stránky?
4. Který npm skript spustí lokální server a jaký příkaz Heftu volá?
5. Jakou verzi Node.js projekt vyžaduje?
6. Kam se uloží výsledný `.sppkg`?
7. Na jakou adresu se otevře prohlížeč po `npm start` (před dosazením proměnné)?
8. Pod jakým názvem modulu se v kódu importují lokalizované texty web partu?

**Checkpoint:** 8 odpovědí, každá s cestou k souboru. Odpovědi 1 a 2 jsou **různé** GUIDy.

### 4. Ověř projekt skriptem

Po doběhnutí instalace:

```powershell
pwsh -File "$HOME\gopas-spo_dev_1\scripts\Test-DevEnvironment.ps1" -ProjectPath .
```

**Checkpoint:** řádky `Project SPFx version` a `Project node_modules` jsou `[PASS]`.

## Část C — balíček a toolchain

### 5. Zabal řešení a změř build

```powershell
$build = Measure-Command { npm run build }
"npm run build: {0:N0} s" -f $build.TotalSeconds
Get-ChildItem .\sharepoint\solution\*.sppkg | Select-Object Name, Length
```

**Checkpoint:** existuje `sharepoint\solution\vltava-portal-<ini>.sppkg` a výstup buildu
neobsahuje řádek s `error`. Čas buildu a velikost `.sppkg` nahlas lektorovi.

### 6. Podívej se do balíčku

`.sppkg` je ZIP. Rozbal kopii a najdi v ní svůj web part:

```powershell
Copy-Item .\sharepoint\solution\vltava-portal-<ini>.sppkg "$env:TEMP\pkg.zip" -Force
Expand-Archive "$env:TEMP\pkg.zip" -DestinationPath "$env:TEMP\pkg" -Force
Get-ChildItem "$env:TEMP\pkg" -Recurse | Select-Object -First 30 FullName
Get-ChildItem "$env:TEMP\pkg" -Recurse -File | Select-String -Pattern '<webpart-id>' -List
```

Za `<webpart-id>` dosaď GUID z odpovědi 2.

**Checkpoint:** ID web partu z otázky 2 se v rozbaleném balíčku najde aspoň v jednom souboru.

### 7. Ověř, že gulp opravdu není

```powershell
Test-Path .\gulpfile.js
npm run serve
```

**Checkpoint (negativní):** `Test-Path` vrátí `False` a `npm run serve` skončí chybou
`Missing script: "serve"`. Návod, který po tobě chce `gulp serve`, je pro jiný toolchain.

## Výstupní stav

Referenční projekt: [`solution/vltava-portal/`](solution/vltava-portal/) — výstup stejného
příkazu `yo` z kroku 1 (s názvem `vltava-portal`), beze změny kódu. Místo náhodných ID
generátoru nese **šablonová ID kurzu**, stejná jako `solution/` dalších modulů.

V tvém projektu po labu:

| Soubor | Změna | Proč |
|---|---|---|
| celý projekt (28 souborů, viz `solution/`) | nový | výstup generátoru SPFx 1.23.2; `-<ini>` v názvu balíčku, řešení a `.sppkg` dal už `--solution-name` |
| `.yo-rc.json`, `config/package-solution.json` | změněný skriptem | tvoje ID řešení a feature |
| `src/webparts/portal/PortalWebPart.manifest.json` | změněný skriptem | tvoje ID komponenty, titulek `Portal (<ini>)` |
| `teams/<id>_color.png`, `teams/<id>_outline.png` | přejmenované skriptem | název souboru nese ID komponenty |
| `.student-identity` | nový (jen u tebe) | značka iniciál; skript s jinými iniciálami odmítne běžet |
| `mapa-projektu.md` | nový (jen u tebe) | odpovědi z kroku 3 |
| `node_modules/`, `sharepoint/solution/*.sppkg` | nové (jen u tebe, v `.gitignore`) | instalace a build |

Tento stav je **Startovní čárou** modulu [`first-webpart`](../first-webpart/). Když ti něco
nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Řešení `vltava-portal-<ini>` vygenerované verzí 1.23.2, `node_modules` nainstalované.
- [ ] Identita nastavená: `.student-identity` existuje, titulek je `Portal (<ini>)`.
- [ ] `mapa-projektu.md` s 8 odpověďmi a cestami.
- [ ] `.sppkg` existuje; čas instalace, čas buildu a velikost balíčku nahlášené.
- [ ] **Negativní:** v projektu není `gulpfile.js` a skript `serve` neexistuje.

## Fallback

- **`yo` hlásí, že generátor nenašel** — globální balíčky patří k jiné verzi Node.js
  (`fnm use 22`), nebo krok 7 z `dev-environment` neproběhl.
- **`npm install` skončí `ERESOLVE` nebo `ETIMEDOUT`** — síť; zopakovat jednou, pak lektor.
  Nepoužívat `--force` ani `--legacy-peer-deps` — zakryjí skutečný problém.
- **`npm install` vypíše `found N vulnerabilities`** — v SPFx projektu se `npm audit fix`
  **nespouští**: aktualizuje závislosti, které SPFx netestoval. Viz release notes 1.23.2.
- **Generátor nejde spustit vůbec** — převzít [`solution/vltava-portal/`](solution/vltava-portal/)
  podle [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  do `$HOME\spodev\vltava-portal-<ini>` a pokračovat krokem 3.
- **Při časové tísni:** krok 6 a 7 jako demo lektora. Kroky 1–5 jsou nutné — `first-webpart`
  na tomhle projektu staví.

Referenční odpovědi: [`reseni-anatomie-projektu.md`](reseni-anatomie-projektu.md).

## Zdroje (Microsoft)

- [Build your first SharePoint client-side web part](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/build-a-hello-world-web-part)
- [Understanding npm audit vulnerabilities in SPFx projects](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/npm-vulnerabilities)
