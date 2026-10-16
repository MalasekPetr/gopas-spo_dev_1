# Konvence

Závazná pravidla pro psaní materiálů SPO_DEV_1. Cíl: konzistence napříč moduly a snadná
údržba (malé soubory = malé diffy).

## Jazyk

- **Obsah**: čeština. Nikdy azbuka — ani v komentářích kódu.
- **Cesty a názvy souborů/složek**: angličtina, `kebab-case`.
- **Kód** (TypeScript, PowerShell, JSON): identifikátory anglicky podle konvence jazyka.
  Komentáře v kódu `solution/` anglicky — kód si student odnáší do projektů, kde se česky
  nepíše. Texty pro uživatele (lokalizační soubory) česky i anglicky.

## Struktura modulu

Jeden modul = jedna složka. Slug složky, ne pořadové číslo. Volitelné moduly mají prefix `opt-`.

| Soubor | Účel | Publikum |
|---|---|---|
| `README.md` | výklad modulu | student |
| `lab-*.md` | zadání labu | student |
| `instructor-notes.md` | timing, go/no-go, tripwires | jen lektor |
| `solution/<projekt>/` | stav řešení **po** labu — kompletní SPFx projekt bez `node_modules` | student |

Další soubory podle potřeby (bez šablony, konzistentní pojmenování):

| Prefix | Účel |
|---|---|
| `explainer-<téma>.md` | deep-dive na jeden mechanismus, odkazovaný z README |
| `comparison-<téma>.md` | srovnávací tabulka + rozhodovací osa |
| `guide-<téma>.md` | krok-za-krokem návod (referenční postup) |
| `demo-<téma>.md` | instruktorské demo bez studentského labu |
| `mereni-<téma>.md` | surová naměřená data + návod na reprodukci |
| `reseni-<lab>.md` | referenční řešení návrhového labu (kde není `solution/`) |
| `troubleshooting-<téma>.md` | známé chyby a jejich řešení |

Pořadí modulů v běhu drží **`agenda.md`** — je to jediný zdroj pravdy o pořadí. Změna pořadí =
úprava `agenda.md`, ne přejmenování složek.

## Odkazování mezi moduly

- H1 nadpis modulu je jen `# <Název>` — **žádná pořadová čísla** v nadpisech ani v textu.
- Křížové odkazy mezi moduly vždy **slugem jako relativní odkaz na složku**:

  ```md
  jiný modul ve stejném dni:  [`../project-anatomy/`](../project-anatomy/)
  modul v jiném dni:          [`../../day-5/capstone/`](../../day-5/capstone/)
  soubor v kořeni:            [`../../environment.md`](../../environment.md)
  ```

- V instruktorských poznámkách (sekce Vazby) stačí backtick slug bez odkazu.
- Externí odkazy jsou **primárně Microsoft Learn**. Stálé vyhlášené výjimky — jen tam, kde
  Learn referenci nemá, a jen pro **syntaxi a použití nástroje**, nikdy pro produktové tvrzení
  o SharePointu:

  | Doména | Pro co |
  |---|---|
  | `pnp.github.io` | PnPjs, CLI for Microsoft 365, PnP PowerShell — reference API a příkazů |
  | `heft.rushstack.io` | konfigurace Heftu a rigů nad rámec Learn |
  | `nodejs.org` | LTS harmonogram Node.js |
  | `github.com/Schniz/fnm` | instalace a příkazy fnm |
  | `react.dev`, `react.fluentui.dev`, `developer.microsoft.com/fluentui` | React a Fluent UI API |

- Po každém hromadném zásahu ověřit odkazy **skriptem, ne odhadem**
  (`./scripts/Test-RepoIntegrity.ps1`).

## Markdown styl

- Nadpisy `##` / `###`, žádné přeskoky úrovní.
- Krátké odstavce, odrážky pro výčty.
- Názvy produktů, nástrojů a pojmů vždy proti [`GLOSSARY.md`](./GLOSSARY.md).
- Číslované seznamy číslovat **skutečně** (`1.`, `2.`, `3.`).

## Mermaid

