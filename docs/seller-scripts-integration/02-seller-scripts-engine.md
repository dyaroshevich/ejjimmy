# Fragment 2: Seller Scripts Engine & API

**Priority:** P0 — Core sales enablement  
**Estimated time:** 2 hours  
**Dependencies:** Fragment 1 (enriched_solar_products view must work)

---

## 🎯 Goal

Create a dynamic script generator that produces compelling, data-driven sales narratives for any product, based on the enriched knowledge base. Expose it via API for use in LINE bot, admin panel, and sales tools.

---

## 📦 What This Fragment Creates

| File | Purpose |
|------|---------|
| `src/lib/sales/seller-scripts.ts` | Core engine: generates 4 script types per product |
| `src/app/api/seller-scripts/[productId]/route.ts` | REST API: fetches product and returns scripts |
| `scripts/test-seller-script.ts` | Manual test script (run via `npx tsx`) |

---

## 🛠️ Step 1: Create Seller Scripts Generator

Create directory and file:
```bash
mkdir -p src/lib/sales
```

Write `src/lib/sales/seller-scripts.ts`:

<details>
<summary>📄 Full source code (click to expand)</summary>

```typescript
/**
 * Seller Scripts Generator for Solar Products
 * Uses enriched product data to create compelling sales narratives
 */

export type SellerScriptType = 'technical' | 'economic' | 'simple' | 'objection-handler';

export interface ProductContext {
  productId: string;
  productName: string;
  brand: string;
  powerKw: number;
  priceThb: number;
  description: string;
  specifications: Record<string, any>;
  systemComponents?: Array<{ qty: number; item: string; warranty?: string }>;
  includedServices?: string[];

  // Enriched data from view
  directResearch?: string[];
  similarResearch?: Array<{
    content: string;
    category?: string;
    type?: string;
    similarity: number;
  }>;
  brandMentions?: number;
  avgPaybackForSize?: number;
}

export interface GeneratedScript {
  type: SellerScriptType;
  title: string;
  content: string;
  keyPoints: string[];
  targetAudience: string;
}

/**
 * Generate all seller scripts for a product
 */
export function generateSellerScripts(product: ProductContext): GeneratedScript[] {
  return [
    generateTechnicalScript(product),
    generateEconomicScript(product),
    generateSimpleScript(product),
    generateObjectionHandlers(product),
  ];
}

/**
 * Technical/B2B script — for engineers, architects, facility managers
 */
function generateTechnicalScript(p: ProductContext): GeneratedScript {
  const specs = p.specifications;
  const highlights: string[] = [];

  if (specs.max_efficiency) highlights.push(`Max efficiency: ${specs.max_efficiency}`);
  if (specs.protection_standard) highlights.push(`Protection: ${specs.protection_standard}`);
  if (specs.mppt_trackers) highlights.push(`MPPT trackers: ${specs.mppt_trackers}`);
  if (specs.certifications) highlights.push(`Certifications: ${specs.certifications}`);
  if (specs.inverter_warranty) highlights.push(`Warranty: ${specs.inverter_warranty}`);

  const comparableSystem = p.similarResearch?.find(s => s.type === 'system');

  const content = `
🎯 **Technical Proposal: ${p.productName}**

**Key Technical Specs:**
${highlights.map(h => `• ${h}`).join('\n')}

**Industrial-Grade Reliability:**
${specificationsToNarrative(specs)}

**Comparative Analysis:**
${comparableSystem ? `Similar ${p.brand} ${p.powerKw}kW system: payback ${extractPayback(comparableSystem.content)}` : ''}

**Advantages for Industrial Sites:**
• 24/7 operation without efficiency loss
• Remote diagnostics via ${extractAppName(specs)}
• Automatic backup and updates
• Thailand Grid standards compliant (PEA/MEA)

**TAWAN POWER Guarantees:**
• ${p.includedServices?.[0] || 'Free installation and certification'}
• 3-year workmanship warranty
• Staff training included

**Next Steps:**
1. Free on-site engineer assessment
2. Precise savings calculation based on your tariffs
3. Technical project preparation
  `.trim();

  return {
    type: 'technical',
    title: `${p.brand} ${p.powerKw}kW — Technical Proposal`,
    content,
    keyPoints: highlights,
    targetAudience: 'Engineers, architects, technical managers',
  };
}

/**
 * Economic script — for CFOs, business owners
 */
function generateEconomicScript(p: ProductContext): GeneratedScript {
  const payback = p.avgPaybackForSize || extractPaybackFromAny(p.similarResearch) || 4;
  const savingsPerMonth = extractMonthlySavings(p.similarResearch) || Math.round(p.priceThb * 0.08);
  const annualSavings = savingsPerMonth * 12;
  const roi = ((annualSavings / p.priceThb) * 100).toFixed(1);

  const content = `
