(() => {
  const statusEl = document.getElementById('status') as HTMLDivElement | null;
  const pickerBtn = document.getElementById('picker') as HTMLButtonElement | null;
  const fullpageBtn = document.getElementById('fullpage') as HTMLButtonElement | null;
  const historyBtn = document.getElementById('history') as HTMLButtonElement | null;

  const setStatus = (text: string, kind: 'info' | 'error' = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = kind === 'error' ? 'rgba(255, 100, 100, 0.95)' : 'rgba(255, 200, 0, 0.85)';
  };

  const RESTRICTED_PREFIXES = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'view-source:'];

  const isRestrictedUrl = (url: string | undefined): boolean => {
    if (!url) return true;
    return RESTRICTED_PREFIXES.some((p) => url.startsWith(p)) || url.startsWith('https://chrome.google.com/webstore');
  };

  const sendToActiveTab = async (btn: HTMLButtonElement, message: { type: string }) => {
    btn.disabled = true;
    setStatus('');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus('Active tab unavailable', 'error');
        btn.disabled = false;
        return;
      }
      if (isRestrictedUrl(tab.url)) {
        setStatus('Extensions are not allowed on this page', 'error');
        btn.disabled = false;
        return;
      }
      try {
        await chrome.tabs.sendMessage(tab.id, message);
        window.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus('Reload the page and try again', 'error');
        console.error('sendMessage failed', msg);
        btn.disabled = false;
      }
    } catch (err) {
      setStatus('Error: ' + (err instanceof Error ? err.message : String(err)), 'error');
      btn.disabled = false;
    }
  };

  pickerBtn?.addEventListener('click', () => {
    void sendToActiveTab(pickerBtn, { type: 'startColorPicker' });
  });

  fullpageBtn?.addEventListener('click', () => {
    void sendToActiveTab(fullpageBtn, { type: 'startFullPageCapture' });
  });

  historyBtn?.addEventListener('click', () => {
    void sendToActiveTab(historyBtn, { type: 'openHistory' });
  });
})();
