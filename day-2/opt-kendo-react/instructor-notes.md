# Instructor notes — KendoReact

## Timing

- ~15 min výklad + 45 min lab. Instalace (krok 2–3) ~4 min na lektorském stroji s teplou
  cache; na učebně odhad víc.
- Blok spouštět jen při rezervě dne 2 — je to první kompresní ventil.

## Go/no-go — otestovat před během

- `@progress/kendo-react-grid@13.3.0` je na npm a jeho peer rozsah obsahuje React 17
  (ověřeno 2026-10-16). Po vydání SPFx 1.24 (React 18) blok přepsat na aktuální KendoReact.
- Build referenčního sandboxu 2026-10-16: 16 s, bez licenčního varování, bundle 1 442 440 B.
- **Neověřeno na tenantu:** zda KendoReact 13.3.0 za běhu (konzole prohlížeče) bez licence
  nevypisuje varování i u Free funkcí. Ověřit na workbenchi den předem.

## Tripwires

- **`npm install @progress/kendo-react-grid`** bez verze — přesně to, co ukazuje krok 1.
- **`--legacy-peer-deps` / `--force`** — studenti to najdou na Stack Overflow a „vyřeší"
  ERESOLVE. Výsledek: KendoReact pro React 18 na Reactu 17, rozbitý za běhu.
- **Licence Malach IS** — lektor ji má, studenti ne. Kurz ukazuje jen Free funkce; licenční
  klíč lektora se nikam nekopíruje.
- **Globální CSS** — kdo dá téma do `vltava-portal`, změní vzhled celé stránky. Proto
  samostatný projekt.

## Vazby

- Zpět: `react-fluent-ui` (velikost Fluent UI pro srovnání).
- Dopředu: nic — leaf. Poznatek o velikosti se zmíní v `bundle-baseline`.
