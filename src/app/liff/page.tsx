'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { brand } from '@/lib/site.config';

export default function LiffPage() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initLiff = async () => {
      try {
        const liff = (await import('@line/liff')).default;
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || process.env.NEXT_PUBLIC_LINE_LIFF_ID || '2010020881-koR53fSr';

        // Initialize LIFF without forcing login
        await liff.init({ liffId });

        if (!mounted) return;

        // If logged in, capture profile for session storage (optional/async)
        if (liff.isLoggedIn()) {
          try {
            const profile = await liff.getProfile();
            if (profile.displayName) {
              sessionStorage.setItem('liff_display_name', profile.displayName);
              if (profile.pictureUrl) sessionStorage.setItem('liff_picture_url', profile.pictureUrl);
            }
          } catch (pErr) {
            console.warn('Profile fetch failed', pErr);
          }
        }

        if (mounted) {
          setStatus('success');
          // Check for proposal request in query params
          const params = new URLSearchParams(window.location.search);
          const leadId = params.get('leadId');
          const uid = params.get('uid');
          if (leadId) {
            const qs = uid ? `?uid=${encodeURIComponent(uid)}` : '';
            window.location.replace(`/proposal/${leadId}${qs}`);
          } else {
            window.location.replace('/');
          }
        }

      } catch (err: any) {
        console.error('LIFF Init Error:', err);
        if (mounted) {
          setError(err.message || 'Unknown error');
          setStatus('error');
          // Even on error, we might want to redirect to / to let user use the site
          setTimeout(() => {
            if (mounted) window.location.replace('/');
          }, 3000);
        }
      }
    };

    initLiff();
    return () => { mounted = false; };
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">กำลังเข้าสู่ระบบ...</h1>
        <p className="text-slate-400 text-sm mb-6">กำลังนำคุณไปยังหน้าหลัก</p>
        <Loader2 className="text-orange-600 w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="text-orange-600 w-10 h-10 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse text-sm">
          กำลังเปิด{brand.nameTh}...
        </p>
      </div>
    </div>
  );
}

