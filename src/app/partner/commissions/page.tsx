'use client';

import { useEffect, useState } from 'react';
import { usePartnerLang, getViewCode } from '@/lib/i18n-partner';

export default function PartnerCommissions() {
  const { t, lang } = usePartnerLang();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const code = getViewCode();
        const r = await fetch('/api/partner/commissions' + (code ? `?code=${encodeURIComponent(code)}` : ''));
        setData(await r.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-slate-500 font-bold">{t.loading}</p>;

  const rows = data?.rows || [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900">
        {lang === 'th' ? 'คอมมิชชั่น' : 'Commissions'}
      </h1>
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.expected}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {t.thb}
            {(data?.expected || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.paid}</p>
          <p className="text-2xl font-black text-green-700 mt-1">
            {t.thb}
            {(data?.paid || 0).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-400">
              <th className="px-4 py-3">{t.my_leads}</th>
              <th className="px-4 py-3">{t.status}</th>
              <th className="px-4 py-3">{t.reward}</th>
              <th className="px-4 py-3">{t.paid}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold text-slate-800">{r.leads?.name || `#${r.leads?.id}`}</td>
                <td className="px-4 py-3 text-slate-600">{r.status}</td>
                <td className="px-4 py-3 font-bold text-slate-700">
                  {r.commission_amount ? `${t.thb}${Number(r.commission_amount).toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 font-bold text-green-700">{r.paid_at ? t.paid_mark : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  {t.no_leads}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
