# 💰 Tawan Power: Financial Model & Unit Economics

**Document Type:** Financial Planning & Business Intelligence  
**Version:** 1.0  
**Date:** 2026-05-15  
**Project:** Solar Krabi AI Advisor → Tawan Power  
**Owner:** Founder / Finance  
**Status:** Initial assumptions, populate with real data as available

---

## 🎯 Executive Summary

This financial model answers the question: **"Can this business make money?"**

It answers:
- How much does it cost to acquire a customer (CAC)?
- How much revenue does a customer generate (LTV)?
- Is LTV > 3× CAC? (required for sustainable growth)
- How many leads do we need to break even?
- What are the key metrics to track weekly?

**Assumptions as of today:** Many are estimates. Update monthly with real data.

---

## 📊 SECTION A: Unit Economics Calculator

### Heart of the Business

Unit economics tells you if **one customer** is profitable. Simple formula:

```
Profit per customer = Revenue per customer - Cost per customer
```

If negative → you lose money on each customer → need VC funding forever.  
If positive → you can reinvest profits to grow.

---

### Key Metrics Table

| Metric | Formula | Current (Est) | Target | Source / Notes |
|--------|---------|---------------|--------|----------------|
| **1. CAC (Customer Acquisition Cost)** | Ad spend / # new customers | ฿~2,000 | < ฿3,000 | Google/FB ads + organic mix |
| **2. Cost per Lead** | (Ad spend + ops) / # leads | ฿~500 | < ฿800 | Includes Groq, support time |
| **3. Lead → Consultation Rate** | Consultations / leads | 25% (realistic) | 30% | DB query: leads with contact |
| **4. Consultation → Installation Rate** | Installations / consultations | 15% (realistic) | 20% | CRM/feedbacks from engineers |
| **5. Average Deal Size** | Sum(contract) / # installs | ฿500,000 | ฿500,000 | Typical residential 5-10kW |
| **6. Commission Rate** | Our fee / deal size | 10% | 10-15% | Agreement with installers |
| **7. Revenue per Installation** | Deal size × commission | ฿50,000 | ฿50,000 | 10% of ฿500k |
| **8. LTV (Lifetime Value)** | Revenue per install × retention | ฿50,000 | ฿75,000 | Assuming 20% repeat/referral |
| **9. LTV:CAC Ratio** | LTV / CAC | ~25x (est) | > 3x | Benchmark: healthy > 3x |

---

### Unit Economics Calculator (Google Sheets)

