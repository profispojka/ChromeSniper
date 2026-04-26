"use strict";
(() => {
  // src/historyStore.ts
  var DB_NAME = "dsd-history";
  var DB_VERSION = 1;
  var STORE = "screenshots";
  var MAX_ITEMS = 50;
  var MAX_TOTAL_BYTES = 200 * 1024 * 1024;
  var openDB = () => new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => rej(req.error ?? new Error("idb open failed"));
    req.onsuccess = () => res(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
  });
  var promisifyReq = (req) => new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error ?? new Error("idb request failed"));
  });
  var blobToDataUrl = (blob) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error ?? new Error("blob read failed"));
    r.readAsDataURL(blob);
  });
  var makeThumb = async (blob, maxDim = 320) => {
    const bmp = await createImageBitmap(blob);
    try {
      const ratio = Math.min(maxDim / bmp.width, maxDim / bmp.height, 1);
      const w = Math.max(1, Math.round(bmp.width * ratio));
      const h = Math.max(1, Math.round(bmp.height * ratio));
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("offscreen 2d context unavailable");
      ctx.drawImage(bmp, 0, 0, w, h);
      return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.78 });
    } finally {
      bmp.close();
    }
  };
  var dataUrlToBlob = async (dataUrl) => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };
  var newId = () => {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 10);
    return `${t}-${r}`;
  };
  var addItem = async (input) => {
    const blob = await dataUrlToBlob(input.dataUrl);
    const thumbBlob = await makeThumb(blob);
    const record = {
      id: newId(),
      createdAt: Date.now(),
      pageUrl: input.pageUrl,
      pageTitle: input.pageTitle,
      kind: input.kind,
      width: input.width,
      height: input.height,
      size: blob.size,
      blob,
      thumbBlob
    };
    const db = await openDB();
    await new Promise((res, rej) => {
      const tr = db.transaction(STORE, "readwrite");
      tr.objectStore(STORE).put(record);
      tr.oncomplete = () => res();
      tr.onerror = () => rej(tr.error ?? new Error("idb put failed"));
      tr.onabort = () => rej(tr.error ?? new Error("idb tx aborted"));
    });
    const pruned = await prune(db);
    db.close();
    return { id: record.id, pruned };
  };
  var prune = async (db) => {
    const tr = db.transaction(STORE, "readwrite");
    const store = tr.objectStore(STORE);
    const idx = store.index("createdAt");
    const all = await promisifyReq(idx.getAll());
    const sorted = all.slice().sort((a, b) => a.createdAt - b.createdAt);
    let totalBytes = sorted.reduce((s, r) => s + (r.size ?? 0), 0);
    let removed = 0;
    let i = 0;
    while ((sorted.length - i > MAX_ITEMS || totalBytes > MAX_TOTAL_BYTES) && i < sorted.length) {
      const victim = sorted[i];
      store.delete(victim.id);
      totalBytes -= victim.size ?? 0;
      removed++;
      i++;
    }
    await new Promise((res, rej) => {
      tr.oncomplete = () => res();
      tr.onerror = () => rej(tr.error ?? new Error("prune failed"));
      tr.onabort = () => rej(tr.error ?? new Error("prune aborted"));
    });
    return removed;
  };
  var listItems = async () => {
    const db = await openDB();
    try {
      const records = await new Promise((res, rej) => {
        const tr = db.transaction(STORE, "readonly");
        const idx = tr.objectStore(STORE).index("createdAt");
        const req = idx.getAll();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error ?? new Error("list failed"));
      });
      records.sort((a, b) => b.createdAt - a.createdAt);
      const items = [];
      for (const r of records) {
        let thumbDataUrl = "";
        try {
          thumbDataUrl = await blobToDataUrl(r.thumbBlob);
        } catch {
          thumbDataUrl = "";
        }
        items.push({
          id: r.id,
          createdAt: r.createdAt,
          pageUrl: r.pageUrl,
          pageTitle: r.pageTitle,
          kind: r.kind,
          width: r.width,
          height: r.height,
          size: r.size,
          thumbDataUrl
        });
      }
      return items;
    } finally {
      db.close();
    }
  };
  var getItemDataUrl = async (id) => {
    const db = await openDB();
    try {
      const rec = await new Promise((res, rej) => {
        const tr = db.transaction(STORE, "readonly");
        const req = tr.objectStore(STORE).get(id);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error ?? new Error("get failed"));
      });
      if (!rec) return null;
      return await blobToDataUrl(rec.blob);
    } finally {
      db.close();
    }
  };
  var deleteItem = async (id) => {
    const db = await openDB();
    try {
      await new Promise((res, rej) => {
        const tr = db.transaction(STORE, "readwrite");
        tr.objectStore(STORE).delete(id);
        tr.oncomplete = () => res();
        tr.onerror = () => rej(tr.error ?? new Error("delete failed"));
        tr.onabort = () => rej(tr.error ?? new Error("delete aborted"));
      });
    } finally {
      db.close();
    }
  };
  var clearAll = async () => {
    const db = await openDB();
    try {
      await new Promise((res, rej) => {
        const tr = db.transaction(STORE, "readwrite");
        tr.objectStore(STORE).clear();
        tr.oncomplete = () => res();
        tr.onerror = () => rej(tr.error ?? new Error("clear failed"));
        tr.onabort = () => rej(tr.error ?? new Error("clear aborted"));
      });
    } finally {
      db.close();
    }
  };

  // src/background.ts
  (() => {
    const handleCapture = (sender, sendResponse) => {
      const windowId = sender.tab?.windowId;
      if (windowId === void 0) {
        sendResponse({ error: "no windowId" });
        return true;
      }
      chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message ?? "capture failed" });
        } else {
          sendResponse({ dataUrl });
        }
      });
      return true;
    };
    const errMsg = (e) => e instanceof Error ? e.message : String(e);
    const handleHistory = async (msg, sendResponse) => {
      try {
        if (msg.type === "saveScreenshot") {
          const out = await addItem({
            dataUrl: msg.dataUrl,
            pageUrl: msg.pageUrl,
            pageTitle: msg.pageTitle,
            kind: msg.kind,
            width: msg.width,
            height: msg.height
          });
          sendResponse({ ok: true, id: out.id, pruned: out.pruned });
          return;
        }
        if (msg.type === "listScreenshots") {
          const items = await listItems();
          sendResponse({ ok: true, items });
          return;
        }
        if (msg.type === "getScreenshot") {
          const dataUrl = await getItemDataUrl(msg.id);
          if (dataUrl === null) {
            sendResponse({ ok: false, error: "not found" });
            return;
          }
          sendResponse({ ok: true, dataUrl });
          return;
        }
        if (msg.type === "deleteScreenshot") {
          await deleteItem(msg.id);
          sendResponse({ ok: true });
          return;
        }
        if (msg.type === "clearScreenshots") {
          await clearAll();
          sendResponse({ ok: true });
          return;
        }
      } catch (err) {
        sendResponse({ ok: false, error: errMsg(err) });
      }
    };
    chrome.runtime.onMessage.addListener(
      (msg, sender, sendResponse) => {
        if (msg?.type === "captureVisibleTab") {
          return handleCapture(sender, sendResponse);
        }
        if (msg?.type === "saveScreenshot" || msg?.type === "listScreenshots" || msg?.type === "getScreenshot" || msg?.type === "deleteScreenshot" || msg?.type === "clearScreenshots") {
          void handleHistory(msg, sendResponse);
          return true;
        }
        return void 0;
      }
    );
  })();
})();
//# sourceMappingURL=background.js.map
