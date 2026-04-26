export type HistoryKind = 'region' | 'fullpage';

export type HistoryRecord = {
  id: string;
  createdAt: number;
  pageUrl: string;
  pageTitle: string;
  kind: HistoryKind;
  width: number;
  height: number;
  size: number;
  blob: Blob;
  thumbBlob: Blob;
};

export type HistoryListItem = {
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

const DB_NAME = 'dsd-history';
const DB_VERSION = 1;
const STORE = 'screenshots';

const MAX_ITEMS = 50;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => rej(req.error ?? new Error('idb open failed'));
    req.onsuccess = () => res(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
  });

const promisifyReq = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error ?? new Error('idb request failed'));
  });

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error ?? new Error('blob read failed'));
    r.readAsDataURL(blob);
  });

const makeThumb = async (blob: Blob, maxDim = 320): Promise<Blob> => {
  const bmp = await createImageBitmap(blob);
  try {
    const ratio = Math.min(maxDim / bmp.width, maxDim / bmp.height, 1);
    const w = Math.max(1, Math.round(bmp.width * ratio));
    const h = Math.max(1, Math.round(bmp.height * ratio));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('offscreen 2d context unavailable');
    ctx.drawImage(bmp, 0, 0, w, h);
    return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.78 });
  } finally {
    bmp.close();
  }
};

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

const newId = (): string => {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${t}-${r}`;
};

export type AddInput = {
  dataUrl: string;
  pageUrl: string;
  pageTitle: string;
  kind: HistoryKind;
  width: number;
  height: number;
};

export const addItem = async (input: AddInput): Promise<{ id: string; pruned: number }> => {
  const blob = await dataUrlToBlob(input.dataUrl);
  const thumbBlob = await makeThumb(blob);
  const record: HistoryRecord = {
    id: newId(),
    createdAt: Date.now(),
    pageUrl: input.pageUrl,
    pageTitle: input.pageTitle,
    kind: input.kind,
    width: input.width,
    height: input.height,
    size: blob.size,
    blob,
    thumbBlob,
  };
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tr = db.transaction(STORE, 'readwrite');
    tr.objectStore(STORE).put(record);
    tr.oncomplete = () => res();
    tr.onerror = () => rej(tr.error ?? new Error('idb put failed'));
    tr.onabort = () => rej(tr.error ?? new Error('idb tx aborted'));
  });
  const pruned = await prune(db);
  db.close();
  return { id: record.id, pruned };
};

const prune = async (db: IDBDatabase): Promise<number> => {
  const tr = db.transaction(STORE, 'readwrite');
  const store = tr.objectStore(STORE);
  const idx = store.index('createdAt');
  const all = await promisifyReq(idx.getAll());
  const sorted = (all as HistoryRecord[]).slice().sort((a, b) => a.createdAt - b.createdAt);
  let totalBytes = sorted.reduce((s, r) => s + (r.size ?? 0), 0);
  let removed = 0;
  let i = 0;
  while ((sorted.length - i > MAX_ITEMS || totalBytes > MAX_TOTAL_BYTES) && i < sorted.length) {
    const victim = sorted[i]!;
    store.delete(victim.id);
    totalBytes -= victim.size ?? 0;
    removed++;
    i++;
  }
  await new Promise<void>((res, rej) => {
    tr.oncomplete = () => res();
    tr.onerror = () => rej(tr.error ?? new Error('prune failed'));
    tr.onabort = () => rej(tr.error ?? new Error('prune aborted'));
  });
  return removed;
};

export const listItems = async (): Promise<HistoryListItem[]> => {
  const db = await openDB();
  try {
    const records = await new Promise<HistoryRecord[]>((res, rej) => {
      const tr = db.transaction(STORE, 'readonly');
      const idx = tr.objectStore(STORE).index('createdAt');
      const req = idx.getAll();
      req.onsuccess = () => res(req.result as HistoryRecord[]);
      req.onerror = () => rej(req.error ?? new Error('list failed'));
    });
    records.sort((a, b) => b.createdAt - a.createdAt);
    const items: HistoryListItem[] = [];
    for (const r of records) {
      let thumbDataUrl = '';
      try {
        thumbDataUrl = await blobToDataUrl(r.thumbBlob);
      } catch {
        thumbDataUrl = '';
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
        thumbDataUrl,
      });
    }
    return items;
  } finally {
    db.close();
  }
};

export const getItemDataUrl = async (id: string): Promise<string | null> => {
  const db = await openDB();
  try {
    const rec = await new Promise<HistoryRecord | undefined>((res, rej) => {
      const tr = db.transaction(STORE, 'readonly');
      const req = tr.objectStore(STORE).get(id);
      req.onsuccess = () => res(req.result as HistoryRecord | undefined);
      req.onerror = () => rej(req.error ?? new Error('get failed'));
    });
    if (!rec) return null;
    return await blobToDataUrl(rec.blob);
  } finally {
    db.close();
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const db = await openDB();
  try {
    await new Promise<void>((res, rej) => {
      const tr = db.transaction(STORE, 'readwrite');
      tr.objectStore(STORE).delete(id);
      tr.oncomplete = () => res();
      tr.onerror = () => rej(tr.error ?? new Error('delete failed'));
      tr.onabort = () => rej(tr.error ?? new Error('delete aborted'));
    });
  } finally {
    db.close();
  }
};

export const clearAll = async (): Promise<void> => {
  const db = await openDB();
  try {
    await new Promise<void>((res, rej) => {
      const tr = db.transaction(STORE, 'readwrite');
      tr.objectStore(STORE).clear();
      tr.oncomplete = () => res();
      tr.onerror = () => rej(tr.error ?? new Error('clear failed'));
      tr.onabort = () => rej(tr.error ?? new Error('clear aborted'));
    });
  } finally {
    db.close();
  }
};
