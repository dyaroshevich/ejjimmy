# 📋 First 100 Leads: 30-Day Execution Checklist

**Purpose:** Step-by-step guide to process your first 100 leads from "arrival" to "installation" or "lost"  
**Timeline:** Day 1 → Day 30 (4 weeks)  
**Goal:** Learn what works, what doesn't, and build repeatable processes  
**Owner:** Founder / Support Lead  
**Status:** Active — Use for first 100 leads only (then refine for scale)

---

## 🎯 Why First 100 Leads Are Special

These first 100 leads are **research data**, not just sales. You're discovering:
- What conversion rates are realistic in Krabi market
- Common objections (price, timing, uncertainty)
- Lead quality distribution (hot vs cold)
- Partner performance (who closes deals?)
- AI accuracy (does calculator match reality?)

**Mindset:** "Learning mode" — don't expect profitability yet, expect insights.

---

## 📊 Week 0: Pre-Launch Setup (Day -7 to Day 0)

### 3-7 days BEFORE first lead arrives

#### Day -7: Infrastructure
- [ ] Create Google Sheet `[Tawan Power] Leads - Master` (copy from GOOGLE_SHEETS_TEMPLATES.md)
- [ ] Set up columns exactly as specified (ID, Created At, Session ID, Name, Phone, LINE ID, Segment, Bill (kWh), Est. System (kW), Payback (years), Status, Contacted Date, Contact Method, Engineer Assigned, Site Survey Scheduled, Installation Date, Commission, Notes, Lost Reason)
- [ ] Add data validation dropdowns (Status, Contact Method, Engineer Assigned, Lost Reason)
- [ ] Set up conditional formatting (colors by status)
- [ ] Share sheet with yourself (and any team members) with Edit permissions

