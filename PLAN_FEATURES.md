# Plán: další fičury

Šest feature, které rozšíří extenzi z "zoom + screenshot" na plnohodnotný
capture nástroj. Pořadí v dokumentu = doporučené pořadí implementace
(od nejjednodušší / největší hodnoty po nejkomplexnější).

| # | Feature | Odhad | Závislosti |
|---|---|---|---|
| 1 | Color picker v zoomu | S | žádné |
| 2 | Anotace na screenshotu | M | nový canvas overlay |
| 3 | OCR text → schránka | M | Tesseract (sdílí s OCR+překlad plánem) |
| 4 | Copy as link (0x0.st upload) | S | nastavení poskytovatele |
| 5 | QR kód adresy stránky | S | malá QR knihovna |
| 6 | Full‑page screenshot | L | scroll-stitching, background changes |

---

## 1) Color picker v zoomu

### Cíl
Při zazoomovaném výřezu kliknutí (s modifikátorem, např. `Alt`) zkopíruje
hex barvu pixelu pod kurzorem do schránky a ukáže swatch v toolbaru.

### Pipeline
1. Na `zoomTo()` po dokončení transition jednou zavolat `captureRect()` →
   blob → `createImageBitmap` → vyrenderovat do skrytého canvasu v 1:1
   rozlišení výřezu (s respektem k DPR).
2. Cachovat `ImageData` toho canvasu.
3. Při `Alt+mousemove` nad `sq` číst pixel z `ImageData` v souřadnicích
   `(e.clientX − sqRect.left) * dpr, (e.clientY − sqRect.top) * dpr` →
   ukázat malý floating swatch + hex u kurzoru (debounced ~16 ms).
4. Při `Alt+click` zkopírovat hex do schránky → toast.

### Nový button
- Ikona kapátka v toolbaru, při kliku zapne "picker mode" (kurzor
  `crosshair`, hint v toolbaru "Klikni pro výběr barvy"). Druhý klik vypne.
  Alternativa k modifikátoru.

### Změny
| Soubor | Změna |
|---|---|
| `src/content.ts` | `enablePicker(sq)`, `disablePicker()`, render swatchu, hotkey `I` (jako Figma). |

### Edge cases
- Capture proběhl dřív, než toolbar vznikl → cache je hotová, picker je
  okamžitě dostupný.
- DPR ≠ 1: výpočet souřadnic už dpr respektuje (vzor podle `captureRect`).
- Pokud je výřez moc malý (<10×10), picker je nesmysl — disable.

---

## 2) Anotace na screenshotu

### Cíl
Před `Kopírovat / Sdílet` umožnit kreslit přes výřez: tah, šipka, text,
highlight, **blur/pixelace** (pro zacenzurování citlivých částí).
Výsledek se flattenuje do PNG při exportu.

### Architektura
- **Canvas overlay** uvnitř `sq` (`position: absolute; inset: 0`),
  rozměry = velikost zoomovaného `sq` v CSS pixelech, backing store v DPR.
- Stav: `Annotation[]` — discriminated union:
  ```ts
  type Annotation =
    | { kind: 'pen'; points: [number, number][]; color: string; width: number }
    | { kind: 'arrow'; from: [number, number]; to: [number, number]; color: string }
    | { kind: 'rect'; x: number; y: number; w: number; h: number; color: string; fill: 'none' | 'highlight' }
    | { kind: 'text'; x: number; y: number; text: string; color: string; size: number }
    | { kind: 'blur'; x: number; y: number; w: number; h: number; radius: number };
  ```
- Re-render canvasu při každé změně (anotací bude málo, není potřeba
  inkrementální).
- **Blur** se nekreslí na hlavní canvas — místo toho při exportu se na
  source bitmapě aplikuje `ctx.filter = 'blur(Npx)'` jen v dané oblasti
  (clipping). Pro live preview render přes `backdrop-filter` na div.

