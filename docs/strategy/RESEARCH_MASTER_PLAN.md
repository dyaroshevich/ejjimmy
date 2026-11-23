# Tawan Power — Research Master Plan

**Дата:** 18 May 2026  
**Цель:** Единый ориентир для исследования всех критических тем  
**Метод:** Каждую тему исследуем досконально, результаты в отдельном MD-файле

---

## 🎯 Философия исследования

### Принципы:
1. **Один источник истины** — все findings сохраняем в docs/research/
2. **链接化** — cross-reference между документами
3. **Проверяемость** — каждый факт с источником (URL, документ, контакт)
4. **Actionable** — выводы: что делать, кто отвечает, дедлайн
5. **Версионность** — обновляем когда информация устаревает

### Process:
```
1. Create research doc для темы (шаблон ниже)
2. Сбор информации (1-3 дня)
3. Интервью с экспертами (если нужно)
4. Document findings + recommendations
5. Update this master plan (status, owner)
6. Create tasks в FIRST_90_DAYS_ACTION_PLAN
```

---

## 📋 The 15 Research Topics (в порядке приоритета)

### 🔴 P0 — Critical для launch (сделать в первые 30 дней)

| # | Тема | Why critical | Срок | Owner |
|---|------|--------------|------|-------|
| 1 | **Company Registration** (Бизнес-регулирование) | Без регистрации нельзя работать легально, принимать платежи | Week 1-2 | Founder |
| 2 | **Suppliers Research** (Поставщики) | Нужно знать COGS для ценообразования, заключить контракты | Week 1-3 | Founder |
| 3 | **Permits & Regulations** (Разрешения) | Установка без permits = illegal, штрафы, приостановка | Week 2-4 | Founder |
| 4 | **Insurance Requirements** (Страхование) | Liability без страховки = риски, клиенты требуют | Week 3-4 | Founder |

### 🟡 P1 — Important для scale (сделать в дни 30-60)

| # | Тема | Why important | Срок | Owner |
|---|------|---------------|------|-------|
| 5 | **Customer Financing** (Финансирование) | Без financing теряем 70% клиентов (не могут заплатить lump sum) | Week 5-6 | Founder |
| 6 | **Certifications** (Сертификации) | Без TISI/сертификатов нельзя продавать некоторые продукты | Week 4-6 | Founder |
| 7 | **Competitor Analysis** (Конкуренты) | Нужно знать ценовое поле, конкурентные преимущества | Week 5-7 | Marketing |
| 8 | **Thai Digital Marketing** (Маркетинг) | Без Ads = 0 leads, нужно CPC, conversion rate | Week 6-8 | Marketing |

### 🟢 P2 — Nice to have (сделать в дни 60-90)

| # | Тема | Why nice-to-have | Срок | Owner |
|---|------|------------------|------|-------|
| 9 | **After-Sales Service Model** | Улучшает ретенцию, рефералы, LTV | Week 8-10 | Ops |
| 10 | **Third-Party Integrations** | Автоматизация (Xero, e-signature) экономит время | Week 9-11 | Dev |
| 11 | **Waste Management** | ESG compliance, future regulation risk | Week 10-12 | Ops |
| 12 | **Import/Export** | Если будем импортировать оборудование напрямую | Week 11-12 | Founder |
| 13 | **Data Privacy Beyond PDPA** | Если экспансия за пределы Таиланда | Week 12+ | Legal |
| 14 | **ESG & Sustainability** | Для corporate customers, carbon credits | Week 12+ | Marketing |
| 15 | **Pricing Elasticity** | Оптимизация цен для максимизации revenue | Week 12+ | Marketing |

---

## 📄 Document Template (для каждой темы)

Каждое исследование создаётся как:

