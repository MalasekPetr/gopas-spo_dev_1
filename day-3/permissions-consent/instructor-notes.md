# Instructor notes — API oprávnění, admin consent a fallback

## Timing

- ~20 min výklad + 50 min lab + 5 min diskuze (kroky 4 a 9).
- Schválení (krok 6) dělat **jednou pro celou třídu**, až má žádost aspoň polovina studentů.
  Pak počkat — token se obnoví se zpožděním.

## Go/no-go — otestovat před během

- Tenantový App Catalog existuje a studentské účty do něj smí nahrávat (Global Administrator).
- **Identity řešení před prvním nasazením:** ráno spustit `scripts/Find-CatalogCollisions.ps1`
  (po prvních nahráních znovu). Každý balíček musí mít stav `OK`; `TEMPLATE` nebo `NO-SUFFIX`
  = student nespustil `Set-StudentIdentity.ps1` — opravit dřív, než nahraje druhý student.
- **API access je čisté**: žádné schválené `User.Read.All` ani `Presence.Read.All` z dřívějška.
  Jinak fallback v kroku 8 nenastane. *Remove access* den předem.
- Popisky v dialogu nahrání (*Only enable this app* / *Enable this app and add it to all sites*)
  a cesta k API access v aktuálním admin centru — **neověřeno**, upravit lab podle reality.
- Měření z `data-access-clients` (co vidí Graph bez schválení) zapsané.

## Tripwires

- **Duplicitní žádosti** — každý student nahraje vlastní `.sppkg`, takže API access ukáže
  stejné scope mnohokrát. Schválit `User.Read.All` **jednou**; další žádosti o už schválený
  scope skončí podle dokumentace chybou — nechat je ležet, nezamítat.
- **Student schválí sám** — je Global Administrator. Pokud se to stane u `Presence.Read.All`,
  fallback přestane fungovat všem. Okamžitě *Remove access* a vysvětlit proč.
- **Student zamítne (*Reject*) žádost** — podle dokumentace žádost zmizí ze stránky a pro
  nový pokus je nutné balíček nahrát znovu. Jak se zamítnutí projeví na duplicitních žádostech
  ostatních studentů, je **neověřeno** — nezamítat nic.
- **Nasazení na všechny weby** — web party všech studentů se objeví v toolboxu všem. Neškodné,
  ale matoucí; proto iniciály v názvech.
- **Stará verze v katalogu** — po úpravě kódu je nutné balíček znovu nahrát (verze se řeší
  zítra v `packaging-deployment`).
- **„Funguje mi to na workbenchi i bez schválení"** — podle měření z `data-access-clients`;
  vysvětlit, že výchozí scope Graphu není totéž co explicitní schválení a může se změnit.

## Vazby

- Zpět: `data-access-clients` (Graph, měření), `project-anatomy` (`solution.id`).
- Dopředu: `packaging-deployment` (verze, upgrade, site catalog), `diagnostics-hardening`
  (co smí opustit tenant), úklid po kurzu (odvolat oprávnění).
