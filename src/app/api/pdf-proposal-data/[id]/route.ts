import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { buildPDFData, DbLead } from '@/lib/pdf/build-data';
import { decodeId } from '@/lib/hashid';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const hash = params.id;
    const numericId = decodeId(hash);
    
    if (!numericId) {
      return NextResponse.json({ error: 'Invalid proposal ID' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const snapshotId = searchParams.get('snapshotId');

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', numericId)
      .single() as { data: DbLead | null; error: any };

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    let pdfData;
    let selectedSnapshot: any = null;

    if (snapshotId) {
      const { data: snapshot } = await supabase
        .from('proposal_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .eq('lead_id', numericId)
        .single();
      
      if (snapshot) {
        pdfData = snapshot.snapshot_data;
        selectedSnapshot = {
          id: snapshot.id,
          label: snapshot.label,
          date: snapshot.created_at,
          url: (snapshot.snapshot_data as any)?.pdf_url || null
        };
      }
    }

    if (!pdfData) {
      pdfData = await buildPDFData(lead);
    }

    const { data: snapshots } = await supabase
      .from('proposal_snapshots')
      .select('id, created_at, snapshot_data, label')
      .eq('lead_id', numericId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      pdfData,
      selectedSnapshot,
      existingUrl: lead.proposal_url && lead.proposal_url !== '__generating__' && lead.proposal_url.startsWith('http') ? lead.proposal_url : null,
      existingImages: lead.proposal_images || [],
      history: snapshots?.map(s => ({
        id: s.id,
        date: s.created_at,
        label: s.label,
        url: (s.snapshot_data as any).pdf_url,
        total_cost: (s.snapshot_data as any).totalCost,
        system_size: (s.snapshot_data as any).systemKw
      })) || []
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PDF-DATA] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
