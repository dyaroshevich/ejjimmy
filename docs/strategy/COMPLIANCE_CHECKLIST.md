# 🛡️ Tawan Power: Compliance & Legal Checklist

**Document Type:** Regulatory & Legal Compliance  
**Version:** 1.0  
**Date:** 2026-05-15  
**Project:** Solar Krabi AI Advisor → Tawan Power  
**Owner:** Founder / Legal Counsel  
**Status:** Pre-Launch (Must complete before collecting first lead)

---

## ⚠️ WARNING: Why Compliance Matters

If you ignore compliance, you risk:
- **Thai PDPA fines:** up to ฿1,000,000 + 1 year imprisonment for serious violations
- **Loss of customer trust:** data breach → brand damage, churn
- **Business shutdown:** operating without proper licenses
- **Legal liability:** selling solar systems without proper certification

**Bottom line:** Compliance is not optional. It's the foundation for scaling legally.

---

## 📋 Quick Reference: Compliance Phases

| Phase | When | Key Actions | Owner |
|-------|------|-------------|-------|
| **Pre-Launch** | Before first lead | PDPA consent, ToS, Privacy Policy, RLS | Founder |
| **Day 1** | Launch day | Verify everything works, data minimization | FS-TS Engineer |
| **Weekly** | Ongoing | Lead data audit, access logs review | Support / Founder |
| **Monthly** | Ongoing | Security check, backup verification, policy updates | Founder |

---

## ✅ SECTION A: Thai PDPA (Personal Data Protection Act)

### What is PDPA?
Thai law governing personal data (similar to GDPR). Applies to **any personal information** you collect: phone number, LINE ID, name, email, chat transcripts if they contain identifiable info.

**Territorial scope:** Even if company is foreign, if you process data of Thai residents → PDPA applies.

### Penalties for Non-Compliance
- **Minor:** fine ฿100,000 - ฿500,000
- **Serious:** fine ฿500,000 - ฿1,000,000 + up to 1 year imprisonment
- **Corporate:** fines apply to company + responsible individuals

### PDPA Compliance Checklist

#### Data Collection & Consent
- [ ] **Explicit consent checkbox** BEFORE saving lead:
  ```tsx
  // In your lead capture form (before "Save" button):
  <Checkbox required>
    I agree to Tawan Power's Privacy Policy and consent to processing my
    personal data for consultation purposes. I understand I can request
    deletion at any time.
  </Checkbox>
  ```
  - **Placement:** Checkbox must be UNCHECKED by default
  - **Link:** Link to Privacy Policy (opens in new tab)
  - **Required:** Save button disabled until checkbox checked
  - **Storage:** Store consent timestamp in DB (`consent_given_at TIMESTAMPTZ`)

- [ ] **Privacy Policy** accessible:
  - URL: `https://tawanpower.com/privacy` (or `/legal/privacy`)
  - Languages: **Thai + English** (Thai is legally required if collecting Thai residents)
  - Content includes:
    - What data you collect (PII list)
    - Why you collect it (legitimate interest: consultation)
    - How long you store it (retention period)
    - Who you share it with (installation partners, etc.)
    - Rights of data subject (access, correction, deletion)

- [ ] **Data minimization principle:**
  - Collect ONLY necessary data:
    - ✅ Required: phone/LINE ID (to contact), segment (for calc), bill_kwh (for estimate)
    - ❌ Optional: name? (could be optional, better user experience)
    - ❌ DON'T collect: ID card number, address, bank details (unless later)
  - Review current schema: are we collecting too much?

#### Data Storage & Security
- [ ] **Encryption at rest:**
  - Supabase default: ✅ YES (Postgres encryption enabled)
  - Verify: In Supabase dashboard → Database → Settings → Encryption

- [ ] **Encryption in transit:**
  - All API calls use HTTPS ✅ (Next.js/Vercel default)
  - Supabase client uses wss for Realtime ✅

