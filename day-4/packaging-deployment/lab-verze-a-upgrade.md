# Lab · Verze 1.1.0.0 a upgrade na webu

> Modul: `packaging-deployment` · Odhad: 60 min · Režim: hands-on; krok 5 **mění celý tenant**
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení `vltava-portal-<ini>` verze 1.1.0.0 nahrané do tenantového App Catalogu a aplikace na
webu `spodev-<ini>` aktualizovaná tak, že banner a příkaz běží **bez** debug parametrů.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód
celého dne 4.

## Předpoklady

- Verze 1.0.0.0 nasazená ve středu a přidaná na web `spodev-<ini>`
  (lab [`permissions-consent`](../../day-3/permissions-consent/)).

## Startovní čára

Lab začíná u stavu po modulu [`performance-caching`](../performance-caching/): referenční kód
[`../performance-caching/solution/vltava-portal/`](../performance-caching/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**). Bez skriptu identity dnes
  **nenahrávej nic** — balíček by přepsal řešení kohokoli dalšího.

**Checkpoint:** `npm run build` projde; v `sharepoint/assets/` jsou `elements.xml`
a `ClientSideInstance.xml`; `Select-String .\config\package-solution.json -Pattern '"version"'`
ukáže dvakrát `1.0.0.0`; existuje `src/utils/sessionCache.ts`.

## Část A — Registrace a upgrade v balíčku (20 min)

### 1. Uprav registraci extensions

