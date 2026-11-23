import { createScopedClient as createClient } from '@/lib/supabase-server';
import { LeadSchema } from '@/lib/validations/lead';
import { chatStartRatelimit, createRateLimitResponse } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // --- Sprint H: Rate Limiting ---
    const ip = clientIp(req.headers);
    
    const { success, remaining, reset } = await chatStartRatelimit.limit(ip);
    
    if (!success) {
      return new Response(JSON.stringify(createRateLimitResponse(3, '10 minutes', remaining, reset)), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.json();
    
    // Validate request body with Zod
    const validation = LeadSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed', 
        details: validation.error.format() 
      }), { 
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { message, name, phone, line_id, access_token, source: bodySource } = validation.data;

    // The 'message' field is required for chat start notification but optional in general lead schema
    // So we check it explicitly if it's not present in the validated data (it's in rawBody)
    const chatMessage = rawBody.message || '';

    let verifiedLineId = line_id;

    // --- Sprint 0: Strict Token Verification ---
    if (access_token) {
      try {
        const verifyRes = await fetch(`https://api.line.me/oauth2/v2.1/verify?access_token=${access_token}`);
        if (!verifyRes.ok) {
          const errorText = await verifyRes.text();
          console.error('[chat-start] LINE Token verification failed:', errorText);
          return new Response(JSON.stringify({ error: 'Invalid LINE token' }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const verifyData = await verifyRes.json();
        if (!verifyData.sub) {
          return new Response(JSON.stringify({ error: 'Verification payload missing subject' }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        verifiedLineId = verifyData.sub;
        console.log('[chat-start] Token strictly verified for user:', verifiedLineId);
      } catch (err) {
        console.error('[chat-start] LINE Verify API error:', err);
        return new Response(JSON.stringify({ error: 'Verification service unavailable' }), { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const firstMessage = chatMessage.slice(0, 200);
    const source = access_token ? 'line_login' : (bodySource || 'chat');
    const sessionId = crypto.randomUUID();

    const { submitLead } = await import('@/lib/lead-manager');
    const { success: leadSuccess, lead, error: leadError } = await submitLead({
      name: name,
      phone: phone,
      line_id: verifiedLineId,
      source,
      status: 'New (Chat)',
      notes: firstMessage || 'User started chat',
      chat_history: firstMessage ? [{ session_id: sessionId, message: firstMessage, time: new Date().toISOString() }] : [],
    });

    if (leadError) {
      console.error('[chat-start] Lead handling error:', leadError);
    }

    // 5. Build Response with HttpOnly Cookie (Sprint 1)
    const response = new Response(JSON.stringify({ success: true, session_id: sessionId, leadId: lead?.id }), {
      headers: { 'Content-Type': 'application/json' }
    });

    if (verifiedLineId) {
      // Set HttpOnly cookie for secure session tracking
      response.headers.append('Set-Cookie', `line_session=${verifiedLineId}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`); // 7 days
    }

    return response;
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}