#### Day -6: Notifications
- [ ] Create LINE Notify channel (https://notify-bot.line.me/)
  - Go to LINE Notify → Login with your LINE account
  - Create new "Integration" → Tawan Power Leads → get Access Token
  - Save token somewhere safe (will use in webhook)
- [ ] Test LINE Notify: send test message to yourself
- [ ] Create Slack channel `#tawan-power-leads` (if using Slack)
- [ ] Test: send test message to channel

#### Day -5: CRM Automation (Optional)
- [ ] Set up Supabase Realtime or webhook to automatically notify when new lead inserted
  - Option A: Supabase → Realtime subscription in your admin dashboard (future)
  - Option B: Supabase → Zapier/Make.com → Google Sheets (simpler for now)
  - Option C: Manual check every 30 minutes (worst case, acceptable for <10 leads/day)
- [ ] Document process: "How to check for new leads" (morning routine)

#### Day -4: Support Scripts
- [ ] Print or save to desktop: Phone Script (Thai + English) from OPERATIONS_PLAYBOOK.md
- [ ] Prepare LINE message templates (copy from OPERATIONS_PLAYBOOK)
- [ ] Create email template in Gmail (Canned responses)
- [ ] Prepare Calendly or Google Calendar for booking surveys

#### Day -3: Partner Outreach
- [ ] Identify 5-10 potential installation partners in Krabi (Google search)
- [ ] Call/email them: "We're generating leads for solar consultations. Would you like to receive qualified customers? Commission structure applies."
- [ ] Get at least 2 partners on board before first lead (even if informal)
- [ ] Document their contact details in `Installation Partners` sheet

#### Day -2: Financial Tracking
- [ ] Create Google Sheet `Tawan Power - Financial Model` (from FINANCIAL_MODEL.md + GOOGLE_SHEETS_TEMPLATES.md)
- [ ] Fill in current ad spend (if any), Groq/Gemini costs, Vercel, Supabase
- [ ] Set up Unit_Economics tab with current assumptions (CAC target ฿1k, conversion 30%/20%)
- [ ] Create `Leads_Log` tab and connect to Leads Master (IMPORTRANGE or manual export weekly)

#### Day -1: Final Check
- [ ] Verify AI chat is working (test on localhost:3001/chat)
- [ ] Test lead save: go through chat, click Save → data appears in Supabase `leads` table
- [ ] Verify notification: check if webhook sends to LINE/Slack
- [ ] Have phone/laptop ready, charged, with good internet
- [ ] Block time in calendar: 9:00-9:30 AM daily for lead processing

#### Day 0: Ready
- [ ] All sheets created
- [ ] Notifications working
- [ ] Scripts printed
- [ ] Partners identified (at least 2)
- [ ] Financial model ready
- [ ] Mindset: "I'm learning, not expecting profit yet"

---

## 📈 Week 1: Days 1-7 — Soft Launch

### Daily Routine (Every Day)

**Morning (9:00-9:30 AM):**
1. Open `Leads Master` sheet
2. Filter `Status = "new"` AND `Created At` is yesterday/today
3. For each new lead:
   - Check if phone or LINE ID provided
   - Contact within 4 hours (see scripts)
   - Update sheet: `Status = contacted`, `Contacted Date = TODAY()`, `Contact Method = phone/line`
4. Review overnight leads (if any)
5. Send daily summary: "Today's leads: X new, Y contacted, Z pending"

**Afternoon (4:00-4:30 PM):**
1. Check leads with `Status = "contacted"` and `Contacted Date < today - 2 days`
2. Follow up if no response
3. Update sheet with follow-up notes

**Evening (before bed):**
1. Ensure all "new" leads from today are contacted
2. Check if any lead needs immediate attention (VIP, complaint)
3. Plan tomorrow's follow-ups

---

### Day 1: First Lead Arrives!

**Emotion:** Excitement! Don't panic if it's weird or incomplete.

**Action steps:**
- [ ] Lead appears in sheet? Verify data (webhook working)
- [ ] Check phone/LINE ID: is it real?
- [ ] Call within 1 hour (show initiative)
- [ ] Use Phone Script exactly as written
- [ ] If no answer → send LINE message
- [ ] Record outcome in `Notes`: "Called, no answer, left voicemail" or "Reached, interested, scheduled survey for [date]"
- [ ] Update `Status`: contacted → scheduled OR contacted → cold (if clearly not interested)

**Reflection (end of day):**
- Did webhook work? Did alert come?
- How long did first contact take?
- What objections did customer have?
- Log insights in `Customer Interviews` sheet

---

### Day 2-3: Build Rhythm

- [ ] Process leads as they arrive
- [ ] Aim: 100% of new leads contacted within 4 hours
- [ ] If 0 leads arrive → check chat traffic, maybe no one using it yet → normal
- [ ] Monitor daily: lead volume, response time, conversion to consultation

---

### Day 4-5: First Site Survey (if lucky!)

If a lead says "yes" to free survey:
- [ ] Schedule via Calendly or manual calendar
- [ ] Confirm with customer: "See you on [date] at [time]"
- [ ] Notify engineer partner (LINE/Slack)
- [ ] Prepare Lead Summary PDF (print or digital)
- [ ] Engineer conducts survey → get feedback: "Was customer serious? Did numbers match chat estimate?"
- [ ] Engineer updates sheet: `Status = installed` OR `Status = lost` with reason
- [ ] Record commission estimate if installed

---

### Day 6-7: Week 1 Review (Friday 4:00 PM)

**Review template (copy to Notes):**

```
WEEK 1 REVIEW - First 100 Leads
Date: [DATE]
Total leads this week: __
Breakdown:
- New: __
- Contacted: __
- Scheduled: __
- Installed: __
- Lost: __
- Cold: __

Conversion rates:
- Contact rate (contacted/leads): __%
- Consultation→Survey rate: __%
- Survey→Install rate: __%

Common objections:
1. Price too high: __ leads
2. Not ready yet: __ leads
3. Wanted more info: __ leads
4. No response: __ leads

Partner performance:
- Partner A (Dmitry): __ leads, __ installations
- Partner B: __ leads, __ installations

AI accuracy: Did calculator match engineer's site measurement? __% accuracy

What went well:
1.
2.

What needs improvement:
1.
2.

Adjustments for Week 2:
1.
2.

Next week targets:
- Leads to process: __
- Target installations: __
- Target contact rate: __%
```

---

## 📈 Week 2: Days 8-14 — Iterate

### Daily Operations (same as Week 1)

**Additional focus:**
- [ ] Refine scripts based on Week 1 objections
  - If "price too high" common → prepare cost breakdown script
  - If "not ready" common → prepare lead nurture sequence (follow-up after 7 days)
- [ ] Analyze lead quality: which segments convert better? (residential vs commercial)
  - If commercial leads have higher conversion → adjust chat to get more commercial users
- [ ] Check partner responsiveness: who actually schedules surveys? Who shows up?
  - If partner not responding → switch to other partner or handle yourself
- [ ] Start logging reasons for "lost" leads in `Lost Reason` column (don't leave blank)

---

### Day 10: First Financial Update

- [ ] Update Financial Model sheet with Week 1 actuals:
  - Leads: __
  - Ad spend (if any): __
  - Cost per lead: __
  - Revenue (if any installations): __
- [ ] Compare to projections: are we on track?
- [ ] Adjust ad spend (if spending) based on CAC

---

### Day 14: Week 2 Review (Friday)

Same review template as Week 1.

**Add this week:**
- [ ] Calculate cumulative metrics (last 2 weeks combined)
- [ ] Identify trends: "Conversion improving from 15% to 25%?"
- [ ] Are we getting repeat customers? (referrals from existing customers?)

---

## 📈 Week 3: Days 15-21 — Scale Up

### By now you should have:

- [ ] Process for new leads (automated or manual, but consistent)
- [ ] 2-3 partners who actually respond and do surveys
- [ ] Data in Financial Model sheet (at least 15-20 leads)
- [ ] Confidence in scripts (you've said them 50+ times)

### Focus for Week 3:

- [ ] Increase lead volume: turn on ads if not already, or improve SEO/content
- [ ] Delegate: Can someone else handle initial contact? Train them using your scripts
- [ ] Document all variations of customer questions → add to Knowledge Base (for AI training later)
- [ ] Start "lead nurturing" for cold leads (follow-up sequence at days 3, 7, 14)
- [ ] Monitor partner performance: if Partner A has 50% conversion vs Partner B 10% → send more leads to A

---

### Day 17: Mid-Month Financial Check

- [ ] Project month-end revenue based on current trajectory
- [ ] Will we break even? (Revenue > Costs?)
- [ ] Adjust next month's ad budget accordingly
- [ ] If CAC > ฿1,000 → optimize ad targeting or chat conversion

---

### Day 21: Week 3 Review

Same review template.

---

## 📈 Week 4: Days 22-30 — Month-End Close

### End of Month Tasks:

- [ ] **Complete all data entry for the month** (no missing leads in sheet)
- [ ] **Reconcile Financial Model:**
  - Total leads: __
  - Total ad spend: __
  - CAC: __
  - Total installations: __
  - Total revenue (commission): __
  - Profit/Loss: revenue - costs
- [ ] **Calculate conversion rates** for the month:
  - Lead → Contacted: __%
  - Contacted → Survey scheduled: __%
  - Survey → Installation: __%
  - Overall: Lead → Install: __%
- [ ] **Update Unit Economics** with real numbers (not assumptions)

---

### Day 28-29: Customer Interviews (First 5-10)

For the first 5-10 customers who completed installation:
- [ ] Call them (or meet if possible)
- [ ] Ask 5 questions (from Customer Interviews Tracker):
  1. Why did you choose solar?
  2. What was your main concern before installation?
  3. How did you hear about Tawan Power?
  4. What convinced you to choose us?
  5. What could we improve?
- [ ] Record answers (with permission)
- [ ] Enter into `Customer Interviews` sheet
- [ ] Look for patterns: "All said price was concern" → adjust pricing/positioning

---

### Day 30: MONTH 1 REVIEW (Big Review)

**Create document: `Month 1 Summary - Lessons Learned`**

Sections to fill:

```
1. METRICS SUMMARY
   - Total leads: __
   - Total cost (ad spend + ops): __฿
   - CAC: __฿
   - Total installations: __
   - Total revenue: __฿
   - Profit/Loss: __฿
   - LTV (if any repeat): __฿

2. CONVERSION FUNNEL
   Lead → Contacted: __%
   Contacted → Survey: __%
   Survey → Install: __%
   Overall: __%

   Visual: Draw funnel diagram (Lead → Contact → Survey → Install)

3. LEAD QUALITY
   - Residential vs Commercial split: __% / __%
   - Avg bill (kWh): __ (range: min-max)
   - Avg system size: __ kW
   - Source of best leads (Google, LINE, referral): __

4. PARTNER PERFORMANCE
   Partner A: __ leads → __ installs (__%)
   Partner B: __ leads → __ installs (__%)
   Best partner: __
   Partners to drop: __

5. CHAT / AI PERFORMANCE
   - AI accuracy: __% of estimates matched engineer's final quote
   - Common hallucinations or errors:
     1.
     2.
   - Fallback rate (Groq→Gemini): __%

6. CUSTOMER FEEDBACK (from interviews)
   Top 3 reasons they chose us:
   1.
   2.
   3.
   Top 3 concerns before buying:
   1.
   2.
   3.
   NPS score: __/10 (if asked)

7. OPERATIONS ISSUES
   - Missed follow-ups: __ instances
   - Late responses: __ instances
   - System errors: __ incidents
   - biggest bottleneck: __

8. FINANCIAL HEALTH
   - Burn rate: __฿/month
   - Runway at current burn: __ months
   - Breakeven point: need __ installations/month
   - Can we afford to continue? YES/NO (if NO, explain)

9. KEY LEARNINGS (What surprised you?)
   1.
   2.
   3.

10. ACTIONS FOR MONTH 2
    - Increase/decrease ad spend: __
    - Change conversion targets: __
    - Add/remove partners: __
    - Improve chat scripts: __
    - Hire support? YES/NO
    - Other: __
```

---

## 🎯 Month 1 Success Criteria

You've successfully completed Month 1 if:

✅ You have **complete data** for all 100 leads (no gaps)  
✅ You've spoken to **at least 5 customers** who completed installation  
✅ You know your **CAC** (even if rough estimate)  
✅ You've identified **top 3 objections** and have responses ready  
✅ You've determined **which partners are reliable**  
✅ You've decided whether to **continue, pivot, or stop** based on unit economics  
✅ You've updated all documents (SKILLS_MATRIX, OPERATIONS_PLAYBOOK) with real-world learnings

---

## 📋 Daily Checklist (Print & Post)

Morning:
- [ ] Open Leads Master sheet
- [ ] Filter: Status = "new"
- [ ] Contact all new leads (phone/LINE) within 4 hours
- [ ] Log contact attempt in Notes
- [ ] Update Status to "contacted"

Afternoon:
- [ ] Follow up on "contacted" leads > 2 days no response
- [ ] Schedule surveys for interested leads
- [ ] Notify partners of scheduled surveys

Evening:
- [ ] Review day's leads: any missing?
- [ ] Check notifications working
- [ ] Plan tomorrow's follow-ups

---

## 🚨 Red Flags (When to Panic)

| Symptom | Meaning | Action |
|---------|---------|--------|
| 0 leads for 3+ days | Chat broken OR no traffic | Check webhook, check site analytics |
| >50% leads have no contact info | UI not capturing phone/LINE | Fix chat flow, make fields required |
| <20% contact rate (lead→contacted) | Not reaching out fast enough | Increase contact attempts, check phone numbers |
| 0% conversion to survey | Script not persuasive OR leads low quality | Revise script, check lead source quality |
| Partners not responding | Need better partners or handle yourself | Call partners daily, find new ones |
| CAC > ฿5,000 continuously | Ads too expensive OR conversion too low | Pause ads, fix conversion first |
| AI giving wrong numbers | Calculator bugs | Fix AI prompt, test calculator |
| No installations by lead 50 | Conversion problem (survey→install) | Survey why customers decline after survey |

---

## 📚 Resources to Keep Handy

- Phone script (Thai + EN) → OPERATIONS_PLAYBOOK.md
- LINE message templates → OPERATIONS_PLAYBOOK.md
- Privacy Policy → PRIVACY_POLICY_TEMPLATE.md (for reference)
- Brand Voice Guidelines → BRAND_VOICE_GUIDELINES.md (tone check)
- Financial Model → FINANCIAL_MODEL.md (update numbers weekly)

---

## ✅ After 100 Leads: Debrief & Systematize

When you hit 100 leads (cumulative):

1. **Freeze the process:** No changes to scripts/flow for 1 week (just execute)
2. **Analyze:** Run all the reports (conversion rates, partner performance, CAC)
3. **Document:** Write `First 100 Leads - Summary Report` (use template above)
4. **Systematize:** Update OPERATIONS_PLAYBOOK.md with what actually works
5. **Decide:** Continue current strategy OR pivot based on learnings
6. **Optimize:** Pick 3 things to improve for next 100 leads
7. **Delegate:** If >50 leads/month, consider hiring support person

---

**Remember:** The goal of first 100 leads is **learning**, not profit.  
Every "no" teaches you something. Every "yes" confirms something.  
Track everything. Review weekly. Iterate.

Good luck! 🚀

---

**Last updated:** May 15, 2026  
**Next review:** After lead #50 (mid-point check)
