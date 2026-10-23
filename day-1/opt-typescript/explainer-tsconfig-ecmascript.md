# tsconfig a ECMAScript v projektu SPFx 1.23.2

Studijní text k modulu [`opt-typescript`](README.md). Všechna čísla a výpisy jsou z
referenčního projektu `vltava-portal` (SPFx 1.23.2, TypeScript 5.8.3), měřeno **2026-10-23**
na stroji lektora `MALACH-PC04`.

## ECMAScript za dvě minuty

ECMAScript (ES) je standard jazyka JavaScript. Od roku 2015 vychází verze každý rok:

| Verze | Rok | Příklad toho, co přinesla | V kurzu |
|---|---|---|---|
| ES5 | 2009 | `Array.prototype.forEach`, `JSON` | výstup překladače (`target`) |
| ES2015 (ES6) | 2015 | `class`, `const`/`let`, `=>`, `Promise`, `Map`, moduly `import` | běžná syntaxe kódu |
| ES2016 | 2016 | `Array.prototype.includes` | **neprojde** bez úpravy (viz níže) |
| ES2017 | 2017 | `async`/`await`, `Object.entries`, `padStart` | `async` ano (syntaxe), `entries` ne (API) |
| ES2019 | 2019 | `Array.prototype.flat` | **neprojde** |
| ES2020 | 2020 | `?.`, `??` | syntaxe ano |

Rozlišujte dvě věci:

- **Syntaxe** — jak se kód píše (`class`, `=>`, `?.`, `async`). Překladač ji umí přepsat do
  starší podoby.
- **API** — co je v prohlížeči k dispozici (`includes`, `Object.entries`, `fetch`). Překladač
  ho **nepřepíše** — buď v prohlížeči je, nebo by musel být doplněn polyfillem.

## Kde konfigurace v projektu je

Projekt má vlastní `tsconfig.json` jen s odkazem na rig:

```json
{
  "extends": "./node_modules/@microsoft/spfx-web-build-rig/profiles/default/tsconfig-base.json"
}
```

