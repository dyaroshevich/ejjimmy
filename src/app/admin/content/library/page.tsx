'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Upload, 
  Search, 
  MoreVertical, 
  Grid, 
  List, 
  FolderPlus,
  Filter,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

interface MediaFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
  thumbnail_url?: string;
}

export default function MediaLibraryPage() {
  const t = useTranslations('content');
  const locale = useLocale();
  const [viewMode, setViewViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchFiles();
  }, [activeCategory]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/content/library?category=${activeCategory}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      toast.error(t('libLoadFail'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', file.type.startsWith('image') ? 'images' : file.type.startsWith('video') ? 'video' : 'documents');

    try {
      const res = await fetch('/api/admin/content/library', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate) {
          toast.info(t('libDup'));
        } else {
          toast.success(t('libUpDone'));
        }
        fetchFiles();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error(t('libUpFail'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('libConfirmDel'))) return;

    try {
      const res = await fetch(`/api/admin/content/library?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== id));
        setSelectedFiles(prev => prev.filter(fId => fId !== id));
        toast.success(t('libDelDone'));
      }
    } catch (error) {
      toast.error(t('libDelFail'));
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return <ImageIcon className="w-6 h-6 text-blue-500" />;
    if (type.startsWith('video')) return <Video className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-amber-500" />;
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">Media Library</h1>
          <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">{t('libSub')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isUploading ? t('uploading') : t('uploadFile')}</span>
            <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card p-5 rounded-2xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6 select-none">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orangeLight-textMuted dark:text-orangeNoir-textMuted/40" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('libSearchPh')} 
            className="w-full pl-11 pr-4 py-3 bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border rounded-2xl text-xs text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto justify-between">
          <div className="flex items-center gap-2 bg-orangeLight-bg dark:bg-orangeNoir-bg p-1.5 rounded-xl border border-orangeLight-border dark:border-orangeNoir-border shadow-inner">
            <button 
              onClick={() => setViewViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-orange-500 shadow-md text-white' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-500'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-500 shadow-md text-white' : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-500'}`}
            >
              <List size={18} />
            </button>
          </div>
          
          <div className="hidden sm:block h-8 w-px bg-orangeLight-border dark:border-orangeNoir-border/50" />

          <div className="flex flex-wrap justify-center gap-2">
            {['all', 'images', 'video', 'documents'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${activeCategory === cat ? 'bg-orangeNoir-bg dark:bg-orangeNoir-input text-white border-orangeNoir-bg' : 'bg-orangeLight-bg dark:bg-orangeNoir-bg text-orangeLight-textMuted dark:text-orangeNoir-textMuted border-orangeLight-border dark:border-orangeNoir-border hover:border-orange-500/40'}`}
              >
                {cat === 'all' ? t('libAll') : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Actions */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-orangeNoir-bg dark:bg-orange-600 px-8 py-4 rounded-2xl text-white flex justify-between items-center shadow-2xl z-20 border border-orange-500/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-mono font-black text-sm">
                {selectedFiles.length}
              </div>
              <span className="font-black uppercase tracking-widest text-xs">{t('libSelected')}</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-400 transition-colors"><Trash2 size={16} /> {t('libDeleteSel')}</button>
              <div className="h-6 w-px bg-white/10" />
              <button onClick={() => setSelectedFiles([])} className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity">{t('libCancel')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files Area */}
      <div className="pb-24">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6 text-orangeLight-textMuted/30">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest">{t('libLoading')}</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6 text-orangeLight-textMuted/20 border-2 border-dashed border-orangeLight-border dark:border-orangeNoir-border rounded-[2.5rem] select-none">
            <div className="p-8 bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-full border border-orangeLight-border dark:border-orangeNoir-border shadow-sm">
              <ImageIcon size={64} strokeWidth={1} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-black uppercase tracking-widest">{t('libEmpty')}</p>
              <p className="text-[10px] font-mono font-bold opacity-60">{t('libEmptyHint')}</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
            {filteredFiles.map(file => (
              <div 
                key={file.id} 
                onClick={() => toggleSelection(file.id)}
                className={`group relative bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-3xl border transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${selectedFiles.includes(file.id) ? 'border-orange-500 ring-8 ring-orange-500/10' : 'border-orangeLight-border dark:border-orangeNoir-border hover:border-orange-500/30'}`}
              >
                <div className="aspect-[4/5] bg-orangeLight-bg dark:bg-orangeNoir-bg flex items-center justify-center relative">
                  {file.file_type.startsWith('image') ? (
                    <NextImage src={file.file_path} alt={file.name} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="p-6 bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm">
                      {getFileIcon(file.file_type)}
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-orangeNoir-bg/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <a href={file.file_path} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-3 bg-white rounded-2xl text-orangeNoir-bg hover:bg-orange-500 hover:text-white transition-all active:scale-90 shadow-xl"><Eye size={18} /></a>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-3 bg-white rounded-2xl text-orangeNoir-bg hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl"><Trash2 size={18} /></button>
                  </div>

                  {/* Selection Checkbox */}
                  <div className={`absolute top-4 left-4 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${selectedFiles.includes(file.id) ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white/90 border-orangeLight-border opacity-0 group-hover:opacity-100 shadow-sm'}`}>
                    {selectedFiles.includes(file.id) && <CheckCircle2 size={14} strokeWidth={3} />}
                  </div>
                </div>
                <div className="p-5 select-none">
                  <p className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text truncate mb-1 uppercase tracking-tight">{file.name}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono font-bold uppercase">{formatSize(file.file_size)}</p>
                    <div className="w-1 h-1 rounded-full bg-orangeLight-border dark:bg-orangeNoir-border" />
                    <p className="text-[9px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono font-bold uppercase">{new Date(file.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-orangeLight-sidebar dark:bg-orangeNoir-card rounded-3xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto select-none">
              <table className="w-full text-left border-collapse">
                <thead className="bg-orangeLight-bg dark:bg-orangeNoir-bg border-b border-orangeLight-border dark:border-orangeNoir-border">
                  <tr className="text-[10px] font-black text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-widest">
                    <th className="px-8 py-5 w-16 text-center">
                      <div className="w-5 h-5 rounded-lg border-2 border-orangeLight-border dark:border-orangeNoir-border mx-auto" />
                    </th>
                    <th className="px-6 py-5">{t('libThName')}</th>
                    <th className="px-6 py-5">{t('libThSize')}</th>
                    <th className="px-6 py-5">{t('libThDate')}</th>
                    <th className="px-8 py-5 text-right">{t('libThManage')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orangeLight-border/40 dark:divide-orangeNoir-border/10">
                  {filteredFiles.map(file => (
                    <tr 
                      key={file.id}
                      onClick={() => toggleSelection(file.id)}
                      className={`hover:bg-orange-500/5 cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'bg-orange-500/5' : ''}`}
                    >
                      <td className="px-8 py-5 text-center">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all mx-auto ${selectedFiles.includes(file.id) ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg dark:bg-orangeNoir-bg'}`}>
                          {selectedFiles.includes(file.id) && <CheckCircle2 size={12} strokeWidth={3} />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orangeLight-bg dark:bg-orangeNoir-bg rounded-xl border border-orangeLight-border dark:border-orangeNoir-border shadow-sm">
                            {getFileIcon(file.file_type)}
                          </div>
                          <span className="text-sm font-bold text-orangeLight-text dark:text-orangeNoir-text">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[10px] font-mono font-bold text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">{formatSize(file.file_size)}</td>
                      <td className="px-6 py-5 text-[10px] font-mono font-bold text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">{new Date(file.created_at).toLocaleDateString(locale)}</td>
                      <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-600 transition-colors"><Eye size={18} /></button>
                          <button onClick={() => handleDelete(file.id)} className="p-2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
