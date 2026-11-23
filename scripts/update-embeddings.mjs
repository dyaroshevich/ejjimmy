import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_API_KEY) {
  console.error('❌ Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GOOGLE_GENERATIVE_AI_API_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

async function updateEmbeddings() {
  console.log('🚀 Starting embedding update for knowledge base...');

  try {
    // 1. Fetch entries that need embedding
    const { data: entries, error: fetchError } = await supabase
      .from('knowledge')
      .select('id, content')
      .is('embedding', null);

    if (fetchError) throw fetchError;

    if (!entries || entries.length === 0) {
      console.log('✅ All entries already have embeddings.');
      return;
    }

    console.log(`📦 Found ${entries.length} entries to process.`);

    for (const entry of entries) {
      try {
        console.log(`  - Processing entry ${entry.id}...`);
        
        // 2. Generate embedding
        const result = await model.embedContent(entry.content);
        let embedding = result.embedding.values;
        console.log(`    - Generated embedding with length: ${embedding.length}`);

        // Truncate to 768 if needed (Matryoshka embeddings compatible)
        if (embedding.length > 768) {
          console.log(`    - Truncating to 768 dimensions.`);
          embedding = embedding.slice(0, 768);
        }

        // 3. Update Supabase
        const { error: updateError } = await supabase
          .from('knowledge')
          .update({ embedding })
          .eq('id', entry.id);

        if (updateError) throw updateError;
        
        console.log(`    ✅ Success.`);
      } catch (err) {
        console.error(`    ❌ Error processing entry ${entry.id}:`, err.message);
      }
    }

    console.log('🏁 Embedding update complete.');
  } catch (error) {
    console.error('❌ Global error:', error.message);
  }
}

updateEmbeddings();
