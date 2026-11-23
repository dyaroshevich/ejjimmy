'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { localeHref, splitLocale } from '@/lib/locale-path';

const LOCALES = [
  { code: 'th', label: 'TH' },
  { code: 'en', label: 'EN' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ru', label: 'RU' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const;

// `className` replaces the built-in pill rather than adding to it: the landing header skins
// this control as the approved `.theme-btn`, and two class lists on one element just fight.
export default function LocaleSwitcher({ className }: { className?: string }) {
  // Seeded from the locale the server actually resolved. It used to start at 'th' and read the
  // cookie itself, so a visitor negotiated into EN saw TH selected on an English page — and once
  // the cookie was absent (the common first visit) the control always claimed Thai.
  const serverLocale = useLocale();
  const [locale, setLocale] = useState<string>(serverLocale);

  useEffect(() => {
    setLocale(serverLocale);
  }, [serverLocale]);

  const onChange = (code: string) => {
    setLocale(code);
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    // The prefix is the address of the language, so switching has to move the URL too. A full
    // load, not `router.push`: `<html lang>` lives in the root layout, and a client navigation
    // keeps the old one.
    const { path } = splitLocale(window.location.pathname);
    window.location.assign(localeHref(code, path) + window.location.search);
  };

  return (
    <select
      value={locale}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Language"
      className={className ?? 'h-9 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-bold tracking-wider px-2.5 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'}
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