```markdown
# [Topic Name] — Research Report

**Status:** In Progress / Completed  
**Researcher:** [Name]  
**Date started:** [Date]  
**Date completed:** [Date]  
**Sources interviewed:** [List]  
**Documents reviewed:** [List]

---

## Executive Summary (2-3 paragraph)

Кратко: что мы узнали, главные выводы, рекомендация.

---

## Detailed Findings

### 1. [Sub-topic 1]
Подробное описание, факты, цифры.

### 2. [Sub-topic 2]
...

---

## 📊 Data & Numbers

Таблицы, графики, конкретные цифры.

---

## ❓ Open Questions

Что неясно, что нужно исследовать дополнительно.

---

## ✅ Recommendations

### What to do:
1. [Action item 1]
2. [Action item 2]

### What NOT to do:
1. [Pitfall to avoid]

### Timeline:
- [Date]: [Milestone]
- [Date]: [Milestone]

---

## 📞 Key Contacts

| Name | Organization | Role | Contact | Notes |
|------|--------------|------|---------|-------|

---

## 📚 Sources & References

1. [URL] — Description
2. [Document] — Location in repo
3. [Person] — Conversation date

---

## 🔄 Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| | | | |

```

---

## 🎯 Topic 1: Company Registration (Бизнес-регулирование Таиланда)

### Sub-topics to research:
1. **Company structures:**
   - Sole proprietorship
   - Partnership (открытое/закрытое)
   - Private limited company (Ltd)
   - Public limited company
   - BOI promoted company

2. **Foreign ownership restrictions:**
   - Which industries restricted? (List of businesses reserved for Thais)
   - Is solar considered "restricted"?
   - Minimum Thai shareholder % required?
   - BOI exception: can foreigner own 100%?

3. **BOI promotion (Board of Investment):**
   - Eligibility criteria for solar/tech companies
   - Tax incentives: corporate tax % ( normally 20% ) → BOI can be 0-5 years免税
   - Land ownership rights (foreigners can own land with BOI?)
   - Import duty exemptions on machinery
   - How to apply, timeline, cost
   - Required documentation

4. **Registration process:**
   - DBD (Department of Business Development) steps
   - Minimum capital requirement (฿100,000? ฿1M?)
   - Timeline: 1-2 недели?
   - Cost: government fees ~฿5,000-20,000?
   - Need Thai lawyer/accountant? Cost?

5. **Tax obligations:**
   - VAT registration threshold
   - Corporate income tax filing
   - Withholding tax на выплаты foreign contractors
   - Double taxation treaties (если foreign owner)

6. **Licenses beyond company registration:**
   - Business operation license (торговля/услуги)
   - VAT certificate
   - Social security registration (когда нанимаете сотрудников)
   - Work permit для foreign employees

7. **Bank account opening:**
   - Which banks friendly to foreigners? (Bangkok Bank, Kasikorn, SCB)
   - Required documents (company affidavit, director ID)
   - Initial deposit requirement
   - Timeline

8. **Annual compliance:**
   - Financial statements audit requirements
   - Annual filing fees
   - Tax return deadlines
   - BOI reporting requirements

---

## 🎯 Topic 2: Suppliers Research (Поставщики оборудования)

### Sub-topics:
1. **Panel suppliers:**
   - Jinko Solar: Tiger Neo, Cheetah, Eagle series — pricing, availability in Thailand
   - Longi: Hi-MO series
   - Canadian Solar: BiHiKu
   - Local distributors in Thailand: who are official dealers?
   - MOQ (Minimum Order Quantity)
   - Dealer pricing tiers (volume discounts)
   - Warranty: transfer to end customer? Registration process?
   - Lead time from order to delivery
   - Payment terms: NET 30, prepayment?

2. **Inverter suppliers:**
   - Huawei: SUN2000 series, FusionSolar app, warranty
   - Growatt: MIN series, monitoring
   - Sofar: Solar series
   - Enphase: IQ series (microinverters) — price premium
   - Distribution in Thailand, service centers

3. **Battery suppliers:**
   - Huawei LUNA2000
   - BYD Battery-Box
   - CATL
   - Compatibility with inverters

4. **Racking & mounting:**
   - Local manufacturers vs import
   - Aluminium vs steel
   - Roof-mounted vs ground-mounted
   - Corrosion resistance for coastal (Phuket)

5. **Tools & safety equipment:**
   - Essential tools for installers
   - Safety gear (harnesses, helmets)
   - Where to buy (HomePro, local electrical shops)

6. **Supplier evaluation criteria:**
   - Price comparison matrix
   - Warranty terms (length, claim process)
   - Technical support availability
   - Spare parts availability
   - Credit terms (NET 30)

