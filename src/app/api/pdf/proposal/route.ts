import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { PDFGenerator, PDFData } from '@/lib/pdf/generator';
import { BrowserlessGenerator } from '@/lib/pdf/browserless-generator';
import { buildPDFData, DbLead } from '@/lib/pdf/build-data';
import { renderProposalHtml } from '@/lib/proposal-html';
import { decodeId, encodeId } from '@/lib/hashid';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, sbBucket } from '@/lib/supabase';
import { isAdminAuthorized } from '@/lib/admin-auth';

const GENERATING = '__generating__';
const TTL_MS = 60_000;

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json();

    if (body.leadId) {
      let leadIdStr = body.leadId;
      let leadId: number | null = null;
      
      if (typeof leadIdStr === 'string' && isNaN(Number(leadIdStr))) {
        leadId = decodeId(leadIdStr);
      } else {
        leadId = Number(leadIdStr);
      }

      if (!leadId) {
        return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
      }

      const requestUserId = body.userId || null;
      const force = body.force === true;
      const label = body.label || `v${new Date().toISOString().slice(0, 10)}`;

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single() as { data: DbLead | null; error: any };

      if (leadError || !lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      if (requestUserId && lead.line_id && requestUserId !== lead.line_id) {
        console.warn(`[PDF] Auth mismatch: request ${requestUserId} !== lead ${lead.line_id}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Non-admin callers must prove ownership via matching LINE user id
      // (admin dashboard sessions bypass this check)
      if (!(await isAdminAuthorized())) {
        if (!requestUserId || !lead.line_id || requestUserId !== lead.line_id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      }

      if (lead.proposal_url && lead.proposal_url !== GENERATING) {
        if (!force) {
          console.log(`[PDF] Cache hit for lead ${leadId}`);
          return NextResponse.json({ 
            status: 'ready', 
            url: lead.proposal_url,
            images: lead.proposal_images || []
          });
        }
        console.log(`[PDF] Force regeneration for lead ${leadId}`);
      }

      if (lead.proposal_url === GENERATING) {
        const stale = Date.now() - new Date(lead.updated_at ?? lead.created_at ?? Date.now()).getTime() > TTL_MS;
        if (!stale) {
          console.log(`[PDF] Lead ${leadId} is already being generated`);
          return NextResponse.json({ status: 'generating' });
        }
        console.log(`[PDF] Lead ${leadId} lock is stale, resetting...`);
      }

      const offerFields: Record<string, any> = {};
      const fieldMap: Record<string, string> = {
        selected_product_id: 'selected_product_id',
        equipment_tier: 'equipment_tier',
        system_size: 'system_size',
        base_price: 'base_price',
        manpower: 'manpower',
        discount_percent: 'discount_percent',
        installation_days: 'installation_days',
        maintenance_visits: 'maintenance_visits',
        system_warranty: 'system_warranty',
        inverter_warranty: 'inverter_warranty',
        panel_warranty: 'panel_warranty',
        panel_product_warranty: 'panel_product_warranty',
        panel_performance_warranty: 'panel_performance_warranty',
      };
      for (const [key, col] of Object.entries(fieldMap)) {
        if (body[key] !== undefined) {
          offerFields[col] = body[key];
          (lead as any)[col] = body[key];
        }
      }

      // Atomic lock: claim the generation slot (any existing proposal_url state)
      const { data: locked, error: lockError } = await supabase
        .from('leads')
        .update({ proposal_url: GENERATING, ...offerFields })
        .eq('id', leadId)
        .select('id')
        .single();

      if (lockError || !locked) {
        console.log(`[PDF] Lead ${leadId} already being generated or locked`);
        return NextResponse.json({ status: 'generating' });
      }

      const pdfData = await buildPDFData(lead);
      const html = await renderProposalHtml(pdfData);

      let pdfBuffer = await BrowserlessGenerator.generateFromHtml(html);
      if (!pdfBuffer) {
        console.log(`[PDF] Browserless unavailable, trying PDFSpark for lead ${leadId}`);
        pdfBuffer = await PDFGenerator.generateProposal(html);
      }

      // PDFSpark unavailable — return fallback with interactive link
      if (!pdfBuffer) {
        console.log(`[PDF] PDFSpark unavailable, fallback for lead ${leadId}`);
        await supabase
          .from('leads')
          .update({ proposal_url: null })
          .eq('id', leadId);
        
        return NextResponse.json({
          status: 'fallback',
          message: 'PDF service temporarily unavailable',
          interactiveUrl: `/proposal/${encodeId(leadId)}`,
        });
      }

      const version = Date.now();
      const fileName = `TAWANPOWER_Proposal_${leadId}_v${version}.pdf`;
      const pdfBytes = new Uint8Array(pdfBuffer);
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      let uploadError: string | null = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const result = await supabase.storage
          .from('proposals')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true,
          });
        uploadError = result.error?.message || null;
        if (!uploadError) break;
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
      }

      if (uploadError) {
        await supabase.from('leads').update({ proposal_url: null }).eq('id', leadId);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from(sbBucket('proposals')).getPublicUrl(fileName);
      const publicUrl = urlData?.publicUrl || '';

      if (!publicUrl) {
        await supabase.from('leads').update({ proposal_url: null }).eq('id', leadId);
        return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 });
      }

      // Create snapshot AFTER PDF is confirmed uploaded
      const { data: snapshot, error: snapshotError } = await supabase
        .from('proposal_snapshots')
        .insert({
          lead_id: leadId,
          label: label,
          snapshot_data: { ...pdfData, pdf_url: publicUrl } as any,
        })
        .select('id')
        .single();

      if (snapshotError) {
        console.error('[PDF] Failed to save snapshot:', snapshotError);
      }

      await supabase
        .from('leads')
        .update({ proposal_url: publicUrl })
        .eq('id', leadId);

      console.log(`[PDF] Proposal ${leadId} ready`);

      return NextResponse.json({
        status: 'ready',
        url: publicUrl,
        snapshot_id: snapshot?.id || null,
      });
    }

    const data: PDFData = body;
    if (!data.customerName || !data.systemKw) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = await renderProposalHtml(data);
    const pdfBuffer = await PDFGenerator.generateProposal(html);

    if (!pdfBuffer) {
      return NextResponse.json({ error: 'PDF service temporarily unavailable' }, { status: 503 });
    }

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="TAWANPOWER_Proposal_${data.customerName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PDF] Generation error:', error);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      if (url && key) {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(url, key);
        const body = await req.clone().json().catch(() => ({}));
        if (body.leadId) {
          let leadId: number | null = null;
          if (typeof body.leadId === 'string' && isNaN(Number(body.leadId))) {
            const { decodeId: d } = await import('@/lib/hashid');
            leadId = d(body.leadId);
          } else {
            leadId = Number(body.leadId);
          }
          if (leadId) {
            await sb.from('leads').update({ proposal_url: null }).eq('id', leadId);
          }
        }
      }
    } catch { /* best effort */ }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'PDF Engine Active', mode: process.env.VERCEL ? 'Production' : 'Local' });
}
