# Instructor notes — Výkon II

## Timing

- ~20 min výklad + 60 min lab + 10 min společné srovnání čísel.
- Krok 3 (lazy loading) dělat **s předpovědí**: před buildem nechat třídu hlasovat, jestli
  bude balíček menší. Většina řekne ano — to je pointa.

## Go/no-go — otestovat před během

- Referenční čísla 2026-10-16 v `mereni-den-4.md`; po změně verzí balíčků přeměřit.
- Studenti mají `measurements/baseline.json` ze středy. Kdo ne, použije čísla z
  `../../day-3/bundle-baseline/mereni-baseline.md`.
- Cache: na kurzovním tenantu ověřit, že druhé hledání opravdu nejde do sítě. **Neověřeno na
  tenantu.**

## Tripwires

- **„Lazy loading je vždycky lepší"** — rozbít čísly z kroku 3. Kdy pomáhá: velká knihovna
  jen pro vzácnou akci (export do PDF, editor grafů), ne komponenta, kterou web part kreslí
  hned.
- **`localStorage` z návodů** — rychlé řešení, které nechá data tenantu na zařízení. Nechat
  studenty říct, proč ne (sdílené počítače, ISO 27001, zákazníkova data).
- **Cache bez TTL** — data zastarají navždy. V řešení 5 minut; zeptat se, co by se stalo
  s nově nastoupivším kolegou.
- **Chunk `chunk.741`** — webpack vyčlenil vendor chunk sám (splitChunks); jméno je číslo.
  `-MaxBytes` ve skriptu proto hlídá i chunky.

## Vazby

- Zpět: `bundle-baseline` (baseline, barrel), `extensions` (velikost banneru).
- Dopředu: `ci-cd-quality` (`-MaxBytes` v pipeline), `capstone` (obhajoba delty).
