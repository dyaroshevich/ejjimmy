import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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
    title: `${s.name} — система солнечных панелей | Ejjimmy Solar`,
    description: s.description || `${s.name} от Ejjimmy Solar в Краби`,
    alternates: {
      canonical: `https://ejjimmy-clean.vercel.app/systems/${params.id}`,
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

  const s = system as System;
  const spec = s.specifications || {};

  return (
    <section className="block block--cream" id="system-page">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">Готовые системы</p>
          <h1>{s.name}</h1>
        </div>

        <div className="grid2">
          <div className="card">
            <h3>Параметры системы</h3>
            <ul className="list-disc list-inside mt-2 text-sm text-muted">
              {s.category && <li>Сегмент: {s.category}</li>}
              {s.power_kw && <li>Мощность: {s.power_kw} кВт</li>}
              {s.capacity_kwh && <li>Ёмкость батареи: {s.capacity_kwh} кВт·ч</li>}
              {s.price_thb && <li>Стоимость под ключ: ฿{s.price_thb.toLocaleString()}</li>}
              {spec.grid_type && <li>Тип сети: {spec.grid_type}</li>}
              {spec.confidence && <li>Достоверность: {spec.confidence}</li>}
            </ul>
            <h4 className="mt-4">BOM (состав системы)</h4>
            <p className="text-sm text-muted">{spec.bom_key_items || 'Состав уточняется у инженера'}</p>
          </div>

          <div className="card pick">
            <div className="pick-head">
              <h3>Заказать систему</h3>
              <p className="pick-sub">Выезд инженера бесплатно</p>
            </div>
            <p className="pick-desc">
              Приедем на объект, замерим крышу и предложим точную конфигурацию.
            </p>
            <a href="#contact" className="btn btn--primary btn--lg">
              Заказать систему {s.name}
            </a>
          </div>
        </div>

        {spec.market_evidence && (
          <div className="card mt-6">
            <h3>Рыночный контекст</h3>
            <p className="prose prose-slate dark:prose-invert">{spec.market_evidence}</p>
            {spec.our_position && <p className="mt-2"><strong>Наша позиция:</strong> {spec.our_position}</p>}
            {spec.barrier_to_entry && <p className="mt-2"><strong>Барьеры входа:</strong> {spec.barrier_to_entry}</p>}
          </div>
        )}
      </div>
    </section>
  );
}