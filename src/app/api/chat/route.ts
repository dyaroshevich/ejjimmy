import { streamText, convertToCoreMessages, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizePII } from '@/lib/sanitize';
import { normalizeLocale, detectMessageLocale, isStrongSwitch, stripTags, type ChatLang } from '@/lib/chat-locale';
import { chatRatelimit, createRateLimitResponse } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { citationsFrom, formatCitations, type Citation } from '@/lib/rag-citations';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, sanitizeHeaderValue as sanitize } from '@/lib/supabase';
import { SYSTEM_PROMPTS, BASE_SYSTEM_PROMPT, EXTRACTION_INSTRUCTIONS } from '@/lib/ai-prompts';
import { createScopedClient } from '@/lib/supabase-server';

export const runtime = 'edge';
export const maxDuration = 30;



function createClientEdge() {
  // Scoped, not raw: the service key bypasses RLS, so `hybrid_search()` and every `.eq()` in this route
  // would otherwise read the flagship's rows — knowledge, leads and all. The storefront rides along as
  // a header for the two RAG functions, which read it through `current_site()`.
  return createScopedClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { fetch: fetch as any },
  });
}

type RagContext = { text: string; citations: Citation[] };
const NO_CONTEXT: RagContext = { text: '', citations: [] };

async function getContext(query: string): Promise<RagContext> {
  try {
    const googleKey = sanitize(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    if (!googleKey) return NO_CONTEXT;

    // 1. Generate embedding for query
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(query);
    let embedding = result.embedding.values;

    // Truncate to 768 if needed
    if (embedding.length > 768) {
      embedding = embedding.slice(0, 768);
    }

    // 2. Hybrid search (vector + keyword), then rerank to top-4
    const supabase = createClientEdge();
    let matches: any[] = [];
    try {
      const { data, error } = await supabase.rpc('hybrid_search', {
        query_text: query,
        query_embedding: embedding,
        match_threshold: 0.35,
        match_count: 12,
      });
      if (error) throw error;
      matches = data || [];
    } catch (hybridErr) {
      console.error('[RAG] Hybrid search failed, falling back to vector:', hybridErr);
      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 4,
      });
      if (error || !data) {
        console.error('[RAG] Search error:', error);
        return NO_CONTEXT;
      }
      matches = data;
    }

    if (matches.length === 0) return NO_CONTEXT;
    if (matches.length <= 4) {
      return { text: matches.map((m: any) => m.content).join('\n\n'), citations: citationsFrom(matches) };
    }

    // 3. Rerank top candidates with a cheap model, fall back to similarity order
    try {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      const rerankModel = createGoogleGenerativeAI({ apiKey: googleKey })('gemini-2.5-flash');
      const listing = matches
        .map((m: any, i: number) => `[${i}] ${String(m.content).slice(0, 600)}`)
        .join('\n---\n');
      const { text } = await generateText({
        model: rerankModel,
        prompt:
          `Query: ${query}\n\nRank these ${matches.length} passages by relevance to the query. ` +
          `Reply with ONLY a JSON array of the 4 best indices, e.g. [0, 3, 7, 11].\n\n${listing}`,
      });
      const idx = JSON.parse(text.trim().replace(/^```json|```$/g, '').trim());
      if (Array.isArray(idx) && idx.length > 0) {
        const picked = idx
          .filter((i: any) => Number.isInteger(i) && i >= 0 && i < matches.length)
          .slice(0, 4)
          .map((i: number) => matches[i]);
        if (picked.length > 0) {
          return { text: picked.map((m: any) => m.content).join('\n\n'), citations: citationsFrom(picked) };
        }
      }
    } catch (rerankErr) {
      console.error('[RAG] Rerank failed, using similarity order:', rerankErr);
    }

    // 4. Format context
    const top = matches.slice(0, 4);
    return { text: top.map((m: any) => m.content).join('\n\n'), citations: citationsFrom(top) };
  } catch (err) {
    console.error('[RAG] Unexpected error:', err);
    return NO_CONTEXT;
  }
}

async function logChatSession(
  sessionId: string,
  model: string,
  durationMs: number,
  msgCount: number,
  citations: Citation[] = [],
) {
  try {
    const supabase = createClientEdge();
    // Which knowledge rows fed this answer. Without them "why did it say ฿120 000" has no answer that
    // is not a guess, because the four chunks reached the model as one anonymous string.
    await supabase.from('line_actions_log').insert({
      user_id: sessionId,
      action: 'chat_session',
      metadata: {
        model,
        duration_ms: durationMs,
        messages_count: msgCount,
        rag: formatCitations(citations),
        rag_ids: citations.map((c) => c.id),
      },
    });
  } catch { /* non-blocking */ }
}

