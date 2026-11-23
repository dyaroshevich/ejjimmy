import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { nanoid } from 'nanoid';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { leadId, pdfUrl, totalCost, systemSize, snapshotId } = await req.json();

    if (!leadId || !pdfUrl) {
      return NextResponse.json({ error: 'Missing leadId or pdfUrl' }, { status: 400 });
    }

    const shortCode = nanoid(8);

    const { data: link, error } = await supabase
      .from('proposal_links')
      .insert({
        lead_id: leadId,
        snapshot_id: snapshotId || null,
        short_code: shortCode,
        pdf_url: pdfUrl,
        total_cost: totalCost || null,
        system_size: systemSize || null
      })
      .select('short_code')
      .single();

    if (error) throw error;

    const origin = new URL(req.url).origin;
    return NextResponse.json({ 
      shortCode: link.short_code,
      fullUrl: `${origin}/v/${link.short_code}`
    });
  } catch (error: any) {
    console.error('[ShortLink] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
