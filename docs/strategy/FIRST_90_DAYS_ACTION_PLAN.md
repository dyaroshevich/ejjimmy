# Tawan Power — First 90 Days Action Plan

**Start Date:** [Дата старта]  
**Goal:** Go from "product ready" to "first paying customer" and operational foundation

---

## 📊 Overview

| Week | Focus | Key Metrics | Deliverables |
|------|-------|-------------|--------------|
| **Week 1-2** | Security & Compliance Foundation | RLS enabled, Auth working | Production-ready security |
| **Week 3-4** | Operational Infrastructure | CRM populated, admin trained | First lead processed |
| **Week 5-6** | Testing & Validation | QA passed, load tested | Stable platform |
| **Week 7-8** | Soft Launch | 5-10 leads, 2 quotes sent | First customer in pipeline |
| **Week 9-10** | Close First Deal | 1 deposit paid | Installation scheduled |
| **Week 11-12** | Delivery & Learn | Installation complete, testimonial | Process documented |

---

## 📅 Detailed Weekly Plan

### Week 1-2: Security Hardening & Legal Foundation

#### Week 1
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Enable RLS on `leads`, `solar_products`, `knowledge` tables | Dev | None | ☐ |
| Tue | Write RLS policies: anon=read-only, authenticated=own leads | Dev | RLS enabled | ☐ |
| Wed | Test RLS — try unauth access from client | Dev/Tester | Policies written | ☐ |
| Thu | Add Supabase Auth to `/admin/*` routes | Dev | Auth provider configured | ☐ |
| Fri | Create admin roles (admin, super_admin) in Supabase | Dev | Auth working | ☐ |
| Sat | **Milestone:** Admin panel requires login | — | All above | ✅ |

#### Week 2
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Add PDPA consent checkbox to LeadForm (Thai + English) | Dev | — | ☐ |
| Tue | Store consent timestamp/version in leads table | Dev | Checkbox added | ☐ |
| Wed | Draft Privacy Policy (PDPA compliant) | Legal/Dev | — | ☐ |
| Thu | Draft Terms of Service | Legal/Dev | — | ☐ |
| Fri | Add phone validation regex: `/^0[689]\d{8}$/` | Dev | — | ☐ |
| Sat | **Milestone:** Legal docs drafted, RLS + Auth production-ready | — | — | ✅ |

**Week 1-2 Deliverables:**
- ✅ All tables have RLS enabled with correct policies
- ✅ Admin panel protected by Supabase Auth
- ✅ PDPA consent captured
- ✅ Privacy Policy + ToS drafted (lawyer review pending)
- ✅ Phone validation in place

**Security Checklist:**
- [ ] No unauth access to `/admin/*`
- [ ] No unauth access to `/api/leads`
- [ ] SQL injection impossible (uses Supabase params)
- [ ] XSS sanitization on user input
- [ ] Secrets in `.env.local` not committed

---

### Week 3-4: Operational Readiness

#### Week 3
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Create first admin user in Supabase (your account) | Dev | Auth working | ☐ |
| Tue | Test full lead flow: form → DB → admin panel | Dev/Admin | Admin user created | ☐ |
| Wed | Set up Web Push subscription in admin panel | Dev | Auth working | ☐ |
| Thu | Test push notification from admin to browser | Dev | Web Push setup | ☐ |
| Fri | Create Telegram bot (@BotFather) and channel | Dev | — | ☐ |
| Sat | Connect Telegram notifications as fallback | Dev | Bot created | ☐ |

#### Week 4
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Draft supplier contracts (Jinko, Huawei distributors) | Founder | — | ☐ |
| Tue | Get pricing from 3 suppliers (panel, inverter, battery) | Founder | Contacted suppliers | ☐ |
| Wed | Create installation checklist (PDF template) | Founder | — | ☐ |
| Thu | Find 2-3 potential installation partners (网络搜索, referrals) | Founder | — | ☐ |
| Fri | First admin training session (2 hours) | Founder | Admin hired? | ☐ |
| Sat | **Milestone:** Lead flow end-to-end working + suppliers identified | — | — | ✅ |

**Week 3-4 Deliverables:**
- ✅ End-to-end lead capture (form → admin → push notification)
- ✅ Telegram fallback notifications working
- ✅ Supplier quotes received (panel/inverter cost baseline)
- ✅ Installation checklist created
- ✅ 2-3 installer contacts identified
- ✅ First admin trained (if hired)

---

### Week 5-6: Testing & Quality Assurance

#### Week 5
| Day | Task | Owner | Done |
|-----|------|-------|------|
| Mon | Run QA test suite (手动 through all user flows) | Dev/Admin | ☐ |
| Tue | Fix all critical bugs found (blocking flow) | Dev | ☐ |
| Wed | Load test: simulate 10 concurrent users (k6/artillery) | Dev | ☐ |
| Thu | Mobile testing: PWA install, push on iOS/Android | Dev/Admin | ☐ |
| Fri | Fix performance issues (N+1 queries, missing indexes) | Dev | ☐ |
| Sat | **Milestone:** No critical bugs, all flows work on mobile | — | ✅ |

