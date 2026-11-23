# Fragment 4: Recommendation Engine — Vector Search API

**Priority:** P0 — Enables intelligent Q&A and product matching
**Estimated time:** 3-4 hours
**Dependencies:** Fragment 1 (embeddings ready), Fragment 3 (knowledge populated)

---

## 🎯 Goal

Build a semantic recommendation system that can:
1. Take natural language queries from users ("What solar system for a 100kW factory?")
2. Find the most relevant products using vector similarity
3. Find relevant expertise articles from knowledge base
4. Combine results into a coherent recommendation

This is the core **RAG (Retrieval-Augmented Generation)** capability.

---

## 🏗️ Architecture

```
User query → Text embedding → Vector search (products + articles) → Combine → Response
                          ↓
                    PostgreSQL + pgvector
```

---

## 🛠️ Step 1: Create Vector Search Functions

Add these stored procedures to your database. Create migration: `supabase/migrations/002_vector_search_functions.sql`

```sql
-- Function: Find top-matching products
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id text,
  name text,
  brand text,
  power_kw numeric,
  price_thb int,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    p.id, p.name, p.brand, p.power_kw, p.price_thb,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM solar_products p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function: Find top-matching knowledge articles
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 3,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    k.id, k.content, k.metadata,
    1 - (k.embedding <=> query_embedding) as similarity
  FROM knowledge k
  WHERE k.embedding IS NOT NULL
    AND (category_filter IS NULL OR k.metadata->>'category' = category_filter)
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**Important:** Adjust `match_threshold` based on your embedding quality. Start with 0.6 for products (tight matching) and 0.5 for knowledge (looser).

Apply migration:
```bash
supabase db push
```

---

## 🛠️ Step 2: Create Recommend API Endpoint

Create file: `src/app/api/recommend/route.ts`

<details>
<summary>📄 Full source code</summary>

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Get embedding for a text query.
 * This is a placeholder — you need to implement actual embedding generation.
 * Options:
 * 1. Call OpenAI embedding API
 * 2. Use Supabase pgvector's pg_sbert extension (if installed)
 * 3. Call an Edge Function that generates embedding
 */
async function getQueryEmbedding(query: string): Promise<number[]> {
  // TODO: Replace with actual embedding generation
  // For now, we'll use a simple fallback: call a stored procedure or external API

  const supabase = await createClient();

  // Option A: Use pg_sbert extension (if available)
  // const { data } = await supabase.rpc('embed_text', { text: query });
  // return data;

  // Option B: Call Edge Function
  // const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/embed`, { ... });
  // const { embedding } = await res.json();
  // return embedding;

  // Option C: Call OpenAI directly (requires API key)
  // ... implementation

  throw new Error('getQueryEmbedding not implemented. See documentation.');
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { query, filters, limit = 5 } = await request.json();

  if (!query || typeof query !== 'string') {
    return NextResponse.json(
      { error: 'Query is required and must be a string' },
      { status: 400 }
    );
  }

  try {
    // 1. Get embedding for the query
    const queryEmbedding = await getQueryEmbedding(query);

    // 2. Vector search for products
    const { data: products } = await supabase.rpc('match_products', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: limit,
    });

    // 3. Vector search for expertise articles (if query seems general)
    const { data: articles } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3,
      category_filter: null, // get any category, or filter to 'expertise' for general questions
    });

    // 4. Build recommendation summary
    const recommendation = buildRecommendation(query, products, articles);

    return NextResponse.json({
      query,
      products,
      articles,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}

function buildRecommendation(
  query: string,
  products: any[],
  articles: any[]
): string {
  if (products.length === 0) {
    return "I couldn't find a perfect match, but our team can custom-design a solution for you. Could you tell me more about your location and monthly electricity bill?";
  }

  const topProduct = products[0];
  const relatedArticle = articles[0];

  let rec = `Based on your needs, I recommend **${topProduct.name}** (${topProduct.brand}, ${topProduct.power_kw}kW).\n\n`;

  if (topProduct.similarity > 0.8) {
    rec += `This is a very strong match (${(topProduct.similarity * 100).toFixed(0)}% relevance).\n`;
  }

  if (relatedArticle) {
    rec += `\nHere's what our experts say:\n${relatedArticle.content.substring(0, 300)}...\n`;
  }

  rec += `\nKey specs:\n`;
  rec += `• Price: ${topProduct.price_thb.toLocaleString()} THB\n`;
  rec += `• Expected savings: ~50,000+ THB/month\n`;
  rec += `• Warranty: 10+ years\n\n`;
  rec += `Would you like to schedule a free site survey?`;

  return rec;
}
```

</details>

---

## 🛠️ Step 3: Implement Embedding Generation

The `getQueryEmbedding` function is the missing piece. You have several options:

### **Option A: OpenAI Embeddings** (Recommended, ~$20/month)

Create Edge Function: `supabase/functions/embed-text/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { text } = await req.json();
  if (!text) return Response.json({ error: "Text required" }, { status: 400 });

  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002", // 1536 dimensions
    input: text,
  });

  // IMPORTANT: Your solar_products.embedding is 768-dim.
  // You need to either:
  // 1. Recreate solar_products.embedding as vector(1536) and regenerate all
  // 2. Use a 768-dim model like 'text-embedding-3-small' (1536 output, can truncate? actually same)
  // Actually text-embedding-ada-002 is 1536. For 768 compatibility, use a different model or accept mismatch.

  // Better: Use sentence-transformers via a Python service, or use Cohere's embed-english-v3.0 (4096?).

  return Response.json({ embedding: embedding.data[0].embedding });
});
```

**⚠️ Dimension matching:** Your current `solar_products.embedding` is 768-dim. OpenAI ada-002 outputs 1536. You must either:
- Change `solar_products.embedding` to `vector(1536)` and regenerate all product embeddings (recommended for consistency)
- Or use a 768-dimensional embedding model (e.g., `sentence-transformers/all-MiniLM-L6-v2` via local Python service)

### **Option B: Use pgvector's pg_sbert extension** (Free, local)

If your Supabase project has `pg_sbert` extension installed, you can generate embeddings directly in SQL:

```sql
-- Enable extension (once per database)
CREATE EXTENSION IF NOT EXISTS pg_sbert;