Generátor zaregistroval jen banner, a to dvakrát: `elements.xml` (na webu, kam se aplikace
přidá) a `ClientSideInstance.xml` (pro celý tenant při nasazení „na všechny weby"). Na
sdíleném tenantu tenant-wide registraci nechceme; příkaz naopak registraci nemá vůbec.

Soubor `sharepoint/assets/ClientSideInstance.xml` — **smazat**:

```powershell
Remove-Item .\sharepoint\assets\ClientSideInstance.xml
```

Soubor `sharepoint/assets/elements.xml` — **změna**: najdi

```xml
    <CustomAction
        Title="PortalBanner"
```

a nahraď:

```xml
    <!-- Announcement banner on every page of the site where the app is added. -->
    <CustomAction
        Title="PortalBanner"
```

Najdi řádek s vlastnostmi z generátoru

```xml
        ClientSideComponentProperties="{&quot;testMessage&quot;:&quot;Test message&quot;}">
```

a nahraď textem oznámení:

```xml
        ClientSideComponentProperties="{&quot;message&quot;:&quot;Planned maintenance of the service desk on Friday 17:00-19:00.&quot;,&quot;level&quot;:&quot;warning&quot;}">
```

Na konci souboru najdi

```xml
    </CustomAction>
</Elements>
```

a nahraď druhou `CustomAction` pro příkaz:

```xml
    </CustomAction>
    <!-- Issue equipment command for generic lists (100); the code shows it only in Lists/Equipment. -->
    <CustomAction
        Title="IssueEquipment"
        RegistrationId="100"
        RegistrationType="List"
        Location="ClientSideExtension.ListViewCommandSet"
        ClientSideComponentId="ID-ISSUE-EQUIPMENT">
    </CustomAction>
</Elements>
```

`ID-ISSUE-EQUIPMENT` je zástupný text: dosaď ID **svého** command setu příkazem (ruční
přepis GUID je nejčastější chyba tohoto labu):

```powershell
$manifest = '.\src\extensions\issueEquipment\IssueEquipmentCommandSet.manifest.json'
$id = (Select-String -Path $manifest -Pattern '"id":\s*"([0-9a-f-]{36})"').Matches[0].Groups[1].Value
$file = '.\sharepoint\assets\elements.xml'
(Get-Content $file -Raw).Replace('ID-ISSUE-EQUIPMENT', $id) | Set-Content $file -NoNewline
```

- ID banneru v souboru už je tvoje (generátor + skript identity v `extensions`) — neměň ho.
- Ve `solution/` je na místě zástupného textu šablonové ID kurzu. Skript identity ID
  vložené do `elements.xml` **nepřevádí** (převádí jen ID z manifestů), proto ho bereme
  z manifestu.
- `RegistrationId="100"` = obecné seznamy; na seznam `Equipment` příkaz omezuje kód.

**Checkpoint:** `elements.xml` má **dvě** `CustomAction`; obě ID existují v tvých manifestech:

```powershell
$ids = Select-String -Path .\sharepoint\assets\elements.xml -Pattern 'ClientSideComponentId="([0-9a-f-]{36})"' -AllMatches |
    ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value }
$ids | ForEach-Object { "$_ : " + [bool](Select-String -Path .\src\extensions\*\*.manifest.json -Pattern $_ -Quiet) }
```

Oba řádky končí `True`.

**Checkpoint (negativní):** `Select-String .\sharepoint\assets\elements.xml -Pattern 'ID-ISSUE-EQUIPMENT|testMessage'`
nevrátí **nic**.

### 2. Připrav upgrade actions

Na webu je verze 1.0.0.0, jejíž feature **neměla žádné** elementy. Aktualizace aplikace
sama nový `elements.xml` nepoužije — feature musí při upgradu dostat pokyn, které manifesty
dodatečně aplikovat.

Soubor `sharepoint/assets/upgrade-actions-v1.1.xml` — **nový**:

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- v1.1: the feature already existed in v1.0 without elements; apply them on upgrade. -->
<ApplyElementManifests>
  <ElementManifest Location="FEATURE-ID\elements.xml" />
</ApplyElementManifests>
```

`FEATURE-ID` nahraď GUID **tvé** feature (skript identity ho ve středu změnil):

```powershell
$feature = (Get-Content .\config\package-solution.json -Raw | ConvertFrom-Json).solution.features[0].id
$file = '.\sharepoint\assets\upgrade-actions-v1.1.xml'
(Get-Content $file -Raw).Replace('FEATURE-ID', $feature) | Set-Content $file -NoNewline
$feature
```

Soubor `config/package-solution.json` — **změna**: u feature najdi

```json
          "elementManifests": [
            "elements.xml",
            "ClientSideInstance.xml"
          ]
```

a nahraď:

```json
          "elementManifests": [
            "elements.xml"
          ],
          "upgradeActions": [
            "upgrade-actions-v1.1.xml"
          ]
```

- `elementManifests` použije **čistá** instalace (web, kde aplikace ještě není);
  `upgradeActions` použije **aktualizace** existující instalace.

**Checkpoint:** `Location` v XML obsahuje přesně GUID, který vypsal poslední řádek příkazu
výše; `Select-String .\config\package-solution.json -Pattern 'ClientSideInstance'` nevrátí
nic.

### 3. Zvyš verze

Upgrade actions se spustí, jen když se zvýší verze **feature**; App Catalog nabídne
aktualizaci, jen když se zvýší verze **řešení**.

Soubor `config/package-solution.json` — **změna**: na obou místech (`solution.version`
a `features[0].version`) najdi

```json
"version": "1.0.0.0"
```

a nahraď:

```json
"version": "1.1.0.0"
```

Soubor `package.json` — **změna**: najdi

```json
  "version": "0.0.1",
```

a nahraď:

```json
  "version": "1.1.0",
```

**Checkpoint:** `Select-String .\config\package-solution.json -Pattern '"version"'` ukáže
dvakrát `1.1.0.0`.

## Část B — Balíček (5 min)

### 4. Zabal a zkontroluj balíček

```powershell
npm run build
Get-ChildItem .\sharepoint\solution\debug -Recurse -File |
    Where-Object Name -match 'upgrade|elements|ClientSideInstance' | Select-Object FullName
Select-String -Path .\sharepoint\solution\debug\AppManifest.xml -Pattern 'Version="1.1.0.0"' -Quiet
```

**Checkpoint:** ve složce feature jsou `elements.xml` i `upgrade-actions-v1.1.xml`; poslední
příkaz vrátí `True`.

**Checkpoint (negativní):** ve výpisu **není** `ClientSideInstance.xml`.

## Část C — Nasazení a upgrade na webu (35 min)

### 5. [TENANT] Nahraj novou verzi

SharePoint admin centrum → **More features** → **Apps** → **Open** → **Upload**
`vltava-portal-<ini>.sppkg` → potvrď **nahrazení** existující verze → **jen povolit**
(ne všechny weby).

**Checkpoint:** v katalogu má řádek `vltava-portal-<ini>-client-side-solution` verzi
**1.1.0.0**.

### 6. Ověř, co se změnilo samo

Otevři testovací stránku webu `spodev-<ini>` **bez** debug parametrů.

**Checkpoint:** web party už běží v nové verzi (Adresář cachuje hledání — viz Network), ale
**banner nahoře chybí** — feature ještě neproběhla.

### 7. Aktualizuj aplikaci na webu

**Site contents** → u `vltava-portal-<ini>-client-side-solution` **…** → **Details** →
**GET IT** (*There is a new version of this app*). Počkej, až zmizí stav *Updating*.

**Checkpoint:** po obnovení stránky je nahoře banner oznámení; v seznamu `Equipment` je pro
jednu položku *Available* příkaz **Vydat zařízení / Issue equipment** — vše **bez**
`localhost`.

### 8. Ověř hranici

Otevři český web `spodev-<ini>-cs` (aplikace na něm není).

**Checkpoint (negativní):** na českém webu **žádný** banner — `CustomAction` je jen na webu,
kam byla aplikace přidaná a aktualizovaná.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/) — stav na konci dne 4.
Proti Startovní čáře se změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `sharepoint/assets/ClientSideInstance.xml` | smazaný | žádná tenant-wide registrace na sdíleném tenantu |
| `sharepoint/assets/elements.xml` | změněný | text oznámení, druhá `CustomAction` pro příkaz |
| `sharepoint/assets/upgrade-actions-v1.1.xml` | nový | `ApplyElementManifests` pro web s verzí 1.0.0.0 |
| `config/package-solution.json` | změněný | verze 1.1.0.0 (řešení i feature), `elementManifests` bez `ClientSideInstance.xml`, `upgradeActions` |
| `package.json` | změněný | verze 1.1.0 |

Ve `solution/` jsou na místě `ID-ISSUE-EQUIPMENT` a `FEATURE-ID` šablonová ID kurzu, u tebe
tvoje.

Tento stav je **Startovní čárou** dne 5. Když ti něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).

## Ověření

- [ ] Balíček 1.1.0.0 s upgrade actions je v tenantovém katalogu.
- [ ] Na webu `spodev-<ini>` běží banner a příkaz z katalogu, bez debug parametrů.
- [ ] Web party se aktualizovaly bez zásahu na webu, `CustomAction` až po *GET IT*.
- [ ] **Negativní:** balíček neobsahuje `ClientSideInstance.xml`.
- [ ] **Negativní:** na webu bez aplikace banner není.

## Fallback

- **Po *GET IT* banner pořád chybí** — upgrade actions neproběhly: GUID v `Location` nesedí
  s feature, nebo `features[0].version` zůstala 1.0.0.0. Rychlé řešení pro kurz: aplikaci
  z webu odebrat a přidat znovu (čistá instalace použije `elementManifests`).
- **Příkaz po *GET IT* chybí, banner je** — ID v druhé `CustomAction` nesedí s manifestem
  (checkpoint kroku 1).
- **Nahrání hlásí neplatný balíček** — `upgrade-actions-v1.1.xml` není v `sharepoint/assets`
  nebo má jiný název než v `package-solution.json`.
- **Banner je i na cizích webech** — při nahrání bylo zvoleno nasazení na všechny weby
  a balíček obsahuje `ClientSideInstance.xml`. Ihned nahlásit lektorovi.
- **Při časové tísni:** kroky 6 a 8 jako diskuze; krok 7 nevynechávat. Kód části A převzít
  podle [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (včetně skriptu identity — ten dosadí tvoje ID i do `elements.xml` a upgrade actions,
  protože převzatý kód nese šablonová ID v manifestech i v `package-solution.json`).

## Zdroje (Microsoft)

- [Provision SharePoint assets from your SharePoint client-side web part](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/provision-sp-assets-from-package)
- [Use the site collection app catalog](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog)
