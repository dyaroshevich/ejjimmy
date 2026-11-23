/**
 * Test script for LINE Flex Message V8-V13
 */

import { PRODUCT_CARD_VARIANTS } from './src/lib/line.ts';
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

async function sendFlexMessage(bubble, altText) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ to: LINE_ADMIN_ID, messages: [{ type: 'flex', altText, contents: bubble }] })
  });
  return { ok: response.ok, data: await response.json() };
}

async function main() {
  console.log('Testing V8-V13...\n');

  const variants = ['V8', 'V9', 'V10', 'V11', 'V12', 'V13'];

  for (const variant of variants) {
    const createFn = PRODUCT_CARD_VARIANTS[variant];
    if (!createFn) {
      console.log(`❌ ${variant}: function not found`);
      continue;
    }

    try {
      const bubble = createFn(testProduct);
      const result = await sendFlexMessage(bubble, `${variant}: ${testProduct.name}`);

      if (result.ok) {
        console.log(`✅ ${variant} sent! Size: ${JSON.stringify(bubble).length} bytes`);
      } else {
        console.log(`❌ ${variant} failed:`, JSON.stringify(result.data, null, 2));
      }
    } catch (err) {
      console.log(`❌ ${variant} error:`, err.message);
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nDone!');
}

main().catch(console.error);