'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePartnerLang } from '@/lib/i18n-partner';

export default function PartnerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = usePartnerLang();
  const links = [
    { href: '/partner', label: t.overview },
    { href: '/partner/leads', label: t.my_leads },
    { href: '/partner/commissions', label: lang === 'th' ? 'คอมมิชชั่น' : 'Commissions' },
    { href: '/partner/referrals', label: t.referrals },
  ];
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-1 md:gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  active ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang('th')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black ${lang === 'th' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            TH
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            EN
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-50 text-red-600 hover:bg-red-100"
          >
            ✕
          </button>
        </div>
      </div>
    </header>
  );
}