7. **Total BOM (Bill of Materials) cost breakdown:**
   - 5kW system breakdown (panels %, inverter %, racking %, other %)
   - 10kW system breakdown
   - Commercial 30kW+

---

## 🎯 Topic 3: Permits & Regulations Process

### Sub-topics:
1. **MEA/PEA Interconnection:**
   - Application process: documents required
   - Timeline: how long from application to approval? (2-6 недель typical?)
   - Fees: connection fee, inspection fee
   - Net metering agreement (PPA) — duration, terms
   - Requirements: system design must meet their standards
   - Insurance requirement (proof of liability)
   - Meter change: who does it, cost?

2. **Building Permit:**
   - When required? (all solar installations?)
   - Which authority? (Local municipality, district office)
   - Required documents: structural drawings, engineer certification
   - Timeline and cost
   - Does mounting affect building structure? Need structural engineer?

3. **Fire Department Approval:**
   - When needed? (large systems >10kW?)
   - Fire safety plan
   - Wiring compliance

4. **Environmental Permits:**
   - For commercial >50kW systems?
   - Environmental impact assessment

5. **Permit timeline mapping:**
   ```
   Day 0: Apply MEA/PEA
   Day 7: Submit supporting docs
   Day 14: Site inspection scheduled
   Day 21: Approval granted OR revisions needed
   Day 28: Final approval + PPA signed
   ```
   - Who is responsible for each step? (We or customer?)
   - Fast-track options?

6. **IEC standards compliance:**
   - Which standards apply? (IEC 62446, IEC 61730)
   - Certificate of conformity for equipment
   - Inspection checklist

---

## 🎯 Topic 4: Insurance Requirements

### Sub-topics:
1. **Types of insurance needed:**
   - **Public liability** — third party injury/damage during installation
   - **Workman's compensation** — mandatory for employees
   - **Professional indemnity** — errors/omissions
   - **Equipment all-risk** — tools, materials during transit/installation
   - **Warranty insurance** (optional) — guarantee performance

2. **Providers in Thailand:**
   - FWD, Tokio Marine, AIA, Bangkok Insurance
   -Specialized insurers for renewable energy?
   - Insurance brokers who understand solar

3. **Coverage & Limits:**
   - Minimum liability coverage: ฿1M, ฿5M, ฿10M?
   - What's excluded? (Acts of God, poor workmanship)
   - Deductible amounts

4. **Costs:**
   - Small installer (1-5 employees): ฿X/mo
   - Per-installation insurance (optional add-on for customer)
   - Factors affecting premium: turnover, claims history, safety record

5. **Certificates of Insurance (COI):**
   - When customer requires proof
   - Additional insured (customer name)
   - Validity period

6. **Claims process:**
   - What incidents trigger claim?
   - Documentation needed
   - Timeline for payout

7. **Insurance for customers (recommended):**
   - Extension to homeowner's insurance for solar equipment
   - Performance guarantee insurance

---

## 🎯 Topic 5: Customer Financing Options

### Sub-topics:
1. **Bank partnerships:**
   - **KBank:** Green loan products, interest rates
   - **SCB:** Solar financing? Home equity loans
   - **Bangkok Bank:** Renewable energy loans
   - **Government banks:** GSB (Government Savings Bank) — special rates?
   - Commission structure for referrals: 1-3% of loan amount?
   - Application process for customer (docs, timeline)
   - Approval rate, typical loan terms (1-7 years)

2. **Leasing companies:**
   - Asia Leasing, CP ALL, others
   - How it works: we lease system to customer, fixed monthly
   - Contract terms: 3-5 years, buyout option
   - Our revenue: lease margin, service fee
   - Credit risk on us?

3. **In-house financing (dealer financing):**
   - Can we offer 0% financing from own balance sheet?
   - Capital required: ฿X upfront for each system
   - ROI calculation: if we finance ฿300k over 5 years at 0%, what's cost of capital?
   - Legal: need money lending license?

4. **PromptPay installment:**
   - Can we set up recurring QR code?
   - Auto-debit through bank (separate agreement)
   - Cheapest option but requires customer to manually pay monthly

5. **Power Purchase Agreement (PPA) model:**
   - We own the system, customer pays for energy produced ( cheaper than grid )
   - Popular with businesses (no CAPEX)
   - 10-25 year contracts
   - Revenue stream for us (long-term)
   - Requires significant capital

