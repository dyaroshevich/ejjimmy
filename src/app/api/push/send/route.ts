import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createScopedClient as createClient } from '@/lib/supabase-server';
import { isAdminAuthorized } from '@/lib/admin-auth';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

export async function POST(req: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.error('[PUSH] Config missing:', { 
      pub: !!VAPID_PUBLIC_KEY, 
      priv: !!VAPID_PRIVATE_KEY, 
      sub: !!VAPID_SUBJECT 
    });
    return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
  }

  // Use Service Role for push notifications to ensure we can reach all subscribers
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  try {
    const { title, body, url, type = 'system' } = await req.json();

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;

    console.log(`[PUSH] Dispatching to ${subscriptions?.length || 0} devices`);

    let successCount = 0;
    let failCount = 0;

    const results = await Promise.allSettled(
      (subscriptions || []).map(async (sub) => {
        try {
          const res = await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            JSON.stringify({ title, body, url, type })
          );
          successCount++;
        } catch (err: any) {
          failCount++;
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('[PUSH] Removing expired subscription:', sub.endpoint);
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          } else {
            console.error('[PUSH] Delivery error:', sub.endpoint, err.statusCode, err.body);
          }
        }
      })
    );

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      failed: failCount,
      total: subscriptions?.length || 0,
    });

  } catch (error: any) {
    console.error('[PUSH] Master error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

