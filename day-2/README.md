# Den 2 — Konfigurace a UI

Rozcestník přestane mít odkazy natvrdo v kódu: oddělení si je nastaví v property pane, web part
mluví česky i anglicky a je postavený z funkčních komponent a Fluent UI.

| Pořadí | Blok | Slug | Typ | min |
|---|---|---|---|---|
| 1 | Property pane a dynamická konfigurace | [`property-pane`](property-pane/) | P | 90 |
| 2 | Lokalizace a více jazyků | [`localization`](localization/) | P | 45 |
| 3 | React a Fluent UI | [`react-fluent-ui`](react-fluent-ui/) | P | 120 |
| — | KendoReact — komerční UI knihovna v SPFx | [`opt-kendo-react`](opt-kendo-react/) | V | 60 |

Celkem **255 min** povinných, + 60 volitelných.

## Kompresní ventily

Škrtá se odshora:

1. `opt-kendo-react` vypadává celý (−60).
2. Kroky 9 a 11 v `property-pane` (srovnání reaktivního a nereaktivního režimu) vynechat (−10).
3. Toolbox na české stránce v `localization` (krok 5) jako demo (−5).
4. Motiv sekce a `escape()` v `react-fluent-ui` (kroky 7–8) jako demo (−10).

**Nekrátit** `react-fluent-ui` — struktura komponent z tohoto bloku nese dny 3–5.

> [!NOTE] Pořadí: nejdřív konfigurace, pak UI
> Property pane jde první, protože odkazy natvrdo z pondělí jsou nejviditelnější dluh řešení.
> Lokalizace navazuje hned — property pane má vlastní popisky, které se lokalizují stejně.
> Přestavba na funkční komponenty a Fluent UI je až na konci dne, aby se stavěla na hotovém
> datovém modelu odkazů.