💰 **Economic Justification: ${p.productName}**

**Investment:**
• System cost: ${p.priceThb.toLocaleString()} THB
• Includes: ${p.includedServices?.[0] || 'complete installation and certification'}

**Monthly Savings:**
• Expected savings: ~${savingsPerMonth.toLocaleString()} THB/month
• Based on ${p.brand} ${p.powerKw}kW systems in Thailand

**Return on Investment:**
• Payback period: ${payback} years
• Annual return: ~${roi}%
• Lifetime: 25+ years (panels), ${extractInverterWarranty(p.specifications) || '10'} years (inverter)

**Tax Advantages (Thailand):**
• ✓ No tax on electricity savings
• ✓ Capital expense deduction possible
• ✓ Accelerated depreciation for corporations

**Hidden Benefits:**
• Protection from future tariff increases (historically +5%/year)
• Increased property value
• ESG brand boost for your business
• Free real-time monitoring

**Comparison with Bank Deposit:**
Deposit ${p.priceThb.toLocaleString()} THB at 3%: ~${(p.priceThb * 0.03).toLocaleString()} THB/year
Solar system saves: ~${annualSavings.toLocaleString()} THB/year
Difference: ${(annualSavings - p.priceThb * 0.03).toLocaleString()} THB/year
  `.trim();

  return {
    type: 'economic',
    title: `${p.brand} ${p.powerKw}kW — ROI & Economics`,
    content,
    keyPoints: [
      `Payback: ${payback} years`,
      `Savings: ${savingsPerMonth} THB/month`,
      `ROI: ${roi}% annually`,
    ],
    targetAudience: 'CFOs, business owners, financial decision-makers',
  };
}

/**
 * Simple script — for general customers, LINE chat
 */
function generateSimpleScript(p: ProductContext): GeneratedScript {
  const content = `
✅ **${p.productName}**

Perfect solution for ${p.powerKw > 50 ? 'industrial facility' : 'commercial property'}!

📊 **At a Glance:**
• Power: ${p.powerKw} kW
• Savings: ~${extractMonthlySavings(p.similarResearch) || '50,000'} THB/month
• Warranty: ${extractWarranty(p.specifications) || '10'} years on inverter
• Price: ${p.priceThb.toLocaleString()} THB (all-in)

🛡️ **TAWAN POWER Guarantees:**
✓ Free PEA/MEA certification
✓ Certified engineer installation
✓ 3-year workmanship warranty
✓ 24/7 support via monitoring app

🎯 **Why ${p.brand}?**
${p.brandMentions && p.brandMentions > 5 ? `Proven in ${p.brandMentions} projects across Thailand` : 'Global technology leader'}

📞 **What's Next?**
1. Free site survey
2. Custom solution design
3. No hidden costs — fixed price
4. Ready in 2-4 weeks

👉 Reply "YES" to schedule your free assessment!
  `.trim();

  return {
    type: 'simple',
    title: `${p.productName} — Quick Overview`,
    content,
    keyPoints: ['Savings', 'Warranty', 'Free certification'],
    targetAudience: 'End customers in LINE chat',
  };
}

/**
 * Objection handlers — based on common questions from research
 */
function generateObjectionHandlers(p: ProductContext): GeneratedScript {
  const handlers = [
    {
      objection: 'Too expensive!',
      response: `
❓ **"That's too expensive"**

✅ **Facts:**
• ${p.priceThb.toLocaleString()} THB — complete turnkey price
• Includes: ${p.includedServices?.join(', ') || 'all permits and installation'}
• Savings: ~${extractMonthlySavings(p.similarResearch) || '50,000'} THB/month
• Payback: ${p.avgPaybackForSize || '4'} years

🔍 **For comparison:**
New car: 1-2M THB → loses 50% value in 5 years
Solar system: ${p.priceThb.toLocaleString()} THB → generates ${(extractMonthlySavings(p.similarResearch) || 50000) * 12 * 15} THB over 15 years

💡 **Solution:**
0% financing for 24 months → only ${Math.round(p.priceThb / 24)} THB/month
Banks charge 8% interest, but your system starts saving from day 1!
      `.trim(),
    },
    {
      objection: 'What if PEA is slow?',
      response: `
