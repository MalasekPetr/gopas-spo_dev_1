# Lab · Logy, měření, error boundary a kontrola před předáním

> Modul: `diagnostics-hardening` · Odhad: 35 min · Režim: hands-on, vlastní web (kroky 1–4); kroky 5–6 demo lektora
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Řešení, které loguje a měří volání API, přežije chybu vykreslení jednoho web partu, a soubor
`HARDENING.md` s výsledky kontroly závislostí a výstupu buildu.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj. Hotové soubory:
[`solution/vltava-portal/`](solution/vltava-portal/).

## Předpoklady

- Hotový `ci-cd-quality` (testy v buildu).

## Kroky

### 1. Měření a logování volání API

Ze solution zkopíruj `src/utils/perf.ts` a v `src/services/employeeService.ts`
a `src/services/equipmentService.ts` obal volání API funkcí `measure` (porovnej se solution —
hledej `measure('Vltava`).

**Checkpoint:** `npm run build` projde (15 testů).

### 2. Error boundary

1. Ze solution zkopíruj `src/components/ErrorBoundary.tsx` a `ErrorBoundary.module.scss`.
2. V každém ze tří web partů přidej import a obal komponentu:

   ```typescript
   import { ErrorBoundary } from '../../components/ErrorBoundary';
   // ...
   const element: React.ReactElement = React.createElement(
     ErrorBoundary, { source: 'VltavaPortal', fallbackText: strings.RenderError }, component);
   ```

   (`component` je původní `React.createElement(Portal, {...})`; zdroj logu max. 20 znaků:
   `VltavaPortal`, `VltavaDirectory`, `VltavaEquipment`).
3. Spusť `npm run build`.

**Checkpoint (negativní):** build **spadne** dvakrát za sebou:

1. na TypeScriptu — `RenderError` není v `mystrings.d.ts`; doplň ho do `.d.ts` všech tří
   web partů a spusť build znovu,
2. na testu lokalizace — klíč je deklarovaný, ale chybí v `loc/*.js`; doplň texty ze solution.

Pak build projde. Druhou chybu by bez testu z `ci-cd-quality` našel až uživatel.

### 3. Vyvolej chybu vykreslení

Dočasně přidej na začátek funkce `Portal` v `Portal.tsx`:

```typescript
if (title === 'boom') {
  throw new Error('Simulated render error');
}
```

`npm start -- --nobrowser`, testovací stránka s debug parametry, na stránce Rozcestník
**a** Adresář. V property pane Rozcestníku nastav nadpis `boom` → **Apply**.

**Checkpoint:** místo Rozcestníku je červený pruh *This part of the page could not be
displayed…*; Adresář vedle funguje dál.

**Checkpoint (negativní):** stránka **není** prázdná a ostatní web party nezmizely.

Ctrl+F12 → **Trace**: je tam chyba se zdrojem `VltavaPortal`. Kód s `boom` odstraň.

### 4. Přečti měření

V Adresáři hledej nové jméno. Pak:

1. Ctrl+F12 → **Trace** — řádek `vltava-graph-users: <N> ms`.
2. Ctrl+F12 → **Performance** — časy načtení a vykreslení tvých komponent.
3. Stejné hledání zopakuj.

**Checkpoint:** po prvním hledání je v Trace řádek s dobou volání Graphu; po opakovaném
**nový řádek nepřibude** (cache z dne 4 — do měřené funkce se nedojde).

### 5. Kontrola závislostí (demo lektora)

```powershell
npm audit
npm audit --omit=dev
npm sbom --sbom-format cyclonedx --omit dev | ConvertFrom-Json |
    Select-Object -ExpandProperty components | ForEach-Object {
        if ($_.licenses) { $_.licenses | ForEach-Object { if ($_.license.id) { $_.license.id } elseif ($_.expression) { $_.expression } else { $_.license.name } } }
        else { '(no SPDX: ' + $_.name + ')' }
    } | Group-Object | Sort-Object Count -Descending | Select-Object Count, Name
```

**Checkpoint:** umíš říct, kolik zranitelností jde **k uživateli** (`--omit=dev`) a které
licence mají produkční závislosti (referenční: 0 a MIT/0BSD/Apache-2.0/BSD-2-Clause + SPFx EULA).

**Checkpoint (negativní):** `npm audit fix` jsi **nespustil**.

### 6. Kontrola výstupu buildu (demo lektora)

```powershell
npm run build
"--- addresses"
Get-ChildItem .\release\assets\*.js | Select-String -Pattern 'https://[a-zA-Z0-9.-]+' -AllMatches |
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
"--- secret-like patterns"
$secret = '(?i)(client_?secret|api[_-]?key|password|connectionstring|sig=|eyJ[a-zA-Z0-9_-]{20,})'
Get-ChildItem .\src -Recurse -File | Select-String -Pattern $secret
Get-ChildItem .\release\assets\*.js | Select-String -Pattern $secret -AllMatches |
    ForEach-Object { $_.Matches.Value } | Group-Object | Select-Object Count, Name
```

Výsledky kroků 5 a 6 zapiš do `HARDENING.md` v kořeni projektu: každý nález s jednou větou
„co to je a proč to (ne)vadí".

**Checkpoint:** `HARDENING.md` vysvětluje každou adresu a každý nález (referenční nálezy
a jejich vysvětlení: [`mereni-hardening.md`](mereni-hardening.md)).

## Ověření

- [ ] Volání Graphu a seznamu se měří a loguje do Developer Dashboardu.
- [ ] Chyba vykreslení jednoho web partu nerozbije stránku.
- [ ] Test lokalizace zachytil chybějící `RenderError`.
- [ ] `HARDENING.md` s vysvětlenými nálezy.
- [ ] **Negativní:** stránka s chybou není prázdná; `npm audit fix` nespuštěn.

## Fallback

- **Developer Dashboard se neotevře** — Ctrl+F12 musí jít do stránky (klikni do ní); ve
  Firefoxu může klávesu zachytit prohlížeč.
- **Trace je prázdný** — `Log.info` z `localhost` se zapisuje jen po načtení debug skriptů.
- **`npm sbom` neznámý příkaz** — starší npm; `npm --version` musí být 10.x.
- **Při časové tísni:** krok 4 bod 2 a krok 6 jako demo; `HARDENING.md` jen s výsledky kroku 5.

## Zdroje (Microsoft)

- [Use the developer dashboard](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-developer-dashboard)
- [Understanding npm audit vulnerabilities in SPFx projects](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/npm-vulnerabilities)