- Diagramy jako fenced bloky ` ```mermaid ` přímo v `.md`. GitHub je renderuje nativně.
- **Výchozí motiv** (bez `%%{init}%%`).
- V popiscích uzlů **jen ASCII** — diakritika v Mermaidu je nespolehlivá.

## Nic netvrdit bez měření

Nejdůležitější pravidlo repa. Každé netriviální tvrzení je buď **ověřitelné z dokumentace
s odkazem**, nebo **změřené s datem**. Ne „Heft je rychlejší", ale „produkční build
`vltava-portal` <datum> na <stroj>: <N> s" — s odkazem na soubor `mereni-*.md`.

```md
> [!IMPORTANT] <Pointa jako tvrzení, ne štítek> — změřeno (RRRR-MM-DD)
> <čísla / tabulka / kde a na čem se měřilo>
>
> **<Přenositelné pravidlo, jedna věta.>**
```

Tři pravidla:

1. **Číslo bez data a bez stroje neexistuje.** U vývojářských měření (instalace, build,
   velikost balíčku) vždy uvést, **kde** se měřilo — lektorský stroj s teplou cache je jiné
   číslo než učebna se studenou cache.
2. **Nedopisovat vzorové výstupy.** Když měření neproběhlo, je v repu prázdné místo s datem
   a otevřenou otázkou — ne vymyšlené číslo ani „typický" výpis konzole.
3. **Co nevíš, napiš jako otevřenou otázku.** V labu i v instructor notes.

## Currency-markery

Verze SPFx, Node.js, React, stavy preview a retirement data se mění po týdnech:

```md
> [!WARNING] Ověřit k datu běhu — stav k <RRRR-MM>.
> Verze balíčku / preview stav / retirement datum / název v UI.
```

Přejmenování:

```md
> [!IMPORTANT] Názvosloví
> <starý název> → <aktuální název>. V UI / dokumentaci se může objevit staré jméno.
```

## Delta sekce

Každý modul má na konci:

```md
## Stav produktu / delta

> [!WARNING] Ověřit k datu běhu — stav k <RRRR-MM>.
> <co ověřit: verze SPFx, chování toolchainu, název v UI>
```

Modul bez této sekce je nedokončený. Kontroluje to `Test-RepoIntegrity.ps1`.

## Sdílený tenant — tenantová disciplína

Celý kurz běží na **jednom** tenantu `cloudedu.cz` a **každý student je Global Administrator**
(viz [`environment.md`](./environment.md)). To je pohodlné a zároveň nejdražší riziko kurzu:
jedna chybně zacílená akce mění prostředí všem.

- **Každý modul má v meta-bloku tenant a režim** (`hands-on, vlastní web` / `hands-on, celý
  tenant` / `instruktorské demo`).
- **Student pracuje jen na svém webu** `/sites/spodev-<iniciály>` a se svým řešením
  `vltava-portal-<iniciály>`. Cokoli tenantového (tenantový App Catalog, schválení API
  oprávnění, nastavení tenantu) je v labu **explicitní krok s upozorněním**, ne vedlejší efekt.
- **Každý lab, který sahá na tenant, má negativní checkpoint**: na cizím webu ani v cizím
  řešení se nic nezměnilo.
- **Oddělený profil prohlížeče** pro kurzovní účet. Global Administrator ve špatném okně
  prohlížeče je reálný dopad, ne zmatek.

## Instructor notes

`instructor-notes.md` v každém modulu, **do 60 řádků**, tři povinné sekce:

- **Timing** — kolik minut, jak se to rozpadá, co se krátí první.
- **Go/no-go** — co ověřit *před* během. Konkrétně, ne „připravit prostředí".
- **Tripwires** — kde to studentům spolehlivě ujede a co s tím.

Volitelně `## Vazby` (Zpět / Dopředu). Nepatří sem navigace, dlouhá řešení ani historie
přestavby kurzu.

## Laby

- Meta-blok má vždy `Modul:` / `Odhad:` / `Režim:` / `Tenant:`.
- Každý krok končí **`**Checkpoint:**`** — konkrétní stav, který lektor ověří pohledem
  (výstup příkazu, co je vidět na stránce), ne dojem studenta. Aspoň jeden checkpoint v labu
  je **negativní**.
- Sekce `## Ověření` na konci je agregát checkpointů jako `- [ ]` checkboxy.
- Sekce `## Fallback` je povinná: co dělat, když krok selže, a varianta pro časovou tíseň.
- Kódový lab má `solution/` se stavem **po** labu. Kdo nestihne, navazuje ze `solution/`
  (postup v [`scenario-vltava-portal.md`](./scenario-vltava-portal.md)).

## Kód

- **TypeScript v `solution/`** se drží výstupu generátoru SPFx (stejná verze jako v
  [`environment.md`](./environment.md)) a ESLint profilu, který generátor nasadí. Build
  `npm run build` musí projít **bez chyb** — ověřuje se před commitem, ne ve třídě.
- **Žádné tenant ID, ClientId, URL kurzovního tenantu ani hesla natvrdo.** Hosted workbench
  a testovací stránky přes `{tenantDomain}` a proměnnou `SPFX_SERVE_TENANT_DOMAIN`.
- **Reálná data do labů nepatří.** Fiktivní firma Vltava Servis, fiktivní lidé.
- Příkazy v labech jsou **PowerShell 7**, ne bash. Line continuation je backtick (`` ` ``).
- Provozní skripty: `Verb-Noun.ps1`, idempotentní, comment-based help, min. 3 `.EXAMPLE`;
  skripty, které něco mění, podporují `-WhatIf`.
- V kódových blocích a skriptech **jen ASCII**. V prozaickém textu je česká typografie v pořádku.
- Skripty psát **do souboru a spouštět**, ne inline do shellu.
