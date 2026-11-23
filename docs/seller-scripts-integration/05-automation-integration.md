# Fragment 5: Automation & Integration

**Priority:** P1 — Makes everything work automatically
**Estimated time:** 4-6 hours
**Dependencies:** All previous fragments

---

## 🎯 Goal

Tie everything together:
- Keep `knowledge` in sync with `solar_products`
- Auto-generate embeddings for new products
- Integrate seller scripts & recommend API with LINE bot
- Add A/B testing infrastructure
- Production-ready deployment checklist

---

## 🔄 Step 1: Sync Products → Knowledge (Triggers)

When a product is updated in `solar_products`, we want a corresponding `knowledge` entry to exist (for `direct_research`). Create a database trigger:

### 1.1 Create sync function

```sql
-- Function to sync a product to knowledge
CREATE OR REPLACE FUNCTION sync_product_to_knowledge()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert knowledge entry for this product
  INSERT INTO knowledge (content, metadata)
  VALUES (
    jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'brand', NEW.brand,
      'type', NEW.type,
      'model', NEW.model,
      'power_kw', NEW.power_kw,
      'price_thb', NEW.price_thb,
      'specifications', NEW.specifications,
      'system_components', NEW.system_components,
      'included_services', NEW.included_services,
      'description', NEW.description,
      'image_url', NEW.image_url,
      'gallery', NEW.gallery
    )::text,
    jsonb_build_object(
      'id', NEW.id,
      'type', 'product',
      'source', 'sync_from_solar_products',
      'synced_at', now()
    )
  )
  ON CONFLICT ((metadata->>'id'))
  WHERE metadata->>'id' IS NOT NULL
  DO UPDATE SET
    content = EXCLUDED.content,
    metadata = EXCLUDED.metadata,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 1.2 Create trigger

```sql
-- Trigger after product insert/update
CREATE TRIGGER sync_product_to_knowledge_trigger
  AFTER INSERT OR UPDATE ON solar_products
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_to_knowledge();
```

**Note:** This trigger only syncs product data to `knowledge` but does NOT update embeddings. Embeddings need separate regeneration (see Step 2).

---

## ⏰ Step 2: Scheduled Embedding Generation

New products (or updated products) won't have embeddings until we generate them. Need a nightly job.

### Option A: GitHub Actions (Recommended, easy)

Create `.github/workflows/generate-embeddings.yml`:

```yaml
name: Generate Missing Embeddings
on:
  schedule:
    - cron: '0 3 * * *'  # 3 AM daily
  workflow_dispatch:     # Allow manual run
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Generate embeddings
        run: npx tsx scripts/generate-embeddings.ts
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

The `scripts/generate-embeddings.ts` script (created earlier) will:
1. Fetch all products where embedding IS NULL
2. Generate embedding text: `${brand} ${name} ${description}`
3. Call OpenAI to get 1536-dim embedding
4. Update the product

**⚠️ Dimension issue:** Your current embeddings are 768-dim. OpenAI ada-002 returns 1536. Either:
- Change `solar_products.embedding` to `vector(1536)` and regenerate ALL products (one-time cost)
- Or use a 768-dim model (e.g., `sentence-transformers/all-MiniLM-L6-v2` via custom service)

### Option B: Supabase pg_cron (if available)

```sql
-- Create function to generate embeddings via Edge Function
CREATE OR REPLACE FUNCTION generate_missing_embeddings_job()
RETURNS void AS $$
DECLARE
  missing RECORD;
BEGIN
  FOR missing IN
    SELECT id, name, description, brand
    FROM solar_products
    WHERE embedding IS NULL
  LOOP
    -- Call Edge Function for each product (or batch)
    -- This is pseudo-code; you'd use pg_net or similar
    PERFORM
      netsvc.http_post(
        'https://your-project.supabase.co/functions/v1/generate-embedding',
        '{"id": "' || missing.id || '"}'
      );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule nightly
SELECT cron.schedule(
  'generate-missing-embeddings',
  '0 3 * * *',
  'SELECT generate_missing_embeddings_job()'
);
```

---

## 🤖 Step 3: LINE Bot Integration

Your LINE bot (in `src/lib/line-handlers.ts` or similar) can now use the APIs.

### 3.1 Handle product inquiries

When user asks about a product (by ID or name), fetch seller scripts:

