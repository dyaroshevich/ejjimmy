import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { getLineProfile } from './line-handlers';
import { LeadSchema } from './validations/lead';
import { z } from 'zod';
import { sanitizePII } from './sanitize';

// Helper to get client (prefers admin)
const getClient = () => supabaseAdmin || supabase;

export type LeadData = z.input<typeof LeadSchema> & {
  survey_date?: string;
};

export interface LeadResult {
  success: boolean;
  lead?: any;
  /** true when createNewLead inserted a fresh row (update/enrich is false) */
  isNew?: boolean;
  error?: string;
}

const DEFAULT_STATUS = 'New (Web)';
const DEFAULT_SOURCE = 'web';

async function notifyAdminNewLead(lead: any): Promise<void> {
  try {
    const response = await fetch('/api/notify-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_lead',
        leadId: lead.id,
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          line_id: lead.line_id,
          location: lead.location,
          system_size: lead.system_size,
          source: lead.source
        }
      })
    });

    if (!response.ok) {
      console.warn('[LeadManager] Admin notification failed:', response.status);
    }
  } catch (error) {
    console.error('[LeadManager] Admin notification error:', error);
  }
}

export async function submitLead(data: LeadData): Promise<LeadResult> {
  const client = getClient();
  try {
    // 0. Validate and Sanitize
    const cleanData = LeadSchema.parse(data);

    // 1. Phone Normalization (Thai Format: 10 digits)
    if (cleanData.phone) {
      const phoneDigits = cleanData.phone.replace(/[^0-9]/g, '');
      if (phoneDigits.length === 10 && /^(06|08|09)/.test(phoneDigits)) {
        cleanData.phone = phoneDigits;
      } else if (phoneDigits.length > 0) {
        cleanData.phone = phoneDigits;
      }
    }

    // 2. Name Resolution for LINE users
    if (cleanData.line_id && (!cleanData.name || cleanData.name === 'ลูกค้าใหม่')) {
      const profile = await getLineProfile(cleanData.line_id);
      if (profile?.displayName) {
        cleanData.name = profile.displayName;
      } else if (!cleanData.name) {
        const shortId = cleanData.line_id.slice(-4).toUpperCase();
        cleanData.name = `LINE User ${shortId}`;
      }
    }

    const email = data.email?.trim() || null;

    // 3. Find Existing Lead (Prioritized Deduplication)
    let existingLead: any = null;

    // Priority 1: LINE ID
    if (cleanData.line_id) {
      const { data: byLine } = await client.from('leads').select('*').eq('line_id', cleanData.line_id).order('created_at', { ascending: false }).limit(1);
      if (byLine?.[0]) existingLead = byLine[0];
    }

    // Priority 2: Phone
    if (!existingLead && cleanData.phone) {
      const { data: byPhone } = await client.from('leads').select('*').eq('phone', cleanData.phone).order('created_at', { ascending: false }).limit(1);
      if (byPhone?.[0]) existingLead = byPhone[0];
    }

    // Priority 3: Email
    if (!existingLead && email) {
      const { data: byEmail } = await client.from('leads').select('*').eq('email', email).order('created_at', { ascending: false }).limit(1);
      if (byEmail?.[0]) existingLead = byEmail[0];
    }

    // Priority 4: Name (Exact match, last resort)
    if (!existingLead && cleanData.name && cleanData.name !== 'ลูกค้าใหม่' && !cleanData.name.includes('LINE User')) {
      const { data: byName } = await client.from('leads').select('*').eq('name', cleanData.name).order('created_at', { ascending: false }).limit(1);
      if (byName?.[0]) existingLead = byName[0];
    }

    if (existingLead) {
      // --- UPDATE / ENRICH MODE ---
      const updates: any = {
        updated_at: new Date().toISOString(),
        unread: true // Alert admin of new activity
      };

      // Non-destructive field updates
      if (cleanData.name && (existingLead.name === 'ลูกค้าใหม่' || existingLead.name.includes('LINE User'))) updates.name = cleanData.name;
      if (cleanData.phone && !existingLead.phone) updates.phone = cleanData.phone;
      if (email && !existingLead.email) updates.email = email;
      if (cleanData.line_id && !existingLead.line_id) updates.line_id = cleanData.line_id;
      if (cleanData.location && !existingLead.location) updates.location = cleanData.location;

      // Keep highest/latest values for metrics
      if (cleanData.bill_amount > 0) updates.bill_amount = cleanData.bill_amount;
      if (cleanData.system_size) updates.system_size = cleanData.system_size;
      if (cleanData.equipment_tier) updates.equipment_tier = cleanData.equipment_tier;

      // History Enrichment
      if (cleanData.chat_history && Array.isArray(cleanData.chat_history)) {
        const existingHistory = Array.isArray(existingLead.chat_history) ? existingLead.chat_history : [];
        // Prevent exact duplicates in history (optional but good)
        const lastMsg = existingHistory[existingHistory.length - 1];
        const newMsg = cleanData.chat_history[0];
        if (!lastMsg || JSON.stringify(lastMsg) !== JSON.stringify(newMsg)) {
          updates.chat_history = [...existingHistory, ...cleanData.chat_history];
        }
      }

      // Merge Notes
      if (cleanData.notes) {
        const timestamp = new Date().toLocaleTimeString('th-TH');
        const newNote = `\n[${timestamp}]: ${cleanData.notes}`;
        updates.notes = (existingLead.notes || '') + newNote;
      }

      const { data: updatedArr, error: updateError } = await client
        .from('leads')
        .update(updates)
        .eq('id', existingLead.id)
        .select();

      if (updateError) throw updateError;
      const updated = updatedArr?.[0];

      // FALLBACK: If update returned no rows (RLS or race condition), try insert
      if (!updated) {
         console.warn('[LeadManager] Update failed, falling back to insert');
         return await createNewLead(cleanData, email, data.survey_date);
      }

      // Notify about enrichment if important data added (like phone)
      if (!existingLead.phone && updated.phone) {
        notifyAdminNewLead(updated); // Treat as new lead if phone just arrived
      }

      return { success: true, lead: updated, isNew: false };
    }

    return await createNewLead(cleanData, email, data.survey_date);

  } catch (error) {
    console.error('[LeadManager] Submit failed:', sanitizePII(String(error)));
    return { success: false, error: (error as Error).message };
  }
}

