'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';

export function LineLoginButton() {
  const t = useTranslations('line');
  const [userName, setUserName] = useState<string | null>(null);
  const [isLine, setIsLine] = useState(false);

  useEffect(() => {
    const name = sessionStorage.getItem('liff_display_name');
    if (name) setUserName(name);

    const ua = navigator.userAgent || '';
    setIsLine(/Line\//i.test(ua) || /LIFF/i.test(ua));
  }, []);

  const handleLogin = async () => {
    try {
      const liff = (await import('@line/liff')).default;
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID || process.env.NEXT_PUBLIC_LINE_LIFF_ID || '2010020881-koR53fSr';
      
      if (!liff.id) {
        await liff.init({ liffId });
      }

      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const profile = await liff.getProfile();
        setUserName(profile.displayName);
        sessionStorage.setItem('liff_display_name', profile.displayName);
        if (profile.pictureUrl) sessionStorage.setItem('liff_picture_url', profile.pictureUrl);
      }
    } catch (err) {
      console.error('LINE Login Error:', err);
    }
  };

  if (userName) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800 animate-in fade-in">
        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
        <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">
          {t('hello', { name: userName })}
        </span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogin}
      className="rounded-full flex items-center gap-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 text-[10px] font-bold uppercase tracking-wider"
    >
      <MessageSquare size={14} className="fill-orange-600/10" />
      {isLine ? t('connectLine') : t('loginLine')}
    </Button>
  );
}
