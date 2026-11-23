'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ClipboardList, 
  PenTool, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Plus,
  User,
  Calendar,
  Loader2,
  GripVertical,
  FileText,
  Image as ImageIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface PipelineItem {
  id: string;
  title: string;
  description?: string;
  stage: 'planning' | 'writing' | 'review' | 'ready';
  author: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
}

export default function ProductionPipelinePage() {
  const t = useTranslations('content');
  const STAGES = [
    { id: 'planning', label: t('stagePlanning'), icon: ClipboardList, color: 'text-slate-500', bg: 'bg-orange-500/5' },
    { id: 'writing', label: t('stageWriting'), icon: PenTool, color: 'text-blue-500', bg: 'bg-blue-500/5' },
    { id: 'review', label: t('stageReview'), icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/5' },
    { id: 'ready', label: t('stageReady'), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-orange-500/5' },
  ];
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/pipeline');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        throw new Error(t('pipeLoadFail'));
      }
    } catch (error) {
      toast.error(t('pipeLineFail'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateStage = async (id: string, newStage: string) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.map(item => item.id === id ? { ...item, stage: newStage as PipelineItem['stage'] } : item));

    try {
      const res = await fetch('/api/admin/content/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage }),
      });

      if (!res.ok) throw new Error();
      toast.success(t('statusUpdated'));
    } catch (error: unknown) {
      setItems(previousItems);
      toast.error(t('statusUpdateFail'));
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle) return;
    setIsAdding(true);
    try {
      const body = {
        title: newItemTitle,
        stage: 'planning',
        priority: 'medium',
        author: 'ผู้ดูแลระบบ',
        due_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
      };

      const res = await fetch('/api/admin/content/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(prev => [data, ...prev]);
        setNewItemTitle('');
        toast.success(t('taskAdded'));
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || t('taskAddFail'));
      }
    } catch (error: any) {
      toast.error(error.message || t('taskAddFail'));
    } finally {
      setIsAdding(false);
    }
  };

  const itemsByStage = useMemo(() => {
    const map: Record<string, PipelineItem[]> = {
      planning: [],
      writing: [],
      review: [],
      ready: []
    };
    items.forEach(item => {
      if (map[item.stage]) {
        map[item.stage].push(item);
      }
    });
    return map;
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">Production Pipeline</h1>
          <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('pipeSub')}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="text" 
            value={newItemTitle}
            disabled={isAdding}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder={t('pipePh')}
            className="flex-1 md:w-72 px-4 py-2.5 bg-orangeLight-sidebar dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-xl text-sm text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm disabled:opacity-50"
          />
          <button 
            onClick={handleAddItem}
            disabled={isAdding || !newItemTitle}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-bold disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-95 min-w-[120px] justify-center"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? t('pipeAdding') : t('pipeAdd')}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-orangeLight-textMuted/40 dark:text-orangeNoir-textMuted/40">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="font-black uppercase tracking-widest text-xs">{t('pipeLoading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 pb-12">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col h-full min-w-0">
              <div className="flex items-center justify-between mb-4 px-2 select-none">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-orangeLight-sidebar dark:bg-orangeNoir-card border border-orangeLight-border dark:border-orangeNoir-border ${stage.color}`}>
                    <stage.icon size={16} />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text">{stage.label}</h3>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-textMuted dark:text-orangeNoir-textMuted rounded-full shadow-sm">
                    {itemsByStage[stage.id]?.length || 0}
                  </span>
                </div>
              </div>

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData('itemId');
                  updateStage(id, stage.id);
                }}
                className={`flex-1 p-3 rounded-2xl border-2 border-dashed border-orangeLight-border/40 dark:border-orangeNoir-border/20 bg-orangeLight-sidebar/30 dark:bg-orangeNoir-sidebar/20 space-y-4 min-h-[600px] transition-all hover:bg-orange-500/5 hover:border-orange-500/20`}
              >
                <AnimatePresence>
                  {(itemsByStage[stage.id] || []).map((item) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div
                        draggable
                        onDragStart={(e: React.DragEvent) => e.dataTransfer.setData('itemId', item.id)}
                        className="bg-orangeLight-sidebar dark:bg-orangeNoir-card p-4 rounded-xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all cursor-grab active:cursor-grabbing group relative select-none"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                            item.priority === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                            item.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                            'bg-orange-500/10 text-orange-600 border-orange-500/20'
                          }`}>
                            {item.priority === 'high' ? 'Priority: High' : item.priority === 'medium' ? 'Priority: Med' : 'Priority: Low'}
                          </span>
                          <GripVertical className="w-4 h-4 text-orangeLight-textMuted/30 dark:text-orangeNoir-textMuted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <h4 className="font-bold text-orangeLight-text dark:text-orangeNoir-text text-sm leading-snug mb-4 line-clamp-2">
                          {item.title}
                        </h4>

                        <div className="flex flex-wrap gap-1.5 mb-5">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orangeLight-bg dark:bg-orangeNoir-bg text-[8px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 border border-orangeLight-border dark:border-orangeNoir-border">
                            <FileText size={10} /> Text
                          </span>
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orangeLight-bg dark:bg-orangeNoir-bg text-[8px] font-black uppercase tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted border border-orangeLight-border dark:border-orangeNoir-border opacity-60">
                            <ImageIcon size={10} /> Media
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-orangeLight-border/50 dark:border-orangeNoir-border/10">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-black text-orange-600">
                              {item.author ? item.author[0] : 'U'}
                            </div>
                            <span className="text-[10px] font-bold text-orangeLight-textMuted dark:text-orangeNoir-textMuted truncate max-w-[80px]">{item.author || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-orangeLight-textMuted/60 dark:text-orangeNoir-textMuted/40">
                            <Calendar size={10} />
                            <span className="text-[10px] font-mono font-bold">{item.due_date}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {(!itemsByStage[stage.id] || itemsByStage[stage.id].length === 0) && (
                  <div className="h-full flex items-center justify-center opacity-10 py-12">
                    <stage.icon className="w-16 h-16 text-orangeLight-text dark:text-orangeNoir-text" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
