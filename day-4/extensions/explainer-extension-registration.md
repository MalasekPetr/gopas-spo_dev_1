# Registrace extensions — jak se kód dostane na stránku

Deep-dive k [`README.md`](README.md). Kód extension v App Catalogu nestačí: stránka ho načte,
jen když na něj ukazuje registrace s `ClientSideComponentId` (ID z manifestu komponenty).
Tenhle text popisuje čtyři cesty registrace, jejich rozsah a typické chyby.

## 1. Feature framework: `elements.xml`

Řešení `vltava-portal` registruje obě extensions v `sharepoint/assets/elements.xml`:

```xml
<CustomAction
    Title="PortalBanner"
    Location="ClientSideExtension.ApplicationCustomizer"
    ClientSideComponentId="<component-id>"
    ClientSideComponentProperties="{&quot;message&quot;:&quot;...&quot;,&quot;level&quot;:&quot;warning&quot;}">
</CustomAction>
<CustomAction
    Title="IssueEquipment"
    RegistrationId="100"
    RegistrationType="List"
    Location="ClientSideExtension.ListViewCommandSet"
    ClientSideComponentId="<component-id>">
</CustomAction>
```

- `CustomAction` se vytvoří ve chvíli, kdy se **aplikace přidá na web** (feature se aktivuje).
- `ClientSideComponentProperties` je JSON zakódovaný do XML atributu; SharePoint ho
  deserializuje do `this.properties` extension.
- Application Customizer lze přes Feature XML registrovat **jen na úrovni webu nebo seznamu**;
  širší aktivace jde přes tenant-wide deployment nebo `UserCustomAction` na objektu `Site`
  ([Use page placeholders](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions)).
- `RegistrationId="100"` váže Command Set na seznamy, `101` na knihovny dokumentů; pro obojí
  jsou potřeba dvě `CustomAction`
  ([Build your first ListView Command Set](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api)).

**Typická chyba:** druhá extension přidaná generátorem do existujícího projektu se do
`elements.xml` nezapíše (viz instructor notes) — build projde, nasazení projde, příkaz nikde.
Kontrola: v `elements.xml` musí být tolik `CustomAction`, kolik má řešení extensions.

**Upgrade:** na webu, kde už feature běží, se nové `CustomAction` neobjeví samy — to řeší
upgrade actions v [`../packaging-deployment/`](../packaging-deployment/).

## 2. Tenant-wide: `ClientSideInstance.xml` a seznam *Tenant Wide Extensions*

Zdroj celé sekce: [Tenant Wide Deployment of SharePoint Framework Extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/basics/tenant-wide-deployment-extensions).

- Podporováno pro **Application Customizer a ListView Command Set** (ne Field Customizer).
- Site collection tenantového App Catalogu obsahuje seznam **Tenant Wide Extensions**.
  Každá položka = jedna aktivace; záznamy se vyhodnocují **za běhu** při vykreslení stránky,
  takže platí pro existující i nové weby.
- Sloupce seznamu: *Title*, *Component Id*, *Component Properties*, *Web Template*
  (např. `GROUP#0`, `SITEPAGEPUBLISHING#0`, `STS#3`), *List template* (`100`, `101`),
  *Location*, *Sequence*, *Host Properties* (např. předalokovaná výška placeholderu),
  *Disabled*.
- `ClientSideInstance.xml` s elementem `ClientSideComponentInstance` přidá položku do seznamu
  automaticky — **jen** když má řešení `skipFeatureDeployment: true` a správce při nasazení
  zaškrtne zpřístupnění na všech webech.
- Po prvním záznamu v seznamu může trvat **až 20 minut**, než funkce začne fungovat; obsah
  seznamu se cachuje.
- Při **aktualizaci** balíčku s extensions může opětovné zaškrtnutí volby „na všechny weby"
  vytvořit **duplicitní záznamy** v seznamu
  ([Tenant-scoped solution deployment](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/tenant-scoped-deployment)).

