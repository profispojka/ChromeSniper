# Privacy Policy — Snipper

_Poslední aktualizace: 2026-04-26_

## TL;DR

**Snipper neukládá ani nepřenáší žádná data mimo váš prohlížeč.** Veškerá data (snímky, nastavení, historie) zůstávají lokálně ve vašem zařízení a Snipper ani jeho autor k nim nemají přístup.

---

## Co Snipper dělá

Snipper je rozšíření pro Google Chrome, které umožňuje:

- snímat výřezy a celé webové stránky,
- vybírat barvy z obrazovky (pipeta),
- vytvářet anotace nad snímky,
- generovat QR kódy z URL,
- ukládat historii snímků lokálně v prohlížeči.

## Jaká data Snipper zpracovává

| Data | Kde se ukládají | Kdy se odesílají na server |
|---|---|---|
| Snímky obrazovky (PNG) | Lokálně v IndexedDB vašeho prohlížeče | **Nikdy** |
| Nastavení (např. QR tracking) | Lokálně v `chrome.storage.local` | **Nikdy** |
| Vybrané barvy (hex) | Pouze do schránky operačního systému | **Nikdy** |
| URL aktuální záložky | Pouze v paměti během akce | **Nikdy** |

Snipper **nepoužívá** žádné analytické nástroje, telemetrii, sledování, reklamní sítě ani vzdálené servery. Všechna funkcionalita běží 100% lokálně ve vašem prohlížeči.

## Oprávnění a jejich účel

Snipper si při instalaci žádá o tato oprávnění:

- **`activeTab`** — spuštění funkcí (snímání, pipeta) na aktuálně otevřené záložce po kliknutí na popup nebo klávesovou zkratku.
- **`storage`** — uložení vašich preferencí (např. zda chcete strippovat tracking parametry z URL při generování QR).
- **`clipboardWrite`** — zkopírování pořízeného snímku nebo hex hodnoty barvy do schránky.
- **Host permission `<all_urls>`** — Snipper musí injektovat svůj content script do libovolné stránky, kterou chcete snímat. Permission **nepoužíváme** ke čtení obsahu stránek pro jakýkoliv jiný účel než vykreslení snímku, který si výslovně vyžádáte.

## Sdílení dat se třetími stranami

Žádná data nejsou sdílena se třetími stranami, protože žádná data neopouštějí váš prohlížeč.

## Cookies a tracking

Snipper nepoužívá cookies, webové majáky, fingerprinting ani jiné sledovací technologie.

## Externí knihovny

Snipper používá lokálně přibalenou knihovnu [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) (MIT) pro generování QR kódů. Knihovna běží lokálně a neprovádí žádnou síťovou komunikaci.

## Změny této politiky

Případné změny budou publikovány v této sekci a v repozitáři rozšíření. Pokračováním v užívání rozšíření po zveřejnění změn s nimi vyjadřujete souhlas.

## Kontakt

Otázky týkající se ochrany osobních údajů: **jiric@protonmail.com**

Autor: Jirka Enty / [entyai.cz](https://entyai.cz)
