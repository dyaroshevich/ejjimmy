/**
 * API Route: /api/pdf/status
 * Check the generation status of a proposal in Supabase
 */

import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { decodeId } from '@/lib/hashid';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get('id');

  if (!rawId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  // Decode if it's a hashid
  let leadId: number | null = null;
  if (isNaN(Number(rawId))) {
    leadId = decodeId(rawId);
  } else {
    leadId = Number(rawId);
  }

  if (!leadId) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: lead, error } = await supabase
    .from('leads')
    .select('proposal_url, status')
    .eq('id', leadId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    status: lead.proposal_url === '__generating__' ? 'generating' : (lead.proposal_url ? 'ready' : 'pending'),
    url: lead.proposal_url && lead.proposal_url !== '__generating__' ? lead.proposal_url : null,
  });
}
