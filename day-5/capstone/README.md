# Capstone — ukázka výsledku a backlog

> Typ: povinný · Den: 5 · Odhad: 40 min
> Tenant: `cloudedu.cz` · Režim: ukázka výsledku (každý) + backlog
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Konec týdne. Každý student předvede **svou** Výdejnu vybavení běžící z App Catalogu jako
aplikaci na celou stránku, odpoví na tři otázky a podle rubriky si sám sestaví backlog na
další verzi.

> [!NOTE] Proč ne code review ve dvojicích
> Od 2026-10-23 stojí den 5 na samostatném labu `equipment-desk` (120 min). Capstone se zkrátil
> z 90 na 40 min: ukázka hotového výsledku nese víc než review, na které nezbývá čas. Rubrika
> zůstává — student ji použije na **vlastní** řešení jako zdroj backlogu.

## Cíle

- Předvést nasazenou aplikaci a vysvětlit, kudy v ní tečou data.
- Obhájit změřené číslo a rozhodnutí, které z něj vyplynulo.
- Sestavit backlog s ověřitelnými kritérii hotovo.

## Výklad

### Ukázka: 2 minuty, 3 otázky

1. **Kam tečou data?** Dva seznamy SharePointu (`Equipment`, `EquipmentLoans`) a Microsoft Graph
   (výběr osoby) — nic mimo tenant; co je v cache a kde (`sessionStorage`).
2. **Co se stane, když výdej selže napůl?** `$batch` není transakce: výpůjčka může vzniknout bez
   změny stavu, nebo naopak. Jak by to řešení poznalo a kdo by to opravil?
3. **Co jsi změřil?** Velikost `equipment-desk-web-part` proti bráně 500 000 B a o kolik
   vzrostl Command Set po přechodu na `loanService`.

### Rubrika pro vlastní backlog

Každá oblast 0–2 body (0 = chybí, 1 = částečně, 2 = splněno a doložené).

| Oblast | 2 body = |
|---|---|
| **Funkce** | 4 web party a 2 extensions běží z katalogu na webu studenta; Výdejna jako aplikace na celou stránku |
| **Hranice tenantu** | žádné volání mimo tenant; cache jen v `sessionStorage`; v kódu ani v repu žádný identifikátor tenantu |
| **Oprávnění** | `webApiPermissionRequests` jen s nutnými scope; funkce závislá na neschváleném scope degraduje |
| **Měření** | baseline a aspoň jedno další měření s datem; rozhodnutí odvozené z čísla |
| **Kvalita** | `npm run build` bez chyb a varování, unit testy a test lokalizace, brána velikosti |
| **Provoz** | logování přes `Log`, error boundary, `HARDENING.md` s vysvětlenými nálezy |
| **Konzistence dat** | výdej z Výdejny i z Command Setu zapisuje výpůjčku; souběžný výdej téhož kusu odmítnut |
| **Údržba** | struktura `models` / `services` / `hooks` / `utils`, komponenty bez `this.context`, žádné barrel importy s vedlejšími efekty |

Celkem 16 bodů. Rubrika není známka — je to seznam, ze kterého vzniká backlog.

### Backlog

Každá oblast pod 2 body = položka backlogu s **ověřitelným** kritériem hotovo (ne „zlepšit
výkon", ale „Výdejna pod 400 000 B, ověřeno `Measure-BundleSize.ps1 -MaxBytes 400000`").
Plus položka *Upgrade na SPFx 1.24* z bloku `spfx-whats-next` a položka *napůl hotový výdej*
(bonus B3 labu `equipment-desk`).

## Klíčové rozlišení

- **Ukázka vs. obhajoba** — ukázka říká „funguje to", obhajoba „proč takhle a čím to dokládám".
- **Jeden požadavek vs. jedna transakce** — `$batch` šetří síť, atomicitu nedává.

## Naše prostředí

Projektor; každý student předvádí ze svého profilu `cloudedu` stránku *Vydejna* na webu
`spodev-<ini>`.

## Lab

Viz [`lab-obhajoba-a-review.md`](lab-obhajoba-a-review.md).

## Nosná linka

Řešení **Vltava Servis** je hotové: Rozcestník, Adresář zaměstnanců, Evidence vybavení,
Výdejna vybavení, banner oznámení a akce Vydat zařízení — nasazené ve verzi 1.2.0.0,
změřené, otestované a s backlogem na další verzi.

## Zdroje (Microsoft)

- [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [Single part app pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/single-part-app-pages)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Rubrika předpokládá SPFx 1.23.2 a průběh labů dnů 1–5. Při přechodu kurzu na SPFx 1.24
> doplnit do oblasti Údržba `createRoot`.
