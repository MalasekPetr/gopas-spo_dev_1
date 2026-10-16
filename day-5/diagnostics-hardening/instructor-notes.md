# Instructor notes — Diagnostika a hardening

## Timing

- ~25 min výklad + 50 min lab.
- Krok 3 (simulovaná chyba) je nejpřesvědčivější moment bloku — nekrátit. Krok 6 padá první.

## Go/no-go — otestovat před během

- Developer Dashboard (Ctrl+F12) na kurzovním tenantu ukazuje `Log.info` z web partu
  běžícího z `localhost` — **neověřeno na tenantu**; dokumentace z roku 2020/2022.
- `npm audit` den běhu: čísla se mění s novými advisory; přepsat tabulku v README, pokud se
  produkční počet změní z 0.
- Referenční build 2026-10-16: 15 testů, error boundary +647 B v Rozcestníku.

## Tripwires

- **`npm audit fix`** — studenti ho spustí ze zvyku. Rozbije přesné verze SPFx.
- **„Přidáme Application Insights"** — správná otázka, ale vede k datům mimo tenant. Kdo ho
  vlastní, kde běží, co se loguje (žádná osobní data) — rozhoduje zákazník.
- **Error boundary chytí všechno** — nechytí `Promise` ani `onClick`. Ukázat na Evidenci:
  chyba při uložení se zobrazí díky `run()` v komponentě, ne díky boundary.
- **Falešné poplachy ve skenu tajemství** — `password` v bundlech je Fluent UI. Smysl je
  v tom, že každý nález student vysvětlí, ne že sken je prázdný.

## Vazby

- Zpět: `performance-caching` (cache, kterou měření potvrdí), `ci-cd-quality` (testy).
- Dopředu: `capstone` (zápis pro zákazníka jako součást obhajoby).
