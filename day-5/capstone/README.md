# Capstone — ukázka výsledku a backlog

> Typ: povinný · Den: 5 · Odhad: 40 min
> Tenant: `cloudedu.cz` · Režim: ukázka výsledku (každý) + backlog
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Konec týdne. Každý student předvede **své** řešení `vltava-portal-<ini>` běžící z App Catalogu,
obhájí čísla, která během týdne naměřil, a projde řešení kolegy podle rubriky.

## Cíle

- Předvést nasazené řešení a vysvětlit, kudy v něm tečou data.
- Obhájit změřenou deltu balíčku a rozhodnutí, která z měření vyplynula.
- Provést code review cizího řešení podle rubriky a navrhnout backlog.

## Výklad

### Obhajoba: 4 minuty, 4 otázky

1. **Co řešení dělá a kde běží?** Tři web party a dvě extensions na webu `spodev-<ini>`,
   verze z App Catalogu, ne z `localhost`.
2. **Kam tečou data?** SharePoint (seznam, knihovny), Microsoft Graph (uživatelé), nic mimo
   tenant; co je v cache a kde (`sessionStorage`, ne `localStorage`).
3. **Co schválil admin a co ne?** `User.Read.All` ano, `Presence.Read.All` ne — a co dělá
   řešení bez něj.
4. **Co jsi změřil a co jsi podle toho udělal?** Baseline středa → čtvrtek → pátek
   (`measurements/*.json`), oprava barrelu, zamítnutý lazy loading, cena error boundary.

### Rubrika code review

Každá oblast 0–2 body (0 = chybí, 1 = částečně, 2 = splněno a doložené).

| Oblast | 2 body = |
|---|---|
| **Funkce** | 3 web party a 2 extensions běží z katalogu na webu studenta |
| **Hranice tenantu** | žádné volání mimo tenant; cache jen v `sessionStorage`; v kódu ani v repu žádný identifikátor tenantu |
| **Oprávnění** | `webApiPermissionRequests` jen s nutnými scope; funkce závislá na neschváleném scope degraduje |
| **Měření** | baseline a aspoň jedno další měření s datem; rozhodnutí odvozené z čísla |
| **Kvalita** | `npm run build` bez chyb, unit testy a test lokalizace, brána velikosti |
| **Provoz** | logování přes `Log`, error boundary, `HARDENING.md` s vysvětlenými nálezy |
| **UX** | čeština i angličtina, ovládání klávesnicí, srozumitelné chybové stavy |
| **Údržba** | struktura `models` / `services` / `hooks` / `utils`, komponenty bez `this.context`, žádné barrel importy s vedlejšími efekty |

Celkem 16 bodů. Rubrika není známka — je to seznam, ze kterého vzniká backlog.

### Backlog

Každá oblast pod 2 body = položka backlogu s **ověřitelným** kritériem hotovo (ne „zlepšit
výkon", ale „Evidence pod 400 000 B, ověřeno `Measure-BundleSize.ps1 -MaxBytes 400000`").
Plus položka *Upgrade na SPFx 1.24* z bloku `spfx-whats-next`.

## Klíčové rozlišení

- **Ukázka vs. obhajoba** — ukázka říká „funguje to", obhajoba „proč takhle a čím to dokládám".
- **Review kódu vs. review člověka** — rubrika hodnotí řešení, ne autora.

## Naše prostředí

Projektor; každý student předvádí ze svého profilu `cloudedu`. Review ve dvojicích nad
repozitářem nebo složkou kolegy (čtení, ne úpravy).

## Lab

Viz [`lab-obhajoba-a-review.md`](lab-obhajoba-a-review.md).

## Nosná linka

Řešení **Vltava Servis** je hotové: Rozcestník, Adresář zaměstnanců, Evidence vybavení,
banner oznámení a akce Vydat zařízení — nasazené, změřené, otestované a s backlogem na
další verzi.

## Zdroje (Microsoft)

- [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [Connect to Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Rubrika předpokládá SPFx 1.23.2 a průběh labů dnů 1–5. Při přechodu kurzu na SPFx 1.24
> doplnit do oblasti Údržba `createRoot`.
