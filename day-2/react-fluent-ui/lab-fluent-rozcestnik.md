# Lab · Rozcestník s Fluent UI, hooks a motivem sekce

> Modul: `react-fluent-ui` · Odhad: 80 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Rozcestník jako funkční komponenta s hledáním, komponentami Fluent UI a barvami podle sekce
stránky — a změřený rozdíl ve velikosti balíčku před a po.

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- Vlastní web `spodev-<ini>` a testovací stránka s debug parametry (den 1).
- `@fluentui/react` v8 je v `package.json` od scaffoldu — nic se neinstaluje.

## Startovní čára

Lab začíná u stavu po modulu [`localization`](../localization/): referenční kód
[`../localization/solution/vltava-portal/`](../localization/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** `npm run build` projde; ve `src/webparts/portal/loc/` je `cs-cz.js`,
`Portal.tsx` je **třídní** komponenta (`class Portal extends React.Component`) a složka
`src/hooks` zatím **není**.

## Část A — výchozí měření (5 min)

### 1. Změř velikost balíčku před změnou

Bez čísla „před" nejde říct, kolik stojí Fluent UI. Měří se produkční build.

```powershell
npm run build
Get-ChildItem .\release\assets\portal-web-part_*.js | Select-Object Name, Length
```

**Checkpoint:** máš zapsané číslo `Length` (referenční řešení: 11 693 B).

## Část B — hook, texty a komponenta (45 min)

### 2. Přidej vlastní hook

Filtrování odkazů je logika bez UI — patří do hooku, který se dá testovat a znovu použít.
Složka `src/hooks/` stojí vedle `src/models/` a `src/utils/`: sdílí ji celé řešení.

Soubor `src/hooks/useFilteredLinks.ts` — **nový**:

```typescript
import * as React from 'react';
import type { IPortalLink } from '../models';

/** Filters links by title; the result is recomputed only when links or query change. */
export function useFilteredLinks(links: IPortalLink[], query: string): IPortalLink[] {
  return React.useMemo(() => {
    const needle: string = query.trim().toLocaleLowerCase();
    if (!needle) {
      return links;
    }
    return links.filter((link: IPortalLink) => link.title.toLocaleLowerCase().indexOf(needle) >= 0);
  }, [links, query]);
}
```

Soubor `src/hooks/index.ts` — **nový**:

```typescript
export { useFilteredLinks } from './useFilteredLinks';
```

- `useMemo` přepočítá výsledek jen při změně `links` nebo `query`, ne při každém renderu.
- `toLocaleLowerCase` — hledání `rozc` najde i *Rozcestník*.

**Checkpoint:** hook nesahá na SPFx ani na Fluent UI — jen React a model.

### 3. Doplň texty

Hledání a přístupnost potřebují 5 nových textů. `cs-cz.js` je má od dopoledne (lab
lokalizace), doplňuješ jen rozhraní a angličtinu.

Soubor `src/webparts/portal/loc/mystrings.d.ts` — **změna**: za řádek
`ShowEnvironmentFieldLabel: string;` přidej:

```typescript
  ShowSearchFieldLabel: string;
```

a za řádek `Greeting: string;` přidej:

```typescript
  SearchPlaceholder: string;
  NoLinks: string;
  LinksListLabel: string;
  OpensInNewTab: string;
```

Soubor `src/webparts/portal/loc/en-us.js` — **změna**: za řádek `"Greeting": "Hello",`
přidej:

```javascript
    "ShowSearchFieldLabel": "Show link search",
    "SearchPlaceholder": "Search links",
    "NoLinks": "No links match.",
    "LinksListLabel": "Company links",
    "OpensInNewTab": "opens in a new tab",
```

**Checkpoint:** kontrolní příkaz z labu lokalizace (krok 2) nevypíše nic pro `cs-cz.js`
a po záměně názvu souboru ani pro `en-us.js`. Klíčů je 31.

### 4. Přepiš komponentu na funkční

Komponenta dostane stav (text hledání), takže se mění na funkční s hooks. Místo HTML prvků
Fluent UI: `Text` (typografie podle motivu), `SearchBox`, `Link`, `Icon`. `ThemeProvider`
předá Fluent UI barvy sekce, ve které web part stojí.

Soubor `src/webparts/portal/components/IPortalProps.ts` — **změna**: nahraď celý obsah:

```typescript
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IPortalLink } from '../../../models';

export interface IPortalProps {
  title: string;
  links: IPortalLink[];
  libraryUrl: string;
  showSearch: boolean;
  environmentMessage: string;
  userDisplayName: string;
  theme: IReadonlyTheme | undefined;
}
```

Soubor `src/webparts/portal/components/Portal.tsx` — **změna**: nahraď celý obsah:

```tsx
import * as React from 'react';
import { getId, Icon, Link, SearchBox, Text, ThemeProvider, type PartialTheme } from '@fluentui/react';
import * as strings from 'PortalWebPartStrings';
import styles from './Portal.module.scss';
import type { IPortalProps } from './IPortalProps';
import type { IPortalLink } from '../../../models';
import { useFilteredLinks } from '../../../hooks';

export default function Portal(props: IPortalProps): JSX.Element {
  const { title, links, libraryUrl, showSearch, environmentMessage, userDisplayName, theme } = props;

  const [query, setQuery] = React.useState<string>('');
  // Stable id for aria-labelledby; React 17 has no useId.
  const [headingId] = React.useState<string>(() => getId('portalTitle'));

  const allLinks: IPortalLink[] = React.useMemo(
    () => (libraryUrl ? [...links, { title: strings.LibraryLinkTitle, url: libraryUrl }] : links),
    [links, libraryUrl]
  );
  const visibleLinks: IPortalLink[] = useFilteredLinks(allLinks, query);

  return (
    <ThemeProvider theme={theme as PartialTheme | undefined} className={styles.portal}>
      <section aria-labelledby={headingId}>
        <Text as="h2" variant="xLarge" id={headingId} block>{title}</Text>
        <Text as="p" block>{strings.Greeting}, {userDisplayName}!</Text>

        {showSearch && (
          <SearchBox
            className={styles.search}
            placeholder={strings.SearchPlaceholder}
            ariaLabel={strings.SearchPlaceholder}
            value={query}
            onChange={(_event, newValue) => setQuery(newValue || '')}
          />
        )}

        {visibleLinks.length === 0 ? (
          <Text as="p" block>{strings.NoLinks}</Text>
        ) : (
          <ul className={styles.links} aria-label={strings.LinksListLabel}>
            {visibleLinks.map((link: IPortalLink) => (
              <li key={link.url}>
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.title} (${strings.OpensInNewTab})`}
                >
                  <Icon iconName="Link" aria-hidden={true} className={styles.icon} />
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {environmentMessage && (
          <Text as="p" variant="small" block className={styles.environment}>{environmentMessage}</Text>
        )}
      </section>
    </ThemeProvider>
  );
}
```

- `escape()` zmizel — JSX text escapuje sám (krok 8 ukáže, co by udělal navíc).
- `getId` v `useState` s inicializační funkcí = id se vytvoří jednou a mezi rendery se nemění.
- `aria-label` odkazu oznámí čtečce, že se otevře nová karta; ikona je `aria-hidden`.

Soubor `src/webparts/portal/components/Portal.module.scss` — **změna**: nahraď celý obsah:

```scss
.portal {
  overflow: hidden;
  padding: 1em;
}