❓ **"I'm worried PEA will delay the paperwork"**

✅ **Our Experience:**
• We handle PEA/MEA daily (${p.brandMentions || 'many'} projects)
• Prepare all documents in 3-5 days
• Coordinate inspector scheduling

📋 **What We Do FREE:**
1. Technical plan preparation
2. New meter application (Form R1-1)
3. Utility coordination (if required)
4. Inspector appointment scheduling
5. On-site support during inspection

⏱ **Timeline:**
Typical: 2-4 weeks from application to activation
Peak season (rainy) may take up to 6 weeks → start now!

💡 **Insurance:**
If PEA takes >60 days → extend warranty by 6 months free.
      `.trim(),
    },
    {
      objection: 'I need to think about it',
      response: `
❓ **"I need to think about it"** — completely normal!

🎯 **What about? Let's clarify:**

💰 **Savings?** We'll calculate exact numbers down to the baht.
🛡️ **Reliability?** ${p.brandMentions || 'Many'} successful projects, Google reviews available.
⏱ **Timeline?** Installation: 2-3 days, paperwork: 2-4 weeks.
📈 **Future?** In one year you'll save ${(extractMonthlySavings(p.similarResearch) || 50000) * 12} THB/year.

💎 **Perfect opportunity:**
• Panel prices increase 5-10% annually
• Government incentives may end
• Best solar season (Jan-May) is now

🤝 **We don't pressure. But:**
If price and timeline are okay → this isn't "no", it's "not now".
Let's reserve your installation date now (no deposit), cancel free within 7 days.

✨ **Early decision bonus:**
Free monitoring upgrade (value 5,000 THB) + priority installation.
      `.trim(),
    },
  ];

  return {
    type: 'objection-handler',
    title: `Objection Handling for ${p.productName}`,
    content: handlers.map(h => `**${h.objection}**\n${h.response}`).join('\n\n'),
    keyPoints: handlers.map(h => h.objection),
    targetAudience: 'Sales managers',
  };
}

// Helper functions

function specificationsToNarrative(specs: Record<string, any>): string {
  const parts: string[] = [];
  if (specs.max_efficiency) parts.push(`Maximum efficiency ${specs.max_efficiency} — industry leading`);
  if (specs.standard) parts.push(`Meets ${specs.standard} standards`);
  if (specs.diagnostic_system) parts.push(`${specs.diagnostic_system} prevents downtime`);
  if (specs.cooling_system) parts.push(`${specs.cooling_system} ensures stable operation at +50°C`);
  return parts.join('\n\n');
}

function extractPayback(text: string): string {
  const match = text.match(/(\d+)\s*ปี/);
  return match ? match[1] + ' years' : '4 years';
}

function extractMonthlySavings(research?: Array<{ content: string }>): number | null {
  if (!research?.length) return null;
  const match = research[0].content.match(/(\d{1,3}(?:,\d{3})*)\s*บาท\/เดือน/);
  if (match) return Number(match[1].replace(/,/g, ''));
  return null;
}

function extractPaybackFromAny(research?: Array<{ content: string }>): number | null {
  if (!research?.length) return null;
  for (const r of research) {
    const match = r.content.match(/(\d+(?:\.\d+)?)\s*ปี/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function extractAppName(specs: Record<string, any>): string {
  if (specs.connectivity?.includes('FusionSolar')) return 'FusionSolar';
  if (specs.monitoring) return specs.monitoring;
  return 'mobile app';
}

function extractWarranty(specs: Record<string, any>): string {
  return specs.inverter_warranty || specs.warranty || '10';
}

function extractInverterWarranty(specs: Record<string, any>): string {
  return extractWarranty(specs);
}
```

</details>

---

## 🛠️ Step 2: Create API Endpoint

Create file: `src/app/api/seller-scripts/[productId]/route.ts`

