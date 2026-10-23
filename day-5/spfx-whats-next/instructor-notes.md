# Instructor notes — Co přináší SPFx 1.24 a 1.25

## Timing

- ~10 min výklad + 10 min lab. Kompresní ventil: jen výklad (10 min).

## Go/no-go — otestovat před během

- **Ráno dne 5 zkontrolovat npm**: `npm view @microsoft/sp-core-library dist-tags`. Pokud je
  `latest` 1.24.x, přepsat tabulku v README podle release notes a GA generátoru
  (RC 2026-10-16: React 18.3.1, `createRoot`, Node 22/24/26, Heft 1.3.2).
- Roadmap update za říjen 2026 (blog slíbil aktualizaci koncem října) — přečíst, pokud vyšel.

## Tripwires

- **„Přejdeme hned"** — RC do produkce ne; GA až po vlastním měření a testech.
- **Copilot UX components** — preview, licencování po GA nepotvrzené; nesliboval zákazníkům.
- **Node 24 na učebně** — nepřepínat; kurz končí na 22.

## Vazby

- Zpět: `dev-environment` (Node.js, generátor), `react-fluent-ui` (React 17), `opt-kendo-react`
  (React 18 pro KendoReact 14+), `packaging-deployment` (`m365 spfx project upgrade`).
- Dopředu: `capstone` (položka backlogu).
