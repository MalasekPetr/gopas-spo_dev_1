# Instructor notes — Extensions

## Timing

- ~30 min výklad + 85 min lab + 5 min shrnutí.
- Krok 6 (sestavení ladicí adresy) je nejtěžší na pozornost — ukázat jednou na projektoru.
- Chránit krok 7.3 (XSS) a krok 11 (viditelnost příkazu). Krok 12 padá první.

## Go/no-go — otestovat před během

- Generátor 1.23.2 + `--framework none` přidá extension do React projektu (ověřeno
  2026-10-16). Bez volby chyba `ENOENT ...\applicationCustomizer\react`.
- Ladicí adresa s `customActions` na kurzovním tenantu: banner se zobrazí, příkaz se zobrazí.
  **Neověřeno na tenantu.**
- `Lists/Equipment` existuje u všech studentů (den 3). Kdo ho nemá, pustí skript teď.
- `ensureUser` s e-mailem kurzovního účtu zapíše osobu — **neověřeno na tenantu**.

## Tripwires

- **`serve.json` z generátoru** obsahuje `pageUrl` `https://{tenantDomain}/SitePages/myPage.aspx`
  — stránka neexistuje; lab ji v kroku 5 opraví. Kurz ale používá ručně sestavenou adresu (krok 6), ne `--serve-config`,
  protože `npm start` otevírá výchozí prohlížeč.
- **Druhá extension nepřidá `CustomAction` do `elements.xml`** — generátor zapíše jen první.
  Ve solution je druhá `CustomAction` doplněná ručně (řeší se v `packaging-deployment`).
- **`ClientSideInstance.xml`** — generátor ho vytvoří; vysvětlit, proč ho řešení v `packaging-deployment` maže (tenant-wide registrace).
- **`innerHTML` z návodů** — oficiální tutorial vkládá text banneru přes `innerHTML`
  s `escape()`. Funguje, ale `textContent` je bezpečný bez nutnosti pamatovat na escape.
- **Reload po vydání** — list view nemá veřejné API pro obnovení; `window.location.reload()`
  je vědomý kompromis.

## Vazby

- Zpět: `first-webpart` (Debug Toolbar, ladicí parametry), `pnpjs` (služba, seznam),
  `platform-positioning` (JSON formátování vs. kód).
- Dopředu: `performance-caching` (velikost banneru), `packaging-deployment` (`elements.xml`,
  upgrade z verze bez extensions).
