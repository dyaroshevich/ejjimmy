# Fragment 3: Knowledge Enrichment Strategy

**Priority:** P0 — Content is king, without it the engine is empty
**Estimated time:** 1-2 weeks (content creation) + 1 day (implementation)
**Dependencies:** Fragment 1 (view ready), Fragment 2 (engine ready)

---

## 🎯 Goal

Populate the `knowledge` table with high-quality, product-specific content that will power seller scripts, recommendations, and RAG-based Q&A. Without content, the embeddings are meaningless.

---

## 📊 Content Strategy

We need **3 types of knowledge entries**:

| Type | Purpose | Example count |
|------|---------|---------------|
| **product** | Mirror every `solar_products` entry (for `direct_research`) | 36 (all products) |
| **case_study** | Real installations in Thailand with numbers | 15-20 |
| **expertise** | How-to guides, comparisons, buying advice | 20-30 |

**Total target:** 70-80 knowledge entries (current: 52, need +25).

---

## 🛠️ Step 1: Article Templates

Create file: `src/lib/knowledge/article-templates.ts`

This defines reusable structures for common content types:

```typescript
// src/lib/knowledge/article-templates.ts

export const ARTICLE_TEMPLATES = {
  // Template for industrial inverter guide
  'industrial-inverter-guide': {
    title: 'How to Choose an Inverter for Industrial Facilities',
    sections: [
      'Introduction: Industrial Requirements',
      'Key Parameters: Power, Efficiency, Protection',
      'Huawei Industrial Grade: Features',
      'Comparison with Commercial Models',
      'ROI Calculation for 100kW+ Systems',
      'Warranty & Service in Thailand',
    ],
    targetProducts: ['inverter', 'system'],
    minPower: 50,
    metadata: {
      type: 'expertise',
      category: 'technical',
      language: 'ru',
    },
  },

  // Template for Thailand case studies
  'thailand-case-studies': {
    title: 'Solar Installations in Thailand: Real Results',
    sections: [
      'Factory in Chonburi (200kW)',
      'Resort in Phuket (50kW)',
      'Warehouse in Ratchaburi (100kW)',
      'Shopping Mall in Bangkok (500kW)',
      'Key Takeaways',
    ],
    targetProducts: ['system'],
    metadata: {
      type: 'case_study',
      category: 'results',
      language: 'ru',
    },
  },

  // Template for brand comparison
  'brand-comparison': {
    title: 'Huawei vs SolarEdge vs GoodWe: Detailed Comparison',
    sections: [
      'Methodology',
      'Comparison by 10 Criteria',
      'Who Wins in Each Category?',
      'Recommendations by Budget',
      'Final Verdict',
    ],
    targetProducts: ['inverter'],
    brands: ['Huawei', 'SolarEdge', 'GoodWe'],
    metadata: {
      type: 'expertise',
      category: 'comparison',
      language: 'ru',
    },
  },

  // Template for financing guide
  'financing-guide': {
    title: 'Solar Financing Options in Thailand',
    sections: [
      'Cash Purchase Pros & Cons',
      'Bank Loans (what we offer)',
      'Leasing Options',
      'Power Purchase Agreements (PPA)',
      'How to Choose',
    ],
    targetProducts: ['system'],
    metadata: {
      type: 'expertise',
      category: 'finance',
      language: 'ru',
    },
  },
} as const;

export type TemplateId = keyof typeof ARTICLE_TEMPLATES;
```

---

## 🛠️ Step 2: Manual Case Studies (Quick Win)

While waiting for full content strategy, add 5-10 high-impact case studies **manually via SQL**. These are based on real data from your existing projects (use anonymized numbers).

### Example 1: 100kW factory in Chonburi (Huawei)

```sql
INSERT INTO knowledge (content, metadata) VALUES (
  'Промышленный цех по производству пластика в Чонбури.

Система: 2 × Huawei SUN2000-100KTL-M1 (200kW)
Панели: 312 × Jinko 715W (223.8kW total DC)
Ежемесячная экономия: 90,000 THB
Срок окупаемости: 4.2 года
Инverter warranty: 10 лет

Особенности:
- Были проблемы с пиковыми нагрузками → решение через настройку Zero Export
- PEA inspected и одобрил за 3 недели
- Мониторинг через FusionSolar APP, доступен владельцу 24/7

Комментарий клиента: "Система окупится быстрее, чем мы думали. Каждый месяц видим точную экономию в приложении".',
  jsonb_build_object(
    'type', 'case_study',
    'location', 'Чонбури',
    'system_size', '200kW',
    'brand', 'Huawei',
    'industry', 'manufacturing',
    'monthly_savings', '90,000 THB',
    'payback_years', 4.2,
    'language', 'ru'
  )
);
```

