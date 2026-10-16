# Lab · Obhajoba a code review

> Modul: `capstone` · Odhad: 80 min · Režim: prezentace (každý) + review ve dvojicích
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Odprezentované vlastní řešení, vyplněná rubrika řešení kolegy a `BACKLOG.md` s položkami,
které mají ověřitelné kritérium hotovo.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

## Předpoklady

- Řešení verze 1.1.0.0 (nebo vyšší) nasazené na webu `spodev-<ini>`.
- Soubory `measurements/*.json` a `HARDENING.md` z dnů 3–5.

## Kroky

### 1. Připrav obhajobu (10 min)

Na testovací stránce webu `spodev-<ini>` měj Rozcestník, Adresář a Evidenci; v druhé kartě
seznam `Equipment`. Připrav si tabulku delty:

```powershell
& "$HOME\gopas-spo_dev_1\scripts\Measure-BundleSize.ps1" -ProjectPath . -BaselineFile .\measurements\baseline.json
```

**Checkpoint:** stránka se otevře **bez** debug parametrů a Debug Toolbar **není** vidět —
předvádíš verzi z katalogu.

### 2. Obhaj řešení (4 min na studenta)

Odpověz na 4 otázky z README (co a kde, kam tečou data, co schválil admin, co jsi změřil).

**Checkpoint:** každé tvrzení o velikosti nebo výkonu má číslo a datum.

### 3. Projdi řešení kolegy (20 min)

Ve dvojici si vyměňte projekty (složku nebo repozitář — **jen čtení**). Vyplň rubriku z README
do souboru `REVIEW-<ini-kolegy>.md`: u každé oblasti body 0–2 a **jeden důkaz** (soubor
a řádek, výstup příkazu, screenshot).

Užitečné příkazy nad cizím projektem:

```powershell
Get-ChildItem .\src -Recurse -Include *.ts, *.tsx | Select-String -Pattern "from '\.\./\.\./\.\./hooks'"
Get-ChildItem .\src -Recurse -Include *.ts, *.tsx | Select-String -Pattern 'localStorage|innerHTML|this\.context' |
    Select-Object Filename, LineNumber, Line
Get-Content .\config\package-solution.json | Select-String -Pattern 'scope'
```

**Checkpoint:** všech 8 oblastí má body a důkaz.

**Checkpoint (negativní):** v projektu kolegy jsi nic nezměnil (`git status` čisté nebo
nezměněné časy souborů).

### 4. Sestav backlog (10 min)

Z rubriky, kterou dostal **tvůj** projekt, a z `spfx-whats-next` vytvoř `BACKLOG.md`: každá
položka = problém, kritérium hotovo (ověřitelné příkazem nebo měřením), odhad.

**Checkpoint:** žádná položka nemá kritérium typu „zlepšit" nebo „optimalizovat" bez čísla.

## Ověření

- [ ] Obhajoba s čísly a daty, řešení běží z katalogu.
- [ ] `REVIEW-<ini-kolegy>.md` s 8 oblastmi, body a důkazy.
- [ ] `BACKLOG.md` s ověřitelnými kritérii.
- [ ] **Negativní:** v cizím projektu nic nezměněno.

## Fallback

- **Řešení není nasazené v aktuální verzi** — obhajoba z `localhost` s debug parametry; v rubrice
  oblast Funkce max. 1 bod.
- **Chybí měření ze středy** — použít referenční čísla z
  [`../../day-3/bundle-baseline/mereni-baseline.md`](../../day-3/bundle-baseline/mereni-baseline.md)
  a vlastní páteční; přiznat to v obhajobě.
- **Při časové tísni:** obhajoba 3 min, review jen 4 oblasti (Hranice tenantu, Oprávnění,
  Měření, Kvalita).

## Zdroje (Microsoft)

- [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
