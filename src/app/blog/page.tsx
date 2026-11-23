import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { dateLocaleFor } from '@/i18n';
import { createClient } from '@/lib/supabase-server';
import { blogCover } from '@/lib/blog-cover';
import { postsForLocale } from '@/lib/blog-locale';
import { getLocale } from 'next-intl/server';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog');
  return { title: t('metaTitle'), description: t('metaDesc') };
}

async function getBlogPosts(locale: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
  return postsForLocale(data || [], locale);
}

export default async function BlogListPage() {
  const posts = await getBlogPosts(await getLocale());
  const t = await getTranslations('blog');

  return (
    <section className="block" id="blog-list" style={{ paddingTop: 'calc(var(--pin-h) + var(--sp-6))' }}>
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('badge')}</p>
          <h1>{t('title')}</h1>
          <p className="lede">{t('sub')}</p>
        </div>

        {posts.length === 0 ? (
          <p className="state-note">{t('empty')}</p>
        ) : (
          <div className="grid3">
            {posts.map((post) => (
              <article className="card" key={post.id}>
                <Link href={`/blog/${post.slug}`} aria-label={post.title}>
                  <Image
                    className="case-img"
                    src={blogCover(post.cover_image, post.slug)}
                    alt={post.title}
                    width={960}
                    height={600}
                    sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 32vw"
                  />
                </Link>
                <div className="case-meta">
                  <span className="badge">{post.category || t('defaultCat')}</span>
                  <span className="badge badge--success">
                    {new Date(post.published_at || post.created_at).toLocaleDateString(dateLocaleFor(post.locale || 'th'), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3>
                  <Link href={`/blog/${post.slug}`} lang={post.locale || 'th'}>{post.title}</Link>
                </h3>
                {post.excerpt ? <p lang={post.locale || 'th'}>{post.excerpt}</p> : null}
                <Link href={`/blog/${post.slug}`} className="btn btn--secondary btn--sm">
                  {t('readMore')}
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <Link href="/#contact" className="btn btn--secondary">
            {t('homeBtn')}
          </Link>
        </div>
      </div>
    </section>
  );
}
