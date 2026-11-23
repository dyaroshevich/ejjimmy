'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Search } from 'lucide-react';

type LeadMagnet = {
  id: number;
  key: string;
  value: any;
  locale: string;
  created_at: string;
  updated_at: string;
};

export default function LeadMagnetsPage() {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function fetchMagnets() {
    setLoading(true);
    const { data } = await supabase
      .from('ejjimmy_content_keys')
      .select('*')
      .like('key', 'lead_magnet_%')
      .eq('locale', 'th')
      .eq('site_id', 'ejjimmy')
      .order('key', { ascending: true });
    if (data) setMagnets(data as LeadMagnet[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchMagnets();
  }, []);

  const filtered = magnets.filter((m) => {
    const data = m.value as any;
    const title = (data.marketing_title_th || data.title_th || m.key).toLowerCase();
    return title.includes(search.toLowerCase());
  });

  const toggleTripwire = async (magnet: LeadMagnet) => {
    const data = magnet.value as any;
    const newValue = { ...data, is_tripwire: !data.is_tripwire };
    const { error } = await supabase
      .from('ejjimmy_content_keys')
      .update({ value: newValue })
      .eq('id', magnet.id);
    if (error) {
      console.error(error);
      alert('Ошибка обновления');
    } else {
      await fetchMagnets();
    }
  };

  const updatePrice = async (magnet: LeadMagnet, price: number | null) => {
    const data = magnet.value as any;
    const newValue = { ...data, tripwire_price_thb: price };
    const { error } = await supabase
      .from('ejjimmy_content_keys')
      .update({ value: newValue })
      .eq('id', magnet.id);
    if (error) {
      console.error(error);
      alert('Ошибка обновления');
    } else {
      await fetchMagnets();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 text-left">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-slate-500 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-orange-900/30">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              Лід-магнити
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-1">
              {filtered.length} материалів
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-300" size={16} />
            <input
              className="relative pl-10 pr-3 py-2.5 text-sm border border-slate-200 dark:border-orange-900/30 rounded-full bg-slate-50 dark:bg-orange-900 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none w-full"
              placeholder="Пошук магніта..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-orange-900/30 bg-slate-50 dark:bg-orange-900/50 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-100 dark:bg-orange-900/20">
            <tr>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Назва</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Етап воронки</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Тип</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Ціна</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Оновлено</th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Дія</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-orange-900/20">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Loader2 size={20} className="animate-spin mr-2" /> Завантаження...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">Магнітів не знайдено</td>
              </tr>
            ) : (
              filtered.map((m) => {
                const data = m.value as any;
                const isTripwire = data.is_tripwire === true;
                const price = data.tripwire_price_thb;
                const title = data.marketing_title_th || data.title_th || m.key;
                const funnel = data.funnel_stage || '—';
                const updated = m.updated_at ? new Date(m.updated_at).toLocaleDateString('uk-UA') : '—';
                return (
                  <tr key={m.id} className="hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{funnel}</td>
                    <td className="px-4 py-3">
                      <Badge variant={isTripwire ? 'destructive' : 'secondary'} className="text-xs px-2 py-1">
                        {isTripwire ? 'Платний' : 'Безкоштовно'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{isTripwire && price ? `฿${price.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-[10px] px-2 py-1 h-auto" onClick={() => toggleTripwire(m)}>
                          {isTripwire ? 'Зробити безплатним' : 'Зробити платним'}
                        </Button>
                        {isTripwire && (
                          <input
                            type="number"
                            defaultValue={price || ''}
                            className="w-16 text-[10px] border border-slate-200 dark:border-orange-900/30 rounded px-2 py-1 text-right bg-slate-50 dark:bg-orange-900/50"
                            onChange={(e) => {
                              const val = e.target.value;
                              updatePrice(m, val === '' ? null : parseInt(val));
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
