# Řešení · Mapa projektu

Referenční odpovědi k [`lab-anatomie-projektu.md`](lab-anatomie-projektu.md), krok 3.
GUIDy má každý student jiné — v tabulce je jen místo, kde je najít.

| # | Otázka | Odpověď | Soubor |
|---|---|---|---|
| 1 | `id` řešení | GUID v `solution.id`; stejná hodnota je v `.yo-rc.json` jako `libraryId` | `config/package-solution.json` |
| 2 | `id` web partu | GUID v `id` | `src/webparts/portal/PortalWebPart.manifest.json` |
| 3 | název v toolboxu | `preconfiguredEntries[0].title.default` = `Portal (<ini>)` — generátor dá `Portal`, příponu doplní `Set-StudentIdentity.ps1` | `src/webparts/portal/PortalWebPart.manifest.json` |
| 4 | lokální server | skript `start` → `heft start --clean` | `package.json` |
| 5 | verze Node.js | `engines.node` = `>=22.14.0 < 23.0.0` | `package.json` |
| 6 | výsledný `.sppkg` | `paths.zippedPackage` = `solution/vltava-portal-<ini>.sppkg`, relativně ke složce `sharepoint/` | `config/package-solution.json` |
| 7 | adresa po `npm start` | `initialPage` = `https://{tenantDomain}/_layouts/workbench.aspx` | `config/serve.json` |
| 8 | lokalizační modul | `PortalWebPartStrings` — deklarace v `mystrings.d.ts`, mapování na soubory v `localizedResources` | `src/webparts/portal/loc/mystrings.d.ts`, `config/config.json` |

## Na co se v diskuzi zaměřit

- **Otázka 1 a 2** — proč dvě ID. Řešení se nasazuje, komponenta se vkládá na stránku.
  Ve středu, až všichni nasadí do jednoho tenantového App Catalogu, to bude rozdíl mezi
  fungujícím a cizím web partem.
- **Otázka 6** — cesta v `package-solution.json` je relativní ke složce `sharepoint/`, ne ke
  kořeni projektu. Častý zdroj „build prošel, ale kde je balíček".
- **Otázka 7** — `{tenantDomain}` je zástupný symbol, ne chyba. Dosadí ho `SPFX_SERVE_TENANT_DOMAIN`
  z `dev-environment`.
- **Otázka 8** — název modulu `PortalWebPartStrings` není cesta k souboru. Která `.js` se
  načte, rozhoduje `config/config.json` podle jazyka stránky — téma úterní lokalizace.
