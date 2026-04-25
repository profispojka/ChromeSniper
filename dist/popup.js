"use strict";
(() => {
  // src/popup.ts
  (() => {
    const statusEl = document.getElementById("status");
    const fullpageBtn = document.getElementById("fullpage");
    const hotkeyHint = document.getElementById("hotkey-hint");
    const setStatus = (text, kind = "info") => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.style.color = kind === "error" ? "rgba(255, 100, 100, 0.95)" : "rgba(255, 200, 0, 0.85)";
    };
    chrome.commands?.getAll?.((cmds) => {
      const cmd = cmds.find((c) => c.name === "capture-full-page");
      if (cmd && cmd.shortcut && hotkeyHint) {
        hotkeyHint.textContent = cmd.shortcut;
      }
    });
    const RESTRICTED_PREFIXES = ["chrome://", "chrome-extension://", "edge://", "about:", "view-source:"];
    const isRestrictedUrl = (url) => {
      if (!url) return true;
      return RESTRICTED_PREFIXES.some((p) => url.startsWith(p)) || url.startsWith("https://chrome.google.com/webstore");
    };
    fullpageBtn?.addEventListener("click", async () => {
      fullpageBtn.disabled = true;
      setStatus("");
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          setStatus("Aktivn\xED z\xE1lo\u017Eka nedostupn\xE1", "error");
          fullpageBtn.disabled = false;
          return;
        }
        if (isRestrictedUrl(tab.url)) {
          setStatus("Tato str\xE1nka neumo\u017E\u0148uje roz\u0161\xED\u0159en\xED", "error");
          fullpageBtn.disabled = false;
          return;
        }
        try {
          await chrome.tabs.sendMessage(tab.id, { type: "startFullPageCapture" });
          window.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setStatus("Str\xE1nku znovu na\u010Dti a zkus to znovu", "error");
          console.error("sendMessage failed", msg);
          fullpageBtn.disabled = false;
        }
      } catch (err) {
        setStatus("Chyba: " + (err instanceof Error ? err.message : String(err)), "error");
        fullpageBtn.disabled = false;
      }
    });
  })();
})();
//# sourceMappingURL=popup.js.map
