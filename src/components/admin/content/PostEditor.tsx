'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface PostEditorProps {
  mode: 'create' | 'edit';
  postId?: string;
}

interface PostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  published_at: string;
  category: string;
  tags: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  author: string;
  locale: string;
}



const DEFAULT_FORM: PostForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  published: false,
  published_at: '',
  category: 'ทั่วไป',
  tags: '',
  cover_image: '',
  meta_title: '',
  meta_description: '',
  author: 'Tawan Power',
  locale: 'th',
};

function generateSlug(title: string): string {
  const ascii = title
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .replace(/[\u0E00-\u0E7F]+/g, () => Date.now().toString(36))
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return ascii || `post-${Date.now().toString(36)}`;
}

const inputCls =
  'w-full bg-orangeLight-input dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-lg px-3 py-2 text-sm text-orangeLight-text dark:text-orangeNoir-text placeholder:text-orangeLight-textMuted/60 dark:placeholder:text-orangeNoir-textMuted/60 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors';

const labelCls =
  'block text-[10px] font-mono font-bold tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase mb-1.5';

const cardCls =
  'bg-orangeLight-sidebar dark:bg-orangeNoir-card border border-orangeLight-border dark:border-orangeNoir-border rounded-lg';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PostEditor({ mode, postId }: PostEditorProps) {
  const t = useTranslations('admin');
  // The five category labels live in `content` (the reader on the posts list uses the same
  // namespace). Asking `admin` for them rendered the raw key path in the select.
  const tc = useTranslations('content');
  const CATEGORIES = [
    { value: 'เทคโนโลยี', label: tc('catTech') },
    { value: 'คู่มือ', label: tc('catGuide') },
    { value: 'ข่าวสาร', label: tc('catNews') },
    { value: 'กรณีศึกษา', label: tc('catCase') },
    { value: 'ทั่วไป', label: tc('catGeneral') },
  ];
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const set = useCallback(
    <K extends keyof PostForm>(key: K, value: PostForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  useEffect(() => {
    if (mode !== 'edit' || !postId) return;
    setLoading(true);
    fetch(`/api/blog?id=${postId}`)
      .then((r) => {
        if (!r.ok) throw new Error(t('peLoadFail'));
        return r.json();
      })
      .then((data) => {
        const p = data.data || data;
        setForm({
          title: p.title || '',
          slug: p.slug || '',
          content: p.content || '',
          excerpt: p.excerpt || '',
          published: p.published || false,
          published_at: p.published_at
            ? new Date(p.published_at).toISOString().slice(0, 16)
            : '',
          category: p.category || 'ทั่วไป',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
          cover_image: p.cover_image || '',
          meta_title: p.meta_title || '',
          meta_description: p.meta_description || '',
          author: p.author || 'Tawan Power',
          locale: p.locale || 'th',
        });
        setSlugManual(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mode, postId]);

  useEffect(() => {
    if (slugManual) return;
    set('slug', generateSlug(form.title));
  }, [form.title, slugManual, set]);

  const handleSave = async (publishNow: boolean) => {
    setSaving(true);
    setError(null);

    const body = {
      ...form,
      published: publishNow ? true : form.published,
      published_at:
        (publishNow || form.published) && !form.published_at
          ? new Date().toISOString()
          : form.published_at
          ? new Date(form.published_at).toISOString()
          : null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const url = mode === 'edit' ? `/api/blog?id=${postId}` : '/api/blog';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('peSaveFail'));
      }

      router.push('/admin/content/posts');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('genericFail'));
    } finally {
      setSaving(false);
    }
  };

  const parsedTags = form.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content/posts"
            className="p-2 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border hover:bg-orange-500/5 text-orangeLight-textMuted dark:text-orangeNoir-textMuted transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-orangeLight-text dark:text-orangeNoir-text">
              {mode === 'create' ? t('peCreate') : t('peEdit')}
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">
              {mode === 'create' ? 'New Post' : `Editing: ${postId}`}
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={14} />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
          <div className={`${cardCls} p-5 space-y-4`}>
            <div>
              <label htmlFor="peTitle" className={labelCls}>{t('peTitle')}</label>
              <input id="peTitle"
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder={t('peTitlePh')}
                className={`${inputCls} text-lg font-bold`}
              />
            </div>

            <div>
              <label htmlFor="peSlug" className={labelCls}>Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted whitespace-nowrap">
                  /blog/
                </span>
                <input
                  id="peSlug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    set('slug', e.target.value);
                  }}
                  placeholder="auto-generated-slug"
                  className={`${inputCls} font-mono text-xs flex-1`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="peBody" className={labelCls}>{t('peBody')}</label>
              <textarea id="peBody"
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder={t('peBodyPh')}
                className={`${inputCls} font-mono text-xs resize-y`}
                style={{ minHeight: 400 }}
              />
            </div>

            <div>
              <label htmlFor="peExcerpt" className={labelCls}>{t('peExcerpt')}</label>
              <textarea id="peExcerpt"
                rows={3}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder={t('peExcerptPh')}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className={labelCls}>{t('pePublish')}</h3>

            <div className="flex items-center justify-between">
              <span className="text-xs text-orangeLight-text dark:text-orangeNoir-text">
                {t('peStatus')}
              </span>
              <button
                type="button"
                onClick={() =>
                  set('published', !form.published)
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.published
                    ? 'bg-orange-500'
                    : 'bg-orangeLight-border dark:bg-orangeNoir-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.published ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="text-[10px] font-mono text-right text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-wider">
              {form.published ? t('stPublished') : t('stDraft')}
            </div>

            <div>
              <label htmlFor="pePubDate" className={labelCls}>{t('pePubDate')}</label>
              <input id="pePubDate"
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => set('published_at', e.target.value)}
                className={`${inputCls} text-xs`}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-orangeLight-border dark:border-orangeNoir-border hover:bg-orange-500/5 text-orangeLight-text dark:text-orangeNoir-text transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {t('peSaveDraft')}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {t('pePublishBtn')}
              </button>
            </div>
          </div>

          <div className={`${cardCls} p-5 space-y-4`}>
            <div>
              <label htmlFor="peCategory" className={labelCls}>{t('peCategory')}</label>
              <select id="peCategory"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="peTags" className={labelCls}>{t('peTags')}</label>
              <input id="peTags"
                type="text"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder={t('peTagsPh')}
                className={inputCls}
              />
              {parsedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedTags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const next = parsedTags.filter((_, j) => j !== i);
                          set('tags', next.join(', '));
                        }}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`${cardCls} p-5 space-y-4`}>
            <div>
              <label htmlFor="peCover" className={labelCls}>{t('peCover')}</label>
              <input id="peCover"
                type="url"
                value={form.cover_image}
                onChange={(e) => set('cover_image', e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              {form.cover_image && (
                <div className="mt-2 rounded-lg overflow-hidden border border-orangeLight-border dark:border-orangeNoir-border">
                  <NextImage
                    src={form.cover_image}
                    alt="Cover preview"
                    width={400}
                    height={128}
                    unoptimized
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`${cardCls} p-5 space-y-4`}>
            <h3 className={labelCls}>SEO</h3>

            <div>
              <label htmlFor="metaTitle" className={labelCls}>Meta Title</label>
              <input id="metaTitle"
                type="text"
                value={form.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
                placeholder={form.title || t('peSeoTitlePh')}
                className={inputCls}
              />
              <p className="mt-1 text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                {form.meta_title.length}/60
              </p>
            </div>

            <div>
              <label htmlFor="metaDescription" className={labelCls}>Meta Description</label>
              <textarea id="metaDescription"
                rows={2}
                value={form.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
                placeholder={t('peSeoDescPh')}
                className={`${inputCls} resize-none`}
              />
              <p className="mt-1 text-[10px] font-mono text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                {form.meta_description.length}/160
              </p>
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <label htmlFor="peAuthor" className={labelCls}>{t('peAuthor')}</label>
            <input id="peAuthor"
              type="text"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className={`${cardCls} p-5`}>
            <label htmlFor="peLocale" className={labelCls}>Content Locale</label>
            <select id="peLocale"
              value={form.locale}
              onChange={(e) => set('locale', e.target.value)}
              className={inputCls}
            >
              <option value="th">Thai (ไทย)</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh-CN">中文</option>
            </select>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
