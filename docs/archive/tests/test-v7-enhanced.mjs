/**
 * Test V7 - Enhanced Comparison Table
 */

import { createProductFlexMessageV7 } from './src/lib/line.ts';
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
  console.log('Testing V7 Enhanced...\n');
  const bubble = createProductFlexMessageV7(testProduct);
  const size = JSON.stringify(bubble).length;
  console.log('Size:', size, 'bytes');
  console.log('\nStructure:');
  console.log('- Hero image');
  console.log('- Badge: 500+ installations');
  console.log('- Table: price, savings, installment, ROI, warranty, installation');
  console.log('- Trust: กรมพัฒนาฯ + professional team');
  console.log('- CTA: นัดสำรวจฟรีวันนี้');

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ to: LINE_ADMIN_ID, messages: [{ type: 'flex', altText: `V7: ${testProduct.name} - Enhanced Comparison`, contents: bubble }] })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('\n✅ V7 Enhanced sent successfully!');
  } else {
    console.log('\n❌ Error:', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);