# Snipper

Chrome rozšíření pro rychlé snímání webových stránek, výběr barev pipetou, anotace a lokální historii. Vše běží 100 % v prohlížeči — žádný cloud, žádná telemetrie.

![Snipper screenshot](screenshots/screenshot_1.png)

## Funkce

- **Snímek výřezu** — podržte <kbd>Shift</kbd> a tažením myší vyberte oblast. Snímek se zkopíruje do schránky a uloží do historie.
- **Snímek celé stránky** — přes tlačítko v popupu. Funguje i u dlouhých scrollovacích stránek.
- **Pipeta** — vyberte hex barvu z libovolného pixelu na stránce.
- **Anotace** — kreslete a popisujte přímo nad snímkem.
- **Historie** — všechny snímky se ukládají lokálně v IndexedDB, kdykoli se k nim vraťte.
- **QR kód** — vygenerujte QR kód z URL aktuální stránky.

## Instalace

### Z Chrome Web Store

_(odkaz bude doplněn po publikaci)_

### Vývojářská instalace

```bash
npm install
npm run build:prod
```

Pak v Chromu:

1. `chrome://extensions/`
2. Zapnout **Developer mode**
3. **Load unpacked** → vybrat root tohoto repa

### Build do release ZIPu

```bash
npm run package
```

Vytvoří `release/snipper-{version}.zip` připravený k uploadu do Chrome Web Store. Obsahuje pouze produkční soubory (žádné `.map`, žádné docs).

## Skripty

| Skript | Co dělá |
|---|---|
| `npm run build` | Vývojářský build se sourcemapami |
| `npm run watch` | Auto-rebuild při změně |
| `npm run build:prod` | Produkční build (minify, drop console, bez map) |
| `npm run package` | Produkční build + zabalí do ZIPu |
| `npm run typecheck` | TypeScript typecheck |

## Soukromí

Snipper **neukládá ani nepřenáší žádná data mimo váš prohlížeč**. Veškeré snímky a nastavení zůstávají lokálně. Žádné analytics, žádné servery, žádné sdílení s třetími stranami.

Plné znění: **[Privacy Policy](https://profispojka.github.io/ChromeSniper/PRIVACY)**

## Oprávnění

Snipper si žádá pouze nezbytné minimum:

| Oprávnění | Účel |
|---|---|
| `activeTab` | Spuštění snímání / pipety na aktuální záložce po kliknutí v popupu |
| `<all_urls>` host | Content script musí běžet na libovolné stránce, kterou chcete snímat |
| `storage` | Lokální uložení preferencí (např. zda strippovat tracking parametry z URL při generování QR) |
| `clipboardWrite` | Kopírování PNG snímku nebo hex barvy do schránky |

Snipper **nepoužívá** `tabs`, `cookies`, `history`, `webRequest` ani jiná citlivá oprávnění.

## Licence

[MIT](LICENSE)

Snipper bundlue knihovnu [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) (MIT, © 2009 Kazuhiko Arase).

## Autor

[Jirka Enty](https://entyai.cz) · [jirka@entyai.cz](mailto:jirka@entyai.cz)

---

## Chrome Web Store — listing draft

> Tato sekce je pomůcka pro vyplnění [Web Store dashboardu](https://chrome.google.com/webstore/devconsole). Lze později smazat.

### Krátký popis (do 132 znaků)

```
Snímky stránky, pipeta barev, anotace a historie. Vyber výřez tažením, upravuj a uloží se ti do schránky i historie.
```

### Detailní popis (~900 znaků)

```
Snipper je rychlý nástroj pro pořizování screenshotů přímo v prohlížeči. Žádný cloud, žádný účet, žádná telemetrie — vše zůstává lokálně.

Co Snipper umí:
• Výřez tažením myší — podržte Shift a tažením vyberte oblast. Snímek je rovnou ve schránce.
• Snímek celé stránky — i u dlouhých scrollovacích stránek.
• Pipeta — vyberte hex barvu libovolného pixelu na stránce.
• Anotace — kreslete a popisujte přímo nad snímkem.
• Lokální historie — IndexedDB ve vašem prohlížeči, žádné nahrávání nikam.
• QR kód — vygenerujte QR kód z aktuální URL.

Soukromí na prvním místě:
Snipper nesbírá ani nepřenáší žádná data. Nepoužívá analytics ani sledování. Veškerá funkčnost běží 100 % offline ve vašem prohlížeči.

Open source pod MIT licencí.
```

### Single Purpose

```
Snímání a anotace screenshotů z webových stránek s lokální historií.
```

### Permission justifications (do dashboardu)

- **`activeTab`**: Snipper potřebuje přístup k aktuální záložce, aby mohl po kliknutí na popup nebo Shift+tažení injektovat content script a pořídit snímek. Aktivuje se výhradně po user gesture.
- **`<all_urls>` host permission**: Content script se musí injektovat na libovolné stránce, kterou si uživatel chce snímat. Permission se nepoužívá ke čtení obsahu stránek pro jakýkoli jiný účel.
- **`storage`**: Lokální ukládání drobných preferencí uživatele (např. zda strippovat tracking parametry z URL při generování QR kódu).
- **`clipboardWrite`**: Kopírování pořízeného PNG snímku nebo hex hodnoty barvy do schránky operačního systému.

### Data usage (Privacy practices form)

- ✅ **Does not collect or transmit user data**
- ✅ **Does not sell user data to third parties**
- ✅ **Does not use user data for purposes unrelated to the item's single purpose**

### Kategorie

- Primary: **Productivity**
- Secondary: **Tools** (volitelné)
