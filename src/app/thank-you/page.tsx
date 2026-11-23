import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, MessageCircle, MessageSquareText, ArrowRight } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase-server';
import { getSolarProducts } from '@/lib/solar/db';
import { selectLocaleRows } from '@/lib/locale-rows';
import { getSite } from '@/lib/site-server';
import type { BrandIdentity, SiteContact } from '@/lib/site.config';

export function generateMetadata(): Metadata {
  const { brand } = getSite();
  return {
    title: `ขอบคุณ · Thank you — ${brand.name}`,
    description:
      'ได้รับข้อมูลของคุณแล้ว We received your details — we will call you back within 24 hours.',
  };
}

// Locales that carry their own copy; every other visitor language falls back to English.
type Lang = 'th' | 'en' | 'ru';

const copy = (brand: BrandIdentity, contact: SiteContact): Record<Lang, Record<string, string>> => ({
  th: {
    succeeds: 'ได้รับข้อมูลของคุณแล้ว',
    sub: `${brand.nameTh} จะโทรกลับภายใน 24 ชั่วโมง (ทุกวัน 9:00–18:00) เพื่อนัดสำรวจหน้างานฟรี`,
    line: `ทัก LINE ${contact.lineId}`,
    home: 'กลับหน้าหลัก',
    meanwhile: 'ดูระหว่างรอ',
    meanwhileSub: 'ราคาพร้อมติดตั้ง · ผ่อน 0% นาน 24 เดือน',
    ai: 'ไม่อยากรอสาย? เริ่มคุยกับที่ปรึกษา AI ได้เลย',
    aiBtn: 'คุยกับ AI ฟรี',
    cases: 'ดูบ้านและร้านค้าที่ติดตั้งเรียบร้อยแล้ว',
    casesBtn: 'เรื่องจริงจากกระบี่',
  },
  en: {
    succeeds: 'We received your details',
    sub: `The ${brand.name} team will call you back within 24 hours (daily 9:00–18:00) to arrange a free site survey.`,
    line: `Message us on LINE ${contact.lineId}`,
    home: 'Back to home',
    meanwhile: 'While you wait',
    meanwhileSub: 'Installed price · 0% instalments for 24 months',
    monthly: 'from ฿0/mo · 0% · 24 months',
    ai: 'Rather not wait for a call? Start with the AI consultant now.',
    aiBtn: 'Ask the AI — free',
    cases: 'Homes and businesses in Krabi already running on solar',
    casesBtn: 'Real Krabi stories',
  },
  ru: {
    succeeds: 'Заявка получена',
    sub: `Команда ${brand.name} свяжется с вами в течение 24 часов (ежедневно 9:00–18:00), чтобы договориться о бесплатном осмотре объекта.`,
    line: `Написать в LINE ${contact.lineId}`,
    home: 'На главную',
    meanwhile: 'Пока вы ждёте',
    meanwhileSub: 'Цена «под ключ» · рассрочка 0% на 24 месяца',
    monthly: 'от ฿0 в мес · 0% · 24 мес',
    ai: 'Не хотите ждать звонка? Спросите ИИ-консультанта прямо сейчас.',
    aiBtn: 'Спросить ИИ — бесплатно',
    cases: 'Дома и магазины в Краби, уже переведённые на солнечную энергию',
    casesBtn: 'Истории из Краби',
  },
});

export default async function ThankYouPage() {
  const resolved = await getLocale();
  const lang = (resolved === 'th' || resolved === 'ru' ? resolved : 'en') as Lang;
  const site = getSite();
  const C = copy(site.brand, site.contact);
  const t = (l: Lang) => C[l] ?? C.en;
  const c = t(lang);

  // Three smallest real systems by size, localized for this visit, catalog = same DB rows.
  let top: Array<{ id: string; name: string; image_url?: string | null; power_kw?: number | null; price_thb?: number | null }> = [];
  try {
    const { data } = await getSolarProducts({ limit: 100, supabase: createClient() });
    top = selectLocaleRows(data, resolved ?? 'th')
      .filter((r: any) => r.type === 'system')
      .sort((a: any, b: any) => (a.power_kw ?? 0) - (b.power_kw ?? 0))
      .slice(0, 3);
  } catch {
    // Catalog may fail while the DB is down — the confirmation itself must still render.
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        {/* Confirmation */}
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
            <CheckCircle2 className="h-9 w-9 text-orange-600 dark:text-orange-400" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {c.succeeds}
          </h1>
          <p lang={lang} className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {c.sub}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.contact.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#06c755] px-6 py-3.5 font-bold text-white shadow-sm transition hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {c.line}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {c.home}
            </Link>
          </div>
        </div>

        {/* Recommended systems while waiting */}
        {top.length > 0 && (
          <section className="mt-16" aria-labelledby="ty-systems">
            <h2 id="ty-systems" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {c.meanwhile}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.meanwhileSub}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {top.map((p) => (
                <Link
                  key={p.id}
                  href="/#systems"
                  className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative aspect-[4/3] bg-white">
                    {p.image_url && (
                      <Image
                        src={p.image_url}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 300px, 100vw"
                        className="object-contain p-4 transition group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    {p.power_kw ? (
                      <p className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                        {p.power_kw} kW
                      </p>
                    ) : null}
                    <h3 lang="th" className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900 dark:text-white">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                      ฿{(p.price_thb ?? 0).toLocaleString('en-US')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.price_thb ? `฿${Math.round((p.price_thb * 0.9) / 24).toLocaleString('en-US')}/mo · 0% · 24` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AI consultant */}
        <Link
          href="/chat"
          className="mt-12 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <MessageSquareText className="mt-1 h-8 w-8 shrink-0 text-orange-400" aria-hidden="true" />
            <div>
              <p lang={lang} className="font-bold leading-snug">{c.ai}</p>
              <p className="mt-1 text-sm text-slate-400">{site.brand.name} · AI</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 font-bold transition hover:bg-orange-500">
            {c.aiBtn}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>

        {/* Cases */}
        <Link
          href="/cases"
          className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="pr-4">
            <p lang={lang} className="font-bold text-slate-900 dark:text-white">{c.cases}</p>
            <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">{c.casesBtn} →</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 text-slate-400" aria-hidden="true" />
        </Link>
      </main>
    </div>
  );
}
