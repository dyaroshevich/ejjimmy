import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { buildPDFData, DbLead } from '@/lib/pdf/build-data';
import { renderProposalHtml } from '@/lib/proposal-html';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { decodeId } from '@/lib/hashid';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Support both numeric and hashid
    let leadId: number | null = null;
    if (isNaN(Number(params.id))) {
      leadId = decodeId(params.id);
    } else {
      leadId = Number(params.id);
    }
    if (!leadId) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single() as { data: DbLead | null; error: any };

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const pdfData = await buildPDFData(lead);
    const html = await renderProposalHtml(pdfData);

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PDF-HTML] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