- [ ] **Access control (RLS):**
  - Ensure RLS policies prevent unauthorized access:
    ```sql
    -- Users can only see their own leads (if authenticated)
    -- But we don't have auth yet → all leads are accessible to anyone with anon key
    -- FIX: Admin routes must use server-side supabase admin client
    CREATE POLICY "Admin only access" ON leads
      FOR ALL USING (auth.role() = 'service_role');
    ```
  - Review: who has access to `service_role` key? Only server-side env vars.

- [ ] **API key exposure:**
  - ✅ Groq/Gemini keys: in `.env` as `GROQ_API_KEY`, `GEMINI_API_KEY` (not `NEXT_PUBLIC_`)
  - ✅ Supabase anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose, has RLS)
  - ✅ Supabase service_role key: `SUPABASE_SERVICE_ROLE_KEY` (NEVER expose to client)
  - Check: `grep -r "service_role" src/` → must be server-only

#### Data Retention & Deletion
- [ ] **Retention period defined:**
  - How long do you keep leads? **Recommendation: 24 months** (enough for sales cycle)
  - Document in Privacy Policy: "We retain personal data for 24 months after last interaction"
  - Automated deletion: cron job that soft-deletes leads older than 24 months:
    ```sql
    UPDATE leads
    SET deleted_at = NOW()
    WHERE created_at < NOW() - INTERVAL '24 months'
      AND deleted_at IS NULL;
    ```

- [ ] **Right to erasure (deletion):**
  - Process: User asks "delete my data" via LINE/Slack/email → verify identity → delete within 30 days
  - Implementation: endpoint `/api/leads/[id]/delete` (soft delete, then hard delete after 30 days)
  - Log deletion for audit: `deleted_at`, `deleted_by`, `reason`

- [ ] **Data portability:** (optional but good practice)
  - Can user request their data in JSON format? Endpoint `/api/leads/[id]/export`
  - Verify identity before sending data

#### Data Breach Response
- [ ] **Incident response plan:**
  - Who to notify if breach? Founder + legal counsel
  - When? Within **72 hours** (PDPA requirement) → PDPA Office
  - What to include: nature of breach, approximate number of people, types of data, likely consequences, measures taken

- [ ] **Monitoring:**
  - Enable audit logging in Supabase: Track all SELECT/INSERT/UPDATE on `leads` table
  - Set up alerts: if anomalous access patterns (e.g., 100 queries in 1 minute from same IP)
  - Review logs weekly: who accessed leads data?

---

## ✅ SECTION B: Solar Business Regulations (Thailand)

### Do You Need a License?
**Short answer:** Possibly YES. Solar installation in Thailand requires licensed electricians. But **consultation** alone may not.

**What you do:**
- ✅ Provide preliminary estimates (calculations) — likely doesn't require license
- ❌ Design electrical systems, sign-off on safety — requires Professional Engineer (PE) license
- ❌ Actual installation — requires electrical contractor license

**Recommendation:** Your ToS must state: "Consultations are preliminary only. Final design and installation must be performed by licensed professionals."

#### Checklist: Regulatory Compliance

- [ ] **Business registration:**
  - Is your business registered in Thailand? (Company limited, sole proprietor)
  - If not, you're operating informal → partner with local entity
  - **Action:** Consult with Thai accountant/lawyer about legal entity requirements

- [ ] **Professional liability insurance:**
  - What if your calculation is wrong and client loses money?
  - Get Professional Indemnity Insurance (covers negligence claims)
  - Cost: ~฿10,000-฿20,000/year for small consulting business

- [ ] **Consumer protection:**
  - PDPA covers personal data; Trade Competition Act covers misleading advertising
  - Don't promise exact savings that you can't guarantee
  - Disclaimers in chat: "Estimates are preliminary based on average conditions"

