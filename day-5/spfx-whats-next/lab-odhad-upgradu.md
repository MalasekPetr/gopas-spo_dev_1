# Lab · Odhad upgradu na SPFx 1.24

> Modul: `spfx-whats-next` · Odhad: 15 min · Režim: návrh, ve dvojicích
> Tenant: — · Scénář: [`../../scenario-vltava-portal.md`](../../scenario-vltava-portal.md)

## Cíl

Seznam konkrétních míst ve **vlastním** řešení, která by změnil přechod na SPFx 1.24,
s odhadem v hodinách — jako položka backlogu pro capstone.

**Jak lab číst:** každý krok končí **Checkpointem** — nesedí-li, nepokračuj.

## Předpoklady

- Vlastní řešení `vltava-portal-<ini>` a tabulka „Co by upgrade udělal" z README.

## Kroky

### 1. Najdi místa, která se změní

```powershell
Get-ChildItem .\src -Recurse -Include *.ts, *.tsx |
    Select-String -Pattern 'ReactDom\.|unmountComponentAtNode|getId\(' |
    Select-Object Filename, LineNumber, Line
```

**Checkpoint:** máš seznam souborů a řádků (referenční řešení: `render()` a `onDispose()`
tří web partů, `getId` v Rozcestníku).

### 2. Odhadni a zapiš

Do backlogu (soubor `BACKLOG.md` v projektu) zapiš položku *Upgrade na SPFx 1.24* se
seznamem míst z kroku 1, odhadem v hodinách a tím, co je potřeba ověřit (velikost balíčku,
testy, nasazení).

**Checkpoint:** položka má odhad a aspoň jedno „ověřit měřením".

**Checkpoint (negativní):** v projektu **není** nainstalovaná žádná verze `1.24.0-rc` —
`npm ls @microsoft/sp-core-library` ukazuje 1.23.2.

## Ověření

- [ ] Seznam míst ke změně z vlastního kódu.
- [ ] Položka backlogu s odhadem a ověřením.
- [ ] **Negativní:** řešení zůstalo na 1.23.2.

## Fallback

- **Při časové tísni:** jen krok 1 a odhad nahlas.

## Zdroje (Microsoft)

- [SharePoint Framework roadmap](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/roadmap)
