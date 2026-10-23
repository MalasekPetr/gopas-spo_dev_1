# Lab · Typy ve vlastním projektu (samostudium)

> Modul: `opt-typescript` · Odhad: 25 min · Režim: samostudium, jen lokálně
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Pět krátkých pokusů nad vlastním projektem `vltava-portal-<ini>`, po kterých umíš přečíst
chybu překladače a víš, co znamená `target` a `lib`.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Každou změnu na
konci kroku **vrať** (`git checkout -- <soubor>` nebo ručně) — lab řešení nemění.

## Startovní čára

Projekt po bloku [`project-anatomy`](../project-anatomy/) nebo pozdější, s `node_modules`.
V kořeni projektu:

```powershell
npx tsc --noEmit -p tsconfig.json
```

**Checkpoint:** příkaz skončí bez výpisu (žádná chyba typu).

## Kroky

### 1. Přečti skutečnou konfiguraci

```powershell
Get-Content .\tsconfig.json
Get-Content .\node_modules\@microsoft\spfx-web-build-rig\profiles\default\tsconfig-base.json
```

**Checkpoint:** umíš říct hodnotu `target`, `module` a prvky `lib`.

### 2. Vyvolej chybu `lib`

Do `src/webparts/portal/PortalWebPart.ts` (na konec souboru) dočasně přidej:

```typescript
export const probe: boolean = ['a', 'b'].includes('a');
```

a spusť znovu `npx tsc --noEmit -p tsconfig.json`.

**Checkpoint:** chyba `TS2550 ... Try changing the 'lib' compiler option to 'es2016' or later`.
Přepiš na `['a', 'b'].indexOf('a') >= 0` — chyba zmizí. Řádek smaž.

### 3. Syntaxe projde, API ne

Totéž s řádkem:

```typescript
export const probe: string = ({} as { x?: { y?: string } }).x?.y ?? 'none';
```

**Checkpoint:** žádná chyba. `?.` a `??` jsou syntaxe — překladač je přepíše pro `target es5`.
Řádek smaž.

### 4. Podívej se, co z kódu udělal překladač

```powershell
npm run build
Get-Content .\lib\webparts\portal\PortalWebPart.js -TotalCount 15
```

**Checkpoint:** ve výstupu jsou `var` a import z `tslib` (`__extends`), žádné `class` ani
`const`. To je `target: es5`.

### 5. Union typ chytí překlep

V komponentě nebo modelu, který používá union (Rozcestník po dni 2 nemá — použij dočasný řádek):

```typescript
type Level = 'info' | 'warning';
export const probeLevel: Level = 'warnign';
```

**Checkpoint:** chyba `TS2322: Type '"warnign"' is not assignable to type 'Level'`. Řádky smaž.

## Ověření

- [ ] Umíš vysvětlit rozdíl `target` vs. `lib` na příkladu z kroků 2 a 3.
- [ ] **Negativní:** `git status` na konci ukazuje projekt beze změn v `src/`.

## Fallback

- **`npx tsc` není nalezen:** v projektu chybí `node_modules` — nejdřív `npm install`.
- **Chyba v kroku 2 se neobjeví:** projekt už obsahuje test s `/// <reference types="node" />`
  (den 5) — ten přidá `lib es2020`. Vysvětlení v
  [`explainer-tsconfig-ecmascript.md`](explainer-tsconfig-ecmascript.md#past-typesnode-tiše-rozšíří-lib).

## Zdroje

- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
