/**
 * Test V10 - Urgency/Scarcity Carousel (8 bubbles)
 */

import { createProductFlexMessageV10 } from './src/lib/line.ts';
import { readFileSync } from 'fs';

const LINE_ADMIN_ID = 'Uf63c5b44a3ac7aad18153620fac57126';

try {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (e) {}

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const testProduct = {
  name: 'แพ็กเกจ 5.5 kW',
  brand: 'TAWAN POWER',
  power_kw: 5.5,
  price_thb: 159000,
  specifications: {
    panel_brand: 'LONGi',
    inverter_brand: 'Huawei',
    warranty_years: 25
  }
};

async function main() {
  console.log('Testing V10 - Urgency/Scarcity Carousel (8 bubbles)...\n');
  const carousel = createProductFlexMessageV10(testProduct);

  console.log('Carousel has', carousel.contents.length, 'bubbles:');
  const bubbleNames = [
    '1. Flash Sale Hero (⏰ 48hrs)',
    '2. Why Now? (ค่าไฟขึ้น)',
    '3. Price Lock (ล็อคราคา)',
    '4. Limited Spots (สิทธิพิเศษ)',
    '5. Monthly Savings (ประหยัด X)',
    '6. No Risk (ไม่มีความเสี่ยง)',
    '7. Social Proof (รีวิว)',
    '8. Final CTA (กระตุ้นตัดสินใจ)'
  ];
  bubbleNames.forEach(name => console.log('  ' + name));

  const totalSize = JSON.stringify(carousel).length;
  console.log('\nTotal size:', totalSize, 'bytes');

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({
      to: LINE_ADMIN_ID,
      messages: [{ type: 'flex', altText: `V10: ${testProduct.name} - Urgency/Scarcity (8 bubbles)`, contents: carousel }]
    })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('\n✅ V10 Carousel sent! (8 bubbles - scrollable)');
    console.log('Psychological triggers used:');
    console.log('  - FOMO (Flash Sale 48hrs)');
    console.log('  - Price anchoring (original vs now)');
    console.log('  - Scarcity (limited spots)');
    console.log('  - Risk reversal (no risk guarantee)');
    console.log('  - Social proof (3 reviews)');
    console.log('  - Urgency (act now!)');
  } else {
    console.log('\n❌ Error:', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);