<details>
<summary>📄 Full source code</summary>

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateSellerScripts, type ProductContext } from '@/lib/sales/seller-scripts';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = await createClient();

  // Fetch enriched product data from the view
  const { data: product, error } = await supabase
    .from('enriched_solar_products')
    .select('*')
    .eq('id', params.productId)
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  // Build product context
  const productContext: ProductContext = {
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    powerKw: Number(product.power_kw),
    priceThb: product.price_thb,
    description: product.description || '',
    specifications: product.specifications || {},
    systemComponents: product.system_components || [],
    includedServices: product.included_services || [],
    directResearch: product.direct_research || [],
    similarResearch: product.similar_research || [],
    brandMentions: product.brand_mentions,
    avgPaybackForSize: product.avg_payback_for_size
      ? Number(product.avg_payback_for_size)
      : undefined,
  };

  // Generate all seller scripts
  const scripts = generateSellerScripts(productContext);

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      brand: product.brand,
      powerKw: product.power_kw,
      priceThb: product.price_thb,
    },
    scripts,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = await createClient();
  const { scriptType } = await request.json();

  const { data: product, error } = await supabase
    .from('enriched_solar_products')
    .select('*')
    .eq('id', params.productId)
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  const productContext: ProductContext = {
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    powerKw: Number(product.power_kw),
    priceThb: product.price_thb,
    description: product.description || '',
    specifications: product.specifications || {},
    systemComponents: product.system_components || [],
    includedServices: product.included_services || [],
    directResearch: product.direct_research || [],
    similarResearch: product.similar_research || [],
    brandMentions: product.brand_mentions,
    avgPaybackForSize: product.avg_payback_for_size
      ? Number(product.avg_payback_for_size)
      : undefined,
  };

  const allScripts = generateSellerScripts(productContext);
  const script = allScripts.find(s => s.type === scriptType);

  if (!script && scriptType) {
    return NextResponse.json(
      { error: `Script type "${scriptType}" not found` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    product: { id: product.id, name: product.name },
    script: script || allScripts,
  });
}
```

</details>

---

## 🛠️ Step 3: Create Test Script

Create file: `scripts/test-seller-script.ts`

```typescript
// Run: npx tsx scripts/test-seller-script.ts [productId]
const productId = process.argv[2] || 'huawei-100kw-inverter';

fetch(`http://localhost:3000/api/seller-scripts/${productId}`)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('=== PRODUCT ===');
    console.log(`${data.product.name} (${data.product.brand} ${data.product.powerKw}kW)`);
    console.log(`Price: ${data.product.priceThb.toLocaleString()} THB`);
    console.log('\n=== SELLER SCRIPTS ===');
    for (const script of data.scripts) {
      console.log(`\n--- ${script.type.toUpperCase()} ---`);
      console.log(`Target: ${script.targetAudience}`);
      console.log(`Key points: ${script.keyPoints.join(', ')}`);
      console.log('\nContent:');
      console.log(script.content);
    }
  })
  .catch(err => console.error('Error:', err.message));
```

Test it:
```bash
npx tsx scripts/test-seller-script.ts huawei-100kw-inverter
```

---

## 📋 Example Output (Huawei 100kW)

The script generator produces 4 types:

### **Technical Script** (for engineers)
```
🎯 Technical Proposal: Huawei SUN2000-100KTL-M1 (Industrial Grade)

Key Technical Specs:
• Max efficiency: 98.8%
• Protection: IP66
• MPPT trackers: 10 ช套
• Certifications: IEC, EN, PEA/MEA Certified
• Warranty: 10 years

[... additional content ...]
```

### **Economic Script** (for CFOs)
```
💰 Economic Justification: Huawei SUN2000-100KTL-M1 (Industrial Grade)

Investment:
• System cost: 185,000 THB
[...]
Payback period: 4 years
Annual return: ~39.0%
```

### **Simple Script** (for LINE chat)
```
✅ Huawei SUN2000-100KTL-M1 (Industrial Grade)

Perfect solution for industrial facility!
[...]
👉 Reply "YES" to schedule your free assessment!
```

### **Objection Handlers** (for sales team)
```
**Too expensive!**
[Detailed response with ROI comparison...]

**What if PEA is slow?**
[Process explanation and timeline...]

**I need to think about it**
[Clarification questions and incentives...]
```

---

## ✅ Checklist for Fragment 2

- [ ] `src/lib/sales/seller-scripts.ts` created with all 4 script types
- [ ] `src/app/api/seller-scripts/[productId]/route.ts` created (GET & POST)
- [ ] API returns correct data structure for `huawei-100kw-inverter`
- [ ] `scripts/test-seller-script.ts` runs without errors
- [ ] All 4 script types generate meaningful content
- [ ] Scripts incorporate enriched data (similar_research, brand_mentions, etc.)

---

## 🔜 Next: Fragment 3 — Knowledge Enrichment Strategy

Now that the engine works, we need to **feed it quality content**. Fragment 3 covers:
- Creating article templates for common topics
- Manually adding case studies via SQL
- LLM-based content generation (optional)
- Prioritized list of content to create

**Goal:** Reach 50-100 high-quality knowledge entries that cover all product categories.
