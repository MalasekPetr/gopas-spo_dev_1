# Den 5 — Kvalita a provoz

Řešení dostane pipeline, která hlídá lint, testy a velikost balíčku, a diagnostiku pro provoz.
Jádrem dne je **samostatný lab**: každý sám postaví full-page aplikaci Výdejna vybavení. Den
končí ukázkou výsledku a backlogem. **Konec v 15:00.**

> Ráno nejdřív aktualizuj materiály: `git -C "$HOME\gopas-spo_dev_1" pull`.

| Pořadí | Blok | Slug | Typ | min |
|---|---|---|---|---|
| 1 | CI/CD a quality gates | [`ci-cd-quality`](ci-cd-quality/) | P | 45 |
| 2 | Diagnostika a hardening | [`diagnostics-hardening`](diagnostics-hardening/) | P | 45 |
| 3 | Výdejna vybavení — samostatný lab | [`equipment-desk`](equipment-desk/) | P | 120 |
| 4 | Co přináší SPFx 1.24 a 1.25 | [`spfx-whats-next`](spfx-whats-next/) | P | 20 |
| 5 | Capstone — ukázka výsledku a backlog | [`capstone`](capstone/) | P | 40 |

Celkem **270 min**.

## Kompresní ventily

Škrtá se odshora:

1. Kontrola výstupu buildu v `diagnostics-hardening` jen jako demo s referenčními nálezy (−5).
2. `spfx-whats-next` jen výklad (−10).
3. Bonusové kroky `equipment-desk` nejsou povinné — rychlí je dělají, ostatní je přeskočí.

**Nekrátit** jádro `equipment-desk` — na jeho výsledku stojí capstone.

> [!NOTE] Proč „co dál" až před capstonem
> SPFx 1.24 (React 18, Node.js 24/26) může vyjít během kurzu. Blok je těsně před ukázkou,
> aby student u vlastního řešení — včetně čerstvé Výdejny — uměl říct, co by ho upgrade stál.
