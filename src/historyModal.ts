(() => {
  type HistoryKind = 'region' | 'fullpage';

  type HistoryListItem = {
    id: string;
    createdAt: number;
    pageUrl: string;
    pageTitle: string;
    kind: HistoryKind;
    width: number;
    height: number;
    size: number;
    thumbDataUrl: string;
  };

  type ListResponse =
    | { ok: true; items: HistoryListItem[] }
    | { ok: false; error: string };
  type GetResponse =
    | { ok: true; dataUrl: string }
    | { ok: false; error: string };
  type AckResponse = { ok: true } | { ok: false; error: string };

  let modalOpen = false;

  const formatRelative = (ts: number): string => {
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} d ago`;
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const hostOf = (url: string): string => {
    try { return new URL(url).hostname; } catch { return url; }
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
    }, 2200);
  };

  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const openHistoryModal = async (): Promise<void> => {
    if (modalOpen) return;
    modalOpen = true;

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
      width: min(94vw, 880px);
      max-height: 90vh;
      margin: 16px;
      padding: 16px;
      background: rgba(28, 28, 30, 0.96);
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
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = `display: flex; align-items: center; justify-content: space-between; gap: 12px;`;

    const title = document.createElement('div');
    title.textContent = 'Screenshot history';
    title.style.cssText = `font: 600 15px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`;

    const headerRight = document.createElement('div');
    headerRight.style.cssText = `display: flex; align-items: center; gap: 8px;`;

    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = 'Clear all';
    clearAllBtn.style.cssText = `
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 80, 80, 0.3);
      background: rgba(255, 80, 80, 0.08);
      color: rgba(255, 120, 120, 0.95);
      font: 500 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      transition: background 0.15s ease;
    `;
    clearAllBtn.addEventListener('mouseenter', () => {
      clearAllBtn.style.background = 'rgba(255, 80, 80, 0.18)';
    });
    clearAllBtn.addEventListener('mouseleave', () => {
      clearAllBtn.style.background = 'rgba(255, 80, 80, 0.08)';
    });

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

    headerRight.appendChild(clearAllBtn);
    headerRight.appendChild(closeX);
    header.appendChild(title);
    header.appendChild(headerRight);

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      overflow: auto;
      padding: 4px;
      flex: 1 1 auto;
      min-height: 200px;
      max-height: 70vh;
    `;

    const emptyState = document.createElement('div');
    emptyState.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      color: rgba(255, 255, 255, 0.55);
      text-align: center;
    `;
    emptyState.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.5; margin-bottom: 12px;">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
      <div style="font-weight: 500;">No screenshots</div>
      <div style="font-size: 12px; margin-top: 4px;">Screenshots are automatically saved here after capture.</div>
    `;

    dialog.appendChild(header);
    dialog.appendChild(grid);
    backdrop.appendChild(dialog);
    document.documentElement.appendChild(backdrop);

    let settled = false;
    const close = () => {
      if (settled) return;
      settled = true;
      backdrop.style.opacity = '0';
      dialog.style.transform = 'scale(0.96)';
      setTimeout(() => backdrop.remove(), 200);
      document.removeEventListener('keydown', onKey, true);
      modalOpen = false;
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

    const renderGrid = (items: HistoryListItem[]) => {
      grid.replaceChildren();
      if (items.length === 0) {
        grid.style.display = 'flex';
        grid.appendChild(emptyState);
        return;
      }
      grid.style.display = 'grid';

      for (const item of items) {
        const card = document.createElement('div');
        card.style.cssText = `
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        `;
        card.addEventListener('mouseenter', () => {
          card.style.background = 'rgba(255, 255, 255, 0.07)';
          card.style.borderColor = 'rgba(255, 255, 255, 0.14)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.background = 'rgba(255, 255, 255, 0.04)';
          card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        });

        const thumbWrap = document.createElement('div');
        thumbWrap.style.cssText = `
          position: relative;
          aspect-ratio: 4 / 3;
          background: rgba(0, 0, 0, 0.4);
          overflow: hidden;
        `;
        const thumb = document.createElement('img');
        thumb.src = item.thumbDataUrl;
        thumb.alt = item.pageTitle || item.pageUrl;
        thumb.style.cssText = `
          display: block;
          width: 100%;
          height: 100%;
          object-fit: ${item.kind === 'fullpage' ? 'contain' : 'cover'};
        `;
        thumbWrap.appendChild(thumb);

        const kindBadge = document.createElement('span');
        kindBadge.textContent = item.kind === 'fullpage' ? 'full page' : 'region';
        kindBadge.style.cssText = `
          position: absolute;
          top: 6px;
          left: 6px;
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.7);
          color: rgba(255, 255, 255, 0.95);
          font: 500 10px/1.2 -apple-system, BlinkMacSystemFont, sans-serif;
          border-radius: 4px;
          letter-spacing: 0.02em;
        `;
        thumbWrap.appendChild(kindBadge);

        const meta = document.createElement('div');
        meta.style.cssText = `padding: 8px 10px; display: flex; flex-direction: column; gap: 2px;`;
        const titleLine = document.createElement('div');
        titleLine.textContent = item.pageTitle || hostOf(item.pageUrl);
        titleLine.title = item.pageTitle || item.pageUrl;
        titleLine.style.cssText = `
          font: 500 12px/1.3 -apple-system, BlinkMacSystemFont, sans-serif;
          color: rgba(255, 255, 255, 0.95);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        const subLine = document.createElement('div');
        subLine.textContent = `${formatRelative(item.createdAt)} · ${item.width}×${item.height} · ${formatSize(item.size)}`;
        subLine.style.cssText = `
          font: 400 11px/1.3 -apple-system, BlinkMacSystemFont, sans-serif;
          color: rgba(255, 255, 255, 0.55);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        meta.appendChild(titleLine);
        meta.appendChild(subLine);
        card.appendChild(thumbWrap);
        card.appendChild(meta);
        card.addEventListener('click', () => {
          void openPreview(item, refresh);
        });
        grid.appendChild(card);
      }
    };

    const refresh = async () => {
      grid.replaceChildren();
      const loading = document.createElement('div');
      loading.style.cssText = `padding: 24px; text-align: center; color: rgba(255,255,255,0.6); grid-column: 1 / -1;`;
      loading.textContent = 'Loading…';
      grid.appendChild(loading);
      try {
        const res = (await chrome.runtime.sendMessage({ type: 'listScreenshots' })) as ListResponse | undefined;
        if (!res || !res.ok) {
          throw new Error(res && !res.ok ? res.error : 'no response');
        }
        renderGrid(res.items);
      } catch (err) {
        grid.replaceChildren();
        const errEl = document.createElement('div');
        errEl.style.cssText = `padding: 24px; text-align: center; color: rgba(255,120,120,0.85); grid-column: 1 / -1;`;
        errEl.textContent = 'Failed to load history: ' + (err instanceof Error ? err.message : String(err));
        grid.appendChild(errEl);
      }
    };

    clearAllBtn.addEventListener('click', async () => {
      if (!confirm('Really delete the entire screenshot history?')) return;
      try {
        const res = (await chrome.runtime.sendMessage({ type: 'clearScreenshots' })) as AckResponse | undefined;
        if (!res || !res.ok) throw new Error(res && !res.ok ? res.error : 'no response');
        showToast('History cleared');
        await refresh();
      } catch (err) {
        showToast('Delete failed: ' + (err instanceof Error ? err.message : String(err)));
      }
    });

    void refresh();
  };

  const openPreview = async (item: HistoryListItem, onChange: () => Promise<void>): Promise<void> => {
    const backdrop = document.createElement('div');
    backdrop.dataset.dsdInternal = '1';
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: auto;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      width: min(94vw, 980px);
      max-height: 92vh;
      margin: 16px;
      padding: 14px;
      background: rgba(28, 28, 30, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      color: rgba(255, 255, 255, 0.95);
      font: 400 13px/1.4 -apple-system, BlinkMacSystemFont, sans-serif;
      transform: scale(0.96);
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: hidden;
    `;

    const head = document.createElement('div');
    head.style.cssText = `display: flex; align-items: center; gap: 10px;`;
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
    const titleText = document.createElement('div');
    titleText.textContent = item.pageTitle || hostOf(item.pageUrl);
    titleText.style.cssText = `font: 600 14px/1.3 -apple-system, BlinkMacSystemFont, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
    const subText = document.createElement('div');
    subText.textContent = `${item.width}×${item.height} · ${formatSize(item.size)} · ${formatRelative(item.createdAt)}`;
    subText.style.cssText = `font-size: 11px; color: rgba(255,255,255,0.6);`;
    titleEl.appendChild(titleText);
    titleEl.appendChild(subText);

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
    `;
    closeX.addEventListener('mouseenter', () => { closeX.style.background = 'rgba(255,255,255,0.1)'; });
    closeX.addEventListener('mouseleave', () => { closeX.style.background = 'transparent'; });
    head.appendChild(titleEl);
    head.appendChild(closeX);

    const previewWrap = document.createElement('div');
    previewWrap.style.cssText = `
      flex: 1 1 auto;
      min-height: 0;
      max-height: 64vh;
      overflow: auto;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    const loadingEl = document.createElement('div');
    loadingEl.textContent = 'Loading…';
    loadingEl.style.cssText = `padding: 24px; color: rgba(255,255,255,0.6);`;
    previewWrap.appendChild(loadingEl);

    const buttons = document.createElement('div');
    buttons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

    const mkButton = (label: string, primary: boolean, onClick: () => void): HTMLButtonElement => {
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
        font: 500 13px/1 -apple-system, BlinkMacSystemFont, sans-serif;
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

    let fullDataUrl: string | null = null;

    const copyBtn = mkButton('Copy', true, async () => {
      if (!fullDataUrl) return;
      try {
        const blob = await dataUrlToBlob(fullDataUrl);
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('Copied');
      } catch (err) {
        showToast('Copy failed');
        console.error(err);
      }
    });
    const downloadBtn = mkButton('Download', false, () => {
      if (!fullDataUrl) return;
      const a = document.createElement('a');
      a.href = fullDataUrl;
      const host = hostOf(item.pageUrl) || 'screenshot';
      const stamp = new Date(item.createdAt).toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `${host}-${stamp}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    const openUrlBtn = mkButton('Open page', false, () => {
      if (!item.pageUrl) return;
      window.open(item.pageUrl, '_blank', 'noopener');
    });
    const deleteBtn = mkButton('Delete', false, async () => {
      if (!confirm('Delete this screenshot from history?')) return;
      try {
        const res = (await chrome.runtime.sendMessage({ type: 'deleteScreenshot', id: item.id })) as AckResponse | undefined;
        if (!res || !res.ok) throw new Error(res && !res.ok ? res.error : 'no response');
        showToast('Deleted');
        close();
        await onChange();
      } catch (err) {
        showToast('Delete failed: ' + (err instanceof Error ? err.message : String(err)));
      }
    });
    deleteBtn.style.color = 'rgba(255, 120, 120, 0.95)';
    deleteBtn.style.borderColor = 'rgba(255, 80, 80, 0.3)';

    buttons.appendChild(copyBtn);
    buttons.appendChild(downloadBtn);
    if (item.pageUrl) buttons.appendChild(openUrlBtn);
    buttons.appendChild(deleteBtn);

    dialog.appendChild(head);
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
      setTimeout(() => backdrop.remove(), 200);
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

    try {
      const res = (await chrome.runtime.sendMessage({ type: 'getScreenshot', id: item.id })) as GetResponse | undefined;
      if (!res || !res.ok) throw new Error(res && !res.ok ? res.error : 'no response');
      fullDataUrl = res.dataUrl;
      previewWrap.replaceChildren();
      const img = document.createElement('img');
      img.src = res.dataUrl;
      img.style.cssText = `display: block; max-width: 100%; height: auto; ${item.kind === 'fullpage' ? '' : 'max-height: 64vh; object-fit: contain;'}`;
      previewWrap.appendChild(img);
    } catch (err) {
      previewWrap.replaceChildren();
      const errEl = document.createElement('div');
      errEl.style.cssText = `padding: 24px; color: rgba(255,120,120,0.85);`;
      errEl.textContent = 'Failed to load: ' + (err instanceof Error ? err.message : String(err));
      previewWrap.appendChild(errEl);
    }
  };

  type HistoryAPI = {
    open: () => Promise<void>;
    isOpen: () => boolean;
  };

  (window as unknown as { __dsdHistory?: HistoryAPI }).__dsdHistory = {
    open: openHistoryModal,
    isOpen: () => modalOpen,
  };
})();
