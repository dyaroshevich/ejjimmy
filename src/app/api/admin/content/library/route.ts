import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    let query = supabase.from('content_media').select('*');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 1. Duplicate Check via MD5
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
    const { data: existingMedia } = await supabase
      .from('content_media')
      .select('id, name, file_path')
      .eq('file_hash', fileHash)
      .maybeSingle();

    if (existingMedia) {
      return NextResponse.json({ 
        success: true, 
        message: 'File already exists in library', 
        media: existingMedia,
        isDuplicate: true 
      });
    }

    // 2. Upload to Storage (bucket: content-media)
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('content-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-media')
      .getPublicUrl(uploadData.path);

    // 4. Save Metadata to DB
    const { data: mediaData, error: dbError } = await supabase
      .from('content_media')
      .insert({
        name: file.name,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        file_hash: fileHash,
        category: category,
        metadata: {
          lastModified: file.lastModified,
          storage_path: uploadData.path
        }
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, media: mediaData }, { status: 201 });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Get record to find storage path
    const { data: media } = await supabase
      .from('content_media')
      .select('metadata')
      .eq('id', id)
      .single();

    if (media?.metadata && (media.metadata as any).storage_path) {
      await supabase.storage
        .from('content-media')
        .remove([(media.metadata as any).storage_path]);
    }

    // 2. Delete from DB
    const { error } = await supabase.from('content_media').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
