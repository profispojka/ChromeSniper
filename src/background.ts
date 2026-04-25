(() => {
  type CaptureMessage = { type: 'captureVisibleTab' };
  type CaptureResponse =
    | { dataUrl: string; error?: undefined }
    | { dataUrl?: undefined; error: string };

  type UploadMessage = { type: 'uploadImage'; dataUrl: string };
  type UploadResponse =
    | { url: string; provider: 'primary' | 'fallback'; error?: undefined }
    | { url?: undefined; provider?: undefined; error: string };

  type Message = CaptureMessage | UploadMessage;

  const UPLOAD_TIMEOUT_MS = 15000;

  const handleCapture = (
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: CaptureResponse) => void,
  ): true => {
    const windowId = sender.tab?.windowId;
    if (windowId === undefined) {
      sendResponse({ error: 'no windowId' });
      return true;
    }
    chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message ?? 'capture failed' });
      } else {
        sendResponse({ dataUrl });
      }
    });
    return true;
  };

  const fetchWithTimeout = async (url: string, init: RequestInit): Promise<Response> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), UPLOAD_TIMEOUT_MS);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  const uploadTo0x0 = async (blob: Blob): Promise<string> => {
    const fd = new FormData();
    fd.append('file', blob, `screenshot-${Date.now()}.png`);
    const res = await fetchWithTimeout('https://0x0.st', { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`0x0.st HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (!text.startsWith('https://')) throw new Error('0x0.st: unexpected response');
    return text;
  };

  const uploadToCatbox = async (blob: Blob): Promise<string> => {
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('fileToUpload', blob, `screenshot-${Date.now()}.png`);
    const res = await fetchWithTimeout('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`catbox HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (!text.startsWith('https://')) throw new Error('catbox: unexpected response');
    return text;
  };

  const handleUpload = async (
    dataUrl: string,
    sendResponse: (response: UploadResponse) => void,
  ): Promise<void> => {
    let blob: Blob;
    try {
      blob = await (await fetch(dataUrl)).blob();
    } catch (err) {
      sendResponse({ error: 'failed to decode image: ' + (err instanceof Error ? err.message : String(err)) });
      return;
    }

    try {
      const url = await uploadTo0x0(blob);
      sendResponse({ url, provider: 'primary' });
      return;
    } catch (errPrimary) {
      const primaryMsg = errPrimary instanceof Error ? errPrimary.message : String(errPrimary);
      console.warn('0x0.st upload failed, trying catbox:', primaryMsg);
      try {
        const url = await uploadToCatbox(blob);
        sendResponse({ url, provider: 'fallback' });
        return;
      } catch (errFallback) {
        const fallbackMsg = errFallback instanceof Error ? errFallback.message : String(errFallback);
        sendResponse({ error: `${primaryMsg}; fallback ${fallbackMsg}` });
        return;
      }
    }
  };

  chrome.runtime.onMessage.addListener(
    (msg: Message, sender, sendResponse: (response: CaptureResponse | UploadResponse) => void) => {
      if (msg?.type === 'captureVisibleTab') {
        return handleCapture(sender, sendResponse as (r: CaptureResponse) => void);
      }
      if (msg?.type === 'uploadImage') {
        handleUpload(msg.dataUrl, sendResponse as (r: UploadResponse) => void);
        return true;
      }
      return undefined;
    },
  );
})();
