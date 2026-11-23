import { streamText, convertToCoreMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, sanitizeHeaderValue as sanitize } from '@/lib/supabase';
import { chatRatelimit, createRateLimitResponse } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { citationsFrom, formatCitations } from '@/lib/rag-citations';
import { SYSTEM_PROMPTS, BASE_SYSTEM_PROMPT } from '@/lib/ai-prompts';
import { normalizeLocale, detectMessageLocale, isStrongSwitch, type ChatLang } from '@/lib/chat-locale';
import { createScopedClient } from '@/lib/supabase-server';
import { getSite } from '@/lib/site-server';

export const maxDuration = 30;

async function getSystemConfig() {
  // Scoped, not raw: the model choice is per storefront now, and `.eq('key', 'ai_model').single()` on an
  // unscoped service-role client would find one row per company and fail.
  const supabase = createScopedClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
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

// The apology text names this storefront's phone and LINE id, so it is built per request: as a module
// constant it carried the flagship's number to every franchisee's customers.
const fallbackText = () => {
  const { contact } = getSite();
  return `ขออภัยครับ AI กำลังประมวลผล ลองใหม่อีกครั้งนะครับ 🙏

หรือติดต่อทีมงานได้เลยครับ:
📞 โทร: ${contact.phone}
💬 LINE: ${contact.lineId}`;
};



const DEFAULT_QUICK_REPLIES = [
  { label: '📋 ขอใบเสนอราคา', query: 'ขอใบเสนอราคาครับ' },
  { label: '⚡ คำนวณค่าไฟ', query: 'คำนวณค่าไฟ' },
  { label: '📦 ดูแคตตาล็อก', query: 'ขอดูสินค้า' },
  { label: '📞 ติดต่อทีมงาน', query: 'ติดต่อเจ้าหน้าที่' }
];

async function firePdfGen(baseUrl: string, leadId: number, userId?: string) {
  const res = await fetch(`${baseUrl}/api/pdf/proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId, force: true, userId })
  });
  const data = await res.json();
  console.log(`[PDF] LINE auto-gen result: ${data.status}${data.url ? ' ' + data.url : ''}`);
}

export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    // --- Rate limiting (this route calls the embedding API on every message) ---
    const ip = clientIp(req.headers);
    const { success: rlOk, remaining, reset } = await chatRatelimit.limit(ip);
    if (!rlOk) {
      return new Response(JSON.stringify(createRateLimitResponse(5, '60 seconds', remaining, reset)), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, userId, locale: bodyUiLocale } = await req.json();

    // --- Reply locale: sticky per dialog, mirrors /api/chat ---
    const cookieLocale = (req.headers.get('cookie') || '').match(/NEXT_LOCALE=([^;]+)/)?.[1];
    const uiLocale: ChatLang = normalizeLocale(bodyUiLocale) || normalizeLocale(cookieLocale) || 'th';
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const lastAssistant = messages.filter((m: any) => m.role === 'assistant').pop();
    const conversationLang: ChatLang =
      (lastAssistant ? detectMessageLocale(lastAssistant.content, uiLocale) : uiLocale);
    const detected = detectMessageLocale(String(lastUserMessage?.content || ''), conversationLang);
    const replyLocale: ChatLang = isStrongSwitch(String(lastUserMessage?.content || ''), detected, conversationLang)
      ? detected
      : conversationLang;
    const SYSTEM_PROMPT = SYSTEM_PROMPTS[replyLocale] || BASE_SYSTEM_PROMPT;

    // --- Lead Proposal Context ---
    let proposalContext = '';
    if (userId) {
      try {
        const supabaseClient = createScopedClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: existingLead } = await supabaseClient
          .from('leads')
          .select('id, proposal_url')
          .eq('line_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (existingLead?.proposal_url && existingLead.proposal_url !== '__generating__') {
          proposalContext = `CUSTOMER PROPOSAL: This customer already has a PDF proposal at: ${existingLead.proposal_url}. Inform them it's ready and share the link.`;
        } else {
          proposalContext = `CUSTOMER PROPOSAL: No PDF proposal exists. When you have both bill and power, add [ACTION:GENERATE_PDF] at the end of your response.`;
        }
      } catch (err) {
        console.error('[AI/REPLY] Proposal fetch:', err);
      }
    }
    // --- RAG Context (hybrid search: vector + keyword) ---
    let ragContext = '';
    try {
      const lastUserMessage = messages
        .filter((m: any) => m.role === 'user')
        .pop();
      if (lastUserMessage?.content) {
        const ragSupabase = createScopedClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ragGenAI = new GoogleGenerativeAI(sanitize(process.env.GOOGLE_GENERATIVE_AI_API_KEY));
        const ragModel = ragGenAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const embedResult = await ragModel.embedContent(lastUserMessage.content);
        const embedding = embedResult.embedding.values;
        const { data: searchResults, error: searchError } = await ragSupabase
          .rpc('hybrid_search', {
            query_text: lastUserMessage.content,
            query_embedding: `[${embedding.join(',')}]`,
            match_threshold: 0.4,
            match_count: 8,
            vector_weight: 0.7,
            keyword_weight: 0.3
          });
        if (!searchError && searchResults && searchResults.length > 0) {
          // Same trail as /api/chat: which rows this reply was built from.
          console.log(`[RAG] reply citations: ${formatCitations(citationsFrom(searchResults))}`);
          const contextParts = searchResults.map((r: any) =>
            `[${r.metadata?.title || 'knowledge'}] ${r.content}`
          );
          ragContext = `\n\nRAG CONTEXT (reference only, mostly Thai — translate the facts into the reply language, never copy the Thai wording):\n${contextParts.join('\n---\n')}\n`;
        }
      }
    } catch (err) {
      console.error('[AI/REPLY] RAG fetch:', err);
    }

    // Hard language lock last: Thai RAG chunks otherwise drag the model back to Thai.
    const LANG_NAMES: Record<string, string> = {
      th: 'Thai', en: 'English', zh: 'Chinese', ru: 'Russian', de: 'German',
      fr: 'French', ja: 'Japanese', ko: 'Korean', uk: 'Ukrainian',
    };
    const langLock = `\n\nREPLY LANGUAGE (HARD RULE): write the entire answer in ${LANG_NAMES[replyLocale] || 'Thai'}. Ignore the language of the reference chunks above — they are source material, not the reply.`;
    const basePrompt = `${SYSTEM_PROMPT}${langLock}`;
    const systemWithProposal = ragContext + (proposalContext ? `${basePrompt}\n\n${proposalContext}` : basePrompt);

    // Get System Config (Dynamic)
    const { model: activeModelKey, temperature } = await getSystemConfig();

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
    });

    const modelMap: Record<string, any> = {
      'groq': groqProvider('openai/gpt-oss-120b'),
      'gemini': googleProvider('gemini-2.5-flash'),
      'openai': openrouterProvider('meta-llama/llama-3.3-70b-instruct:free'),
      'zai': zaiProvider('glm-4.7-flash')
    };

    const allProviders = [
      { key: 'groq', name: 'Groq', model: modelMap['groq'] },
      { key: 'openai', name: 'OpenRouter', model: modelMap['openai'] },
      { key: 'gemini', name: 'Google', model: modelMap['gemini'] },
      { key: 'zai', name: 'Z.AI', model: modelMap['zai'] }
    ];

    const sortedProviders = [
      ...allProviders.filter(p => p.key === activeModelKey),
      ...allProviders.filter(p => p.key !== activeModelKey)
    ].filter(p => !!p.model);

    const coreMessages = convertToCoreMessages(messages);

    for (const provider of sortedProviders) {
      try {
        console.log(`[AI/REPLY] Attempting with ${provider.name} (Priority: ${provider.key === activeModelKey})...`);

        let fullText = '';
        const result = await streamText({
          model: provider.model,
          messages: coreMessages,
          system: systemWithProposal,
          temperature: temperature,
        });

        const reader = result.fullStream.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.type === 'text-delta') {
            fullText += value.textDelta;
          }
        }

        if (fullText.trim()) {
          console.log(`[AI/REPLY] Success with ${provider.name}`);
          
          // --- Lead Enrichment Logic ---
          const { extractAndEnrichLead } = await import('@/lib/lead-enrichment');
          const enrichedText = await extractAndEnrichLead(fullText.trim(), undefined, userId);

          // --- Sprint A.3: Dynamic Quick Replies (Suggestions) ---
          const suggestRegex = /\[SUGGEST:([\s\S]*?)\]/g;
          let quickReplies: any[] = [];
          let m;
          while ((m = suggestRegex.exec(enrichedText)) !== null) {
            const [label, query] = m[1].split('|').map(s => s.trim());
            if (label && query) {
              quickReplies.push({
                type: 'action',
                action: {
                  type: 'message',
                  label: label.slice(0, 20),
                  text: query
                }
              });
            }
          }

          // Fallback to defaults if AI didn't provide any suggestions
          if (quickReplies.length === 0) {
            console.log('[AI/REPLY] No suggestions found, using defaults.');
            quickReplies = DEFAULT_QUICK_REPLIES.map(s => ({
              type: 'action',
              action: {
                type: 'message',
                label: s.label.slice(0, 20),
                text: s.query
              }
            }));
          }

          // Auto-generate PDF if AI requested it (fire-and-forget)
          if (enrichedText.includes('[ACTION:GENERATE_PDF]') && userId) {
            try {
              const supabaseClient = createScopedClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
              const { data: lead } = await supabaseClient
                .from('leads')
                .select('id')
                .eq('line_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              if (lead?.id) {
                const baseUrl = process.env.VERCEL_URL
                  ? `https://${process.env.VERCEL_URL}`
                  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                firePdfGen(baseUrl, lead.id, userId).catch(err => console.error('[PDF] Background gen failed:', err));
                // Log to lead notes (non-blocking)
                const ts = new Date().toLocaleString('th-TH');
                const { data: curLead } = await supabaseClient.from('leads').select('notes').eq('id', lead.id).single();
                await supabaseClient.from('leads').update({
                  notes: (curLead?.notes || '') + `\n[${ts}] AI Auto: สร้าง PDF ใบเสนอราคาอัตโนมัติ`
                }).eq('id', lead.id);
              }
            } catch (err) {
              console.error('[PDF] Trigger failed:', err);
            }
          }

          // Clean final text from all suggestion and action tags
          const finalText = enrichedText.replace(suggestRegex, '').replace(/\[ACTION:GENERATE_PDF\]/g, '').trim();

          return new Response(
            JSON.stringify({ 
              text: finalText,
              quickReply: quickReplies.length > 0 ? { items: quickReplies.slice(0, 13) } : undefined 
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (err: any) {
        console.warn(`[AI/REPLY] ${provider.name} failed:`, err.message);
      }
    }

    console.error('[AI/REPLY] All providers failed');
    return new Response(
      JSON.stringify({ text: fallbackText(), fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[AI/REPLY] Error:', error.message);
    return new Response(
      JSON.stringify({ text: fallbackText(), error: error.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
