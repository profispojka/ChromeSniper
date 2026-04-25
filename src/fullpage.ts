(() => {
  type CaptureMessage = { type: 'captureVisibleTab' };
  type CaptureResponse =
    | { dataUrl: string; error?: undefined }
    | { dataUrl?: undefined; error: string };

  type ProgressHandle = {
    update: (current: number, total: number) => void;
    setMessage: (text: string) => void;
    onCancel: (cb: () => void) => void;
    close: () => void;
  };

  type CaptureResult = {
    blob: Blob;
    width: number;
    height: number;
    tiles: number;
    truncated: boolean;
  };

  const MAX_CANVAS_PX = 16384;
  const TILE_THROTTLE_MS = 550;
  const POST_SCROLL_SETTLE_MS = 160;

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const rafTwice = () =>
    new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  const captureViaBackground = async (): Promise<string> => {
    const message: CaptureMessage = { type: 'captureVisibleTab' };
    const response = (await chrome.runtime.sendMessage(message)) as CaptureResponse | undefined;
    if (!response || response.error || !response.dataUrl) {
      throw new Error(response?.error ?? 'capture failed');
    }
    return response.dataUrl;
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('image load failed'));
      i.src = src;
    });

  const showProgress = (): ProgressHandle => {
    const wrap = document.createElement('div');
    wrap.dataset.dsdInternal = '1';
    wrap.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px 10px 12px;
      background: rgba(20, 20, 22, 0.88);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.95);
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;
    wrap.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
        <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none" stroke-dasharray="6 4">
          <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <span data-role="msg" style="font-variant-numeric: tabular-nums;">Připravuji…</span>
      <button data-role="cancel" style="
        margin-left: 4px;
        padding: 4px 10px;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 6px;
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.9);
        font: 500 12px/1 -apple-system, BlinkMacSystemFont, sans-serif;
        cursor: pointer;
      ">Zrušit</button>
    `;
    document.documentElement.appendChild(wrap);
    requestAnimationFrame(() => {
      wrap.style.opacity = '1';
      wrap.style.transform = 'translateY(0)';
    });

    const msgEl = wrap.querySelector<HTMLSpanElement>('[data-role="msg"]')!;
    const cancelBtn = wrap.querySelector<HTMLButtonElement>('[data-role="cancel"]')!;

    let cancelCb: (() => void) | null = null;
    cancelBtn.addEventListener('click', () => {
      cancelBtn.disabled = true;
      cancelBtn.style.opacity = '0.5';
      msgEl.textContent = 'Ruším…';
      cancelCb?.();
    });

    return {
      update: (current, total) => {
        msgEl.textContent = `Snímám ${current}/${total} dlaždic…`;
      },
      setMessage: (text) => {
        msgEl.textContent = text;
      },
      onCancel: (cb) => {
        cancelCb = cb;
      },
      close: () => {
        wrap.style.opacity = '0';
        wrap.style.transform = 'translateY(8px)';
        setTimeout(() => wrap.remove(), 220);
      },
    };
  };

  const showToast = (text: string) => {
    const toast = document.createElement('div');
    toast.dataset.dsdInternal = '1';
    toast.style.cssText = `
      position: fixed;
      top: 32px;
      left: 50%;
      transform: translate(-50%, -12px);
      padding: 10px 16px;
      background: rgba(20, 20, 22, 0.88);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      max-width: min(80vw, 520px);
    `;
    toast.textContent = text;
    document.documentElement.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -12px)';
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  };

  type FixedSnapshot = { el: HTMLElement; visibility: string };

  const collectFixedElements = (): FixedSnapshot[] => {
    const list: FixedSnapshot[] = [];
    document.querySelectorAll<HTMLElement>('body *').forEach((el) => {
      if (el.dataset.dsdInternal === '1') return;
      const s = getComputedStyle(el);
      if (s.position === 'fixed' || s.position === 'sticky') {
        list.push({ el, visibility: el.style.visibility });
      }
    });
    return list;
  };

  type CaptureOptions = {
    onProgress?: (current: number, total: number) => void;
    isCancelled?: () => boolean;
  };

  const captureFullPage = async (opts: CaptureOptions = {}): Promise<CaptureResult> => {
    const dpr = window.devicePixelRatio || 1;

    const originalScrollX = window.scrollX;
    const originalScrollY = window.scrollY;
    const docEl = document.documentElement;
    const originalDocScrollBehavior = docEl.style.scrollBehavior;
    const originalBodyScrollBehavior = document.body.style.scrollBehavior;
    docEl.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    const fixedElements = collectFixedElements();

    const restore = () => {
      for (const { el, visibility } of fixedElements) {
        el.style.visibility = visibility;
      }
      docEl.style.scrollBehavior = originalDocScrollBehavior;
      document.body.style.scrollBehavior = originalBodyScrollBehavior;
      window.scrollTo(originalScrollX, originalScrollY);
    };

    try {
      window.scrollTo(0, 0);
      await rafTwice();

      const totalH = Math.max(
        docEl.scrollHeight,
        document.body.scrollHeight,
        docEl.offsetHeight,
        document.body.offsetHeight,
        docEl.clientHeight,
      );
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;

      const maxLogicalH = Math.floor(MAX_CANVAS_PX / dpr);
      const cappedH = Math.min(totalH, maxLogicalH);
      const truncated = totalH > cappedH;

      const tiles: { y: number }[] = [];
      let y = 0;
      while (y < cappedH) {
        const yClamped = Math.min(y, Math.max(0, cappedH - viewportH));
        if (tiles.length > 0 && tiles[tiles.length - 1]!.y === yClamped) break;
        tiles.push({ y: yClamped });
        y += viewportH;
      }
      if (tiles.length === 0) tiles.push({ y: 0 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewportW * dpr);
      canvas.height = Math.round(cappedH * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2d context unavailable');

      for (let i = 0; i < tiles.length; i++) {
        if (opts.isCancelled?.()) throw new Error('cancelled');
        const tile = tiles[i]!;
        window.scrollTo(0, tile.y);

        if (i > 0) {
          for (const { el } of fixedElements) {
            el.style.visibility = 'hidden';
          }
        }

        await rafTwice();
        await sleep(POST_SCROLL_SETTLE_MS);

        const dataUrl = await captureViaBackground();
        const img = await loadImage(dataUrl);

        const drawY = Math.round(tile.y * dpr);
        const sliceH = Math.min(
          img.height,
          canvas.height - drawY,
        );
        if (sliceH > 0) {
          ctx.drawImage(
            img,
            0, 0, img.width, sliceH,
            0, drawY, canvas.width, sliceH,
          );
        }

        opts.onProgress?.(i + 1, tiles.length);

        if (i < tiles.length - 1) {
          await sleep(TILE_THROTTLE_MS);
        }
      }

      const blob = await new Promise<Blob>((res, rej) => {
        canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob returned null'))), 'image/png');
      });

      return {
        blob,
        width: canvas.width,
        height: canvas.height,
        tiles: tiles.length,
        truncated,
      };
    } finally {
      restore();
    }
  };

  const showResultModal = (result: CaptureResult) => {
    const url = URL.createObjectURL(result.blob);

    const backdrop = document.createElement('div');
    backdrop.dataset.dsdInternal = '1';
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: auto;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      width: min(94vw, 720px);
      max-height: 90vh;
      margin: 16px;
      padding: 16px;
      background: rgba(28, 28, 30, 0.95);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.95);
      font: 400 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transform: scale(0.96);
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    const header = document.createElement('div');
    header.style.cssText = `display: flex; align-items: center; justify-content: space-between; gap: 12px;`;

    const title = document.createElement('div');
    title.style.cssText = `font: 600 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`;
    const sizeKb = Math.round(result.blob.size / 1024);
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
    title.textContent = `Celá stránka — ${result.width}×${result.height} · ${sizeStr}`;

    const closeX = document.createElement('button');
    closeX.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
      </svg>`;
    closeX.style.cssText = `
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: none; background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px; cursor: pointer; padding: 0;
      transition: background 0.15s ease, color 0.15s ease;
    `;
    closeX.addEventListener('mouseenter', () => {
      closeX.style.background = 'rgba(255, 255, 255, 0.1)';
      closeX.style.color = 'rgba(255, 255, 255, 1)';
    });
    closeX.addEventListener('mouseleave', () => {
      closeX.style.background = 'transparent';
      closeX.style.color = 'rgba(255, 255, 255, 0.7)';
    });

    header.appendChild(title);
    header.appendChild(closeX);

    const previewWrap = document.createElement('div');
    previewWrap.style.cssText = `
      flex: 1 1 auto;
      min-height: 0;
      max-height: 60vh;
      overflow: auto;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
    `;
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = `display: block; width: 100%; height: auto;`;
    previewWrap.appendChild(img);

    if (result.truncated) {
      const note = document.createElement('div');
      note.textContent = 'Stránka byla oříznuta na maximální velikost canvasu (16k px).';
      note.style.cssText = `font-size: 12px; color: rgba(255, 200, 0, 0.85);`;
      dialog.appendChild(note);
    }

    const buttons = document.createElement('div');
    buttons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

    const mkButton = (label: string, primary: boolean, onClick: () => void): HTMLButtonElement => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 14px;
        border-radius: 8px;
        border: 1px solid ${primary ? 'transparent' : 'rgba(255, 255, 255, 0.12)'};
        background: ${primary ? 'rgba(10, 132, 255, 1)' : 'rgba(255, 255, 255, 0.06)'};
        color: ${primary ? 'white' : 'rgba(255, 255, 255, 0.95)'};
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        transition: background 0.15s ease;
      `;
      b.addEventListener('mouseenter', () => {
        b.style.background = primary ? 'rgba(10, 132, 255, 0.85)' : 'rgba(255, 255, 255, 0.12)';
      });
      b.addEventListener('mouseleave', () => {
        b.style.background = primary ? 'rgba(10, 132, 255, 1)' : 'rgba(255, 255, 255, 0.06)';
      });
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
      return b;
    };

    const copyBtn = mkButton('Kopírovat', true, async () => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': result.blob })]);
        showToast('Screenshot zkopírován');
      } catch (err) {
        console.error('Full-page copy failed', err);
        showToast('Kopírování selhalo');
      }
    });

    const downloadBtn = mkButton('Stáhnout', false, () => {
      const a = document.createElement('a');
      a.href = url;
      let host = 'page';
      try { host = new URL(location.href).hostname || 'page'; } catch {}
      a.download = `fullpage-${host}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    buttons.appendChild(copyBtn);
    buttons.appendChild(downloadBtn);

    dialog.appendChild(header);
    dialog.appendChild(previewWrap);
    dialog.appendChild(buttons);
    backdrop.appendChild(dialog);
    document.documentElement.appendChild(backdrop);

    let settled = false;
    const close = () => {
      if (settled) return;
      settled = true;
      backdrop.style.opacity = '0';
      dialog.style.transform = 'scale(0.96)';
      setTimeout(() => {
        backdrop.remove();
        URL.revokeObjectURL(url);
      }, 200);
      document.removeEventListener('keydown', onKey, true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', onKey, true);
    closeX.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      dialog.style.transform = 'scale(1)';
    });
  };

  let inFlight = false;

  const runFullPageCapture = async (): Promise<void> => {
    if (inFlight) {
      showToast('Snímání už běží');
      return;
    }
    inFlight = true;

    let cancelled = false;
    const progress = showProgress();
    progress.onCancel(() => {
      cancelled = true;
    });

    try {
      const result = await captureFullPage({
        onProgress: (cur, total) => progress.update(cur, total),
        isCancelled: () => cancelled,
      });
      progress.close();
      showResultModal(result);
    } catch (err) {
      progress.close();
      if (cancelled || (err instanceof Error && err.message === 'cancelled')) {
        showToast('Snímání zrušeno');
      } else {
        console.error('Full page capture failed', err);
        showToast('Snímání selhalo: ' + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      inFlight = false;
    }
  };

  type FullPageAPI = {
    run: () => Promise<void>;
    isInFlight: () => boolean;
  };

  (window as unknown as { __dsdFullPage?: FullPageAPI }).__dsdFullPage = {
    run: runFullPageCapture,
    isInFlight: () => inFlight,
  };
})();
