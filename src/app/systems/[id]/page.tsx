import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/canonical';
import { sites } from '@/lib/site.config';

interface System {
  id: string;
  name: string;
  type: string;
  category: string | null;
  power_kw: number | null;
  capacity_kwh: number | null;
  price_thb: number | null;
  original_price_thb: number | null;
  specifications: any;
  images: string[];
  description: string | null;
  is_active: boolean;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: system } = await supabase
    .from('ejjimmy_solar_products')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', 'ejjimmy')
    .eq('is_active', true)
    .single();

  if (!system) {
    return { title: 'Not Found' };
  }

  const s = system as System;
  return {
    title: `${s.name} — ระบบโซล่าเซลล์ | Ejjimmy Solar`,
    description: s.description || `${s.name} จาก Ejjimmy Solar ในกระบี่`,
    alternates: {
      canonical: canonicalUrl(sites.ejjimmy, `/systems/${params.id}`),
    },
  };
}

export default async function SystemPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: system, error } = await supabase
    .from('ejjimmy_solar_products')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', 'ejjimmy')
    .eq('is_active', true)
    .single();

  if (error || !system) {
    notFound();
  }

  const t = await getTranslations('products');
  const s = system as System;
  const spec = s.specifications || {};
  const money = (n: number) => `฿${n.toLocaleString('th-TH')}`;

  return (
    <section className="block block--cream" id="system-page">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('typeSystem')}</p>
          <h1 lang="th">{s.name}</h1>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>{t('sysTotal')}</h3>
            <ul className="list-disc list-inside mt-2 text-sm text-muted">
              {s.category && <li>{t('segment')}: <span lang="th">{s.category}</span></li>}
              {s.power_kw && <li>{t('power')}: {s.power_kw} kW</li>}
              {s.capacity_kwh && <li>{t('capacity')}: {s.capacity_kwh} kWh</li>}
              {s.price_thb && <li>{t('price')}: {money(s.price_thb)}</li>}
              {spec.grid_type && <li>{t('gridType')}: <span lang="th">{spec.grid_type}</span></li>}
              {spec.confidence && <li>{t('dataConfidence')}: <span lang="th">{spec.confidence}</span></li>}
            </ul>
            <h4 className="mt-4">{t('kitIncludes')}</h4>
            <p className="text-sm text-muted" lang="th">
              {spec.bom_key_items || t('bomPending')}
            </p>
          </div>

          <div className="card pick">
            <div className="pick-head">
              <h3>{t('order')}</h3>
              <p className="pick-sub">{t('freeVisit')}</p>
            </div>
            <p className="pick-desc">{t('visitNote')}</p>
            <a href="#contact" className="btn btn--primary btn--lg">
              {t('orderFor', { name: s.name })}
            </a>
          </div>
        </div>

        {spec.market_evidence && (
          <div className="card mt-6">
            <h3>{t('marketContext')}</h3>
            <p className="prose prose-slate dark:prose-invert" lang="th">{spec.market_evidence}</p>
            {spec.our_position && (
              <p className="mt-2">
                <strong>{t('ourPosition')}:</strong> <span lang="th">{spec.our_position}</span>
              </p>
            )}
            {spec.barrier_to_entry && (
              <p className="mt-2">
                <strong>{t('entryBarrier')}:</strong> <span lang="th">{spec.barrier_to_entry}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
