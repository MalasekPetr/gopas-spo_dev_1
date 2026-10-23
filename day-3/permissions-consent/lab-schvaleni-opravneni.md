# Lab · Žádost, nasazení, schválení a fallback

> Modul: `permissions-consent` · Odhad: 50 min · Režim: hands-on; kroky 5 a 6 **mění celý tenant**
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení `vltava-portal-<ini>` nasazené z tenantového App Catalogu na vlastní web, Adresář
s odděleními a telefony a s funkčním fallbackem pro neschválenou dostupnost.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

> [!WARNING] Tenantové kroky
> Kroky označené **[TENANT]** mění prostředí pro celou třídu. Na stránce **API access**
> **nic neschvaluj ani nezamítej** — schvaluje lektor na projektoru.

## Předpoklady

- Hotový lab [`../data-access-clients/`](../data-access-clients/) a vyplněná tabulka z kroku 11.

## Startovní čára

Lab začíná u stavu po modulu [`data-access-clients`](../data-access-clients/): referenční kód
[`../data-access-clients/solution/vltava-portal/`](../data-access-clients/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**). Dnes se poprvé nasazuje —
  bez skriptu by tvůj balíček přepsal balíček kolegy.

**Checkpoint:** `npm run build` projde, ve `src/webparts/` jsou složky `portal`
a `employeeDirectory` a `config/package-solution.json` ještě **nemá** klíč
`webApiPermissionRequests`.

## Část A — Žádost o oprávnění v balíčku (15 min)

### 1. Přidej žádosti o oprávnění

Web part o oprávnění nežádá kódem, ale **balíčkem**: seznam scope v `package-solution.json` se
dostane do `.sppkg` a z něj při nahrání do App Catalogu vznikne žádost pro admina.

Soubor `config/package-solution.json` — **změna**: najdi

```json
    "isDomainIsolated": false,
```

a přidej za něj:

```json
    "webApiPermissionRequests": [
      { "resource": "Microsoft Graph", "scope": "User.Read.All" },
      { "resource": "Microsoft Graph", "scope": "Presence.Read.All" }
    ],
```

- `User.Read.All` potřebuje `/users` s odděleními a telefony, `Presence.Read.All` dostupnost.
- `resource` je jméno API (service principal) v Entra ID, ne URL.

**Checkpoint:** `solution.id` v témže souboru je stejné jako ráno — přidání žádostí identitu
řešení nemění.

### 2. Zabal řešení a najdi žádosti v balíčku

```powershell
npm run build
Copy-Item .\sharepoint\solution\vltava-portal-<ini>.sppkg "$env:TEMP\vp.zip" -Force
Expand-Archive "$env:TEMP\vp.zip" "$env:TEMP\vp" -Force
Select-String -Path "$env:TEMP\vp\AppManifest.xml" -Pattern 'Presence.Read.All' -Quiet
```

**Checkpoint:** poslední příkaz vrátí `True` — žádost je v `AppManifest.xml` balíčku.

### 3. Ověř identitu balíčku před prvním nahráním

Tohle je první nahrání do **sdíleného** katalogu. Co nese šablonová ID nebo jméno bez
iniciál, přepíše cizí řešení.

```powershell
Get-ChildItem .\sharepoint\solution\*.sppkg | Select-Object Name
Select-String -Path .\config\package-solution.json -Pattern '"name"' | Select-Object -First 1
```

**Checkpoint:** balíček se jmenuje **`vltava-portal-<ini>.sppkg`** a `solution.name` je
`vltava-portal-<ini>-client-side-solution`.

