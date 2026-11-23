import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ogLocaleFor } from '@/i18n';
import { createClient } from '@/lib/supabase-server';
import { createClient as supabaseJsClient } from '@supabase/supabase-js';
import { ArrowLeft, Zap, MapPin, TrendingUp, Clock, ShieldCheck, Package, Info, Camera, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import CaseGallery from '@/components/cases/CaseGallery';
import CaseHeroImage from '@/components/cases/CaseHeroImage';
import CaseHeroParallax from '@/components/cases/CaseHeroParallax';
import CaseFinancingCalculator from '@/components/cases/CaseFinancingCalculator';
import CaseMap from '@/components/cases/CaseMap';
import { selectLocaleRows } from '@/lib/locale-rows';
import { getSite } from '@/lib/site-server';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

interface SolarCase {
  id: number;
  slug: string;
  customer_name: string;
  location_name: string;
  lat: number;
  lng: number;
  system_kw: number;
  case_description: string;
  customer_quote: string;
  media_assets: {
    cover: string;
    video?: string;
    gallery?: string[];
  };
  metadata: {
    total_investment?: number;
    mounting_time?: string;
    battery?: string;
    inverter?: string;
    panels_count?: number;
    system_type?: string;
  };
  savings_annual_thb: number;
  panel_brand?: string;
  inverter_brand?: string;
  published: boolean;
  created_at: string;
  locale?: string | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const { brand, url: siteUrl } = getSite();
  const supabase = createClient();
  const { data: casesData } = await supabase
    .from('solar_cases')
    .select('id, slug, customer_name, location_name, lat, lng, system_kw, case_description, customer_quote, media_assets, metadata, savings_annual_thb, panel_brand, inverter_brand, published, created_at, locale')
    .eq('slug', params.slug);

  const caseData = selectLocaleRows<SolarCase>(casesData || [], locale)[0];

  const td = await getTranslations('caseDetail');
  if (!caseData) return { title: td('notFound') };

  const tc = await getTranslations('caseContent');
  const ov = (field: string, fb: string): string => {
    try {
      const k = `${params.slug}.${field}`;
      return tc.has(k) ? tc(k) : fb;
    } catch {
      return fb;
    }
  };
  const title = `${ov('title', caseData?.customer_name || '')} | ${brand.name}`;
  const description = ov('desc', caseData?.case_description || '');
  const imageUrl = caseData?.media_assets?.cover?.startsWith('http')
    ? caseData.media_assets.cover
    : `${siteUrl}/images/${caseData?.media_assets?.cover || 'hero-solar.jpg'}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: 'article',
      siteName: brand.name,
      locale: ogLocaleFor(await getLocale()),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  };
}

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return [];
  }

  const supabase = supabaseJsClient(url, key);
  const { data: cases } = await supabase
    .from('solar_cases')
    .select('slug, locale')
    .eq('published', true);

  // Generate params for each locale version
  const params: { slug: string; locale: string }[] = [];
  for (const c of cases || []) {
    params.push({ slug: c.slug, locale: c.locale || 'th' });
  }
  return params;
}

export default async function CaseDetailPage({ params }: Props) {
  const locale = await getLocale();
  const { brand, url: siteUrl } = getSite();
  const supabase = createClient();

  const { data: casesData, error } = await supabase
    .from('solar_cases')
    .select('*')
    .eq('slug', params.slug);

  if (error || !casesData || casesData.length === 0) {
    notFound();
  }

  const c = selectLocaleRows<SolarCase>(casesData as unknown as SolarCase[], locale)[0];
  if (!c) {
    notFound();
  }

  const t = await getTranslations('caseDetail');
  const tc = await getTranslations('caseContent');
  const ov = (field: string, fb: string): string => {
    try {
      const k = `${c.slug}.${field}`;
      return tc.has(k) ? tc(k) : fb;
    } catch {
      return fb;
    }
  };
  const ovTitle = ov('title', c.customer_name);
  const ovLocation = ov('location', c.location_name);
  const ovDesc = ov('desc', c.case_description);
  const ovQuote = ov('quote', c.customer_quote || '');
  const ovMounting = ov('mounting', c.metadata?.mounting_time || '');

  const totalInvestment = c.metadata?.total_investment || 576000;
  const coverUrl = c.media_assets?.cover?.startsWith('http')
    ? c.media_assets.cover
    : `/images/${c.media_assets?.cover || 'hero-solar.jpg'}`;

  const videoUrl = c.media_assets?.video
    ? c.media_assets.video.startsWith('http')
      ? c.media_assets.video
      : `/videos/${c.media_assets.video}`
    : null;

  const images = c.media_assets?.gallery || [];
  const galleryImages = c.media_assets?.cover
    ? [c.media_assets.cover, ...images.filter(img => img !== c.media_assets.cover)]
    : images;

  const caseSchema = {
    "@context": "https://schema.org",
    "@type": "CaseStudy",
    "headline": ovTitle,
    "description": ovDesc,
    "image": coverUrl.startsWith('http') ? coverUrl : `${siteUrl}${coverUrl}`,
    "datePublished": c.created_at,
    "author": {
      "@type": "Organization",
      "name": brand.name,
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": brand.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/icons/icon-192x192.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/cases/${c.slug}`
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseSchema) }}
      />

      {/* Cinematic Photo Hero — parallax */}
      <CaseHeroParallax
        coverUrl={coverUrl}
        customerName={ovTitle}
        locationName={ovLocation}
        systemKw={c.system_kw}
      />

      {/* Project Specs Grid */}
      <section className="py-12 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('specSystem'), value: `${c.system_kw} kW`, icon: <Zap className="text-amber-400" /> },
              { label: t('specSave'), value: `฿${(c.savings_annual_thb || 0).toLocaleString()}`, icon: <TrendingUp className="text-orange-500" /> },
              { label: t('specTime'), value: ovMounting, icon: <Clock className="text-blue-400" /> },
              { label: t('specBatt'), value: c.metadata?.battery || 'Optional', icon: <ShieldCheck className="text-purple-400" /> }
            ].map((spec, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {spec.icon} {spec.label}
                </div>
                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight tabular-nums">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling Body */}
      <main className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-24">

            {/* Project Overview */}
            <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-20 border border-slate-100 dark:border-white/5 shadow-2xl space-y-12">
              <div className="space-y-8 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 shadow-inner">
                    <Info size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">
                    {t('overview')}
                  </h2>
                </div>
<div className="text-lg md:text-xl text-slate-500 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line border-l-2 border-orange-500/30 pl-8" lang="th">
                   {ovDesc}
                 </div>
                {ovQuote && (
                  <blockquote lang="th" className="border-l-2 border-orange-500 pl-8 text-lg md:text-xl font-bold text-slate-900 dark:text-white italic">
                    “{ovQuote}”
                  </blockquote>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-50 dark:border-white/5 text-left">
                {[
                  { label: t('budget'), val: `฿${totalInvestment.toLocaleString()}`, icon: <TrendingUp size={14} /> },
                  { label: t('saveYear'), val: `฿${(c.savings_annual_thb || 0).toLocaleString()}`, icon: <Zap size={14} /> },
                  { label: t('installTime'), val: ovMounting, icon: <Clock size={14} /> },
                  { label: t('payback'), val: t('paybackVal'), icon: <ShieldCheck size={14} /> }
                ].map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{s.icon} {s.label}</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{s.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Narrative 1 — Why Hybrid */}
            <section className="px-4 space-y-6 text-left">
              <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{t('whyHybrid', { kw: c.system_kw })}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-bold text-lg text-left">
                {t('whyBody', { kw: c.system_kw, battery: c.metadata?.battery || 'LFP' })}
              </p>
            </section>

            {/* Main Showcase Image — clickable lightbox */}
            <CaseHeroImage coverUrl={coverUrl} images={galleryImages} customerName={ovTitle} />

            {/* Narrative 2 — Premium Standards */}
            <section className="px-4 space-y-6 text-left">
              <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{t('premium')}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-bold text-lg text-left">
                {t('premiumBody', { location: ovLocation })}
              </p>
            </section>

            {/* Mid-Content Video */}
            {videoUrl && (
              <section className="space-y-10 text-left">
                <div className="flex items-center gap-4 px-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{t('video')}</h2>
                </div>
                <div className="rounded-[3.5rem] overflow-hidden bg-slate-900 aspect-video shadow-2xl relative">
                  <VideoPlayer
                    src={videoUrl}
                    controls
                    poster={coverUrl}
                    className="w-full h-full object-cover"
                  />
                </div>
              </section>
            )}

            {/* Hardware Section */}
            <section className="space-y-12 text-left">
              <div className="space-y-3 px-4">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">{t('tech')}</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Premium Tier 1 Equipment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: t('hwInv'), desc: c.metadata?.inverter || 'Deye Hybrid', detail: t('hwInvD'), icon: <Zap size={20} /> },
                  { title: t('hwPanel'), desc: t('hwPanelDesc', { productBrand: c.panel_brand || 'Premium', count: c.metadata?.panels_count || '—' }), detail: t('hwPanelSub'), icon: <Package size={20} /> },
                  { title: t('hwBat'), desc: c.metadata?.battery || 'LFP Battery', detail: t('hwBatD'), icon: <ShieldCheck size={20} /> },
                  { title: t('hwMount'), desc: 'Aluminum High-Grade', detail: t('hwMountD'), icon: <Clock size={20} /> }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 group hover:bg-orange-600 transition-all duration-500 text-left">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all mb-8 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</span>
                      <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase leading-none">{item.desc}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section className="space-y-12 text-left">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 shadow-inner">
                    <Camera size={24} />
                  </div>
                  {t('gallery')}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('photos', { n: galleryImages.length })}</p>
              </div>
              <CaseGallery images={galleryImages} />
            </section>

            {/* Map */}
            {c.lat && c.lng && (
              <section className="space-y-10 pb-12 text-left">
                <div className="flex items-center gap-4 px-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 shadow-inner">
                    <MapPin size={18} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{t('mapTitle', { location: ovLocation })}</h2>
                </div>
                <CaseMap lat={c.lat} lng={c.lng} locationName={ovLocation} />
              </section>
            )}

          </div>

          {/* Right Column — Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">

              {/* Financing Calculator */}
              <CaseFinancingCalculator
                totalInvestment={totalInvestment}
                annualSavings={c.savings_annual_thb || 95000}
                customerName={ovTitle}
              />

              {/* Sidebar CTA */}
              <div className="bg-slate-950 rounded-[3.5rem] p-10 md:p-14 border border-white/5 shadow-2xl text-center space-y-10">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-orange-600/20 rounded-[2rem] flex items-center justify-center text-orange-500 mx-auto shadow-inner border border-orange-500/20">
                    <Zap size={40} fill="currentColor" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{t('ctaT')}</h3>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed">
                      {t('ctaSub', { location: ovLocation })}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4 text-left">
                  {[
                    t('perk1'),
                    t('perk2'),
                    t('perk3'),
                    t('perk4')
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <CheckCircle2 size={12} className="text-orange-500 shrink-0" /> {t}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer CTA */}
      <section className="py-24 bg-slate-950 relative overflow-hidden mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
            {t('footA')} <br />
            <span className="text-orange-400">{t('footB')}</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="h-16 px-10 rounded-full bg-orange-600 text-white inline-flex items-center justify-center font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
            >
              {t('freeBtn')} <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              href="/cases"
              className="h-16 px-10 rounded-full border-2 border-white/20 text-white inline-flex items-center justify-center font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
            >
              {t('moreBtn')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
