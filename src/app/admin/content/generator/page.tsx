'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Copy, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Loader2,
  Settings,
  Type,
  Layout,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function GeneratorPage() {
  const t = useTranslations('content');
  const TEMPLATES = [
    { value: 'blog-post', label: t('tplBlog') },
    { value: 'facebook-post', label: t('tplFb') },
    { value: 'line-broadcast', label: t('tplLine') },
    { value: 'brand-comparison', label: t('tplCompare') },
    { value: 'industrial-guide', label: t('tplIndustrial') },
  ];

  const TONES = [
    { value: 'professional', label: t('tonePro') },
    { value: 'friendly', label: t('toneFriendly') },
    { value: 'educational', label: t('toneEdu') },
    { value: 'urgent', label: t('toneUrgent') },
  ];
  const searchParams = useSearchParams();
  const [template, setTemplate] = useState(TEMPLATES[0].value);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState(TONES[0].value);
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'groq'>('gemini');

  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    const urlContext = searchParams.get('context');
    if (urlTopic) setTopic(urlTopic);
    if (urlContext) setContext(urlContext);
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error(t('genNeedTopic'));
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          topic,
          tone,
          context,
          provider: activeProvider
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedContent(data.content);
        toast.success(t('genDone'));
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (error: any) {
      toast.error(t('genFail') + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast.success(t('copied'));
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">AI Content Generator</h1>
          <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('genSub')}</p>
        </div>
        <div className="flex bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar/60 p-1 rounded-xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm">
          <button 
            onClick={() => setActiveProvider('gemini')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeProvider === 'gemini' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600'}`}
          >
            Gemini 2.0
          </button>
          <button 
            onClick={() => setActiveProvider('groq')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeProvider === 'groq' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600'}`}
          >
            Llama 3.3
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pb-12">
        {/* Settings Panel */}
        <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card p-8 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm space-y-8 flex flex-col">
          <div className="flex items-center gap-3 pb-6 border-b border-orangeLight-border/50 dark:border-orangeNoir-border/10 select-none">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <Settings size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text">{t('genSettings')}</h3>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <p id="genTemplateLabel" className={labelCls}>
                <Layout size={14} /> {t('genTemplate')}
              </p>
              <div role="group" aria-labelledby="genTemplateLabel" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all text-left flex items-center justify-between ${template === t.value ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-orangeLight-bg dark:bg-orangeNoir-bg border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:border-orange-500/40'}`}
                  >
                    {t.label}
                    {template === t.value && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="genTopic" className={labelCls}>
                <Type size={14} /> {t('genTopic')}
              </label>
              <input id="genTopic"
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={t('genTopicPh')}
                className={`${inputCls} bg-orangeLight-bg dark:bg-orangeNoir-bg border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-text dark:text-orangeNoir-text placeholder:text-orangeLight-textMuted/40 dark:placeholder:text-orangeNoir-textMuted/30`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label htmlFor="genTone" className={labelCls}>
                  <Sparkles size={14} /> {t('genTone')}
                </label>
                <select id="genTone"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className={`${inputCls} bg-orangeLight-bg dark:bg-orangeNoir-bg border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-text dark:text-orangeNoir-text appearance-none cursor-pointer`}
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
                <label htmlFor="genContext" className={labelCls}>
                  <MessageSquare size={14} /> {t('genContext')}
              </label>
              <textarea id="genContext"
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={5}
                placeholder={t('genContextPh')}
                className={`${inputCls} bg-orangeLight-bg dark:bg-orangeNoir-bg border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-text dark:text-orangeNoir-text resize-none placeholder:text-orangeLight-textMuted/40 dark:placeholder:text-orangeNoir-textMuted/30 leading-relaxed`}
              />
            </div>
          </div>

          <div className="pt-8 mt-auto border-t border-orangeLight-border/50 dark:border-orangeNoir-border/10">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 bg-orangeNoir-bg dark:bg-orangeNoir-input hover:opacity-90 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-orangeNoir-bg/20 active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('genWorking')}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>{t('genCreate')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-orangeNoir-bg dark:bg-orangeNoir-sidebar rounded-3xl border border-orangeNoir-border shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 select-none">
            <div className="flex items-center gap-3 text-orange-400">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <FileText size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">{t('genPreview')}</h3>
            </div>

            <AnimatePresence>
              {generatedContent && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-2"
                >
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                  >
                    <Copy size={14} /> {t('genCopy')}
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                    {t('genToPipe')} <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-orangeNoir-sidebar/40">
            {isGenerating ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-white/10 rounded-xl w-3/4" />
                <div className="h-4 bg-white/10 rounded-lg w-full" />
                <div className="h-4 bg-white/10 rounded-lg w-5/6" />
                <div className="h-4 bg-white/10 rounded-lg w-full" />
                <div className="h-1 bg-white/5 rounded-full my-8" />
                <div className="h-32 bg-white/10 rounded-2xl w-full" />
                <div className="h-4 bg-white/10 rounded-lg w-full" />
                <div className="h-4 bg-white/10 rounded-lg w-2/3" />
              </div>
            ) : generatedContent ? (
              <div className="prose prose-orange prose-invert max-w-none text-orange-50/90 select-text leading-relaxed font-medium">
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 select-none opacity-40">
                <div className="w-20 h-24 rounded-3xl border-2 border-orange-500/20 flex items-center justify-center relative">
                  <Sparkles size={32} className="text-orange-500/30" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-white font-black uppercase tracking-widest text-sm mb-2">{t('genEmpty')}</p>
                  <p className="text-[11px] text-orange-50/40 max-w-[280px] leading-relaxed uppercase tracking-wider font-mono">{t('genEmptySub')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
