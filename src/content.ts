(() => {
  type CaptureMessage = { type: 'captureVisibleTab' };
  type CaptureResponse =
    | { dataUrl: string; error?: undefined }
    | { dataUrl?: undefined; error: string };

  type UploadMessage = { type: 'uploadImage'; dataUrl: string };
  type UploadResponse =
    | { url: string; provider: 'primary' | 'fallback'; error?: undefined }
    | { url?: undefined; provider?: undefined; error: string };

  const UPLOAD_CONSENT_KEY = 'uploadConsentGiven';
  const QR_STRIP_TRACKING_KEY = 'qrStripTracking';

  type FrozenScrollable = {
    el: HTMLElement;
    overflowY: string;
    overflowX: string;
    scrollTop: number;
    scrollLeft: number;
  };

  type QrInstance = {
    addData: (data: string, mode?: 'Byte' | 'Numeric' | 'Alphanumeric' | 'Kanji') => void;
    make: () => void;
    getModuleCount: () => number;
    isDark: (row: number, col: number) => boolean;
  };
  type QrFactory = ((typeNumber: number, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H') => QrInstance) & {
    stringToBytes: (s: string) => number[];
    stringToBytesFuncs: { [k: string]: ((s: string) => number[]) | undefined };
  };
  const qrcode = (window as unknown as { qrcode?: QrFactory }).qrcode;
  if (qrcode) {
    const utf8 = qrcode.stringToBytesFuncs['UTF-8'];
    if (utf8) qrcode.stringToBytes = utf8;
  }
  let qrModalOpen = false;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
  `;
  document.documentElement.appendChild(overlay);

  let startX = 0;
  let startY = 0;
  let currentSquare: HTMLDivElement | null = null;
  let activePointerId: number | null = null;

  let pickerImageData: ImageData | null = null;
  let pickerEnabled = false;
  let pickerSwatchEl: HTMLDivElement | null = null;
  let pickerCleanup: (() => void) | null = null;

  type AnnotationTool = 'none' | 'pen';
  type Annotation = { kind: 'pen'; points: [number, number][]; color: string; width: number };
  type AnnotationLayer = {
    canvas: HTMLCanvasElement;
    setTool: (t: AnnotationTool) => void;
    getTool: () => AnnotationTool;
    setColor: (c: string) => void;
    getColor: () => string;
    cycleColor: () => string;
    clear: () => boolean;
    hasItems: () => boolean;
    getAnnotations: () => Annotation[];
    destroy: () => void;
    onChange: (cb: () => void) => () => void;
  };
  type AnnotationsAPI = {
    mount: (sq: HTMLDivElement, opts: { cssWidth: number; cssHeight: number }) => AnnotationLayer;
    render: (ctx: CanvasRenderingContext2D, list: Annotation[], scale: number) => void;
    COLORS: string[];
  };
  const annotationsApi = (window as unknown as { __dsdAnnotations?: AnnotationsAPI }).__dsdAnnotations;
  let currentLayer: AnnotationLayer | null = null;

  type FullPageAPI = {
    run: () => Promise<void>;
    isInFlight: () => boolean;
  };
  const fullPageApi = (window as unknown as { __dsdFullPage?: FullPageAPI }).__dsdFullPage;

  const startFullPageCapture = () => {
    if (!fullPageApi) {
      console.warn('Full page capture API not loaded');
      return;
    }
    if (document.body.style.transform !== '') {
      showToast('Nejdřív zavřete zoom (Esc)');
      return;
    }
    void fullPageApi.run();
  };

  chrome.runtime.onMessage.addListener((msg: unknown) => {
    if (typeof msg === 'object' && msg !== null && (msg as { type?: string }).type === 'startFullPageCapture') {
      startFullPageCapture();
    }
    return undefined;
  });

  const makeSquare = (x: number, y: number): HTMLDivElement => {
    const sq = document.createElement('div');
    sq.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0px;
      height: 0px;
      border: 1.5px solid rgba(255, 255, 255, 0.95);
      border-radius: 6px;
      background: transparent;
      box-sizing: border-box;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.5),
        inset 0 0 0 1px rgba(0, 0, 0, 0.25),
        0 0 0 100vmax rgba(0, 0, 0, 0.55);
    `;

    const badge = document.createElement('div');
    badge.dataset.role = 'size-badge';
    badge.style.cssText = `
      position: absolute;
      top: -28px;
      left: 0;
      padding: 3px 8px;
      background: rgba(20, 20, 22, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.95);
      font: 500 11px/1 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.12s ease;
    `;
    sq.appendChild(badge);

    overlay.appendChild(sq);
    return sq;
  };

  const updateSquare = (x: number, y: number) => {
    if (!currentSquare) return;
    const left = Math.min(startX, x);
    const top = Math.min(startY, y);
    const width = Math.abs(x - startX);
    const height = Math.abs(y - startY);
    currentSquare.style.left = `${left}px`;
    currentSquare.style.top = `${top}px`;
    currentSquare.style.width = `${width}px`;
    currentSquare.style.height = `${height}px`;

    const badge = currentSquare.querySelector<HTMLDivElement>('[data-role="size-badge"]');
    if (badge) {
      badge.textContent = `${Math.round(width)} × ${Math.round(height)}`;
      badge.style.opacity = width > 8 && height > 8 ? '1' : '0';
      badge.style.top = top < 32 ? '6px' : '-28px';
      badge.style.left = top < 32 ? '6px' : '0';
    }
  };

  const closeZoom = () => {
    if (pickerCleanup) {
      pickerCleanup();
      pickerCleanup = null;
    }
    if (currentLayer) {
      currentLayer.destroy();
      currentLayer = null;
    }
    overlay.replaceChildren();
    overlay.style.pointerEvents = 'none';
    if (!document.body.style.transform) {
      resetZoom();
      return;
    }
    document.body.style.transition = 'transform 0.4s ease';
    document.body.style.transform = 'translate(0px, 0px) scale(1)';
    let done = false;
    const finishReset = () => {
      if (done) return;
      done = true;
      document.body.removeEventListener('transitionend', finishReset);
      resetZoom();
    };
    document.body.addEventListener('transitionend', finishReset);
    setTimeout(finishReset, 500);
  };

  const blockScroll = (e: Event) => e.preventDefault();
  const blockScrollKeys = (e: KeyboardEvent) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (keys.includes(e.key)) e.preventDefault();
  };

  let frozenScrollables: FrozenScrollable[] = [];
  const freezeAllScrollables = () => {
    frozenScrollables = [];
    document.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (overlay.contains(el) || el === overlay) return;
      const s = getComputedStyle(el);
      const scrollableY = /(auto|scroll|overlay)/.test(s.overflowY) && el.scrollHeight > el.clientHeight;
      const scrollableX = /(auto|scroll|overlay)/.test(s.overflowX) && el.scrollWidth > el.clientWidth;
      if (scrollableY || scrollableX) {
        frozenScrollables.push({
          el,
          overflowY: el.style.overflowY,
          overflowX: el.style.overflowX,
          scrollTop: el.scrollTop,
          scrollLeft: el.scrollLeft,
        });
        el.style.overflowY = 'hidden';
        el.style.overflowX = 'hidden';
      }
    });
  };
  const unfreezeAllScrollables = () => {
    frozenScrollables.forEach(({ el, overflowY, overflowX, scrollTop, scrollLeft }) => {
      el.style.overflowY = overflowY;
      el.style.overflowX = overflowX;
      el.scrollTop = scrollTop;
      el.scrollLeft = scrollLeft;
    });
    frozenScrollables = [];
  };

  const resetZoom = () => {
    document.body.style.transform = '';
    document.body.style.transformOrigin = '';
    document.body.style.transition = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.removeEventListener('wheel', blockScroll, true);
    window.removeEventListener('touchmove', blockScroll, true);
    window.removeEventListener('keydown', blockScrollKeys, true);
    unfreezeAllScrollables();
  };

  const makeIconButton = (svg: string, title: string, onClick: () => void): HTMLButtonElement => {
    const btn = document.createElement('button');
    btn.innerHTML = svg;
    btn.setAttribute('aria-label', title);
    btn.dataset.tooltip = title;
    btn.style.cssText = `
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      padding: 0;
      line-height: 0;
      transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255, 255, 255, 0.12)';
      btn.style.color = 'rgba(255, 255, 255, 1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
      btn.style.color = 'rgba(255, 255, 255, 0.85)';
    });
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.92)';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  };

  const captureRect = async (rect: DOMRect, annotations?: Annotation[]): Promise<Blob> => {
    overlay.style.visibility = 'hidden';
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    let dataUrl: string;
    try {
      const message: CaptureMessage = { type: 'captureVisibleTab' };
      const response = (await chrome.runtime.sendMessage(message)) as CaptureResponse | undefined;
      if (!response || response.error || !response.dataUrl) {
        throw new Error(response?.error ?? 'capture failed');
      }
      dataUrl = response.dataUrl;
    } finally {
      overlay.style.visibility = '';
    }
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    ctx.drawImage(
      img,
      Math.round(rect.left * dpr), Math.round(rect.top * dpr),
      Math.round(rect.width * dpr), Math.round(rect.height * dpr),
      0, 0, canvas.width, canvas.height,
    );
    if (annotations && annotations.length && annotationsApi) {
      annotationsApi.render(ctx, annotations, dpr);
    }
    return await new Promise<Blob>((res, rej) => {
      canvas.toBlob((blob) => {
        if (blob) res(blob);
        else rej(new Error('toBlob returned null'));
      }, 'image/png');
    });
  };

  type ToastHandle = { dismiss: () => void };
  const showToast = (text: string, opts?: { sticky?: boolean }): ToastHandle => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 32px;
      left: 50%;
      transform: translate(-50%, -12px);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(20, 20, 22, 0.78);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.95);
      padding: 10px 16px 10px 12px;
      border-radius: 12px;
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.05) inset;
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      max-width: min(80vw, 520px);
    `;
    const sticky = opts?.sticky === true;
    const iconHtml = sticky
      ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
           <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none" stroke-dasharray="6 4">
             <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
           </circle>
         </svg>`
      : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
           <circle cx="8" cy="8" r="7" fill="rgba(52, 199, 89, 0.95)"/>
           <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`;
    toast.innerHTML = `${iconHtml}<span></span>`;
    toast.querySelector('span')!.textContent = text;
    document.documentElement.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    });

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -12px)';
      setTimeout(() => toast.remove(), 250);
    };
    if (!sticky) setTimeout(dismiss, 2200);
    return { dismiss };
  };

  const copyRect = async (sq: HTMLDivElement) => {
    try {
      const blob = await captureRect(sq.getBoundingClientRect(), currentLayer?.getAnnotations());
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      showToast('Screenshot zkopírován do schránky');
    } catch (err) {
      console.error('Copy failed', err);
      alert('Kopírování selhalo: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const shareRect = async (sq: HTMLDivElement) => {
    let blob: Blob;
    try {
      blob = await captureRect(sq.getBoundingClientRect(), currentLayer?.getAnnotations());
    } catch (err) {
      console.error('Capture failed', err);
      alert('Nepodařilo se pořídit screenshot: ' + (err instanceof Error ? err.message : String(err)));
      return;
    }
    const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Screenshot' });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.warn('Share failed, falling back to download', err);
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const showToastWithCopyAction = (text: string, valueToCopy: string) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 32px;
      left: 50%;
      transform: translate(-50%, -12px);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(20, 20, 22, 0.85);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.95);
      padding: 10px 14px;
      border-radius: 12px;
      font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      z-index: 2147483647;
      cursor: pointer;
      pointer-events: auto;
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
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -12px)';
      setTimeout(() => toast.remove(), 250);
    };
    toast.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(valueToCopy);
        toast.textContent = 'Zkopírováno do schránky';
        setTimeout(dismiss, 1200);
      } catch (err) {
        console.error('Clipboard write failed', err);
      }
    });
    setTimeout(dismiss, 8000);
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });

  const getUploadConsent = async (): Promise<boolean> => {
    try {
      const stored = await chrome.storage.local.get(UPLOAD_CONSENT_KEY);
      return stored[UPLOAD_CONSENT_KEY] === true;
    } catch {
      return false;
    }
  };

  const setUploadConsent = async () => {
    try {
      await chrome.storage.local.set({ [UPLOAD_CONSENT_KEY]: true });
    } catch {}
  };

  const confirmUpload = (): Promise<boolean> =>
    new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.18s ease;
        pointer-events: auto;
      `;

      const dialog = document.createElement('div');
      dialog.style.cssText = `
        max-width: 380px;
        margin: 16px;
        padding: 20px;
        background: rgba(28, 28, 30, 0.95);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.95);
        font: 400 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transform: scale(0.96);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      const title = document.createElement('div');
      title.textContent = 'Nahrát na 0x0.st?';
      title.style.cssText = `
        font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin-bottom: 8px;
      `;

      const body = document.createElement('div');
      body.textContent =
        'Screenshot bude nahrán na veřejnou službu 0x0.st. Kdokoliv s odkazem ho uvidí. Pokračovat?';
      body.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 16px;
      `;

      const rememberRow = document.createElement('label');
      rememberRow.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        cursor: pointer;
        user-select: none;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.75);
      `;
      const remember = document.createElement('input');
      remember.type = 'checkbox';
      remember.checked = true;
      remember.style.cssText = `accent-color: rgba(10, 132, 255, 1); cursor: pointer;`;
      const rememberText = document.createElement('span');
      rememberText.textContent = 'Příště se neptat';
      rememberRow.appendChild(remember);
      rememberRow.appendChild(rememberText);

      const buttons = document.createElement('div');
      buttons.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      `;

      const mkButton = (label: string, primary: boolean): HTMLButtonElement => {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = `
          padding: 8px 14px;
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
        return b;
      };

      const cancelBtn = mkButton('Zrušit', false);
      const confirmBtn = mkButton('Nahrát', true);

      let settled = false;
      const close = (result: boolean) => {
        if (settled) return;
        settled = true;
        if (result && remember.checked) void setUploadConsent();
        backdrop.style.opacity = '0';
        dialog.style.transform = 'scale(0.96)';
        setTimeout(() => backdrop.remove(), 180);
        document.removeEventListener('keydown', onKey, true);
        resolve(result);
      };

      cancelBtn.addEventListener('click', () => close(false));
      confirmBtn.addEventListener('click', () => close(true));
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) close(false);
      });

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close(false);
        } else if (e.key === 'Enter') {
          e.stopPropagation();
          close(true);
        }
      };
      document.addEventListener('keydown', onKey, true);

      buttons.appendChild(cancelBtn);
      buttons.appendChild(confirmBtn);
      dialog.appendChild(title);
      dialog.appendChild(body);
      dialog.appendChild(rememberRow);
      dialog.appendChild(buttons);
      backdrop.appendChild(dialog);
      document.documentElement.appendChild(backdrop);

      requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        dialog.style.transform = 'scale(1)';
        confirmBtn.focus();
      });
    });

  const uploadRect = async (sq: HTMLDivElement) => {
    const consent = await getUploadConsent();
    if (!consent) {
      const ok = await confirmUpload();
      if (!ok) return;
    }
    let blob: Blob;
    try {
      blob = await captureRect(sq.getBoundingClientRect(), currentLayer?.getAnnotations());
    } catch (err) {
      console.error('Capture failed', err);
      showToast('Nepodařilo se pořídit screenshot');
      return;
    }
    const pending = showToast('Nahrávám na 0x0.st…', { sticky: true });
    try {
      const dataUrl = await blobToDataUrl(blob);
      const message: UploadMessage = { type: 'uploadImage', dataUrl };
      const response = (await chrome.runtime.sendMessage(message)) as UploadResponse | undefined;
      pending?.dismiss();
      if (!response || response.error || !response.url) {
        throw new Error(response?.error ?? 'upload failed');
      }
      const url = response.url;
      const note = response.provider === 'fallback' ? ' (catbox.moe)' : '';
      try {
        window.focus();
        await navigator.clipboard.writeText(url);
        showToast(`Odkaz zkopírován${note}: ${url}`);
      } catch {
        showToastWithCopyAction(`Klikni pro zkopírování${note}: ${url}`, url);
      }
    } catch (err) {
      pending?.dismiss();
      console.error('Upload failed', err);
      showToast('Nahrání selhalo: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const TRACKING_PARAMS = [
    'fbclid', 'gclid', 'mc_eid', 'igshid', 'yclid', 'msclkid', 'dclid',
    '_ga', 'ref', 'ref_src', 'ref_url', 'vero_id', '_hsenc', '_hsmi',
  ];
  const stripTracking = (urlStr: string): string => {
    try {
      const url = new URL(urlStr);
      for (const k of [...url.searchParams.keys()]) {
        if (k.startsWith('utm_') || TRACKING_PARAMS.includes(k)) {
          url.searchParams.delete(k);
        }
      }
      return url.toString();
    } catch {
      return urlStr;
    }
  };

  const renderQRToCanvas = (canvas: HTMLCanvasElement, qr: QrInstance, scale: number, margin = 4): void => {
    const size = qr.getModuleCount();
    const totalModules = size + 2 * margin;
    canvas.width = totalModules * scale;
    canvas.height = totalModules * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
        }
      }
    }
  };

  const getStripPref = async (): Promise<boolean> => {
    try {
      const stored = await chrome.storage.local.get(QR_STRIP_TRACKING_KEY);
      return stored[QR_STRIP_TRACKING_KEY] === true;
    } catch {
      return false;
    }
  };
  const setStripPref = async (val: boolean): Promise<void> => {
    try {
      await chrome.storage.local.set({ [QR_STRIP_TRACKING_KEY]: val });
    } catch {}
  };

  const openQrModal = async () => {
    if (qrModalOpen) return;
    if (!qrcode) {
      showToast('QR encoder nedostupný');
      return;
    }
    const rawUrl = location.href;
    let stripPref = await getStripPref();

    qrModalOpen = true;

    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.18s ease;
      pointer-events: auto;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      width: min(92vw, 360px);
      margin: 16px;
      padding: 20px;
      background: rgba(28, 28, 30, 0.95);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.95);
      font: 400 14px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transform: scale(0.96);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 14px;
    `;

    const headerRow = document.createElement('div');
    headerRow.style.cssText = `display: flex; align-items: center; justify-content: space-between;`;
    const titleEl = document.createElement('div');
    titleEl.textContent = 'QR kód stránky';
    titleEl.style.cssText = `font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`;
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
    headerRow.appendChild(titleEl);
    headerRow.appendChild(closeX);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      display: block;
      width: 100%;
      max-width: 280px;
      margin: 0 auto;
      image-rendering: pixelated;
      border-radius: 8px;
      background: white;
    `;

    const urlBox = document.createElement('div');
    urlBox.style.cssText = `
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font: 400 12px/1.4 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      color: rgba(255, 255, 255, 0.85);
      word-break: break-all;
      max-height: 4.6em;
      overflow: auto;
    `;

    const stripRow = document.createElement('label');
    stripRow.style.cssText = `
      display: flex; align-items: center; gap: 8px;
      cursor: pointer; user-select: none;
      font-size: 13px; color: rgba(255, 255, 255, 0.75);
    `;
    const stripCheckbox = document.createElement('input');
    stripCheckbox.type = 'checkbox';
    stripCheckbox.checked = stripPref;
    stripCheckbox.style.cssText = `accent-color: rgba(10, 132, 255, 1); cursor: pointer;`;
    const stripLabel = document.createElement('span');
    stripLabel.textContent = 'Bez tracking parametrů';
    stripRow.appendChild(stripCheckbox);
    stripRow.appendChild(stripLabel);

    const buttonsRow = document.createElement('div');
    buttonsRow.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

    const mkActionBtn = (label: string, primary = false): HTMLButtonElement => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `
        flex: 1 1 auto;
        min-width: 0;
        padding: 9px 12px;
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
      return b;
    };

    const copyPngBtn = mkActionBtn('Kopírovat PNG', true);
    const downloadBtn = mkActionBtn('Stáhnout');
    const copyUrlBtn = mkActionBtn('Kopírovat URL');

    buttonsRow.appendChild(copyPngBtn);
    buttonsRow.appendChild(downloadBtn);
    buttonsRow.appendChild(copyUrlBtn);

    dialog.appendChild(headerRow);
    dialog.appendChild(canvas);
    dialog.appendChild(urlBox);
    dialog.appendChild(stripRow);
    dialog.appendChild(buttonsRow);
    backdrop.appendChild(dialog);
    document.documentElement.appendChild(backdrop);

    let currentUrl = stripPref ? stripTracking(rawUrl) : rawUrl;

    const refresh = () => {
      currentUrl = stripCheckbox.checked ? stripTracking(rawUrl) : rawUrl;
      urlBox.textContent = currentUrl;
      try {
        const qr = qrcode(0, 'M');
        qr.addData(currentUrl, 'Byte');
        qr.make();
        const targetPx = 280;
        const totalModules = qr.getModuleCount() + 8;
        const scale = Math.max(2, Math.floor((targetPx * (window.devicePixelRatio || 1)) / totalModules));
        renderQRToCanvas(canvas, qr, scale);
      } catch (err) {
        console.error('QR encode failed', err);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 280;
          canvas.height = 280;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#cc0000';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('URL je příliš dlouhá', canvas.width / 2, canvas.height / 2);
        }
      }
    };
    refresh();

    if (/^(chrome|chrome-extension|about|file):/i.test(rawUrl)) {
      const note = document.createElement('div');
      note.textContent = 'Tato URL funguje jen v daném prohlížeči nebo zařízení.';
      note.style.cssText = `
        font-size: 12px;
        color: rgba(255, 200, 0, 0.85);
        margin-top: -6px;
      `;
      dialog.insertBefore(note, stripRow);
    }

    stripCheckbox.addEventListener('change', () => {
      void setStripPref(stripCheckbox.checked);
      refresh();
    });

    let settled = false;
    const close = () => {
      if (settled) return;
      settled = true;
      backdrop.style.opacity = '0';
      dialog.style.transform = 'scale(0.96)';
      setTimeout(() => backdrop.remove(), 180);
      document.removeEventListener('keydown', onKey, true);
      qrModalOpen = false;
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

    copyPngBtn.addEventListener('click', () => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Vytvoření obrázku selhalo');
          return;
        }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('QR zkopírován do schránky');
        } catch (err) {
          console.error('QR copy failed', err);
          showToast('Kopírování selhalo');
        }
      }, 'image/png');
    });

    downloadBtn.addEventListener('click', () => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        let host = 'page';
        try { host = new URL(currentUrl).hostname || 'page'; } catch {}
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${host}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });

    copyUrlBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentUrl);
        showToast('URL zkopírována');
      } catch {
        showToast('Kopírování URL selhalo');
      }
    });

    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      dialog.style.transform = 'scale(1)';
    });
  };

  const toHex2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

  const cachePickerImage = async (sq: HTMLDivElement): Promise<void> => {
    if (!sq.isConnected) return;
    const rect = sq.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    overlay.style.visibility = 'hidden';
    let dataUrl: string;
    try {
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const message: CaptureMessage = { type: 'captureVisibleTab' };
      const response = (await chrome.runtime.sendMessage(message)) as CaptureResponse | undefined;
      if (!response || response.error || !response.dataUrl) return;
      dataUrl = response.dataUrl;
    } finally {
      overlay.style.visibility = '';
    }
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(
      img,
      Math.round(rect.left * dpr), Math.round(rect.top * dpr),
      Math.round(rect.width * dpr), Math.round(rect.height * dpr),
      0, 0, canvas.width, canvas.height,
    );
    pickerImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const ensureSwatch = (sq: HTMLDivElement): HTMLDivElement => {
    if (pickerSwatchEl && pickerSwatchEl.parentElement === sq) return pickerSwatchEl;
    const el = document.createElement('div');
    el.dataset.role = 'picker-swatch';
    el.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px 4px 4px;
      background: rgba(20, 20, 22, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.95);
      font: 600 11px/1 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      z-index: 10;
      opacity: 0;
      transition: opacity 0.1s ease;
      will-change: transform;
    `;
    el.innerHTML = `
      <span data-role="swatch" style="width:16px;height:16px;border-radius:4px;border:1px solid rgba(255,255,255,0.25);background:#000;flex-shrink:0"></span>
      <span data-role="hex">#000000</span>
    `;
    sq.appendChild(el);
    pickerSwatchEl = el;
    return el;
  };

  const hideSwatch = () => {
    if (pickerSwatchEl) pickerSwatchEl.style.opacity = '0';
  };

  const readHexAt = (sq: HTMLDivElement, clientX: number, clientY: number): string | null => {
    if (!pickerImageData) return null;
    const sqRect = sq.getBoundingClientRect();
    const cx = clientX - sqRect.left;
    const cy = clientY - sqRect.top;
    if (cx < 0 || cy < 0 || cx > sqRect.width || cy > sqRect.height) return null;
    const dpr = window.devicePixelRatio || 1;
    const px = Math.min(pickerImageData.width - 1, Math.max(0, Math.floor(cx * dpr)));
    const py = Math.min(pickerImageData.height - 1, Math.max(0, Math.floor(cy * dpr)));
    const i = (py * pickerImageData.width + px) * 4;
    const d = pickerImageData.data;
    return `#${toHex2(d[i]!)}${toHex2(d[i + 1]!)}${toHex2(d[i + 2]!)}`;
  };

  const updateSwatchAt = (sq: HTMLDivElement, clientX: number, clientY: number) => {
    const hex = readHexAt(sq, clientX, clientY);
    if (!hex) {
      hideSwatch();
      return;
    }
    const sqRect = sq.getBoundingClientRect();
    const cx = clientX - sqRect.left;
    const cy = clientY - sqRect.top;
    const swatch = ensureSwatch(sq);
    const swatchW = 96;
    const swatchH = 28;
    let lx = cx + 16;
    let ly = cy + 16;
    if (lx + swatchW > sqRect.width) lx = cx - swatchW - 8;
    if (ly + swatchH > sqRect.height) ly = cy - swatchH - 8;
    if (lx < 0) lx = 4;
    if (ly < 0) ly = 4;
    swatch.style.transform = `translate(${lx}px, ${ly}px)`;
    swatch.style.opacity = '1';
    const sw = swatch.querySelector<HTMLSpanElement>('[data-role="swatch"]');
    const hx = swatch.querySelector<HTMLSpanElement>('[data-role="hex"]');
    if (sw) sw.style.background = hex;
    if (hx) hx.textContent = hex;
  };

  const copyHexAt = async (sq: HTMLDivElement, clientX: number, clientY: number) => {
    const hex = readHexAt(sq, clientX, clientY);
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
      showToast(`${hex} zkopírováno`);
    } catch (err) {
      console.error('Hex copy failed', err);
      showToast('Kopírování barvy selhalo');
    }
  };

  const translateRect = (_sq: HTMLDivElement, _btn: HTMLButtonElement) => {
    showToast('Překlad zatím nedostupný');
  };

  const addControls = (sq: HTMLDivElement, scale: number) => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translate(-50%, 10px);
      transform-origin: top center;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: rgba(20, 20, 22, 0.75);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow:
        0 12px 40px rgba(0, 0, 0, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    const primaryRow = document.createElement('div');
    primaryRow.style.cssText = `display: flex; align-items: center; gap: 2px;`;
    container.appendChild(primaryRow);

    const sep = () => {
      const s = document.createElement('div');
      s.style.cssText = `
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 2px;
      `;
      return s;
    };

    const copySvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    `;
    const shareSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    `;
    const linkSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    `;
    const qrSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <line x1="14" y1="14" x2="17" y2="14"/>
        <line x1="20" y1="14" x2="20" y2="17"/>
        <line x1="14" y1="17" x2="14" y2="21"/>
        <line x1="17" y1="17" x2="17" y2="20"/>
        <line x1="20" y1="20" x2="21" y2="20"/>
      </svg>
    `;
    const pickerSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="m2 22 1-1h3l9-9"/>
        <path d="M3 21v-3l9-9"/>
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>
      </svg>
    `;
    const translateSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 8h6"/>
        <path d="M8 5v3"/>
        <path d="M5 14c0 0 2 4 6 4"/>
        <path d="M11 14c0 0-2 4-6 4"/>
        <path d="M14 21l4-9 4 9"/>
        <path d="M15.5 17h5"/>
      </svg>
    `;
    const closeSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/>
        <line x1="18" y1="6" x2="6" y2="18"/>
      </svg>
    `;

    const sqRectInit = sq.getBoundingClientRect();
    const origW = sqRectInit.width / scale;
    const origH = sqRectInit.height / scale;
    const pickerAvailable = origW >= 10 && origH >= 10;

    primaryRow.appendChild(makeIconButton(copySvg, 'Kopírovat (⌘C)', () => copyRect(sq)));
    primaryRow.appendChild(makeIconButton(shareSvg, 'Sdílet / stáhnout', () => shareRect(sq)));
    primaryRow.appendChild(makeIconButton(linkSvg, 'Nahrát a zkopírovat odkaz', () => uploadRect(sq)));
    primaryRow.appendChild(makeIconButton(qrSvg, 'QR kód stránky (Q)', () => void openQrModal()));
    let translateBtn: HTMLButtonElement;
    translateBtn = makeIconButton(translateSvg, 'Přeložit text v obrázku', () => translateRect(sq, translateBtn));
    primaryRow.appendChild(translateBtn);

    let pickerBtn: HTMLButtonElement | null = null;
    if (pickerAvailable) {
      pickerBtn = makeIconButton(pickerSvg, 'Color picker (I, Alt+klik)', () => {
        setPickerActive(!pickerEnabled);
      });
      primaryRow.appendChild(pickerBtn);
    }

    primaryRow.appendChild(sep());
    primaryRow.appendChild(makeIconButton(closeSvg, 'Zavřít (Esc)', closeZoom));

    const setPickerActive = (on: boolean) => {
      pickerEnabled = on;
      if (on) {
        sq.style.cursor = 'crosshair';
        if (pickerBtn) {
          pickerBtn.style.background = 'rgba(10, 132, 255, 0.85)';
          pickerBtn.style.color = 'white';
        }
        if (!pickerImageData) {
          showToast('Načítám barvy…');
        }
      } else {
        sq.style.cursor = '';
        if (pickerBtn) {
          pickerBtn.style.background = 'transparent';
          pickerBtn.style.color = 'rgba(255, 255, 255, 0.85)';
        }
        hideSwatch();
      }
    };

    if (pickerBtn) {
      pickerBtn.addEventListener('mouseenter', () => {
        if (pickerEnabled) {
          pickerBtn!.style.background = 'rgba(10, 132, 255, 0.95)';
          pickerBtn!.style.color = 'white';
        }
      });
      pickerBtn.addEventListener('mouseleave', () => {
        if (pickerEnabled) {
          pickerBtn!.style.background = 'rgba(10, 132, 255, 0.85)';
          pickerBtn!.style.color = 'white';
        }
      });
    }

    if (pickerAvailable) {
      const onMove = (e: PointerEvent) => {
        if (!(pickerEnabled || e.altKey)) {
          if (pickerSwatchEl && pickerSwatchEl.style.opacity !== '0') hideSwatch();
          return;
        }
        if (!pickerImageData) return;
        updateSwatchAt(sq, e.clientX, e.clientY);
      };
      const onLeave = () => hideSwatch();
      const onClick = (e: MouseEvent) => {
        if (!(pickerEnabled || e.altKey)) return;
        if ((e.target as HTMLElement | null)?.closest('button')) return;
        e.preventDefault();
        e.stopPropagation();
        void copyHexAt(sq, e.clientX, e.clientY);
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Alt' && pickerImageData) {
          sq.style.cursor = 'crosshair';
        } else if ((e.key === 'i' || e.key === 'I') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          const tag = (document.activeElement as HTMLElement | null)?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA') return;
          e.preventDefault();
          setPickerActive(!pickerEnabled);
        }
      };
      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Alt' && !pickerEnabled) {
          sq.style.cursor = '';
          hideSwatch();
        }
      };

      sq.addEventListener('pointermove', onMove);
      sq.addEventListener('pointerleave', onLeave);
      sq.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKeyDown, true);
      document.addEventListener('keyup', onKeyUp, true);

      const onTransitionEnd = (e: TransitionEvent) => {
        if (e.target !== document.body || e.propertyName !== 'transform') return;
        document.body.removeEventListener('transitionend', onTransitionEnd);
        void cachePickerImage(sq);
      };
      document.body.addEventListener('transitionend', onTransitionEnd);
      const cacheFallback = window.setTimeout(() => {
        document.body.removeEventListener('transitionend', onTransitionEnd);
        void cachePickerImage(sq);
      }, 600);

      pickerCleanup = () => {
        sq.removeEventListener('pointermove', onMove);
        sq.removeEventListener('pointerleave', onLeave);
        sq.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
        document.removeEventListener('keyup', onKeyUp, true);
        document.body.removeEventListener('transitionend', onTransitionEnd);
        window.clearTimeout(cacheFallback);
        pickerImageData = null;
        pickerEnabled = false;
        pickerSwatchEl = null;
      };
    }

    const annotAvailable = !!annotationsApi && origW >= 16 && origH >= 16;
    if (annotAvailable && annotationsApi) {
      const cssWidth = parseFloat(sq.style.width) || sqRectInit.width;
      const cssHeight = parseFloat(sq.style.height) || sqRectInit.height;
      const layer = annotationsApi.mount(sq, { cssWidth, cssHeight });
      currentLayer = layer;

      const annotRow = document.createElement('div');
      annotRow.style.cssText = `
        display: flex;
        align-items: center;
        gap: 2px;
        padding-top: 4px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      `;

      const penSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          <path d="M2 2l7.586 7.586"/>
          <circle cx="11" cy="11" r="2"/>
        </svg>
      `;
      const trashSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        </svg>
      `;

      const toolButtons: { tool: AnnotationTool; btn: HTMLButtonElement }[] = [];
      const refreshActiveTool = () => {
        const cur = layer.getTool();
        for (const { tool, btn } of toolButtons) {
          const active = tool === cur;
          btn.style.background = active ? 'rgba(10, 132, 255, 0.85)' : 'transparent';
          btn.style.color = active ? 'white' : 'rgba(255, 255, 255, 0.85)';
        }
      };
      const makeToolButton = (svg: string, title: string, tool: AnnotationTool): HTMLButtonElement => {
        const btn = makeIconButton(svg, title, () => {
          const next = layer.getTool() === tool ? 'none' : tool;
          layer.setTool(next);
          refreshActiveTool();
        });
        btn.addEventListener('mouseenter', () => {
          if (layer.getTool() === tool) {
            btn.style.background = 'rgba(10, 132, 255, 0.95)';
            btn.style.color = 'white';
          }
        });
        btn.addEventListener('mouseleave', () => {
          if (layer.getTool() === tool) {
            btn.style.background = 'rgba(10, 132, 255, 0.85)';
            btn.style.color = 'white';
          }
        });
        toolButtons.push({ tool, btn });
        return btn;
      };

      annotRow.appendChild(makeToolButton(penSvg, 'Tužka (P)', 'pen'));

      const colorBtn = document.createElement('button');
      colorBtn.setAttribute('aria-label', 'Barva (cyklí)');
      colorBtn.dataset.tooltip = 'Barva (cyklí)';
      colorBtn.style.cssText = `
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        padding: 0;
        line-height: 0;
        transition: background 0.15s ease, transform 0.15s ease;
      `;
      const colorDot = document.createElement('span');
      const refreshColorDot = () => {
        colorDot.style.background = layer.getColor();
      };
      colorDot.style.cssText = `
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.6);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.4);
      `;
      refreshColorDot();
      colorBtn.appendChild(colorDot);
      colorBtn.addEventListener('mouseenter', () => {
        colorBtn.style.background = 'rgba(255, 255, 255, 0.12)';
      });
      colorBtn.addEventListener('mouseleave', () => {
        colorBtn.style.background = 'transparent';
      });
      colorBtn.addEventListener('mousedown', () => {
        colorBtn.style.transform = 'scale(0.92)';
      });
      colorBtn.addEventListener('mouseup', () => {
        colorBtn.style.transform = 'scale(1)';
      });
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.cycleColor();
        refreshColorDot();
      });
      annotRow.appendChild(colorBtn);

      const clearBtn = makeIconButton(trashSvg, 'Smazat vše', () => {
        layer.clear();
      });
      annotRow.appendChild(clearBtn);

      container.appendChild(annotRow);

      const onAnnotKey = (e: KeyboardEvent) => {
        const tag = (document.activeElement as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
        const k = e.key.toLowerCase();
        let next: AnnotationTool | null = null;
        if (k === 'v') next = 'none';
        else if (k === 'p') next = 'pen';
        if (next !== null) {
          e.preventDefault();
          layer.setTool(next);
          refreshActiveTool();
        }
      };
      document.addEventListener('keydown', onAnnotKey, true);

      const origDestroy = layer.destroy;
      layer.destroy = () => {
        document.removeEventListener('keydown', onAnnotKey, true);
        origDestroy();
      };
    }

    sq.appendChild(container);

    requestAnimationFrame(() => {
      const rect = sq.getBoundingClientRect();
      const toolbarHeight = 56;
      if (rect.bottom + toolbarHeight > window.innerHeight) {
        container.style.top = 'auto';
        container.style.bottom = '100%';
        container.style.transformOrigin = 'bottom center';
        container.style.transform = `translate(-50%, -10px)`;
      }
      container.style.opacity = '1';
    });
  };

  const zoomTo = (sq: HTMLDivElement, left: number, top: number, width: number, height: number) => {
    if (width < 5 || height < 5) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const br = document.body.getBoundingClientRect();
    const cx = left + width / 2 - br.left;
    const cy = top + height / 2 - br.top;
    const scale = Math.min(vw / width, vh / height) * 0.8;
    const tx = vw / 2 - (left + width / 2);
    const ty = vh / 2 - (top + height / 2);

    document.body.style.transformOrigin = `${cx}px ${cy}px`;
    document.body.style.transition = 'transform 0.4s ease';
    document.body.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    freezeAllScrollables();
    window.addEventListener('wheel', blockScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', blockScroll, { passive: false, capture: true });
    window.addEventListener('keydown', blockScrollKeys, true);

    const newW = width * scale;
    const newH = height * scale;
    sq.style.transition = 'left 0.4s ease, top 0.4s ease, width 0.4s ease, height 0.4s ease';
    sq.style.left = `${vw / 2 - newW / 2}px`;
    sq.style.top = `${vh / 2 - newH / 2}px`;
    sq.style.width = `${newW}px`;
    sq.style.height = `${newH}px`;

    sq.style.pointerEvents = 'auto';
    overlay.style.pointerEvents = 'auto';
    addControls(sq, scale);
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeZoom();
  });

  const finish = (commit: boolean) => {
    window.removeEventListener('scroll', lockScrollDuringDrag, true);
    if (commit && currentSquare) {
      const r = currentSquare.getBoundingClientRect();
      const badge = currentSquare.querySelector<HTMLDivElement>('[data-role="size-badge"]');
      if (badge) badge.remove();
      zoomTo(currentSquare, r.left, r.top, r.width, r.height);
    }
    currentSquare = null;
    activePointerId = null;
  };

  let dragInitialScrollX = 0;
  let dragInitialScrollY = 0;
  const lockScrollDuringDrag = () => {
    if (currentSquare && (window.scrollX !== dragInitialScrollX || window.scrollY !== dragInitialScrollY)) {
      window.scrollTo(dragInitialScrollX, dragInitialScrollY);
    }
  };

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !e.shiftKey) return;
    closeZoom();
    dragInitialScrollX = window.scrollX;
    dragInitialScrollY = window.scrollY;
    window.addEventListener('scroll', lockScrollDuringDrag, true);
    startX = e.clientX;
    startY = e.clientY;
    currentSquare = makeSquare(startX, startY);
    activePointerId = e.pointerId;
    try {
      (e.target as Element | null)?.setPointerCapture(e.pointerId);
    } catch {}
  }, true);

  document.addEventListener('pointermove', (e) => {
    if (currentSquare === null || e.pointerId !== activePointerId) return;
    updateSquare(e.clientX, e.clientY);
  }, true);

  document.addEventListener('pointerup', (e) => {
    if (e.pointerId !== activePointerId) return;
    finish(true);
  }, true);

  document.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== activePointerId) return;
    finish(false);
  }, true);

  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `html.dsd-aiming, html.dsd-aiming * { cursor: crosshair !important; }`;
  (document.head || document.documentElement).appendChild(cursorStyle);

  const isZoomActive = (): boolean =>
    document.body.style.transform !== '' && overlay.style.pointerEvents === 'auto';

  document.addEventListener('keydown', (e) => {
    if (qrModalOpen) return;
    if (e.key === 'Escape') closeZoom();
    if (e.key === 'Shift') document.documentElement.classList.add('dsd-aiming');
    if ((e.key === 'q' || e.key === 'Q') && !e.metaKey && !e.ctrlKey && !e.altKey && isZoomActive()) {
      const tag = (e.target as Element | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement | null)?.isContentEditable) return;
      e.preventDefault();
      void openQrModal();
    }
  }, true);

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') document.documentElement.classList.remove('dsd-aiming');
  }, true);

  window.addEventListener('blur', () => {
    document.documentElement.classList.remove('dsd-aiming');
  });

  document.addEventListener('dragstart', (e) => {
    if (currentSquare) e.preventDefault();
  }, true);

  document.addEventListener('selectstart', (e) => {
    if (currentSquare) e.preventDefault();
  }, true);
})();
