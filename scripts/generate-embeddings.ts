/**
 * Generate missing embeddings for solar_products
 *
 * Usage:
 * 1. Set environment variables:
 *    - OPENAI_API_KEY=your-key
 *    - NEXT_PUBLIC_SUPABASE_URL=your-url
 *    - SUPABASE_SERVICE_ROLE_KEY=your-service-key
 * 2. Run: npx tsx scripts/generate-embeddings.ts
 *
 * This script will:
 * - Fetch all products without embeddings
 * - Generate text representation: name + description + brand + model + type + JSON(specifications)
 * - Call OpenAI text-embedding-ada-002 (or text-embedding-3-small)
 * - Update the product's embedding column
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  console.error('  OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002', // 1536 dimensions
    input: text,
  });
  return response.data[0].embedding;
}

function productToText(product: any): string {
  const parts = [
    product.brand,
    product.name,
    product.model,
    product.type,
    `Power: ${product.power_kw}kW`,
    product.description,
    product.specifications ? JSON.stringify(product.specifications) : '',
    product.system_components ? JSON.stringify(product.system_components) : '',
  ].filter(Boolean);
  return parts.join(' ');
}

async function generateForMissingProducts() {
  console.log('Fetching products without embeddings...');

  const { data: products, error } = await supabase
    .from('solar_products')
    .select('id, name, brand, model, type, power_kw, description, specifications, system_components')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.log('All products have embeddings! ✓');
    return;
  }

  console.log(`Found ${products.length} products without embeddings. Generating...`);

  for (const product of products) {
    try {
      const text = productToText(product);
      console.log(`  Generating for: ${product.name} (${product.id})`);

      const embedding = await generateEmbedding(text);

      // Convert to PostgreSQL vector format: [1.0,2.0,...]
      const vector = `[${embedding.join(',')}]`;

      const { error: updateError } = await supabase
        .from('solar_products')
        .update({ embedding: vector })
        .eq('id', product.id);

      if (updateError) {
        console.error(`  ✗ Failed to update ${product.id}:`, updateError.message);
      } else {
        console.log(`  ✓ Updated ${product.id}`);
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${product.id}:`, err);
    }
  }

  console.log('Done!');
}

generateForMissingProducts().catch(console.error);
