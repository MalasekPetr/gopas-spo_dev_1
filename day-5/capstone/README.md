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

### Jak obhájit rozhodnutí číslem

Obhajoba má pět částí a každá se dá zkontrolovat:

1. **Tvrzení** — jedna věta, co platí („lazy loading Evidenci nezrychlí").
2. **Měření** — co se měřilo, čím, kdy a na čem (soubor, nástroj, datum, stroj).
3. **Alternativa** — s čím se číslo srovnává; číslo bez srovnání nic nerozhoduje.
4. **Rozhodnutí** — co se z čísla udělalo (ponecháno / zamítnuto).
5. **Pravidlo** — co si z toho odnést na příště, jedna věta.

Dva vzory z týdne, oba se surovými daty v repu:

| | Lazy loading celé Evidence | Hláška error boundary |
|---|---|---|
| Tvrzení | počáteční bundle je menší, celkem se stahuje víc | `MessageBar` je na chybovou hlášku drahý |
| Měření (2026-10-16, lektorský stroj, `Measure-BundleSize.ps1`) | `equipment-web-part` 50 872 B + chunky; celkem 488 256 B proti 454 270 B (**+33 986 B**) | Rozcestník: `MessageBar` +8 346 B, `<div role="alert">` + CSS modul **+647 B** |
| Alternativa | bez lazy loadingu | Fluent UI vs. prostý HTML |
| Rozhodnutí | zamítnuto — web part se vykresluje hned, UI se stejně stáhne celé | ponecháno `<div role="alert">` |
| Data | [`mereni-den-4.md`](../../day-4/performance-caching/mereni-den-4.md) | [`mereni-hardening.md`](../diagnostics-hardening/mereni-hardening.md) |

Jak se pozná slabá obhajoba:

- **Číslo bez data a stroje** — „Výdejna má 470 KB". Kdy, z jakého buildu, raw nebo gzip?
  Pravidlo repa: číslo bez data a bez stroje neexistuje
  ([`CONVENTIONS.md`](../../CONVENTIONS.md#nic-netvrdit-bez-měření)).
- **Míchání metrik** — raw velikost jednoho souboru proti gzip jiného, nebo počáteční bundle
  proti celkovému objemu (přesně past lazy loadingu: 9× menší počáteční bundle, víc dat celkem).
- **Jedno měření času** — doba volání API z `perf.ts` kolísá mezi pokusy, proto vyžaduje
  opakování. Velikost bundlu ze stejného zdrojového kódu by se měnit neměla — ověř to dvěma
  čistými buildy, než na tom postavíš srovnání.
- **„Je to rychlejší"** bez druhého čísla — tripwire z lektorských poznámek; odpověď je otázka
  „o kolik a proti čemu?".

### Kritérium hotovo, které jde ověřit

Kritérium je ověřitelné, když ho jde zkontrolovat **příkazem nebo pozorováním se známým
výsledkem** — a když ho dva lidé vyhodnotí stejně. Tvar: *co ověřím, čím, jaký výsledek
očekávám*. Pomáhá přidat i **negativní** kontrolu: co se stát nesmí.

| Slabé kritérium | Ověřitelné kritérium |
|---|---|
| „Výdejna je menší" | `Measure-BundleSize.ps1 -MaxBytes 400000` vrátí `exit 0` pro `equipment-desk-web-part` |
| „Překlady jsou kompletní" | `npm run build` projde; po smazání libovolného klíče z `cs-cz.js` skončí `FAIL ... loc.test.js` |
| „Souběžný výdej je ošetřený" | dvě záložky, stejný kus, výdej v obou: druhá skončí hláškou *není skladem* a v `EquipmentLoans` je **jedna** otevřená výpůjčka (lab `equipment-desk`, krok 10) |
| „V kódu nejsou identifikátory tenantu" | `Get-ChildItem .\src -Recurse -File \| Select-String -Pattern '<tenant>'` nevrátí nic |
| „Upgrade na 1.24 hotový" | `npm ls @microsoft/sp-core-library` ukazuje 1.24.x, `npm run build` bez chyb a varování, všechny testy zelené, velikosti změřené a porovnané s baseline |

Typická chyba: kritérium popisuje **činnost**, ne **stav** („prověřit souběh", „optimalizovat
bundle"). Činnost je hotová, jakmile ji někdo dělal; stav je hotový, až když platí. Druhá
typická chyba: kritérium závislé na pocitu („rozumně rychlé") — pokud na rychlosti záleží,
patří do kritéria číslo, nástroj a podmínky měření.

### Napůl hotový výdej jako položka backlogu

Otázka 2 z ukázky nemá v klientském kódu úplnou odpověď. REST API SharePointu nejsou
transakční: operace v `$batch` se při selhání jiné operace nevrátí zpět
([Make batch requests with the REST APIs](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/make-batch-requests-with-the-rest-apis)).
Dobrá položka backlogu proto neslibuje „atomický výdej", ale řeší tři věci:

- **zúžit** možné nesoulady — podmíněný zápis s ETag a pořadí zápisů, rozbor v
  [`../equipment-desk/explainer-concurrency-etag.md`](../equipment-desk/explainer-concurrency-etag.md),
- **poznat** nesoulad — např. kus *Issued* bez otevřené výpůjčky (bonus B3),
- **určit**, kdo nesoulad opravuje a s jakým oprávněním.

Kritérium hotovo pak zní např.: „záložka *Nesoulad* ukáže každý kus *Issued* bez otevřené
výpůjčky; ověřeno ruční úpravou `Status` v seznamu `Equipment`."

## Klíčové rozlišení

- **Ukázka vs. obhajoba** — ukázka říká „funguje to", obhajoba „proč takhle a čím to dokládám".
- **Jeden požadavek vs. jedna transakce** — `$batch` šetří síť, atomicitu nedává.
- **Činnost vs. stav** — „optimalizovat" je činnost; „pod 400 000 B, `exit 0`" je stav, který
  jde ověřit.
- **Počáteční vs. celkový objem** — lazy loading zmenší první, ale může zvětšit druhý; obhajoba
  musí říct, které číslo rozhoduje a proč.

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
- [Make batch requests with the REST APIs](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/make-batch-requests-with-the-rest-apis)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Rubrika předpokládá SPFx 1.23.2 a průběh labů dnů 1–5. Při přechodu kurzu na SPFx 1.24
> doplnit do oblasti Údržba `createRoot`.
