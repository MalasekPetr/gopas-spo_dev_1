# Instructor notes — Capstone

## Timing

- 5 min úvod (3 otázky, rubrika), 5 min příprava, ukázky (2 min × počet studentů), 10 min
  backlog. Při 12 studentech: ukázky 24 min → celkem ~44 min; při tísni ukázky jen dobrovolníci.
- Den končí v 15:00 — capstone nesmí začít později než ve 14:15.

## Go/no-go — otestovat před během

- Projektor a přepínání profilů prohlížeče studentů (každý předvádí svůj tenant účet).
- Referenční řešení `../equipment-desk/solution/` sestavené (17 testů, bez chyb a varování) — jako
  záloha pro studenta, jehož řešení nejde spustit.

## Tripwires

- **Obhajoba bez čísel** — „je to rychlejší". Vrátit otázkou „o kolik a čím to dokládáš?"
- **Rubrika jako známka** — je to zdroj backlogu, ne hodnocení.
- **„Batch to vyřeší"** — nevyřeší; `$batch` není transakce. Dobrá otázka na konec týdne.
- **Úklid** — po kurzu: řešení `vltava-portal-*` z tenantového katalogu, schválené
  `User.Read.All` na stránce API access, weby `spodev-*` i se seznamy `EquipmentLoans` (lektorský soubor mimo repo).

## Vazby

- Zpět: všechny bloky týdne; hlavně `bundle-baseline`, `performance-caching`,
  `permissions-consent`, `diagnostics-hardening`, `equipment-desk`.
- Dopředu: —
