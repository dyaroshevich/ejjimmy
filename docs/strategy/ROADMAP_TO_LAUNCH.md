# Tawan Power — Roadmap to Launch (Comprehensive Guide)

**Дата:** 18 May 2026  
**Статус:** Development Complete → Pre-Launch Phase  
**Target Launch Date:** [Date +90 days]

---

## 🧭 Quick Navigation

Choose your starting point:

- **"Я готов к действию"** → [`FIRST_90_DAYS_ACTION_PLAN.md`](FIRST_90_DAYS_ACTION_PLAN.md) — начни здесь, day-by-day tasks
- **"Нужен общий контекст"** → [`LAUNCH_PLAYBOOK.md`](LAUNCH_PLAYBOOK.md) — полная картина всех аспектов
- **"Что researched? Что ещё нужно?"** → [`RESEARCH_MASTER_PLAN.md`](RESEARCH_MASTER_PLAN.md) — 15 исследовательских тем
- **"Как нанимать команду?"** → [`MANPOWER_TEAM_SCALING.md`](MANPOWER_TEAM_SCALING.md) — роли, KPI, зарплаты
- **"Кто конкуренты? Сколько стоит?"** → [`THAI_MARKET_ANALYSIS.md`](THAI_MARKET_ANALYSIS.md) — рынок Таиланда
- **"Какие SaaS покупать?"** → [`TECH_STACK_SAAS_PLATFORMS.md`](TECH_STACK_SAAS_PLATFORMS.md) — CRM, Payments, Email
- **"Крипто/блокчейн идеи?"** → [`CRYPTO_BLOCKCHAIN_OPPORTUNITIES.md`](CRYPTO_BLOCKCHAIN_OPPORTUNITIES.md) — токенизация, Green NFTs

---

## 📊 The Big Picture: 4 Phases

```
Phase 1: PRE-LAUNCH (Days 0-30)
├── Security: RLS, Auth, PDPA compliance
├── Legal: Company registration, Privacy Policy, ToS
├── Infrastructure: CRM setup, suppliers, permits research
└── Team: Hire first admin
        ↓
Phase 2: SOFT LAUNCH (Days 30-60)
├── Marketing: Google/FB Ads live, first leads
├── Testing: QA, mobile testing, performance
├── Operations: Lead processing, quoting, installation
└── Monitoring: Sentry, GA4, uptime
        ↓
Phase 3: FIRST DEALS (Days 60-75)
├── Close: First customer signed, deposit paid
├── Execute: First installation completed
├── Learn: Feedback, bottleneck identification
└── Document: SOP creation
        ↓
Phase 4: SCALE READY (Days 75-90)
├── Optimize: Process refinement, ad spend optimization
├── Expand: Second admin hired, installer partners trained
├── Systematize: KPIs, weekly reviews, hiring plan
└── Document: Testimonials, case studies
```

---

## 📋 Master Checklist (всего 150+ items)

### ✅ Phase 1: Pre-Launch (Days 0-30) — 45 items

**Security & Legal (P0)**
- [ ] Enable RLS on all tables (leads, solar_products, knowledge)
- [ ] Write RLS policies (anon read-only, authenticated own leads)
- [ ] Add Supabase Auth to `/admin/*`
- [ ] Create admin roles (admin, super_admin)
- [ ] Add PDPA consent checkbox to LeadForm
- [ ] Store consent timestamp in leads
- [ ] Draft Privacy Policy (PDPA compliant)
- [ ] Draft Terms of Service
- [ ] Add phone validation regex
- [ ] **Milestone:** Security audit passed

**Company & Finance**
- [ ] Register company in Thailand
- [ ] Open business bank account
- [ ] Get tax ID/VAT registration
- [ ] Register for Social Security (prepare for hiring)
- [ ] Set up accounting system (Xero trial)

**Operational Readiness**
- [ ] Create first admin user in Supabase
- [ ] Test end-to-end lead flow
- [ ] Set up Web Push subscriptions
- [ ] Create Telegram bot + notifications
- [ ] Get supplier quotes (3+ vendors)
- [ ] Create installation checklist
- [ ] Identify 2-3 installer partners
- [ ] Hire/train first admin
- [ ] Set up error monitoring (Sentry)
- [ ] Configure uptime monitoring
- [ ] Add GA4 + custom events
- [ ] SEO setup (sitemap, robots.txt, meta)