// Referral code from ?ref= links (stored in sb_ref cookie by /api/ref/[code])
function getRefCode(): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const m = document.cookie.match(/(?:^|; )sb_ref=([^;]+)/);
    const code = m ? decodeURIComponent(m[1]).trim().toLowerCase() : '';
    return /^[a-z0-9-]{2,40}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

async function createNewLead(cleanData: any, email: string | null, rawSurveyDate?: string): Promise<LeadResult> {
  const client = getClient();

  // Server-side submission (works for anon: anon SELECT on leads is closed).
  // Validates, rate-limits per phone, resolves partner attribution, returns row.
  const { data: newLead, error } = await client.rpc('submit_lead', {
    p_name: cleanData.name || 'ลูกค้าใหม่',
    p_phone: cleanData.phone || null,
    p_line_id: cleanData.line_id || null,
    p_email: email,
    p_location: cleanData.location || null,
    p_bill: cleanData.bill_amount ?? 0,
    p_system_size: cleanData.system_size ?? null,
    p_payback: cleanData.payback_years ?? null,
    p_tier: cleanData.equipment_tier || null,
    p_source: cleanData.source || DEFAULT_SOURCE,
    p_notes: cleanData.notes || null,
    p_chat_history: cleanData.chat_history || [],
    p_survey_date: rawSurveyDate ? new Date(rawSurveyDate).toISOString() : null,
    p_referred_by: getRefCode(),
  });

  if (error) throw error;
  if (!newLead) throw new Error('Insert returned no rows');

  notifyAdminNewLead(newLead);
  return { success: true, lead: newLead, isNew: true };
}

function normalizeLeadData(data: LeadData): LeadData {
  const result: LeadData = { ...data };

  if (typeof result.bill_amount === 'string') {
    const parsed = parseFloat(result.bill_amount);
    result.bill_amount = isNaN(parsed) ? 0 : parsed;
  }

  if (typeof result.system_size === 'string') {
    const parsed = parseFloat(result.system_size);
    result.system_size = isNaN(parsed) ? 0 : parsed;
  }

  if (typeof result.payback_years === 'string') {
    const parsed = parseFloat(result.payback_years);
    result.payback_years = isNaN(parsed) ? 0 : parsed;
  }

  return result;
}

export async function updateLead(id: number, updates: Partial<LeadData>): Promise<LeadResult> {
  const client = getClient();
  try {
    const cleanUpdates: Record<string, unknown> = { ...updates };

    if (updates.bill_amount !== undefined) {
      if (typeof updates.bill_amount === 'string') {
        cleanUpdates.bill_amount = parseFloat(updates.bill_amount) || 0;
      }
      if (typeof cleanUpdates.bill_amount === 'number' && cleanUpdates.bill_amount < 0) {
        cleanUpdates.bill_amount = 0;
      }
    }

    if (updates.survey_date) {
      cleanUpdates.survey_date = new Date(updates.survey_date as string).toISOString();
    }

    const { data: updated, error } = await client
      .from('leads')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[LeadFactory] Update error:', sanitizePII(String(error)))
      return { success: false, error: error.message };
    }

    return { success: true, lead: updated as LeadData & { id: number } };
  } catch (error) {
    console.error('[LeadFactory] Update unexpected error:', sanitizePII(String(error)))
    return { success: false, error: (error as Error).message };
  }
}