async function logChatError(sessionId: string, error: any) {
  try {
    const supabase = createClientEdge();
    await supabase.from('api_errors_log').insert({
      endpoint: '/api/chat',
      error_message: sanitizePII(error.message),
      error_code: '500',
      metadata: { session_id: sessionId, stack: sanitizePII(error.stack || '') },
    });
  } catch { /* non-blocking */ }
}

async function getSystemConfig() {
  try {
    const supabase = createClientEdge();
    const { data: modelData } = await supabase.from('system_config').select('value').eq('key', 'ai_model').single();
    const { data: tempData } = await supabase.from('system_config').select('value').eq('key', 'ai_temperature').single();
    
    let model = 'gemini';
    if (modelData?.value) {
      try { model = JSON.parse(modelData.value); } catch { model = modelData.value; }
    }
    
    let temp = 0.7;
    if (tempData?.value) {
      try { temp = parseFloat(JSON.parse(tempData.value)); } catch { temp = parseFloat(tempData.value) || 0.7; }
    }

    return { model, temperature: temp };
  } catch (err) {
    console.error('[Config] Failed to fetch system config:', err);
    return { model: 'gemini', temperature: 0.7 };
  }
}

export async function POST(req: Request) {
  const sessionId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // --- Sprint H: Rate Limiting ---
    const ip = clientIp(req.headers);
    
    const { success, remaining, reset } = await chatRatelimit.limit(ip);
    
    if (!success) {
      return new Response(JSON.stringify(createRateLimitResponse(5, '60 seconds', remaining, reset)), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get System Config (Dynamic)
    const { model: activeModelKey, temperature } = await getSystemConfig();

    // Get LINE session from cookie if available
    const cookieHeader = req.headers.get('cookie') || '';
    const lineIdMatch = cookieHeader.match(/line_session=([^;]+)/);
    const lineId = lineIdMatch ? lineIdMatch[1] : undefined;

    const { messages, locale: bodyLocale, uiLocale: bodyUiLocale } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // --- Locale: explicit UI locale wins, mirror strong user signals (sticky per dialog) ---
    const cookieLocale = (cookieHeader.match(/NEXT_LOCALE=([^;]+)/) || [])[1];
    const uiLocale: ChatLang =
      normalizeLocale(bodyUiLocale) || normalizeLocale(bodyLocale) || normalizeLocale(cookieLocale) || 'th';
    const lastAssistant = [...messages].reverse().find(
      (m) => m?.role === 'assistant' && typeof m?.content === 'string' && stripTags(m.content).trim().length > 0
    );
    const conversationLang: ChatLang =
      normalizeLocale(bodyLocale) || (lastAssistant ? detectMessageLocale(lastAssistant.content, uiLocale) : uiLocale);
    const detected = detectMessageLocale(String(lastUserMessage || ''), conversationLang);
    const replyLocale = isStrongSwitch(String(lastUserMessage || ''), detected, conversationLang)
      ? detected
      : conversationLang;
    const systemPrompt = SYSTEM_PROMPTS[replyLocale] || BASE_SYSTEM_PROMPT;
    const replyHeader = `REPLY LANGUAGE: The site UI language is "${uiLocale}". The user is writing in "${replyLocale}". Reply ENTIRELY in "${replyLocale}" (keep [SUGGEST:]/[AI_LEAD:]/[PRODUCT_ID:]/[ACTION:] tags exactly as specified). If the user switches language mid-conversation, follow their latest message.`;

    // --- Lead Proposal Context ---
    let proposalContext = '';
    if (lineId) {
      try {
        const supabaseEdge = createClientEdge();
        const { data: existingLead } = await supabaseEdge
          .from('leads')
          .select('id, proposal_url')
          .eq('line_id', lineId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (existingLead?.proposal_url && existingLead.proposal_url !== '__generating__') {
          proposalContext = `CUSTOMER PROPOSAL: This customer already has a PDF proposal at: ${existingLead.proposal_url}. Inform them it's ready and share the link.`;
        } else {
          proposalContext = `CUSTOMER PROPOSAL: No PDF proposal exists. When you have both bill and power, add [ACTION:GENERATE_PDF] at the end of your response.`;
        }
      } catch (err) {
        console.error('[AI] Proposal fetch:', err);
      }
    }

    // --- Sprint A: RAG Context Retrieval ---
    const rag = lastUserMessage ? await getContext(lastUserMessage) : NO_CONTEXT;
    const parts = [replyHeader, systemPrompt];
    if (rag.text) parts.push(`RELEVANT KNOWLEDGE BASE CONTEXT:\n${rag.text}`);
    if (proposalContext) parts.push(proposalContext);
    const dynamicPrompt = parts.join('\n\n');

    const groqKey = sanitize(process.env.GROQ_API_KEY);
    const googleKey = sanitize(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const orKey = sanitize(process.env.OPENAI_API_KEY);
    const zaiKey = sanitize(process.env.ZAI_API_KEY);

    const googleProvider = createGoogleGenerativeAI({ apiKey: googleKey });
    const groqProvider = createGroq({ apiKey: groqKey });
    const openrouterProvider = createOpenAI({
      apiKey: orKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    const zaiProvider = createOpenAI({
      apiKey: zaiKey,
      baseURL: 'https://api.z.ai/api/paas/v4',
      fetch: async (url, options) => {
        if (options?.body) {
          const parsed = JSON.parse(options.body as string);
          parsed.thinking = { type: 'disabled' };
          return fetch(url, { ...options, body: JSON.stringify(parsed) });
        }
        return fetch(url, options);
      },
    });

    // Map keys to actual model objects
    const modelMap: Record<string, any> = {
      'groq': groqProvider('openai/gpt-oss-120b'),
      'gemini': googleProvider('gemini-2.5-flash'),
      'openai': openrouterProvider('openai/gpt-oss-120b:free'),
      'zai': zaiProvider('glm-4.5-flash')
    };

    // Sort providers so the active one is first, but keep others as fallbacks
    const allProviders = [
      { key: 'groq', name: 'Groq', model: modelMap['groq'] },
      { key: 'gemini', name: 'Google', model: modelMap['gemini'] },
      { key: 'openai', name: 'OpenRouter', model: modelMap['openai'] },
      { key: 'zai', name: 'Z.AI', model: modelMap['zai'] }
    ];

    const sortedProviders = [
      ...allProviders.filter(p => p.key === activeModelKey),
      ...allProviders.filter(p => p.key !== activeModelKey)
    ];

    const coreMessages = convertToCoreMessages(messages);

    for (const provider of sortedProviders) {
      try {
        console.log(`[AI] Attempting with ${provider.name} (Priority: ${provider.key === activeModelKey})...`);
        const result = await streamText({
          model: provider.model,
          messages: coreMessages,
          system: dynamicPrompt,
          temperature: temperature,
          maxTokens: 4096,
          onFinish: async ({ text }) => {
            const { extractAndEnrichLead } = await import('@/lib/lead-enrichment');
            await extractAndEnrichLead(text, sessionId, lineId);

            // Auto-generate PDF if AI requested it
            if (text.includes('[ACTION:GENERATE_PDF]') && lineId) {
              try {
                const supabaseEdge = createClientEdge();
                const { data: lead } = await supabaseEdge
                  .from('leads')
                  .select('id')
                  .eq('line_id', lineId)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();
                if (lead?.id) {
                  const baseUrl = process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                  const pdfRes = await fetch(`${baseUrl}/api/pdf/proposal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leadId: lead.id, force: true, userId: lineId })
                  });
                  const pdfData = await pdfRes.json();
                  console.log(`[PDF] Auto-gen result: ${pdfData.status}${pdfData.url ? ' ' + pdfData.url : ''}`);
                  // Log to lead notes
                  const ts = new Date().toLocaleString('th-TH');
                  const { data: curLead } = await supabaseEdge.from('leads').select('notes').eq('id', lead.id).single();
                  await supabaseEdge.from('leads').update({
                    notes: (curLead?.notes || '') + `\n[${ts}] AI Auto: สร้าง PDF ใบเสนอราคาอัตโนมัติ`
                  }).eq('id', lead.id);
                }
              } catch (err) {
                console.error('[PDF] Auto-gen failed:', err);
              }
            }
          }
        });

        const duration = Date.now() - startTime;
        logChatSession(sessionId, provider.key, duration, messages.length, rag.citations);

        return result.toAIStreamResponse();
      } catch (err: any) {
        console.warn(`[AI] ${provider.name} failed:`, err.message);
      }
    }

    return new Response(JSON.stringify({ error: 'All AI providers failed' }), { status: 503 });
  } catch (error: any) {
    console.error('[CHAT API] ERROR:', error.message);
    logChatError(sessionId, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
