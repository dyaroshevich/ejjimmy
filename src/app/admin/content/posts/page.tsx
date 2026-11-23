'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Image as ImageIcon,
  AlertCircle,
  X,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  cover_image?: string;
  published_at?: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'all', labelKey: 'libAll' },
  { value: 'เทคโนโลยี', labelKey: 'catTech' },
  { value: 'คู่มือ', labelKey: 'catGuide' },
  { value: 'ข่าวสาร', labelKey: 'catNews' },
  { value: 'กรณีศึกษา', labelKey: 'catCase' },
  { value: 'ทั่วไป', labelKey: 'catGeneral' },
];

const STATUS_FILTERS = [
  { value: 'all', labelKey: 'libAll' },
  { value: 'published', labelKey: 'stPublished' },
  { value: 'draft', labelKey: 'stDraft' },
];

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'เทคโนโลยี':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    case 'คู่มือ':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    case 'ข่าวสาร':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    case 'กรณีศึกษา':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
  }
}

export default function PostsPage() {
  const t = useTranslations('content');
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blog?status=all');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('genericFail'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !debouncedSearch ||
        post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.slug.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || post.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' ? post.published : !post.published);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, debouncedSearch, categoryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blog?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      setError(t('delFail'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
          <h1 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
            {t('postManage')}
          </h1>
          {!loading && (
            <span className="px-2 py-0.5 rounded bg-orangeLight-bg dark:bg-orangeNoir-bg text-[10px] font-mono font-bold border border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
              {filteredPosts.length}
            </span>
          )}
        </div>
        <Link
          href="/admin/content/posts/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus size={14} />
          {t('postNew')}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 select-none">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-orangeLight-textMuted dark:text-orangeNoir-textMuted/60">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={t('postSearchPh')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-input text-orangeLight-text dark:text-orangeNoir-text placeholder:text-orangeLight-textMuted/60 dark:placeholder:text-orangeNoir-textMuted/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors"
          />
        </div>

        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted/60 pointer-events-none"
          />
          <ChevronDown
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-orangeLight-textMuted dark:text-orangeNoir-textMuted/60 pointer-events-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2 text-xs rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-input text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {t(c.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-orangeLight-sidebar dark:bg-orangeNoir-sidebar/60 border border-orangeLight-border dark:border-orangeNoir-border rounded-lg">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === s.value
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                  : 'text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:bg-orange-500/5 hover:text-orangeLight-text dark:hover:text-orangeNoir-text border border-transparent'
              }`}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold"
        >
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={14} />
          </button>
        </motion.div>
      )}

      <div className="rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-orangeLight-border/60 dark:divide-orangeNoir-border/20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded bg-orangeLight-border/50 dark:bg-orangeNoir-border/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded bg-orangeLight-border/50 dark:bg-orangeNoir-border/30" />
                  <div className="h-2 w-32 rounded bg-orangeLight-border/30 dark:bg-orangeNoir-border/20" />
                </div>
                <div className="h-5 w-16 rounded bg-orangeLight-border/40 dark:bg-orangeNoir-border/20" />
                <div className="h-5 w-14 rounded bg-orangeLight-border/40 dark:bg-orangeNoir-border/20" />
                <div className="h-3 w-20 rounded bg-orangeLight-border/30 dark:bg-orangeNoir-border/20" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center select-none">
            <FileText
              size={32}
              className="mx-auto mb-3 text-orangeLight-textMuted/40 dark:text-orangeNoir-textMuted/30"
            />
            <p className="text-sm font-semibold text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
              {t('postEmpty')}
            </p>
            <p className="text-[10px] font-mono text-orangeLight-textMuted/60 dark:text-orangeNoir-textMuted/40 mt-1">
              {t('postEmptyHint')}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto select-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-bg dark:bg-orangeNoir-bg/25 text-[10px] font-mono font-bold tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">
                    <th className="px-6 py-3.5">{t('postThTitle')}</th>
                    <th className="px-6 py-3.5">{t('postThCat')}</th>
                    <th className="px-6 py-3.5">{t('postThStatus')}</th>
                    <th className="px-6 py-3.5">{t('postThDate')}</th>
                    <th className="px-6 py-3.5 text-right">{t('postThActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orangeLight-border/60 dark:divide-orangeNoir-border/20 text-xs">
                  {filteredPosts.map((post, i) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-orange-500/5 transition-colors group select-text"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.cover_image ? (
                            <NextImage
                              src={post.cover_image}
                              alt=""
                              width={40}
                              height={40}
                              unoptimized
                              className="rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-orange-900 flex-shrink-0 flex items-center justify-center">
                              <ImageIcon size={14} className="text-white/20" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-orangeLight-text dark:text-orangeNoir-text truncate max-w-xs">
                              {post.title}
                            </p>
                            <p className="text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted truncate max-w-xs mt-0.5">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${getCategoryColor(post.category)}`}
                        >
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {post.published ? (
                          <span className="flex items-center gap-1.5 text-xs text-orange-500 font-bold w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            {t('stPublished')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {t('stDraft')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                        {post.published_at
                          ? formatDate(post.published_at, locale)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right select-none">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/content/posts/${post.id}/edit`}
                            className="p-1.5 rounded hover:bg-orange-500/10 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-500 transition-colors"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-orangeLight-border/60 dark:divide-orangeNoir-border/20 p-4 space-y-4 select-none">
              {filteredPosts.map((post) => (
                <div key={post.id} className="pt-4 first:pt-0 space-y-3 select-text">
                  <div className="flex gap-3">
                    {post.cover_image ? (
                      <NextImage
                        src={post.cover_image}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-orange-500 to-orange-900 flex-shrink-0 flex items-center justify-center">
                        <ImageIcon size={16} className="text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text leading-tight mb-1 truncate">
                        {post.title}
                      </h4>
                      <p className="text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted truncate">
                        /{post.slug}
                      </p>
                    </div>
                    <div className="flex items-start gap-1">
                      <Link
                        href={`/admin/content/posts/${post.id}/edit`}
                        className="p-1.5 rounded hover:bg-orange-500/10 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-orange-500 transition-colors"
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-orangeLight-textMuted dark:text-orangeNoir-textMuted hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted pt-1 border-t border-dashed border-orangeLight-border/50 dark:border-orangeNoir-border/10">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      {post.published ? (
                        <span className="flex items-center gap-1 text-orange-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          {t('stPublished')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {t('stDraft')}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {post.published_at ? formatDate(post.published_at, locale) : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Trash2 size={16} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
                    {t('delTitle')}
                  </h3>
                  <p className="text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted mt-0.5">
                    {t('delSub')}
                  </p>
                </div>
              </div>

              <div className="px-3 py-2.5 rounded-lg bg-orangeLight-bg dark:bg-orangeNoir-bg border border-orangeLight-border dark:border-orangeNoir-border">
                <p className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text truncate">
                  {deleteTarget.title}
                </p>
                <p className="text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted mt-0.5">
                  /{deleteTarget.slug}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-xs font-bold rounded-lg border border-orangeLight-border dark:border-orangeNoir-border text-orangeLight-text dark:text-orangeNoir-text hover:bg-orange-500/5 transition-colors disabled:opacity-50"
                >
                  {t('delCancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {deleting ? t('delDeleting') : t('delDelete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
