import { Button } from '@/components/ui/button';
import { Home, Sun } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSite } from '@/lib/site-server';

export function generateMetadata(): Metadata {
  const { brand } = getSite();
  return {
    title: `Page Not Found - ${brand.nameTh} | ${brand.name}`,
    description: 'The page you are looking for does not exist.',
    robots: 'noindex, nofollow',
  };
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto animate-sun-glow">
          <Sun size={44} className="text-orange-500" aria-hidden="true" />
        </div>
        
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">Error 404</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            ไม่พบหน้านี้
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
            หน้าที่คุณกำลังมองหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่
          </p>
        </div>

        <Link href="/">
          <Button
            className="h-14 px-8 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl border-none"
          >
            <Home size={18} className="mr-2" /> กลับหน้าหลัก
          </Button>
        </Link>
      </div>
    </div>
  );
}
