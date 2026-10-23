# Instructor notes — PnPjs

## Timing

- ~25 min výklad + 60 min lab + 5 min shrnutí.
- Krok 1 (instalace PnP.PowerShell + skript) může trvat 10 min a víc — pustit ho **během
  výkladu**. Kdo nemá Client ID nebo modul, jde ručním fallbackem.
- Kroky 5–12 jsou přepis kódu podle labu; v kroku 13 se kopíruje **jen** `preconfiguredEntries`.
  Kroky 4 a 13 = `Set-StudentIdentity.ps1` — bez nich má Evidence náhodné ID a titulek bez iniciál.

## Go/no-go — otestovat před během

- **Registrace aplikace PnP pro interaktivní přihlášení v `cloudedu.cz`** existuje, má
  delegovaná oprávnění pro SharePoint a její Client ID je v lektorském souboru (ne v repu).
  Bez ní skript nepoběží.
- `scripts/New-EquipmentList.ps1` spuštěný den předem na testovacím webu: 12 položek,
  druhé spuštění nic nezdvojí. **Neověřeno na tenantu** k datu psaní.
- Build referenčního řešení 2026-10-16: bez chyb, `equipment-web-part` 452 625 B.

## Tripwires

- **Interní názvy sloupců** při ručním fallbacku — „Asset Tag" s mezerou dá interní název
  `Asset_x0020_Tag`. Web part pak ukáže prázdný sloupec.
- **`getByTitle` z návodů na internetu** — funguje, dokud někdo seznam nepřejmenuje. Proto URL.
- **`await` uvnitř dávky** — PnPjs dokumentace: ve frontě volání nečekat jednotlivě, jinak se
  dávka zablokuje. V řešení se sbírají promisy a čeká se až po `execute()`.
- **Barrel `src/hooks/index.ts`** — po tomto labu exportuje i `useEquipment`. Nechat být:
  dopad na Rozcestník se změří v `bundle-baseline`.
- **Skript na cizím webu** — studenti zkopírují URL souseda. Skript zakládá jen nový seznam,
  ale na cizím webu. Kontrolovat `-SiteUrl`.

## Vazby

- Zpět: `data-access-clients` (služba + hook), `localization` (překlad hodnot voleb).
- Dopředu: `bundle-baseline` (PnPjs v balíčku), `extensions` (Command Set nad seznamem),
  `performance-caching` (cache PnPjs), `ci-cd-quality` (testy služby s mockem).
