require('dotenv').config();
const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Dummy subscription to test if the notification event fires
// In a real scenario, you'd get this from your DB
const testSubscription = {
  // REPLACE THIS WITH A REAL ENDPOINT FROM YOUR DB TO TEST
  endpoint: 'https://example.com/not-a-real-endpoint',
  keys: {
    p256dh: '...',
    auth: '...'
  }
};

async function testPush() {
  console.log('Sending test push...');
  try {
    await webpush.sendNotification(testSubscription, JSON.stringify({ 
      title: 'Tawan Admin Test', 
      body: 'Если вы видите это, значит система уведомлений работает!' 
    }));
    console.log('Test sent successfully!');
  } catch (err) {
    console.error('Test failed (expected if subscription is fake):', err.message);
  }
}

testPush();
