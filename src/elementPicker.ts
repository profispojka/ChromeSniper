(() => {
  type ElementPickerAPI = {
    start: () => Promise<void>;
    isActive: () => boolean;
  };

  let active = false;

  const formatBytes = (n: number): string => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

  const showToast = (text: string, kind: 'ok' | 'err' = 'ok'): void => {
    const toast = document.createElement('div');
    toast.dataset.dsdInternal = '1';
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
    const okIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
      <circle cx="8" cy="8" r="7" fill="rgba(52, 199, 89, 0.95)"/>
      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const errIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
      <circle cx="8" cy="8" r="7" fill="rgba(255, 90, 90, 0.95)"/>
      <path d="M6 6L10 10M10 6L6 10" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
    toast.innerHTML = `${kind === 'ok' ? okIcon : errIcon}<span></span>`;
    toast.querySelector('span')!.textContent = text;
    document.documentElement.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -12px)';
      setTimeout(() => toast.remove(), 250);
    }, 2200);
  };

  const isOurElement = (el: Element | null): boolean => {
    if (!el) return false;
    const node = el.closest('[data-dsd-internal], [data-dsd-picker]');
    return node !== null;
  };

  const describeElement = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
      : '';
    return `${tag}${id}${cls}`;
  };

  const pickAtPoint = (clientX: number, clientY: number): Element | null => {
    const stack = (document as Document & {
      elementsFromPoint?: (x: number, y: number) => Element[];
    }).elementsFromPoint?.(clientX, clientY) ?? [];
    for (const el of stack) {
      if (!isOurElement(el)) return el;
    }
    return null;
  };

  const start = async (): Promise<void> => {
    if (active) return;
    active = true;

    const overlay = document.createElement('div');
    overlay.dataset.dsdPicker = '1';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
    `;

    const highlight = document.createElement('div');
    highlight.dataset.dsdPicker = '1';
    highlight.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 2px solid rgba(10, 132, 255, 0.95);
      background: rgba(10, 132, 255, 0.12);
      border-radius: 2px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 9999px rgba(0, 0, 0, 0.15);
      transition: opacity 0.08s ease;
      opacity: 0;
      box-sizing: border-box;
    `;
    overlay.appendChild(highlight);

    const label = document.createElement('div');
    label.dataset.dsdPicker = '1';
    label.style.cssText = `
      position: fixed;
      pointer-events: none;
      padding: 4px 8px;
      background: rgba(20, 20, 22, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.95);
      font: 500 11px/1.2 ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      opacity: 0;
      max-width: 60vw;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    overlay.appendChild(label);

    const hint = document.createElement('div');
    hint.dataset.dsdPicker = '1';
    hint.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      padding: 8px 14px;
      background: rgba(20, 20, 22, 0.85);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.9);
      font: 500 12px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    hint.innerHTML = `Klikni na element pro zkopírování · <kbd style="display:inline-block;padding:1px 6px;font:600 10px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.16);border-radius:4px;">Esc</kbd> zruší`;
    overlay.appendChild(hint);

    const cursorStyle = document.createElement('style');
    cursorStyle.dataset.dsdPicker = '1';
    cursorStyle.textContent = `html.dsd-picker-active, html.dsd-picker-active * { cursor: crosshair !important; }`;
    document.head.appendChild(cursorStyle);
    document.documentElement.classList.add('dsd-picker-active');

    document.documentElement.appendChild(overlay);
    requestAnimationFrame(() => {
      hint.style.opacity = '1';
    });

    let currentTarget: Element | null = null;

    const updateHighlight = (el: Element | null): void => {
      if (!el) {
        highlight.style.opacity = '0';
        label.style.opacity = '0';
        currentTarget = null;
        return;
      }
      if (el === currentTarget) return;
      currentTarget = el;
      const rect = el.getBoundingClientRect();
      highlight.style.left = `${rect.left}px`;
      highlight.style.top = `${rect.top}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.opacity = '1';

      label.textContent = describeElement(el);
      const labelTop = rect.top - 26;
      label.style.left = `${Math.max(4, rect.left)}px`;
      label.style.top = `${labelTop < 4 ? rect.top + 4 : labelTop}px`;
      label.style.opacity = '1';
    };

    let cleanup: (() => void) | null = null;

    const onMove = (e: PointerEvent): void => {
      const el = pickAtPoint(e.clientX, e.clientY);
      updateHighlight(el);
    };

    const onClick = async (e: MouseEvent): Promise<void> => {
      const el = pickAtPoint(e.clientX, e.clientY);
      e.preventDefault();
      e.stopPropagation();
      if (!el) {
        cleanup?.();
        return;
      }
      const html = el.outerHTML;
      cleanup?.();
      try {
        await navigator.clipboard.writeText(html);
        showToast(`${describeElement(el)} zkopírován (${formatBytes(html.length)})`);
      } catch (err) {
        console.error('Element copy failed', err);
        showToast('Kopírování selhalo', 'err');
      }
    };

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cleanup?.();
      }
    };

    const onScroll = (): void => {
      currentTarget = null;
      highlight.style.opacity = '0';
      label.style.opacity = '0';
    };

    const onBlur = (): void => cleanup?.();

    cleanup = (): void => {
      cleanup = null;
      active = false;
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('blur', onBlur);
      document.documentElement.classList.remove('dsd-picker-active');
      cursorStyle.remove();
      overlay.remove();
    };

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('blur', onBlur);
  };

  (window as unknown as { __dsdElementPicker?: ElementPickerAPI }).__dsdElementPicker = {
    start,
    isActive: () => active,
  };
})();
