# Řešení · Volba technologie pro Vltava Servis

Referenční odpovědi k [`lab-volba-technologie.md`](lab-volba-technologie.md). Nejde o jedinou
správnou odpověď — jde o to, aby volba byla odůvodněná. Kde se třída rozejde, je to dobré
místo pro diskuzi.

| # | Technologie | Kam tečou data | Kdo schvaluje | Proč |
|---|---|---|---|---|
| 1 | **JSON formátování** | nikam | nikdo navíc | Mění jen vzhled hodnoty, kterou seznam už má. SPFx Field Customizer by byl kód na údržbu bez přidané hodnoty. |
| 2 | **SPFx web part** | SharePoint v tenantu | admin tenantu (App Catalog) | Konfigurovatelný rozcestník s vlastním UI a lokalizací. Standardní web part *Quick links* by pokryl část — tady je důvodem nosná linka kurzu, v praxi nejdřív zkusit Quick links. |
| 3 | **SPFx web part** | Microsoft Graph v tenantu | admin tenantu (App Catalog + **API oprávnění**) | Graph `users` s vyhledáváním a fotkou. Vyžaduje schválené oprávnění — středa. |
| 4 | **Power Automate** | SharePoint + Exchange v tenantu | vlastník toku | Automatizace na událost seznamu. SPFx nemá backend a nic „na pozadí" nespustí. |
| 5 | **SPFx extension** (Application Customizer) | SharePoint v tenantu | admin tenantu (App Catalog) | Chování na **každé** stránce — jediná podporovaná cesta je placeholder, ne úprava DOM. |
| 6 | **Deklarativní agent** (SharePoint agent nad knihovnou směrnic) | Microsoft 365 v tenantu | vlastník obsahu / admin podle politiky agentů | Odpověď nad dokumenty; kód by tu nic nepřidal. |
| 7 | **SPFx extension** (ListView Command Set) **+ externí API** | **mimo tenant** — skladový systém dodavatele | admin tenantu (App Catalog + API oprávnění) **+ zákazník** | Akce v seznamu je SPFx; volání externího systému je rozhodnutí o toku dat ven, které musí zákazník znát a schválit. V kurzu stavíme jen zápis do seznamu, externí volání ne. |

## Na co se v diskuzi zaměřit

- **Řádek 2 je schválně sporný.** Kurz rozcestník staví, protože se na něm dobře učí property
  pane a lokalizace. V praxi je správná první otázka: „Proč nestačí Quick links?"
- **Řádek 4 je nejčastější chyba.** SPFx běží jen když má uživatel otevřenou stránku. Nic,
  co se má stát „když se něco změní", do SPFx nepatří.
- **Řádek 7** je první místo týdne, kde data opouštějí tenant. Vrátí se v pátek
  v `diagnostics-hardening` u telemetrie.