#### Week 6
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Create error monitoring (Sentry) account + SDK integration | Dev | — | ☐ |
| Tue | Set up health check endpoint (`/api/health`) | Dev | — | ☐ |
| Wed | Configure uptime monitoring (UptimeRobot) | Dev | Health endpoint | ☐ |
| Thu | Add analytics: GA4 + custom events | Dev | — | ☐ |
| Fri | SEO setup: sitemap.xml, robots.txt, meta tags | Dev | — | ☐ |
| Sat | **Milestone:** Monitoring + analytics in production | — | — | ✅ |

**Week 5-6 Deliverables:**
- ✅ All critical paths tested (lead, chat, admin)
- ✅ Performance optimized (no N+1, indexes in place)
- ✅ Mobile PWA works (install, push)
- ✅ Error tracking (Sentry) active
- ✅ Uptime monitoring configured
- ✅ Analytics (GA4) tracking events
- ✅ Basic SEO ready

---

### Week 7-8: Soft Launch & Lead Generation

#### Week 7
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Create Google Ads account + first campaign (฿500/day) | Marketing | — | ☐ |
| Tue | Create Facebook Ads account + first campaign (฿500/day) | Marketing | — | ☐ |
| Wed | Set up UTM tracking for all campaigns | Marketing | Ads created | ☐ |
| Thu | Create landing page variations (A/B test: headline, CTA) | Dev | — | ☐ |
| Fri | Install Facebook Pixel + Google Ads conversion tag | Dev | — | ☐ |
| Sat | **Milestone:** Live ads, tracking set up, receiving first leads | — | — | ✅ |

#### Week 8
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Monitor leads: quantity, quality (phone valid, intent) | Admin/Marketing | Ads live | ☐ |
| Tue | Optimize ads based on first week data (pause low performing) | Marketing | Data collected | ☐ |
| Wed | Create email follow-up sequences (Brevo) | Marketing | — | ☐ |
| Thu | First 5 customers chat interaction (测试AI responses) | Admin | Leads received | ☐ |
| Fri | Collect feedback from first 5 chat interactions | Admin | — | ☐ |
| Sat | **Milestone:** 10+ leads received, 2 quotes sent, feedback collected | — | — | ✅ |

**Week 7-8 Deliverables:**
- ✅ Google Ads + Facebook Ads live (฿1,000/day total)
- ✅ UTM tracking configured
- ✅ Conversion events tracked (GA4, FB Pixel)
- ✅ First 10-20 leads generated
- ✅ 2-5 quotes sent to customers
- ✅ Feedback loop established (what questions do leads ask?)

---

### Week 9-10: First Deal Closed

#### Week 9
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Qualify hot leads from Week 7-8 (follow up calls) | Admin/Sales | Quotes sent | ☐ |
| Tue | Schedule site visits for interested customers (2-3) | Admin | Qualified leads | ☐ |
| Wed | Conduct site visits (with installer lead if possible) | Founder | Visits scheduled | ☐ |
| Thu | Detailed quotes with site-specific pricing | Founder | Site visit done | ☐ |
| Fri | Send contracts (PDF via PandaDoc or custom) | Founder | Quote accepted | ☐ |
| Sat | **Milestone:** 1 customer accepts quote, ready for deposit | — | — | ✅ |

#### Week 10
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Collect deposit (bank transfer, PromptPay) | Founder | Contract signed | ☐ |
| Tue | Order materials from suppliers (panels, inverter) | Founder | Deposit received | ☐ |
| Wed | Schedule installation crew (2-3 days) | Founder | Materials ordered | ☐ |
| Thu | Prepare installation documentation (permits, checklist) | Founder | — | ☐ |
| Fri | Execute installation (supervise first one) | Founder/Installer | — | ☐ |
| Sat | **Milestone:** FIRST INSTALLATION COMPLETE, final payment collected | — | — | ✅ |

**Week 9-10 Deliverables:**
- ✅ First qualified site visit completed
- ✅ Detailed proposal and contract signed
- ✅ Deposit collected (30%+)
- ✅ Materials ordered and received
- ✅ First installation executed
- ✅ Final payment collected
- ✅ Customer satisfaction: feedback + testimonial

---

### Week 11-12: Systematize & Scale Preparation

#### Week 11
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Document entire process: lead → install (SOP) | Founder | First install done | ☐ |
| Tue | Identify bottlenecks (what took longest, what failed?) | Founder | — | ☐ |
| Wed | Refine admin panel based on learnings | Dev | Feedback collected | ☐ |
| Thu | Update lead scoring/qualification criteria | Founder/Marketing | Data analyzed | ☐ |
| Fri | Optimize ad spend: focus on best channels | Marketing | Conversion data | ☐ |
| Sat | **Milestone:** Process documented, optimizations in place | — | — | ✅ |

