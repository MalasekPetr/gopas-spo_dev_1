# Lab · Adresář zaměstnanců nad Microsoft Graph

> Modul: `data-access-clients` · Odhad: 50 min · Režim: hands-on, vlastní web
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Druhý web part řešení — Adresář zaměstnanců s vyhledáváním přes Microsoft Graph — a změřené,
co z adresáře uvidí **před** schválením oprávnění.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`../bundle-baseline/solution/vltava-portal/`](../bundle-baseline/solution/vltava-portal/)
(stav na konci dne).

## Předpoklady

- Řešení `vltava-portal-<ini>` ve stavu po dni 2.
- Server zastavený.

## Kroky

### 1. Přidej do řešení nový web part

V kořeni projektu:

```powershell
yo @microsoft/sharepoint `
    --component-type webpart `
    --component-name EmployeeDirectory `
    --framework react `
    --skip-install `
    --no-insight
```

**Checkpoint:** `config/config.json` má nový bundle `employee-directory-web-part` a existuje
složka `src/webparts/employeeDirectory`. Generátor **nezměnil** `package-solution.json`
(stejné `solution.id`).

### 2. Doinstaluj typy Microsoft Graph

```powershell
npm install @microsoft/microsoft-graph-types@2.43.1 --save-dev --save-exact
```

**Checkpoint:** balíček je v `devDependencies` — typy nejsou kód, do balíčku se nedostanou.

### 3. Přidej model, službu a hooky

Ze [solution](../bundle-baseline/solution/vltava-portal/src/) zkopíruj:

| Soubor | Co v něm hledat |
|---|---|
| `src/models/IEmployee.ts` | jen pole, která Adresář zobrazuje |
| `src/services/employeeService.ts` | `.header('ConsistencyLevel', 'eventual')`, `.select(...)`, `.search(...)` |
| `src/hooks/useDebounce.ts` | převzato z learn-spfx-growth |
| `src/hooks/useEmployees.ts` | `cancelled` — zahazuje odpovědi starších hledání |

Do `src/models/index.ts` přidej řádek:

```typescript
export type { IEmployee, PresenceMap } from './IEmployee';
```

Do `src/hooks/index.ts` přidej:

```typescript
export { useDebounce } from './useDebounce';
export { useEmployees } from './useEmployees';
export type { IUseEmployeesResult } from './useEmployees';
```

**Checkpoint:** v `employeeService.ts` není žádný import z `@fluentui/react` ani z
`@microsoft/sp-webpart-base` — služba nezná UI ani web part.

### 4. Napiš web part

Ze solution zkopíruj **obsah** těchto souborů ve `src/webparts/employeeDirectory/`
(manifest **nepřepisuj** — nese ID tvé komponenty):

- `EmployeeDirectoryWebPart.ts`
- `components/EmployeeDirectory.tsx`, `components/IEmployeeDirectoryProps.ts`,
  `components/EmployeeDirectory.module.scss`
- `loc/mystrings.d.ts`, `loc/en-us.js`, `loc/cs-cz.js` (nový soubor)

V manifestu změň jen `preconfiguredEntries[0]`:

```json
"title": { "default": "Vltava Employee Directory (<ini>)", "cs-CZ": "Adresar zamestnancu Vltava (<ini>)" },
"description": { "default": "Search colleagues in Microsoft 365" },
"officeFabricIconFontName": "People",
"properties": { "showPresence": true }
```

(v souboru s diakritikou: *Adresář zaměstnanců*).

**Checkpoint:** `npm start -- --nobrowser` zkompiluje bez chyb.

### 5. Změř, co Adresář vidí bez schválení

Workbench vlastního webu + query string → web part **Vltava Employee Directory (<ini>)**.
Vyplň tabulku a nahlas ji lektorovi:

| Otázka | Výsledek |
|---|---|
| Zobrazí se seznam zaměstnanců? (ano / chyba + kód) | |
| Je u lidí vidět oddělení a telefon? | |
| Zobrazí se hláška o nedostupné dostupnosti (presence)? | |

**Checkpoint:** tabulka vyplněná. Žádná odpověď není „špatná" — je to měření výchozího stavu
tenantu, se kterým pracuje blok `permissions-consent`.

### 6. Ověř debounce

F12 → **Network**, filtr `users`. Napiš do hledání rychle `jan` a počkej.

**Checkpoint (negativní):** po dopsání odešel **jeden** požadavek na `/users`, ne tři (jeden
na každé písmeno).

### 7. Porovnej dvě cesty k datům

Ve stejném panelu Network najdi:

1. požadavek na `graph.microsoft.com/v1.0/users` — záložka *Headers*,
2. požadavek na `/_api/web/lists` z property pane Rozcestníku (otevři jeho property pane).

**Checkpoint:** požadavek na Graph má hlavičku `Authorization: Bearer …` a `ConsistencyLevel:
eventual`; požadavek na `/_api/…` žádný `Authorization` nemá — jede na relaci SharePointu.

## Ověření

- [ ] Řešení má web part Adresář zaměstnanců se stejným `solution.id` jako ráno.
- [ ] Hledání volá Graph s `$select`, `$search` a `ConsistencyLevel`.
- [ ] Tabulka výchozího stavu oprávnění je vyplněná a předaná lektorovi.
- [ ] **Negativní:** psaní v hledání nevyvolá požadavek na každý znak.
- [ ] **Negativní:** komponenta `EmployeeDirectory.tsx` neobsahuje `this.context` ani
      `msGraphClientFactory`.

## Fallback

- **`Request_UnsupportedQuery` / 400** — chybí hlavička `ConsistencyLevel` nebo `$count`.
- **403 u `/users`** — tenant nedává Graph bez schválení; to je výsledek měření, ne chyba.
  Zapsat do tabulky a pokračovat — blok `permissions-consent` to vyřeší.
- **Prázdný seznam bez chyby** — na tenantu nejsou uživatelé s vyplněným jménem, které hledáš;
  zkus prázdné hledání.
- **Při časové tísni:** krok 7 jako demo lektora.

## Zdroje (Microsoft)

- [Use the MSGraphClientV3 to connect to Microsoft Graph](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-msgraph)
- [List users (Microsoft Graph)](https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0)
