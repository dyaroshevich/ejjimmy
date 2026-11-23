'use client';

import { useEffect, useState } from 'react';
import { usePartnerLang, getViewCode } from '@/lib/i18n-partner';

export default function PartnerReferrals() {
  const { t } = usePartnerLang();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const code = getViewCode();
      const r = await fetch('/api/partner/referrals' + (code ? `?code=${encodeURIComponent(code)}` : ''));
      const j = await r.json();
      setRows(j.referrals || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMsg('');
    try {
      const r = await fetch('/api/partner/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'failed');
      setName('');
      setPhone('');
      await load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900">{t.referrals}</h1>

      <form onSubmit={invite} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 max-w-xl">
        <p className="font-black text-slate-900">{t.invite_customer}</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name}
            className="flex-1 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phone}
            className="flex-1 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 h-12 bg-orange-600 text-white rounded-xl font-black disabled:opacity-50"
          >
            {t.send_invite}
          </button>
        </div>
        {msg && <p className="text-sm font-bold text-red-600">{msg}</p>}
      </form>

      {loading ? (
        <p className="text-slate-500 font-bold">{t.loading}</p>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">{t.status}</th>
                <th className="px-4 py-3">{t.reward}</th>
                <th className="px-4 py-3">{t.paid}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{String(r.id).slice(0, 8)}…</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{r.status}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {r.reward_amount ? `${t.thb}${Number(r.reward_amount).toLocaleString()}` : '—'}
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
      )}
    </div>
  );
}
