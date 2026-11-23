import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLocale, getTranslations } from 'next-intl/server';
import { dateLocaleFor, ogLocaleFor } from '@/i18n';
import { createClient } from '@/lib/supabase-server';
import { createClient as supabaseJsClient } from '@supabase/supabase-js';
import { selectLocaleRows } from '@/lib/locale-rows';
import { absoluteUrl, blogCover } from '@/lib/blog-cover';
import { getSite } from '@/lib/site-server';

export const revalidate = 3600; // revalidate every hour

interface Props {
  params: { slug: string };
}

// 1. Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image, category, slug, locale')
    .eq('slug', params.slug)
    .single();

  if (!post) {
    const td = await getTranslations('blog');
    return { title: td('notFound') };
  }

  const { brand, url: siteUrl } = getSite();
  const title = `${post.title} | ${brand.name}`;
  const description = post.excerpt || '';
  const imageUrl = absoluteUrl(blogCover(post.cover_image, post.slug), siteUrl);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: 'article',
      siteName: brand.name,
      locale: ogLocaleFor(post.locale || 'th'),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  };
}

// 2. SSG: Pre-generate all blog paths
export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return [];
  }

  const supabase = supabaseJsClient(url, key);
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, locale')
    .eq('published', true);

  // Generate params for each locale version
  const params: { slug: string; locale: string }[] = [];
  for (const post of posts || []) {
    params.push({ slug: post.slug, locale: post.locale || 'th' });
  }
  return params;
}

// 3. Server Page Component
export default async function BlogPostPage({ params }: Props) {
  const locale = await getLocale();
  const { brand, url: siteUrl } = getSite();
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug);

  if (error || !posts || posts.length === 0) {
    notFound();
  }

  const post = selectLocaleRows(posts, locale)[0];
  if (!post) {
    notFound();
  }

  const t = await getTranslations('blog');
  // The row's own language, not the visitor's cookie: an English article opened from a Thai
  // session must not inherit Thai typography (`:lang(th) { line-height: 1.8 }`) or `<html lang="th">`.
  const postLocale = post.locale || 'th';
  const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString(dateLocaleFor(postLocale), {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const coverUrl = absoluteUrl(blogCover(post.cover_image, post.slug), siteUrl);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "inLanguage": postLocale,
    "headline": post.title,
    "description": post.excerpt,
    "image": coverUrl,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.published_at || post.created_at,
    "author": {
      "@type": "Organization",
      "name": brand.name,
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": brand.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/icons/icon-192x192.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`
    }
  };

  return (
    <article className="block" id="blog-post" lang={postLocale} style={{ paddingTop: 'calc(var(--pin-h) + var(--sp-6))' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="wrap" style={{ maxWidth: 'calc(720px + var(--gutter) * 2)' }}>
        <header className="sec-head">
          <p className="kicker">{post.category || t('defaultCat')}</p>
          <h1>{post.title}</h1>
          <p className="lede">
            {t('byLine')} {post.author} · {publishDate}
          </p>
        </header>

        <div className="post-cover">
          <Image
            src={blogCover(post.cover_image, post.slug)}
            alt={post.title}
            width={1280}
            height={720}
            priority
            sizes="(max-width: 760px) 100vw, 720px"
          />
        </div>

        <div className="post-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <div className="post-cta">
          <h2>
            <span>{t('ctaA')}</span> <span className="grad">{t('ctaB')}</span>
          </h2>
          <p className="lede">{t('ctaSub')}</p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <Link href="/chat" className="btn btn--primary">
              {t('chatBtn')}
            </Link>
            <Link href="/#contact" className="btn btn--secondary">
              {t('surveyBtn')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
