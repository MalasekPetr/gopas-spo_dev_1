# Den 4 — Rozšíření, výkon, nasazení

Řešení přeroste web party: banner oznámení na každé stránce a akce „Vydat zařízení" v seznamu.
Balíček se zmenší proti středečnímu baseline a nasadí se jako verzovaný upgrade.

> Ráno nejdřív aktualizuj materiály: `git -C "$HOME\gopas-spo_dev_1" pull`.

| Pořadí | Blok | Slug | Typ | min |
|---|---|---|---|---|
| 1 | Extensions — Application Customizer, Command Set, Field Customizer | [`extensions`](extensions/) | P | 120 |
| 2 | Výkon II — code splitting, lazy loading, cache | [`performance-caching`](performance-caching/) | P | 90 |
| 3 | Balení a App Catalog — verze, upgrade, tenant vs. site | [`packaging-deployment`](packaging-deployment/) | P | 90 |

Celkem **300 min**.

## Kompresní ventily

Škrtá se odshora:

1. JSON formátování v `extensions` (krok 7) jako demo (−10).
2. Experiment s lazy loadingem v `performance-caching` (krok 3) jako demo s čísly z README (−15).

**Nekrátit** `packaging-deployment` — capstone stojí na nasazeném řešení.

> [!NOTE] Extensions se testují jen na moderní stránce
> Hosted workbench extensions nenačte. Proto pondělní krok s Debug Toolbarem na moderní
> stránce — tady je to jediná cesta.
