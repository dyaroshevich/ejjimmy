import { NextRequest, NextResponse } from 'next/server';
import { submitLead } from '@/lib/lead-manager';
import type { LeadData } from '@/lib/lead-manager';

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();
    const result = await submitLead(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API/leads/submit] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}