**First 30 Days Milestone:** All security in place, legal docs drafted, suppliers contracted, first admin trained, monitoring active.

---

### ✅ Phase 2: Soft Launch (Days 31-60) — 40 items

**Marketing & Advertising**
- [ ] Google Ads account created
- [ ] Facebook Ads account created
- [ ] First campaign launched (฿500/day each)
- [ ] UTM tracking configured
- [ ] Landing page variations (A/B test)
- [ ] FB Pixel + Google Ads conversion tags installed
- [ ] Monitor leads (quantity, quality)
- [ ] Pause low-performing ads after 1 week
- [ ] Set up email follow-up sequences (Brevo)
- [ ] **Milestone:** 10-20 leads generated

**Sales & Operations**
- [ ] First 5 customer chat interactions
- [ ] Collect feedback from chats
- [ ] Qualify hot leads
- [ ] Schedule 2-3 site visits
- [ ] Conduct site visits
- [ ] Create detailed quoting template
- [ ] Send first quotes
- [ ] Document common customer questions
- [ ] **Milestone:** 2-5 quotes sent

**Quality Assurance**
- [ ] QA test suite (all user flows)
- [ ] Fix critical bugs
- [ ] Load test (10 concurrent users)
- [ ] Mobile PWA test (iOS/Android)
- [ ] Fix performance issues (N+1, missing indexes)
- [ ] **Milestone:** No critical bugs, mobile works

---

### ✅ Phase 3: First Deals (Days 61-75) — 30 items

**Closing**
- [ ] Follow-up calls on sent quotes
- [ ] Address objections (price, timing, warranty)
- [ ] Negotiation (if needed)
- [ ] Send contract (PDF)
- [ ] Collect deposit (bank transfer/PromptPay)
- [ ] **Milestone:** First contract signed + deposit received

**Installation Execution**
- [ ] Order materials from suppliers
- [ ] Schedule installation crew
- [ ] Prepare permits documentation (if needed for customer)
- [ ] Conduct first installation (supervise)
- [ ] Quality inspection checklist
- [ ] Customer handover/training
- [ ] Collect final payment
- [ ] Register warranties with suppliers
- [ ] Take before/after photos
- [ ] **Milestone:** FIRST INSTALLATION COMPLETE

---

### ✅ Phase 4: Scale Ready (Days 76-90) — 35 items

**Process Documentation**
- [ ] Document SOP: lead → install
- [ ] Identify bottlenecks
- [ ] Refine admin panel based on learnings
- [ ] Update lead scoring criteria
- [ ] Create KPI dashboard (leads, quotes, installs)
- [ ] Write installation quality checklist
- [ ] Document warranty claim process

**Team Building**
- [ ] Onboard second admin (hire if needed)
- [ ] Train second admin
- [ ] Create training materials (video + doc)
- [ ] Define roles & responsibilities
- [ ] Set up weekly review meeting (Monday 9am)
- [ ] Define escalation procedures

**Marketing Optimization**
- [ ] Analyze ad spend ROI (CAC calculation)
- [ ] Optimize ads (focus on best channels)
- [ ] Set referral program (฿1,000 per referral)
- [ ] Collect customer testimonial
- [ ] Add testimonials to website
- [ ] Plan next month's ad budget

**Scale Preparation**
- [ ] Hiring plan for next 3 months
- [ ] Research CRM SaaS (Pipedrive trial)
- [ ] Set up email marketing (Brevo)
- [ ] Research accounting integration (Xero)
- [ ] Plan next product enhancement (from feedback)
- [ ] **Milestone:** System repeatable, team trained, scaling plan ready

---

## 🎯 Success Metrics Dashboard

Track these weekly:

| Metric | Week 4 Target | Week 8 Target | Week 12 Target |
|--------|---------------|---------------|----------------|
| Leads generated | 5-10 | 20-30 | 50-100 |
| Lead → Contacted (within 1h) | >80% | >90% | >95% |
| Contacted → Qualified | >20% | >25% | >30% |
| Qualified → Quote | >60% | >70% | >80% |
| Quote → Deal | — | >10% | >20% |
| Installations completed | 0 | 0-1 | 1-3 |
| Ad spend (฿/day) | 0 | 1,000 | 1,000-2,000 |
| CAC (Customer Acquisition Cost) | — | <฿3,000 | <฿2,500 |
| Customer satisfaction | — | — | >4.5/5 |
| Revenue (฿) | 0 | 0 | 500,000+ |