- [ ] **Energy regulations:**
  - Grid connection: Understand process for feeding excess to grid (net metering in Thailand)
  - Building permits: Solar installations often require approval from local municipality
  - **Action:** Document this knowledge for AI responses (RAG can help)

- [ ] **VAT registration:**
  - If annual revenue > ฿1.8M → must register for VAT (7%)
  - If below threshold, can be VAT-exempt
  - **Action:** Track revenue, register when crossing threshold

---

## ✅ SECTION C: Terms of Service & Legal Documents

### Required Documents

#### 1. Terms of Service (ToS)
**Purpose:** Limit your liability, define user obligations, specify governing law.

**Location:** `/legal/terms` (EN) and `/legal/terms-th` (TH)

**Essential clauses:**

- [ ] **Service description:**
  ```
  Tawan Power provides preliminary solar consultation services via AI chatbot.
  Services are for informational purposes only and do not constitute
  professional engineering advice.
  ```

- [ ] **No warranty / "As is":**
  ```
  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
  WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
  ACCURACY, COMPLETENESS, OR FITNESS FOR A PARTICULAR PURPOSE.
  ```

- [ ] **Limitation of liability:**
  ```
  OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY USER IN THE PAST 12 MONTHS.
  IF USER HAS NOT PAID US, LIABILITY IS LIMITED TO ฿1,000.
  ```

- [ ] **Arbitration / Governing law:**
  ```
  These terms governed by Thai law. Disputes resolved in courts of Krabi Province.
  (Optional: Arbitration clause to avoid court)
  ```

- [ ] **User obligations:**
  - Provide accurate information
  - Not misuse the service (no spam, no illegal content)
  - Not reverse-engineer the AI

- [ ] **Changes to ToS:**
  - "We may update these terms. Continued use after changes constitutes acceptance."
  - Notify users via LINE/site announcement if material changes

- [ ] **Contact information:**
  ```
  Tawan Power Co., Ltd.
  Address: [Your Thai address]
  Email: legal@tawanpower.com
  Phone: +66 XX XXX XXXX
  ```

#### 2. Privacy Policy
**Location:** `/legal/privacy` (EN) and `/legal/privacy-th` (TH)

**Required sections:**

- [ ] **Data controller:** Who is responsible? (Tawan Power Co., Ltd.)
- [ ] **Data we collect:**
  - Contact info: phone number, LINE ID, name
  - Consultation data: segment, electricity bill (kWh), roof type, system preferences
  - Technical: IP address, user agent, session ID, chat history (if stored)
- [ ] **Purpose of processing:**
  - Provide consultation services
  - Generate estimates
  - Match with installation partners
  - Improve AI (anonymized data only, unless consent given)
- [ ] **Data retention period:**
  - "We retain personal data for 24 months after last interaction. After that, data is deleted or anonymized."
- [ ] **Data sharing:**
  - "We share your contact information with licensed solar installation partners for the purpose of completing your project."
  - List partners by name or "our certified installation partners"
- [ ] **Your rights under PDPA:**
  - Right to access (request copy of your data)
  - Right to correct (fix inaccuracies)
  - Right to delete (request erasure)
  - Right to restrict processing (in certain cases)
  - How to exercise: email privacy@tawanpower.com
- [ ] **International transfers:**
  - Data stored in Supabase (Singapore region) → is this international? Yes, from Thailand to Singapore.
  - "Supabase has adequate data protection measures (EU Standard Contractual Clauses)"
  - Document transfer mechanism: search "Supabase data transfer PDPA"
- [ ] **Cookies & analytics:**
  - List cookies you set (analytics, session)
  - Opt-out mechanism (if applicable)

#### 3. Cookie Consent (if using analytics)
- [ ] **Consent banner:**
  ```html
  <div id="cookie-consent">
    We use cookies to improve your experience. By continuing, you accept our Cookie Policy.
    <button>Accept</button> <a href="/legal/cookies">Learn More</a>
  </div>
  ```
  - Must appear on first visit
  - Must provide option to reject (but site should still work without analytics)
  - Store consent in `localStorage`: `cookieConsent = true`

