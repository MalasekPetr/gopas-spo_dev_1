# Lab · Volba technologie pro Vltava Servis

> Modul: `platform-positioning` · Odhad: 15 min · Režim: návrh (papír/MD), ve dvojicích
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Tabulka devíti požadavků Vltava Servis, u každého zvolená technologie, místo, kam tečou data,
a kdo musí řešení schválit.

**Jak lab číst:** návrhový lab bez kódu. **Startovní čára** říká, co máš mít před sebou,
každý krok končí **Checkpointem** — nesedí-li, nepokračuj — a **Výstupní stav** popisuje
hotovou tabulku, ke které se týden vrací.

## Předpoklady

- Přečtený [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md) a výklad
  [`README.md`](README.md).

## Startovní čára

První blok kurzu — žádný kód ani nástroje. Vstupem je zadání firmy Vltava Servis ve
[scénáři](../../scenario-vltava-portal.md) a devět požadavků v tabulce kroku 1.

**Checkpoint:** máš otevřený soubor `volba-technologie.md` (nebo papír) a parťáka do dvojice.

## Část A — tabulka rozhodnutí

### 1. Zvol technologii pro každý požadavek

Zkopíruj tabulku do souboru `volba-technologie.md` (nebo na papír) a vyplň sloupec
**Technologie**. Možnosti: JSON formátování · Power Apps / Power Automate · deklarativní
agent · SPFx web part · SPFx extension · SPFx + vlastní API (Azure) · Teams aplikace ·
Copilot UX component · custom engine agent.

| # | Požadavek | Technologie | Kam tečou data | Kdo schvaluje |
|---|---|---|---|---|
| 1 | Ve seznamu *Vybavení* zobrazit stav zařízení barevným štítkem (zelená = skladem, červená = vydáno). | | | |
| 2 | Na úvodní stránce rozcestník s odkazy, který si každé oddělení nastaví samo. | | | |
| 3 | Vyhledávání kolegů podle jména a oddělení s fotkou a telefonem. | | | |
| 4 | Když HR přidá nového zaměstnance do seznamu, pošle se e-mail jeho vedoucímu. | | | |
| 5 | Na **každé** stránce intranetu pruh s aktuálním oznámením (výpadek systému). | | | |
| 6 | Zaměstnanec se zeptá „jaký mám nárok na služební telefon?" a dostane odpověď ze směrnic v knihovně. | | | |
| 7 | V seznamu *Vybavení* tlačítko „Vydat zařízení", které zapíše vydání a pošle data do externího skladového systému dodavatele. | | | |
| 8 | Vedoucí se v Copilotu zeptá „které notebooky jsou volné a komu jsou vydané?" a chce přímo v konverzaci **interaktivní přehled** s filtrem a tlačítkem „Vydat" — ne odstavec textu. | | | |
| 9 | Agent pro servisní techniky **sám hlídá** termíny revizí zařízení, kombinuje data ze SharePointu a externího servisního systému, potřebuje vlastní orchestraci a model a běží v Teams i v Copilotu. | | | |

**Checkpoint:** všech 9 řádků má vyplněnou technologii a u každé volby SPFx umíš jednou
větou říct, proč by levnější varianta (JSON formátování, Power Platform, agent) nestačila.

### 2. Doplň, kam tečou data

U každého řádku napiš do sloupce **Kam tečou data** jednu z možností: *nikam (jen zobrazení)*
· *SharePoint v tenantu* · *Microsoft Graph v tenantu* · *Azure v subscription zákazníka*
· *mimo tenant (kam?)*.

**Checkpoint:** aspoň jeden řádek máš označený *mimo tenant* a umíš ukázat, který konkrétní
krok v něm data posílá ven.

### 3. Doplň, kdo schvaluje

Do sloupce **Kdo schvaluje** napiš, kdo musí řešení povolit, než ho uživatelé uvidí: *nikdo
navíc (vlastník webu)* · *admin tenantu (App Catalog)* · *admin tenantu (API oprávnění)* ·
*admin tenantu (katalog agentů)* · *admin tenantu + zákazník (data mimo tenant)*.

**Checkpoint:** u řádků, kde jsi zvolil SPFx a data jdou do Microsoft Graph, je ve sloupci
**API oprávnění** — ne jen „App Catalog".

## Výstupní stav

Soubor `volba-technologie.md` (nebo papír) s tabulkou devíti požadavků: u každého
technologie, tok dat a schvalovatel. Kód nevzniká, `solution/` modul nemá.

| Výstup | Kde | K čemu dál |
|---|---|---|
| tabulka 9 rozhodnutí | `volba-technologie.md` | srovnání s [`reseni-volba-technologie.md`](reseni-volba-technologie.md) po společné diskuzi |
| řádky 2, 3, 5 a 7 | tamtéž | komponenty, které se celý týden staví ve `vltava-portal` (viz [scénář](../../scenario-vltava-portal.md#co-student-staví)) |
| sloupec *Kdo schvaluje* | tamtéž | návrat ve středu u App Catalogu a API oprávnění |

Navazující modul [`dev-environment`](../dev-environment/) z tabulky nic nepřebírá — začíná
instalací.

## Ověření

- [ ] 9 řádků, každý s technologií, tokem dat a schvalovatelem.
- [ ] SPFx je zvolené jen tam, kde umíš říct, proč nestačí levnější varianta.
- [ ] Řádek 7 má tok dat **mimo tenant** a schvalovatele včetně zákazníka.
- [ ] **Negativní:** v tabulce není SharePoint Add-in ani Script Editor web part — obojí
      v SharePoint Online pro nová řešení nepřichází v úvahu.

## Fallback

- **Dvojice se zasekne na jednom řádku:** přeskočit, vrátit se při společném srovnání.
- **Při časové tísni:** nejdřív vypustit řádky 8 a 9 (probrat je jen ve společném srovnání),
  pak jen kroky 1 a 2 pro řádky 2, 3, 5 a 7 — to jsou čtyři komponenty, které se budou celý
  týden stavět nebo rozebírat.

Referenční řešení: [`reseni-volba-technologie.md`](reseni-volba-technologie.md) — otevřít až
po společném srovnání.

## Zdroje (Microsoft)

- [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [Column formatting](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/column-formatting)
- [Declarative agents for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent)
- [Overview of Copilot UX components](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/copilot/overview-copilot-apps)
- [Custom engine agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-custom-engine-agent)
