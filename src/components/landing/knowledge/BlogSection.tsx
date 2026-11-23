'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { blogCover } from '@/lib/blog-cover';

interface BlogSectionProps {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    cover_image: string | null;
    category: string | null;
    locale?: string | null;
  }>;
}

export default function BlogSection({ posts }: BlogSectionProps) {
  const t = useTranslations('blog');

  if (!posts || posts.length === 0) {
    return null;
  }

  const displayPosts = posts.slice(0, 3);

  return (
    <section className="block" id="blog">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{t('badge')}</p>
          <h2 id="blog-title">{t('title')}</h2>
          <p className="lede">{t('sub')}</p>
        </div>

        <div className="grid3">
          {displayPosts.map((post) => (
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

        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <Link href="/blog" className="btn btn--secondary">
            {t('allPosts')}
          </Link>
        </div>
      </div>
    </section>
  );
}
