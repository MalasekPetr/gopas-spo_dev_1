# Řešení · Volba technologie pro Vltava Servis

Referenční odpovědi k [`lab-volba-technologie.md`](lab-volba-technologie.md). Nejde o jedinou
správnou odpověď — jde o to, aby volba byla odůvodněná. Kde se třída rozejde, je to dobré
místo pro diskuzi.

| # | Technologie | Kam tečou data | Kdo schvaluje | Proč |
|---|---|---|---|---|
| 1 | **JSON formátování** | nikam | nikdo navíc | Mění jen vzhled hodnoty, kterou seznam už má. SPFx Field Customizer by byl kód na údržbu bez přidané hodnoty. |
| 2 | **SPFx web part** | SharePoint v tenantu | admin tenantu (App Catalog) | Konfigurovatelný rozcestník s vlastním UI a lokalizací. Standardní web part *Quick links* by pokryl část — tady je důvodem nosná linka kurzu, v praxi nejdřív zkusit Quick links. |
| 3 | **SPFx web part** | Microsoft Graph v tenantu | admin tenantu (App Catalog + **API oprávnění**) | Graph `users` s vyhledáváním a fotkou. Vyžaduje schválené oprávnění — středa. |
| 4 | **Power Automate** | SharePoint + Exchange v tenantu | vlastník toku | Automatizace na událost seznamu. SPFx běží jen v prohlížeči a nic „na pozadí" nespustí. Kde už tým provozuje vlastní API, je rovnocennou volbou Azure Function spuštěná webhookem seznamu — verzovaná v gitu a bez závislosti na vlastníkovi toku. |
| 5 | **SPFx extension** (Application Customizer) | SharePoint v tenantu | admin tenantu (App Catalog) | Chování na **každé** stránce — jediná podporovaná cesta je placeholder, ne úprava DOM. |
| 6 | **Deklarativní agent** (SharePoint agent nad knihovnou směrnic) | Microsoft 365 v tenantu | vlastník obsahu / admin podle politiky agentů | Odpověď nad dokumenty; kód by tu nic nepřidal. |
| 7 | **SPFx + vlastní API**: ListView Command Set → Azure Function → skladový systém | **mimo tenant** — skladový systém dodavatele (Azure Function sama běží v subscription zákazníka) | admin tenantu (App Catalog + API oprávnění) **+ zákazník** | Akce v seznamu je SPFx. Klíč ke skladovému systému nesmí být v bundlu — každý uživatel si ho přečte — proto volání vede přes Azure Function za Entra ID. Tok dat ven musí zákazník znát a schválit. V kurzu stavíme jen zápis do seznamu; vzor s Azure Function ukazuje [gopas-jsdays-2026](https://github.com/MalasekPetr/gopas-jsdays-2026). |
| 8 | **Copilot UX component** (SPFx) — deklarativní agent + SPFx UI v jednom `.sppkg` | SharePoint v tenantu | admin tenantu (App Catalog + „Add to Teams" = katalog agentů) | Textová odpověď (řádek 6) nestačí — uživatel chce filtrovat a jednat. UI se píše stejným toolchainem jako web part a může s ním sdílet komponenty. **Preview** — Microsoft ji do produkce nedoporučuje. |
| 9 | **Custom engine agent** (Microsoft 365 Agents SDK), hostovaný v Azure subscription zákazníka | Azure v subscription zákazníka + **mimo tenant** — servisní systém | admin tenantu (katalog agentů, registrace aplikace v Entra ID) **+ zákazník** | Deklarativní agent jen odpovídá na dotaz a orchestraci mu dělá Copilot. Proaktivní hlídání termínů a vlastní model vyžadují vlastní běžící službu — stejný důvod jako backend u řádku 7. |

## Na co se v diskuzi zaměřit

- **Řádek 2 je schválně sporný.** Kurz rozcestník staví, protože se na něm dobře učí property
  pane a lokalizace. V praxi je správná první otázka: „Proč nestačí Quick links?"
- **Řádek 4 je nejčastější chyba.** SPFx běží jen když má uživatel otevřenou stránku. Nic,
  co se má stát „když se něco změní", do SPFx nepatří.
- **Řádek 7** je první místo týdne, kde data opouštějí tenant. Vrátí se v pátek
  v `diagnostics-hardening` u telemetrie.
- **Řádky 6, 8 a 9 jsou žebřík agentů.** Odpověď textem → deklarativní agent; interaktivní
  UI v konverzaci → Copilot UX component (SPFx, pátek v `spfx-whats-next`); vlastní
  orchestrace a proaktivita → custom engine agent. Ten je mimo rozsah kurzu — navazuje na
  něj SPO_COPILOT.
