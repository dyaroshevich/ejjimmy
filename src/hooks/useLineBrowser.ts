'use client';

import { useEffect } from 'react';

export function useLineBrowser() {
  useEffect(() => {
    const applyLineStyles = async () => {
      // 1. Check via User Agent (fast check)
      const ua = navigator.userAgent || '';
      const isLineUA = /Line\//i.test(ua) || /LIFF/i.test(ua);

      // 2. Check via LIFF SDK (accurate check)
      let isLiffClient = false;
      try {
        const liff = (await import('@line/liff')).default;
        
        // Initialize LIFF if not already
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || process.env.NEXT_PUBLIC_LINE_LIFF_ID || '2010020881-koR53fSr';
        
        if (!liff.id) {
          await liff.init({ liffId }).catch(console.error);
        }

        isLiffClient = liff.isInClient();

        if (isLiffClient || isLineUA) {
        document.documentElement.classList.add('line-browser');
        document.documentElement.setAttribute('data-platform', 'liff');

        // Removed automatic liff.login() to avoid flow disruption

        // Try to get profile for personalization if already logged in
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          if (profile.displayName) {
            sessionStorage.setItem('liff_display_name', profile.displayName);
            if (profile.pictureUrl) sessionStorage.setItem('liff_picture_url', profile.pictureUrl);
          }
        }
        }      } catch (e) {
        console.log('useLineBrowser: LIFF check failed', e);
      }
    };

    applyLineStyles();
  }, []);
}
