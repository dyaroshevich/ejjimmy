'use client';

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer2, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function AnalyticsPage() {
  const t = useTranslations('content');
  const STATS = [
    { label: t('anViews'), value: '42.5K', change: '+12.5%', trend: 'up' },
    { label: t('anEngage'), value: '3.8K', change: '+5.2%', trend: 'up' },
    { label: t('anCtr'), value: '2.4%', change: '-0.8%', trend: 'down' },
    { label: t('anFollowers'), value: '+850', change: '+24%', trend: 'up' },
  ];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">Content Analytics</h1>
          <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('anSub')}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 md:flex-none bg-orangeLight-sidebar dark:bg-orangeNoir-card border border-orangeLight-border dark:border-orangeNoir-border rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm cursor-pointer appearance-none text-center">
            <option>{t('range7')}</option>
            <option>{t('range30')}</option>
            <option>{t('range90')}</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-orangeLight-sidebar dark:bg-orangeNoir-card p-6 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm flex flex-col justify-between hover:border-orange-500/20 transition-colors">
            <p className="text-[10px] font-black text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-orangeLight-text dark:text-orangeNoir-text tracking-tighter">{stat.value}</h3>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${stat.trend === 'up' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Main Chart Area */}
        <div className="xl:col-span-8 bg-orangeLight-sidebar dark:bg-orangeNoir-card p-8 rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center mb-10 select-none">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                <BarChart3 size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text">
                {t('trafficTitle')}
              </h3>
            </div>
            <div className="flex gap-1 bg-orangeLight-bg dark:bg-orangeNoir-bg p-1 rounded-xl border border-orangeLight-border dark:border-orangeNoir-border">
              <button className="px-3 py-1.5 text-[9px] font-black uppercase rounded-lg bg-orangeNoir-bg text-white">Daily</button>
              <button className="px-3 py-1.5 text-[9px] font-black uppercase rounded-lg text-orangeLight-textMuted">Weekly</button>
            </div>
          </div>
          <div className="flex-1 bg-orangeLight-bg/50 dark:bg-orangeNoir-sidebar/20 rounded-2xl border-2 border-dashed border-orangeLight-border dark:border-orangeNoir-border/20 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-center relative z-10">
              <BarChart3 size={48} strokeWidth={1} className="text-orangeLight-textMuted/20 dark:text-orangeNoir-textMuted/20 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('chartEmpty')}</p>
            </div>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="xl:col-span-4 bg-orangeLight-sidebar dark:bg-orangeNoir-card p-8 rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm flex flex-col select-none">
          <h3 className="text-sm font-black uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text mb-8 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
              <PieChart size={18} />
            </div>
            {t('platformTitle')}
          </h3>
          <div className="flex-1 space-y-8 flex flex-col justify-center">
            {[
              { name: 'Facebook', value: '45%', icon: Facebook, color: 'bg-blue-600' },
              { name: 'LINE', value: '30%', icon: MessageCircle, color: 'bg-orange-500' },
              { name: 'Blog/SEO', value: '25%', icon: Globe, color: 'bg-amber-500' },
            ].map((p, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3 font-black uppercase tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                    <p.icon size={16} className={p.color.replace('bg-', 'text-')} />
                    {p.name}
                  </div>
                  <span className="font-mono font-black text-orangeLight-text dark:text-orangeNoir-text">{p.value}</span>
                </div>
                <div className="h-3 bg-orangeLight-bg dark:bg-orangeNoir-bg rounded-full overflow-hidden border border-orangeLight-border dark:border-orangeNoir-border shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: p.value }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className={`h-full ${p.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm overflow-hidden flex flex-col mb-12">
        <div className="p-8 border-b border-orangeLight-border dark:border-orangeNoir-border flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text">{t('topTitle')}</h2>
          </div>
        </div>
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left border-collapse">
            <thead className="bg-orangeLight-bg dark:bg-orangeNoir-bg border-b border-orangeLight-border dark:border-orangeNoir-border">
              <tr className="text-[10px] font-black text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-widest">
                <th className="px-8 py-5">{t('thArticle')}</th>
                <th className="px-6 py-5 text-center">{t('thViews')}</th>
                <th className="px-6 py-5 text-center">{t('thShares')}</th>
                <th className="px-8 py-5 text-right">{t('thScore')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orangeLight-border/40 dark:divide-orangeNoir-border/10">
              {[
                { title: 'วิธีลดค่าไฟ 100% ด้วยระบบ 10kW Hybrid สำหรับเจ้าของบ้านในกระบี่', views: '12,450', shares: '420', score: '9.8' },
                { title: 'รีวิว Sigenergy รุ่น 5kWh: ประสบการณ์ติดตั้งจริงในพูลวิลล่าอ่าวนาง', views: '8,200', shares: '180', score: '9.2' },
                { title: 'ติดตั้งโซลาร์ผ่อนได้! ดอกเบี้ยพิเศษ 0% นาน 10 เดือน พร้อมรับสิทธิ์คืนภาษี', views: '7,800', shares: '310', score: '8.9' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-orange-500/5 transition-all select-text">
                  <td className="px-8 py-5 font-black uppercase tracking-tight text-orangeLight-text dark:text-orangeNoir-text text-xs max-w-md truncate">{item.title}</td>
                  <td className="px-6 py-5 text-[10px] font-mono font-black text-center text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{item.views}</td>
                  <td className="px-6 py-5 text-[10px] font-mono font-black text-center text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{item.shares}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-500/20">{item.score}</span>
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
