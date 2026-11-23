/**
 * Test script for LINE Flex Message V5: Two-Column Split Layout
 * Run with: node test-v5.mjs
 */

import { createProductFlexMessageV5 } from './src/lib/line.ts';
import { readFileSync } from 'fs';

const LINE_ADMIN_ID = 'Uf63c5b44a3ac7aad18153620fac57126';

// Load env
try {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (e) {
  console.log('No .env.local found, using existing env');
}

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function sendFlexMessage(bubble, altText) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      to: LINE_ADMIN_ID,
      messages: [{
        type: 'flex',
        altText: altText || 'LINE Flex Message V5',
        contents: bubble
      }]
    })
  });
  
  const data = await response.json();
  return { ok: response.ok, data };
}

async function main() {
  const testProduct = {
    id: 'test-001',
    name: 'แพ็กเกจ 5.5 kW',
    brand: 'TAWAN POWER',
    power_kw: 5.5,
    price_thb: 159000,
    specifications: {
      panel_brand: 'LONGi',
      inverter_brand: 'Huawei',
      panel_count: 10,
      warranty_years: 25
    }
  };

  console.log('Testing V5: Two-Column Split Layout');
  console.log('Product:', testProduct.name);
  console.log('Sending...');

  const bubble = createProductFlexMessageV5(testProduct);
  const result = await sendFlexMessage(bubble, `V5: ${testProduct.name} - ฿${testProduct.price_thb}`);

  if (result.ok) {
    console.log('✅ V5 sent successfully!');
    console.log('Message size:', JSON.stringify(bubble).length, 'bytes');
  } else {
    console.log('❌ V5 failed:', result.data);
  }
}

main().catch(console.error);