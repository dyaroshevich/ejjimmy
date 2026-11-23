import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Longer duration for indexing large docs

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // 1. Fetch the full content of the document
    const { data: doc, error: fetchError } = await supabaseAdmin
      .from('research_documents')
      .select('content, title')
      .eq('id', documentId)
      .single();

    if (fetchError || !doc || !doc.content) {
      return NextResponse.json({ error: 'Document content not found' }, { status: 404 });
    }

    // 2. Split into chunks
    const textChunks = chunkText(doc.content);
    
    // 3. Generate Embeddings
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: textChunks,
    });

    // 4. Save Chunks to DB
    const chunkData = textChunks.map((content, i) => ({
      document_id: documentId,
      content,
      embedding: `[${embeddings[i].join(',')}]`,
      metadata: { chunk_index: i, title: doc.title }
    }));

    // Delete existing chunks first to avoid duplicates on re-index
    await supabaseAdmin.from('research_document_chunks').delete().eq('document_id', documentId);

    const { error: insertError } = await supabaseAdmin
      .from('research_document_chunks')
      .insert(chunkData);

    if (insertError) throw insertError;

    // 5. Update document status
    await supabaseAdmin
      .from('research_documents')
      .update({ status: 'indexed' })
      .eq('id', documentId);

    return NextResponse.json({ 
      success: true, 
      chunksCount: textChunks.length 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Indexing error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
