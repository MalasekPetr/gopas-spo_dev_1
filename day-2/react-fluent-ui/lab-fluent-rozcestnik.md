# Lab · Rozcestník s Fluent UI, hooks a motivem sekce

> Modul: `react-fluent-ui` · Odhad: 80 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Rozcestník jako funkční komponenta s hledáním, komponentami Fluent UI a barvami podle sekce
stránky — a změřený rozdíl ve velikosti balíčku před a po.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

## Předpoklady

- Hotové laby [`../property-pane/`](../property-pane/) a [`../localization/`](../localization/).

## Kroky

### 1. Změř velikost balíčku před změnou

```powershell
npm run build
Get-ChildItem .\release\assets\portal-web-part_*.js | Select-Object Name, Length
```

**Checkpoint:** máš zapsané číslo `Length` (referenční řešení: 11 693 B).

### 2. Přidej vlastní hook

`src/hooks/useFilteredLinks.ts`:

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

`src/hooks/index.ts`:

```typescript
export { useFilteredLinks } from './useFilteredLinks';
```

**Checkpoint:** hook nesahá na SPFx ani na Fluent UI — jen React a model.

### 3. Doplň texty

Do `mystrings.d.ts` přidej 5 klíčů:

```typescript
ShowSearchFieldLabel: string;
SearchPlaceholder: string;
NoLinks: string;
LinksListLabel: string;
OpensInNewTab: string;
```

Do `en-us.js`:

```javascript
"ShowSearchFieldLabel": "Show link search",
"SearchPlaceholder": "Search links",
"NoLinks": "No links match.",
"LinksListLabel": "Company links",
"OpensInNewTab": "opens in a new tab",
```

`cs-cz.js` je má od dopoledne.

**Checkpoint:** kontrolní příkaz z labu lokalizace (krok 2) nevypíše nic pro `cs-cz.js`
a po záměně názvu souboru ani pro `en-us.js`. Klíčů je 31.

### 4. Přepiš komponentu na funkční

`src/webparts/portal/components/IPortalProps.ts`:

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

`src/webparts/portal/components/Portal.tsx`:

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

Nahraď `Portal.module.scss` souborem ze
[`solution/vltava-portal/src/webparts/portal/components/Portal.module.scss`](solution/vltava-portal/src/webparts/portal/components/Portal.module.scss)
— barvy odkazů už řeší Fluent UI podle motivu, CSS proměnné z pondělí nejsou potřeba.

**Checkpoint:** v komponentě není `this`, `escape` ani `this.context`.

### 5. Předej komponentě motiv a přepínač hledání

V `PortalWebPart.ts`:

1. Do `IPortalWebPartProps` přidej `showSearch: boolean;`.
2. Do třídy přidej pole `private _theme: IReadonlyTheme | undefined;`.
3. V `onThemeChanged` hned za `if (!currentTheme) { return; }` přidej
   `this._theme = currentTheme;`.
4. V `render()` přidej do props `showSearch: this.properties.showSearch,` a
   `theme: this._theme`.
5. Do skupiny `DisplayGroupName` přidej před `showEnvironment`:

   ```typescript
   PropertyPaneToggle('showSearch', {
     label: strings.ShowSearchFieldLabel
   }),
   ```

V manifestu přidej do `properties` řádek `"showSearch": true,`.

**Checkpoint:** `npm start -- --nobrowser` zkompiluje bez chyb. Rozcestník má pole hledání
a odkazy s ikonou.

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
- **Barvy se se sekcí nemění** — chybí `this._theme = currentTheme` (krok 5.3), nebo
  `supportsThemeVariants` v manifestu není `true`.
- **Ikony jsou prázdné čtverečky** — ve workbenchi i na stránce SharePoint ikony Fluent UI
  registruje; čtverečky se objeví mimo SharePoint (např. v unit testu), na stránce to hlásit
  lektorovi.
- **Při časové tísni:** kroky 7 a 8 jako demo lektora. Stav dne převzít ze
  [`solution/vltava-portal/`](solution/vltava-portal/).

## Zdroje (Microsoft)

- [Using Fluent UI in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/fluent-ui-integration)
- [Supporting section backgrounds](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/supporting-section-backgrounds)
