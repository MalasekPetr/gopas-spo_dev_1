# Lab · <Název labu>

> Modul: `<slug>` · Odhad: <min> min · Režim: hands-on | instruktorské demo | návrh (papír/MD)
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

<jedna věta: co konkrétního student na konci má — viditelný výsledek, ne „pochopí">

**Jak lab číst:** začni u **Startovní čáry** — ověř, že tvůj kód je tam, kde lab začíná.
Pak jdi po částech; každý krok říká, **který soubor** měníš, **co** do něj patří a **proč**,
a končí **Checkpointem** — nesedí-li, nepokračuj. Na konci je **Výstupní stav**: cílový kód,
se kterým se můžeš porovnat a který je startem dalšího modulu.

## Předpoklady

- <nástroj / role / co muselo vzniknout v předchozím bloku>

## Startovní čára

Lab začíná u stavu po modulu [`<předchozí-slug>`](<cesta>/): referenční kód
[`<cesta>/solution/vltava-portal/`](<cesta>/solution/vltava-portal/).

- Pokračuješ ve **vlastním** projektu `vltava-portal-<ini>` — ověř checkpoint níže.
- Nemáš ho, nebo je rozbitý: převezmi startovní kód podle
  [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
  (`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**).

**Checkpoint:** <ověřitelný stav startu — např. `npm run build` projde a v `src/webparts/`
jsou složky `portal` a `employeeDirectory`>

## Část A — <téma části> (<min> min)

### 1. <Krok v imperativu>

<1–3 věty: proč tenhle krok a co se tím změní>

Soubor `src/<cesta>` — **nový**:

```typescript
// whole file
```

Soubor `src/<cesta>` — **změna**: najdi

```typescript
// existing lines (enough context to find them)
```

a nahraď:

```typescript
// new lines
```

<co v kódu stojí za pozornost — 1–3 odrážky>

**Checkpoint:** <konkrétní stav, který lektor ověří pohledem — výstup příkazu, co je vidět
na stránce, ne „student pochopil">

### 2. <Krok v imperativu>

…

## Část B — <téma části> (<min> min)

…

## Výstupní stav

Cílový kód: [`solution/vltava-portal/`](solution/vltava-portal/). Proti Startovní čáře se
změnilo:

| Soubor | Změna | Proč |
|---|---|---|
| `src/<cesta>` | nový / změněný | <jedna věta> |

Tento stav je **Startovní čárou** modulu [`<další-slug>`](<cesta>/). Když ti něco nevyšlo,
převezmi ho podle [scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
a do dalšího bloku vstupuješ se stejným základem jako ostatní.

## Ověření

- [ ] <agregát checkpointů, počitatelné kritérium — odpovídá `solution/`>
- [ ] <aspoň jeden **negativní** checkpoint: co student udělat neměl, nebo co se na cizím
      webu / v cizím řešení nezměnilo>

## Fallback

- **<Co se pokazí>:** <co dělat>
- **Při časové tísni:** <které kroky vypadnou; převzít cílový kód podle scénáře>

## Zdroje (Microsoft)

- [<název stránky>](https://learn.microsoft.com/...)