.search {
  margin: 8px 0;
  max-width: 320px;
}

.links {
  list-style: none;
  padding-left: 0;

  li {
    margin: 4px 0;
  }
}

.icon {
  margin-right: 6px;
  vertical-align: middle;
}

.environment {
  opacity: 0.7;
}
```

Barvy textu a odkazů už řeší Fluent UI podle motivu — CSS proměnné a tokeny `[theme:…]`
z pondělí nejsou potřeba; nepoužité třídy `.welcome` a `.welcomeImage` ze šablony mizí.

**Checkpoint:** v komponentě není `this`, `escape` ani `this.context`.

### 5. Předej komponentě motiv a přepínač hledání

Web part musí komponentě dodat dvě nové props: přepínač hledání (nová vlastnost web partu)
a motiv sekce, který SPFx hlásí v `onThemeChanged`.

Soubor `src/webparts/portal/PortalWebPart.ts` — **změna**:

1. V `IPortalWebPartProps` za řádek `libraryUrl: string;` přidej:

   ```typescript
     showSearch: boolean;
   ```

2. Za řádek `private _environmentMessage: string = '';` přidej:

   ```typescript
     private _theme: IReadonlyTheme | undefined;
   ```

3. V `render()` najdi

   ```typescript
           libraryUrl: this._toAbsoluteUrl(this.properties.libraryUrl),
           environmentMessage: this.properties.showEnvironment ? this._environmentMessage : '',
           userDisplayName: this.context.pageContext.user.displayName
   ```

   a nahraď:

   ```typescript
           libraryUrl: this._toAbsoluteUrl(this.properties.libraryUrl),
           showSearch: this.properties.showSearch,
           environmentMessage: this.properties.showEnvironment ? this._environmentMessage : '',
           userDisplayName: this.context.pageContext.user.displayName,
           theme: this._theme
   ```

4. V `onThemeChanged()` za blok `if (!currentTheme) { return; }` (a prázdný řádek za ním)
   přidej:

   ```typescript
       // Section background (theme variant) is passed to Fluent UI via ThemeProvider.
       this._theme = currentTheme;

   ```

5. V `getPropertyPaneConfiguration()` ve skupině `DisplayGroupName` přidej **před**
   `PropertyPaneToggle('showEnvironment', {`:

   ```typescript
                   PropertyPaneToggle('showSearch', {
                     label: strings.ShowSearchFieldLabel
                   }),
   ```

`onThemeChanged` volá SPFx při startu i při každé změně pozadí sekce a po něm `render()` —
nový motiv tak doteče do `ThemeProvider` bez další práce.

Soubor `src/webparts/portal/PortalWebPart.manifest.json` — **změna**: v `properties` za
řádek `"libraryUrl": "",` přidej:

```json
      "showSearch": true,
```

**Checkpoint:** `npm start -- --nobrowser` zkompiluje bez chyb. Rozcestník má pole hledání
a odkazy s ikonou.

## Část C — ověření (30 min)

### 6. Ověř hledání a klávesnici

1. Napiš do hledání `serv`.
2. Klávesou **Tab** projdi web part od pole hledání přes všechny odkazy.

**Checkpoint:** zůstane jen *Service desk*. Text `xyz` ukáže *No links match.* Každý prvek
má při fokusu viditelný rámeček; pořadí je hledání → odkazy shora dolů.

**Checkpoint:** nástroje prohlížeče (F12 → Elements) u odkazu ukážou
`aria-label="Service desk (opens in a new tab)"` a ikona má `aria-hidden="true"`.

### 7. Ověř motiv sekce

Na testovací stránce (debug parametry, koncept): **Edit** → upravit sekci s Rozcestníkem →
**Section background** → nejsilnější varianta.

**Checkpoint:** text i odkazy Rozcestníku změní barvu podle pozadí sekce a zůstanou čitelné.
Stránku **nepublikuj**.

### 8. Ověř, proč `escape()` do JSX nepatří

V property pane nastav nadpis `R&D` a **Apply**. Pak v `Portal.tsx` dočasně obal nadpis:
`{escape(title)}` (import `escape` z `@microsoft/sp-lodash-subset`).

**Checkpoint (negativní):** s `escape()` se nadpis zobrazí jako `R&amp;D`, bez něj `R&D`.
Změnu vrať.

### 9. Změř velikost balíčku po změně

```powershell
npm run build
Get-ChildItem .\release\assets\portal-web-part_*.js | Select-Object Name, Length
```

**Checkpoint:** číslo zapiš vedle čísla z kroku 1 a nahlas lektorovi (referenční řešení:
206 511 B, 17,7× víc).

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/) — stav na konci dne 2.
Proti Startovní čáře se změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/hooks/useFilteredLinks.ts`, `index.ts` | nové | filtr odkazů jako znovupoužitelný hook |
| `src/webparts/portal/loc/mystrings.d.ts` | změněný | +5 klíčů (31) |
| `src/webparts/portal/loc/en-us.js` | změněný | anglické texty pro hledání a přístupnost |
| `src/webparts/portal/components/IPortalProps.ts` | změněný | `showSearch`, `theme` |
| `src/webparts/portal/components/Portal.tsx` | změněný | funkční komponenta, Fluent UI, hledání, ARIA |
| `src/webparts/portal/components/Portal.module.scss` | změněný | barvy z motivu Fluent UI místo CSS proměnných |
| `src/webparts/portal/PortalWebPart.ts` | změněný | vlastnost `showSearch`, motiv sekce do komponenty, přepínač v property pane |
| `src/webparts/portal/PortalWebPart.manifest.json` | změněný | výchozí `"showSearch": true` |

`cs-cz.js` se nezměnil — nové klíče v něm jsou od labu lokalizace.

Tento stav je **Startovní čárou** dne 3 — modulu
[`data-access-clients`](../../day-3/data-access-clients/). Když ti něco nevyšlo, převezmi ho
podle [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] `Portal` je funkční komponenta; hook `useFilteredLinks` je v `src/hooks`.
- [ ] Hledání filtruje odkazy, prázdný výsledek má text.
- [ ] Web part jde projít klávesnicí; odkazy oznamují novou kartu.
- [ ] Barvy se řídí pozadím sekce.
- [ ] Velikost balíčku před a po je zapsaná.
- [ ] **Negativní:** `escape()` v JSX zobrazí `&amp;` — v komponentě není.

## Fallback

- **`Module '"@fluentui/react"' has no exported member ...`** — překlep v názvu importu;
  porovnat s kódem v kroku 4.
- **Barvy se se sekcí nemění** — chybí `this._theme = currentTheme` (krok 5.4), nebo
  `supportsThemeVariants` v manifestu není `true`.
- **Ikony jsou prázdné čtverečky** — ve workbenchi i na stránce SharePoint ikony Fluent UI
  registruje; čtverečky se objeví mimo SharePoint (např. v unit testu), na stránce to hlásit
  lektorovi.
- **Při časové tísni:** kroky 7 a 8 jako demo lektora. Stav dne převzít ze
  [`solution/vltava-portal/`](solution/vltava-portal/) podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution).

## Zdroje (Microsoft)

- [Using Fluent UI in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)
- [Supporting section backgrounds](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/supporting-section-backgrounds)
