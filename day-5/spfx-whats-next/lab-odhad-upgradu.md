# Lab · Odhad upgradu na SPFx 1.24

> Modul: `spfx-whats-next` · Odhad: 10 min · Režim: návrh, ve dvojicích
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Seznam konkrétních míst ve **vlastním** řešení, která by změnil přechod na SPFx 1.24,
s odhadem v hodinách — jako položka backlogu pro capstone.

**Jak lab číst:** lab je nekódový — začni u **Startovní čáry** (co máš mít na vstupu), každý
krok končí **Checkpointem** — nesedí-li, nepokračuj. **Výstupní stav** říká, co po labu
existuje.

## Předpoklady

- Vlastní řešení `vltava-portal-<ini>` a tabulka „Co by upgrade udělal" z README.

## Startovní čára

Vstupem je **vlastní** projekt `vltava-portal-<ini>` ve stavu po labu
[`equipment-desk`](../equipment-desk/) (verze 1.2.0.0, SPFx 1.23.2); referenční kód
[`../equipment-desk/solution/vltava-portal/`](../equipment-desk/solution/vltava-portal/).
Kdo Výdejnu nedokončil, převezme ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
(`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**) — odhad se dělá nad stejným kódem
jako u ostatních. Kód se v tomto labu **nemění**.

**Checkpoint:** `npm ls @microsoft/sp-core-library` v kořeni projektu ukazuje `1.23.2` a
v `src/webparts/` jsou čtyři složky (`portal`, `employeeDirectory`, `equipment`,
`equipmentDesk`).

## Kroky

### 1. Najdi místa, která se změní

```powershell
Get-ChildItem .\src -Recurse -Include *.ts, *.tsx |
    Select-String -Pattern 'ReactDom\.|unmountComponentAtNode|getId\(' |
    Select-Object Filename, LineNumber, Line
```

**Checkpoint:** máš seznam souborů a řádků (referenční řešení po `equipment-desk`:
`render()` a `onDispose()` čtyř web partů, `getId` v Rozcestníku — 9 řádků, ověřeno
2026-10-23).

### 2. Odhadni a zapiš

Do backlogu (soubor `BACKLOG.md` v projektu) zapiš položku *Upgrade na SPFx 1.24* se
seznamem míst z kroku 1, odhadem v hodinách a tím, co je potřeba ověřit (velikost balíčku,
testy, nasazení).

**Checkpoint:** položka má odhad a aspoň jedno „ověřit měřením".

**Checkpoint (negativní):** v projektu **není** nainstalovaná žádná verze `1.24.0-rc` —
`npm ls @microsoft/sp-core-library` ukazuje 1.23.2.

## Výstupní stav

- **Nový soubor** `BACKLOG.md` v kořeni vlastního projektu s položkou *Upgrade na SPFx 1.24*:
  místa z kroku 1, odhad v hodinách, co ověřit měřením.
- **Beze změny:** `src/`, `package.json` a `node_modules` — řešení zůstává na SPFx 1.23.2.
  Referenční `solution/` tento lab nemá; kód je pořád ten z
  [`equipment-desk`](../equipment-desk/solution/vltava-portal/).

`BACKLOG.md` je vstupem labu [`capstone`](../capstone/), kde ho doplníš o další položky.

## Ověření

- [ ] Seznam míst ke změně z vlastního kódu.
- [ ] Položka backlogu s odhadem a ověřením.
- [ ] **Negativní:** řešení zůstalo na 1.23.2.

## Fallback

- **Při časové tísni:** jen krok 1 a odhad nahlas.

## Zdroje (Microsoft)

- [SharePoint Framework roadmap](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/roadmap)