**Proč ne v kurzu:** studenti jsou Global Administrator na jednom tenantu. Jedno zaškrtnutí
v dialogu nasazení dá banner jednoho studenta na weby všech. Řešení proto
`ClientSideInstance.xml` nemá.

## 3. Skript: `Add-PnPCustomAction`

Stejný `CustomAction` jako v `elements.xml` jde vytvořit skriptem. Parametry podle
[Add-PnPCustomAction](https://pnp.github.io/powershell/cmdlets/Add-PnPCustomAction.html):
`-ClientSideComponentId`, `-ClientSideComponentProperties`, `-ClientSideHostProperties`,
`-Location`, `-Name`, `-Title`, `-Scope` (`Web` nebo `Site`), `-RegistrationId`,
`-RegistrationType`, `-Sequence`. Dokumentace cmdletu uvádí, že řešení musí být nasazené
a aplikace nainstalovaná na webu (`Install-PnPApp`).

```powershell
# Illustration only -- in the course the banner is registered by elements.xml.
Connect-PnPOnline -Url "https://<tenant>.sharepoint.com/sites/spodev-<ini>" `
    -ClientId <client-id> -Interactive
Add-PnPCustomAction -Name 'PortalBanner' -Title 'PortalBanner' `
    -Location 'ClientSideExtension.ApplicationCustomizer' `
    -ClientSideComponentId '<component-id>' `
    -ClientSideComponentProperties '{"message":"Planned maintenance.","level":"warning"}' `
    -Scope Web
```

Kdy dává smysl: změna textu oznámení bez nového balíčku (vlastnosti jsou v `CustomAction`,
ne v kódu), nebo aktivace na celé site collection (`-Scope Site`), kterou Feature XML pro
Application Customizer neumí.

**Typická chyba:** skript i `elements.xml` registrují stejnou extension na stejném webu →
dva `CustomAction` se stejným `ClientSideComponentId`. Očekávaný symptom jsou dva bannery
(na kurzovním tenantu **neověřeno**).

## 4. Ladění: `customActions` v URL

Ladicí adresa nic neregistruje, jen **simuluje** `CustomAction`
([Debug SPFx solutions on modern pages](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/debug-modern-pages)):

- `loadSPFX=true` — načte SharePoint Framework i na stránce, kde žádná extension
  registrovaná není (jinak se z výkonových důvodů nenačítá).
- `debugManifestsFile=https://localhost:4321/temp/build/manifests.js` — loader hledá
  komponenty i na `localhost`, nejen v App Catalogu.
- `customActions={...}` — simulovaný `CustomAction`: klíč je ID extension, dál `location`
  a `properties`.

Povolené ladicí skripty platí po zbytek relace prohlížeče; vypnout je jde parametrem
`reset=true` (tamtéž). Postup je v labu, krok 6.

## Field Customizer: registrace na poli

Field Customizer nemá `CustomAction`. Váže se na **pole**: vlastnosti `ClientSideComponentId`
a `ClientSideComponentProperties` objektu `SPField` na úrovni webu nebo seznamu — přes
`<Field ... ClientSideComponentId="...">` v `elements.xml`, REST/CSOM nebo `Set-PnPField`
([Build your first Field Customizer](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-field-customizer)).

## Jak poznat, která registrace platí

| Symptom | Pravděpodobná příčina |
|---|---|
| Extension běží jen s ladicí URL | chybí registrace (`elements.xml` bez `CustomAction`, aplikace nepřidaná na web) |
| Banner dvakrát | dvě registrace: `elements.xml` + skript, nebo duplicitní záznam v *Tenant Wide Extensions* |
| Příkaz v seznamu ano, v knihovně ne | `RegistrationId="100"` bez druhé `CustomAction` s `101` |
| Banner na webech, kde ho nikdo nepřidal | záznam v *Tenant Wide Extensions* (zaškrtnuté „na všechny weby") |
| Nová extension po upgradu chybí | feature už běžela; chybí upgrade action `ApplyElementManifests` |
