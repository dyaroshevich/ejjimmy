import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const runtime = 'edge';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert sales assistant for ทีมงาน Tawan Power กระบี่ (Tawan Power), a solar energy company in Krabi, Thailand.
Your task is to summarize a chat history between a customer and an AI assistant.

GOAL:
Provide a very concise summary in THAI (1-3 sentences) covering:
1. System size (kW) interest.
2. Location.
3. Key pain point or specific question (e.g., pricing, battery, financing).

If information is missing, focus on what IS there. Keep it professional and helpful for a human sales manager.`;

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthorized())) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { history } = await req.json();
    
    if (!history || !Array.isArray(history) || history.length === 0) {
      return new Response(JSON.stringify({ summary: 'ไม่มีประวัติการสนทนา' }), { status: 200 });
    }

    const chatContent = history.map((m: any) => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`).join('\n');

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      prompt: `CHAT HISTORY:\n${chatContent}`,
    });

    return new Response(JSON.stringify({ summary: text.trim() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[SUMMARIZE ERROR]:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
