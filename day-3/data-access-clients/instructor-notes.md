# Instructor notes — SPHttpClient, MSGraphClientFactory, AadHttpClient

## Timing

- ~20 min výklad + 50 min lab + 5 min sběr tabulek z kroku 5.
- Kroky 3–4 jsou kopírování; hlídat, aby studenti **nepřepsali manifest** (ID komponenty).

## Go/no-go — otestovat před během

- **Den předem změřit krok 5 na čistém účtu.** Vyplnit tabulku sem. Pokud `/users` bez
  schválení vrací 403, blok běží beze změny — `permissions-consent` je pak nutnost, ne formalita.
- SharePoint admin centrum → *Advanced* → **API access**: žádná schválená oprávnění z dřívějších
  kurzů pro Microsoft Graph (`User.Read.All`, `Presence.Read.All`). Jinak lab neměří výchozí
  stav. Odvolat (*Remove access*) den předem.
- Fiktivní uživatelé (aspoň 20) s `department` a `businessPhones`.

| Měření (doplnit) | Výsledek | Datum |
|---|---|---|
| `/users` bez schválení | | |
| `department` / `businessPhones` bez schválení | | |
| presence bez schválení | | |

## Tripwires

- **Přepsaný manifest** — student zkopíruje manifest ze solution → stejné ID komponenty jako
  referenční řešení a jako sousedé. Kolize ve středu odpoledne v tenantovém katalogu.
- **`$search` bez uvozovek** — Graph vyžaduje `"displayName:text"` včetně uvozovek.
- **„Proč ne `@pnp/graph`?"** — lze; kurz ukazuje vestavěného klienta, PnPjs přijde u SharePointu.
- **Hledání podle diakritiky** — `$search` nad `displayName` tokenizuje; „Novak" najde
  „Novák"? Neověřeno — zkusit a zapsat.

## Vazby

- Zpět: `property-pane` (SPHttpClient), `react-fluent-ui` (struktura, ThemeProvider).
- Dopředu: `permissions-consent` (schválení, fallback presence), `performance-caching`
  (cache výsledků Graphu).
