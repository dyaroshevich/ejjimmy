import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit-log';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !['admin', 'super_admin'].includes(user.app_metadata?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.action || !body.entity_type) {
      return NextResponse.json({ error: 'Missing action or entity_type' }, { status: 400 });
    }

    await logAudit({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: user.app_metadata.role,
      action: body.action,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      old_value: body.old_value,
      new_value: body.new_value,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[AuditLog API]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
