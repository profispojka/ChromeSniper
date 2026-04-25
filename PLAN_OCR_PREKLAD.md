# Plán: OCR + překlad textu uvnitř zoomnuté oblasti

## Cíl
Po zazoomování na obdélník (Shift + tah myší) rozpoznat text uvnitř výřezu,
detekovat jeho jazyk a přeložit ho do jazyka prohlížeče (`navigator.language`).
Překlad zobrazit jako overlay nad původním textem.

## Co jsou traineddata (odpověď na otázku 1)

Tesseract.js je OCR engine — jen "stroj", který neumí číst žádný jazyk sám.
Pro každý jazyk potřebuje natrénovaný model: soubor `*.traineddata`. Příklady:

| Soubor | Jazyk | Velikost |
|---|---|---|
| `eng.traineddata` | angličtina | ~10 MB |
| `ces.traineddata` | čeština | ~5 MB |
| `deu.traineddata` | němčina | ~10 MB |
| `jpn.traineddata` | japonština | ~13 MB |
| `chi_sim.traineddata` | zjednodušená čínština | ~14 MB |

Bez traineddata Tesseract neudělá nic. Možnosti distribuce:
- **Bundlovat v extenzi** — funguje offline od první sekundy, ale ZIP naroste.
- **Lazy-load do `chrome.storage`** — extenze je malá, první OCR v daném
  jazyce má jednorázový download (~5–15 MB).

## Aktuální stav (po tvých změnách)
- ✅ `captureVisibleTab` přes `background.js` + `captureRect` v content scriptu
  — vrací PNG blob z výřezu po zoomu. Tohle stačí, žádné CORS problémy.
- ✅ Dvě tlačítka: zavřít, kopírovat screenshot.
- ➕ Přibyde tlačítko **"Přeložit"** (ikona "Aa→") nebo se OCR spustí automaticky
  hned po dokončení zoom transition (rozhodneme níže).

## Pipeline

```
zoomTo() → transitionend
  → captureRect(sq.getBoundingClientRect())   // už máme, vrací PNG blob
  → tesseract OCR (multi-jazyk)               // text + bounding boxy + jazyk
  → LanguageDetector (přesnější detekce)      // potvrdí jazyk z OCR textu
  → if jazyk == navigator.language: skip
  → Translator.create(src, target).translate()
  → render overlay (řádek po řádku, dle bbox)
```

## Detekce jazyka — řešení

Tesseract potřebuje vědět seznam jazyků **předem** (`createWorker(['eng','ces',...])`).
Strategie:

1. **První průchod** s pevným multi-jazykovým modelem
   `['eng', 'ces', 'deu', 'fra', 'spa', 'ita', 'pol', 'rus', 'jpn', 'chi_sim']`
   → Tesseract zkusí všechny, vrátí text + per-word confidence + svůj odhad jazyka.
2. **Potvrzení jazyka** přes `LanguageDetector` API (Chrome 138+) — pošleme
   rozpoznaný text, vrátí `{ detectedLanguage, confidence }`. Spolehlivější než
   Tesseractův odhad zvlášť u krátkých textů.
3. **Fallback**: pokud `LanguageDetector` není dostupný → použít
   `chrome.i18n.detectLanguage(text)`.
4. Pokud detekovaný jazyk **==** `navigator.language.split('-')[0]` →
   přeskočit překlad, zobrazit toast "stejný jazyk".

Tradeoff: multi-jazyk OCR je pomalejší (~2–4 s místo 0.5–1 s) a u podobných
písem může být méně přesný. Řešitelné: po detekci jazyka **druhý průchod**
už jen v jednom správném jazyce (lepší přesnost, +1 s latence). MVP zatím
jen jeden průchod.

## Překlad
- Vestavěné `Translator` API (Chrome 138+):
  ```js
  const target = navigator.language.split('-')[0]; // 'cs', 'en', ...
  const avail = await Translator.availability({ sourceLanguage, targetLanguage: target });
  if (avail === 'unavailable') {
    showToast('Překlad pro tento jazyk není k dispozici');
    return;
  }
  const tr = await Translator.create({ sourceLanguage, targetLanguage: target });
  const out = await tr.translate(joinedText);
  ```
- `availability` může vrátit `downloadable` → model se stáhne při prvním
  použití (jednorázově, ~10–50 MB).
- Překládat **celé řádky/odstavce naráz**, ne slova jednotlivě → překlad má
  kontext. Bounding boxy překladu se mapují zpět na původní řádky.
