'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Video');
  const [platform, setPlatform] = useState('Facebook');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      title,
      content: description || 'ไม่มีคำอธิบาย',
      category: 'ทั่วไป',
      tags: [platform, contentType],
      published: false,
    };

    try {
      // 1. Create the Blog Post
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างบทความ');
      }

      const postData = await res.json();
      const blogPostId = postData?.data?.id;

      // 2. Create the Pipeline Item linking to this post
      if (blogPostId) {
        await fetch('/api/admin/content/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: description || 'สร้างผ่านเมนูโพสต์ใหม่',
            stage: 'planning',
            priority: 'medium',
            author: 'ผู้ดูแลระบบ',
            due_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
            blog_post_id: blogPostId
          }),
        }).catch(err => console.error('Failed to create pipeline item', err));
      }

      setTitle('');
      setDescription('');
      
      onClose();
      
      // Ensure all operations are finished before we either reload or redirect
      if (window.location.pathname === '/admin/content/posts' || window.location.pathname === '/admin/content/pipeline') {
        window.location.reload();
      } else {
        await router.push('/admin/content/pipeline');
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const selectCls =
    'w-full bg-orangeLight-input dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-lg px-3 py-2 text-sm text-orangeLight-text dark:text-orangeNoir-text focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors';

  const inputCls =
    'w-full bg-orangeLight-input dark:bg-orangeNoir-input border border-orangeLight-border dark:border-orangeNoir-border rounded-lg px-3 py-2 text-sm text-orangeLight-text dark:text-orangeNoir-text placeholder:text-orangeLight-textMuted/60 dark:placeholder:text-orangeNoir-textMuted/60 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors';

  const labelCls =
    'block text-[10px] font-mono font-bold tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase mb-1.5';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-lg bg-orangeLight-sidebar dark:bg-orangeNoir-card border border-orangeLight-border dark:border-orangeNoir-border rounded-xl shadow-2xl overflow-hidden z-10 font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-orangeLight-border dark:border-orangeNoir-border">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-wider">
                  {t('pmTitle')}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border hover:bg-orange-500/5 text-orangeLight-textMuted dark:text-orangeNoir-textMuted disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="pmHeading" className={labelCls}>{t('pmHeading')}</label>
                  <input id="pmHeading"
                    type="text"
                    required
                    disabled={loading}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('pmTitlePh')}
                    className={inputCls}
                  />
                </div>

                {/* Grid Type + Platform */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pmType" className={labelCls}>{t('pmType')}</label>
                    <select id="pmType"
                      value={contentType}
                      disabled={loading}
                      onChange={(e) => setContentType(e.target.value)}
                      className={selectCls}
                    >
                      <option value="Video">{t('optVideo')}</option>
                      <option value="Post">{t('optPost')}</option>
                      <option value="Carousel">{t('optCarousel')}</option>
                      <option value="Story">{t('optStory')}</option>
                      <option value="Article">{t('optArticle')}</option>
                      <option value="Ad">{t('optAd')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pmPlatform" className={labelCls}>{t('pmPlatform')}</label>
                    <select id="pmPlatform"
                      value={platform}
                      disabled={loading}
                      onChange={(e) => setPlatform(e.target.value)}
                      className={selectCls}
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="LINE">LINE</option>
                      <option value="Blog">{t('optBlog')}</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="pmDesc" className={labelCls}>{t('pmDesc')}</label>
                  <textarea id="pmDesc"
                    required
                    rows={4}
                    disabled={loading}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('pmDescPh')}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-orangeLight-bg dark:bg-orangeNoir-bg/50 border-t border-orangeLight-border dark:border-orangeNoir-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-orangeLight-border dark:border-orangeNoir-border hover:bg-orange-500/5 text-orangeLight-text dark:text-orangeNoir-text disabled:opacity-50"
                >
                  {t('pmCancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  {loading ? t('pmCreating') : t('pmCreate')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
