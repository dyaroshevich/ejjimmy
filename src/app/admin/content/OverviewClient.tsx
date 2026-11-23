'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  PenLine,
  Layers,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export interface OverviewStats {
  total: number;
  published: number;
  drafts: number;
}

export interface OverviewPost {
  id: string;
  title: string;
  category: string | null;
  published: boolean | null;
  published_at: string | null;
  updated_at: string;
}

export interface OverviewCategory {
  name: string;
  count: number;
}

interface Props {
  stats: OverviewStats;
  recent: OverviewPost[];
  categories: OverviewCategory[];
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function ContentOverviewClient({ stats, recent, categories }: Props) {
  const t = useTranslations('content');
  const locale = useLocale();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const cards = [
    {
      title: t('ovPosts'),
      value: stats.total,
      icon: FileText,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: t('stPublished'),
      value: stats.published,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: t('stDraft'),
      value: stats.drafts,
      icon: PenLine,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
    },
  ];

  const isEmpty = stats.total === 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto pb-24"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-tighter">
          Content Factory Overview
        </h1>
        <p className="text-sm font-medium text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
          {t('ovSub')}
        </p>
      </div>

      {/* Stat cards — every number is a count of rows in blog_posts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="p-4 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card flex items-start justify-between shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-wider text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase">
                {card.title}
              </span>
              <h3 className="text-2xl font-black text-orangeLight-text dark:text-orangeNoir-text font-mono">
                {card.value}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
              <card.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {isEmpty ? (
        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm py-20 text-center select-none"
        >
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
          <Link
            href="/admin/content/posts/new"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Plus size={14} />
            {t('postNew')}
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: latest posts straight from the table */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-7 p-6 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <div>
                <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
                  {t('ovActivity')}
                </h3>
                <p className="text-[9px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted uppercase tracking-wider font-mono">
                  {stats.total}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-orangeLight-border dark:before:bg-orangeNoir-border/40">
              {recent.map((post) => (
                <div key={post.id} className="flex gap-4 relative">
                  <div
                    className={`w-[24px] h-[24px] rounded-full border-4 flex items-center justify-center flex-shrink-0 z-10 ${
                      post.published
                        ? 'bg-orange-500 border-orangeLight-sidebar dark:border-orangeNoir-card'
                        : 'bg-slate-400 border-orangeLight-sidebar dark:border-orangeNoir-card'
                    }`}
                  />
                  <div className="space-y-1 select-text min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <Link
                        href={`/admin/content/posts/${post.id}/edit`}
                        className="text-xs font-bold text-orangeLight-text dark:text-orangeNoir-text leading-tight hover:text-orange-500 transition-colors"
                      >
                        {post.title}
                      </Link>
                      <ArrowUpRight
                        size={12}
                        className="mt-0.5 flex-shrink-0 text-orangeLight-textMuted/40 dark:text-orangeNoir-textMuted/40"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-orangeLight-textMuted dark:text-orangeNoir-textMuted font-mono">
                      <span>{formatDate(post.updated_at, locale)}</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span>{post.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: how the posts split across categories */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 p-6 rounded-lg border border-orangeLight-border dark:border-orangeNoir-border bg-orangeLight-sidebar dark:bg-orangeNoir-card shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-orangeLight-text dark:text-orangeNoir-text uppercase tracking-widest">
                  {t('ovCategories')}
                </h3>
                <Layers
                  size={12}
                  className="text-orangeLight-textMuted/50 dark:text-orangeNoir-textMuted/40"
                />
              </div>
            </div>

            {categories.length === 0 ? (
              <p className="text-[10px] font-mono text-orangeLight-textMuted/60 dark:text-orangeNoir-textMuted/40">
                {t('postEmptyHint')}
              </p>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => {
                  const share = stats.total > 0 ? Math.round((category.count / stats.total) * 100) : 0;
                  return (
                    <div key={category.name} className="space-y-1.5 select-none">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-orangeLight-text dark:text-orangeNoir-text truncate">
                          {category.name}
                        </span>
                        <span className="text-orangeLight-textMuted dark:text-orangeNoir-textMuted">
                          {category.count} · {share}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-orangeLight-border/60 dark:bg-orangeNoir-border/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