**Checkpoint (negativní):** balíček **nesmí** být `vltava-portal.sppkg`. Pokud je — nenahrávej,
spusť `Set-StudentIdentity.ps1` podle [scénáře](../../scenario-vltava-portal.md#identita-řešení-na-sdíleném-tenantu),
znovu `npm run build` a vrať se na začátek kroku.

## Část B — Nasazení a žádost v admin centru (20 min)

### 4. Odhadni dopad, než nahraješ

Ve dvojici odpovězte (nahlas lektorovi): když lektor schválí `User.Read.All` pro **tvoje**
řešení, které další řešení v tenantu ho budou moci použít?

**Checkpoint:** odpověď je „všechna SPFx řešení v tenantu" — ne „jen moje".

### 5. [TENANT] Nahraj řešení do tenantového App Catalogu

SharePoint admin centrum → **More features** → **Apps** → **Open** → **Upload** →
`vltava-portal-<ini>.sppkg`. V dialogu zvol variantu **jen povolit aplikaci**
(*Only enable this app*), **ne** zpřístupnění na všech webech.

**Checkpoint:** v katalogu je řádek `vltava-portal-<ini>-client-side-solution`, nasazený
(*Enabled*). Dialog upozornil, že řešení žádá o přístup k API.

### 6. [TENANT] Najdi svou žádost — a nesahej na ni

SharePoint admin centrum → **Advanced** → **API access**.

**Checkpoint:** v *Pending requests* je `Microsoft Graph` · `User.Read.All` a `Microsoft Graph` ·
`Presence.Read.All`. Lektor na projektoru schválí **jen** `User.Read.All`.

## Část C — Řešení na webu a fallback (15 min)

### 7. Přidej aplikaci na vlastní web a vlož Adresář na stránku

Na `/sites/spodev-<ini>`: **Site contents** → **New** → **App** → `vltava-portal-<ini>…` → **Add**.
Pak testovací stránka → **Edit** → **+** → **Vltava Employee Directory (<ini>)** — tentokrát
**bez** debug parametrů v adrese.

**Checkpoint:** Adresář běží z App Catalogu (F12 → Network: skripty se načítají z
`…/ClientSideAssets/…` nebo CDN, ne z `localhost:4321`) a u lidí je oddělení a telefon.

### 8. Ověř fallback

Kód fallbacku vznikl v `data-access-clients` (`useEmployees` + pruh v `EmployeeDirectory.tsx`);
teprve teď má reálný důvod se ukázat.

**Checkpoint (negativní):** nad seznamem je informační pruh *Availability is not shown: the
administrator has not approved the permission.* (na českém webu česky), a seznam lidí přesto
funguje. V Network je požadavek `getPresencesByUserId` se stavem **403**.

### 9. Zjisti, co by udělalo smazání řešení

Neprováděj — jen odpověz s pomocí README: když lektor po kurzu smaže všechna řešení
`vltava-portal-*` z katalogu, zmizí schválené `User.Read.All`?

**Checkpoint:** odpověď „ne — odvolává se zvlášť (*Remove access*) na stránce API access".

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `config/package-solution.json` | změněný | `webApiPermissionRequests` pro `User.Read.All` a `Presence.Read.All` |

Mimo kód: balíček `vltava-portal-<ini>.sppkg` je v tenantovém App Catalogu, přidaný na tvůj web,
`User.Read.All` schválené, `Presence.Read.All` čeká.

Tento stav je **Startovní čárou** modulu [`pnpjs`](../pnpjs/). Když ti něco nevyšlo, převezmi
ho podle [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] `.sppkg` obsahuje žádosti o `User.Read.All` a `Presence.Read.All`.
- [ ] Balíček se jmenuje `vltava-portal-<ini>.sppkg` a v katalogu je pod tvými iniciálami.
- [ ] Řešení je v tenantovém katalogu jen povolené a přidané jen na vlastní web.
- [ ] Adresář na stránce běží z katalogu a ukazuje oddělení.
- [ ] **Negativní:** dostupnost se nezobrazí, pruh to vysvětlí, `getPresencesByUserId` vrací 403.
- [ ] **Negativní:** na stránce API access jsi nic neschválil ani nezamítl.

## Fallback

- **Oddělení se ani po schválení nezobrazí** — token se drží v prohlížeči. Zavřít všechna okna
  profilu `cloudedu`, otevřít znovu; případně několik minut počkat.
- **Na webu se aplikace nedá přidat** — při nahrání bylo zvoleno nasazení na všechny weby
  (pak už je dostupná) nebo aplikace není *Enabled*.
- **Upload hlásí konflikt** — řešení se stejným `solution.id` už v katalogu je: buď tvoje
  z dřívějška (nahradit), nebo jsi převzal kód a nespustil `Set-StudentIdentity.ps1` — viz
  [scénář](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).
- **V `sharepoint\solution\` je balíček bez iniciál** — viz negativní checkpoint kroku 3;
  nenahrávat.
- **Při časové tísni:** kroky 4 a 9 jako diskuze s celou třídou.

## Zdroje (Microsoft)

- [Connect to Entra ID-secured APIs in SharePoint Framework solutions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)
- [Manage access to Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/api-access)
