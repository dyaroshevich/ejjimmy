import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { routing } from '../i18n';
import { resolveBrandCopy } from './lib/brand-copy';
import { getSite } from './lib/site-server';

// No URL prefixes: locale comes from NEXT_LOCALE cookie,
// then Accept-Language (ranked by q), then the default — which is Thai.
function negotiate(accept: string, valid: string[]): string | undefined {
  // RFC 9110 only *recommends* that a client list languages in preference order, so matching the
  // header left-to-right can hand the page to a q=0.9 language written above the q=1.0 one.
  const ranked = accept
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      const qParam = params.map((p) => /^\s*q\s*=\s*([\d.]+)/i.exec(p)?.[1]).find((v) => v !== undefined);
      const q = qParam === undefined ? 1 : Number(qParam);
      return { tag: rawTag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter(({ tag, q }) => tag && tag !== '*' && q > 0)
    .sort((a, b) => b.q - a.q); // stable, so equal q keeps the client's own order

  for (const { tag } of ranked) {
    const exact = valid.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    const base = tag.split('-')[0];
    const region = valid.find((l) => l.toLowerCase().split('-')[0] === base);
    if (region) return region;
  }
  return undefined;
}

function resolveLocale(): string {
  const valid = routing.locales as unknown as string[];

  // A `/en/...` (or any prefixed) URL outranks the cookie: the address says the language.
  const fromPath = headers().get('x-locale');
  if (fromPath && valid.includes(fromPath)) return fromPath;

  const fromCookie = cookies().get('NEXT_LOCALE')?.value;
  if (fromCookie && valid.includes(fromCookie)) return fromCookie;

  const accept = headers().get('accept-language');
  if (accept) {
    const hit = negotiate(accept, valid);
    if (hit) return hit;
  }

  return routing.defaultLocale;
}

export const ogLocaleFor = (locale: string): string =>
  ({
    th: 'th_TH', en: 'en_US', 'zh-CN': 'zh_CN', ru: 'ru_RU',
    de: 'de_DE', fr: 'fr_FR', ja: 'ja_JP', ko: 'ko_KR',
  }[locale] || 'th_TH');

export const dateLocaleFor = (locale: string): string =>
  ({
    th: 'th-TH', en: 'en-US', 'zh-CN': 'zh-CN', ru: 'ru-RU',
    de: 'de-DE', fr: 'fr-FR', ja: 'ja-JP', ko: 'ko-KR',
  }[locale] || 'th-TH');

export default getRequestConfig(async () => {
  const locale = resolveLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;

  // The copy pack holds the brand and the city as `{brand}` / `{city}` (stage 3), and this is the
  // one place every request passes through — server translators and the client provider both read
  // the tree returned here, so no component has to carry the values. The site decides what they are.
  return {
    locale,
    messages: resolveBrandCopy(messages, locale, getSite()),
  };
});
