# Den 3 — Data a oprávnění

Řešení začne číst data: Adresář zaměstnanců z Microsoft Graph a Evidence vybavení ze seznamu
přes PnPjs. Poprvé se nasazuje do tenantového App Catalogu a poprvé se měří velikost balíčku.

| Pořadí | Blok | Slug | Typ | min |
|---|---|---|---|---|
| 1 | SPHttpClient, MSGraphClientFactory, AadHttpClient | [`data-access-clients`](data-access-clients/) | P | 75 |
| 2 | API oprávnění, admin consent a fallback | [`permissions-consent`](permissions-consent/) | P | 75 |
| 3 | PnPjs — CRUD, projekce, batching, chyby | [`pnpjs`](pnpjs/) | P | 90 |
| 4 | Výkon I — měřený baseline balíčku | [`bundle-baseline`](bundle-baseline/) | P | 60 |

Celkem **300 min**.

> [!WARNING] Den, kdy se sahá na celý tenant
> V bloku `permissions-consent` nasazují všichni do **jednoho** tenantového App Catalogu
> a schválení API oprávnění platí pro **všechna** řešení v tenantu. Lab má tenantové kroky
> výslovně označené — nic jiného na úrovni tenantu se nedělá.

## Kompresní ventily

Škrtá se odshora:

1. Porovnání požadavků v Network (`data-access-clients`, krok 7) jako demo (−10).
2. Ověření chybějícího seznamu v `pnpjs` (krok 8) jako demo (−10).
3. Pohled do dependency auditu v `bundle-baseline` (krok 5) jako demo (−5).

**Nekrátit** `permissions-consent` — bez schválených oprávnění nefunguje Graph. **Nekrátit**
`bundle-baseline` — čtvrtek nemá s čím srovnávat.

> [!NOTE] Proč nasazení na dni 3
> Žádosti o API oprávnění vznikají až nasazením `.sppkg` do App Catalogu — v kurzu do
> tenantového. Den 3 proto nasazuje nutné minimum; den 4 řeší verzování, upgrade a tenant
> vs. site. Otevřená otázka k ověření před dnem 3: vzniká žádost i při nasazení do site
> collection App Catalogu?
