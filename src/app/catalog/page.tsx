import { createClient } from '@/lib/supabase-server';

interface Product {
  id: string;
  name: string;
  model: string | null;
  brand: string | null;
  type: string;
  category: string | null;
  power_kw: number | null;
  price_thb: number | null;
  description: string | null;
}

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('ejjimmy_solar_products')
    .select('*')
    .eq('site_id', 'ejjimmy')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  const items = (products || []) as Product[];

  const categories = [...new Set(items.map(p => p.category).filter(Boolean))] as string[];
  const types = [...new Set(items.map(p => p.type))];

  return (
    <section className="block" id="catalog">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">Каталог оборудования</p>
          <h1>Полный каталог позиций</h1>
        </div>

        <div className="pills" role="group" aria-label="Фильтр">
          <button type="button" aria-pressed="true">Все позиции ({items.length})</button>
          {categories.map(cat => (
            <button key={cat} type="button" aria-pressed="false">{cat}</button>
          ))}
          {types.map(t => (
            <button key={t} type="button" aria-pressed="false">{t === 'system' ? 'Готовые системы' : 'Аксессуары'}</button>
          ))}
        </div>

        <div className="products">
          {items.map((p) => (
            <div key={p.id} className="card product-card">
              <div className="product-photo" aria-label={p.name}>
                <h3>{p.name}</h3>
                <p className="product-sub">{p.brand} · {p.category}</p>
                {p.model && <span>Модель: {p.model}</span>}
              </div>
              <p className="product-desc">{p.description || ''}</p>
              <ul>
                {p.power_kw && <li>Мощность: {p.power_kw} кВт</li>}
              </ul>
              <div className="pick-ctas">
                <a href={`/products/${p.id}`} className="btn btn--primary">Подробнее</a>
                {p.price_thb && <span className="price">฿{p.price_thb.toLocaleString()}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}