**Create a Google Sheet with this structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ TAWAN POWER FINANCIAL MODEL (v1.0) - Thailand Market      │
├─────────────────────────────────────────────────────────────┤
│ INPUTS (change these monthly)                             │
│  • Ad spend (฿)                     15,000                 │
│  • Leads generated                  30                     │
│  • Lead→Consultation rate (%)      25%                   │
│  • Consult→Install rate (%)        15%                   │
│  • Avg deal size (฿)               500,000                │
│  • Commission (%)                  10%                    │
│  • Retention multiplier            1.0                    │
├─────────────────────────────────────────────────────────────┤
│ CALCULATIONS (auto)                                       │
│  Cost per lead = Ad Spend / Leads                 ฿500.00   │
│  Consultations = Leads × CR1                       7.5       │
│  Installations = Consultations × CR2               1.125     │
│  Revenue per install = Deal × Commission         ฿50,000   │
│  Total revenue = Installations × Rev/install    ฿56,250   │
│  CAC = Ad Spend / Installations               ฿13,333   │
│  LTV = Rev/install × Retention                ฿50,000    │
│  LTV:CAC = LTV / CAC                              3.75     │
├─────────────────────────────────────────────────────────────┤
│ ASSESSMENT                                                │
│  ✅ LTV > 3× CAC (healthy)                                │
│  ⚠️  CAC could be lower with organic traffic             │
│  ⚠️  Verify rates with real data                          │
└─────────────────────────────────────────────────────────────┘
```

**Action:** Create this sheet. Update monthly.

---

### Sensitivity Analysis (What-if Scenarios)

Test how changes affect unit economics (using realistic Thai market numbers):

| Scenario | Lead→Consult | Consult→Install | Overall Conv | Avg Deal | Commission | Result: LTV:CAC |
|----------|--------------|-----------------|--------------|----------|------------|-----------------|
| **Optimistic** | 35% | 20% | 7.0% | ฿600k | 10% | 12.5x ✅ |
| **Base case** | 25% | 15% | 3.75% | ฿500k | 10% | 3.75x ✅ |
| **Pessimistic** | 20% | 10% | 2.0% | ฿400k | 10% | 1.6x ❌ |
| **Very pessimistic** | 15% | 5% | 0.75% | ฿350k | 10% | 0.58x ❌ |

**Interpretation:**
- Base case (25%/15%) with CAC ฿13,333 → LTV:CAC ≈ 3.75 (just above the healthy threshold)
- To improve unit economics:
  - Increase conversion rates (improve chat → more consultations, better handoff → more installations)
  - Attract higher-value customers (commercial deals >฿1M)
  - Reduce CAC (focus on organic SEO, reduce ad dependency)

**What to track monthly:** Overall conversion (lead → install). If < 3%, investigate conversion funnel.

---

### Realistic Thai Market Benchmarks

| Metric | Conservative | Realistic | Aggressive |
|--------|--------------|-----------|------------|
| **Lead→Consult** | 15-20% | 25% | 30-35% |
| **Consult→Install** | 10-12% | 15% | 18-20% |
| **Overall (Lead→Install)** | 1.5-2.4% | 3.75% | 5.4-7% |
| **Cost per Lead** | ฿300-500 | ฿500 | ฿500-800 |
| **CAC** | ฿15,000-25,000 | ฿13,000 | ฿8,000-10,000 |
| **Avg Deal Size** | ฿300-400k | ฿500k | ฿600-800k |
| **Commission Rate** | 8-10% | 10% | 12-15% |

---

## 📈 SECTION B: 12-Month Revenue Projections

### Base Case Scenario (Expected - Thailand Market)

Realistic growth for Tawan Power first year with content SEO + moderate ads:

| Month | Leads | Consultations (25%) | Installations (15% of cons) | Revenue (฿) | Cumulative (฿) | Comments |
|-------|-------|---------------------|-----------------------------|-------------|----------------|----------|
| 1 | 10 | 2.5 | 0.4 | 20,000 | 20,000 | Soft launch, low traffic |
| 2 | 12 | 3.0 | 0.5 | 22,500 | 42,500 | Learning curve |
| 3 | 15 | 3.75 | 0.6 | 28,125 | 70,625 | First installation |
| 4 | 20 | 5.0 | 0.75 | 37,500 | 108,125 | First repeat referral |
| 5 | 25 | 6.25 | 0.9 | 46,875 | 155,000 | Content SEO kicking in |
| 6 | 30 | 7.5 | 1.1 | 56,250 | 211,250 | Process refined |
| 7 | 40 | 10.0 | 1.5 | 75,000 | 286,250 | More content published |
| 8 | 50 | 12.5 | 1.9 | 93,750 | 380,000 | Season uplift |
| 9 | 60 | 15.0 | 2.3 | 112,500 | 492,500 | Marketing budget ↑ |
| 10 | 80 | 20.0 | 3.0 | 150,000 | 642,500 | Commercial leads ↑ |
| 11 | 100 | 25.0 | 3.8 | 187,500 | 830,000 | Year-end rush |
| 12 | 120 | 30.0 | 4.5 | 225,000 | 1,055,000 | Year end |

**End of year:** ฿1.055M revenue, **~21 installations**, 120 leads/month average

**Note:** These numbers assume 25% lead→consult and 15% consult→install conversion rates, which are realistic for the Thai market with good UX and follow-up. Actual may be lower initially, improving with process optimization.

---

### Conservative Scenario (Slower growth)

If SEO takes longer, ads expensive, conversions lower:

| Month | Leads | Installations | Revenue (Monthly) | Cumulative |
|-------|-------|---------------|-------------------|------------|
| 1-3 | 5-8/mo | 0-0.3/mo | ~฿5-10k/mo | ~฿20k |
| 4-6 | 10-12/mo | 0.3-0.5/mo | ~฿15k/mo | ~฿65k |
| 7-9 | 15-20/mo | 0.5-0.8/mo | ~฿25k/mo | ~฿140k |
| 10-12 | 20-25/mo | 0.8-1.0/mo | ~฿35k/mo | ~฿245k |

**End of year:** ฿245k revenue, ~5-8 installations

**When this happens:** Ads underfunded, SEO content too thin, poor chat conversion.

---

### Aggressive Scenario (Strong SEO + Word of Mouth)

If content ranks well, AI quality high, strong partnerships:

| Month | Leads | Installations | Revenue (Monthly) | Cumulative |
|-------|-------|---------------|-------------------|------------|
| 1-3 | 20-30/mo | 1-2/mo | ~฿50-100k/mo | ~฿150-250k |
| 4-6 | 40-60/mo | 2-4/mo | ~฿150k/mo | ~฿600k |
| 7-9 | 80-120/mo | 4-7/mo | ~฿250k/mo | ~฿1.45M |
| 10-12 | 150-200/mo | 7-12/mo | ~฿400k/mo | ~฿2.85M |

**End of year:** ฿2.5-3M revenue, 40-60 installations

**When this happens:** Strong SEO (top 3 for key Thai keywords), viral content, excellent reviews, repeat customers.

---

### Conservative Scenario (Slower growth)

If SEO takes longer, ad costs higher, conversions lower:

| Month | Leads | Installations | Revenue (Monthly) | Cumulative |
|-------|-------|---------------|-------------------|------------|
| 1-3 | ~15/mo | ~0.5/mo | ~฿25k/mo | ~฿75k |
| 4-6 | ~25/mo | ~1/mo | ~฿50k/mo | ~฿225k |
| 7-9 | ~40/mo | ~1.5/mo | ~฿75k/mo | ~฿450k |
| 10-12 | ~60/mo | ~2/mo | ~฿100k/mo | ~฿750k |

**End of year:** ฿750k revenue, ~24 installations

---

### Aggressive Scenario (Viral/SEO)

If AI chatbot goes viral, strong SEO, high-quality inbound:

| Month | Leads | Installations | Revenue (Monthly) | Cumulative |
|-------|-------|---------------|-------------------|------------|
| 1-3 | ~50/mo | ~3/mo | ~฿150k/mo | ~฿450k |
| 4-6 | ~100/mo | ~6/mo | ~฿300k/mo | ~฿1.35M |
| 7-9 | ~150/mo | ~10/mo | ~฿500k/mo | ~฿2.8M |
| 10-12 | ~250/mo | ~15/mo | ~฿750k/mo | ~฿5.05M |

**End of year:** ฿5M+ revenue, ~100+ installations

---

### Scenario Comparison Chart

```
Revenue (฿M)
  5 |                          ● Aggressive
    |                    ●
  4 |                 ●
    |              ●
  3 |           ●      ● Base
    |        ●
  2 |     ●
    |  ●
  1 |●
    |_______________________________
    1  2  3  4  5  6  7  8  9  10 11 12