### Toolbar (rozšíření současného)
| Tool | Hotkey | Ikona |
|---|---|---|
| Šipka (default, žádný nástroj) | `V` | cursor |
| Pen | `P` | brush |
| Arrow | `A` | arrow-up-right |
| Rect | `R` | square |
| Highlight | `H` | highlighter |
| Text | `T` | type |
| Blur | `B` | droplet (off) / shield |
| Undo | `⌘Z` | corner-up-left |
| Color picker (anotace) | – | swatch (cyklí 5 barev) |

Toolbar se rozšíří o "anotační lištu" pod hlavní lištou (oddělená, aby se
nekříznily s `Kopírovat / Sdílet / Zavřít`).

### Export
`captureRect()` aktuálně dělá copy z `dataUrl` → canvas. Nově:
1. Vytvořit composite canvas o rozměrech výřezu × DPR.
2. `drawImage` source PNG (z capture).
3. Pro každou anotaci aplikovat na canvas (transformace ze
   "zoomed CSS px" → "source px": dělit `scale` z `zoomTo`).
4. `toBlob('image/png')`.

`scale` z `zoomTo` aktuálně neukládáme — uložit do `sq.dataset.scale`
nebo do closure v `addControls`.

### Změny
| Soubor | Změna |
|---|---|
| `src/content.ts` | Nový modul `annotations.ts`. `addControls` zavolá `mountAnnotationLayer(sq, scale)`. `captureRect` pojme parametr `annotations` a flattenuje. |
| `src/annotations.ts` (nový) | State, render, tool handlers, undo stack. |

### Otevřené otázky
- **Persistence anotací mezi `closeZoom`** — IMO ne, je to disposable.
- **Kopírovat originál bez anotací** — druhé tlačítko, nebo Alt+Copy.
  Default = s anotacemi.

---

## 3) OCR text → schránka

### Cíl
Tlačítko "kopírovat text" (ikona `T` nebo `Aa→` bez šipky) — OCR výřezu,
joinnutý čistý text do schránky. Bez překladu, bez overlay. Velmi rychlé
pro screenshoty kódu, IDček, error hlášek.

### Vztah k `PLAN_OCR_PREKLAD.md`
Sdílí stejnou OCR pipeline (Tesseract worker, lazy-loaded traineddata).
Tohle je **jednodušší podmnožina** — žádný Translator API, žádný overlay
s bboxy. Implementovat jako MVP **dřív než překlad**:

1. Nejdřív přidat Tesseract bundle a `ocr.ts` wrapper (recognize → text).
2. Tlačítko "T" → `ocr(blob).then(text => clipboard.writeText(text))`.
3. Až pak nadstavit překlad (z `PLAN_OCR_PREKLAD.md`) pomocí stejného
   workeru.

### UX detail
- Pre-cleanup textu: trim řádků, normalizace whitespace, zachovat
  prázdné řádky mezi odstavci. Rozhodnutí: **nedělat** detekci kódu /
  formátování — uživatel si to zformátuje sám, mi zkopírujem syrový text.
- Toast: "Text zkopírován (X znaků)".
- Pokud OCR vrátí prázdno / pod 5 znaků: toast "Žádný text nenalezen".

### Změny
| Soubor | Změna |
|---|---|
| `src/ocr.ts` (nový) | `createOcrWorker()`, `ocr(blob, langs)` → `{ text, lines }`. |
| `src/content.ts` | Tlačítko v toolbaru, hotkey `T` (po zoomu), volání `ocr` + clipboard. |
| `manifest.json` | `web_accessible_resources` pro Tesseract WASM/worker. |
| `lib/tesseract/` | Lokální bundle (jako v OCR plánu). |

### Tradeoffs
- První použití po instalaci: download ~5 MB Tesseract core + traineddata
  pro angličtinu. Zobrazit progress v toolbaru (spinner s % z
  Tesseract progress callbacku).
- Worker reuse mezi voláními — držet ho v module-level proměnné, terminovat
  po N minutách nečinnosti (memory pressure na slabých strojích).

