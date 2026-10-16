# Výkon II — code splitting, lazy loading, cache

> Typ: povinný · Den: 4 · Odhad: 90 min
> Tenant: `cloudedu.cz` · Režim: hands-on, vlastní web
> Prostředí: [`../../environment.md`](../../environment.md) · Názvosloví: [`../../GLOSSARY.md`](../../GLOSSARY.md)

Středa skončila otázkou: proč Rozcestník platí za PnPjs, které nepoužívá? Dnes se to opraví —
a změří se i dvě rady z internetu, které tak samozřejmé nejsou.

## Cíle

- Opravit import, který táhne do balíčku nepoužitou knihovnu, a změřit úsporu.
- Vyzkoušet lazy loading (`React.lazy` + `import()`) a **rozhodnout podle čísel**, jestli ho
  ponechat.
- Zavést cache výsledků Graphu a zvolit úložiště podle toho, kde smí data zůstat.

## Výklad

### Oprava, která funguje: přímý import

```typescript
// before: the barrel also exports useEquipment -> equipmentService -> @pnp/sp side effects
import { useFilteredLinks } from '../../../hooks';
// after
import { useFilteredLinks } from '../../../hooks/useFilteredLinks';
```

> [!IMPORTANT] Jeden řádek importu ušetřil 32 KB — změřeno (2026-10-16)
> Rozcestník: středa 238 632 B → čtvrtek **206 519 B** (gzip 73 108 → 62 958 B). Kód
> komponenty se nezměnil, jen cesta importu. Data: [`mereni-den-4.md`](mereni-den-4.md).
>
> **Barrel soubory používej pro typy a čisté funkce, ne pro moduly s vedlejšími efekty.**

### Lazy loading: dvě rady, které změřením neprošly

`React.lazy(() => import(/* webpackChunkName: '...' */ './X'))` vyčlení komponentu do
samostatného souboru, který se stáhne až při prvním vykreslení. Zní to jako jistá výhra.

> [!IMPORTANT] Lazy loading v obou zkoušených místech zvětšil celkový balíček — změřeno (2026-10-16)
>
> | Experiment | Výsledek |
> |---|---|
> | Panel „Přidat vybavení" (otevírá se jen na klik) jako lazy chunk | hlavní bundle **+9 892 B**, chunk 16 831 B — Panel sdílí jádro Fluent UI s tabulkou, není co oddělit |
> | Celá komponenta Evidence jako lazy chunk | počáteční bundle 50 872 B místo 454 270 B, ale celkem **+33 986 B** — a UI se stejně stáhne hned |
>
> **Lazy loading pomáhá jen u velkého kódu s vlastními závislostmi, který většina návštěv
> nepotřebuje. U web partu, který se hned vykreslí, jen přidá režii.**

Oba experimenty jsou v řešení **vrácené** — rozhodlo číslo, ne doporučení.

### Cache: kam s daty tenantu

Adresář hledá v Graphu při každém dopsání hledaného textu. Stejné hledání během 5 minut teď
obslouží cache (`src/utils/sessionCache.ts`): nejdřív paměť, pak `sessionStorage`, teprve
pak Graph. Dostupnost (presence) se necachuje — mění se každou minutu.

| Úložiště | Vydrží | Data zaměstnanců po zavření karty | V řešení |
|---|---|---|---|
| paměť (`Map`) | do obnovení stránky | zmizí | ano (1. úroveň) |
| `sessionStorage` | do zavření karty | zmizí | ano (2. úroveň) |
| `localStorage` | navždy | **zůstanou na zařízení** | ne |
| IndexedDB (např. Dexie v learn-spfx-growth 3-Plant) | navždy, velké objemy | **zůstanou na zařízení** | ne |
| PnPjs `Caching` behavior | podle nastavení (`session` / `local`) | podle úložiště | alternativa pro SharePoint data |

Volba úložiště je rozhodnutí o **datech tenantu na zařízení uživatele**, ne jen o výkonu.
Adresář zaměstnanců s telefony v `localStorage` sdíleného počítače je únik dat.

Zdroj PnPjs: [Caching behavior](https://pnp.github.io/pnpjs/queryable/behaviors/#caching).

## Klíčové rozlišení

- **Velikost počátečního bundlu vs. celková velikost** — lazy loading mění první, často
  zhorší druhou.
- **Cache výkonu vs. uložení dat** — `sessionStorage` vs. `localStorage` je rozhodnutí o tom,
  co zůstane na zařízení.
- **Rada vs. měření** — obojí z tohoto bloku se dá najít jako „best practice"; jedno platí,
  dvě ne.

## Naše prostředí

Měření lokálně (build), ověření cache na workbenchi vlastního webu (Network v F12).

## Lab

Viz [`lab-optimalizace-a-cache.md`](lab-optimalizace-a-cache.md).

## Nosná linka

Řešení má **změřenou deltu proti středě**: Rozcestník −32 113 B, ostatní web party +0,5 až
+1,6 KB za nové funkce. Adresář opakované hledání neposílá do Graphu. Tuhle deltu student
v pátek obhajuje.

## Zdroje (Microsoft)

- [Customize webpack with the Heft Webpack Patch plugin](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/customize-heft-toolchain-customize-webpack-config)
- [Debug SharePoint Framework solutions on modern pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)

## Zdroje (třetí strana — React, PnPjs)

> [!IMPORTANT] Proč odkaz mimo Learn
> `React.lazy` a cache PnPjs dokumentují jejich projekty.

- [React — lazy](https://react.dev/reference/react/lazy)
- [PnPjs — Caching behavior](https://pnp.github.io/pnpjs/queryable/behaviors/#caching)

## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k 2026-10.
> Čísla platí pro SPFx 1.23.2 a `@fluentui/react` 8.x. Se SPFx 1.24 (React 18) a jiným
> rozdělením chunků ve webpacku experimenty zopakovat.