```

---

## 💵 SECTION C: Cost Structure

### Fixed Costs (Monthly)

These costs **do not change** with number of leads.

| Item | Estimated Cost (฿) | Notes |
|------|--------------------|-------|
| **Vercel Pro** | ฿600 | ~$20/mo for Pro plan, maybe need Enterprise? |
| **Supabase Pro** | ฿1,500 | ~$50/mo for 10GB, Realtime |
| **Domain + SSL** | ฿200 | Annual ~฿2,400 → ฿200/mo |
| **Analytics** | ฿0-500 | PostHog self-hosted = ฿0; SaaS = ฿500 |
| **Groq API** | Variable | ~฿1,000/mo for 10M tokens (estimate) |
| **Gemini API** | Variable | Only on fallback, ~฿200/mo |
| **Emergency fund** | ฿2,000 | Buffer for unexpected |
| **Total Fixed** | **฿4,800 - ฿5,800** | |

---

### Variable Costs (Per Lead/Installation)

These scale with volume.

| Item | Cost Per Unit | Estimated Monthly (at 200 leads) |
|------|---------------|---------------------------------|
| **LINE Messaging API** | ฿0.50 - ฿1.50/msg | ฿500 (1000 messages/mo) |
| **Support staff** | ฿10,000-20,000/mo per person | ฿20,000 (1 part-time) |
| **Groq API (per chat)** | ~฿5-10/chat | ฿1,000 (200 chats) |
| **Payment processing** | 2-3% of commission payouts | ฿1,000 (if paying partners) |
| **Marketing (ads)** | variable (CAC driver) | ฿100,000+ (depends on growth) |
| **Total Variable** | | **฿122,500** (with ads) |
| | | **฿22,500** (no ads, organic only) |

---

### Total Monthly Cost Scenarios

| Scenario | Fixed | Variable (excl. ads) | Ads | Total |
|----------|-------|---------------------|-----|-------|
| **Lean (organic growth)** | ฿5,500 | ฿22,500 | ฿0 | **฿28,000** |
| **Growing (light ads)** | ฿5,500 | ฿22,500 | ฿50,000 | **฿78,000** |
| **Scaling (aggressive ads)** | ฿5,500 | ฿22,500 | ฿200,000 | **฿228,000** |

**Breakeven point:**
- Lean: Need ฿28k/month revenue → ~6 installations/month (at ฿50k/inst)
- Growing: Need ฿78k/month → ~16 installations/month
- Scaling: Need ฿228k/month → ~46 installations/month

---

## 🏷️ SECTION D: Pricing & Commission Strategy

### Monetization Models (Prioritized)

#### Model 1: Commission on Installation (CURRENT)
**How it works:**
- Tawan Power provides free consultation → lead → installation partner (supplier/installer)
- Partner pays commission: **10-15%** of contract value
- Payment: 30 days after client pays partner

**Pros:**
- Client pays nothing → no friction
- Partner gets qualified lead (good for them)
- Aligns incentives: we only make money when deal closes

**Cons:**
- Delayed revenue (30-60 days after lead)
- Dependency on partner reliability
- Revenue share, not full price

**Optimization:**
- Tiered commission: 10% for <฿300k deals, 15% for >฿1M deals
- Bonuses: +฿5,000 for commercial projects
- Minimum commission: ฿5,000 (if small deal)

---

#### Model 2: Premium AI Features (Future - Phase 3)
**How it works:**
- Free: basic consultation, estimate
- Premium: ฿500/month or ฿2,000/one-time detailed technical report

**Premium features:**
- Detailed equipment layout (panel placement diagram)
- Shadow analysis
- ROI calculator with custom parameters
- Export to PDF (Proposal)
- Priority support (24h response)

**Pros:** User pays directly, no partner dependency  
**Cons:** May reduce lead volume (paywall), need more advanced AI

**Target:** 5% conversion from free to premium

---

#### Model 3: B2B White-Label (Future - Phase 4)
**How它 works:**
- Sell chatbot platform to other solar installers in Thailand
- Price: ฿5,000-฿20,000/month depending on features
- Include: Custom branding, dedicated instances, analytics

**Pros:** Recurring revenue, scalable, B2B margins higher  
**Cons:** Enterprise sales, longer cycles

**Target:** 10-20 B2B customers in Year 2

---

### Pricing Tiers Recommendation

| Service | Price | Who pays? | When to launch |
|---------|-------|-----------|----------------|
| **Free consultation** | ฿0 | Client | Now |
| **Property survey (in-person)** | ฿5,000 (waivable) | Client | If direct sales |
| **Detailed technical report** | ฿2,000 | Client | Phase 3 |
| **Premium subscription** | ฿500/mo | Client | Phase 3 |
| **White-label platform** | ฿10,000/mo | Installer | Phase 4 |

---

## 📈 SECTION E: Key Metrics Dashboard

### Metrics to Track Daily/Weekly/Monthly

Create a dashboard (Metabase, Superset, or custom Next.js page) showing:

#### Acquisition Metrics

| Metric | Target | Frequency | How to calculate |
|--------|--------|-----------|-------------------|
| **Daily Active Users (chat)** | >20 | Daily | COUNT(DISTINCT session_id) WHERE date = today |
| **Leads per day** | 2-3 | Daily | COUNT(*) FROM leads WHERE DATE(created_at) = today |
| **Lead → Contact Rate** | >30% | Weekly | COUNT(leads with phone/LINE filled) / total leads |
| **CAC** | <฿5,000 | Monthly | ad_spend_last_month / leads_last_month |

**Dashboard query example:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as leads,
  COUNT(CASE WHEN phone IS NOT NULL OR line_id IS NOT NULL THEN 1 END) as contacts
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### Conversion Metrics

| Metric | Target | Frequency | Formula |
|--------|--------|-----------|---------|
| **Chat start → Lead capture** | 10% | Weekly | leads / sessions |
| **Lead → Consultation booked** | 30% | Weekly | consultations / leads |
| **Consultation → Install** | 20% | Monthly | installs / consultations |
| **Overall: Session → Install** | 0.6% | Monthly | installs / sessions |

**Example:** 1000 chat sessions → 100 leads → 30 consultations → 6 installations = **0.6% end-to-end**

#### Revenue Metrics

| Metric | Target | Frequency | How to calculate |
|--------|--------|-----------|-------------------|
| **Monthly Recurring Revenue (MRR)** | N/A (commission) | Monthly | SUM(commission_amount) for last 30 days |
| **Average Revenue per Installation** | ฿50,000 | Monthly | total_commission / # installs |
| **Lead value** | ฿1,000-2,000 | Monthly | revenue / # leads |
| **Revenue forecast (next 3mo)** | +15% MoM | Monthly | trend from last 3 months |

#### Product Metrics

| Metric | Target | Why it matters |
|--------|--------|----------------|
| **AI TTFT (Time to First Token)** | <200ms | User experience, engagement |
| **Chat error rate** | <1% | Reliability |
| **Messages per chat** | 10-15 | Engagement depth |
| **Session duration** | 5-10 min | Quality of interaction |
| **Fallback rate (Groq→Gemini)** | <5% | API reliability |

#### Financial Health

| Metric | Target (Green) | Yellow | Red |
|--------|----------------|--------|-----|
| **LTV:CAC** | >3 | 2-3 | <2 |
| **Cash runway** | >6 months | 3-6 | <3 |
| **Burn rate** | <฿50k/mo | 50-100k | >฿100k/mo |
| **Gross margin** | >80% | 60-80% | <60% |

---

### Dashboard Implementation

**Option 1: Metabase (recommended)**
1. Deploy Metabase on Vercel (free tier? Or Fly.io ฿300/mo)
2. Connect to Supabase
3. Build queries for each metric
4. Share dashboard with team

**Option 2: Custom Next.js Dashboard**
1. Create `/admin/metrics` page
2. Query Supabase directly from server component
3. Display with charts (recharts, chart.js)

**Sample code:**
```ts
// app/admin/metrics/page.tsx
async function getMetrics() {
  const last30Days = DateTime.now().minus({ days: 30 });
  const leads = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', last30Days.toISO());

  const installations = await supabase
    .from('installations')
    .select('commission_amount')
    .gte('closed_at', last30Days.toISO());

  return {
    leadsCount: leads.data?.length || 0,
    installationsCount: installations.data?.length || 0,
    revenue: installations.data?.reduce((sum, i) => sum + i.commission_amount, 0),
  };
}
```

---

## 🧮 SECTION F: Building the Google Sheet Template

### Step-by-Step

1. **Open Google Sheets**: Create new spreadsheet → rename "Financial Model - Tawan Power"

2. **Create tabs:**
   - `Dashboard` (summary charts)
   - `Unit_Economics` (calculator)
   - `Monthly_Projections` (12-month forecast)
   - `Actual_vs_Plan` (track real data)
   - `Leads_Log` (raw data import)

3. **Dashboard tab:**
   -单元格 A1: "TAWAN POWER DASHBOARD" (large bold)
   - A3: "Current Month Metrics"
   - B3:C10: Key numbers (copy from Unit_Economics current month)
   - A12: "Trend Chart" → Insert chart (line) showing monthly revenue projected vs actual
   - A20: "Health Indicators" (LTV:CAC, Burn rate, Runway)

4. **Unit_Economics tab:**
   ```
   | A                  | B           | C           |
   |--------------------|-------------|-------------|
   | INPUTS             |             |             |
   | Ad spend           | 10,000      | (change monthly) |
   | Leads              | 30          |             |
   | Lead→Consult %     | 30%         |             |
   | Consult→Install %  | 20%         |             |
   | Avg deal size      | 500,000     |             |
   | Commission %       | 10%         |             |
   | Retention factor   | 1.0         |             |
   |--------------------|-------------|-------------|
   | CALCULATIONS       |             |             |
   | Cost/lead          | =B2/B3      | ฿333.33     |
   | Consultations      | =B3*B4      | 9           |
   | Installations      | =B6*B5      | 1.8         |
   | Rev/install        | =B6*B7      | ฿50,000     |
   | Total revenue      | =B8*B9      | ฿90,000     |
   | CAC                | =B2/B10     | ฿5,556      |
   | LTV                | =B9*B11     | ฿50,000     |
   | LTV:CAC            | =B13/B12    | 9.0         |
   ```

5. **Monthly_Projections tab:**
   - Columns: Month, Leads, Consultations, Installations, Revenue, Cumulative, Notes
   - Rows 1-13 for months Jan-Dec (or 1-12 from start)
   - Formulas:
     - Consultations = Leads × CR1 (copy CR1 from Unit_Economics!B4)
     - Installations = Consultations × CR2 (copy CR2 from Unit_Economics!B5)
     - Revenue = Installations × Rev/install (copy from Unit_Economics!B9)
     - Cumulative = previous cumulative + current revenue

6. **Actual_vs_Plan tab:**
   - Same columns as Monthly_Projections
   - Two rows per month: Plan (from projections) and Actual (manual entry)
   - Variance %: = (Actual - Plan) / Plan
   - Conditional formatting: Green if >0%, red if <0%

7. **Leads_Log tab:**
   - Raw data from DB export (Supabase → CSV → paste here)
   - Columns: lead_id, created_at, segment, bill_kwh, phone, line_id, status, contacted_date, installation_date, commission_amount
   - Use this for pivot tables and deeper analysis

---

## 📊 SECTION G: Key Business Questions Answered

### Q: How many leads do I need to break even?

**Answer depends on monthly costs:**

```
Breakeven installs = Monthly Costs / Revenue per installation

