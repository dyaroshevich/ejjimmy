/**
 * Test V9 - Technical Specs Carousel (10 bubbles)
 */

import { createProductFlexMessageV9 } from './src/lib/line.ts';
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
  console.log('Testing V9 - Technical Specs Carousel (10 bubbles)...\n');
  const carousel = createProductFlexMessageV9(testProduct);

  console.log('Carousel has', carousel.contents.length, 'bubbles:');
  const bubbleNames = [
    '1. Hero + Overview',
    '2. Solar Panel (LONGi)',
    '3. Inverter (Huawei)',
    '4. Monthly Production',
    '5. Cost Breakdown',
    '6. Warranty',
    '7. Installation Process',
    '8. Safety & Standards',
    '9. Before/After Comparison',
    '10. Social Proof + CTA'
  ];
  bubbleNames.forEach(name => console.log('  ' + name));

  const totalSize = JSON.stringify(carousel).length;
  console.log('\nTotal size:', totalSize, 'bytes');
  console.log('Avg per bubble:', Math.round(totalSize / carousel.contents.length), 'bytes');

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({
      to: LINE_ADMIN_ID,
      messages: [{ type: 'flex', altText: `V9: ${testProduct.name} - Technical Specs (10 bubbles)`, contents: carousel }]
    })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('\n✅ V9 Carousel sent! (10 bubbles - scrollable)');
    console.log('LINE features used:');
    console.log('  - backgroundColor styles on bubbles');
    console.log('  - line-through text for price comparison');
    console.log('  - emoji icons for visual appeal');
    console.log('  - Before/After comparison layout');
  } else {
    console.log('\n❌ Error:', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);