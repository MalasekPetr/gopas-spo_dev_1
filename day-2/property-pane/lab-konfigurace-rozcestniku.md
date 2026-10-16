# Lab · Konfigurovatelný Rozcestník

> Modul: `property-pane` · Odhad: 60 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Rozcestník, jehož nadpis, odkazy a knihovnu dokumentů nastaví editor v nereaktivním property
pane s validací — bez jediné změny kódu.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Celé soubory pro
kontrolu jsou v [`solution/vltava-portal/`](solution/vltava-portal/).

## Předpoklady

- Projekt `vltava-portal-<ini>` ve stavu po dni 1 (`../../day-1/first-webpart/`).
- Server zastavený (**Ctrl+C**) — měníme rozhraní vlastností i manifest.

## Kroky

### 1. Doinstaluj HTTP klienta SPFx

```powershell
npm install @microsoft/sp-http@1.23.2 --save-exact
```

**Checkpoint:** v `package.json` je v `dependencies` řádek `"@microsoft/sp-http": "1.23.2"`
— přesná verze, bez `^`.

### 2. Vytvoř sdílený model odkazu

Nové složky jsou **v `src/`, ne ve složce web partu** — ve středu je budou používat i další
web party.

`src/models/IPortalLink.ts`:

```typescript
export interface IPortalLink {
  title: string;
  url: string;
}
```

`src/models/index.ts`:

```typescript
export type { IPortalLink } from './IPortalLink';
```

**Checkpoint:** obě složky existují, `src/models/index.ts` exportuje `IPortalLink`.

### 3. Vytvoř parser a validátor odkazů

Zkopíruj [`solution/vltava-portal/src/utils/links.ts`](solution/vltava-portal/src/utils/links.ts)
do `src/utils/links.ts` a vytvoř `src/utils/index.ts`:

```typescript
export { parseLinks, validateLinks } from './links';
export type { ILinkError, LinkErrorReason } from './links';
```

Přečti si `links.ts`: `validateLinks` vrací **první** chybný řádek a důvod (`format` / `url`),
`parseLinks` neplatné řádky tiše přeskočí. Texty chyb v něm nejsou — lokalizuje je web part.

**Checkpoint:** umíš říct, co vrátí `validateLinks('HR|https://a.cz\nServis http://b.cz')` —
`{ line: 2, reason: 'format' }` (chybí `|`).

### 4. Nahraď texty web partu

Nahraď celý obsah `src/webparts/portal/loc/mystrings.d.ts` a `src/webparts/portal/loc/en-us.js`
soubory ze [`solution/vltava-portal/src/webparts/portal/loc/`](solution/vltava-portal/src/webparts/portal/loc/).
Klíče `DescriptionFieldLabel` a `BasicGroupName` zmizí, přibude 15 nových.

**Checkpoint:** oba soubory mají **stejnou sadu klíčů** — spočítej je:

```powershell
(Select-String -Path .\src\webparts\portal\loc\mystrings.d.ts -Pattern '^\s+\w+: string;').Count
(Select-String -Path .\src\webparts\portal\loc\en-us.js -Pattern '^\s+"\w+":').Count
```

Obě čísla jsou **26**.

### 5. Změň výchozí vlastnosti v manifestu

V `src/webparts/portal/PortalWebPart.manifest.json` nahraď blok `properties`:

```json
"properties": {
  "title": "",
  "links": "HR portal|https://www.example.com/hr\nService desk|https://www.example.com/servicedesk\nCanteen menu|https://www.example.com/canteen",
  "libraryUrl": "",
  "showEnvironment": false
}
```

**Checkpoint:** vlastnost `description` v manifestu už není.

### 6. Přepiš třídu web partu

Nahraď obsah `src/webparts/portal/PortalWebPart.ts` souborem ze
[`solution/vltava-portal/src/webparts/portal/PortalWebPart.ts`](solution/vltava-portal/src/webparts/portal/PortalWebPart.ts)
a projdi si v něm tyto části (k nim se vrátíme při kontrole):

| Část | Co dělá |
|---|---|
| `IPortalWebPartProps` | 4 vlastnosti místo `description` |
| `render()` | prázdný `title` → výchozí nadpis; `links` přes `parseLinks`; relativní URL knihovny → absolutní |
| `disableReactivePropertyChanges` | `true` = nereaktivní režim |
| `onPropertyPaneConfigurationStart()` | načte knihovny při **prvním** otevření property pane |
| `_loadLibraries()` | `SPHttpClient` → `/_api/web/lists`, filtr `BaseTemplate eq 101` (knihovna dokumentů) |
| `_validateTitle()`, `_validateLinks()` | `onGetErrorMessage` — prázdný řetězec = platné |
| `getPropertyPaneConfiguration()` | 3 skupiny polí, `showLoadingIndicator` během načítání |