---

## 🔄 Weekly Review Cadence

**Monday 9:00-9:30 — Weekly Standup**

```
1. Metrics review (5 min)
   - Leads last week: X
   - Quotes sent: X
   - Deals closed: X
   - Ad spend: ฿X, CAC: ฿X
   - Issues from Sentry

2. Wins (5 min)
   - What went well?
   - Customer praise?
   - Team shoutouts?

3. Problems (10 min)
   - Bottlenecks?
   - Customer objections?
   - Technical issues?
   - Resource constraints?

4. This week's priorities (10 min)
   - Top 3 things to accomplish
   - Who owns each?
   - Any blockers?

5. Action items (5 min)
   - Specific tasks with owner + due date
```

**Friday 17:00-17:30 — Marketing Review**

```
- Ads performance this week
- Cost per lead
- Lead quality assessment
- Next week's ad budget allocation
- Creative refresh needed?
```

---

## 📚 Document Quick Reference

| Document | Size | Use When... |
|----------|------|-------------|
| `FIRST_90_DAYS_ACTION_PLAN.md` | 15 KB | Need daily tasks, concrete deadlines |
| `LAUNCH_PLAYBOOK.md` | 25 KB | Need holistic view of all aspects |
| `RESEARCH_MASTER_PLAN.md` | 12 KB | Need to research specific topics (15) |
| `THAI_MARKET_ANALYSIS.md` | 18 KB | Pricing, competitors, market sizing |
| `MANPOWER_TEAM_SCALING.md` | 20 KB | Hiring, roles, compensation, Thai labor |
| `TECH_STACK_SAAS_PLATFORMS.md` | 16 KB | Choosing CRM, Email, Payments, accounting |
| `CRYPTO_BLOCKCHAIN_OPPORTUNITIES.md` | 17 KB | Innovative tokenization, P2P energy |
| `PROJECT_INDEX.md` | 5 KB | Find any document quickly |

---

## 🎪 Decision Log

Record major decisions here for future reference:

| Date | Decision | Alternatives considered | Reasoning | Owner |
|------|----------|------------------------|-----------|-------|
| | | | | |
| | | | | |

---

## 🆘 Emergency Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| Security breach | — | Immediate |
| Database down | — | <2h |
| AI API failure | — | <1h |
| Installation issue | — | <4h |
| Legal question | — | <24h |

---

## 🎯 Next Actions (RIGHT NOW)

### Today (Day 1):
1. [ ] Read `FIRST_90_DAYS_ACTION_PLAN.md` completely
2. [ ] Mark Week 1 tasks as in-progress in your task tracker
3. [ ] Create company registration research doc (Topic 1)
4. [ ] Contact 3 suppliers for quotes (Topic 2)

### This Week:
5. [ ] Complete RLS + Auth (Week 1-2 tasks)
6. [ ] Register company (or start process)
7. [ ] Hire first admin (post job, interview)
8. [ ] Complete Installation checklist draft

### This Month:
9. [ ] All P0 security items done
10. [ ] First admin trained
11. [ ] Ads live
12. [ ] First lead received

---

## 📈 Pro Tips

1. **Don't skip security** (RLS, Auth) — one breach = game over
2. **Research before hire** — know Thai labor laws before employing anyone
3. **Test installation yourself** before letting partners do it
4. **Track CAC from day 1** — know your unit economics early
5. **Document everything** — SOPs save you when scaling
6. **Fail fast on marketing** — if CPC > Value, pause immediately
7. **Legal review before taking payment** — T&C, Privacy Policy must be in place
8. **First installation supervised by you** — quality control critical

---

## 🔄 How This Roadmap Evolves

**Weekly update:**
1. Review `FIRST_90_DAYS_ACTION_PLAN.md` progress
2. Mark completed items ✅
3. Add new tasks discovered
4. Adjust timeline if needed
5. Update this document's "Real Timeline" section

**Milestone updates:**
- After Week 4: Update success metrics, adjust Phase 2
- After Week 8: Update based on lead quality, conversion rates
- After Week 12: Create "Month 4-6 Scaling Plan" document

---

**You are now ready to begin.**  
Start with: [`FIRST_90_DAYS_ACTION_PLAN.md`](FIRST_90_DAYS_ACTION_PLAN.md)

---

*Документ обновлён: 18 May 2026*  
*Last reviewed: [Date]*
