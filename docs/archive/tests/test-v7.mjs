/**
 * Test script for LINE Flex Message V7: Comparison Table Style
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

async function sendFlexMessage(bubble, altText) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ to: LINE_ADMIN_ID, messages: [{ type: 'flex', altText, contents: bubble }] })
  });
  return { ok: response.ok, data: await response.json() };
}

async function main() {
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

  console.log('Testing V7: Comparison Table Style');
  const bubble = createProductFlexMessageV7(testProduct);
  const result = await sendFlexMessage(bubble, `V7: ${testProduct.name} - รายละเอียดเปรียบเทียบ`);

  if (result.ok) {
    console.log('✅ V7 sent! Size:', JSON.stringify(bubble).length, 'bytes');
  } else {
    console.log('❌ V7 failed:', JSON.stringify(result.data, null, 2));
  }
}

main().catch(console.error);