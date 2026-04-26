# Snipper — Release checklist

Stav: rozpracováno. Tento soubor lze po publikaci smazat.

## 🔴 Blokátory release

### Code & repo cleanup
- [ ] Smazat `icons/proposal-*` (24 souborů — návrhy ikon)
- [ ] Smazat `icons/render-proposals.mjs`
- [ ] Smazat `icons/icon-1-viewfinder*.svg` (prototyp)
- [ ] Smazat (nebo přesunout mimo repo) `PLAN_FEATURES.md`, `PLAN_OCR_PREKLAD.md`
- [ ] Vybrat finální verzi `icons/icon-{16,32,48,128}.png` a ověřit, že jsou produkční (ne placeholder)
- [x] Ověřit licenci `lib/qrcode.js` (MIT, Kazuhiko Arase 2009 — header v souboru, uveden i v `LICENSE`)

### Funkční test produkčního buildu
- [ ] `npm run package` → dostane `release/snipper-1.0.0.zip`
- [ ] V Chromu `chrome://extensions/` → Developer mode → Load unpacked → vybrat rozbalený obsah ZIPu
- [ ] Otestovat:
  - [ ] Popup: pipeta, full page snímek, historie
  - [ ] Shift + tažení myší = výřez (na běžné https stránce)
  - [ ] Shift + tažení na stránce s iframe
  - [ ] Anotace (kreslení do screenshotu)
  - [ ] Kopírování do schránky funguje
  - [ ] Historie se ukládá a otevírá
  - [ ] QR generátor
- [ ] Ověřit, že po `drop console` v prod buildu se nikde neztratil error handling
- [ ] Service worker — v `chrome://extensions/` kliknout na "service worker" a zkontrolovat console (žádné errory při startu)

### Privacy & Web Store kompliance
- [ ] **Privacy Policy** — viz [PRIVACY.md](PRIVACY.md), zhostit veřejně (entyai.cz nebo GitHub Pages) a vložit URL do dashboardu
- [ ] **Single Purpose justification** v dashboardu: *"Snímání a anotace screenshotů z webových stránek s lokální historií"*
- [ ] **Permission justification** v dashboardu:
  - `activeTab`: spuštění content scriptu po kliku na popup tlačítko
  - `<all_urls>` host: content_script se musí injektovat na libovolné stránce, kterou si uživatel snímá
  - `storage`: ukládání nastavení (např. QR strip tracking)
  - `clipboardWrite`: kopírování PNG snímku / hex barvy do schránky
- [ ] **Data usage disclosure** v dashboardu: zaškrtnout *"Does not collect / transmit any user data"* (ověřit, že je to skutečně tak)

### Promo materiály do Web Store
- [ ] Screenshoty 1280×800 (3–5 ks): popup, drag-select, anotace, historie, full-page
- [ ] Small promo tile 440×280 (povinné)
- [ ] Marquee 1400×560 (volitelné)
- [ ] Detailní popis (~500–1500 znaků) — česky; pokud cílíš mezinárodně, i anglicky

## 🟡 Doporučené (před releasem, ale neblokující)

- [x] Doplnit `manifest.json`:
  - `"author": "Jirka Enty"`
  - `"homepage_url": "https://entyai.cz"`
- [x] `LICENSE` soubor v repu (MIT je nejjednodušší)
- [ ] `README.md` s popisem, screenshoty, odkazem na privacy policy
- [ ] Vytvořit veřejný GitHub repo (zvyšuje důvěryhodnost při review)

## 🟢 Po publikaci / nice-to-have

- [ ] `default_locale` + `_locales/cs/messages.json` + `_locales/en/messages.json` pro mezinárodní listing
- [ ] Pravidelně sledovat reviews a crash reporty v Chrome Web Store dashboardu

## Účet & poplatek

- [ ] Chrome Web Store Developer účet: jednorázový **$5 poplatek**
- [ ] Verifikace emailu (může trvat ~den)
- [ ] První publikace jako **Unlisted** → otestovat → přepnout na Public
