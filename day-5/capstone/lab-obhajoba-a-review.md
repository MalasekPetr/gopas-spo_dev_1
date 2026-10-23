# Lab · Ukázka výsledku a backlog

> Modul: `capstone` · Odhad: 35 min · Režim: ukázka (každý, 2 min) + backlog samostatně
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Předvedená Výdejna vybavení z App Catalogu, odpovědi na tři otázky z README a `BACKLOG.md`
s položkami, které mají ověřitelné kritérium hotovo.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

## Předpoklady

- Řešení verze 1.2.0.0 nasazené na webu `spodev-<ini>`, stránka *Vydejna* (lab `equipment-desk`).
- Číslo z `Measure-BundleSize.ps1` (krok 12 labu `equipment-desk`).

## Kroky

### 1. Připrav ukázku (5 min)

V prohlížeči měj stránku *Vydejna* a v druhé kartě seznam `EquipmentLoans`. Připrav si jeden
kus skladem, který na ukázce vydáš.

**Checkpoint:** stránka se otevře **bez** debug parametrů a Debug Toolbar **není** vidět —
předvádíš verzi z katalogu.

### 2. Předveď a odpověz (2 min na studenta)

Vydej kus kolegovi, ukaž ho v *Historii* a v seznamu. Pak tři otázky z README: kam tečou data,
co když výdej selže napůl, co jsi změřil.

**Checkpoint:** tvrzení o velikosti má číslo a datum.

### 3. Sestav backlog (10 min)

Projdi **vlastní** řešení podle rubriky z README (8 oblastí, 0–2 body, jeden důkaz každá).
Z oblastí pod 2 body, z `spfx-whats-next` a z otázky „napůl hotový výdej" vytvoř `BACKLOG.md`:
každá položka = problém, kritérium hotovo (ověřitelné příkazem nebo měřením), odhad.

Užitečné příkazy:

```powershell
Get-ChildItem .\src -Recurse -Include *.ts, *.tsx | Select-String -Pattern "from '\.\./\.\./\.\./hooks'"
Get-ChildItem .\src -Recurse -Include *.ts, *.tsx | Select-String -Pattern 'localStorage|innerHTML|this\.context' |
    Select-Object Filename, LineNumber, Line
Get-Content .\config\package-solution.json | Select-String -Pattern 'scope'
```

**Checkpoint:** žádná položka nemá kritérium typu „zlepšit" nebo „optimalizovat" bez čísla.

## Ověření

- [ ] Ukázka z katalogu, s číslem a datem.
- [ ] `BACKLOG.md` s ověřitelnými kritérii, včetně upgradu na SPFx 1.24.
- [ ] **Negativní:** na ukázce nikdo nepředvádí z `localhost` — kdo nemá nasazeno, říká to
      a v rubrice má u Funkce max. 1 bod.

## Fallback

- **Řešení není nasazené v aktuální verzi** — ukázka z `localhost` s debug parametry; v rubrice
  oblast Funkce max. 1 bod.
- **Výdejna nedokončená** — ukázka Evidence a příkazu Vydat zařízení; Výdejna jako první
  položka backlogu.
- **Při časové tísni:** ukázka jen u dobrovolníků, backlog dokončit po kurzu.

## Zdroje (Microsoft)

- [Overview of the SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
