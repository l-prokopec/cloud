# Daily Quest

Moderní responzivní habit tracker, který funguje kompletně v prohlížeči. Umožňuje plánovat denní a týdenní návyky, sledovat splnění, streaky a dlouhodobé statistiky. Nevyžaduje účet, backend ani externí databázi.

Produkce: [https://l-prokopec.github.io/cloud/](https://l-prokopec.github.io/cloud/)

## Funkce

- denní cíle, cíl Xkrát týdně a konkrétní dny v týdnu,
- vytvoření, úprava, archivace, obnovení a smazání habitu,
- dnešní plán s možností splnění a vrácení akce,
- aktuální a nejlepší streak,
- týdenní graf a měsíční kalendář,
- statistiky splnění a úspěšnosti,
- automatická demo data při prvním spuštění,
- světlý a tmavý režim,
- lokální ukládání dat v `localStorage`.

## Technologie

- React 18
- TypeScript
- Vite
- Vitest + jsdom
- ESLint
- Lucide React

## Lokální vývoj

Požadavky: Node.js 22+ a npm.

```bash
npm install
npm run dev
```

Vite vypíše adresu lokálního vývojového serveru. Data aplikace jsou uložená pod klíčem `daily-quest:data:v1` v `localStorage` aktuálního prohlížeče.

## Kontroly kvality

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Testy pokrývají denní i týdenní streaky, výpočet statistik, archivaci a načtení/uložení dat.

## Struktura

```text
src/
  components/       UI komponenty a jednotlivé pohledy
  hooks/            stav aplikace a mutace dat
  lib/              čistá business logika, datumy a persistence
  test/             nastavení testovacího prostředí
  App.tsx            navigace, téma a skládání pohledů
  types.ts           doménové typy
```

## Deployment

Workflow `.github/workflows/deploy.yml` při každém pushi do větve `master`:

1. nainstaluje závislosti,
2. spustí lint, testy a TypeScript kontrolu,
3. vytvoří produkční build,
4. nahraje obsah `dist/` na GitHub Pages.

`vite.config.ts` používá `base: '/cloud/'`, aby assety fungovaly na projektové Pages URL. V nastavení repozitáře musí být jako zdroj Pages zvoleno **GitHub Actions**.

## Soukromí a omezení

Veškerá data zůstávají v konkrétním prohlížeči a mezi zařízeními se nesynchronizují. Vymazání dat webu nebo úložiště prohlížeče odstraní také historii habitů.
