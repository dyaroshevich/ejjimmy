import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!(await isAdminAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Fast check for key presence
    const status = {
      groq: !!groqKey ? 'ok' : 'error',
      gemini: !!googleKey ? 'ok' : 'error',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(status), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store' 
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error' }), { status: 500 });
  }
}
