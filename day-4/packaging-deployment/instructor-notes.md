# Instructor notes — Balení a App Catalog

## Timing

- ~25 min výklad + 60 min lab + 5 min shrnutí dne.
- Krok 7 (*GET IT*) trvá na tenantu chvíli — mezitím demo site collection App Catalogu.

## Go/no-go — otestovat před během

- **Upgrade 1.0.0.0 → 1.1.0.0 s `ApplyElementManifests` pro `CustomAction`** — dokumentace
  ukazuje upgrade actions na příkladu seznamu (`ListInstance`); s `CustomAction` **neověřeno na
  tenantu**. Den předem projít celý lab na testovacím webu. Pokud upgrade `CustomAction`
  nedoplní, platí fallback: odebrat a znovu přidat aplikaci.
- Popisky v App Catalogu (*Replace*, *Enable*) a *Details* → *GET IT* v aktuálním UI.
- Demo site collection katalogu: `Add-SPOSiteCollectionAppCatalog -Site <url>` vyžaduje
  SharePoint Online Management Shell a admina, který je zároveň správcem tenantového katalogu
  i cílového webu. Připravit den předem na lektorském webu.

## Tripwires

- **GUID feature vs. GUID řešení** — `upgrade-actions` potřebuje GUID **feature**, ne
  `solution.id`. Nejčastější chyba bloku.
- **Zvýšená jen verze řešení** — katalog ukáže novou verzi, ale upgrade actions se nespustí.
- **Odebrání aplikace z webu** jako „rychlé řešení" — funguje, ale web party na stránkách
  ukážou chybu, dokud se aplikace nevrátí. Na produkci nepoužitelné.
- **Text banneru „natvrdo" v `elements.xml`** — změna oznámení = nové nasazení. Pro provoz by
  se `ClientSideComponentProperties` měnily skriptem (PnP PowerShell) — téma pro pátek,
  hardening.

## Vazby

- Zpět: `permissions-consent` (první nasazení 1.0.0.0), `extensions` (`elements.xml`).
- Dopředu: `ci-cd-quality` (`.sppkg` jako artefakt pipeline), `capstone` (nasazené řešení).
