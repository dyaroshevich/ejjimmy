import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { canonicalUrl, roUrl } from '@/lib/canonical';
import { sites } from '@/lib/site.config';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  locale: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const loadPost = async (slug: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('ejjimmy_blog_posts')
    .select('*')
    .eq('slug', `/${slug}`)
    .eq('site_id', 'ejjimmy')
    .eq('is_published', true)
    .single();
  return data as BlogPost | null;
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await loadPost(params.slug);

  if (!post) {
    return { title: 'Not Found' };
  }

  const url = canonicalUrl(sites.ejjimmy, `/seo/${params.slug}`);
  return {
    title: post.title,
    description: post.excerpt || post.content?.slice(0, 160),
    alternates: {
      canonical: url,
      languages: roUrl(sites.ejjimmy, `/seo/${params.slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content?.slice(0, 160),
      url,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  };
}

export default async function SEOPage({ params }: { params: { slug: string } }) {
  const post = await loadPost(params.slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations('products');
  const ts = await getTranslations('seo');

  // The import stores the CSV's research lines with Russian labels. They are mapped to the UI
  // language here; the free-text body itself stays as imported (owner decision pending).
  const labelMap: Record<string, string> = {
    'Ключевой запрос:': t('primaryKeyword'),
    'Вторичные ключи:': t('secondaryKeywords'),
    'Внутренние ссылки:': t('internalLinks'),
    'Призыв к действию:': t('ctaLabel'),
  };

  const renderContent = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    return (
      <div className="prose prose-slate dark:prose-invert max-w-3xl">
        {lines.map((line, i) => {
          if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
          if (line.startsWith('## ')) return <h3 key={i}>{line.slice(3)}</h3>;
          if (line.startsWith('### ')) return <h4 key={i}>{line.slice(4)}</h4>;
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} className="font-semibold text-lg">
                {line.slice(2, -2)}
              </p>
            );
          }
          for (const [ru, translated] of Object.entries(labelMap)) {
            const marker = `**${ru}**`;
            if (line.startsWith(marker)) {
              // `internal_links` is imported as prose ("все страницы 2-го уровня…"), not URLs,
              // so it stays text — there is nothing to link to.
              return (
                <p key={i}>
                  <strong>{translated}:</strong> {line.slice(marker.length).trim()}
                </p>
              );
            }
          }
          if (line.trim()) return <p key={i}>{line}</p>;
          return null;
        })}
      </div>
    );
  };

  return (
    <section className="block block--cream" id="seo-page">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker" lang="th">{post.category}</p>
          <h1 lang="th">{post.title}</h1>
        </div>
        <div className="grid2">
          <div className="card">{renderContent(post.content || '')}</div>
          <div className="card pick">
            <div className="pick-head">
              <h3>{ts('consult')}</h3>
              <p className="pick-sub">{ts('freeCalc')}</p>
            </div>
            <p className="pick-desc">{ts('lead')}</p>
            <a href="#contact" className="btn btn--primary btn--lg">
              {ts('order')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