Example:
- Monthly costs = ฿28,000 (lean)
- Revenue per install = ฿50,000
- Breakeven installs = 28,000 / 50,000 = 0.56 installs/month

But CAC must be covered too:
- CAC = ฿5,000 per install
- To get 1 install at 20% conversion → need 5 leads → ad spend ฿5,000
- So total breakeven installs = (Fixed Costs + CAC) / Rev/install
  = (28,000 + 5,000) / 50,000 = 0.66 installs/month
```

**Conclusion:** Even 1 installation/month covers costs. Problem is **generating enough leads** to get those installs.

---

### Q: What's the maximum I can spend on ads?

**Rule:** CAC must be < LTV/3 to be sustainable.

```
If LTV = ฿50,000 → max CAC = ฿16,667

But also consider other costs:
- Ad spend / install = ฿16,667
- If conversion 20% (consult→install) and 30% (lead→consult):
  - Leads needed per install = 1 / (0.3 * 0.2) = 16.7 leads
  - Cost per lead max = 16,667 / 16.7 = ฿998 per lead

So: Max ad spend per lead = ~฿1,000

If you generate 200 leads/month → max ad budget = ฿200,000/month
```

---

### Q: How much revenue can I expect in Year 1?

**Base case (conservative):**
- Month 1-3 avg: ฿80k/mo
- Month 4-6 avg: ฿150k/mo
- Month 7-9 avg: ฿250k/mo
- Month 10-12 avg: ฿400k/mo
- **Year 1 total:** ~฿2.5M

**Optimistic:**
- Year 1 total: ~฿5-6M

---

### Q: When will I be profitable?

**Profit = Revenue - Costs**

Monthly:
```
Month 6:
  Revenue: ฿180,000
  Costs: ฿28,000 + ฿180,000 (ad spend at ฿1k/lead × 180 leads?) = ฿208,000
  Profit: -฿28,000 (still loss)

