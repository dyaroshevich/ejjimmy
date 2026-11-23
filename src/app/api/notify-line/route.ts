import { NextResponse } from 'next/server';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { sendWebPush } from '@/lib/push';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { leadSubmitRatelimit } from '@/lib/ratelimit';
import { clientIp } from '@/lib/client-ip';
import { sendTelegramLead } from '@/lib/telegram';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Re-enabling LINE Push (commented block below) also needs back:
// import { pushToLine } from '@/lib/line-handlers'; import { createLeadFlexMessage } from '@/lib/line-messages';
// const LINE_ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type = 'lead', leadId } = body;

    console.log('[NOTIFY] Incoming notification request:', { type, leadId });

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- Access gate: admin dashboard sessions allow everything.
    // Public callers (lead form) may only trigger fresh new-lead
    // notifications, rate-limited per IP. This blocks push spam and
    // phishing via arbitrary title/message payloads.
    const admin = await isAdminAuthorized();
    if (!admin) {
      if (type !== 'new_lead' && type !== 'lead') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const ip = clientIp(req.headers);
      const { success: rlOk } = await leadSubmitRatelimit.limit(ip);
      if (!rlOk) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      if (!leadId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const { data: freshLead } = await supabase
        .from('leads')
        .select('id, created_at')
        .eq('id', leadId)
        .single();
      if (!freshLead || Date.now() - new Date(freshLead.created_at).getTime() > 30 * 60 * 1000) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Fetch all subscriptions and settings separately
    const { data: subs, error: subError } = await supabase.from('push_subscriptions').select('*');
    if (subError) throw subError;

    const { data: allSettings, error: settingsError } = await supabase.from('user_notification_settings').select('*');
    if (settingsError) throw settingsError;

    // 2. Filter subscriptions based on logic
    const filteredSubs = await Promise.all((subs || []).map(async (sub) => {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(sub.user_id);
      if (userError || !user) return null;

      const role = user.app_metadata?.role || 'admin';
      const settings = (allSettings || []).find(s => s.user_id === sub.user_id);

      if (role === 'super_admin') return sub;

      if (settings) {
        if (type === 'new_lead' && !settings.leads_enabled) return null;
        if (type === 'line_message' && !settings.chat_enabled) return null;
        if (type === 'status_change' && !settings.status_changes_enabled) return null;
        if (type.includes('alert') && !settings.alerts_enabled) return null;

        if (settings.quiet_hours_enabled) {
          const now = new Date();
          const thTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
          const hour = thTime.getHours();
          const [startH] = (settings.quiet_hours_start || '22:00').split(':').map(Number);
          const [endH] = (settings.quiet_hours_end || '08:00').split(':').map(Number);
          const isQuiet = endH > startH ? (hour >= startH && hour < endH) : (hour >= startH || hour < endH);
          if (isQuiet) return null;
        }
      }
      return sub;
    }));

    const validSubs = filteredSubs.filter(Boolean);

    // 2.5 Calculate Badge Count
    const { count: unreadLeadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('unread', true);
    
    const badgeCount = (unreadLeadsCount || 0);

    // 3. Dispatch Notifications
    if ((type === 'lead' || type === 'new_lead' || type === 'status_change') && leadId) {
       const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
       if (lead) {
         let title = `💬 LINE: ${lead.name}`;
         let message = lead.source || 'New lead from LINE';
         let notificationType = 'new_lead';
         let url = `/admin/leads/${leadId}`;

         if (lead.chat_history && Array.isArray(lead.chat_history) && lead.chat_history.length > 0) {
           const customerMsgs = lead.chat_history.filter((m: any) => m.role === 'user');
           if (customerMsgs.length > 0) {
             const lastMsg = customerMsgs[customerMsgs.length - 1];
             message = (lastMsg.content?.slice(0, 50) || '') + (lastMsg.content?.length > 50 ? '...' : '');
           }
         }

         if (type === 'status_change') {
           title = `📂 Status Updated: ${lead.name}`;
           message = `New status: ${lead.status}`;
           notificationType = 'status_change';
         }

         // Web Push & Broadcast
         const payload = { title, message, url, type: notificationType };
         const channel = supabase.channel('admin-alerts');
         channel.subscribe();
         await channel.send({ type: 'broadcast', event: 'notification', payload: { ...payload, badgeCount } });
         await sendWebPush(payload.title, payload.message, payload.url, payload.type, validSubs, { tag: notificationType === 'new_lead' ? 'new_lead' : undefined, badgeCount });
         
         // --- TELEGRAM NOTIFICATION (primary reliable channel) ---
         if (type === 'new_lead') {
           await sendTelegramLead(lead);
         }

         // --- LINE PUSH TO ADMIN (commented: uses LINE quota, Web Push + Telegram cover it) ---
         // if (type === 'new_lead' && LINE_ADMIN_USER_ID) {
         //   console.log('[NOTIFY] Sending LINE Push to admin:', LINE_ADMIN_USER_ID);
         //   const adminFlex = createLeadFlexMessage({
         //     name: lead.name, phone: lead.phone, location: lead.location,
         //     segment: lead.system_size ? `${lead.system_size}kW` : 'Unknown',
         //     monthly_bill: lead.bill_amount, source: lead.source, leadId: lead.id
         //   });
         //   await pushToLine(LINE_ADMIN_USER_ID, [adminFlex]);
         // }
       }
    }

    if (type === 'line_message') {
      const payload = { title: body.title || '💬 New LINE Message', message: body.message || 'Client is waiting for a reply...', url: body.url || '/admin/chat', type: 'line_message' };
      const channel = supabase.channel('admin-alerts');
      channel.subscribe();
      await channel.send({ type: 'broadcast', event: 'notification', payload: { ...payload, badgeCount } });
      await sendWebPush(payload.title, payload.message, payload.url, payload.type, validSubs, { tag: 'line_message', badgeCount });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[NOTIFY] Master Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


function getTestPayload(type: string) {
  switch(type) {
    case 'test_lead': return { title: '🆕 New Lead: Test User', message: '5kW Hybrid System | Phuket', url: '/admin/leads/test', type: 'new_lead' };
    case 'test_line': return { title: '💬 LINE Message', message: 'Client: Hello, I need help!', url: '/admin/chat', type: 'line_message' };
    case 'test_alert': return { title: '⚠️ System Alert', message: 'High CPU usage detected', url: '/admin/super', type: 'system_alert' };
    case 'test_status': return { title: '📂 Status Changed', message: 'Lead "Test User" moved to "Survey Done"', url: '/admin/leads/test', type: 'status_change' };
    case 'test_security': return { title: '🚨 Security Alert', message: 'New login from unknown device', url: '/admin/super', type: 'security_alert' };
    default: return { title: '🔔 Basic Test', message: 'System check complete', url: '/admin', type: 'system' };
  }
}
