# Lab · Evidence vybavení s PnPjs

> Modul: `pnpjs` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Seznam `Equipment` na vlastním webu a web part Evidence vybavení, který ho čte, filtruje,
přidává položky a vrací vybrané kusy jednou dávkou.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`../bundle-baseline/solution/vltava-portal/`](../bundle-baseline/solution/vltava-portal/).

## Předpoklady

- Hotové `data-access-clients` a `permissions-consent`.
- Client ID aplikace PnP pro `cloudedu.cz` od lektora.

## Kroky

### 1. Zřiď seznam skriptem

```powershell
if (-not (Get-Module -ListAvailable PnP.PowerShell)) {
    Install-Module PnP.PowerShell -Scope CurrentUser
}
& "$HOME\gopas-spo_dev_1\scripts\New-EquipmentList.ps1" `
    -SiteUrl "https://<tenant>.sharepoint.com/sites/spodev-<ini>" `
    -ClientId <client-id-od-lektora>
```

Přihlášení proběhne v prohlížeči (MFA) — vyber kurzovní účet.

**Checkpoint:** na webu je seznam **Equipment** s 12 položkami; 3 mají stav *Issued*
a ve sloupci *AssignedTo* tebe.

**Checkpoint (negativní):** druhé spuštění téhož příkazu vypíše jen šedé řádky *exists* /
*seed skipped* — nic nezaloží podruhé.

### 2. Doinstaluj PnPjs a přidej web part

```powershell
npm install @pnp/sp@4.22.0 --save-exact
yo @microsoft/sharepoint --component-type webpart --component-name Equipment `
    --framework react --skip-install --no-insight
```

**Checkpoint:** `package.json` má `"@pnp/sp": "4.22.0"`; `config/config.json` má bundle
`equipment-web-part`.

### 3. Přidej model, služby a hook

Ze [solution](../bundle-baseline/solution/vltava-portal/src/) zkopíruj:

| Soubor | Co v něm hledat |
|---|---|
| `src/models/IEquipmentItem.ts` | hodnoty stavů jako typ `EquipmentStatus` |
| `src/services/pnp.ts` | jediná instance `spfi().using(SPFx(...))` |
| `src/services/equipmentService.ts` | `getList(url)`, `select`/`expand`, `sp.batched()`, `ListNotFoundError` |
| `src/services/index.ts` | barrel služeb |
| `src/hooks/useEquipment.ts` | `version` — po zápisu načte data znovu |

Do `src/models/index.ts` přidej:

```typescript
export type { EquipmentStatus, IEquipmentItem, INewEquipmentItem } from './IEquipmentItem';
export { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from './IEquipmentItem';
```

Do `src/hooks/index.ts` přidej:

```typescript
export { useEquipment } from './useEquipment';
export type { IUseEquipmentResult } from './useEquipment';
```

**Checkpoint:** `equipmentService.ts` importuje `'@pnp/sp/webs'`, `'/lists'`, `'/items'`
a `'/batching'` — a nic víc z PnPjs.

### 4. Napiš web part

Ze solution zkopíruj obsah souborů ve `src/webparts/equipment/` (**kromě manifestu**):
`EquipmentWebPart.ts`, `components/*`, `loc/mystrings.d.ts`, `loc/en-us.js`, `loc/cs-cz.js`.
V manifestu změň `preconfiguredEntries[0]`:

```json
"title": { "default": "Vltava Equipment (<ini>)", "cs-CZ": "Evidence vybaveni Vltava (<ini>)" },
"description": { "default": "Who has which laptop and phone" },
"officeFabricIconFontName": "Devices3",
"properties": {}
```

(v souboru s diakritikou: *Evidence vybavení*).

**Checkpoint:** `npm start -- --nobrowser` zkompiluje bez chyb.

### 5. Čti a filtruj

Workbench vlastního webu + query string → **Vltava Equipment (<ini>)**.

**Checkpoint:** tabulka s 12 položkami seřazenými podle modelu; sloupec *Assigned to* ukazuje
tvoje jméno u 3 kusů. Filtr **Issued** nechá 3 řádky (F12 → Network: nový požadavek s
`$filter=Status eq 'Issued'`).

### 6. Přidej položku

**Add equipment** → model `HP EliteBook 840`, inventární číslo `VS-NB-005`, kategorie
*Laptop* → **Save**.

**Checkpoint:** položka je v tabulce i v seznamu **Equipment** se stavem *Available* —
výchozí hodnotu nastavila služba, ne uživatel.

### 7. Vrať vybrané jednou dávkou

Filtr **All**, vyber 3 položky ve stavu *Issued* → **Return selected (3)**.

**Checkpoint:** všechny 3 jsou *Available* a bez přiřazené osoby. V Network je **jeden**
požadavek na `_api/$batch`, ne tři `MERGE`.

### 8. Ověř chybějící seznam

Na **českém** webu `spodev-<ini>-cs` (seznam tam není) otevři workbench a vlož Evidenci.

**Checkpoint (negativní):** místo tabulky je žluté varování *Seznam Equipment na tomto webu
neexistuje…* s odkazem — ne červená technická chyba ani prázdná tabulka.

## Ověření

- [ ] Seznam `Equipment` vznikl skriptem, opakované spuštění nic nezdvojí.
- [ ] Web part čte, filtruje, přidává a vrací vybrané kusy.
- [ ] Vrácení N kusů = jeden požadavek `$batch`.
- [ ] **Negativní:** na webu bez seznamu web part ukáže srozumitelné varování.

## Fallback

- **`Connect-PnPOnline` hlásí chybu aplikace / AADSTS** — špatné Client ID nebo jiný tenant.
  Ověřit hodnotu od lektora; přihlásit se kurzovním účtem.
- **`Install-Module` chce potvrdit nedůvěryhodné úložiště** — potvrdit `Y` (PSGallery).
- **Skript nejde spustit vůbec** — ruční fallback: na webu **New** → **List** → **Blank list**
  `Equipment`, adresa `Lists/Equipment`; sloupce podle tabulky v README s **přesně** těmito
  interními názvy (při zakládání sloupce zadat nejdřív anglický název bez mezer).
- **Prázdná tabulka bez chyby** — sloupce mají jiné interní názvy; v nastavení seznamu
  zkontrolovat URL sloupce (`Field=AssetTag`).
- **Při časové tísni:** krok 8 jako demo lektora.

## Zdroje (Microsoft)

- [Working with lists and list items with REST](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)

## Zdroje (třetí strana — PnPjs)

- [PnPjs — batching](https://pnp.github.io/pnpjs/concepts/batching/)
