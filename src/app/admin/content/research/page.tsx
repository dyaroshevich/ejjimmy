'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Link as LinkIcon, 
  Search, 
  Plus, 
  Database, 
  Globe,
  Loader2,
  Trash2,
  Eye,
  FileCode,
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  X,
  BrainCircuit,
  Zap,
  Info,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface ResearchDoc {
  id: string;
  title: string;
  category: string;
  file_type: string;
  status: string;
  created_at: string;
  content_preview?: string;
}

export default function ResearchPage() {
  const t = useTranslations('content');
  const locale = useLocale();
  const [documents, setDocuments] = useState<ResearchDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIndexing, setIsIndexing] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'groq'>('gemini');
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/research');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/csv', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast.error(t('resOnlyDocs'));
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'market_research');

    try {
      const res = await fetch('/api/admin/research', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate) {
          toast.info(t('resDup'));
        } else {
          toast.success(t('resUpDone'));
        }
        fetchDocuments();
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (error: any) {
      toast.error(t('resUpFail') + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleIndexDocument = async (id: string) => {
    setIsIndexing(id);
    try {
      const res = await fetch('/api/admin/research/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(t('resIndexed', { n: data.chunksCount }));
        fetchDocuments();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error(t('resIndexFail'));
    } finally {
      setIsIndexing(null);
    }
  };

  const runAnalysis = async (task: string) => {
    if (selectedDocs.length === 0) {
      toast.error(t('resPickOne'));
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/admin/research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: selectedDocs,
          task,
          provider: activeProvider
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
        toast.success(t('resAnalyzed'));
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (error: any) {
      toast.error(t('resUpFail') + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('csv') || type.includes('sheet')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (type.includes('markdown') || type.includes('plain')) return <FileCode className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-slate-400" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">Research & Intelligence</h1>
          <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('resSub')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar/60 p-1 rounded-xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm">
            <button 
              onClick={() => setActiveProvider('gemini')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeProvider === 'gemini' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600'}`}
            >
              Gemini
            </button>
            <button 
              onClick={() => setActiveProvider('groq')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeProvider === 'groq' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600'}`}
            >
              Groq
            </button>
          </div>
          <label className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-all cursor-pointer text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="whitespace-nowrap">{t('resUpload')}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Info Banner for RAG */}
      <div className="bg-orange-500/5 dark:bg-orange-900/10 border border-orange-500/20 dark:border-orange-500/10 rounded-2xl p-5 flex items-start gap-4 shadow-sm select-none">
        <div className="p-2.5 bg-orange-500 rounded-xl text-white shadow-md shadow-orange-500/20">
          <BrainCircuit size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">{t('resRagTitle')}</p>
          <p className="text-xs font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted leading-relaxed">
            {t('resRagA')} <Zap size={12} className="inline text-amber-500 mx-0.5" /> <strong>Index</strong> {t('resRagB')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        {/* Document List */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-orangeLight-border dark:border-orangeNoir-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
              <h2 className="text-sm font-black uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text">{t('resKb')}</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orangeLight-textMuted dark:text-orangeNoir-textMuted/40" />
                <input 
                  type="text" 
                  placeholder={t('resSearchPh')} 
                  className="w-full pl-10 pr-4 py-2.5 bg-orangeLight-bg dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-xl text-xs text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
            
            <div className="divide-y divide-orangeLight-border/50 dark:divide-orangeNoir-border/10 overflow-y-auto max-h-[600px] scrollbar-thin">
              {isLoading ? (
                <div className="p-24 flex flex-col items-center justify-center gap-4 text-orangeLight-textMuted/30">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t('resLoading')}</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="p-24 flex flex-col items-center justify-center gap-4 text-orangeLight-textMuted/20 select-none">
                  <FileText size={48} strokeWidth={1} />
                  <p className="text-xs font-bold">{t('resEmpty')}</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-orange-500/5 transition-colors cursor-pointer gap-4 ${selectedDocs.includes(doc.id) ? 'bg-orange-500/5 dark:bg-orange-500/5 shadow-inner' : ''}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${selectedDocs.includes(doc.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg dark:bg-orangeNoir-bg shadow-sm'}`}>
                        {selectedDocs.includes(doc.id) && <CheckCircle2 size={16} />}
                      </div>
                      <div className="p-2.5 bg-orangeLight-bg dark:bg-orangeNoir-bg rounded-xl border border-orangeLight-border dark:border-orangeNoir-border flex-shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-orangeLight-text dark:text-orangeNoir-text text-sm truncate">{doc.title}</h4>
                          {doc.status === 'indexed' && <CheckCircle2 size={14} className="text-orange-500 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-textMuted dark:text-orangeNoir-textMuted rounded-md">
                            {doc.category === 'market_research' ? 'Market Research' : 'General Info'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-orangeLight-textMuted/60 dark:text-orangeNoir-textMuted/40 uppercase">
                            {new Date(doc.created_at).toLocaleDateString(locale)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto select-none">
                      {doc.status !== 'indexed' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleIndexDocument(doc.id); }}
                          disabled={isIndexing === doc.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all active:scale-95 border border-amber-500/20"
                        >
                          {isIndexing === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                          Index
                        </button>
                      )}
                      <div className="flex bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border rounded-xl shadow-sm p-1">
                        <button className="p-2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-red-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Intelligence Tasks Panel */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card p-8 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm sticky top-24 select-none">
            <h3 className="font-black text-xs uppercase tracking-widest text-orangeLight-text dark:text-orangeNoir-text mb-6 flex items-center gap-2">
              <BrainCircuit className="text-orange-500" size={18} />
              Intelligence Tasks
            </h3>
            
            <div className="space-y-4">
              {[
                { id: 'summary', title: t('resTaskSummary'), desc: t('resTaskSummaryD'), icon: FileText },
                { id: 'trends', title: t('resTaskTrends'), desc: t('resTaskTrendsD'), icon: TrendingUp },
                { id: 'competitors', title: t('resTaskComp'), desc: t('resTaskCompD'), icon: Zap }
              ].map((task) => (
                <button 
                  key={task.id}
                  disabled={isAnalyzing || selectedDocs.length === 0}
                  onClick={() => runAnalysis(task.id)}
                  className="w-full text-left p-5 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg dark:bg-orangeNoir-bg hover:bg-orange-500/5 hover:border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h4 className="font-black text-orangeLight-text dark:text-orangeNoir-text text-sm flex items-center justify-between mb-1">
                      {task.title}
                      <ArrowRight size={16} className="text-orangeLight-textMuted/40 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-[11px] font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted leading-relaxed">{task.desc}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <task.icon size={48} strokeWidth={1} />
                  </div>
                </button>
              ))}
            </div>

            {selectedDocs.length > 0 ? (
              <div className="mt-8 pt-8 border-t border-orangeLight-border/50 dark:border-orangeNoir-border/10">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[9px] font-black text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-widest">{t('resSelected', { n: selectedDocs.length })}</p>
                  <button onClick={() => setSelectedDocs([])} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">{t('resClear')}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDocs.map(id => {
                    const doc = documents.find(d => d.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-orange-500/20">
                        <span className="truncate max-w-[120px]">{doc?.title}</span>
                        <button onClick={(e) => { e.stopPropagation(); toggleDocSelection(id); }} className="hover:text-red-500">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-orangeLight-border/50 dark:border-orangeNoir-border/10 text-center">
                <p className="text-[10px] font-bold text-orangeLight-textMuted/60 uppercase tracking-widest italic">{t('resPickHint')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Result Modal/Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-orangeNoir-bg/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-3xl p-10 max-w-md w-full shadow-2xl text-center border border-orangeLight-border dark:border-orangeNoir-border">
              <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <BrainCircuit className="w-12 h-12 text-orange-500" />
                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              </div>
              <h3 className="text-xl font-black text-orangeLight-text dark:text-orangeNoir-text mb-3 uppercase tracking-tighter">{t('resAnalyzing')}</h3>
              <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted leading-relaxed">
                {t('resAnalyzingSub', { p: activeProvider === 'gemini' ? 'Gemini 2.0' : 'Llama 3.3', n: selectedDocs.length })}
              </p>
            </div>
          </motion.div>
        )}

        {analysisResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-orangeNoir-bg/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-orangeLight-border dark:border-orangeNoir-border"
            >
              <div className="p-6 sm:p-8 border-b border-orangeLight-border dark:border-orangeNoir-border flex justify-between items-center bg-orangeLight-bg dark:bg-orangeNoir-bg/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tight">Intelligence Report</h3>
                    <p className="text-[10px] font-mono font-bold text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-widest">
                      Powered by {activeProvider.toUpperCase()} • Based on {selectedDocs.length} Documents
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setAnalysisResult(null)}
                  className="p-3 hover:bg-red-500/10 hover:text-red-500 text-orangeLight-textMuted dark:text-orangeNoir-textMuted rounded-full transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white dark:bg-orangeNoir-sidebar/20 select-text">
                <div className="prose prose-emerald dark:prose-invert max-w-none text-orangeLight-text dark:text-orangeNoir-text prose-sm sm:prose-base leading-relaxed">
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                </div>
              </div>
              <div className="p-6 sm:p-8 border-t border-orangeLight-border dark:border-orangeNoir-border flex flex-col sm:flex-row justify-end gap-4 bg-orangeLight-bg dark:bg-orangeNoir-bg/50">
                <button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('context', analysisResult || '');
                    const firstDoc = documents.find(d => selectedDocs.includes(d.id));
                    params.set('topic', firstDoc?.title || '');
                    router.push(`/admin/content/generator?${params.toString()}`);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                >
                  <Plus size={18} />
                  {t('resUseDraft')}
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const blob = new Blob([analysisResult || ''], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `intelligence-report-${Date.now()}.md`;
                      a.click();
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600 transition-colors border border-orangeLight-border dark:border-orangeNoir-border rounded-xl"
                  >
                    Export .MD
                  </button>
                  <button 
                    onClick={() => setAnalysisResult(null)}
                    className="flex-1 sm:flex-none bg-orangeNoir-bg dark:bg-orangeNoir-input text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                  >
                    {t('resCloseReport')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
