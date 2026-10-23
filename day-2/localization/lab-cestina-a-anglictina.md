# Lab · Rozcestník česky i anglicky

> Modul: `localization` · Odhad: 30 min · Režim: hands-on, vlastní weby
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Rozcestník se na českém webu `spodev-<ini>-cs` zobrazí česky a na anglickém `spodev-<ini>`
anglicky, z jednoho buildu.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Vlastní web `spodev-<ini>` z dne 1; právo zakládat weby (studenti jsou Global Admin).

## Startovní čára

Lab začíná u stavu po modulu [`property-pane`](../property-pane/): referenční kód
[`../property-pane/solution/vltava-portal/`](../property-pane/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde; ve složce `src/webparts/portal/loc/` jsou jen
`en-us.js` a `mystrings.d.ts` (26 klíčů) a v manifestu web partu má `title` jediný jazyk:
`"default": "Vltava Portal (<ini>)"` — s tvými iniciálami.

## Část A — český web (5 min)

### 1. Založ český web

Jazyk stránky určuje jazyk **webu**, ne prohlížeče. Na ověření potřebuješ web v češtině vedle
anglického `spodev-<ini>`. Zřízení chvíli trvá — pusť ho hned.

**Create site** → **Communication site** → název `SPO DEV <ini> CS`, adresa
**`spodev-<ini>-cs`**, jazyk **Čeština**.

**Checkpoint:** `https://<tenant>.sharepoint.com/sites/spodev-<ini>-cs` má české menu (*Domů*,
*Upravit*).

## Část B — české texty a manifest (10 min)

### 2. Přidej české texty

SPFx hledá soubor `loc/<jazyk webu>.js` (malými písmeny); `cs-cz.js` je stejný slovník jako
`en-us.js`, jen s českými hodnotami. Českou diakritiku nepiš ručně — soubor převezmi.

Soubor `src/webparts/portal/loc/cs-cz.js` — **nový**: zkopíruj ho z
[`solution/vltava-portal/src/webparts/portal/loc/cs-cz.js`](solution/vltava-portal/src/webparts/portal/loc/cs-cz.js).

- Mapu jazyků v `config/config.json` (`localizedResources`) neměníš — vzor `loc/{locale}.js`
  ze šablony najde nový soubor sám.
- Soubor obsahuje **5 klíčů navíc** pro odpolední blok [`react-fluent-ui`](../react-fluent-ui/)
  (`ShowSearchFieldLabel`, `SearchPlaceholder`, `NoLinks`, `LinksListLabel`, `OpensInNewTab`).
  Neškodí — `mystrings.d.ts` je zatím nezná a odpoledne už `cs-cz.js` nemusíš otevírat.

**Checkpoint:** každý klíč z `mystrings.d.ts` je v `cs-cz.js`:

```powershell
$loc = '.\src\webparts\portal\loc'
$keys = Select-String -Path "$loc\mystrings.d.ts" -Pattern '^\s+(\w+): string;' |
    ForEach-Object { $_.Matches[0].Groups[1].Value }
$keys | Where-Object { -not (Select-String -Path "$loc\cs-cz.js" -Pattern "`"$_`":" -Quiet) }
```

Příkaz nevypíše **nic**.

### 3. Lokalizuj manifest

Název a popis web partu v toolboxu nejsou v `loc/*.js` — čte je SharePoint z manifestu.
Lokalizují se tam: každý řetězec v `preconfiguredEntries` je objekt `{ "default": …,
"<jazyk>": … }`.

Soubor `src/webparts/portal/PortalWebPart.manifest.json` — **změna**: v
`preconfiguredEntries[0]` najdi řádky (místo `<ini>` tam máš své iniciály)

```json
    "title": { "default": "Vltava Portal (<ini>)" },
    "description": { "default": "Welcome and company links for Vltava Servis" },
```

a nahraď je **oběma řádky `title` a `description`** z
[`solution/vltava-portal/src/webparts/portal/PortalWebPart.manifest.json`](solution/vltava-portal/src/webparts/portal/PortalWebPart.manifest.json).
Do každého objektu přibude klíč `"cs-CZ"` s českým textem (*Rozcestník Vltava*, *Uvítání
a firemní odkazy Vltava Servis*); manifest je UTF-8, diakritika v něm smí být.

Převzatý řádek `title` nemá tvé iniciály — `solution/` nese šablonové hodnoty kurzu. Doplní
je skript identity: přidá příponu `(<ini>)` ke **každému** jazyku titulku a ID nezmění (stejné
iniciály, stejný projekt = stejná ID).

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Set-StudentIdentity.ps1" -Initials <ini> -ProjectPath .
npm run build
```

**Checkpoint:** skript vypíše změnu `PortalWebPart.manifest.json (title suffix)` a v tabulce
ID je u každého řádku `Old` = `New`. Řádek `title` v manifestu má příponu `(<ini>)` u `default`
i u `cs-CZ`.

**Checkpoint:** `npm run build` projde a v `release\manifests\` je v manifestu web partu mapa
jazyků:

```powershell
Get-ChildItem .\release\manifests\*.json | ForEach-Object {
    (Get-Content $_.FullName -Raw | ConvertFrom-Json).loaderConfig.scriptResources.PortalWebPartStrings.paths
}
```

Výpis obsahuje `cs-CZ` i `en-US` (referenční řešení: `PortalWebPartStrings_cs-cz_….js`
a `PortalWebPartStrings_en-us_….js`).

## Část C — ověření v obou jazycích (15 min)

> [!WARNING] Hosted workbench končí 2026-12-01
> SPFx 1.23 je podle release notes **poslední verze s podporou** hosted workbenche: je
> deprecated od 2026-05-13 a 2026-12-01 se retiruje
> ([SPFx v1.23.0 release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-1.23.0#deprecations)).
> **Po tomto datu nebo v projektu na SPFx 1.24+** udělej kroky 4–6 na **české** testovací stránce
> (web `spodev-<ini>-cs`) s parametry `?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`
> (postup: [`first-webpart`, krok 9](../../day-1/first-webpart/lab-prvni-webpart.md#9-otestuj-na-skutečné-stránce)).

### 4. Ověř oba jazyky

```powershell
npm start -- --nobrowser
```

Otevři hosted workbench **českého** webu
`https://<tenant>.sharepoint.com/sites/spodev-<ini>-cs/_layouts/workbench.aspx` s query
stringem z terminálu a vlož Rozcestník.

**Checkpoint:** nadpis *Portál Vltava Servis*, pozdrav *Dobrý den*, v property pane skupiny
*Obsah*, *Dokumenty oddělení*, *Zobrazení*. Chybný řádek odkazů hlásí *Řádek N: …*.

**Checkpoint:** tentýž běžící server na **anglickém** webu `spodev-<ini>` zobrazí anglické texty.

### 5. Ověř lokalizovaný název v toolboxu

Na českém webu vytvoř stránku (koncept), připoj
`?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js`, otevři
toolbox.

**Checkpoint:** v toolboxu je **Rozcestník Vltava (<ini>)**. Ve workbenchi je i na českém webu
anglický název — workbench lokalizovaný manifest nepoužívá. (Pokud se český název neukáže ani
na stránce, zapiš to lektorovi — ověří se ve středu po nasazení.)

### 6. Najdi chybějící překlad dřív než uživatel

V `cs-cz.js` dočasně smaž řádek s klíčem `"Greeting"` a obnov workbench na českém webu.

**Checkpoint (negativní):** na českém webu pozdrav začíná čárkou — SPFx **nepoužil** anglický
text jako zálohu. Na anglickém webu je pozdrav v pořádku. Kontrola z kroku 2 vypíše
`Greeting`. Řádek vrať.

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/webparts/portal/loc/cs-cz.js` | nový | české texty všech 26 klíčů + 5 klíčů pro `react-fluent-ui` |
| `src/webparts/portal/PortalWebPart.manifest.json` | změněný | `cs-CZ` u `title` a `description` v toolboxu |

Kód web partu (`*.ts`, `*.tsx`) se nezměnil — lokalizace je jen data. (Ve vlastním projektu má
`title` navíc příponu `(<ini>)` u obou jazyků; `solution/` nese šablonové hodnoty kurzu.)

Tento stav je **Startovní čárou** modulu [`react-fluent-ui`](../react-fluent-ui/). Když ti
něco nevyšlo, převezmi ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] Web `spodev-<ini>-cs` v češtině existuje.
- [ ] Rozcestník je na českém webu česky, na anglickém anglicky, z jednoho běžícího serveru.
- [ ] Release manifest obsahuje `cs-CZ` a `en-US`.
- [ ] Titulek web partu má příponu `(<ini>)` v obou jazycích.
- [ ] **Negativní:** chybějící klíč v `cs-cz.js` se projeví jen na českém webu a kontrolní
      příkaz ho najde.

## Fallback

- **Na českém webu je všechno anglicky** — soubor se nejmenuje přesně `cs-cz.js` (malá písmena),
  nebo server běžel před jeho vytvořením (restart).
- **Build hlásí chybu JSON v manifestu** — chybějící čárka mezi `"default"` a `"cs-CZ"`.
- **Skript identity skončí *Project already belongs to …*** — spouštíš ho s jinými iniciálami,
  než má soubor `.student-identity` v projektu. Použij ty ze souboru.
- **V toolboxu je český název bez iniciál** — po úpravě manifestu neproběhl skript identity
  (krok 3); spusť ho znovu a restartuj server.
- **Při časové tísni:** krok 5 jako demo lektora. Krok 6 nevynechávat — je to jádro bloku.
  Kód převzít ze [`solution/vltava-portal/`](solution/vltava-portal/) podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).

## Zdroje (Microsoft)

- [Localize SharePoint Framework client-side web parts](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/localize-web-parts)
