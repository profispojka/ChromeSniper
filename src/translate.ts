declare global {
  interface Window {
    Translator?: TranslatorStatic;
    LanguageDetector?: LanguageDetectorStatic;
  }
  const Translator: TranslatorStatic | undefined;
  const LanguageDetector: LanguageDetectorStatic | undefined;
}

type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface TranslatorStatic {
  availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<Availability>;
  create(opts: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorInstance>;
}

interface TranslatorInstance {
  translate(text: string): Promise<string>;
  destroy?(): void;
}

interface LanguageDetectorStatic {
  availability(): Promise<Availability>;
  create(): Promise<LanguageDetectorInstance>;
}

interface LanguageDetectorInstance {
  detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
  destroy?(): void;
}

export function browserLanguage(): string {
  return (navigator.language || 'en').split('-')[0]!.toLowerCase();
}

export async function detectLanguage(text: string): Promise<string | null> {
  if (!text.trim()) return null;

  if (typeof LanguageDetector !== 'undefined') {
    try {
      const avail = await LanguageDetector.availability();
      if (avail !== 'unavailable') {
        const detector = await LanguageDetector.create();
        const results = await detector.detect(text);
        detector.destroy?.();
        const best = results.find((r) => r.detectedLanguage && r.detectedLanguage !== 'und');
        if (best) return best.detectedLanguage.toLowerCase();
      }
    } catch (err) {
      console.warn('LanguageDetector failed', err);
    }
  }

  try {
    const result = await chrome.i18n.detectLanguage(text);
    const top = result.languages.sort((a, b) => b.percentage - a.percentage)[0];
    if (top && top.language && top.language !== 'und') return top.language.toLowerCase();
  } catch (err) {
    console.warn('chrome.i18n.detectLanguage failed', err);
  }

  return null;
}

export async function translate(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<string | null> {
  if (typeof Translator === 'undefined') return null;
  if (sourceLanguage === targetLanguage) return text;

  try {
    const avail = await Translator.availability({ sourceLanguage, targetLanguage });
    if (avail === 'unavailable') return null;
    const translator = await Translator.create({ sourceLanguage, targetLanguage });
    const out = await translator.translate(text);
    translator.destroy?.();
    return out;
  } catch (err) {
    console.warn('Translator failed', err);
    return null;
  }
}

const ISO3_TO_ISO1: Record<string, string> = {
  eng: 'en',
  ces: 'cs',
  deu: 'de',
  fra: 'fr',
  spa: 'es',
  ita: 'it',
  pol: 'pl',
  rus: 'ru',
  jpn: 'ja',
  chi_sim: 'zh',
  chi_tra: 'zh',
  por: 'pt',
  nld: 'nl',
  swe: 'sv',
  ukr: 'uk',
  tur: 'tr',
  ara: 'ar',
  kor: 'ko',
  hin: 'hi',
};

export function tesseractToBcp47(code: string): string {
  return ISO3_TO_ISO1[code] ?? code;
}