But wait: Ad spend is included in CAC. In unit economics we already included CAC.
  Revenue from 3.6 installs = ฿180,000
  Costs (fixed) = ฿28,000
  Gross profit = ฿152,000
  Then ad spend = ฿?? This is double-counting.

Correct approach:
  - Unit economics already accounts CAC (ad spend to acquire that customer)
  - So monthly profit = Revenue - Fixed Costs
  - Month 6: ฿180k - ฿28k = ฿152k profit

But this assumes ad spend is exactly CAC per install. In reality:
  - You pay ad spend UPFRONT for leads
  - You receive revenue LATER (30-60 days after installation)
  - Cash flow problem: you need cash to fund ads before revenue comes

Cash flow breakeven: need 30-60 days of cash buffer.
```

---

## 🚨 SECTION H: Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Conversion rates lower than expected** | High | Medium | A/B test chat flows; improve AI prompts; add human fallback |
| **Ad costs increase (competition)** | Medium | High | Diversify channels (SEO, referrals); focus on organic |
| **Partner default on commission** | Medium | Low | Contracts; upfront deposits; multiple partners |
| **Seasonality (rainy season)** | Medium | Certain | Q3-Q4 are lower; ramp up marketing in Q1 |
| **Regulatory changes (PDPA, solar)** | High | Low | Stay informed via Thai legal updates; compliance buffer |
| **AI model quality degradation** | High | Medium | Monitor accuracy; have backup (Gemini); fine-tune |
| **Server downtime** | Medium | Low | Redundancy; monitoring; quick rollback |
| **Currency fluctuation (THB/USD)** | Low | Medium | Most costs in THB; revenue in THB; some APIs in USD |

---

## 🎯 SECTION I: Action Plan (First 30 Days)

### Week 1: Set up tracking
- [ ] Create Google Sheet with Unit Economics template
- [ ] Set up basic analytics (PostHog or Vercel Analytics)
- [ ] Connect Supabase to create `installations` table (revenue tracking)
- [ ] Document current metrics (baseline)

### Week 2: Start tracking real data
- [ ] Log all leads into Google Sheet (manual initially)
- [ ] When first installation happens → record deal size, commission
- [ ] Update unit economics with real numbers
- [ ] Compare to estimates → adjust model

### Week 3: Implement automation
- [ ] Build `/api/metrics` endpoint for dashboard
- [ ] Set up daily/weekly email reports
- [ ] Create alerts (CAC > threshold, revenue dropping)

### Week 4: Review & iterate
- [ ] Review monthly financials with founder
- [ ] Adjust assumptions based on real data
- [ ] Decide: increase/decrease ad spend
- [ ] Plan for next month's targets

---

## ❓ Frequently Asked Questions

**Q: Should I count my time as a cost?**  
A: Yes. In financial modeling for external investors, include founder salary (market rate). For internal tracking, track "implicit cost" but note cash burn excludes it.

**Q: What about taxes?**  
A: Corporate income tax in Thailand: 20% on net profit. VAT: 7% (if registered). Consult accountant for details. Model should include tax provision.

**Q: When will I need external funding?**  
A: If monthly cash burn (ad spend + costs) exceeds your bank balance / 6 months, consider fundraising. Example: burn ฿100k/mo, have ฿500k → 5 months runway → time to fundraise.

**Q: Can I pay partners commission before getting paid by client?**  
A: Risky. Better: pay partners 50% upon contract signing, 50% after client pays. Or net 30 terms (you pay them 30 days after they invoice you).

**Q: How to handle refunds?**  
A: If client cancels before installation, refund their deposit. You owe nothing to partner if no installation. Track cancellation rate.

---

## 📚 Templates & Calculators

### Google Sheet Template Link
Create: `https://docs.google.com/spreadsheets/d/your-id-here`

### Simple Unit Economics Calculator (CLI)
```bash
# Save as ue-calc.sh
#!/bin/bash
echo "Enter ad spend:"
read ad_spend
echo "Enter leads:"
read leads
echo "Enter conversion rates (lead→consult, consult→install):"
read cr1 cr2
echo "Enter avg deal size and commission %:"
read deal commission_pct

cpl=$(echo "scale=2; $ad_spend / $leads" | bc)
consultations=$(echo "$leads * $cr1 / 100" | bc)
installations=$(echo "$consultations * $cr2 / 100" | bc)
rev_per_install=$(echo "$deal * $commission_pct / 100" | bc)
total_rev=$(echo "$installations * $rev_per_install" | bc)

echo "Cost per lead: ฿$cpl"
echo "Installations: $installations"
echo "Total revenue: ฿$total_rev"
```

---

**Document Owner:** @dyaroshevich  
**Last Updated:** 2026-05-15  
**Next Review:** After first 10 installations (validate assumptions)
