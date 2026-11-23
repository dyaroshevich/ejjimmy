'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);
  const t = useTranslations('admin');

  return (
    <div className="min-h-screen bg-[#1a0e00] text-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#3d260a]/40 backdrop-blur-md rounded-[3rem] border border-orange-800/50 p-10 space-y-6 text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <AlertCircle size={40} className="text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {t('errTitle')}
          </h2>
          <p className="text-sm text-orange-400/70 font-bold">
            {t('errSub')}
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-left">
            <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            className="w-full h-14 bg-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 transition-colors touch-manipulation"
          >
            <RefreshCw size={16} className="mr-2" /> {t('errRetry')}
          </Button>

          <Button
            onClick={() => (window.location.href = '/admin')}
            variant="outline"
            className="w-full h-14 border-orange-700/50 text-orange-100 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-orange-900/50 transition-colors touch-manipulation"
          >
            {t('errHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
