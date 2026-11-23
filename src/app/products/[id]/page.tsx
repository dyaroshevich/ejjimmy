import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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
    title: `${p.name} — цена и характеристики | Ejjimmy Solar`,
    description: p.description || `${p.name} ${p.brand ? p.brand : ''} ${p.model ? p.model : ''} от Ejjimmy Solar в Краби`,
    alternates: {
      canonical: `https://ejjimmy-clean.vercel.app/products/${params.id}`,
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

  const p = product as Product;
  const spec = p.specifications || {};

  return (
    <section className="block block--cream" id="product-page">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">Каталог оборудования</p>
          <h1>{p.name}</h1>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>Характеристики</h3>
            <ul className="list-disc list-inside mt-2 text-sm text-muted">
              {p.brand && <li>Бренд: {p.brand}</li>}
              {p.model && <li>Модель: {p.model}</li>}
              {p.category && <li>Категория: {p.category}</li>}
              {p.power_kw && <li>Мощность: {p.power_kw} кВт</li>}
              {p.capacity_kwh && <li>Ёмкость: {p.capacity_kwh} кВт·ч</li>}
              {p.price_thb && <li>Цена: ฿{p.price_thb.toLocaleString()}</li>}
              {p.original_price_thb && <li>Розничная цена: ฿{p.original_price_thb.toLocaleString()}</li>}
              {spec.confidence && <li>Достоверность данных: {spec.confidence}</li>}
              {spec.supplier && <li>Поставщики: {spec.supplier}</li>}
              {spec.warranty_months && <li>Гарантия: {spec.warranty_months} месяцев</li>}
            </ul>
          </div>

          <div className="card pick">
            <div className="pick-head">
              <h3>Заказать расчёт</h3>
              <p className="pick-sub">Бесплатно и без обязательств</p>
            </div>
            <p className="pick-desc">
              Оставьте заявку — и наш инженер свяжется с вами в течение 24 часов.
            </p>
            <a href="#contact" className="btn btn--primary btn--lg">
              Получить расчёт для {p.name}
            </a>
          </div>
        </div>

        {spec.notes && (
          <div className="card mt-6">
            <h3>Описание</h3>
            <p className="prose prose-slate dark:prose-invert">{spec.notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}