"use strict";
(() => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
  `;
    const mountOverlay = () => {
        if (document.body)
            document.body.appendChild(overlay);
        else
            document.documentElement.appendChild(overlay);
    };
    if (document.body)
        mountOverlay();
    else
        document.addEventListener('DOMContentLoaded', mountOverlay, { once: true });
    let startX = 0;
    let startY = 0;
    let currentSquare = null;
    let activePointerId = null;
    const makeSquare = (x, y) => {
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
    const updateSquare = (x, y) => {
        if (!currentSquare)
            return;
        const left = Math.min(startX, x);
        const top = Math.min(startY, y);
        const width = Math.abs(x - startX);
        const height = Math.abs(y - startY);
        currentSquare.style.left = `${left}px`;
        currentSquare.style.top = `${top}px`;
        currentSquare.style.width = `${width}px`;
        currentSquare.style.height = `${height}px`;
        const badge = currentSquare.querySelector('[data-role="size-badge"]');
        if (badge) {
            badge.textContent = `${Math.round(width)} × ${Math.round(height)}`;
            badge.style.opacity = width > 8 && height > 8 ? '1' : '0';
            badge.style.top = top < 32 ? '6px' : '-28px';
            badge.style.left = top < 32 ? '6px' : '0';
        }
    };
    const closeZoom = () => {
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
            if (done)
                return;
            done = true;
            document.body.removeEventListener('transitionend', finishReset);
            resetZoom();
        };
        document.body.addEventListener('transitionend', finishReset);
        setTimeout(finishReset, 500);
    };
    const blockScroll = (e) => e.preventDefault();
    const blockScrollKeys = (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
        if (keys.includes(e.key))
            e.preventDefault();
    };
    let frozenScrollables = [];
    const freezeAllScrollables = () => {
        frozenScrollables = [];
        document.querySelectorAll('*').forEach((el) => {
            if (overlay.contains(el) || el === overlay)
                return;
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
    const makeIconButton = (svg, title, onClick) => {
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
    const captureRect = async (rect) => {
        overlay.style.visibility = 'hidden';
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        let dataUrl;
        try {
            const message = { type: 'captureVisibleTab' };
            const response = (await chrome.runtime.sendMessage(message));
            if (!response || response.error || !response.dataUrl) {
                throw new Error(response?.error ?? 'capture failed');
            }
            dataUrl = response.dataUrl;
        }
        finally {
            overlay.style.visibility = '';
        }
        const img = await new Promise((res, rej) => {
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
        if (!ctx)
            throw new Error('2d context unavailable');
        ctx.drawImage(img, Math.round(rect.left * dpr), Math.round(rect.top * dpr), Math.round(rect.width * dpr), Math.round(rect.height * dpr), 0, 0, canvas.width, canvas.height);
        return await new Promise((res, rej) => {
            canvas.toBlob((blob) => {
                if (blob)
                    res(blob);
                else
                    rej(new Error('toBlob returned null'));
            }, 'image/png');
        });
    };
    const showToast = (text) => {
        const toast = document.createElement('div');
        toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translate(-50%, 12px);
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
    `;
        toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
        <circle cx="8" cy="8" r="7" fill="rgba(52, 199, 89, 0.95)"/>
        <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span></span>
    `;
        toast.querySelector('span').textContent = text;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 12px)';
            setTimeout(() => toast.remove(), 250);
        }, 2200);
    };
    const copyRect = async (sq) => {
        try {
            const blob = await captureRect(sq.getBoundingClientRect());
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
            ]);
            showToast('Screenshot zkopírován do schránky');
        }
        catch (err) {
            console.error('Copy failed', err);
            alert('Kopírování selhalo: ' + (err instanceof Error ? err.message : String(err)));
        }
    };
    const shareRect = async (sq) => {
        let blob;
        try {
            blob = await captureRect(sq.getBoundingClientRect());
        }
        catch (err) {
            console.error('Capture failed', err);
            alert('Nepodařilo se pořídit screenshot: ' + (err instanceof Error ? err.message : String(err)));
            return;
        }
        const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: 'Screenshot' });
                return;
            }
            catch (err) {
                if (err instanceof Error && err.name === 'AbortError')
                    return;
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
    const addControls = (sq, scale) => {
        const inv = 1 / scale;
        const container = document.createElement('div');
        container.style.cssText = `
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translate(-50%, ${10 * inv}px) scale(${inv});
      transform-origin: top center;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 2px;
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
        const closeSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="18" y2="18"/>
        <line x1="18" y1="6" x2="6" y2="18"/>
      </svg>
    `;
        container.appendChild(makeIconButton(copySvg, 'Kopírovat (⌘C)', () => copyRect(sq)));
        container.appendChild(makeIconButton(shareSvg, 'Sdílet / stáhnout', () => shareRect(sq)));
        container.appendChild(sep());
        container.appendChild(makeIconButton(closeSvg, 'Zavřít (Esc)', closeZoom));
        sq.appendChild(container);
        requestAnimationFrame(() => {
            const rect = sq.getBoundingClientRect();
            const toolbarHeight = 56;
            if (rect.bottom + toolbarHeight > window.innerHeight) {
                container.style.top = 'auto';
                container.style.bottom = '100%';
                container.style.transformOrigin = 'bottom center';
                container.style.transform = `translate(-50%, ${-10 * inv}px) scale(${inv})`;
            }
            container.style.opacity = '1';
        });
    };
    const zoomTo = (sq, left, top, width, height) => {
        if (width < 5 || height < 5)
            return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scrollEl = document.scrollingElement || document.documentElement;
        const sx = scrollEl.scrollLeft || window.scrollX || 0;
        const sy = scrollEl.scrollTop || window.scrollY || 0;
        const cx = left + width / 2 + sx;
        const cy = top + height / 2 + sy;
        const scale = Math.min(vw / width, vh / height) * 0.8;
        const tx = vw / 2 - cx;
        const ty = vh / 2 - cy;
        document.body.style.transformOrigin = `${cx}px ${cy}px`;
        document.body.style.transition = 'transform 0.4s ease';
        document.body.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        freezeAllScrollables();
        window.addEventListener('wheel', blockScroll, { passive: false, capture: true });
        window.addEventListener('touchmove', blockScroll, { passive: false, capture: true });
        window.addEventListener('keydown', blockScrollKeys, true);
        sq.style.pointerEvents = 'auto';
        overlay.style.pointerEvents = 'auto';
        addControls(sq, scale);
    };
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay)
            closeZoom();
    });
    const finish = (commit) => {
        if (commit && currentSquare) {
            const r = currentSquare.getBoundingClientRect();
            const badge = currentSquare.querySelector('[data-role="size-badge"]');
            if (badge)
                badge.remove();
            zoomTo(currentSquare, r.left, r.top, r.width, r.height);
        }
        currentSquare = null;
        activePointerId = null;
    };
    document.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || !e.shiftKey)
            return;
        closeZoom();
        startX = e.clientX;
        startY = e.clientY;
        currentSquare = makeSquare(startX, startY);
        activePointerId = e.pointerId;
        try {
            e.target?.setPointerCapture(e.pointerId);
        }
        catch { }
    }, true);
    document.addEventListener('pointermove', (e) => {
        if (currentSquare === null || e.pointerId !== activePointerId)
            return;
        updateSquare(e.clientX, e.clientY);
    }, true);
    document.addEventListener('pointerup', (e) => {
        if (e.pointerId !== activePointerId)
            return;
        finish(true);
    }, true);
    document.addEventListener('pointercancel', (e) => {
        if (e.pointerId !== activePointerId)
            return;
        finish(false);
    }, true);
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `html.dsd-aiming, html.dsd-aiming * { cursor: crosshair !important; }`;
    (document.head || document.documentElement).appendChild(cursorStyle);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape')
            closeZoom();
        if (e.key === 'Shift')
            document.documentElement.classList.add('dsd-aiming');
    }, true);
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift')
            document.documentElement.classList.remove('dsd-aiming');
    }, true);
    window.addEventListener('blur', () => {
        document.documentElement.classList.remove('dsd-aiming');
    });
    document.addEventListener('dragstart', (e) => {
        if (currentSquare)
            e.preventDefault();
    }, true);
    document.addEventListener('selectstart', (e) => {
        if (currentSquare)
            e.preventDefault();
    }, true);
})();
