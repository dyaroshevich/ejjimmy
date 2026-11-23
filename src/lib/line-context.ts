/**
 * LINE User Context & State Management
 * Tracks user state for multi-step flows (calculator, lead form)
 */

import { supabase } from './supabase';

export type UserState = 'idle' | 'calculator' | 'lead_form' | 'ai_chat';
export type CalcStep = 'idle' | 'bill_range' | 'system_type' | 'roof_type' | 'location' | 'result';
export type BillRange = '2-4k' | '4-6k' | '6-8k' | '8-10k' | '10-15k' | '15-20k' | '20-30k' | '30-40k' | '40-50k' | '50k+';
export type SystemType = 'residential' | 'commercial' | 'industrial';
export type RoofType = 'concrete' | 'metal' | 'ground';
export type CalcLocation = 'krabi' | 'phuket' | 'chiangmai' | 'other';

export interface LineUserContext {
  user_id: string;
  state: UserState;
  calculator_step: CalcStep;
  calculator_bill?: number;
  calc_bill_range?: BillRange;
  calc_system_type?: SystemType;
  calc_roof_type?: RoofType;
  calc_location?: CalcLocation;
  calc_result_kw?: number;
  calculator_area?: string;
  last_action?: string;
  updated_at: string;
}

const CONTEXT_TTL_HOURS = 24;

export async function getUserContext(userId: string): Promise<LineUserContext | null> {
  const { data, error } = await supabase
    .from('line_context')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  const updatedAt = new Date(data.updated_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

  if (hoursDiff > CONTEXT_TTL_HOURS) {
    await deleteUserContext(userId);
    return null;
  }

  return data as LineUserContext;
}

export async function setUserContext(
  userId: string,
  updates: Partial<Omit<LineUserContext, 'user_id' | 'updated_at'>>
): Promise<void> {
  const existing = await getUserContext(userId);

  const contextData = {
    user_id: userId,
    state: updates.state ?? existing?.state ?? 'idle',
    calculator_step: updates.calculator_step ?? existing?.calculator_step ?? 'idle',
    calculator_bill: updates.calculator_bill ?? existing?.calculator_bill,
    calc_bill_range: updates.calc_bill_range ?? existing?.calc_bill_range,
    calc_system_type: updates.calc_system_type ?? existing?.calc_system_type,
    calc_roof_type: updates.calc_roof_type ?? existing?.calc_roof_type,
    calc_location: updates.calc_location ?? existing?.calc_location,
    calc_result_kw: updates.calc_result_kw ?? existing?.calc_result_kw,
    calculator_area: updates.calculator_area ?? existing?.calculator_area,
    last_action: updates.last_action ?? existing?.last_action,
    updated_at: new Date().toISOString()
  };

  await supabase.from('line_context').upsert(contextData, { onConflict: 'user_id' });
}

export async function resetUserContext(userId: string): Promise<void> {
  await setUserContext(userId, {
    state: 'idle',
    calculator_step: 'idle',
    calculator_bill: undefined,
    calc_bill_range: undefined,
    calc_system_type: undefined,
    calc_roof_type: undefined,
    calc_location: undefined,
    calculator_area: undefined,
    last_action: undefined
  });
}

export async function resetCalcContext(userId: string): Promise<void> {
  await setUserContext(userId, {
    state: 'calculator',
    calculator_step: 'bill_range',
    calculator_bill: undefined,
    calc_bill_range: undefined,
    calc_system_type: undefined,
    calc_roof_type: undefined,
    calc_location: undefined,
    calculator_area: undefined,
    last_action: 'calc_start'
  });
}

export async function deleteUserContext(userId: string): Promise<void> {
  await supabase.from('line_context').delete().eq('user_id', userId);
}

export async function logLineAction(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabase.from('line_actions_log').insert({
    user_id: userId,
    action,
    metadata,
    created_at: new Date().toISOString()
  });
}

export function parseActionData(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!data) return result;

  const pairs = data.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      result[key] = decodeURIComponent(value);
    }
  }
  return result;
}