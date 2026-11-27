'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const KEY = 's1-cookie-consent';

export default function CookieConsent() {
  const t = useTranslations('leadForm');
  const tc = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch { /* storage unavailable — still ask */ }
    const t = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="pointer-events-auto w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl px-3.5 py-2.5 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300"
    >
      <p className="flex-1 min-w-0 text-[11px] font-semibold leading-snug text-slate-600 dark:text-slate-300">
        {tc('cookieMsg')}{' '}
        <Link href="/privacy" className="font-bold text-slate-900 dark:text-white underline">
          {t('consentLink')}
        </Link>
      </p>
      <button
        onClick={accept}
        className="shrink-0 h-9 px-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
      >
        {tc('cookieOk')}
      </button>
    </div>
  );
}
