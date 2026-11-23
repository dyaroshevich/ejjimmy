import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';

interface ContentKey {
  id: number;
  key: string;
  value: any;
  locale: string;
}

export default async function LeadMagnetPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const key = `lead_magnet_${params.id}`;

  const { data: contentKey, error } = await supabase
    .from('ejjimmy_content_keys')
    .select('*')
    .eq('key', key)
    .eq('locale', 'th')
    .eq('site_id', 'ejjimmy')
    .single();

  if (error || !contentKey) {
    notFound();
  }

  const data = contentKey.value as any;

  return (
    <section className="block block--cream" id="lead-magnet">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">Лид-магнит</p>
          <h1>{data.title_th}</h1>
        </div>
        <div className="grid2">
          <div className="card">
            <h3>Что внутри</h3>
            <p>{data.notes || data.format}</p>
            <ul className="list-disc list-inside mt-4 text-sm text-muted">
              {data.format ? <li>Формат: {data.format}</li> : null}
              {data.pages ? <li>Страниц: {data.pages}</li> : null}
              {data.languages ? <li>Языки: {data.languages}</li> : null}
              {data.data_needed ? <li>Нужны данные: {data.data_needed}</li> : null}
            </ul>
          </div>
          <div className="card pick">
            <div className="pick-head">
              <h3>Получить материал</h3>
              <p className="pick-sub">Бесплатно по заявке</p>
            </div>
            <p className="pick-desc">
              Оставьте контакт — и мы отправим материал в LINE OA.
            </p>
            <a href="#contact" className="btn btn--primary btn--lg">
              Получить {data.title_th}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}