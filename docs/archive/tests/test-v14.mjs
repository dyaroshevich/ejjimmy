/**
 * Test V14 - Dynamic Product Carousel using real Supabase data
 */

import { createProductFlexMessageV14 } from './src/lib/line.ts';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const LINE_ADMIN_ID = 'Uf63c5b44a3ac7aad18153620fac57126';

// 1. Manually load env vars for standalone script
try {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      const value = valueParts.join('=').trim().replace(/^["'](.+(?=["']$))["']$/, '$1');
      process.env[key.trim()] = value;
    }
  });
} catch (e) {}

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Initialize private client for script
const supabase = createClient(SB_URL, SB_KEY);

async function main() {
  console.log('Fetching a real product (system) from Supabase...');
  
  const { data: products, error } = await supabase
    .from('solar_products')
    .select('*')
    .eq('type', 'system')
    .limit(1);

  if (error || !products?.length) {
    console.error('❌ Could not fetch product from DB:', error?.message || 'No products found');
    return;
  }

  const dbProduct = products[0];
  console.log(`✅ Found product: ${dbProduct.name}`);

  console.log('\nGenerating V14 Dynamic Carousel (Multi-Bubble)...');
  const carousel = createProductFlexMessageV14(dbProduct);

  console.log(`Carousel has ${carousel.contents.length} bubbles:`);

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({
      to: LINE_ADMIN_ID,
      messages: [{ type: 'flex', altText: `V14 Details: ${dbProduct.name}`, contents: carousel }]
    })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('\n✅ V14 Carousel sent! Check your LINE.');
  } else {
    console.log('\n❌ Error:', JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