### Example 2: 50kW resort in Phuket

```sql
INSERT INTO knowledge (content, metadata) VALUES (
  'Отель на пляже Ката, Пхукет — 50kW система с резервным питанием.

Система: Huawei SUN200-50KTL-M1 + 10kWh Sigenergy battery
Панели: 72 × Jinko 715W (51.48kW)
Ежемесячная экономия: 45,000 THB (включая ночное заряжание)
Срок окупаемости: 3.8 года

Особенности:
- Плавающие платформы для панелей (уrite крыши нетиповая)
- Батарея решает проблему частых отключений на Пхукете
- Владелец: "Теперь гости не жалуются на кондиционер в пиковые часы"

Замечание: PEA took 5 weeks due to high season.',
  jsonb_build_object(
    'type', 'case_study',
    'location', 'Пхукет',
    'system_size', '50kW',
    'brand', 'Huawei',
    'industry', 'hospitality',
    'monthly_savings', '45,000 THB',
    'payback_years', 3.8,
    'language', 'ru'
  )
);
```

### Example 3: 200kW warehouse in Rayong

```sql
INSERT INTO knowledge (content, metadata) VALUES (
  'Склад логистической компании в Районге.

Система: 2 × Huawei SUN2000-100KTL-M1 (200kW)
Панели: Longi LR5-72HBD 450W × 448 (201.6kW DC)
Аналитика: 98.8% uptime за 2 года
Экономия: 120,000 THB/месяц

Особенности:
- Необходимость быстрота монтажа (работа не останавливалась)
- Монтаж за 4 дня (ночная бригада)
- PEA одобрение ускорили через VIP-канал (у нас есть контакты)

ROI: 4.1 года, включая стоимость VIP-сервиса.',
  jsonb_build_object(
    'type', 'case_study',
    'location', 'Районг',
    'system_size', '200kW',
    'brand', 'Huawei',
    'industry', 'logistics',
    'monthly_savings', '120,000 THB',
    'payback_years', 4.1,
    'language', 'ru'
  )
);
```

---

## 🛠️ Step 3: LLM-Based Content Generation (Optional but Powerful)

If you have OpenAI API access, you can automate article creation. Create an Edge Function to generate articles from templates.

### Edge Function: `supabase/functions/generate-article/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "npm:openai";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { templateId, productIds, language = "ru" } = await req.json();

  // 1. Get template (simplified - store templates in DB or config)
  const templates = {
    'industrial-inverter-guide': {
      title: 'How to Choose an Inverter for Industrial Facilities',
      sections: ['Introduction', 'Key Parameters', 'Huawei Features', 'ROI', 'Warranty'],
      metadata: { type: 'expertise', category: 'technical' }
    }
    // ... more templates
  };
  const template = templates[templateId];
  if (!template) return Response.json({ error: "Template not found" }, { status: 404 });

  // 2. Get product data
  const { data: products } = await supabase
    .from("solar_products")
    .select("*")
    .in("id", productIds);

  // 3. Build prompt
  const prompt = `
You are a solar energy expert writing for Thai market.
Write an article titled: "${template.title}"

Structure:
${template.sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Products to reference:
${products.map(p => `- ${p.brand} ${p.name}: ${p.power_kw}kW, ${p.price_thb} THB`).join("\n")}

Write in ${language}, make it practical and data-driven.
`;

  // 4. Generate
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  const article = completion.choices[0].message.content!;

  // 5. Save to knowledge
  const { data: saved } = await supabase
    .from("knowledge")
    .insert({
      content: article,
      metadata: {
        type: "article",
        template: templateId,
        product_ids: productIds,
        language,
        ...template.metadata,
      },
    })
    .select()
    .single();

  return Response.json(saved);
});
```

Deploy:
```bash
supabase functions deploy generate-article
```

---

## 🛠️ Step 4: Content Checklist (What to Create FIRST)

### **Priority 1: Missing Product Entries** (Immediate — 1 hour)
- [ ] Create `knowledge` entries for the 2 products without embeddings (e.g., `sigenergy-10kwh-1phase`)
- How: Copy product data to `knowledge` with `metadata: { id: product.id, type: 'product' }`
- This ensures every product appears in `direct_research`

SQL pattern:
```sql
INSERT INTO knowledge (content, metadata)
SELECT
  jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'brand', p.brand,
    'type', p.type,
    'power_kw', p.power_kw,
    'price_thb', p.price_thb,
    'specifications', p.specifications,
    'description', p.description
  )::text,
  jsonb_build_object(
    'id', p.id,
    'type', 'product',
    'source', 'manual_sync'
  )
