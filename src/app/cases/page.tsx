import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase-server';
import { Zap, MapPin, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { selectLocaleRows } from '@/lib/locale-rows';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('casesList');
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

interface SolarCase {
  id: number;
  slug: string;
  customer_name: string;
  location_name: string;
  system_kw: number;
  case_description: string;
  savings_annual_thb: number;
  media_assets: {
    cover: string;
    video?: string;
    gallery?: string[];
  };
  metadata: {
    total_investment?: number;
    mounting_time?: string;
    panels_count?: number;
    system_type?: string;
  };
  locale?: string | null;
}

async function getCases(locale: string): Promise<SolarCase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('solar_cases')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch cases:', error);
    return [];
  }
  return selectLocaleRows<SolarCase>((data || []) as SolarCase[], locale);
}

export default async function CasesListPage() {
  const locale = await getLocale();
  const cases = await getCases(locale);
  const t = await getTranslations('casesList');
  const tc = await getTranslations('caseContent');
  const ov = (slug: string, field: string, fb: string): string => {
    try {
      const k = `${slug}.${field}`;
      return tc.has(k) ? tc(k) : fb;
    } catch {
      return fb;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <section className="pt-32 pb-20 px-6 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <Badge className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
            {t('badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-tight">
            {t('titleA')}<span className="text-orange-600">{t('titleB')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm uppercase tracking-[0.2em] max-w-2xl mx-auto opacity-80">
            {t('sub')}
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {cases.length === 0 ? (
            <div className="text-center py-20">
              <Zap className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={64} />
              <p className="text-slate-400 font-bold uppercase tracking-widest">{t('empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((item) => {
                const coverUrl = item.media_assets?.cover?.startsWith('http')
                  ? item.media_assets.cover
                  : `/images/${item.media_assets?.cover || 'hero-solar.jpg'}`;

                return (
                  <Link
                    key={item.id}
                    href={`/cases/${item.slug}`}
                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.1)] hover:border-orange-500/20 transition-all duration-500"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={coverUrl}
                        alt={ov(item.slug, 'title', item.customer_name)}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-orange-600 dark:text-orange-400 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                          <MapPin size={10} /> {ov(item.slug, 'location', item.location_name)}
                        </Badge>
                      </div>
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-orange-600/90 backdrop-blur-md text-white border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                          {item.system_kw} kW
                        </Badge>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter group-hover:text-orange-600 transition-colors leading-tight mb-4">
                        {ov(item.slug, 'title', item.customer_name)}
                      </h3>

                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide opacity-70 line-clamp-2 mb-6">
                        {ov(item.slug, 'desc', item.case_description)}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">
                            <TrendingUp size={10} /> {t('saveYear')}
                          </div>
                          <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                            ฿{(item.savings_annual_thb || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">
                            <Clock size={10} /> {t('duration')}
                          </div>
                          <div className="text-lg font-black text-slate-900 dark:text-white">
                            {ov(item.slug, 'mounting', item.metadata?.mounting_time || '')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                          {t('view')} <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">
            {t('footA')}<br />
            <span className="text-orange-400">{t('footB')}</span>
          </h2>
          <p className="text-orange-100/40 font-bold text-sm md:text-base max-w-xl mx-auto leading-relaxed uppercase tracking-wider px-4">
            {t('footSub')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/" className="h-16 px-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
              {t('homeBtn')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
