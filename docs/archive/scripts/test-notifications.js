/**
 * Test Notification Script
 * Usage: node scripts/test-notifications.js
 * 
 * Sends test notification via:
 * 1. Supabase Broadcast (primary - works on mobile)
 * 2. Web Push (fallback - for PWA subscribers)
 */

require('dotenv').config({ path: '.env.local' });

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testBroadcast() {
  console.log('\n📡 Testing Supabase Broadcast...\n');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/notify-line`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ type: 'test' }),
  });

  if (response.ok) {
    console.log('✅ Broadcast sent successfully!');
    const data = await response.json();
    console.log('   Response:', data);
  } else {
    console.log('❌ Broadcast failed:', response.status);
    const error = await response.text();
    console.log('   Error:', error);
  }
}

async function testWebPush() {
  console.log('\n📲 Testing Web Push...\n');

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log('⚠️  VAPID keys not configured, skipping Web Push');
    return;
  }

  const webpush = require('web-push');
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (error) {
    console.log('❌ Failed to fetch subscriptions:', error.message);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('⚠️  No push subscriptions found in database');
    return;
  }

  console.log(`📱 Found ${subscriptions.length} subscription(s)`);

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          JSON.stringify({
            title: '🔔 Test Notification',
            body: 'Web Push working!',
            url: '/admin'
          })
        );
        console.log(`✅ Sent to ${sub.endpoint.substring(0, 50)}...`);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`🗑️  Removing expired: ${sub.endpoint.substring(0, 50)}...`);
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.log(`❌ Failed: ${err.message}`);
        }
      }
    })
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`\n📊 Results: ${results.length - failed} sent, ${failed} failed`);
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('       TAWAN POWER - Notification Test         ');
  console.log('═══════════════════════════════════════════════');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('\n❌ Missing environment variables!');
    console.log('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  await testBroadcast();
  await testWebPush();

  console.log('\n═══════════════════════════════════════════════\n');
}

main().catch(console.error);