FROM solar_products p
WHERE p.embedding IS NULL;
```

### **Priority 2: Industrial/Commercial Case Studies** (Week 1)
- [ ] 100kW Huawei system (Chonburi factory) — 90,000 THB/mo, 4.2y payback
- [ ] 200kW Huawei system (warehouse) — 120,000 THB/mo, 4.1y
- [ ] 50kW SolarEdge (resort Phuket) — 45,000 THB/mo, 3.8y + battery story
- [ ] 10kW GoodWe (small business) — 15,000 THB/mo
- [ ] 500kW SolarEdge (mall) — 250,000 THB/mo

These feed into `similar_research` for similar-sized products and provide social proof.

### **Priority 3: Expert Guides** (Week 2)
- [ ] "How to choose inverter for industrial object" (template `industrial-inverter-guide`)
- [ ] "PEA/MEA permitting: timeline and pitfalls"
- [ ] "Battery backup sizing for Thai climate"
- [ ] "Warranty comparison: Huawei vs SolarEdge vs GoodWe — who delivers?"
- [ ] "Zero Export: why it matters and how to configure"

### **Priority 4: Comparison Articles** (Week 3)
- [ ] Brand comparison using actual spec data from `solar_products`
- [ ] "Huawei vs SolarEdge: 10-point comparison"
- [ ] "GoodWe vs Huawei: which for 100kW industrial?"
- [ ] "Jinko panels vs LONGi: durability test results"

### **Priority 5: Localization** (After content volume reaches 70+)
- [ ] Translate top 10 most-viewed articles to Thai (use DeepL + native review)
- [ ] Translate seller scripts to Thai (Fragment 2 extension)
- [ ] Create Thai-specific case studies from local customers

---

## 📈 Validation: Does Enriched Data Improve?

After adding new knowledge entries, run:

```sql
-- Check if new research appears in enriched view
SELECT
  id, name,
  json_array_length(direct_research) as direct,
  json_array_length(similar_research) as similar,
  brand_mentions
FROM enriched_solar_products
ORDER BY json_array_length(similar_research) DESC
LIMIT 5;
```

Products should now have more `similar_research` entries with relevant case studies.

Also test the API:
```bash
curl http://localhost:3000/api/seller-scripts/huawei-100kw-inverter | jq '.scripts[] | {type, keyPoints}'
```

Expected: `keyPoints` arrays contain more specific, data-backed arguments from real case studies (like "90,000 THB/month savings in Chonburi factory").

---

## ✅ Checklist for Fragment 3

- [ ] Created `src/lib/knowledge/article-templates.ts` with at least 3 templates
- [ ] Added 5 manual case studies via SQL (realistic Thai data)
- [ ] Optional: Deployed LLM-based article generation Edge Function (`generate-article`)
- [ ] Created `knowledge` entries for all products missing them (total product-related entries = 36)
- [ ] Verified enriched view shows at least 3 `similar_research` items for most products
- [ ] Tested API response includes richer content after knowledge expansion

---

## 🔜 Next: Fragment 4 — Recommendation Engine

With a solid knowledge base, we now build the **vector search API** that can:
- Accept natural language queries ("what for factory 100kW?")
- Return top-matching products via `solar_products.embedding`
- Return top-matching expertise articles via `knowledge.embedding`
- Combine into a single recommendation

This enables the LINE bot to answer open-ended questions intelligently.
