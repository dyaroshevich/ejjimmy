import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRetry } from "../_shared/retry.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function chunkText(text: string, maxWords = 400, overlapWords = 80): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  if (words.length <= maxWords) {
    return [text];
  }
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
    start += maxWords - overlapWords;
  }
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
    });
  }

  try {
    const { record_id } = await req.json();
    if (!record_id) throw new Error('record_id required');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')!;
    if (!googleKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not set');

    const { GoogleGenerativeAI } = await import("https://esm.sh/@google/generative-ai");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

    const { data: parent, error: fetchError } = await supabase
      .from('knowledge')
      .select('id, content, metadata, total_chunks')
      .eq('id', record_id)
      .single();

    if (fetchError || !parent) throw new Error('Parent record not found');

    if (parent.total_chunks && parent.total_chunks > 1) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'already_chunked' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chunks = chunkText(parent.content, 400, 80);

    if (chunks.length <= 1) {
      const result = await withRetry(`embedding ${record_id}`, () => model.embedContent(parent.content));
      const embedding = result.embedding.values.slice(0, 768);
      const { error: updateError } = await supabase
        .from('knowledge')
        .update({ embedding, total_chunks: 1, chunk_index: 0, parent_id: null })
        .eq('id', record_id);
      if (updateError) throw updateError;
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'already_small' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase
      .from('knowledge')
      .update({ total_chunks: chunks.length, chunk_index: 0, parent_id: null })
      .eq('id', record_id);

    for (let i = 0; i < chunks.length; i++) {
      const result = await withRetry(`embedding ${record_id} chunk ${i}`, () => model.embedContent(chunks[i]));
      const embedding = result.embedding.values.slice(0, 768);
      const { error: insertError } = await supabase.from('knowledge').insert({
        parent_id: record_id,
        chunk_index: i,
        total_chunks: chunks.length,
        content: chunks[i],
        embedding,
        metadata: { ...(parent.metadata || {}), chunk_index: i, total_chunks: chunks.length, parent_id: record_id, is_chunk: true },
      });
      if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({
      success: true,
      chunks_created: chunks.length,
      parent_id: record_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
