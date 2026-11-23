'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 's1-pwa-install-dismissed';
const DISMISS_DAYS = 30;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function PWAInstallBanner() {
  const t = useTranslations('pwa');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw && Date.now() - Number(raw) < DISMISS_DAYS * 864e5) return;
    } catch { /* storage unavailable — still offer install */ }

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    // iOS has no beforeinstallprompt — show the manual hint after a beat
    // so it never flashes on load.
    const timer = ios ? window.setTimeout(() => setVisible(true), 2500) : 0;
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) {
      dismiss();
      return;
    }
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    dismiss();
  };

  return (
    <div
      role="dialog"
      aria-label={t('installTitle')}
      className="pointer-events-auto w-full max-w-sm rounded-2xl border border-orange-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl shadow-orange-600/10 px-3 py-2 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300"
    >
      <img src="/icons/icon-192x192.png" alt="" width={36} height={36} className="rounded-xl shrink-0 shadow-md" />
      <div className="flex-1 min-w-0 text-left">
        <p className="font-black text-[13px] text-slate-900 dark:text-white leading-tight truncate">{t('installTitle')}</p>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-px leading-snug truncate">
          {isIOS && !deferred ? t('iosHint') : t('installSub')}
        </p>
      </div>
      {!isIOS || deferred ? (
        <button
          onClick={install}
          className="shrink-0 h-9 px-4 rounded-full bg-orange-600 text-slate-950 text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 active:scale-95 transition-all"
        >
          {t('installBtn')}
        </button>
      ) : (
        <span className="shrink-0 h-9 px-3 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-black flex items-center gap-1.5">
          <Share size={14} /> <PlusSquare size={14} />
        </span>
      )}
      <button
        onClick={dismiss}
        aria-label={t('laterBtn')}
        className="shrink-0 w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center"
      >
        <X size={14} />
      </button>
    </div>
  );
}
