import { supabaseAdmin } from './supabase-admin';

export interface AuditEntry {
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Write an entry to the audit_log table.
 * Uses supabaseAdmin (service_role) to bypass RLS.
 * Failures are logged but never thrown — audit should never break the app.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    if (!supabaseAdmin) {
      console.error('[AuditLog] supabaseAdmin not configured');
      return;
    }

    await supabaseAdmin.from('audit_log').insert({
      actor_id: entry.actor_id ?? 'system',
      actor_email: entry.actor_email ?? null,
      actor_role: entry.actor_role ?? null,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      old_value: entry.old_value ?? null,
      new_value: entry.new_value ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write:', err);
  }
}
