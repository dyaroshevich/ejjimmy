'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  MoreHorizontal,
  Facebook,
  MessageCircle,
  Globe,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

interface CalendarEvent {
  id: string;
  title: string;
  platform: 'facebook' | 'line' | 'blog';
  scheduled_at: string;
  status: 'scheduled' | 'published' | 'failed';
}

export default function CalendarPage() {
  const t = useTranslations('content');
  const locale = useLocale();
  const [currentMonth, setCurrentMonth] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const DAYS = [t('daySun'), t('dayMon'), t('dayTue'), t('dayWed'), t('dayThu'), t('dayFri'), t('daySat')];
  const MONTHS = [t('monthJun'), t('monthJul')];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/content/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      toast.error(t('calLoadFail'));
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'facebook') return <Facebook className="w-3 h-3 text-blue-600" />;
    if (platform === 'line') return <MessageCircle className="w-3 h-3 text-green-500" />;
    return <Globe className="w-3 h-3 text-slate-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">Content Calendar</h1>
            <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('calSub')}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-orangeLight-sidebar dark:bg-orangeNoir-card border border-orangeLight-border dark:border-orangeNoir-border rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setCurrentMonth(prev => Math.max(0, prev - 1))}
                className="p-2 hover:bg-orange-500/5 rounded-lg transition-colors text-orangeLight-text dark:text-orangeNoir-text"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-6 text-[10px] font-black uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text min-w-[140px] text-center">
                {MONTHS[currentMonth]}
              </span>
              <button 
                onClick={() => setCurrentMonth(prev => Math.min(1, prev + 1))}
                className="p-2 hover:bg-orange-500/5 rounded-lg transition-colors text-orangeLight-text dark:text-orangeNoir-text"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95">
              <Plus size={18} />
              <span>{t('calPlan')}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-6 text-orangeLight-textMuted/30">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest">{t('calLoading')}</p>
          </div>
        ) : (
          <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 border-b border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg dark:bg-orangeNoir-bg select-none">
              {DAYS.map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-widest border-r border-orangeLight-border dark:border-orangeNoir-border last:border-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 min-h-[800px] bg-orangeLight-border/20 dark:bg-orangeNoir-border/5 gap-[1px]">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayDate = new Date(2026, 5, i - 0); // Approx logic for June 2026
                const dayNum = dayDate.getDate();
                const isCurrentMonth = dayDate.getMonth() === 5;
                const dayStr = dayDate.toISOString().split('T')[0];
                const dayEvents = events.filter(e => e.scheduled_at.startsWith(dayStr));
                const isToday = dayNum === 9 && isCurrentMonth;

                return (
                  <div key={i} className={`p-3 bg-orangeLight-sidebar dark:bg-orangeNoir-card hover:bg-orange-500/5 transition-colors group relative flex flex-col gap-2 ${!isCurrentMonth ? 'opacity-30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[11px] font-mono font-black ${isToday ? 'bg-orange-600 text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-orange-500/30' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted'}`}>
                        {isCurrentMonth ? dayNum : ''}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                      {dayEvents.map(event => (
                        <div key={event.id} className="p-2 bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border rounded-xl shadow-sm cursor-pointer hover:border-orange-500/50 transition-all active:scale-[0.98] group/item">
                          <div className="flex items-center gap-1.5 mb-1">
                            {getPlatformIcon(event.platform)}
                            <span className="text-[8px] font-black text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase font-mono">
                              {new Date(event.scheduled_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-orangeLight-text dark:text-orangeNoir-text truncate leading-tight">{event.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card p-8 rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm flex flex-col gap-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
              <Clock size={18} />
            </div>
            {t('calUpcoming')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-orangeLight-bg dark:bg-orangeNoir-sidebar/40 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border hover:border-orange-500/30 transition-all group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-orangeLight-sidebar dark:bg-orangeNoir-card flex items-center justify-center shadow-sm border border-orangeLight-border dark:border-orangeNoir-border group-hover:scale-110 transition-transform">
                    {getPlatformIcon(event.platform)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text truncate mb-1 uppercase tracking-tight">{event.title}</h4>
                    <p className="text-[10px] font-bold text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono">
                      {new Date(event.scheduled_at).toLocaleDateString(locale)} • {new Date(event.scheduled_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full py-12 text-center select-none opacity-20">
                <CalendarIcon size={48} strokeWidth={1} className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">{t('calEmpty')}</p>
              </div>
            )}
          </div>
        </div>
    </motion.div>
  );
}
