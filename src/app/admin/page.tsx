'use client';

import { useEffect, useState } from 'react';
import { supabase, SUPABASE_SCHEMA } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  MessageSquare, Globe, ArrowUpRight,
  AlertCircle, Loader2, ChevronRight, Plus,
  FileText, PenTool, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CreateLeadModal from '@/components/admin/CreateLeadModal';
import { useTranslations, useLocale } from 'next-intl';

const COLORS: Record<string, { bar: string; badge: string; bg: string; text: string; icon: string }> = {
  'bg-blue-500': { bar: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-500' },
  'bg-amber-500': { bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-500' },
  'bg-purple-500': { bar: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-700 dark:text-purple-400', icon: 'text-purple-500' },
  'bg-orange-600': { bar: 'bg-orange-600', badge: 'bg-orange-500/10 text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400', icon: 'text-orange-600' },
  'bg-orange-400': { bar: 'bg-orange-400', badge: 'bg-orange-400/10 text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400', icon: 'text-orange-400' },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 56;
  const h = 22;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 3) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'chat' | 'web'>('all');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleCreateLead = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          name: 'ลูกค้าใหม่',
          source: 'admin_manual',
          status: 'ใหม่',
          unread: false
        }])
        .select()
        .single();

      if (error) throw error;
      router.push(`/admin/leads/${data.id}`);
    } catch (err: any) {
      console.error(err);
      setCreating(false);
    }
  };

  useEffect(() => {
    checkSessionAndFetchLeads();

    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        // План «Б»: аккаунт-схема совпадает с изоляцией данных tawanpower
        { event: '*', schema: SUPABASE_SCHEMA || 'public', table: 'leads' },
        () => {
          checkSessionAndFetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const unread = leads.filter(l => l.unread).length;
    if ('setAppBadge' in navigator) {
      if (unread > 0) {
        (navigator as any).setAppBadge(unread).catch(console.error);
      } else {
        (navigator as any).clearAppBadge().catch(console.error);
      }
    }
  }, [leads]);

  const checkSessionAndFetchLeads = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const unreadCount = leads.filter(l => l.unread).length;
  const wonCount = leads.filter(l => l.status === 'ติดตั้งแล้ว' || l.status === 'Won').length;

  const newCount = leads.filter(l => !l.status || l.status === 'New' || l.status === 'ใหม่').length;
  const contactedCount = leads.filter(l => l.status === 'Contacted' || l.status === 'ติดต่อแล้ว').length;
  const quotedCount = leads.filter(l => l.status === 'ส่งใบเสนอราคาแล้ว').length;
  const signedCount = leads.filter(l => l.status === 'เซ็นสัญญาแล้ว').length;

  const trendTotal = [2, 3, 5, 4, 6, 7, 8, 10, 12, 14, 18, 24];
  const trendUnread = [12, 14, 15, 16, 15, 14, 16, 17, 16, 15, 14, 16];
  const trendChat = [1, 0, 2, 1, 3, 2, 1, 2, 3, 2, 3, 3];

  const funnelStages = [
    { label: t('stageNew'), count: newCount, color: 'bg-blue-500', dotColor: 'bg-blue-400' },
    { label: t('stageContacted'), count: contactedCount, color: 'bg-amber-500', dotColor: 'bg-amber-400' },
    { label: t('stageQuoted'), count: quotedCount, color: 'bg-purple-500', dotColor: 'bg-purple-400' },
    { label: t('stageSigned'), count: signedCount, color: 'bg-orange-600', dotColor: 'bg-orange-500' },
    { label: t('stageWon'), count: wonCount, color: 'bg-orange-400', dotColor: 'bg-orange-300' },
  ];
  const funnelTotal = leads.length;

  const filteredLeadsList = leads.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'new') return l.unread || l.status === 'ใหม่' || l.status === 'New';
    if (filter === 'chat') return l.source === 'chat';
    if (filter === 'web') return l.source === 'web' || !l.source;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full transition-colors duration-500 space-y-8 text-left text-slate-900 dark:text-orangeNoir-text">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{t('dashTitle')}</h1>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest mt-0.5">{t('dashSub')}</p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button 
            onClick={handleCreateLead}
            disabled={creating}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 md:px-6 py-2 h-10 md:h-12 text-[10px] md:text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Plus size={18} strokeWidth={3} />
                <span className="hidden xs:inline">{t('newLead')}</span>
              </>
            )}
          </Button>

          <div className="hidden sm:flex bg-white dark:bg-orangeNoir-card px-4 py-2 h-10 md:h-12 items-center rounded-xl border border-slate-100 dark:border-orangeNoir-border shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-orangeNoir-text">{t('realtime')}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-orangeNoir-card p-5 rounded-xl border border-slate-100 dark:border-orangeNoir-border shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-orangeNoir-text tabular-nums tracking-tight">{leads.length}</span>
            <Sparkline data={trendTotal} color="#FF8A00" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest">{t('statTotal')}</span>
        </div>

        <div className="bg-white dark:bg-orangeNoir-card p-5 rounded-xl border border-slate-100 dark:border-orangeNoir-border shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="relative">
              <span className="text-3xl font-black text-slate-900 dark:text-orangeNoir-text tabular-nums tracking-tight">{unreadCount}</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-4 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <Sparkline data={trendUnread} color="#f59e0b" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest">{t('statUnread')}</span>
        </div>

        <div className="bg-white dark:bg-orangeNoir-card p-5 rounded-xl border border-slate-100 dark:border-orangeNoir-border shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-orangeNoir-text tabular-nums tracking-tight">{leads.filter(l => l.source === 'chat').length}</span>
            <Sparkline data={trendChat} color="#3b82f6" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest">{t('statChat')}</span>
        </div>

        <div className="bg-white dark:bg-orangeNoir-card p-5 rounded-xl border border-slate-100 dark:border-orangeNoir-border shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-orangeNoir-text tabular-nums tracking-tight">{wonCount}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-widest">{t('statWon')}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* ⚡ CRM Funnel Refinement (Utility-Tech Style) */}
        <div className="bg-white dark:bg-orangeNoir-card rounded-2xl border border-slate-200 dark:border-orangeNoir-border shadow-sm relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-100 dark:border-white/5 relative z-10">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                <div>
                   <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">CRM Funnel</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Conversion</p>
                </div>
             </div>
             
             <div className="flex items-center gap-6">
                <div className="flex flex-col text-right">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Leads</span>
                   <span className="text-base font-black text-slate-900 dark:text-white tabular-nums leading-none mt-1">{funnelTotal}</span>
                </div>
                <div className="w-px h-8 bg-slate-100 dark:bg-white/10" />
                <div className="flex flex-col text-left">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Success Rate</span>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-black text-orange-600 dark:text-orange-400 tabular-nums leading-none">
                        {funnelTotal > 0 ? Math.round((wonCount / funnelTotal) * 100) : 0}%
                      </span>
                      <ArrowUpRight size={14} className="text-orange-500" />
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-white/5 relative z-10">
            {funnelStages.map((s, i) => {
              const pct = funnelTotal > 0 ? Math.round((s.count / funnelTotal) * 100) : 0;
              const isZero = s.count === 0;
              const icons = [
                <AlertCircle key="1" size={12} />,
                <MessageSquare key="2" size={12} />,
                <FileText key="3" size={12} />,
                <PenTool key="4" size={12} />,
                <CheckCircle2 key="5" size={12} />
              ];
              
              return (
                <div 
                  key={s.label} 
                  className={`p-5 flex flex-col gap-4 transition-all duration-300 group/stage hover:bg-slate-50 dark:hover:bg-white/[0.02] ${
                    isZero ? 'opacity-40 grayscale' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                      isZero 
                        ? 'bg-slate-50 dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-300' 
                        : `bg-white dark:bg-orangeNoir-input ${s.color.replace('bg-', 'border-')}/20 ${s.color.replace('bg-', 'text-')}`
                    }`}>
                      {icons[i]}
                    </div>
                    <span className="text-[9px] font-black text-slate-300 dark:text-white/20 tabular-nums">0{i+1}</span>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      isZero ? 'text-slate-400' : 'text-slate-500 dark:text-orange-400/60'
                    }`}>
                      {s.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black tabular-nums leading-none ${
                        isZero ? 'text-slate-300' : 'text-slate-900 dark:text-white'
                      }`}>
                        {s.count}
                      </span>
                      {!isZero && (
                        <span className="text-[10px] font-bold text-slate-400">({pct}%)</span>
                      )}
                    </div>
                  </div>

                  {/* Micro Progress Track */}
                  <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-auto">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, isZero ? 0 : 5)}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${s.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h2 className="text-xs font-black text-slate-400 dark:text-orangeNoir-textMuted uppercase tracking-[0.2em]">{t('recentTitle')}</h2>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={t('fAll')} />
            <FilterChip active={filter === 'new'} onClick={() => setFilter('new')} label={t('fNew')} dot="bg-orange-500" />
            <FilterChip active={filter === 'chat'} onClick={() => setFilter('chat')} label={t('fChat')} icon={<MessageSquare size={10} />} />
            <FilterChip active={filter === 'web'} onClick={() => setFilter('web')} label={t('fWeb')} icon={<Globe size={10} />} />
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-orangeNoir-card p-12 rounded-xl border border-slate-100 dark:border-orangeNoir-border flex flex-col items-center justify-center text-slate-400 dark:text-orangeNoir-textMuted gap-4 shadow-sm">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{t('loadingData')}</span>
          </div>
        ) : filteredLeadsList.length === 0 ? (
          <div className="bg-white dark:bg-orangeNoir-card p-12 rounded-xl border border-slate-100 dark:border-orangeNoir-border flex flex-col items-center justify-center text-slate-400 dark:text-orangeNoir-textMuted gap-4 shadow-sm">
            <AlertCircle size={32} />
            <span className="text-xs font-bold uppercase tracking-wider">{t('noContacts')}</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-orangeNoir-card rounded-xl border border-slate-100 dark:border-orangeNoir-border shadow-sm overflow-hidden text-left">
            <div className="divide-y divide-slate-50 dark:divide-orangeNoir-border/30">
              {filteredLeadsList.slice(0, 8).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => router.push(`/admin/leads/${lead.id}`)}
                  className="p-5 md:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-orange-900/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      lead.unread 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                        : 'bg-slate-50 dark:bg-orangeNoir-input text-slate-400 dark:text-orangeNoir-textMuted'
                    }`}>
                      {lead.source === 'chat' ? <MessageSquare size={20} /> : <Globe size={20} />}
                    </div>
                    <div className="truncate text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-orangeNoir-text tracking-tight truncate">
                          {lead.name || t('noName')}
                        </h3>
                        {lead.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-orangeNoir-textMuted flex items-center gap-2 mt-0.5">
                        <span className="uppercase tracking-widest">{lead.source === 'chat' ? t('fromChat') : t('fromWeb')}</span>
                        <span className="opacity-30">•</span>
                        <span>{new Date(lead.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {lead.bill_amount > 0 && (
                      <div className="hidden sm:block text-right">
                        <p className="text-[9px] font-black text-slate-300 dark:text-orangeNoir-textMuted uppercase tracking-wider mb-0.5">{t('billLabel')}</p>
                        <p className="text-xs font-black text-orange-600 dark:text-orange-400 italic">฿{lead.bill_amount.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-orangeNoir-input flex items-center justify-center text-slate-300 dark:text-orangeNoir-textMuted group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/40 transition-all border border-transparent group-hover:border-orange-100 dark:group-hover:border-orange-800">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function FilterChip({ active, onClick, label, dot, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap border ${
        active 
          ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/10' 
          : 'bg-white dark:bg-orangeNoir-card text-slate-400 dark:text-orangeNoir-textMuted border-slate-100 dark:border-orangeNoir-border hover:bg-slate-50 dark:hover:bg-orangeNoir-cardHover'
      }`}
    >
      {icon}
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {label}
    </button>
  );
}