6. **PACE-like financing (Property Assessed Clean Energy):**
   - Not available in Thailand yet? Research
   - Property tax lien for solar loan
   - Long-term (20 years), low rate

7. **Crypto-backed financing** (innovative):
   - Customer pledges crypto collateral
   - We give loan for solar
   - Smart contract auto-liquidate if default

8. **Financing eligibility criteria:**
   - Minimum income
   - Property ownership proof
   - Credit score requirements (Thai credit bureau)
   - Down payment: 0%, 10%, 20%?

9. **Customer financing conversion impact:**
   - Estimate: what % of customers need financing?
   - Test: if we offer financing, conversion rate increase from X% to Y%
   - Average order value increase (bigger systems with financing)

---

[Продолжение для остальных 12 тем...]

---

## 📊 Master Tracker

| Topic | Status | Researcher | Started | Completed | Doc File | Priority |
|-------|--------|------------|---------|-----------|----------|----------|
| 1. Company Registration | Template created | — | — | — | [docs/research/01_company_registration_thailand.md](docs/research/01_company_registration_thailand.md) | P0 |
| 2. Suppliers | Template created | — | — | — | [docs/research/02_suppliers_equipment_research.md](docs/research/02_suppliers_equipment_research.md) | P0 |
| 3. Permits | Template created | — | — | — | [docs/research/03_permits_regulations_thailand.md](docs/research/03_permits_regulations_thailand.md) | P0 |
| 4. Insurance | Template created | — | — | — | [docs/research/04_insurance_requirements_thailand.md](docs/research/04_insurance_requirements_thailand.md) | P0 |
| 5. Financing | Template created | — | — | — | [docs/research/05_customer_financing_thailand.md](docs/research/05_customer_financing_thailand.md) | P1 |
| 6. Certifications | Template created | — | — | — | [docs/research/06_certifications_standards_thailand.md](docs/research/06_certifications_standards_thailand.md) | P1 |
| 7. Competitors | Template created | — | — | — | [docs/research/07_competitor_analysis_thailand.md](docs/research/07_competitor_analysis_thailand.md) | P1 |
| 8. Digital Marketing | Template created | — | — | — | [docs/research/08_digital_marketing_thailand.md](docs/research/08_digital_marketing_thailand.md) | P1 |
| 9. After-Sales | Template created | — | — | — | [docs/research/09_after_sales_service_model.md](docs/research/09_after_sales_service_model.md) | P2 |
| 10. Integrations | Template created | — | — | — | [docs/research/10_integrations_third_party.md](docs/research/10_integrations_third_party.md) | P2 |
| 11. Waste Management | Template created | — | — | — | [docs/research/11_waste_management.md](docs/research/11_waste_management.md) | P2 |
| 12. Import/Export | Template created | — | — | — | [docs/research/12_import_export_thailand.md](docs/research/12_import_export_thailand.md) | P2 |
| 13. Data Privacy | Template created | — | — | — | [docs/research/13_data_privacy_beyond_pdpA.md](docs/research/13_data_privacy_beyond_pdpA.md) | P2 |
| 14. ESG | Template created | — | — | — | [docs/research/14_esg_sustainability.md](docs/research/14_esg_sustainability.md) | P2 |
| 15. Pricing Elasticity | Template created | — | — | — | [docs/research/15_pricing_elasticity.md](docs/research/15_pricing_elasticity.md) | P2 |

---

## 🚀 How to Use This Document

1. **Select priority topic** from P0 list
2. **Create research document** using template above
3. **Conduct research** (1-3 days per topic):
   - Google search (Thai + English)
   - Interview suppliers, lawyers, other business owners
   - Read government websites
   - Call insurance brokers, banks
4. **Write findings** in structured format
5. **Update this tracker** with completion status
6. **Extract action items** into FIRST_90_DAYS_ACTION_PLAN
7. **Repeat** for next topic

---

**Next actions:**
1. Start Topic 1: Company Registration (P0)
2. Topic 2: Suppliers (P0) — can parallel with Topic 1
3. Topic 3: Permits (P0) — depends on #1 completion

---

*Документ обновлён: 18 May 2026*
