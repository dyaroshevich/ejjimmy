import { supabaseAdmin } from '@/lib/supabase-admin';
import ContentOverviewClient, {
  type OverviewCategory,
  type OverviewPost,
  type OverviewStats,
} from './OverviewClient';

// The numbers are a live read of the table, so the page must not be prerendered at build time.
export const dynamic = 'force-dynamic';

interface OverviewData {
  stats: OverviewStats;
  recent: OverviewPost[];
  categories: OverviewCategory[];
}

const EMPTY: OverviewData = {
  stats: { total: 0, published: 0, drafts: 0 },
  recent: [],
  categories: [],
};

/** Counts come from `blog_posts` only — the same table the posts screen and the public blog read. */
async function loadOverview(): Promise<OverviewData> {
  if (!supabaseAdmin) return EMPTY;

  try {
    const [total, published, recent, categoryRows] = await Promise.all([
      supabaseAdmin.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('published', true),
      supabaseAdmin
        .from('blog_posts')
        .select('id,title,category,published,published_at,updated_at')
        .order('updated_at', { ascending: false })
        .limit(6),
      supabaseAdmin.from('blog_posts').select('category'),
    ]);

    if (total.error) throw total.error;

    const totalCount = total.count ?? 0;
    const publishedCount = published.count ?? 0;

    const byCategory = new Map<string, number>();
    for (const row of categoryRows.data ?? []) {
      const name = (row as { category: string | null }).category?.trim();
      if (!name) continue;
      byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
    }

    return {
      stats: {
        total: totalCount,
        published: publishedCount,
        drafts: Math.max(0, totalCount - publishedCount),
      },
      recent: (recent.data ?? []) as OverviewPost[],
      categories: [...byCategory.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  } catch (error) {
    console.error('Failed to load content overview:', error);
    return EMPTY;
  }
}

export default async function ContentOverviewPage() {
  const { stats, recent, categories } = await loadOverview();

  return <ContentOverviewClient stats={stats} recent={recent} categories={categories} />;
}
