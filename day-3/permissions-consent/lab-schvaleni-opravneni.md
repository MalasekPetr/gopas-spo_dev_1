# Lab · Žádost, nasazení, schválení a fallback

> Modul: `permissions-consent` · Odhad: 50 min · Režim: hands-on; kroky 4 a 5 **mění celý tenant**
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení `vltava-portal-<ini>` nasazené z tenantového App Catalogu na vlastní web, Adresář
s odděleními a telefony a s funkčním fallbackem pro neschválenou dostupnost.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

> [!WARNING] Tenantové kroky
> Kroky označené **[TENANT]** mění prostředí pro celou třídu. Na stránce **API access**
> **nic neschvaluj ani nezamítej** — schvaluje lektor na projektoru.

## Předpoklady

- Hotový [`../data-access-clients/`](../data-access-clients/) a vyplněná tabulka z kroku 5.

## Kroky

### 1. Přidej žádosti o oprávnění

V `config/package-solution.json` přidej do objektu `solution` za `"isDomainIsolated": false,`:

```json
"webApiPermissionRequests": [
  { "resource": "Microsoft Graph", "scope": "User.Read.All" },
  { "resource": "Microsoft Graph", "scope": "Presence.Read.All" }
],
```

**Checkpoint:** `solution.name` v témže souboru obsahuje tvé iniciály
(`vltava-portal-<ini>-client-side-solution`) a `solution.id` je stejné jako v pondělí.

### 2. Zabal řešení a najdi žádosti v balíčku

```powershell
npm run build
Copy-Item .\sharepoint\solution\vltava-portal-<ini>.sppkg "$env:TEMP\vp.zip" -Force
Expand-Archive "$env:TEMP\vp.zip" "$env:TEMP\vp" -Force
Select-String -Path "$env:TEMP\vp\AppManifest.xml" -Pattern 'Presence.Read.All' -Quiet
```

**Checkpoint:** poslední příkaz vrátí `True` — žádost je v `AppManifest.xml` balíčku.

### 3. Odhadni dopad, než nahraješ

Ve dvojici odpovězte (nahlas lektorovi): když lektor schválí `User.Read.All` pro **tvoje**
řešení, které další řešení v tenantu ho budou moci použít?

**Checkpoint:** odpověď je „všechna SPFx řešení v tenantu" — ne „jen moje".

### 4. [TENANT] Nahraj řešení do tenantového App Catalogu

SharePoint admin centrum → **More features** → **Apps** → **Open** → **Upload** →
`vltava-portal-<ini>.sppkg`. V dialogu zvol variantu **jen povolit aplikaci**
(*Only enable this app*), **ne** zpřístupnění na všech webech.

**Checkpoint:** v katalogu je řádek `vltava-portal-<ini>-client-side-solution`, nasazený
(*Enabled*). Dialog upozornil, že řešení žádá o přístup k API.

### 5. [TENANT] Najdi svou žádost — a nesahej na ni

SharePoint admin centrum → **Advanced** → **API access**.

**Checkpoint:** v *Pending requests* je `Microsoft Graph` · `User.Read.All` a `Microsoft Graph` ·
`Presence.Read.All`. Lektor na projektoru schválí **jen** `User.Read.All`.

### 6. Přidej aplikaci na vlastní web a vlož Adresář na stránku

Na `/sites/spodev-<ini>`: **Site contents** → **New** → **App** → `vltava-portal-<ini>…` → **Add**.
Pak testovací stránka → **Edit** → **+** → **Vltava Employee Directory (<ini>)** — tentokrát
**bez** debug parametrů v adrese.

**Checkpoint:** Adresář běží z App Catalogu (F12 → Network: skripty se načítají z
`…/ClientSideAssets/…` nebo CDN, ne z `localhost:4321`) a u lidí je oddělení a telefon.

### 7. Ověř fallback

**Checkpoint (negativní):** nad seznamem je informační pruh *Availability is not shown: the
administrator has not approved the permission.* (na českém webu česky), a seznam lidí přesto
funguje. V Network je požadavek `getPresencesByUserId` se stavem **403**.

### 8. Zjisti, co by udělalo smazání řešení

Neprováděj — jen odpověz s pomocí README: když lektor po kurzu smaže všechna řešení
`vltava-portal-*` z katalogu, zmizí schválené `User.Read.All`?

**Checkpoint:** odpověď „ne — odvolává se zvlášť (*Remove access*) na stránce API access".

## Ověření

- [ ] `.sppkg` obsahuje žádosti o `User.Read.All` a `Presence.Read.All`.
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
  z dřívějška (nahradit), nebo jsi převzal cizí projekt — viz scénář, kapitola o dohnání skluzu.
- **Při časové tísni:** kroky 3 a 8 jako diskuze s celou třídou.

## Zdroje (Microsoft)

- [Connect to Entra ID-secured APIs in SharePoint Framework solutions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)
- [Manage access to Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/api-access)
