# Topic 15: Pricing Elasticity Testing — Research Report

**Status:** Not started  
**Researcher:** —  
**Date started:** —  
**Date completed:** —

**Goal:** Find optimal price point that maximizes revenue (not just conversion)

---

## Executive Summary

**Hypothesis:** Lower price → higher conversion, but lower margin. Find sweet spot.

**Method:** A/B test different price points on website/ads, measure conversion rate, deal size, LTV.

---

## Pricing Variables to Test

1. **Base system price:**
   - ฿28/Wp (low)
   - ฿32/Wp (medium)
   - ฿36/Wp (high)
   - ฿40/Wp (premium)

2. **Anchor pricing:**
   - Show "Original ฿40/Wp" then "Sale ฿32/Wp"
   - Creates perception of deal

3. **Financing presentation:**
   - Show lump sum: ฿350,000
   - Show monthly: "Only ฿5,800/month" (or 0% financing)
   - Which converts better?

4. **Package tiering:**
   - Basic: ฿28/Wp (panels only)
   - Standard: ฿32/Wp (+ monitoring)
   - Premium: ฿36/Wp (+ monitoring + extended warranty)

---

## A/B Test Design

### Test 1: Price point
- **Group A:** Price ฿32/Wp
- **Group B:** Price ฿36/Wp
- **Group C:** Price ฿28/Wp
- Random assignment by UTM parameter
- Measure: Quote → Deal conversion, average order value

### Test 2: Financing display
- **Group A:** Show total price only
- **Group B:** Show monthly payment prominently
- Measure: Quote requests, conversion

### Test 3: Anchor effect
- **Group A:** "Price: ฿350,000"
- **Group B:** "Was ฿420,000, now ฿350,000"
- Measure: conversion

---

## Metrics to Track

| Metric | Definition | Target |
|--------|------------|--------|
| Conversion rate | Quote → Deal % | >20% overall |
| Average order value (AOV) | ฿/system | >฿320,000 |
| Revenue per visitor | (conversion × AOV) / total visitors | Maximize |
| CAC payback period | Months to recover acquisition cost | <12 months |
| LTV:CAC ratio | Lifetime value / acquisition cost | >3:1 |

---

## Test Duration & Sample Size

**Statistical significance:**
- Need at least 100 quote requests per variant for reliable results
- If current quote rate 5%, need 2,000 visitors per variant
- Test duration: 2-4 weeks (depending on traffic)

---

## ❓ Open Questions

1. **Is market price-sensitive?** Likely yes in Thailand (price-conscious)
2. **Competitor pricing range:** need accurate numbers from Topic 7
3. **Do we have enough traffic?** Initially no — need 100+ leads/month to test
4. **Should we test with real pricing?** Yes, nofake prices
5. **What about financing effect?** Might attract customers who otherwise can't afford

---

## ✅ Recommendations

1. **Start with one price initially** (based on competition + margin) — don't confuse early customers
2. **After 50+ quotes,** analyze conversion by price (if you varied)
3. **Once have stable lead flow (>100/mo),** implement A/B testing framework
4. **Use Google Optimize or Vercel A/B testing** (simple)
5. **Track everything:** which ads brought which price variant
6. **Don't change price too frequently** — creates distrust
7. **Consider psychological pricing:** ฿349,000 vs ฿350,000
8. **Test anchor:** "Regular price ฿399,000 — Sale ฿349,000"

---

**Next actions:**
1. Complete competitor pricing research (Topic 7) to set baseline
2. Calculate needed margin (COGS + markup)
3. Set initial price (Week 7-8)
4. Document price in proposal template (can't change easily)
5. After 50 deals, analyze elasticity

---

*Status:* Not started — P2 (after have enough data)
