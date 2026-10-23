# Lab · Ukázka výsledku a backlog

> Modul: `capstone` · Odhad: 35 min · Režim: ukázka (každý, 2 min) + backlog samostatně
> Tenant: `cloudedu.cz` · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Předvedená Výdejna vybavení z App Catalogu, odpovědi na tři otázky z README a `BACKLOG.md`
s položkami, které mají ověřitelné kritérium hotovo.

**Jak lab číst:** lab je nekódový — začni u **Startovní čáry** (co máš mít na vstupu), každý
krok končí **Checkpointem** — nesedí-li, nepokračuj. **Výstupní stav** říká, co po labu
existuje.

## Předpoklady

- Řešení verze 1.2.0.0 nasazené na webu `spodev-<ini>`, stránka *Vydejna* (lab `equipment-desk`).
- Číslo z `Measure-BundleSize.ps1` (krok 12 labu `equipment-desk`).

## Startovní čára

Vstupem jsou tři věci z dnešního dne:

1. **Vlastní** projekt `vltava-portal-<ini>` ve stavu po labu
   [`equipment-desk`](../equipment-desk/) (referenční kód
   [`../equipment-desk/solution/vltava-portal/`](../equipment-desk/solution/vltava-portal/)),
   nasazený z App Catalogu jako verze 1.2.0.0, se stránkou *Vydejna*.
2. Číslo z brány velikosti (krok 12 labu `equipment-desk`) s datem měření.
3. `BACKLOG.md` s položkou *Upgrade na SPFx 1.24* z labu
   [`spfx-whats-next`](../spfx-whats-next/lab-odhad-upgradu.md).

Kdo nemá kód hotový, převezme ho podle
[scénáře](../../scenario-vltava-portal.md#jak-převzít-startovní-kód-ze-solution)
(`robocopy`, `npm install`, **`Set-StudentIdentity.ps1`**) — nasazení ale už nestihne;
v rubrice pak platí Fallback níže. Kód se v tomto labu **nemění**.

**Checkpoint:** v App Catalogu je u tvého řešení `vltava-portal-<ini>` verze `1.2.0.0` a
v kořeni projektu existuje `BACKLOG.md`.

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

## Výstupní stav

- **Předvedená** Výdejna z App Catalogu (verze 1.2.0.0) a odpovědi na tři otázky z README,
  tvrzení o velikosti s číslem a datem.
- **Doplněný** `BACKLOG.md` v kořeni vlastního projektu: položky z rubriky, upgrade na SPFx 1.24
  a napůl hotový výdej — každá s problémem, ověřitelným kritériem hotovo a odhadem.
- **Beze změny:** kód projektu — konečný stav kurzu je
  [`../equipment-desk/solution/vltava-portal/`](../equipment-desk/solution/vltava-portal/).
  Referenční `solution/` tento lab nemá.

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
