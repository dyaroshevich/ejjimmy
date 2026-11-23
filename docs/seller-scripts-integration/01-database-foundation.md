# Fragment 1: Database Foundation — Embeddings & Enriched View

**Priority:** P0 — Must have before any seller scripts can work  
**Estimated time:** 30 minutes (SQL only)  
**Dependencies:** None

---

## 🎯 Goal

Prepare the database for semantic product search and linking with knowledge base. This fragment establishes the infrastructure that all later fragments depend on.

---

## 📊 What This Fragment Does

1. Adds `embedding` column to `solar_products` table (768-dimensional vector)
2. Copies existing embeddings from `knowledge` table for products that have corresponding knowledge entries
3. Creates index for fast vector similarity search
4. Creates `enriched_solar_products` view that joins products with relevant research
5. Validates the setup with test queries

---

## 🛠️ Step-by-Step Implementation

### 1.1 Migration: Add embedding column

Create migration file: `supabase/migrations/001_add_embedding_to_solar_products.sql`

```sql
-- Add embedding column for vector search (768 dimensions to match existing knowledge embeddings)
ALTER TABLE solar_products
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS solar_products_embedding_idx
  ON solar_products
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- Unique index on knowledge(metadata->>'id') for ON CONFLICT upserts
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_metadata_id_idx
  ON knowledge ((metadata->>'id'))
  WHERE metadata->>'id' IS NOT NULL;
```

Apply migration:
```bash
supabase db push
# or
supabase migration up
```

⚠️ **Important:** The 768 dimension matches existing embeddings in `knowledge`. If you later use OpenAI (1536 dimensions), you'll need to alter the column and regenerate all embeddings.

---

### 1.2 Populate embeddings from existing knowledge

Many products already have corresponding entries in `knowledge` table (where `metadata->>'id'` equals `solar_products.id`). Copy those embeddings:

```sql
UPDATE solar_products p
SET embedding = k.embedding
FROM knowledge k
WHERE k.metadata->>'id' = p.id
  AND k.embedding IS NOT NULL;
```

Check result:
```sql
SELECT
  COUNT(*) as total_products,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embedding
FROM solar_products;
```

Expected: 34 products with embeddings (at time of writing, 2 products lack knowledge entries).

---

### 1.3 Create enriched_solar_products view

This view enriches each product with:
- `direct_research`: knowledge entries created specifically for this product
- `similar_research`: top 3 semantically similar research via vector search
- `brand_mentions`: count of brand mentions in knowledge (thought leadership indicator)
- `avg_payback_for_size`: average payback period for systems of similar size

```sql
CREATE OR REPLACE VIEW enriched_solar_products AS
SELECT
  p.*,
  -- Directly linked research (product-specific knowledge entries)
  (SELECT json_agg(k.content)
   FROM knowledge k
   WHERE k.metadata->>'id' = p.id
     AND k.embedding IS NOT NULL) as direct_research,

  -- Top 3 semantically similar research via vector search
  (SELECT json_agg(
      json_build_object(
        'content', sub.content,
        'category', sub.category,
        'type', sub.type,
        'similarity', sub.similarity
      )
    )
   FROM (
     SELECT k.content,
            k.metadata->>'category' as category,
            k.metadata->>'type' as type,
            1 - (k.embedding <=> p.embedding) as similarity
     FROM knowledge k
     WHERE k.embedding IS NOT NULL
       AND k.id NOT IN (
         SELECT id FROM knowledge WHERE metadata->>'id' = p.id
       )
     ORDER BY k.embedding <=> p.embedding
     LIMIT 3
   ) sub
  ) as similar_research,

  -- Brand mention count (thought leadership signal)
  (SELECT COUNT(*) FROM knowledge k
   WHERE k.content ILIKE '%' || p.brand || '%') as brand_mentions,

  -- Average payback for systems +/-50% power (extract numeric from Thai text)
  (SELECT ROUND(AVG(
     CASE
       WHEN specifications->>'payback_period' ~ '^\d+\.?\d*'
       THEN (regexp_match(specifications->>'payback_period', '^\d+\.?\d*'))[1]::numeric
       ELSE NULL
     END
   ), 1)
   FROM solar_products
   WHERE power_kw BETWEEN p.power_kw * 0.5 AND p.power_kw * 1.5
     AND specifications ? 'payback_period') as avg_payback_for_size

FROM solar_products p
WHERE p.embedding IS NOT NULL;
```

---

### 1.4 Validate the setup

```sql
-- Test query for Huawei 100kW inverter
SELECT
  id, name, brand, power_kw, price_thb,
  json_array_length(direct_research) as direct_count,
  json_array_length(similar_research) as similar_count,
  brand_mentions,
  avg_payback_for_size
FROM enriched_solar_products
WHERE id = 'huawei-100kw-inverter';
```

Expected output:
```
id: huawei-100kw-inverter
brand_mentions: 9
avg_payback_for_size: 4.0
direct_count: 1
similar_count: 3
```

---

## ⚠️ Potential Issues & Mitigation

| Issue | Impact | Mitigation |
|-------|--------|------------|
| Migration not applied in production | Code that uses view will break | Ensure migration file is in repo and applied via CI/CD |
| Embedding dimension mismatch later | Cannot compare old/new vectors | Document dimension decision; if changing, create new column and backfill |
| Products without embedding excluded from view | Missing data for new products | Fragment 5 will address with auto-generation |
| View performance with many joins | Slow queries under load | Consider materialized view later if needed |

---

## ✅ Checklist for Fragment 1

- [ ] Migration file created at `supabase/migrations/001_add_embedding_to_solar_products.sql`
- [ ] Migration applied (`supabase db push`)
- [ ] `embedding` column exists in `solar_products`
- [ ] Indexes created (`solar_products_embedding_idx`, `knowledge_metadata_id_idx`)
- [ ] Embeddings copied (at least 30 products have non-NULL embedding)
- [ ] View `enriched_solar_products` created successfully
- [ ] Test query returns data for known product

---

## 🔜 Next: Fragment 2 — Seller Scripts Engine & API

With the enriched view ready, we'll now build:
- **Seller scripts generator** (`src/lib/sales/seller-scripts.ts`) — produces 4 script types
- **API endpoint** (`src/app/api/seller-scripts/[productId]/route.ts`) — serves scripts to frontend
- **Test script** (`scripts/test-seller-script.ts`) — manual verification
