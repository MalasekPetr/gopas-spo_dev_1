# Den 5 — Kvalita a provoz

Řešení dostane pipeline, která hlídá lint, testy a velikost balíčku, a diagnostiku pro provoz.
Den končí obhajobou řešení a code review. **Konec v 15:00.**

| Pořadí | Blok | Slug | Typ | min |
|---|---|---|---|---|
| 1 | CI/CD a quality gates | [`ci-cd-quality`](ci-cd-quality/) | P | 75 |
| 2 | Diagnostika a hardening | [`diagnostics-hardening`](diagnostics-hardening/) | P | 75 |
| 3 | Co přináší SPFx 1.24 a 1.25 | [`spfx-whats-next`](spfx-whats-next/) | P | 30 |
| 4 | Capstone — obhajoba řešení a code review | [`capstone`](capstone/) | P | 90 |

Celkem **270 min**.

## Kompresní ventily

Škrtá se odshora:

1. Pipeline na GitHubu v `ci-cd-quality` (krok 6) jako demo (−15).
2. `spfx-whats-next` jen výklad (−15).

**Nekrátit** `capstone`.

> [!NOTE] Proč „co dál" až před capstonem
> SPFx 1.24 (React 18, Node.js 24/26) může vyjít během kurzu. Blok je těsně před obhajobou,
> aby student u vlastního řešení uměl říct, co by ho upgrade stál.