- [ ] **Cookie Policy document:** `/legal/cookies`
  - List all cookies with purpose, duration, provider
  - Example:
    ```
    Name: _ga | Provider: Google Analytics | Purpose: Analytics | Duration: 2 years
    Name: session_id | Provider: Tawan Power | Purpose: Session state | Duration: 30 days
    ```

---

## ✅ SECTION D: Data Security & Access Control

### Access Control Checklist

- [ ] **Supabase Row Level Security (RLS):**
  - Go to Supabase dashboard → Table Editor → `leads` table
  - **RLS Enabled:** ✅ YES (toggle ON)
  - **Policies:**
    ```sql
    -- Allow authenticated users to see own leads (if you have user auth)
    -- For now, NO public access
    CREATE POLICY "Deny public access" ON leads
      FOR SELECT USING (false);

    -- Service role can access everything (server-side only)
    -- Next.js API routes use admin client (service_role key)
    ```
  - **Test:** Try to query `/api/leads` from browser console → should get 403

- [ ] **Next.js API route protection:**
  - Admin endpoints (`/api/admin/*`) should check for session or API key
  - At minimum: HTTP Basic Auth or simple password check:
    ```ts
    // In /api/admin/leads/route.ts
    if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
    ```
  - Generate `ADMIN_SECRET` and store in `.env` (not NEXT_PUBLIC)

- [ ] **Audit logging:**
  - Enable Supabase "Database → Logs → Audit logs" (paid feature? check plan)
  - Or create custom audit table:
    ```sql
    CREATE TABLE access_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT, -- if authenticated
      action TEXT, -- 'viewed_leads', 'downloaded_lead'
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      ip_address INET,
      user_agent TEXT
    );
    ```
  - Log every admin page view via `await fetch('/api/log-access', { method: 'POST', body: JSON.stringify({ action: 'viewed_dashboard' }) })`

- [ ] **Backup strategy:**
  - Supabase automated backups: ✅ YES (daily, retained for 7 days on Pro plan)
  - BUT: Need longer retention? (30 days, 90 days)
  - Manual backup: `supabase db dump` weekly, upload to S3/GCS
  - Schedule: Cron job on Vercel or external provider

- [ ] **Secrets management:**
  - All secrets in Vercel Environment Variables (Production, Preview, Development)
  - `.env.local` for local development (gitignored)
  - **Never commit secrets to git** (verify with `git grep -i "sk-"` or `git grep -i "key"`)
  - Rotate keys quarterly: Groq, Gemini, Supabase service_role

---

## ✅ SECTION E: AI-Generated Content Disclaimers

### Why This Matters
AI can hallucinate, make mistakes, give outdated info. You must set correct expectations.

#### Chat Disclaimers
- [ ] **First message in chat (system-level):**
  ```
  // In your system prompt:
  IMPORTANT: Include this disclaimer in your first message OR when user asks for specific numbers:
  "These estimates are preliminary based on average solar irradiance in Krabi (4.8 kWh/m²/day)
  and average electricity tariff (฿4.7/kWh). For accurate system design, please book a free
  site survey with our licensed engineer."
  ```

- [ ] **Result card footer (UI component):**
  ```tsx
  // In ResultCard.tsx
  <p className="text-xs text-gray-500 mt-2">
    ⚠️ Estimates are preliminary. Actual system may vary based on site conditions.
    Consult a licensed engineer for final design.
  </p>
  ```

- [ ] **Data sources disclosure on website:**
  - Footer or "How it works" page:
    ```
    Calculations based on:
    - Solar irradiance: 4.8 kWh/m²/day (Krabi average, source: MET/Thai Meteorological Department)
    - Electricity tariff: ฿4.7/kWh (PEA Category 1, 2026)
    - Panel efficiency: 20% (typical monocrystalline)
    - System losses: 14% (cabling, inverter, temperature)
    ```

