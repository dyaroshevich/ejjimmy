import webpush from 'web-push';
import { createScopedClient as createClient } from '@/lib/supabase-server';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendWebPush(
  title: string, 
  body: string, 
  url?: string, 
  type: string = 'system', 
  specificSubs?: any[],
  options: { tag?: string; badgeCount?: number } = {}
) {
  // Push is the optional channel: without VAPID keys the other channels
  // (Telegram, LINE) must still fire, so this is a no-op rather than a throw.
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.warn('[PUSH] skipped: VAPID keys not configured');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let subscriptions = specificSubs;
    
    if (!subscriptions) {
      const { data, error } = await supabase.from('push_subscriptions').select('*');
      if (error) throw error;
      subscriptions = data;
    }

    if (!subscriptions || subscriptions.length === 0) return;

    const payload = JSON.stringify({ 
      title, 
      body, 
      url, 
      type, 
      tag: options.tag, 
      badgeCount: options.badgeCount 
    });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            },
            payload
          );
          console.log(`[PUSH] Sent to ${sub.endpoint.substring(0, 40)}...`);
        } catch (err: any) {
          console.error(`[PUSH] Error for endpoint ${sub.endpoint.substring(0, 40)}...:`, err.statusCode, err.message);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      })
    );
  } catch (error) {
    console.error('[PUSH] Master dispatch error:', error);
    throw error;
  }
}

