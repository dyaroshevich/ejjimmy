/**
 * Test V8 - Value Proposition Carousel (5 bubbles)
 */

import { createProductFlexMessageV8 } from './src/lib/line.ts';
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
  console.log('Testing V8 - Value Proposition Carousel...\n');
  const carousel = createProductFlexMessageV8(testProduct);

  console.log('Carousel has', carousel.contents.length, 'bubbles:');
  carousel.contents.forEach((bubble, i) => {
    const bodyTexts = bubble.body?.contents?.filter(c => c.type === 'text').map(c => c.text?.substring(0, 30)) || [];
    console.log(`  Bubble ${i+1}: ${bodyTexts.slice(0, 2).join(' | ')}...`);
  });

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({
      to: LINE_ADMIN_ID,
      messages: [{ type: 'flex', altText: `V8: ${testProduct.name} - Value Proposition`, contents: carousel }]
    })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('\n✅ V8 Carousel sent! (5 bubbles - scrollable)');
  } else {
    console.log('\n❌ Error:', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);