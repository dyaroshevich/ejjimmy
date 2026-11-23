'use client';

import { useEffect } from 'react';

/**
 * LineStyleAdapter - Lightweight component to apply LINE-specific CSS classes.
 * Does NOT initialize the LIFF SDK to avoid race conditions and 400 errors.
 */
export default function LineStyleAdapter() {
  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isLine = /Line\//i.test(ua) || /LIFF/i.test(ua);

    if (isLine) {
      document.documentElement.classList.add('line-browser');
      document.documentElement.setAttribute('data-platform', 'liff');
      console.log('📱 LINE browser detected: Adaptation classes applied.');
    }
  }, []);

  return null;
}
