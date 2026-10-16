# PnPjs — CRUD, projekce, batching, chyby

> Typ: povinný · Den: 3 · Odhad: 90 min
> Tenant: `cloudedu.cz` · Režim: hands-on, vlastní web
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Třetí web part řešení — **Evidence vybavení** — čte a zapisuje seznam SharePointu. Místo
ručního skládání URL `/_api/…` přes `SPHttpClient` používá PnPjs.

## Cíle

- Nastavit PnPjs v SPFx jednou pro celé řešení.
- Číst položky seznamu s výběrem polí, rozbalením osoby a filtrem.
- Přidávat položky a měnit jich víc najednou jedním dávkovým požadavkem.
- Rozlišit chyby podle stavového kódu a pro chybějící seznam ukázat srozumitelnou zprávu.

## Výklad

### Proč PnPjs

| | `SPHttpClient` | PnPjs (`@pnp/sp`) |
|---|---|---|
| Dotaz | ruční URL `/_api/web/lists/...?$select=...` | `sp.web.getList(url).items.select(...).filter(...)()` |
| Typy | ručně | výsledky typované podle volání |
| Dávky | ručně složený `$batch` | `sp.batched()` |
| Chyby | `response.ok`, ruční čtení těla | `HttpRequestError` se `status`; opakování u 429/503/504 |

PnPjs je komunitní knihovna (Microsoft 365 & Power Platform Community). Pro SPFx 1.18+ se
používá verze 4; inicializuje se z kontextu SPFx:

```typescript
const sp = spfi().using(SPFx(this.context));
```

Dokumentace doporučuje instanci vytvořit **jednou** (ne v obsluze událostí) — v řešení to
dělá `src/services/pnp.ts`.

Zdroje: [PnPjs — getting started](https://pnp.github.io/pnpjs/getting-started/),
[batching](https://pnp.github.io/pnpjs/concepts/batching/),
[error handling](https://pnp.github.io/pnpjs/concepts/error-handling/).

### Selektivní importy

```typescript
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
```

Každý import **přidá** do objektu `sp` jednu oblast API (webs, lists, …). Bez importu
`'@pnp/sp/items'` neexistuje `.items`. Je to záměr: do balíčku jde jen to, co řešení použije.
Má to ale háček, který uvidíme v `bundle-baseline` — import kvůli vedlejšímu efektu nejde
odstranit tree shakingem.

### Seznam `Equipment`

Seznam zřizuje skript [`../../scripts/New-EquipmentList.ps1`](../../scripts/New-EquipmentList.ps1)
(PnP PowerShell), ne web part — **provisioning nepatří do UI kódu**.

| Sloupec (interní název) | Typ | Hodnoty |
|---|---|---|
| `Title` | text | model |
| `AssetTag` | text | inventární číslo |
| `Category` | volba | Laptop, Phone, Monitor, Accessory |
| `Status` | volba | Available, Issued, Repair, Retired (výchozí Available) |
| `AssignedTo` | osoba | komu je vydáno |

Hodnoty voleb jsou **data** (anglicky, stejné ve všech jazycích); web part je pro zobrazení
překládá přes lokalizační soubory.

### Dotaz, který služba posílá

```typescript
sp.web.getList(`${webUrl}/Lists/Equipment`).items
  .select('Id', 'Title', 'AssetTag', 'Category', 'Status', 'AssignedTo/Title', 'AssignedTo/EMail')
  .expand('AssignedTo')
  .filter(`Status eq 'Issued'`)
  .orderBy('Title', true)
  .top(500)();
```

- **`getList(url)` místo `getByTitle(název)`** — název seznamu může někdo přejmenovat nebo
  přeložit, URL ne.
- **Osoba** se čte přes `expand` a výběr podpolí; zapisuje se přes `AssignedToId`.

### Dávka

„Vrátit vybrané" mění stav N položek. Bez dávky N požadavků, s dávkou jeden `$batch`:

```typescript
const [batchedSP, execute] = sp.batched();
const list = batchedSP.web.getList(listUrl);
const updates = ids.map(id => list.items.getById(id).update({ Status: 'Available', AssignedToId: null }));
await execute();
await Promise.all(updates);
```

Dávka smí obsahovat jen požadavky na **jeden web** a po `execute()` je spotřebovaná.

### Chyby

PnPjs vrací `HttpRequestError` s vlastnostmi `status` a `isHttpRequestError`. Služba převede
404 na vlastní `ListNotFoundError` a web part místo technické chyby ukáže, že seznam chybí
a jak ho vytvořit. U 429, 503 a 504 PnPjs požadavek opakuje sám.

## Klíčové rozlišení

- **`getList(url)` vs. `getByTitle(title)`** — stabilní adresa vs. měnitelný název.
- **Interní vs. zobrazovaný název sloupce** — kód používá interní (`AssignedTo`), uživatel vidí
  zobrazovaný; přejmenování sloupce v UI kód nerozbije.
- **Provisioning vs. runtime** — skript zakládá seznam jednou; web part ho jen používá
  a s jeho absencí počítá.

## Naše prostředí

- Skript potřebuje modul `PnP.PowerShell` a **Client ID** aplikace pro interaktivní přihlášení
  v `cloudedu.cz` — sdělí lektor (není v repu).
- Seznam vzniká na vlastním webu `spodev-<ini>`; data jsou fiktivní.

## Lab

Viz [`lab-evidence-vybaveni.md`](lab-evidence-vybaveni.md).

## Nosná linka

Řešení má třetí web part — **Evidence vybavení** — a poprvé **zapisuje** data. Vrácení
vybavení je jedna dávka. Ve čtvrtek přibude akce „Vydat zařízení" přímo v seznamu.

## Zdroje (Microsoft)

- [Working with lists and list items with REST](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)
- [Make batch requests with the REST APIs](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/make-batch-requests-with-the-rest-apis)

## Zdroje (třetí strana — PnPjs, PnP PowerShell)

> [!IMPORTANT] Proč odkaz mimo Learn
> PnPjs a PnP PowerShell jsou komunitní projekty; referenci API a cmdletů Learn nemá.

- [PnPjs — getting started](https://pnp.github.io/pnpjs/getting-started/)
- [PnPjs — batching](https://pnp.github.io/pnpjs/concepts/batching/)
- [PnPjs — error handling](https://pnp.github.io/pnpjs/concepts/error-handling/)
- [PnP PowerShell — Connect-PnPOnline](https://pnp.github.io/powershell/cmdlets/Connect-PnPOnline.html)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> PnPjs 4.22.0 (npm `latest` k 2026-10-16). `Connect-PnPOnline -Interactive` vyžaduje od
> 2024-09-09 parametr `-ClientId` — bez vlastní registrace aplikace se nepřipojí.
