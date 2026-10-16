# Den 1 — Platforma, nástroje, první web part

Z holého stroje k vlastnímu web partu na vlastním webu v jednom dni. Večer má každý student
nainstalovaný toolchain SPFx 1.23.2, řešení `vltava-portal-<ini>` a web part Rozcestník
běžící na testovací stránce svého webu.

| Pořadí | Blok | Slug | Typ | min |
|---|---|---|---|---|
| 1 | SPFx v Microsoft 365 — pozice, hranice tenantu | [`platform-positioning`](platform-positioning/) | P | 45 |
| 2 | Vývojové prostředí od nuly | [`dev-environment`](dev-environment/) | P | 105 |
| 3 | Anatomie projektu | [`project-anatomy`](project-anatomy/) | P | 60 |
| 4 | První web part — workbench a moderní stránka | [`first-webpart`](first-webpart/) | P | 90 |

Celkem **300 min**.

> [!IMPORTANT] Ráno před prvním blokem
> Lektor rozdá účty `jmeno.prijmeni@cloudedu.cz`, dočasná hesla a adresu SharePointu tenantu.
> Studenti potřebují **telefon s Microsoft Authenticatorem** — MFA je na tenantu povinné.

## Kompresní ventily

Škrtá se odshora:

1. Historie v `platform-positioning` jen jako tabulka zlomů bez komentáře (−10).
2. V `project-anatomy` kroky 6–7 labu (pohled do `.sppkg`, ověření bez gulp) jako demo
   lektora (−10).
3. V `first-webpart` kroky 6 a 8 labu (styl, reaktivní property pane) vynechat (−10);
   ladění ve VS Code jen zmínkou (−5).

**Nekrátit** `dev-environment` — bez funkčního prostředí neběží zbytek týdne. **Nekrátit**
krok 9–10 v `first-webpart` — moderní stránka je jediná cesta, jak ve čtvrtek testovat
extensions.

> [!NOTE] Proč instalace zabírá třetinu dne
> Na učebních strojích je jen VS Code a PowerShell 7. Instalace je proto obsah, ne předehra —
> student, který si jednou prošel fnm, přesnou verzi generátoru a proměnnou
> `SPFX_SERVE_TENANT_DOMAIN`, si doma prostředí postaví sám. `npm install` projektu běží
> v bloku 3 **souběžně** s výkladem mapy projektu. Den končí důkazem, že kód běží jen
> z lokálního stroje — nasazení do tenantu přijde ve středu.
