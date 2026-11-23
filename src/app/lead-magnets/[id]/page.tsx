import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ContentKey {
  id: number;
  key: string;
  value: any;
  locale: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const key = `lead_magnet_${params.id}`;
  const { data: contentKey } = await supabase
    .from('ejjimmy_content_keys')
    .select('*')
    .eq('key', key)
    .eq('locale', 'th')
    .eq('site_id', 'ejjimmy')
    .single();

  if (!contentKey) {
    return { title: 'Лид-магнит | Ejjimmy Solar' };
  }

  const data = contentKey.value as any;
  const title = data.marketing_title_th || data.title_th || 'Лид-магнит';
  const isTripwire = data.is_tripwire;
  const price = data.tripwire_price_thb;

  return {
    title: isTripwire && price ? `${title} — ${price}฿` : title,
    description: data.notes || data.format || '',
    alternates: {
      canonical: `https://ejjimmy-clean.vercel.app/lead-magnets/${params.id}`,
    },
  };
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
  const isTripwire = data.is_tripwire === true;
  const price = data.tripwire_price_thb;
  const marketingTitle = data.marketing_title_th || data.title_th || 'Лид-магнит';

  return (
    <section className="block block--cream" id="lead-magnet">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">
            {isTripwire ? 'Платный инструмент' : 'Бесплатный материал'}
          </p>
          <h1>{marketingTitle}</h1>
        </div>

        <div className="grid2">
          {/* Левая колонка — описание и польза */}
          <div className="card">
            <h3>Что вы получите</h3>
            <p className="text-lg text-muted">
              {data.notes || data.format || ''}
            </p>

            <div className="mt-6 space-y-3">
              {data.format && (
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">✓</span>
                  <span>Формат: {data.format}</span>
                </div>
              )}
              {data.pages && (
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">✓</span>
                  <span>Страниц: {data.pages}</span>
                </div>
              )}
              {data.languages && (
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">✓</span>
                  <span>Языки: {data.languages}</span>
                </div>
              )}
              {data.data_needed && (
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">✓</span>
                  <span>Что нужно от вас: {data.data_needed}</span>
                </div>
              )}
            </div>

            {data.trigger && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-medium text-orange-800">
                  <span className="font-bold">Почему это важно:</span>{' '}
                  {data.trigger}
                </p>
              </div>
            )}
          </div>

          {/* Правая колонка — кнопка и форма */}
          <div className="card pick">
            <div className="pick-head">
              <h3>
                {isTripwire ? 'Купить инструмент' : 'Получить бесплатно'}
              </h3>
              <p className="pick-sub">
                {isTripwire && price
                  ? `Цена: ฿${price.toLocaleString()} (зачитывается в работу при заказе системы)`
                  : 'Оставьте контакт — и мы отправим материал в LINE OA'}
              </p>
            </div>

            <form
              id="lead-magnet-form"
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = (formData.get('name') as string) || '';
                const phone = (formData.get('phone') as string) || '';

                if (!name || !phone) {
                  alert('Заполните имя и телефон');
                  return;
                }

                try {
                  const response = await fetch('/api/leads/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name,
                      phone: phone.replace(/\D/g, ''),
                      source: 'lead_magnet',
                      line_id: null,
                      location: 'Krabi',
                      source_details: `Lead magnet: ${marketingTitle} (${key})`,
                      notes: `Lead magnet requested: ${marketingTitle}`,
                    }),
                  });

                  const result = await response.json();

                  if (result.success) {
                    alert('Спасибо! Мы отправим материал в LINE OA в ближайшее время.');
                    (e.currentTarget as HTMLFormElement).reset();
                  } else {
                    alert('Ошибка: ' + (result.error || 'неизвестная ошибка'));
                  }
                } catch {
                  alert('Ошибка сети. Попробуйте позже.');
                }
              }}
            >
              <div className="field">
                <label htmlFor="lmName">Ваше имя</label>
                <input
                  id="lmName"
                  name="name"
                  type="text"
                  placeholder="Иван Петров"
                  required
                  className="input"
                />
              </div>
              <div className="field">
                <label htmlFor="lmPhone">Телефон / LINE</label>
                <input
                  id="lmPhone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="+66 8x xxx xxxx"
                  required
                  className="input"
                />
              </div>
              <button
                type="submit"
                className="btn btn--primary btn--lg w-full"
              >
                {isTripwire && price ? `Оплатить ฿${price}` : 'Получить бесплатно'}
              </button>
              <p className="text-xs text-muted text-center mt-2">
                Ваши данные защищены по PDPA. Используются только для связи.
              </p>
            </form>
            {isTripwire && price && (
              <p className="text-xs text-muted text-center mt-2">
                Цена зачитывается в стоимость установки солнечной системы.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}