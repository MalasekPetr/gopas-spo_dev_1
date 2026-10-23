# Co se stáhne, když stránka načítá komponentu SPFx

Deep-dive k [`README.md`](README.md). Cíl: umět v F12 přečíst, co stránka kvůli `vltava-portal`
stahuje, a vědět, které číslo z měření se kde projeví.

## Manifest: mapa souborů komponenty

Každá komponenta (web part, extension) má manifest. V produkčním buildu obsahuje
`loaderConfig` — kde je bundle a kde jsou jazykové soubory. Zkrácený tvar podle dokumentace
([Localize SPFx web parts](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/localize-web-parts),
sekce *Localization files in the release build*):

```json
"loaderConfig": {
  "entryModuleId": "greeting-web-part",
  "internalModuleBaseUrls": [ "https://cdn.contoso.com/" ],
  "scriptResources": {
    "greeting-web-part": {
      "type": "path",
      "path": "greeting-web-part_<hash>.js"
    },
    "GreetingWebPartStrings": {
      "defaultPath": "...strings_en-us_<hash>.js",
      "type": "localizedPath",
      "paths": {
        "en-US": "...strings_en-us_<hash>.js",
        "nl-NL": "...strings_nl-nl_<hash>.js"
      }
    }
  }
}
```

- `internalModuleBaseUrls` — odkud se soubory berou (CDN nebo knihovna v katalogu; viz
  [`../packaging-deployment/explainer-sppkg-anatomy.md`](../packaging-deployment/explainer-sppkg-anatomy.md)).
- `type: localizedPath` — SharePoint stáhne soubor pro jazyk webu; když pro něj soubor není,
  `defaultPath`. Výchozí jazyk SPFx je en-US; soubor `default.js` v `loc/` ho může nahradit.
- **Ladicí build se liší:** dokumentace popisuje, že ladicí a produkční build zacházejí
  s jazykovými soubory jinak (tamtéž, *Localization in different build types*). Čísla
  o jazykových souborech proto čti z produkčního balíčku, ne z `npm start`.

## Co je v balíčku `vltava-portal` (den 4)

Výpis `ClientSideAssets/` z `.sppkg` dne 4 (build 2026-10-16, lektorský stroj, SPFx 1.23.2;
hash v názvech zkrácen na `<hash>`):

| Komponenta | Bundle | Jazykové soubory (cs-cz / en-us) |
|---|---|---|
| `portal-web-part` | 206 519 B | 1 945 B / 1 852 B |
| `employee-directory-web-part` | 235 354 B | 593 B / 572 B |
| `equipment-web-part` | 454 270 B | 930 B / 896 B |
| `issue-equipment-command-set` | 43 212 B | 201 B / 193 B |
| `portal-banner-application-customizer` | 5 499 B | 80 B / 81 B |

Ke každému bundlu je v balíčku i `<bundle>.js.LICENSE.txt` (821 B) s licenčními
hlavičkami knihoven.

Čtení tabulky:

- Stránka s Rozcestníkem a bannerem stáhne kvůli řešení 206 519 + 5 499 B kódu plus dva malé
  jazykové soubory.
- Seznam `Equipment` s příkazem *Vydat zařízení*: 43 212 B Command Setu, plus 5 499 B
  banneru, pokud se Application Customizer načte i na stránce seznamu (na kurzovním tenantu
  **neověřeno**).
- Bundle každé komponenty nese **vlastní kopii** použitých knihoven. Dokumentace: knihovny
  třetích stran se standardně vkládají do bundlu každé komponenty a uživatel je stahuje
  opakovaně ([Optimize builds for production](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/optimize-builds-for-production)).

## Jak to ověřit v F12

1. Otevři stránku webu `spodev-<ini>` s nasazeným řešením, F12 → *Network*, zaškrtni
   *Disable cache*, F5.
2. Do filtru napiš `web-part_` a pak `Strings_`.
3. U každého souboru se podívej na doménu: s povoleným Microsoft 365 CDN jde o
   `publiccdn.sharepointonline.com`, jinak o knihovnu `ClientSideAssets` v site collection
   App Catalogu ([Host your client-side web part from Microsoft 365 CDN](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/hosting-webpart-from-office-365-cdn)).
4. Odškrtni *Disable cache* a obnov stránku znovu. Ve sloupci *Size* zjisti, které soubory
   prohlížeč tentokrát nestahoval ze sítě.

Výsledek z kurzovního tenantu sem patří s datem — zatím **neměřeno**:

| Datum | Stránka | Počet souborů řešení | Doména assetů | Z cache při 2. načtení |
|---|---|---|---|---|
| | | | | |

## HTTP cache prohlížeče: co platí a co ne

- Dokumentace: když se knihovna načítá ze stejné URL z místa optimalizovaného pro statické
  soubory, prohlížeč ji při dalších požadavcích použije z cache — i napříč komponentami
  a stránkami, pokud všechny míří na stejnou URL
  ([Optimize builds for production](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/optimize-builds-for-production)).
- To platí pro **soubory**, ne pro data. Výsledky Graphu nebo SharePoint REST řeší cache
  v kódu (`sessionCache.ts`) — viz README.
- První návštěva se tím nezrychlí. Proto se v kurzu měří velikost bundlu: ta určuje cenu
  první návštěvy a návštěvy po nasazení nové verze.
- U **vlastního** hostingu (Azure CDN) dokumentace výslovně radí nastavit na endpointu
  hlavičku `Cache-Control`, aby skripty mohl cachovat service worker SharePointu
  ([Deploy your web part to Azure CDN](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/deploy-web-part-to-cdn)).
  Jaké hlavičky posílá Public CDN nebo knihovna `ClientSideAssets` při
  `includeClientSideAssets: true`, kurz neměřil — **neověřeno**. Přečteš je v F12 →
  *Network* → *Headers*.