---

## 4) Copy as link (0x0.st upload)

### Cíl
Vedle "Kopírovat" / "Sdílet" tlačítko **"Kopírovat odkaz"**. Uploadne PNG
na zvolený poskytovatel a do schránky dá URL.

### Poskytovatelé (volba v options page)
| Provider | URL | Limit | Retence | Pozn. |
|---|---|---|---|---|
| **0x0.st** | `https://0x0.st` | 512 MB | 30–365 dní (víc = déle) | default, public |
| **catbox.moe** | `https://catbox.moe/user/api.php` | 200 MB | trvalá | `reqtype=fileupload&fileToUpload=…` |
| **tmpfiles.org** | `https://tmpfiles.org/api/v1/upload` | 100 MB | 60 minut | dobré pro citlivé |

Žádné API klíče, anonymní.

### Bezpečnost a UX
- **Při prvním použití** modální dialog: "Tento screenshot bude nahrán
  veřejně na `<provider>`. Kdokoliv s odkazem ho uvidí. Pokračovat?"
  s checkbox "Příště se neptat". Persist v `chrome.storage.local`.
- Toast s URL po uploadu, click na toast otevře URL v nové záložce.
- Pokud upload selže (network / 5xx) → fallback na local download
  (jako současný `shareRect`).

### Implementace
```ts
async function uploadTo0x0(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append('file', blob, `screenshot-${Date.now()}.png`);
  fd.append('expires', '24'); // hodin, opt-in shorter retention
  const res = await fetch('https://0x0.st', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`0x0 ${res.status}`);
  return (await res.text()).trim();
}
```

### Změny
| Soubor | Změna |
|---|---|
| `src/content.ts` | Tlačítko "link" v toolbaru, dialog při prvním použití, toast. |
| `src/upload.ts` (nový) | `upload(blob, provider)` switch dispatch. |
| `src/options.ts` (nový) | Options page pro výběr provideru + retence. |
| `manifest.json` | `"options_page": "dist/options.html"`, `"storage"` permission, `host_permissions` rozšířit o `https://0x0.st/*` atd. (nebo nechat `<all_urls>` + CORS). |
| `manifest.json` (CSP) | Žádná změna — `fetch` s `FormData` z content scriptu funguje, content script má cross-origin přes host_permissions. |

### Edge cases
- 0x0.st má rate limit (cca 60 req/h per IP). Při 429 → toast s návrhem
  zkusit jiný provider.
- Některé stránky mají `Content-Security-Policy` blokující `fetch` z
  content scriptu — řešení: přesunout upload do `background.js` přes
  `chrome.runtime.sendMessage`.

---

## 5) QR kód adresy stránky

### Cíl
Tlačítko, které vygeneruje QR kód obsahující URL aktuální stránky. QR
jde **zkopírovat jako PNG** do schránky, **stáhnout** nebo zobrazit ve
velkém. Užitečné pro rychlé sdílení odkazu na mobil bez přepisování /
posílání zpráv sám sobě.

### Pipeline
1. URL ze `location.href` (z content scriptu) nebo `chrome.tabs.query`
   z popupu pro aktivní tab.
2. Generovat QR lokálně přes malou knihovnu (`qrcode-generator`, ~5 KB)
   — žádný external request, funguje offline.
3. Render do canvasu (default 256×256 px, error correction `M`).
4. UI s preview a akcemi:
   - **Kopírovat PNG** → `canvas.toBlob` → `clipboard.write([new ClipboardItem({ 'image/png': blob })])`.
   - **Stáhnout PNG** → `<a download="qr-{host}.png">`.
   - **Kopírovat URL** (textový fallback, hlavně pro `chrome://` URL).

### Vstup pro QR
- Default: `location.href` (kompletní URL včetně hashe).
- Toggle **"Bez tracking parametrů"** — vyhodit `utm_*`, `fbclid`,
  `gclid`, `mc_eid`, `ref`. Persist v `chrome.storage.sync`.
