import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/canonical';
import { sites } from '@/lib/site.config';

interface Product {
  id: string;
  name: string;
  model: string | null;
  brand: string | null;
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
  const { data: product } = await supabase
    .from('ejjimmy_solar_products')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', 'ejjimmy')
    .eq('is_active', true)
    .single();

  if (!product) {
    return { title: 'Not Found' };
  }

  const p = product as Product;
  return {
    title: `${p.name} — ราคาและข้อมูล | Ejjimmy Solar`,
    description: p.description || `${p.name} ${p.brand ?? ''} ${p.model ?? ''} จาก Ejjimmy Solar ในกระบี่`,
    alternates: {
      canonical: canonicalUrl(sites.ejjimmy, `/products/${params.id}`),
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from('ejjimmy_solar_products')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', 'ejjimmy')
    .eq('is_active', true)
    .single();

  if (error || !product) {
    notFound();
  }

  const t = await getTranslations('products');
  const p = product as Product;
  const spec = p.specifications || {};
  const money = (n: number) => `฿${n.toLocaleString('th-TH')}`;

  return (
    <section className="block block--cream" id="product-page">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('kicker')}</p>
          <h1 lang="th">{p.name}</h1>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>{t('techSpecs')}</h3>
            <ul className="list-disc list-inside mt-2 text-sm text-muted">
              {p.brand && <li>{t('brand')}: <span lang="en">{p.brand}</span></li>}
              {p.model && <li>{t('unitModel')}: <span lang="en">{p.model}</span></li>}
              {p.category && <li>{t('category')}: <span lang="th">{p.category}</span></li>}
              {p.power_kw && <li>{t('power')}: {p.power_kw} kW</li>}
              {p.capacity_kwh && <li>{t('capacity')}: {p.capacity_kwh} kWh</li>}
              {p.price_thb && <li>{t('price')}: {money(p.price_thb)}</li>}
              {p.original_price_thb && (
                <li>
                  {t('retailPrice')}: {money(p.original_price_thb)}
                </li>
              )}
              {spec.confidence && <li>{t('dataConfidence')}: <span lang="th">{spec.confidence}</span></li>}
              {spec.supplier && <li>{t('supplier')}: <span lang="th">{spec.supplier}</span></li>}
              {spec.warranty_months && (
                <li>
                  {t('warranty')}: {spec.warranty_months} {t('months')}
                </li>
              )}
            </ul>
          </div>

          <div className="card pick">
            <div className="pick-head">
              <h3>{t('getQuote')}</h3>
              <p className="pick-sub">{t('freeQuoteNote')}</p>
            </div>
            <p className="pick-desc">{t('leadNote')}</p>
            <a href="#contact" className="btn btn--primary btn--lg">
              {t('quoteFor', { name: p.name })}
            </a>
          </div>
        </div>

        {(spec.notes || p.description) && (
          <div className="card mt-6">
            <h3>{t('descTitle')}</h3>
            <p className="prose prose-slate dark:prose-invert" lang="th">
              {spec.notes || p.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
