'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-6xl">⚠️</span>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
            ขออภัยครับ เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="h-14 px-8 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl border-none"
          >
            <RotateCcw size={18} className="mr-2" /> ลองอีกครั้ง
          </Button>
          
          <Link href="/">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-full border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              <Home size={18} className="mr-2" /> กลับหน้าหลัก
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 font-mono">
            <summary className="cursor-pointer font-bold mb-2">Error Details (Dev Only)</summary>
            <pre className="whitespace-pre-wrap text-xs">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
