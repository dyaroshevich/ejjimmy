'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function PWAUpdateHandler() {
  const t = useTranslations('pwa');
  const toasted = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const notify = () => {
      if (toasted.current) return;
      toasted.current = true;
      toast.success(t('updated'), { duration: 4000 });
    };

    // next-pwa runs skipWaiting, so a fresh SW takes over on navigation —
    // controllerchange is the reliable "new version live" signal.
    navigator.serviceWorker.addEventListener('controllerchange', notify);
    // Edge case: first install on an already-controlled page.
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active && !navigator.serviceWorker.controller) notify();
    }).catch(() => { /* offline-first boot — nothing to announce */ });

    return () => navigator.serviceWorker.removeEventListener('controllerchange', notify);
  }, [t]);

  return null;
}
