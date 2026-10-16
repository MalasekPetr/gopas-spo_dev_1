# Instructor notes — React a Fluent UI

## Timing

- ~35 min výklad + 80 min lab + 5 min shrnutí dne.
- Výklad struktury (`src/models` · `utils` · `hooks`) a pravidla „komponenta nesahá na
  `this.context`" chránit — středa na tom staví tři web party.
- Krok 9 (měření) **nekrátit**: číslo 206 511 B je vstup do středečního `bundle-baseline`.

## Go/no-go — otestovat před během

- Referenční řešení sestavené 2026-10-16: build 12 s, bundle 206 511 B. Po změně verze SPFx
  nebo `@fluentui/react` znovu změřit a přepsat čísla v README a `mereni-bundle-fluent.md`.
- Krok 7: ověřit na kurzovním tenantu, že *Section background* je v editoru sekce dostupné
  a Rozcestník barvy převezme. **Neověřeno na tenantu.**
- Krok 6: ikony Fluent UI (`iconName="Link"`) se na stránce zobrazí — **neověřeno na tenantu**.

## Tripwires

- **„Importuj z `lib/…`, bude to menší"** — rada z internetu; změřeno, nepomůže
  (206 532 B vs. 206 511 B). Nechat studenty vyzkoušet, pokud se ptají.
- **Fluent UI v9** — někdo ji najde v dokumentaci Fluentu a chce ji. Dokumentace SPFx doporučuje
  verzi z generátoru (v8). Dvě verze Fluentu v jednom balíčku = dvojí runtime.
- **`useId` neexistuje** — React 17. Proto `getId`.
- **Komponenta volá `this.context`** — studenti z třídních komponent to přenesou. Komponenta
  nemá `this`; všechno přes props.
- **Motiv celého webu vs. sekce** — *Change the look* mění motiv pro všechny na webu; na vlastním
  webu OK, ale studenti to zkusí na cizím. Připomenout tenantovou disciplínu.

## Vazby

- Zpět: `property-pane` (`src/models`, `src/utils`), `localization` (`cs-cz.js`).
- Dopředu: `data-access-clients` (další web party do stejné struktury), `bundle-baseline`
  (206 511 B), `performance-caching` (lazy loading Fluent UI), `diagnostics-hardening`
  (error boundary kolem komponenty), `spfx-whats-next` (React 18).
