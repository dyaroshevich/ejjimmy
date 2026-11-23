import { NextRequest, NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { buildPDFData } from '@/lib/pdf/build-data';
import { renderProposalHtml } from '@/lib/proposal-html';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { decodeId } from '@/lib/hashid';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const pdfData = await buildPDFData(lead, { overrideTier: tier });
    const html = await renderProposalHtml(pdfData);

    const wrapped = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; flex-direction: column; align-items: center; background: #f8fafc; padding: 8px; }
    .proposal-page { transform-origin: top center; transform: scale(0.4); margin-bottom: -126mm; }
    @media (min-width: 768px) {
      .proposal-page { transform: scale(0.55); margin-bottom: -94mm; }
    }
  </style>
</head>
<body>${html}</body>
</html>`;

    return new NextResponse(wrapped, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
