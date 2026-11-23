import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText, embed } from 'ai';
import { NextResponse } from 'next/server';
import { adminAiRatelimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sanitize = (key: string | undefined) =>
  key?.replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '').trim();

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Rate Limiting
    const ip = clientIp(request.headers);
    const { success } = await adminAiRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { documentIds, task, customPrompt, provider: requestedProvider } = await request.json();

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: 'No documents specified' }, { status: 400 });
    }

    // 2. Setup AI Provider for analysis
    const groqKey = sanitize(process.env.GROQ_API_KEY);
    const googleKey = sanitize(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    const groqProvider = createGroq({ apiKey: groqKey });

    const model = requestedProvider === 'groq' 
      ? groqProvider('llama-3.3-70b-versatile') 
      : google('gemini-2.0-flash');

    // 3. RAG: Fetch relevant chunks or use preview
    let combinedContent = "";
    
    // Check if documents are indexed
    const { data: docs } = await supabaseAdmin
      .from('research_documents')
      .select('id, title, status, content_preview, content')
      .in('id', documentIds);

    const isAllIndexed = docs?.every(d => d.status === 'indexed');

    if (isAllIndexed) {
      console.log("[RAG] Using vector search for context");
      // Create embedding for the query (based on task)
      const queryText = task === 'custom' ? customPrompt : task;
      const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: queryText,
      });

      // Search across selected documents
      const { data: chunks, error: rpcError } = await supabaseAdmin.rpc('match_research_chunks', {
        query_embedding: `[${embedding.join(',')}]`,
        match_threshold: 0.5,
        match_count: 15, // Get more chunks for better context
        p_document_ids: documentIds
      });

      if (rpcError) throw rpcError;
      combinedContent = chunks?.map((c: any) => c.content).join("\n\n") || "";
    } else {
      console.log("[RAG] Falling back to content previews");
      combinedContent = docs?.map((d: any) => 
        `--- DOCUMENT: ${d.title} ---\n${d.content_preview || d.content?.substring(0, 5000) || ''}`
      ).join('\n\n') || "";
    }

    // 4. Define Prompts
    let systemPrompt = "You are a specialized solar energy market researcher and data analyst. Output quality is critical.";
    let userPrompt = "";

    if (task === 'summary') {
      userPrompt = `Please provide a concise but comprehensive summary of the following research materials. Focus on key findings, data points, and actionable insights related to the solar market in Thailand or Krabi specifically.\n\n${combinedContent}`;
    } else if (task === 'trends') {
      userPrompt = `Analyze the following documents to identify emerging trends in the solar industry. Look for changes in technology, pricing, consumer behavior, or government policy. Format as a list of trends with brief explanations.\n\n${combinedContent}`;
    } else if (task === 'competitors') {
      userPrompt = `Extract information about competitors mentioned in these documents. Identify their strengths, weaknesses, pricing strategies, and any specific areas where they are winning or losing. Format as a competitive analysis report.\n\n${combinedContent}`;
    } else if (task === 'custom') {
      userPrompt = `${customPrompt}\n\nCONTEXT FROM DOCUMENTS:\n${combinedContent}`;
    } else {
      return NextResponse.json({ error: 'Invalid task type' }, { status: 400 });
    }

    // 5. Generate Analysis with Retry Logic
    let attempts = 0;
    const maxAttempts = 2;
    let resultText = '';

    while (attempts < maxAttempts) {
      try {
        const { text } = await generateText({
          model: model,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.2,
        });

        if (text && text.length > 50 && !text.includes("I'm sorry") && !text.includes("error processing")) {
          resultText = text;
          break;
        }
      } catch (err) {
        console.error(`[AI] Attempt ${attempts + 1} failed:`, err);
      }
      attempts++;
    }

    if (!resultText) {
      return NextResponse.json({ error: 'AI failed to produce a valid analysis' }, { status: 502 });
    }

    return NextResponse.json({ analysis: resultText });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
