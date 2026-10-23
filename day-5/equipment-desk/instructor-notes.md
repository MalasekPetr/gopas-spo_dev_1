# Instructor notes — Výdejna vybavení

## Timing

- ~10 min úvod (diagram dvou seznamů, lookup čtení vs. zápis, batch není transakce),
  ~108 min samostatně (součet časů kroků), ~2 min rezerva — blok je na hraně; při skluzu převzít kód před krokem 12.
- Lektor **nepředvádí** — chodí, odpovídá, kontroluje checkpointy. Kdo je napřed, dělá bonusy.
- Kdo do 13:30 nemá funkční výdej, převezme kód ze `solution/` (postup ve scénáři, včetně `Set-StudentIdentity.ps1`) — capstone
  potřebuje běžící aplikaci, ne vlastní kód za každou cenu.

## Go/no-go — otestovat před během

- `New-EquipmentLoansList.ps1` jednou proběhnout na vlastním webu lektora (lookup sloupec,
  seed výpůjček podle položek *Issued*).
- Full-page aplikace: vytvořit stránku z web partu **Výdejna** na webu lektora.
- Graph `/users` funguje (schválené `User.Read.All` z dne 3).

## Tripwires

- **Chybí seznam `Equipment`** (student přeskočil D3 nebo ho smazal) — skript `EquipmentLoans`
  skončí chybou; nejdřív `New-EquipmentList.ps1`.
- **Lookup na špatný web** — lookup ukazuje na seznam podle GUID; seznam z cizího webu nejde.
- **Stará verze v App Catalogu** — bez zvýšení verze na 1.2.0.0 se web part v katalogu neobjeví
  jako nový; postup z `packaging-deployment`.
- **Department prázdný** — účty v kurzovním tenantu většinou nemají oddělení; bonus s filtrem
  oddělení pak nic neukáže. Je to očekávané.

## Vazby

- Zpět: `pnpjs` (služba, batching, `ensureUser`), `data-access-clients` (Graph klient),
  `react-fluent-ui` (struktura komponent), `extensions` (Command Set), `packaging-deployment`.
- Dopředu: `capstone` (ukázka výsledku, otázka „batch není transakce").
