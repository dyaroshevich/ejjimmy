# Topic 10: Third-Party Integrations — Research Report

**Status:** Not started  
**Researcher:** —  
**Date started:** —  
**Date completed:** —

**Integrations needed:**
1. Accounting (Xero/QuickBooks)
2. Payments (PromptPay, 2C2P, Stripe)
3. SMS notifications
4. E-signature
5. Email marketing (Brevo)
6. CRM (Pipedrive)

---

## Executive Summary

**Goal:** Automate workflows, reduce manual data entry, improve customer experience.

**Approach:** Research each integration's:
- API availability & cost
- Implementation effort (hours)
- Monthly cost
- Reliability

---

## 1. Accounting Integration (Xero/QuickBooks)

**Why:** Auto-sync invoices, payments, expenses

### Xero:
- **API:** RESTful, good documentation
- **Cost:** ฿300-500/month (Starter plan)
- **Implementation:** 2-3 days dev time
- **What to sync:** Invoices (from leads), payments received, supplier bills
- **Connect:** OAuth 2.0, webhooks for real-time

### QuickBooks:
- Similar to Xero
- Might be less common in Thailand

**Recommendation:** Xero (popular in Thailand)

---

## 2. Payment Gateways

### PromptPay (Thai bank transfer):
- **How:** Generate QR code for each invoice
- **API:** Bank-specific (KBank, SCB, BBL all have APIs)
- **Cost:** ~0.5-1% per transaction (varies by bank)
- **Implementation:** 3-5 days per bank
- **UI:** Show QR in invoice, customer scans with bank app

### 2C2P:
- Payment aggregator (accepts all cards + PromptPay)
- **Cost:** 2.5-3.5% + ฿10/transaction
- **Integration:** 3-5 days
- **Good for:** Customers who want to pay by card

### Stripe Thailand:
- Check if available (Stripe launched in Thailand?)
- If yes: 2.9% + ฿10
- Excellent API, developer friendly

**Recommendation:** Start with PromptPay QR (cheapest), add 2C2P later for card payments.

---

## 3. SMS Gateways

**Why:** Send OTP, appointment reminders, payment reminders

### Providers in Thailand:
- **SMS Thailand** (sms.co.th)
- **TrueMoney** SMS API
- **Greentea** (011? numbers)

**Cost:** ฿0.50-1.00 per SMS

**Implementation:** Simple HTTP API, 1 day

**Use cases:**
- "Your installation is scheduled for tomorrow"
- "Payment reminder: ฿XXX due in 3 days"
- "Your quote is ready"

---

## 4. E-Signature

**Need:** Customer signs contract electronically

### Options:

#### DocuSign:
- Global standard
- Cost: ~$25-50/month
- API: excellent
- Legal in Thailand? (Yes, Electronic Transactions Act)

#### PandaDoc:
- Built into quoting workflow
- Cost: ~$30-50/month
- Includes e-signature + tracking

#### ElephantSign (Thai):
- Local provider
- Cost: ฿500-1,000/month
- Thai language support

**Recommendation:** PandaDoc (integrates with quotes)

---

## 5. Email Marketing (Brevo/Sendinblue)

**Already covered in TECH_STACK_SAAS_PLATFORMS.md**

- **Brevo:** ~฿800/month for 20k emails
- **API:** easy integration
- **Automation:** welcome series, follow-ups

---

## 6. CRM Integration (Pipedrive)

**Already covered** — but integration with our admin panel?

**Options:**
- Direct Pipedrive API (bidirectional sync)
- Use Zapier/Make.com as middleware (~$30/month)

**Sync direction:**
- Lead created in our form → create deal in Pipedrive
- Deal updated in Pipedrive → update lead in our DB
- Two-way sync complexity: medium

**Recommendation:** If we adopt Pipedrive, build direct API integration (better control)

---

## Integration Architecture

```
Our Admin Panel (Next.js + Supabase)
      ↓
Webhooks/API Calls
      ↓
Third-Party Services
      ↓
Data flows back via webhooks
```

**Challenges:**
- Error handling (what if Xero API down?)
- Data consistency (race conditions)
- Webhook security (verify signatures)

---

## Implementation Priority

| Integration | Priority | Effort (days) | Cost/mo | Value |
|-------------|----------|---------------|---------|-------|
| PromptPay QR (bank) | P0 ( payment ) | 3 | ฿0 + fee | High |
| Xero | P1 ( finance ) | 3 | ฿500 | High |
| SMS | P1 ( ops ) | 2 | ฿500 | Medium |
| PandaDoc | P2 ( sales ) | 4 | ฿1,500 | High |
| Pipedrive sync | P2 ( CRM ) | 5 | Included | Medium |
| 2C2P | P3 ( optional ) | 4 | ฿1,000 + fee | Low (early) |

**Total dev time:** ~21 days (3 weeks) if done sequentially

---

## ❓ Open Questions

1. **Do we need all these integrations from day 1?** No — start with PromptPay + manual invoicing
2. **Can we use Zapier instead of custom API?** Yes, but costs $30-50/mo and less reliable
3. **Payment timing:** when to trigger? Invoice created → send QR? Or when approved?
4. **Tax calculation:** does Xero handle Thai VAT automatically?
5. **Multi-currency:** if we serve expats, need USD pricing?

---

## ✅ Recommendations

1. **Phase approach:**
   - Phase 1: Manual invoicing (Google Sheet PDF) + PromptPay simple QR
   - Phase 2: Add Xero integration (automate accounting)
   - Phase 3: Add PandaDoc for e-signature + tracking
   - Phase 4: Add SMS notifications
   - Phase 5: Full CRM sync

2. **Build abstractions:**
   - Create `services/payment.ts`, `services/accounting.ts` — easy to swap providers later
   - Use webhook handlers with retry logic

3. **Monitor failed integrations:**
   - Log all API calls, errors
   - Alert on consecutive failures

---

## 📞 Key Contacts

| Service | Contact | Pricing Page |
|---------|---------|--------------|
| Xero Thailand | partner@xero.com | xero.com/th |
| KBank Business API | business@kbank.com | kbizapp.com |
| 2C2P | business@2c2p.com | 2c2p.com |
| PandaDoc | sales@pandadoc.com | pandadoc.com |
| SMS Thailand | info@smsthai.com | sms.co.th |

---

**Next actions:**
1. Get PromptPay API credentials from your bank (KBank/SCB)
2. Sign up for Xero trial, explore API
3. Build simple PromptPay integration (QR generation)
4. Test flow: create invoice → generate QR → send to customer

---

*Status:* Not started — P2 (implement as needed)