**Checkpoint:** soubor se uloží bez červeného podtržení v editoru kromě `Portal` — komponenta
ještě čeká stará data (krok 7).

### 7. Uprav komponentu

Nahraď obsah `src/webparts/portal/components/IPortalProps.ts` a `Portal.tsx` soubory ze
[`solution/vltava-portal/src/webparts/portal/components/`](solution/vltava-portal/src/webparts/portal/components/).
Komponenta je pořád třídní — funkční bude odpoledne.

```powershell
npm start -- --nobrowser
```

**Checkpoint:** kompilace bez chyb; po vložení web partu do workbenche (nebo na testovací
stránku s debug parametry) se Rozcestník zobrazí s nadpisem *Vltava Servis portal* a třemi
odkazy.

### 8. Ověř validaci

Otevři property pane (tužka) a do pole **Links** přidej řádky:

```text
Intranet https://www.example.com/intranet
Wiki|http://www.example.com/wiki
```

**Checkpoint:** pod polem je chyba `Line 4: use the format Title|https://address.` Po opravě
4. řádku (doplň `|`) se chyba změní na `Line 5: the address must start with https://.`

**Checkpoint (negativní):** dokud chyba trvá, je tlačítko **Apply** neaktivní a web part
ukazuje původní tři odkazy.

Oprav 5. řádek na `https://` a klikni **Apply**.

**Checkpoint:** Rozcestník ukazuje 5 odkazů.

### 9. Ověř nereaktivní režim

Do pole **Title** napiš `Rozcestník IT` — **neklikej** Apply.

**Checkpoint:** nadpis web partu se **nezmění**, dokud neklikneš **Apply**. Text delší než
60 znaků vyvolá chybu *The title can have at most 60 characters.*

### 10. Vyber knihovnu dokumentů

Zavři property pane a otevři ho znovu. Při prvním otevření po načtení stránky proběhne krátké
načítání; pak v dropdownu **Document library** vyber **Documents** a **Apply**.

**Checkpoint:** Rozcestník má poslední odkaz *Department documents* a vede na
`https://<tenant>.sharepoint.com/sites/spodev-<ini>/Shared%20Documents` (adresa knihovny
podle jazyka webu se může lišit).

### 11. Porovnej s reaktivním režimem

Dočasně změň v `PortalWebPart.ts` návratovou hodnotu `disableReactivePropertyChanges` na
`false`, ulož, obnov stránku a piš do pole **Links** nový řádek po znacích.

**Checkpoint:** web part se překresluje po každém znaku a rozepsaný (zatím neplatný) řádek se
neobjeví — `parseLinks` ho přeskočí. Vrať hodnotu na `true`.

## Ověření

- [ ] Nadpis, odkazy, knihovna a přepínač prostředí se nastavují v property pane.
- [ ] Neplatný řádek odkazů zobrazí lokalizovanou chybu s číslem řádku.
- [ ] Knihovny se načítají z webu, odkaz na knihovnu je absolutní adresa tvého webu.
- [ ] `mystrings.d.ts` a `en-us.js` mají stejný počet klíčů (26).
- [ ] **Negativní:** s neplatnou hodnotou je Apply neaktivní a web part drží poslední platný
      stav.

## Fallback

- **Dropdown knihoven zůstane prázdný a pod ním je *Document libraries could not be
  loaded.*** — volání REST selhalo. V nástrojích prohlížeče (F12 → Network) najít požadavek
  `_api/web/lists` a jeho stavový kód. Ve workbenchi i na stránce běží jako ty; 403 znamená,
  že nejsi na správném webu.
- **`Cannot find module '@microsoft/sp-http'`** — krok 1 neproběhl nebo běží starý server.
- **Nadpis je prázdný** — chybí klíč `PortalTitle` v `en-us.js` (krok 4). Prázdná vlastnost
  `title` se nahrazuje výchozím lokalizovaným nadpisem.
- **Při časové tísni:** kroky 9 a 11 vynechat. Celý stav převzít ze
  [`solution/vltava-portal/`](solution/vltava-portal/) podle
  [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md).

## Zdroje (Microsoft)

- [Make your web part configurable](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/integrate-with-property-pane)
- [Validate web part property values](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/validate-web-part-property-values)
- [Use cascading dropdowns in web part properties](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/use-cascading-dropdowns-in-web-part-properties)
