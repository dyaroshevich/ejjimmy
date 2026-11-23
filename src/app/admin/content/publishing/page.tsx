'use client';

import React from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Facebook, 
  MessageCircle, 
  Globe,
  MoreVertical,
  Calendar,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const QUEUE = [
  { id: 1, title: 'โปรโมชั่นโซลาร์เซลล์ 0% 10 เดือน', platform: 'facebook', status: 'scheduled', time: 'วันนี้, 18:00 น.' },
  { id: 2, title: 'Broadcast: เคล็ดลับล้างแผงช่วงหน้าฝน', platform: 'line', status: 'scheduled', time: 'พรุ่งนี้, 10:00 น.' },
  { id: 3, title: 'รีวิว: ติดตั้งโรงงานอ่าวนาง 100kW', platform: 'blog', status: 'published', time: '2 มิ.ย. 2026, 09:15 น.' },
  { id: 4, title: 'Facebook Live: Q&A กับวิศวกรเอ็ม', platform: 'facebook', status: 'draft', time: 'ไม่ได้กำหนด' },
  { id: 5, title: 'เทรนด์แผง Jinko 2026', platform: 'facebook', status: 'failed', time: '5 มิ.ย. 2026, 14:00 น.', error: 'API Error: Auth token expired' },
];

export default function PublishingPage() {
  const t = useTranslations('content');
  const getPlatformIcon = (platform: string) => {
    if (platform === 'facebook') return <Facebook className="w-4 h-4 text-blue-600" />;
    if (platform === 'line') return <MessageCircle className="w-4 h-4 text-green-500" />;
    return <Globe className="w-4 h-4 text-slate-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3.5 h-3.5" /> Published</span>;
      case 'scheduled':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase"><Clock className="w-3.5 h-3.5" /> Scheduled</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">Draft</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">Publishing Queue</h1>
          <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('pubSub')}</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95">
          <Calendar size={18} />
          <span>{t('pubNewSchedule')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-orangeLight-sidebar dark:bg-orangeNoir-card p-5 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm select-none">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
          <Filter size={14} />
          <span>Filter By:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[t('pubAll'), 'Facebook', 'LINE', 'Blog'].map(f => (
            <button key={f} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${f === t('pubAll') ? 'bg-orangeNoir-bg dark:bg-orangeNoir-input border-orangeNoir-bg text-white shadow-md' : 'bg-orangeLight-bg dark:bg-orangeNoir-bg border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:border-orange-500/40'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm overflow-hidden flex flex-col pb-12">
        <div className="divide-y divide-orangeLight-border/40 dark:divide-orangeNoir-border/10">
          {QUEUE.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-orange-500/5 transition-all group gap-6">
              <div className="flex items-center gap-6 min-w-0">
                <div className={`p-4 rounded-2xl bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-md`}>
                  {getPlatformIcon(item.platform)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-orangeLight-text dark:text-orangeNoir-text mb-2 text-base truncate uppercase tracking-tight">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-orange-500" /> {item.time}</span>
                    {item.error && <span className="text-red-500 flex items-center gap-1.5 border-l border-orangeLight-border dark:border-orangeNoir-border pl-4"><AlertCircle size={12} /> {item.error}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 self-end sm:self-auto select-none">
                {getStatusBadge(item.status)}
                <button className="p-3 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:bg-orangeLight-bg dark:hover:bg-orangeNoir-bg rounded-xl transition-colors border border-transparent hover:border-orangeLight-border dark:hover:border-orangeNoir-border">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Help */}
      <div className="bg-orange-600 rounded-[2.5rem] p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-orange-600/20 border border-orange-500/30">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-1/4 -translate-y-1/4">
          <Sparkles size={200} />
        </div>
        
        <div className="space-y-3 text-center lg:text-left relative z-10">
          <h3 className="text-2xl font-black uppercase tracking-tighter">{t('pubHelpTitle')}</h3>
          <p className="text-orange-50/80 text-sm font-medium max-w-xl">{t('pubHelpDesc')}</p>
        </div>
        <button className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all relative z-10">
          {t('pubHelpCta')}
        </button>
      </div>
    </motion.div>
  );
}
