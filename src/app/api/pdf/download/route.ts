import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';
import { decodeId } from '@/lib/hashid';

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = (() => {
  const hosts: string[] = ['storage.googleapis.com'];
  try {
    if (SUPABASE_URL) hosts.push(new URL(SUPABASE_URL).hostname);
  } catch {}
  return hosts;
})();

export async function GET(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { searchParams } = new URL(req.url);
    const leadIdParam = searchParams.get('leadId');
    const snapshotId = searchParams.get('snapshotId');
    const mode = searchParams.get('mode') || 'download';

    if (!leadIdParam) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    // Support both numeric and hashid
    let leadId: number | null = null;
    if (isNaN(Number(leadIdParam))) {
      leadId = decodeId(leadIdParam);
    } else {
      leadId = Number(leadIdParam);
    }
    if (!leadId) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }

    let pdfUrl: string | null = null;
    let fileName = 'Proposal';

    if (snapshotId) {
      const { data: snapshot } = await supabase
        .from('proposal_snapshots')
        .select('snapshot_data, lead_id')
        .eq('id', snapshotId)
        .eq('lead_id', leadId)
        .single();

      if (snapshot) {
        pdfUrl = (snapshot.snapshot_data as any)?.pdf_url || null;
      }
    } else {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('proposal_url, name')
        .eq('id', leadId)
        .single();

      if (error || !lead || !lead.proposal_url) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }
      pdfUrl = lead.proposal_url;
      fileName = lead.name || 'Proposal';
    }

    if (!pdfUrl) {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // SSRF protection: validate URL is from allowed Supabase storage
    try {
      const urlObj = new URL(pdfUrl);
      if (!ALLOWED_HOSTS.includes(urlObj.hostname)) {
        console.error(`[PDF Download] Blocked URL with unexpected host: ${urlObj.hostname}`);
        return NextResponse.json({ error: 'Invalid PDF URL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid PDF URL format' }, { status: 400 });
    }

    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 502 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const name = (fileName || 'Proposal').replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');

    const disposition = mode === 'view' ? 'inline' : `attachment; filename="TAWANPOWER_Proposal_${name}.pdf"`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PDF Download] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