#### Week 12
| Day | Task | Owner | Dependencies | Done |
|-----|------|-------|--------------|------|
| Mon | Onboard second admin (hire if not yet) | Founder | Process documented | ☐ |
| Tue | Train second admin on workflow | Founder | Admin hired | ☐ |
| Wed | Create weekly KPI dashboard (leads, quotes, installs) | Dev | — | ☐ |
| Thu | Plan next month's ad budget (scale to ฿2,000/day?) | Marketing | ROI calculated | ☐ |
| Fri | Set up weekly review meeting (Mon mornings) | Founder | — | ☐ |
| Sat | **Milestone:** Team trained, metrics dashboard, scaling plan ready | — | — | ✅ |

**Week 11-12 Deliverables:**
- ✅ Standard Operating Procedure (SOP) documented
- ✅ Bottlenecks identified and addressed
- ✅ Admin panel refined + team trained
- ✅ KPI dashboard live (Google Sheets or in-app)
- ✅ Ad spend optimization complete
- ✅ Hiring plan for next 3 months defined
- ✅ First customer testimonial + photos on website

---

## 🎯 Success Metrics (90 Days)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Leads generated** | 50-100 | Top of funnel volume |
| **Lead → Contacted** | >90% within 1h | Customer experience |
| **Contacted → Qualified** | >30% | Lead quality |
| **Qualified → Quote** | >80% | Sales effectiveness |
| **Quote → Deal** | >20% | Closing ability |
| **Installation completed** | 1-3 | Proof of delivery |
| **Customer satisfaction** | >4.5/5 | Referrals, reviews |
| **Ad spend ROI** | CAC < LTV/3 | Unit economics |
| **Avg response time** | <1h | Competitive edge |

---

## 🚀 Pre-Launch → Post-Launch Transition

### Day 0 (before Week 1): Pre-Launch
- [ ] RLS NOT enabled (development mode)
- [ ] No real leads (only test data)
- [ ] Admin panel open (no auth)
- [ ] No ads running
- [ ] No suppliers contracted
- [ ] No installers trained

### Day 90 (end Week 12): Post-Launch
- [ ] RLS enabled and verified
- [ ] First customer paid and installed
- [ ] Admin panel working with real team
- [ ] Ads running (with positive ROI)
- [ ] Suppliers contracts signed
- [ ] Installer partners trained
- [ ] SOP documented
- [ ] Metrics dashboard tracking weekly KPIs
- [ ] Customer testimonial on site
- [ ] Reviews on Google/Facebook

---

## ⚠️ Critical Path Dependencies

```
Week 1-2 (Security) → Week 3-4 (Operational) → Week 7-8 (Leads) → Week 9-10 (Close) → Week 11-12 (Scale)

If Week 1-2 delayed → entire timeline shifts
If ads not working by Week 8 → reconsider marketing channels
If first install fails → quality issues → reputation damage
```

---

## 🆘 Emergency Brakes

### If Something Goes Wrong:

| Scenario | Action |
|----------|--------|
| No leads in Week 7-8 (0 in 2 weeks) | Pause ads, audit landing page, check conversion tracking, consider different channel (SEO, referrals) |
| Leads but 0 quotes sent | Admin training insufficient, implement daily standup, require quotes within 24h |
| Quote → Deal conversion <10% | Review pricing (too high?), improve presentation, add social proof (testimonials) |
| Installation quality issues | Stop installations, retrain crew, create quality checklist, inspect before handover |
| Supplier delays | Have backup supplier, order earlier, buffer 2 weeks |
| Cash flow negative (deposit not enough) | Require 50% deposit, consider financing for materials, reduce ad spend |

---

## 📋 Weekly Review Template (Monday mornings)

```
Week [N] Review — [Date]

📊 Metrics:
- Leads: X (vs target Y)
- Quotes sent: X
- Site visits: X
- Deals closed: X
- Installations: X
- Ad spend: ฿X, CAC: ฿X
- Revenue: ฿X

✅ Wins this week:
1. ...
2. ...

🔴 Problems this week:
1. ...
2. ...

🔧 Actions for this week:
1. ...
2. ...

📈 Forecast next 3 weeks:
- Leads expected: X
- Deals expected: X
- Revenue expected: ฿X
```

---

## ✅ 90-Day Sign-off

| Area | Owner | Signed Off | Notes |
|------|-------|------------|-------|
| Security & Compliance | Dev | ☐ | RLS, Auth, PDPA |
| Operations | Ops | ☐ | Lead flow, admin trained |
| Product Quality | Founder | ☐ | First install complete |
| Marketing | Marketing | ☐ | Ads live, tracking OK |
| Finance | Founder | ☐ | CAC < LTV/3, profitable unit |
| Legal | Lawyer | ☐ | T&C, Privacy Policy approved |

**90-Day Milestone:** First 3 paying customers completed → system repeatable → ready to scale.

---

*Документ обновлён: 18 May 2026*
