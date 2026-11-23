import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse, NextRequest } from 'next/server';
import { adminAiRatelimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sanitize = (key: string | undefined) =>
  key?.replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '').trim();

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Rate Limiting
    const ip = clientIp(request.headers);
    const { success } = await adminAiRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { template, topic, tone, context, provider: requestedProvider } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Please provide a topic' }, { status: 400 });
    }

    // 2. Setup AI Provider
    const groqKey = sanitize(process.env.GROQ_API_KEY);
    const googleKey = sanitize(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const googleProvider = createGoogleGenerativeAI({ apiKey: googleKey });
    const groqProvider = createGroq({ apiKey: groqKey });

    const model = requestedProvider === 'groq' 
      ? groqProvider('llama-3.3-70b-versatile') 
      : googleProvider('gemini-2.0-flash');

    const systemPrompt = `You are a high-performance content creator for "ทีมงาน Tawan Power กระบี่ (Tawan Power)", the leading solar installer in Krabi, Thailand. 
    You create engaging, educational, and conversion-focused content on the topic of solar energy.
    Output language: Thai (primarily) or English if requested. 
    Use the requested tone: ${tone}. 
    Follow the specific template format: ${template}.`;

    const userPrompt = `TOPIC: ${topic}\nADDITIONAL CONTEXT: ${context}\n\nGOAL: Generate a high-quality ${template} content piece in Thai. Include a catchy headline, structured body, and a clear call to action (CTA).`;

    // 3. Generate Content with Retry Logic
    let attempts = 0;
    const maxAttempts = 2;
    let resultText = '';

    while (attempts < maxAttempts) {
      try {
        const { text } = await generateText({
          model: model,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.7,
        });

        // 4. Response Validation
        if (text && text.length > 100 && !text.includes("I'm sorry") && !text.includes("error processing")) {
          resultText = text;
          break;
        }
        console.warn(`[AI Content] Attempt ${attempts + 1} produced weak output, retrying...`);
      } catch (err) {
        console.error(`[AI Content] Attempt ${attempts + 1} failed:`, err);
      }
      attempts++;
    }

    if (!resultText) {
      return NextResponse.json({ error: 'AI failed to generate content' }, { status: 502 });
    }

    return NextResponse.json({ content: resultText });
  } catch (error: any) {
    console.error('Content Generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
