/**
 * Shared chat-locale helpers (client + server).
 * Script detection is unambiguous for non-Latin; Latin scripts (en/de/fr)
 * are disambiguated with tiny high-precision wordlists.
 * ponytail: wordlists over franc/CLD — 3 locales, no deps, runs on edge.
 */

export type ChatLang = 'th' | 'en' | 'zh' | 'ru' | 'de' | 'fr' | 'ja' | 'ko' | 'uk';

const SUPPORTED: ChatLang[] = ['th', 'en', 'zh', 'ru', 'de', 'fr', 'ja', 'ko', 'uk'];

export function normalizeLocale(raw: unknown): ChatLang | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (v === 'zh-CN' || v === 'zh') return 'zh';
  return (SUPPORTED as string[]).includes(v) ? (v as ChatLang) : null;
}

/** Unambiguous non-Latin script signals. Order matters: kana/hangul before han. */
export function detectScriptLang(text: string): ChatLang | null {
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
  if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text)) return 'ko';
  if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text)) return 'zh';
  if (/[\u0456\u0457\u0454\u0491\u0406\u0407\u0404\u0490]/.test(text)) return 'uk';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  return null;
}

const WORDS: Record<'en' | 'de' | 'fr', string[]> = {
  en: ['the', 'and', 'you', 'for', 'what', 'how', 'price', 'cost', 'much', 'want', 'need', 'please', 'thanks', 'system', 'install', 'does', 'hello', 'does', 'with', 'about', 'your', 'from', 'have', 'this', 'that'],
  de: ['und', 'der', 'die', 'das', 'f\u00FCr', 'mit', 'wie', 'was', 'preis', 'kosten', 'bitte', 'danke', 'hallo', 'anlage', 'oder', 'nicht', 'ein', 'eine', 'ist', 'sind', 'welche'],
  fr: ['le', 'la', 'les', 'pour', 'avec', 'combien', 'prix', 'merci', 'bonjour', 'solaire', 'panneau', 'une', 'des', 'est', 'sont', 'quel', 'quelle', 'vous', 'nous'],
};

/** Latin-script disambiguation. Needs >=2 word hits to avoid false positives. */
export function detectLatinLang(text: string): 'en' | 'de' | 'fr' | null {
  const words = text.toLowerCase().split(/[^a-z\u00E4\u00F6\u00FC\u00E4\u00DF\u00E0-\u00FF]+/).filter(Boolean);
  const set = new Set(words);
  const scores = (Object.keys(WORDS) as Array<'en' | 'de' | 'fr'>).map((lang) => ({
    lang,
    hits: WORDS[lang].filter((w) => set.has(w)).length,
  }));
  scores.sort((a, b) => b.hits - a.hits);
  if (scores[0].hits >= 2 && scores[0].hits > scores[1].hits) return scores[0].lang;
  return null;
}

/** Remove [TAGS] so English SUGGEST queries don't poison detection. */
export function stripTags(text: string): string {
  return (text || '').replace(/\[[^\[\]\n]{0,200}\]/g, ' ');
}

/**
 * Best-effort language of a message. Returns fallback when there is
 * no confident signal (short texts, numbers, names, addresses).
 */
export function detectMessageLocale(text: string, fallback: ChatLang): ChatLang {
  const clean = stripTags(text);
  if (!/[a-zA-Z\u00C0-\u024F\u0E00-\u0E7F\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(clean)) return fallback;
  const script = detectScriptLang(clean);
  if (script) return script;
  return detectLatinLang(clean) || fallback;
}

/**
 * Strong switch signal: non-Latin script, or a Latin winner in a
 * message long enough to rule out names/addresses/numbers.
 */
export function isStrongSwitch(text: string, detected: ChatLang, current: ChatLang): boolean {
  if (detected === current) return false;
  const clean = stripTags(text);
  if (detectScriptLang(clean)) return true;
  return clean.length >= 12 && !!detectLatinLang(clean);
}
