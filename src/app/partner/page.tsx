'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePartnerLang, flowLabel, PARTNER_FLOW, getViewCode, setViewCode } from '@/lib/i18n-partner';

export default function PartnerHome() {
  const { t } = usePartnerLang();
  const [me, setMe] = useState<any>(null);
  const [comm, setComm] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [viewCode, setViewCodeState] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const m0 = await fetch('/api/partner/me').then((r) => r.json());
        const admin = !m0.partner && (m0.role === 'admin' || m0.role === 'super_admin');
        setIsAdmin(admin);
        const vc = admin ? getViewCode() : null;
        const qs = vc ? `?code=${encodeURIComponent(vc)}` : '';
        const [m, c, l] = await Promise.all([
          fetch('/api/partner/me' + qs).then((r) => r.json()),
          fetch('/api/partner/commissions' + qs).then((r) => r.json()),
          fetch('/api/partner/leads' + qs).then((r) => r.json()),
        ]);
        setMe(m.partner ? { ...m.partner, _role: m.role } : m);
        setComm(c);
        setLeads(l.leads || []);
        setViewCodeState(getViewCode());
        // Admin without partner row: offer board picker
        if (!m.partner && (m.role === 'admin' || m.role === 'super_admin')) {
          const p = await fetch('/api/admin/partners').then((r) => r.json());
          setPartners(p.partners || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-slate-500 font-bold">{t.loading}</p>;

  const isAdminView = isAdmin;

  const counts: Record<string, number> = {};
  for (const l of leads) counts[l.status] = (counts[l.status] || 0) + 1;
  const inviteLink = typeof window !== 'undefined' && me ? `${window.location.origin}/ref/${me.code}` : '';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900">
        {t.dashboard}
        {me?.company_name ? <span className="text-slate-400 text-lg font-bold"> — {me.company_name}</span> : null}
      </h1>

      {isAdminView && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3">
          <p className="text-sm font-black text-amber-800">Admin view — board:</p>
          <select
            value={viewCode || ''}
            onChange={(e) => {
              const v = e.target.value || null;
              setViewCode(v);
              setViewCodeState(v);
              if (v) window.location.href = '/partner/leads';
            }}
            className="h-11 bg-white border-2 border-amber-200 rounded-xl px-3 font-bold text-slate-800 focus:outline-none"
          >
            <option value="">—</option>
            {partners.map((p: any) => (
              <option key={p.id} value={p.code}>
                {p.company_name} ({p.code})
              </option>
            ))}
          </select>
          {viewCode && (
            <button
              onClick={() => {
                setViewCode(null);
                setViewCodeState(null);
              }}
              className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-amber-800"
            >
              ✕ {viewCode}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.expected}</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {t.thb}
            {(comm?.expected || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.paid}</p>
          <p className="text-2xl font-black text-green-700 mt-1">
            {t.thb}
            {(comm?.paid || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 col-span-2">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.invite_link}</p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 truncate bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700">
              {inviteLink}
            </code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(inviteLink).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PARTNER_FLOW.map((s) => (
          <Link key={s} href="/partner/leads" className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-orange-400 transition-all">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{flowLabel(t, s)}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{counts[s] || 0}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
