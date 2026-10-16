# Lab · Verze 1.1.0.0 a upgrade na webu

> Modul: `packaging-deployment` · Odhad: 60 min · Režim: hands-on; krok 5 **mění celý tenant**
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení `vltava-portal-<ini>` verze 1.1.0.0 nahrané do tenantového App Catalogu a aplikace na
webu `spodev-<ini>` aktualizovaná tak, že banner a příkaz běží **bez** debug parametrů.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`solution/vltava-portal/`](solution/vltava-portal/).

## Předpoklady

- Hotové `extensions` a `performance-caching`.
- Verze 1.0.0.0 nasazená ve středu a přidaná na web `spodev-<ini>`.

## Kroky

### 1. Uprav registraci extensions

1. Smaž `sharepoint/assets/ClientSideInstance.xml`.
2. Do `sharepoint/assets/elements.xml` doplň za první `CustomAction` druhou — pro příkaz.
   `ClientSideComponentId` vezmi z **tvého** `IssueEquipmentCommandSet.manifest.json`:

   ```xml
   <CustomAction
       Title="IssueEquipment"
       RegistrationId="100"
       RegistrationType="List"
       Location="ClientSideExtension.ListViewCommandSet"
       ClientSideComponentId="<id-z-manifestu-command-setu>">
   </CustomAction>
   ```

3. U první `CustomAction` (banner) nahraď `ClientSideComponentProperties` textem oznámení:

   ```xml
   ClientSideComponentProperties="{&quot;message&quot;:&quot;Planned maintenance of the service desk on Friday 17:00-19:00.&quot;,&quot;level&quot;:&quot;warning&quot;}"
   ```

**Checkpoint:** `elements.xml` má **dvě** `CustomAction`; obě ID existují v tvých manifestech:

```powershell
$ids = Select-String -Path .\sharepoint\assets\elements.xml -Pattern 'ClientSideComponentId="([0-9a-f-]{36})"' -AllMatches |
    ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value }
$ids | ForEach-Object { "$_ : " + [bool](Select-String -Path .\src\extensions\*\*.manifest.json -Pattern $_ -Quiet) }
```

Oba řádky končí `True`.

### 2. Připrav upgrade actions

Zjisti GUID feature:

```powershell
(Get-Content .\config\package-solution.json -Raw | ConvertFrom-Json).solution.features[0].id
```

Vytvoř `sharepoint/assets/upgrade-actions-v1.1.xml` (GUID dosaď):

```xml
<?xml version="1.0" encoding="utf-8"?>
<ApplyElementManifests>
  <ElementManifest Location="<feature-guid>\elements.xml" />
</ApplyElementManifests>
```

V `config/package-solution.json` u feature: `elementManifests` jen `["elements.xml"]` (bez
`ClientSideInstance.xml`) a přidej `"upgradeActions": ["upgrade-actions-v1.1.xml"]`.

**Checkpoint:** `Location` v XML obsahuje přesně GUID feature z příkazu výše.

### 3. Zvyš verze

- `config/package-solution.json`: `solution.version` **a** `features[0].version` na `1.1.0.0`.
- `package.json`: `version` na `1.1.0`.

**Checkpoint:** `Select-String .\config\package-solution.json -Pattern '"version"'` ukáže
dvakrát `1.1.0.0`.

### 4. Zabal a zkontroluj balíček

```powershell
npm run build
Get-ChildItem .\sharepoint\solution\debug -Recurse -File |
    Where-Object Name -match 'upgrade|elements' | Select-Object FullName
Select-String -Path .\sharepoint\solution\debug\AppManifest.xml -Pattern 'Version="1.1.0.0"' -Quiet
```

**Checkpoint:** ve složce feature jsou `elements.xml` i `upgrade-actions-v1.1.xml`; poslední
příkaz vrátí `True`.

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

## Ověření

- [ ] Balíček 1.1.0.0 s upgrade actions je v tenantovém katalogu.
- [ ] Na webu `spodev-<ini>` běží banner a příkaz z katalogu, bez debug parametrů.
- [ ] Web party se aktualizovaly bez zásahu na webu, `CustomAction` až po *GET IT*.
- [ ] **Negativní:** na webu bez aplikace banner není.

## Fallback

- **Po *GET IT* banner pořád chybí** — upgrade actions neproběhly: GUID v `Location` nesedí
  s feature, nebo `features[0].version` zůstala 1.0.0.0. Rychlé řešení pro kurz: aplikaci
  z webu odebrat a přidat znovu (čistá instalace použije `elementManifests`).
- **Nahrání hlásí neplatný balíček** — `upgrade-actions-v1.1.xml` není v `sharepoint/assets`
  nebo má jiný název než v `package-solution.json`.
- **Banner je i na cizích webech** — při nahrání bylo zvoleno nasazení na všechny weby
  a balíček obsahuje `ClientSideInstance.xml`. Ihned nahlásit lektorovi.
- **Při časové tísni:** kroky 6 a 8 jako diskuze; krok 7 nevynechávat.

## Zdroje (Microsoft)

- [Provision SharePoint assets from your SharePoint client-side web part](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/provision-sp-assets-from-package)
- [Use the site collection app catalog](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog)