- Pro velmi dlouhé URL (>1000 znaků) zvětšit canvas a snížit error
  correction na `L`, jinak QR nejde naskenovat.

### Spuštění
| Místo | Kdy |
|---|---|
| Popup extenze | Vždy (i bez zoom módu) |
| Toolbar po zoomu | Sekundární tlačítko vedle "Sdílet" |
| Hotkey | `Q` (z popupu i ze zoomu) |
| Kontextové menu | `chrome.contextMenus` "QR kód této stránky" — bonus |

### Změny
| Soubor | Změna |
|---|---|
| `src/qr.ts` (nový) | `generateQR(text, opts)` → `HTMLCanvasElement`. Wrapper nad `qrcode-generator`. |
| `src/popup.ts` (nový, sdílen s #6) | Render QR + akce kopírovat / stáhnout. |
| `src/content.ts` | Tlačítko "QR" v toolbaru po zoomu, hotkey `Q`. |
| `lib/qrcode/` | Bundlovaná `qrcode-generator` knihovna. |
| `manifest.json` | (Pokud kontextové menu) `"contextMenus"` permission. |

### Edge cases
- `chrome://`, `chrome-extension://`, `about:` URL — QR vygeneruje,
  ale jiný prohlížeč to neotevře. Toast: "URL funguje jen v Chrome".
- `file://` — stejný problém, jen toast.
- `data:` URI nebo URL >2000 znaků — QR by byl nečitelný; zobrazit
  warning a navrhnout upload přes feature #4 (Copy as link) a teprve
  pak QR z krátké URL.
- Stránky s `Permissions-Policy: clipboard-write=()` — fallback na
  download.

### Tradeoffs
- **Lokální generování vs. externí služba** (qrserver.com / Google
  Chart API): lokální = privacy first, offline, +5 KB bundle. Volba:
  **lokální**.
- **Logo uprostřed QR** (favicon stránky): hezký detail, ale snižuje
  scan reliability na malých displejích. **Nedělat** v MVP, případně
  jako toggle ve fázi 2.
- **SVG vs. PNG** výstup: SVG je menší a ostrý při zoomu, ale
  `clipboard.write` ho nepodporuje (jen `image/png`). PNG default,
  SVG jako "Stáhnout SVG" sekundární akce.

---

## 6) Full‑page screenshot

### Cíl
Tlačítko v popup extenze (nebo hotkey) — zachytit **celou stránku**
(včetně toho, co je pod scroll fold), vrátit jeden vysoký PNG.

### Pipeline (scroll-stitching)
```
1. Změř document scroll height/width: max(scrollHeight, offsetHeight, clientHeight)
2. Spočítej tiles: ceil(totalH / viewportH) řad × ceil(totalW / viewportW) sloupců
3. Pro každou tile:
   a. window.scrollTo(x, y)
   b. await idle (rAF × 2 + ~100 ms na lazy load)
   c. chrome.tabs.captureVisibleTab() — capture jen viditelná část
   d. nakresli na velký canvas v offsetu (x*dpr, y*dpr)
4. Vrať canvas → blob → uložit / kopírovat
5. Restore původní scroll pozici
```

### Komplikace
- **`captureVisibleTab` rate limit**: max ~2 volání/s na tab. Při 4K
  stránce s 10 tiles = 5 s minimum. Throttle s `setTimeout`.
- **Sticky / fixed prvky** (header, cookie banner) se objevují v každé
  tile a vytvoří duplikované pruhy. Řešení:
  - Před capture projet všechny prvky a `position: fixed`/`sticky`
    dočasně přepnout na `absolute` + uložit původní pozici.
  - Při scroll-tile #2..N ty prvky `display: none`.
  - Po dokončení vše vrátit (`try/finally`).
- **Lazy loaded obrázky / virtualizované listy** (React-window, Twitter
  feed) — i s wait nemusí dorenderovat. Akceptovat jako limitaci, MVP
  to neřeší. Fáze 2: scroll dolů → nahoru → znovu scroll s capture.
- **DPR & devicePixelRatio**: stejně jako u `captureRect`. Velký canvas
  může narazit na limit `OffscreenCanvas` ~16384×16384. Pro extrémně
  dlouhé stránky (10000+ px) buď downscale, nebo split do víc PNG.
- **Memory**: 4K × 30000 px PNG = ~500 MB v RAM během stitchingu. Pro
  velké stránky použít `OffscreenCanvas` v service workeru.

### UX
- Spustit z **popup tlačítka** "Celá stránka" + hotkey (např. `Cmd+Shift+E`).
  Ne přes Shift-tah, ten je vyhrazen pro výběr.
- Progress overlay: "Capturing 3/10 tiles…" + možnost zrušit.
- Po dokončení: stejný toolbar jako u zoom (kopírovat / sdílet /
  upload / anotace? — anotace na 30000px PNG nedává smysl, **disable**).

### Změny
| Soubor | Změna |
|---|---|
| `src/fullpage.ts` (nový) | Hlavní logika scroll-stitchingu. |
| `src/background.ts` | Handler pro `fullPageCapture` message; throttling `captureVisibleTab`; OffscreenCanvas stitching pokud je k dispozici. |
| `src/popup.html` + `popup.ts` (nové) | Popup s tlačítkem. |
| `manifest.json` | `"action": { "default_popup": "dist/popup.html" }`, `"commands"` pro hotkey. |
| `src/content.ts` | Helper `prepareForFullCapture()` — schovat fixed prvky, vrátit cleanup callback. |

### Fáze
- **MVP**: vertikální stitching (1 sloupec), bez sticky handling, jen
  pro stránky < 16k px.
- **Fáze 2**: sticky/fixed cleanup, horizontální tiles.
- **Fáze 3**: lazy-load aware (scroll dolů a zpátky před capture).

---

## Společné změny napříč fičurami

### Toolbar refactor
Současný `addControls` v [content.ts:332](src/content.ts#L332) má hardcoded
3 tlačítka. Po přidání `pick / annotate / OCR / link` jich bude 7+. Refactor:

```ts
type ToolbarAction = {
  id: string;
  icon: string;
  label: string;
  hotkey?: string;
  group?: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: () => boolean;
};
```

`addControls(sq, actions)` → vyrenderuje group s separatory.
Hotkey handling centralizovaný (jeden `keydown` listener, mapuje na
`actions[].hotkey`).

### Settings / options page
Tři fičury chtějí nastavení:
- Upload provider (0x0 / catbox / tmpfiles)
- Default retence (pokud je relevantní)
- OCR jazyky (z `PLAN_OCR_PREKLAD.md`)
- Hotkey overrides

Centralizovat do `chrome.storage.sync` (sync mezi zařízeními) s
defaulty v `defaults.ts`.

### Telemetrie / error reporting
Aktuálně chyby jdou do `console.error` + `alert`. Pro pět nových fičur
bude bugů víc — zvážit:
- Sjednotit errory přes `showToast(msg, 'error')` (nový variant).
- Žádný external error reporting (privacy first).

---

## Pořadí implementace (návrh)

1. **Toolbar refactor** (předpoklad pro vše ostatní) — 1 den
2. **Color picker** — sám o sobě užitečný, žádné nové dependencies — 0.5 dne
3. **QR kód** — krátké, izolované, dobré jako warm-up pro popup — 0.5 dne
4. **OCR text → schránka** — odemkne i překladovou pipeline — 1–2 dny
5. **Copy as link** — krátké, ale potřebuje options page — 1 den
6. **Anotace** — největší UX hodnota, ale nejvíc kódu — 2–3 dny
7. **Full-page screenshot** — nejvíc edge cases, dělat až nakonec — 2–3 dny
8. **OCR + překlad** (z `PLAN_OCR_PREKLAD.md`) — staví na #4 — 2 dny

Celkem ~10.5–13.5 dní práce na MVP všeho.
