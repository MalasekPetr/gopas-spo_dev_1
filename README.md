# SPO_DEV_1 — SharePoint Framework (SPFx): Základy vývoje aplikací

Zdrojové materiály kurzu **SPO_DEV_1** (GOPAS). Vše je psané v Markdownu s Mermaid diagramy,
renderovatelné přímo na GitHubu; referenční kód je ve složkách `solution/`.

Kurz je pětidenní, česky, pro front-end vývojáře v Microsoft 365 a pro týmy přecházející
z klasického SharePointu na moderní vývoj. Katalogová stránka:
[SPO_DEV_1](https://www.gopas.cz/sharepoint-framework-%28spfx%29--zaklady-vyvoje-aplikaci_spo_dev_1).

> [!IMPORTANT] Osnova v tomto repu není totožná s publikovanou
> Katalog má 15 bloků po 2–2,5 h a bonus. Repo má 17 povinných bloků a 1 volitelný, drží stav
> produktu k 2026-10 a opravuje věcné chyby katalogu — hlavně **toolchain je od SPFx 1.22 Heft,
> ne gulp**. Mapování katalogu na bloky je v [`self-study.md`](self-study.md), pořadí
> v [`agenda.md`](agenda.md).

## Jak repo číst

- **Pořadí bloků** drží [`agenda.md`](agenda.md) — složky jsou pojmenované **slugy**, ne čísly.
- **Nosná linka** celého týdne je [`scenario-vltava-portal.md`](scenario-vltava-portal.md).
  Přečti ji první — bez ní jsou moduly nesouvisející cvičení.
- **Závazné názvosloví** je v [`GLOSSARY.md`](GLOSSARY.md) — včetně tabulky „starý návod
  s gulp → co platí dnes".
- **Konvence** psaní (MD styl, Mermaid, currency-markery, norma měření, kód) jsou
  v [`CONVENTIONS.md`](CONVENTIONS.md).
- **Prostředí** — tenant, učební stroj, matice požadavků per blok, go/no-go — je
  v [`environment.md`](environment.md).
- **Šablony** modulu, labu, instruktorských poznámek a denního README jsou
  v [`_templates/`](_templates/).
- **Skripty** jsou v [`scripts/`](scripts/): kontrola prostředí studenta, měření velikosti
  balíčku (i jako brána v CI), zřízení seznamu `Equipment` a kontrola integrity repa.

## Struktura

```text
gopas-spo_dev_1/
├─ README.md                    # tento soubor
├─ CONVENTIONS.md               # jak psát materiály a kód
├─ GLOSSARY.md                  # závazné názvosloví
├─ agenda.md                    # pořadí bloků (single source of order)
├─ environment.md               # tenant, učební stroj, matice per blok, go/no-go
├─ scenario-vltava-portal.md    # nosná linka týdne
├─ self-study.md                # mapování na katalog, co se neodučí
├─ _templates/                  # module.md, lab.md, instructor-notes.md, day-readme.md
├─ day-1/ … day-5/              # obsah po dnech; každý modul = složka se slugem
└─ scripts/                     # Test-DevEnvironment, Measure-BundleSize, New-EquipmentList, Test-RepoIntegrity
```

Modul obsahuje `README.md` (výklad, student), `lab-*.md` (zadání, student),
`instructor-notes.md` (timing, go/no-go, tripwires — **jen lektor**) a u kódových labů
`solution/` se stavem řešení po labu.

## Legenda

- **Povinný** blok — součást každého běhu.
- **Volitelný** blok (slug s prefixem `opt-`) — spouští se dle času a potřeb skupiny. Volitelné
  bloky jsou vždy **leaf**: nic povinného ani capstone na nich nezávisí.
- Markery v textu:
  - `> [!IMPORTANT] … — změřeno (RRRR-MM-DD)` — naměřené číslo s datem a strojem.
  - `> [!WARNING] Ověřit k datu běhu — stav k RRRR-MM` — fast-moving fakt (verze, preview,
    retirement).
  - `> [!IMPORTANT] Názvosloví` — přejmenování, na které studenty upozornit.
  - `> [!NOTE]` — dramaturgické zdůvodnění: proč je blok tady.

## Dvě věci, na kterých tenhle kurz stojí

**Nic netvrdit bez měření.** Každé netriviální tvrzení je buď ověřitelné z dokumentace
s odkazem, nebo změřené s datem. U vývojářského kurzu to znamená hlavně čísla o toolchainu
a balíčku: jak dlouho trvá instalace, build a jak velký je výsledný bundle — změřené na
konkrétním stroji, ne „obvykle pár minut". Velikost balíčku se měří ve středu a znovu ve
čtvrtek po optimalizaci; delta je to, co student v pátek obhajuje.

**Jedno řešení celým týdnem.** Kurz není série Hello World projektů. Každý student staví jedno
SPFx řešení pro fiktivní firmu Vltava Servis a každý blok mu přidá vrstvu. Viz
[`scenario-vltava-portal.md`](scenario-vltava-portal.md).

## Stav

**Připraveno pro první běh (2026-10-19).** Všech 18 bloků má výklad, lab a instructor notes.
Každý den končí referenčním řešením ve `solution/`, které **prochází buildem** (SPFx 1.23.2,
ověřeno 2026-10-16 na lektorském stroji; od dne 5 včetně 15 unit testů). Naměřená čísla jsou
v souborech `mereni-*.md` s datem a strojem.

**Ověřeno lokálně, ne na tenantu.** Kroky labů, které běží na `cloudedu.cz` (workbench, moderní
stránka, App Catalog, API access, upgrade), jsou podle dokumentace, ale neprošly zkušebním
během. Každý `instructor-notes.md` je označuje jako „neověřeno na tenantu" — patří do go/no-go.

Integrita repa se kontroluje skriptem, ne odhadem:

```powershell
./scripts/Test-RepoIntegrity.ps1
```

> [!WARNING] Před prvním během projít go/no-go seznam
> [`environment.md`](environment.md) obsahuje otevřené položky, které mohou zastavit den 1 —
> zejména **síť učebny** (npm registry, GitHub, nodejs.org) a **MFA registraci** studentských
> účtů.