- [ ] **No professional advice:**
  - Don't say "I recommend 10kW" → say "Based on your bill, typical system size would be 8-12kW"
  - Avoid words like "certify", "guarantee", "assure"
  - Use "estimated", "approximate", "typical", "based on averages"

#### AI Training Data & Sources
- [ ] **Document data sources:**
  - If using RAG later: "Our AI references product specifications from manufacturer datasheets"
  - Keep sources versioned (in case specs change)
  - If AI gives wrong info, can trace to source

- [ ] **Hallucination mitigation:**
  - Tool calling: AI must call `calculateSolar()` function, not make up numbers
  - Ground truth: Calculator values must match what AI reports (verify in tests)
  - Fallback: When uncertain, AI should say "I don't have enough information" rather than guess

---

## ✅ SECTION F: Specific to LINE Integration

### LINE Messaging Compliance
If using LINE Official Account or LIFF app:

- [ ] **LINE Terms of Service compliance:**
  - LINE has restrictions on commercial messaging
  - No spam: user must opt-in to receive messages
  - Provide "unsubscribe" option in every broadcast
  - Review: LINE Messaging API Terms of Use

- [ ] **User data from LINE:**
  - LINE provides user ID, display name, profile picture (if user grants)
  - This is personal data under PDPA → must have consent
  - Store LINE user ID only with consent (checkbox in chat)
  - Don't share LINE ID with third parties without explicit consent

- [ ] **LIFF app privacy:**
  - LIFF app runs in LINE browser → same origin restrictions apply
  - Don't access LINE user profile without permission (LIFF v2 requires `profile` scope)
  - Document what you access and why in Privacy Policy

---

## 🔄 SECTION G: Ongoing Compliance Operations

### Monthly Compliance Checklist

- [ ] **Review access logs:** Who accessed admin/dashboard in past month? Any anomalies?
- [ ] **Update Privacy Policy:** Did you start collecting new data? Update policy.
- [ ] **Check data retention:** Run cleanup script for old leads (>24 months)
- [ ] **Test deletion process:** Pick a test lead, request deletion, verify complete removal
- [ ] **Security scan:** Run vulnerability scan (e.g., `npm audit`, OWASP ZAP)
- [ ] **Backup verification:** Restore from backup to test it works (quarterly)
- [ ] **Legal updates:** Subscribe to Thai PDPA updates, solar industry changes

### Quarterly Compliance Checklist

- [ ] **Re-consent campaign:** If privacy policy changed significantly, ask users to re-consent
- [ ] **Third-party audit:** Consider hiring Thai legal firm to review compliance (cost ~฿20,000-฿50,000)
- [ ] **Incident response drill:** Simulate data breach, test 72-hour notification process
- [ ] **Staff training:** Anyone with data access must complete PDPA training (online course ~฿1,000/person)

---

## 📊 Compliance Dashboard (What to Track)

Create a simple dashboard (or Google Sheet) to monitor compliance health:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Leads with consent** | 100% | ?% | 🔴/🟢 |
| **Leads > 24 months** | 0% | ?% | 🔴/🟢 |
| **Admin access accounts** | ≤ 3 | ? | 🔴/🟢 |
| **Backup success rate** | 100% | ?% | 🔴/🟢 |
| **Privacy Policy language** | TH + EN | ? | 🔴/🟢 |
| **ToS acceptance** | Recorded per user? | ? | 🔴/🟢 |

---

## 🆘 Emergency Contacts

| Issue | Contact | When to use |
|-------|---------|-------------|
| **Data breach** | PDPA Office: 02-123-4567 (example) | Within 72 hours |
| **Legal questions** | Local law firm: [Name], Tel: +66 XX XXX XXXX | Anytime |
| **Cybersecurity incident** | Thai CERT: cert@thai.go.th | Hacking, ransomware |
| **Consumer complaint** | Office of Consumer Protection: 1556 | Customer threatens legal action |

