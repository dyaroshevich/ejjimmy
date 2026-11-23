import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, sbBucket } from '@/lib/supabase';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function POST(req: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const leadId = formData.get('leadId') as string | null;
    const index = formData.get('index') as string | null;

    if (!image || !leadId || index === null) {
      return NextResponse.json({ error: 'Missing image, leadId, or index' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const fileName = `proposals/${leadId}/page-${index}.png`;

    const { error: uploadError } = await supabase.storage
      .from('proposals')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[Upload Image] Storage error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(sbBucket('proposals')).getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl || '';

    const { data: lead } = await supabase
      .from('leads')
      .select('proposal_images')
      .eq('id', leadId)
      .single();

    const existingImages: string[] = lead?.proposal_images || [];
    const pageIndex = parseInt(index, 10);

    existingImages[pageIndex] = publicUrl;

    await supabase
      .from('leads')
      .update({ proposal_images: existingImages })
      .eq('id', leadId);

    return NextResponse.json({ url: publicUrl, index: pageIndex });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Upload Image] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
