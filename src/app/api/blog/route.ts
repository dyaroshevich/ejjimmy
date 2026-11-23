import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminAuthorized } from '@/lib/admin-auth';

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now()
  );
}

export async function GET(request: NextRequest) {
  if (!supabaseAdmin)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    if (slug) {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data)
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });

      return NextResponse.json({ data });
    }

    if (id) {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data)
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });

      return NextResponse.json({ data });
    }

    let query = supabaseAdmin.from('blog_posts').select('*', { count: 'exact' });

    if (status === 'published') {
      query = query.eq('published', true);
    } else if (status === 'draft') {
      query = query.eq('published', false);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order(sort, { ascending: order === 'asc' })
      .range(from, to);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, count, page, limit });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  try {
    const body = await request.json();

    if (!body.title || !body.content)
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );

    const now = new Date().toISOString();
    const slug = body.slug || generateSlug(body.title);

    const record = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || null,
      cover_image: body.cover_image || null,
      author: body.author || null,
      published: body.published || false,
      published_at:
        body.published && !body.published_at ? now : body.published_at || null,
      category: body.category || null,
      tags: body.tags || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      locale: body.locale || 'th',
      updated_at: now,
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(record)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  try {
    const body = await request.json();

    if (!body.id)
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const now = new Date().toISOString();

    const updates: Record<string, unknown> = { updated_at: now };

    const fields = [
      'title',
      'slug',
      'content',
      'excerpt',
      'cover_image',
      'author',
      'published',
      'published_at',
      'category',
      'tags',
      'meta_title',
      'meta_description',
      'locale',
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (body.published === true && !body.published_at) {
      const { data: existing } = await supabaseAdmin
        .from('blog_posts')
        .select('published, published_at')
        .eq('id', body.id)
        .single();

      if (existing && !existing.published_at) {
        updates.published_at = now;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    if (error || !data)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id)
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