---

## 📚 Resources & Templates

### Privacy Policy Template (Thai + EN)
- Start with iubenda.com or TermsFeed (paid but legally vetted)
- Adapt for Thailand: add PDPA-specific clauses
- Translate to Thai (use professional translator, not Google Translate)

### ToS Template
- Use Open Source ToS: https://github.com/terms-of-service/ (GitHub's ToS)
- Or Stripe ToS: https://stripe.com/en-th/legal/ssa (modify)

### PDPA Official Resources
- Website: https://www.pdpa.or.th
- Guidelines (EN): https://www.pdpa.or.th/en/
- Hotline: 02-123-4567 (replace with actual)

### Legal Counsel
- **Recommended:** Find Thai law firm specializing in tech/data privacy
- Cost: ฿15,000-฿30,000 for initial compliance review + document drafting
- **Action:** Email 3 firms, ask for quote "PDPA compliance review for AI startup"

---

## 🎯 Prioritization: What to Do First

### Day 1 (Pre-Launch, 2-3 hours):
1. Add consent checkbox to lead capture UI ✅
2. Write basic Privacy Policy (EN) — 1 page using template
3. Enable RLS in Supabase ✅
4. Verify no NEXT_PUBLIC secrets ✅
5. Add disclaimer to chat system prompt ✅

### Week 1 (Pre-Launch, 5-10 hours):
6. Translate Privacy Policy to Thai (outsource, ฿2,000)
7. Create ToS (using template)
8. Set up backup automation (supabase db dump weekly)
9. Implement `/api/leads/[id]/delete` endpoint
10. Test: Try to query leads without service_role key → should fail

### Month 1 (Ongoing):
11. Monthly audit logs review
12. Create compliance dashboard (track metrics)
13. Engage legal counsel for full review
14. Document data retention/delete process for support staff

---

## ❓ Common Questions

**Q: Do I need PDPA compliance if I only collect LINE IDs?**  
A: YES. LINE ID is personal data if it can identify a person. PDPA applies.

**Q: Can I store leads in Google Sheets without PDPA issues?**  
A: Only if: (1) You have consent, (2) Google is your data processor (sign Data Processing Agreement), (3) Data stays in appropriate region (Google泰国数据中心?). Safer to use Supabase with Thai region? (Check Supabase regions)

**Q: Do I need to register as a business in Thailand?**  
A: If operating from abroad and only providing online consultation → maybe not. But if you have physical presence/employees → YES. Consult Thai accountant.

**Q: What if I'm just collecting data for research, not commercial?**  
A: PDPA has research exceptions, but you're planning commercial → no exception. Get consent.

**Q: My AI sometimes gives wrong numbers. Am I liable?**  
A: If disclaimer says "preliminary estimates only" and you direct to licensed engineer → mitigates liability. But should still fix bugs.

---

## ✅ Acceptance: Compliance "Go-Live" Sign-off

Before launching to real users, **must have**:

- [ ] Privacy Policy (TH + EN) published and linked from UI
- [ ] Consent checkbox working (test: try saving without checking → should fail)
- [ ] RLS enabled on leads table (test: anon key can't SELECT leads)
- [ ] Admin routes protected (test: `/api/admin/leads` returns 401 without correct header)
- [ ] Chat disclaimers added (test: chat first message includes disclaimer)
- [ ] Backup process tested (restore from backup on dev)
- [ ] Data deletion endpoint working (test: delete lead → DB marked)
- [ ] Legal review completed (or at least consulted)

**Sign-off by:** Founder (if solo) + Legal Counsel (if available)

---

**Document Owner:** @dyaroshevich  
**Last Updated:** 2026-05-15  
**Next Review:** After first 100 leads (validate compliance in practice)
