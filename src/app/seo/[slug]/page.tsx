import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const slug = `/${params.slug}`;
  const { data: post } = await supabase
    .from('ejjimmy_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('site_id', 'ejjimmy')
    .eq('is_published', true)
    .single();

  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content?.slice(0, 160),
    alternates: {
      canonical: `https://ejjimmy.vercel.app${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content?.slice(0, 160),
      url: `https://ejjimmy.vercel.app${slug}`,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  };
}

export default async function SEOPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const slug = `/${params.slug}`;

  const { data: post, error } = await supabase
    .from('ejjimmy_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('site_id', 'ejjimmy')
    .eq('is_published', true)
    .single();

  if (error || !post) {
    notFound();
  }

  const postData = post as BlogPost;

  // Simple markdown-like rendering: convert # headings and line breaks to HTML
  const renderContent = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    return (
      <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
        {lines.map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-semibold text-lg">{line.slice(2, -2)}</p>;
          }
          if (line.trim()) return <p key={i}>{line}</p>;
          return <p key={i} />;
        })}
      </div>
    );
  };

  return (
    <section className="block block--cream" id="seo-page">
      <div className="wrap">
        <div className="sec-head sec-head--center">
          <p className="kicker">{postData.category}</p>
          <h1>{postData.title}</h1>
        </div>
        <div className="grid2">
          <div className="card">
            {renderContent(postData.content || '')}
          </div>
          <div className="card pick">
            <div className="pick-head">
              <h3>Получить консультацию</h3>
              <p className="pick-sub">Бесплатный расчёт системы</p>
            </div>
            <p className="pick-desc">
              Оставьте заявку — и наш инженер свяжется с вами в течение 24 часов.
            </p>
            <a href="#contact" className="btn btn--primary btn--lg">
              Заказать расчёт
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}