```typescript
// In your LINE message handler
async function handleProductQuery(userId: string, productId: string) {
  // 1. Fetch seller scripts (use simple or economic type based on user history)
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/seller-scripts/${productId}`);
  const { scripts } = await res.json();

  // 2. Choose script type based on user context
  const user = await getUserContext(userId);
  const scriptType = user.payment_sensitivity === 'high' ? 'economic' : 'simple';
  const script = scripts.find(s => s.type === scriptType) || scripts.find(s => s.type === 'simple');

  // 3. Convert to LINE Flex Message (if rich content) or plain text
  return createFlexMessage(script.content);
}
```

### 3.2 Handle open-ended questions

For questions like "What system for factory?", call `/api/recommend`:

```typescript
async function handleOpenQuestion(question: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question }),
  });
  const { recommendation, products, articles } = await res.json();

  // Return recommendation as text message
  return {
    type: 'text',
    text: recommendation,
  };
}
```

### 3.3 Log interactions for A/B testing

Log every script shown to user:

```typescript
await supabase.from('line_actions_log').insert({
  user_id: userId,
  action: 'seller_script_shown',
  metadata: {
    product_id: productId,
    script_type: script.type,
    variant: 'A', // track A/B variant if using
    query: userMessage,
  },
});
```

---

## 🧪 Step 4: A/B Testing Infrastructure

Create table `script_variants` to track which version performs best:

```sql
-- Migration: supabase/migrations/003_ab_testing.sql
CREATE TABLE script_variants (
  id SERIAL PRIMARY KEY,
  script_type TEXT NOT NULL,
  product_id TEXT, -- NULL means global variant
  original_text TEXT NOT NULL,
  variant_text TEXT NOT NULL,
  variant_name TEXT NOT NULL, -- 'A', 'B', 'C'
  performance_score FLOAT DEFAULT 0,
  times_shown INT DEFAULT 0,
  times_converted INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_script_variants_lookup ON script_variants(script_type, product_id);
```

### How to use

1. For each script type, create variants in DB
2. In API, select variant based on `X-AB-Test-Variant` header or user assignment
3. Log conversions (user says "yes", requests callback, etc.)

Example API modification in `seller-scripts/[productId]/route.ts`:

```typescript
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const variant = request.headers.get('X-AB-Test-Variant') || 'A';

  // ... fetch product and generate base scripts

  // Apply variant if exists
  const { data: variants } = await supabase
    .from('script_variants')
    .select('*')
    .eq('script_type', script.type)
    .or(`product_id IS NULL,product_id.eq.${product.id}`)
    .eq('variant_name', variant);

  if (variants.length > 0) {
    // Replace key sections with variant text
    script.content = applyVariants(script.content, variants);
  }

  // Log that we showed this variant
  await supabase.from('line_actions_log').insert({
    user_id: requestUserId, // from session
    action: 'script_shown',
    metadata: { product_id: productId, script_type: script.type, variant },
  });

  return NextResponse.json({ script });
}
```

---

## 📦 Step 5: Production Checklist

### **Before Launch**

- [ ] All 36 products have embeddings (no NULL)
- [ ] `knowledge` table has at least 70 entries (including all product entries)
- [ ] Enriched view `enriched_solar_products` returns data for all products
- [ ] API endpoints tested:
  - [ ] `GET /api/seller-scripts/[id]` returns 4 scripts with non-empty content
  - [ ] `POST /api/recommend` returns relevant products for test queries
- [ ] Embedding generation script works (test on staging)
- [ ] Cron job or GitHub Actions scheduled
- [ ] Database indexes exist:
  - `solar_products_embedding_idx`
  - `knowledge_metadata_id_idx`
  - (optional) `script_variants_lookup`
- [ ] LINE bot integration:
  - [ ] Product queries call `/api/seller-scripts`
  - [ ] Open-ended questions call `/api/recommend`
  - [ ] Interactions logged to `line_actions_log`
- [ ] Error handling:
  - [ ] API returns 500 with error message
  - [ ] LINE bot shows fallback message if API fails
- [ ] Monitoring:
  - [ ] Log errors to `api_errors_log` (if not already)
  - [ ] Set up alerts for API failures (via Vercel/webhook)

### **After Launch (Week 1-2)**

- [ ] Review `line_actions_log` for failed API calls
- [ ] Check which scripts are shown most → prioritize A/B testing
- [ ] Identify gaps: queries with no good product match → add those products
- [ ] Add case studies for most-viewed product categories
- [ ] Translate top 3 scripts to Thai (if serving Thai customers)

---

## 📊 Monitoring Queries

Track your RAG system quality:

```sql
-- Products with few similar research items (need more content)
SELECT id, name, json_array_length(similar_research) as similar_count
FROM enriched_solar_products
WHERE similar_count < 2
ORDER BY similar_count ASC;

-- Most referenced brands in knowledge (thought leadership)
SELECT brand, COUNT(*) as mention_count
FROM knowledge,
     jsonb_to_recordset(metadata) as x(brand text)
WHERE metadata->>'brand' IS NOT NULL
GROUP BY brand
ORDER BY mention_count DESC;
```

---

## 🎯 Summary: What We Built

| Component | Files | Status |
|-----------|-------|--------|
| Database foundation | Migration 001 + view | ✅ Done |
| Seller scripts engine | `src/lib/sales/seller-scripts.ts` | ✅ Done |
| Scripts API | `src/app/api/seller-scripts/[id]/route.ts` | ✅ Done |
| Recommendation API | `src/app/api/recommend/route.ts` | ✅ Done |
| Knowledge templates | `src/lib/knowledge/article-templates.ts` | ✅ Done |
| Embedding generator | `scripts/generate-embeddings.ts` | ✅ Done |
| Test script | `scripts/test-seller-script.ts` | ✅ Done |
| Sync trigger | SQL in this fragment | 📝 Manual |
| A/B test tables | `script_variants` migration | 📝 Manual |
| LINE integration | Code in `line-handlers.ts` (your task) | 📝 Manual |

---

## 🚀 Launch Roadmap

**Day 1-2:** Complete Step 5 checklist (sync trigger, A/B table, LINE integration)
**Day 3-4:** Manual QA: test all endpoints with Postman/curl
**Day 5:** Deploy to production (Vercel + Supabase)
**Week 1:** Monitor logs, fix embedding generation issues
**Week 2-3:** Add first 10 case studies (Fragment 3, Priority 2)
**Week 4:** Evaluate which scripts perform best → start A/B testing

---

**Congratulations!** You now have a full-stack AI-powered sales enablement system that connects product catalog with research knowledge base. The engine will improve as you add more content.
