(() => {
  const statusEl = document.getElementById('status') as HTMLDivElement | null;
  const fullpageBtn = document.getElementById('fullpage') as HTMLButtonElement | null;
  const hotkeyHint = document.getElementById('hotkey-hint') as HTMLSpanElement | null;

  const setStatus = (text: string, kind: 'info' | 'error' = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = kind === 'error' ? 'rgba(255, 100, 100, 0.95)' : 'rgba(255, 200, 0, 0.85)';
  };

  chrome.commands?.getAll?.((cmds) => {
    const cmd = cmds.find((c) => c.name === 'capture-full-page');
    if (cmd && cmd.shortcut && hotkeyHint) {
      hotkeyHint.textContent = cmd.shortcut;
    }
  });

  const RESTRICTED_PREFIXES = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'view-source:'];

  const isRestrictedUrl = (url: string | undefined): boolean => {
    if (!url) return true;
    return RESTRICTED_PREFIXES.some((p) => url.startsWith(p)) || url.startsWith('https://chrome.google.com/webstore');
  };

  fullpageBtn?.addEventListener('click', async () => {
    fullpageBtn.disabled = true;
    setStatus('');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus('Aktivní záložka nedostupná', 'error');
        fullpageBtn.disabled = false;
        return;
      }
      if (isRestrictedUrl(tab.url)) {
        setStatus('Tato stránka neumožňuje rozšíření', 'error');
        fullpageBtn.disabled = false;
        return;
      }
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'startFullPageCapture' });
        window.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus('Stránku znovu načti a zkus to znovu', 'error');
        console.error('sendMessage failed', msg);
        fullpageBtn.disabled = false;
      }
    } catch (err) {
      setStatus('Chyba: ' + (err instanceof Error ? err.message : String(err)), 'error');
      fullpageBtn.disabled = false;
    }
  });
})();
