'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, HelpCircle, FileText, CheckCircle2, Clock, Globe, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Franchise {
  id: string;
  name: string;
  badgeText: 'Master' | 'Franchise' | 'Draft';
  badgeStyle: string;
  statusText: string;
  statusColor: string;
  posts: number;
  reach: string;
  isDraft?: boolean;
}

interface GlobalPost {
  id: string;
  title: string;
  type: string;
  typeColor: string;
  date: string;
  statusText: string;
  statusColor: string;
}

export default function FranchisesPage() {
  const t = useTranslations('content');
  const franchises: Franchise[] = [
    {
      id: '1',
      name: 'TAWAN POWER Krabi',
      badgeText: 'Master',
      badgeStyle: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30',
      statusText: t('frActive'),
      statusColor: 'bg-orange-500',
      posts: 142,
      reach: '142.5K'
    },
    {
      id: '2',
      name: 'TAWAN POWER Phuket',
      badgeText: 'Franchise',
      badgeStyle: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      statusText: t('frActive'),
      statusColor: 'bg-orange-500',
      posts: 68,
      reach: '54.2K'
    },
    {
      id: '3',
      name: 'TAWAN POWER Bangkok',
      badgeText: 'Draft',
      badgeStyle: 'bg-slate-500/20 text-slate-500 border border-slate-500/30',
      statusText: t('frSetup'),
      statusColor: 'bg-amber-500',
      posts: 0,
      reach: '—',
      isDraft: true
    }
  ];

  const globalPosts: GlobalPost[] = [
    {
      id: '1',
      title: '5 ความเชื่อผิดๆ เกี่ยวกับแผงโซลาร์เซลล์ในฤดูฝน',
      type: 'Carousel',
      typeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      date: '09 มิ.ย. 2026',
      statusText: t('frPublished'),
      statusColor: 'text-orange-500'
    },
    {
      id: '2',
      title: 'คู่มือ: การเลือกอินเวอร์เตอร์สำหรับสภาพอากาศแบบเขตร้อน',
      type: 'Article',
      typeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      date: '18 มิ.ย. 2026',
      statusText: t('frInProgress'),
      statusColor: 'text-amber-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8"
    >
      {/* Franchise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        {franchises.map((f) => (
          <div
            key={f.id}
            className={`p-6 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm flex flex-col justify-between transition-all ${
              f.isDraft ? 'opacity-75 hover:opacity-100' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="text-orange-500" size={18} />
                <h4 className="text-sm font-extrabold text-orangeLight-text dark:text-orangeNoir-text">
                  {f.name}
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${f.badgeStyle}`}>
                {f.badgeText}
              </span>
            </div>

            {/* Stats list */}
            <div className="space-y-2 select-text">
              <div className="flex justify-between text-xs border-b border-orangeLight-border/50 dark:border-orangeNoir-border/10 pb-1.5">
                <span className="text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-sans">{t('frStatus')}</span>
                <span className="flex items-center gap-1.5 font-semibold text-orangeLight-text dark:text-orangeNoir-text">
                  <span className={`w-1.5 h-1.5 rounded-full ${f.statusColor}`} />
                  {f.statusText}
                </span>
              </div>
              <div className="flex justify-between text-xs border-b border-orangeLight-border/50 dark:border-orangeNoir-border/10 pb-1.5 font-mono">
                <span className="text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-sans">{t('frPosts')}</span>
                <span className="font-bold text-orangeLight-text dark:text-orangeNoir-text">{f.posts}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-sans">{t('frReach')}</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{f.reach}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global content sharing section */}
      <div className="rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-orangeLight-border dark:border-orangeNoir-border select-none">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="text-orange-500" size={16} />
            <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
              {t('frGlobal')}
            </h3>
          </div>
          <p className="text-[10px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-wider font-mono">
            {t('frGlobalSub')}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="w-full overflow-x-auto select-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg dark:bg-orangeNoir-bg/25 text-[10px] font-mono font-bold tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">
                <th className="px-6 py-3.5">{t('frThTitle')}</th>
                <th className="px-6 py-3.5">{t('frThType')}</th>
                <th className="px-6 py-3.5">{t('frThDate')}</th>
                <th className="px-6 py-3.5">{t('frThStatus')}</th>
                <th className="px-6 py-3.5 text-right">{t('frThManage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orangeLight-border/60 dark:divide-orangeNoir-border/20 text-xs">
              {globalPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-orange-500/5 transition-colors select-text"
                >
                  <td className="px-6 py-4 font-bold text-orangeLight-text dark:text-orangeNoir-text">
                    {post.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${post.typeColor}`}>
                      {post.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                    {post.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold flex items-center gap-1.5 ${post.statusColor}`}>
                      {post.statusText === t('frPublished') ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {post.statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right select-none">
                    <button className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors ml-auto">
                      <span>{t('frConfigure')}</span>
                      <ArrowRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
