import { createWorker, type Worker } from 'tesseract.js';

export type OcrLine = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
};

export type OcrResult = {
  text: string;
  lines: OcrLine[];
  width: number;
  height: number;
};

const TRAINEDDATA_CDN = 'https://tessdata.projectnaptha.com/4.0.0_fast';
const DEFAULT_LANGS = ['eng', 'ces'];

const workerOptions = (): Partial<Tesseract.WorkerOptions> => ({
  workerPath: chrome.runtime.getURL('dist/lib/tesseract/worker.min.js'),
  corePath: chrome.runtime.getURL('dist/lib/tesseract/core/'),
  langPath: TRAINEDDATA_CDN,
  cacheMethod: 'write',
  workerBlobURL: false,
});

let workerPromise: Promise<Worker> | null = null;
let loadedLangs: string[] = [];

async function getWorker(langs: string[]): Promise<Worker> {
  const wantKey = [...langs].sort().join('+');
  const haveKey = [...loadedLangs].sort().join('+');

  if (workerPromise && wantKey === haveKey) return workerPromise;

  if (workerPromise) {
    const w = await workerPromise;
    await w.reinitialize(langs);
    loadedLangs = langs;
    return w;
  }

  workerPromise = createWorker(langs, 1, workerOptions());
  loadedLangs = langs;
  return workerPromise;
}

export async function recognize(
  blob: Blob,
  langs: string[] = DEFAULT_LANGS,
): Promise<OcrResult> {
  const worker = await getWorker(langs);
  const bitmap = await createImageBitmap(blob);
  const { data } = await worker.recognize(bitmap, {}, { blocks: true });
  bitmap.close();

  const lines: OcrLine[] = [];
  for (const block of data.blocks ?? []) {
    for (const para of block.paragraphs) {
      for (const line of para.lines) {
        const text = line.text.replace(/\s+$/, '');
        if (!text) continue;
        lines.push({ text, bbox: line.bbox, confidence: line.confidence });
      }
    }
  }
  const img = await createImageBitmap(blob);
  const result = { text: data.text.trim(), lines, width: img.width, height: img.height };
  img.close();
  return result;
}

export async function terminateWorker(): Promise<void> {
  if (!workerPromise) return;
  const w = await workerPromise;
  await w.terminate();
  workerPromise = null;
  loadedLangs = [];
}