-- Then call from your app:
SELECT sbert_embed('text', 'your query here');
```

This returns a 384-dim vector (might need to match dimension). Check your Supabase instance for available models.

### **Option C: Simple keyword fallback** (Temporary)

Until you have proper embeddings, use a simple keyword scorer:

```typescript
async function getQueryEmbedding(query: string): Promise<number[]> {
  // This is a stub — it won't give good semantic search
  // But it lets you test the API structure
  console.warn('Using dummy embedding — vector search will not work properly');
  return new Array(768).fill(0);
}
```

And modify `match_products` to also do keyword filtering:

```sql
CREATE OR REPLACE FUNCTION match_products_with_keywords(
  query_text text,
  match_count int DEFAULT 5
)
RETURNS TABLE (...) AS $$
  SELECT ... FROM solar_products
  WHERE name ILIKE '%' || query_text || '%'
     OR description ILIKE '%' || query_text || '%'
  ORDER BY ... (could add a simple score)
$$;
```

---

## 🛠️ Step 4: Test the Recommendation API

Start your dev server:
```bash
npm run dev
```

Test with `curl`:

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query":"solar system for factory 100kW"}'
```

Expected response:
```json
{
  "query": "solar system for factory 100kW",
  "products": [
    {
      "id": "huawei-100kw-inverter",
      "name": "Huawei SUN2000-100KTL-M1 (Industrial Grade)",
      "brand": "Huawei",
      "power_kw": 100,
      "price_thb": 185000,
      "similarity": 0.87
    },
    {
      "id": "solaredge-100kw-inverter",
      "name": "Inverter SolarEdge 100 kW 3 Phase",
      "similarity": 0.82
    }
  ],
  "articles": [
    {
      "id": 748,
      "content": "Как выбрать инвертор для промышленного объекта...",
      "similarity": 0.72
    }
  ],
  "recommendation": "Based on your needs, I recommend **Huawei SUN2000-100KTL-M1**..."
}
```

---

## 🧠 How It Works: The RAG Pipeline

1. **Query** — User asks "What for 100kW factory?"
2. **Embedding** — Text is converted to 768-dim vector
3. **Product search** — pgvector computes cosine similarity against all product embeddings; returns top 5 above threshold
4. **Article search** — Same against knowledge embeddings (optionally filtered by category)
5. **Synthesis** — Simple heuristic builds recommendation string (in production you'd use an LLM here)
6. **Response** — JSON with products, articles, and natural language recommendation

---

## ✅ Checklist for Fragment 4

- [ ] Created migration `supabase/migrations/002_vector_search_functions.sql` with `match_products` and `match_knowledge`
- [ ] Migration applied (`supabase db push`)
- [ ] Created API endpoint `src/app/api/recommend/route.ts`
- [ ] Implemented `getQueryEmbedding` (at least stub version)
- [ ] API returns plausible results (test with curl)
- [ ] Tested with query "100kW industrial" — returns Huawei 100kW as top match
- [ ] Tested with query "сколько стоит солнечная система для отеля" — returns relevant case studies

---

## 🔜 Next: Fragment 5 — Automation & Integration

Final fragment ties everything together:
- **Sync triggers**: Keep `knowledge` in sync when `solar_products` change
- **Scheduled jobs**: Auto-generate embeddings for new products
- **LINE integration**: How to use `/api/recommend` and `/api/seller-scripts` from your LINE bot
- **A/B testing infrastructure**: Track which scripts convert best
- **Full checklist** to launch