Skutečná nastavení jsou v `tsconfig-base.json` rigu (výňatek, SPFx 1.23.2):

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react",
    "strict": true,
    "noImplicitAny": true,
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "importHelpers": true,
    "importsNotUsedAsValues": "remove",
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmitOnError": false,
    "types": ["jest", "webpack-env"],
    "lib": ["dom", "es5", "es2015.core", "es2015.collection", "es2015.iterable", "es2015.promise", "es2015.proxy"]
  }
}
```

Úpravu dělejte ve vlastním `tsconfig.json` (přepsáním konkrétní volby v `compilerOptions`),
nikdy v `node_modules` — ten se při `npm install` přepíše.

## Volby, na kterých záleží

| Volba | Hodnota | Co dělá | Co z toho plyne |
|---|---|---|---|
| `target` | `es5` | do jaké **syntaxe** se váš kód přeloží | v `lib/*.js` uvidíte `var`, funkce místo tříd, `__awaiter` místo `async` |
| `lib` | ES5 + části ES2015 + `dom` | jaká **API** smí kód použít, aby prošel překlad | `includes`, `Object.entries`, `padStart`, `flat` hlásí `TS2550` |
| `module` | `esnext` | v jakém tvaru zůstanou `import`/`export` | moduly zpracuje webpack — umožní vynechat nepoužitý kód a `import()` pro dělení bundlu |
| `moduleResolution` | `node` | jak se hledá `'@pnp/sp/items'` | podle `node_modules` a `package.json` balíčku |
| `jsx` | `react` | jak se překládá JSX | `<Panel>` → `React.createElement(Panel, ...)`; proto `import * as React` v každém `.tsx` |
| `strict` | `true` | soubor přísných kontrol (`strictNullChecks`, `noImplicitAny`, …) | hodnota, která může chybět, to musí mít v typu |
| `importHelpers` | `true` | pomocné funkce (`__extends`, `__awaiter`) bere z balíčku `tslib`, ne kopií do každého souboru | proto `tslib` v `dependencies` |
| `experimentalDecorators` | `true` | povolí dekorátory | kód kurzu je nepoužívá; zůstává kvůli starším vzorům SPFx |
| `noEmitOnError` | `false` | JavaScript se vygeneruje i při chybě typu | build přesto **selže** — Heft chyby typu hlásí jako chyby buildu |
| `types` | `jest`, `webpack-env` | jaké globální typy jsou vidět bez importu | `describe`/`it` v testech, `require.context` z webpacku |

### Důkaz: co udělá `target es5` s kódem kurzu

Začátek `lib/services/loanService.js` po `npm run build`:

```javascript
import { __awaiter, __extends, __generator } from "tslib";
import '@pnp/sp/webs';
// ...
export var LOANS_LIST_URL = 'Lists/EquipmentLoans';
var LOAN_FIELDS = [
```

`const` se stalo `var`, `async`/`await` se přepsalo na `__awaiter` + `__generator` z `tslib`.
`import` zůstal (to je `module: esnext`) — vyřeší ho webpack.

### Důkaz: co udělá `lib` s moderním API

Testovací soubor v referenčním projektu:

```typescript
export const a: boolean = [1, 2].includes(2);
export const b: [string, number][] = Object.entries({ x: 1 });
export const c: string = 'a'.padStart(3, '0');
export const d: number[] = [[1], [2]].flat();
export const e: string | undefined = ({} as { x?: { y?: string } }).x?.y ?? 'none';
export async function f(): Promise<number> { await Promise.resolve(); return 1; }
export const g: Map<string, number> = new Map();
export const h: boolean = 'abc'.startsWith('a');
```

Výsledek `npx tsc --noEmit -p tsconfig.json` **bez** `@types/node` v překladu:

```text
error TS2550: Property 'includes' does not exist on type 'number[]'. ... change the 'lib' compiler option to 'es2016' or later.
error TS2550: Property 'entries' does not exist on type 'ObjectConstructor'. ... 'es2017' or later.
error TS2550: Property 'padStart' does not exist on type '"a"'. ... 'es2017' or later.
error TS2550: Property 'flat' does not exist on type 'number[][]'. ... 'es2019' or later.
```

`?.`, `??`, `async`, `Map` a `startsWith` prošly — první tři jsou syntaxe (překladač je přepíše),
`Map` a `startsWith` jsou v `es2015.collection` a `es2015.core`.

Proto kód kurzu píše `link.title.indexOf(needle) >= 0` místo `includes(needle)`.

### Past: `@types/node` tiše rozšíří `lib`

Tentýž test **s** `src/loc.test.ts` z dne 5 (začíná `/// <reference types="node" />`) prošel
bez jediné chyby. `@types/node` obsahuje `/// <reference lib="es2020" />` a přidá tím ES2020 API
**celému** projektu, nejen testu. Výpis `--listFiles` pak obsahuje `lib.es2020.*.d.ts`.

Praktický dopad je malý — SharePoint Online podporuje jen moderní prohlížeče, ve kterých ES2020
API jsou. Ale stejný kód se **přeloží, nebo nepřeloží** podle toho, jestli v projektu je test
s typy Node.js. Kdo chce moderní API vědomě, přidá je do `lib` ve vlastním `tsconfig.json`:

```json
{
  "extends": "./node_modules/@microsoft/spfx-web-build-rig/profiles/default/tsconfig-base.json",
  "compilerOptions": {
    "lib": ["dom", "es2020"]
  }
}
```

(Neověřeno v kurzu na všech blocích — po změně vždy `npm run build`.)

## Výsledný bundle není ES5

`target` platí jen pro **váš** kód. Knihovny z `node_modules` se nepřekládají a jdou do bundlu
tak, jak je autor vydal. Počty výskytů v `release/assets/*.js` po `npm run build`:

| Bundle | `=>` | `class X` | `?.` |
|---|---:|---:|---:|
| `portal-web-part` (React z SharePointu, Fluent UI v8) | 7 | 0 | 0 |
| `equipment-desk-web-part` (PnPjs, Fluent UI v8) | 91 | 38 | 0 |
| zkušební web part s Fluent UI v9 | 131 | 0 | 16 |

Bundle s PnPjs obsahuje třídy ES2015, bundle s Fluent UI v9 obsahuje `?.` (ES2020). Prohlížeč
bez podpory ES2015+ by je nespustil. SharePoint Online takové prohlížeče nepodporuje
([self-study.md](../../self-study.md), runtime baseline) — proto „polyfill strategie" v kurzu
není.

## Shrnutí do praxe

- Nevidíte-li v editoru metodu, kterou znáte z MDN, a hlásí `TS2550`: je to `lib`, ne chyba
  kódu. Buď starší ekvivalent (`indexOf`), nebo vědomě rozšířit `lib`.
- Syntaxi (`?.`, `??`, `async`) používejte bez obav — překladač ji přepíše.
- `tsconfig.json` měňte jen ve vlastním projektu, nikdy v rigu v `node_modules`.
- Po změně konfigurace vždy celý `npm run build` — Heft spouští i lint a testy.

## Zdroje

- [TSConfig Reference — target](https://www.typescriptlang.org/tsconfig/#target),
  [lib](https://www.typescriptlang.org/tsconfig/#lib),
  [module](https://www.typescriptlang.org/tsconfig/#module)
- [Heft-based toolchain (SPFx v1.22.0+)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft)
- [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
