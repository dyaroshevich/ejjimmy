'use server';

import { submitLead as submitLeadCore } from '@/lib/lead-manager';
import type { LeadData } from '@/lib/lead-manager';

export async function submitLead(data: LeadData) {
  return await submitLeadCore(data);
}