- Žádný cloud fallback — lokální only.

## Overlay s překladem
- Pro každý **řádek** z Tesseractu (skupina words):
  - `<div>` s `position: absolute`, souřadnice z bboxu (přepočet z prostoru
    obrázku → prostor viewportu, s respektem k `devicePixelRatio` z capture).
  - Bílé pozadí s mírnou průhledností (Fáze 2: dominantní barva originálu).
  - Font-size dopočítaný z výšky bboxu, `transform: scale(...)` na fit šířky.
- **Kam připojit overlay**: aktuální fixed `overlay` má `pointer-events: none`
  vypnuté při zoomu — překlady přidám dovnitř, vedle čtverce. Souřadnice musí
  být v **viewport space** (po transformu těla), takže přepočítat:
  ```
  rect_view = sq.getBoundingClientRect()  // viewport souřadnice čtverce
  bbox_view.x = rect_view.left + bbox_img.x / dpr
  bbox_view.y = rect_view.top  + bbox_img.y / dpr
  ```

## UI
- Tlačítko **"Aa→"** (přeložit) v controls vedle Zavřít/Kopírovat.
- Při kliku spinner v rohu čtverce, pak overlay s překlady.
- Druhý klik (nebo přepínač) → toggle originál/překlad.
- Vyčistit při `closeZoom()`.

**Otázka pro tebe**: spouštět OCR **automaticky po zoomu**, nebo **až po kliku
na tlačítko**? Auto je pohodlnější, ale spotřebovává čas/CPU i když uživatel
chtěl jen zoom (např. obrázek bez textu). Doporučuju **na kliknutí**.

## Změny v souborech

| Soubor | Změna |
|---|---|
| `manifest.json` | Přidat `web_accessible_resources` pro Tesseract (worker.js, core.wasm, traineddata). Případně `permissions: ["storage"]` pro cache traineddata. |
| `content.js` | V `addControls` třetí tlačítko "přeložit". Funkce `translateRect(sq)`: capture → OCR → detect → translate → render. Cleanup v `closeZoom`. |
| `background.js` | Beze změny (capture už řeší). |
| `lib/tesseract/` *(nový)* | Lokálně přibalený `tesseract.js`, `tesseract-core.wasm`, `worker.min.js`. |
| `lib/traineddata/` | **Není** — všechna data lazy-loaded do `chrome.storage` při prvním použití. |
| `ocr.js` *(nový)* | Wrapper: jeden Tesseract worker reused, multi-language `recognize(blob)`. |
| `translate.js` *(nový)* | `detectLanguage(text)` (LanguageDetector + i18n fallback) + `translate(text, src, tgt)` přes Translator API. |

## Rozhodnuto
1. **Spouštění OCR**: ruční — tlačítko "Aa→" v controls vedle Zavřít/Kopírovat.
2. **Traineddata**: všechna lazy-loaded. ZIP extenze zůstane malý, první OCR
   v daném jazyce má jednorázový download (~5–15 MB) do `chrome.storage`,
   další volání už čtou z cache.

## Otevřené body
1. **Velmi malý text v originále**: capture je v `devicePixelRatio` rozlišení,
   takže `dpr=2` displej dává 2× pixelů. Při potřebě před OCR upscalovat 2×.
4. **Stejný jazyk jako prohlížeč**: v Chromu na české lokalizaci → překlad
   anglického textu do češtiny funguje. Ale pokud `navigator.language = 'en-US'`
   a text je anglicky, nic se nepřekládá. To je correct behavior, jen toast.

## Fáze implementace

### MVP (Fáze 1)
- Tlačítko "Aa→" v controls.
- Bundlované `eng` + `ces` traineddata.
- Multi-jazyk OCR: `['eng', 'ces']` (jen tyto dva pro MVP).
- `LanguageDetector` (s i18n fallbackem) → `Translator` → bílý overlay.
- Žádné toggle, žádné upscale.

### Fáze 2
- Přidat víc jazyků (lazy-load do storage).
- Druhý OCR průchod v detekovaném jazyce pro přesnost.
- Toggle originál/překlad.
- Dominantní barva pozadí pro lepší splynutí.

### Fáze 3
- Upscale výřezu před OCR.
- Persistence preferencí (poslední jazyky, zapnutý překlad…) v `chrome.storage`.
- UI volba zdrojového jazyka při ruční korekci špatné detekce.
