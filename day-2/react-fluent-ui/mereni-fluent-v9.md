# Měření · Fluent UI v8 vs. v9 v SPFx 1.23.2

Změřeno **2026-10-23**, stroj lektora `MALACH-PC04`, Node.js 22.23.3, SPFx 1.23.2 (Heft),
`npm run build` (produkční), velikost `release/assets/<bundle>_*.js` skriptem
[`Measure-BundleSize.ps1`](../../scripts/Measure-BundleSize.ps1).

Verze: `@fluentui/react` **8.125.8**, `@fluentui/react-components` **9.74.9**,
`@fluentui/react-migration-v8-v9` **9.10.20** (v9 vydané 2026-09-23 — starší než 14 dní
k datu měření).

## Co se měřilo

Čtyři web party se **stejným** UI: popisek + textové pole + primární tlačítko, obalené
poskytovatelem motivu. Každý web part je samostatný bundle ve stejném projektu.

| Bundle | Obsah | Raw (B) | Gzip (B) |
|---|---|---:|---:|
| `probe-v8-web-part` | v8: `ThemeProvider`, `Stack`, `TextField`, `PrimaryButton` | 213 195 | 63 220 |
| `probe-v9-web-part` | v9: `FluentProvider` + `webLightTheme`, `Field`, `Input`, `Button` | 95 280 | 26 957 |
| `probe-v9-theme-web-part` | totéž v9 + převod motivu SPFx (`createV9Theme`) | 104 201 | 28 424 |
| `probe-mixed-web-part` | v8 UI **a** v9 UI v jednom web partu | 307 135 | 89 259 |

## Co z toho plyne

- **v9 je v izolaci menší** — 95 280 B proti 213 195 B (−55 %). Velikost **není** argument
  proti v9.
- **Převod motivu SPFx do v9 stojí** 8 921 B (104 201 − 95 280) a musí ho napsat autor řešení.
- **Smíšený stav je nejdražší** — v8 + v9 v jednom bundlu = 307 135 B, o 93 940 B (+44 %) víc
  než samotná v8. Přesně v tomto stavu skončí každé existující řešení, které „přidá jednu
  komponentu z v9".
- `@pnp/spfx-controls-react` 3.25.0 závisí na **obou** verzích (`@fluentui/react` 8.106.4 i
  `@fluentui/react-components` ^9.32.1 — `npm view`, 2026-10-23).

## Vedlejší nález: typy v Reactu 17

Volání `React.createElement(Field, { label: 'Name' }, React.createElement(Input, {}))` v souboru
`.ts` skončilo chybou `TS2769: No overload matches this call` (`ForwardRefComponent<InputProps>`
proti `@types/react` 17.0.45). Stejný kód zapsaný v JSX (`.tsx`) prošel. Kdo v9 zkouší, píše
komponenty v JSX.

## Jak měření zopakovat

V kopii referenčního projektu (ne ve vlastním řešení):

```powershell
npm install @fluentui/react-components@9.74.9 @fluentui/react-migration-v8-v9@9.10.20 --save-exact
```

Komponenta v9 (`src/webparts/probeV9/ProbeV9.tsx`):

```tsx
import * as React from 'react';
import { Button, Field, FluentProvider, Input, webLightTheme, type Theme } from '@fluentui/react-components';

export default function ProbeV9(props: { theme?: Theme }): JSX.Element {
  return (
    <FluentProvider theme={props.theme || webLightTheme}>
      <Field label="Name"><Input /></Field>
      <Button appearance="primary">Save</Button>
    </FluentProvider>
  );
}
```

Převod motivu SPFx (v8 tvar `IReadonlyTheme`) na tokeny v9 ve třídě web partu:

```typescript
import { webLightTheme } from '@fluentui/react-components';
import { createV9Theme } from '@fluentui/react-migration-v8-v9';
import type { Theme } from '@fluentui/react';

// in render(): map the page/section theme to v9 tokens
const theme = this._theme ? createV9Theme(this._theme as unknown as Theme, webLightTheme) : webLightTheme;
```

Každý web part zaregistrovat jako vlastní bundle v `config/config.json`, pak `npm run build`
a `Measure-BundleSize.ps1 -ProjectPath .`.
