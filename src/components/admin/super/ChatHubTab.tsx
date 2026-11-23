'use client';

import { MessageSquare, Users, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLocale, useTranslations } from 'next-intl';

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-4 flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <span className="text-xl font-bold text-slate-900 dark:text-orangeNoir-text">{value}</span>
      <span className="text-[10px] font-semibold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function ChatHubTab() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [todayChats, setTodayChats] = useState(0);
  const [weekChats, setWeekChats] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [chatLeads, setChatLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [today, week, total, leads] = await Promise.all([
        supabase.from('line_actions_log').select('id', { count: 'exact', head: true }).eq('action', 'chat_session').gte('created_at', todayStart),
        supabase.from('line_actions_log').select('id', { count: 'exact', head: true }).eq('action', 'chat_session').gte('created_at', weekStart),
        supabase.from('line_actions_log').select('id', { count: 'exact', head: true }).eq('action', 'chat_session'),
        supabase.from('ejjimmy_leads').select('*').eq('source', 'chat').order('created_at', { ascending: false }).limit(5),
      ]);

      setTodayChats(today.count ?? 0);
      setWeekChats(week.count ?? 0);
      setTotalChats(total.count ?? 0);
      setChatLeads(leads.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-slate-300 dark:text-orangeNoir-textMuted" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">{t('chatStats')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<MessageSquare size={16} className="text-orange-600 dark:text-orange-400" />} value={String(todayChats)} label={t('chatToday')} color="bg-orange-50 dark:bg-orange-900/40" />
          <StatCard icon={<MessageSquare size={16} className="text-amber-600 dark:text-amber-400" />} value={String(weekChats)} label={t('chatWeek')} color="bg-amber-50 dark:bg-amber-900/40" />
          <StatCard icon={<MessageSquare size={16} className="text-slate-600 dark:text-orangeNoir-textMuted" />} value={String(totalChats)} label={t('chatTotal')} color="bg-slate-50 dark:bg-orange-900/20" />
        </div>
      </div>

      <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-100 dark:border-orangeNoir-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-orangeNoir-border flex items-center gap-2">
          <Users size={14} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted tracking-widest uppercase">{t('chatQueue')}</h3>
          <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted">{t('chatLatest', { n: chatLeads.length })}</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-orangeNoir-border/30">
          {chatLeads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-medium text-slate-300 dark:text-orangeNoir-textMuted">{t('chatEmpty')}</p>
            </div>
          ) : (
            chatLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${lead.unread ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-orange-900/40 text-slate-400 dark:text-orangeNoir-textMuted'}`}>
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-orangeNoir-text truncate">{lead.name || t('chatNoName')}</p>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-orangeNoir-textMuted">{lead.phone || t('chatNoPhone')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-medium text-slate-400 dark:text-orange-900/50">{new Date(lead.created_at).toLocaleDateString(locale)}</span>
                  <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-orange-900/40 flex items-center justify-center text-slate-300 dark:text-orangeNoir-textMuted">
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
