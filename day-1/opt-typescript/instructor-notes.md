# Instructor notes — TypeScript pro SPFx

## Timing

- Samostudium, ~35 min čtení + 25 min lab. V učebně se neodučuje; lektor na modul odkáže na
  konci `project-anatomy` a odpovídá na dotazy během dne 2.
- Studentům bez zkušenosti s TypeScriptem doporučit přečíst před dnem 2 (React a Fluent UI
  používají typy props a union typy).

## Go/no-go — otestovat před během

- Měření v explaineru (chyby `TS2550`, výstup `target es5`, počty v bundlech) platí pro rig
  SPFx 1.23.2 a TypeScript 5.8.3 — změřeno 2026-10-23. Po přechodu na 1.24 zopakovat.

## Tripwires

- **„Opravím to v `node_modules`"** — úprava rigu zmizí při příštím `npm install`.
- **`any` jako řešení chyby typu** — vypne kontrolu; ESLint to hlásí.
- **Typ jako validace dat** — rozhraní REST odpověď nekontroluje.

## Vazby

- Zpět: `project-anatomy` (rig, `tsconfig.json`).
- Dopředu: `react-fluent-ui` (typy props), `pnpjs` (generika, importy kvůli vedlejšímu
  efektu), `performance-caching` (barrel importy), `ci-cd-quality` (`@types/node` v testu).
