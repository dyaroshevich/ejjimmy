import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data, error } = await supabase
      .from('proposal_snapshots')
      .select('id, lead_id, label, created_at, snapshot_data')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const snapshots = (data || []).map((s) => {
      const sd = s.snapshot_data as Record<string, any> | null;
      return {
        id: s.id,
        label: s.label,
        created_at: s.created_at,
        tier: sd?.selectedTier || null,
        total_cost: sd?.totalCost || null,
        system_kw: sd?.systemKw || null,
        pdf_url: sd?.pdf_url || null,
      };
    });

    return NextResponse.json({ snapshots });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await _req.json();
    const snapshotId = body.snapshotId;
    if (!snapshotId) {
      return NextResponse.json({ error: 'snapshotId required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('proposal_snapshots')
      .delete()
      .eq('id', snapshotId)
      .eq('lead_id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
