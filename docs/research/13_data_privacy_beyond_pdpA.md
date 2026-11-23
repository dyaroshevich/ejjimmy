# Topic 13: Data Privacy Beyond PDPA — Cross-Border, Localization

**Status:** Not started  
**Researcher:** —  
**Date started:** —  
**Date completed:** —

**Context:** Thailand's PDPA (Personal Data Protection Act) is local. But what if:
- We store data on Supabase (US servers)?
- We have foreign customers (expats in Thailand)?
- We expand to Vietnam/Cambodia?

---

## Executive Summary

**Key considerations:**
1. **Data localization:** Must we store Thai customer data in Thailand?
2. **Cross-border transfer:** Can we send data to US (Supabase)?
3. **Foreign customers:** Are they protected by PDPA or GDPR?
4. **Expansion to other countries:** Need compliance with each country's laws

**Current setup:** Supabase (US servers) — is this allowed under PDPA?

---

## PDPA Cross-Border Transfer Rules

**Section 28 of PDPA:**
- Personal data can be transferred out of Thailand IF:
  - Destination country has adequate protection (like UK, EU, Japan, Singapore — on whitelist?)
  - OR data subject consents after being informed of risks
  - OR data is for fulfilling contract with data subject
  - OR necessary for important public interest

**Supabase servers:** US is NOT on Thailand's adequate protection list (likely)

**Implication:** Need explicit consent from customer to store data outside Thailand, or use Thailand-based hosting.

---

## Options for Compliance

### Option 1: Use Thailand-Based Hosting
- Move from Supabase (US) to Thai data center
- Providers: CAT Telecom, True IDC, AWS Bangkok region?
- Cost: higher, but compliant automatically

### Option 2: Explicit Consent
- In LeadForm: checkbox "I consent to my data being stored outside Thailand (US servers)"
- Document consent
- Risk: if data breach, customers can sue — but we warned them

### Option 3: Apply for Exemption
- PDPA allows transfer if "necessary for the benefit of the data subject" — argue that US cloud provides better security
- But risky

---

## GDPR Considerations

**If we serve EU citizens in Thailand (expats):**
- GDPR applies if we offer goods/services to EU residents OR monitor behavior
- GDPR stricter than PDPA:
  - Must have legal basis for processing (consent, contract)
  - Data subject rights: access, erasure, portability
  - Data Protection Officer (DPO) required if large scale
  - Fines up to 4% revenue

**How to handle:**
- Add EU-specific consent clause
- Privacy Policy covering both PDPA and GDPR
- Ensure data can be exported (subject access request)
- Delete on request (right to be forgotten)

---

## Data Localization Requirements

**Thailand:** No blanket localization requirement for all data. But certain sectors might:
- Financial data? (not relevant)
- Government data? (no)
- Healthcare? (patient data requires localization?)

**Our case:** Solar installation data not sensitive — probably OK to store abroad with consent.

---

## Customer Data Storage Decisions

### Where we store:
- **Supabase (US):** convenient, cheap
- **Alternative:** Supabase Bangkok region? (check if available — Supabase has regions, Bangkok maybe?)
- **Alternative:** Self-host on Thai VPS

---

## International Expansion Data Privacy

**If expand to Vietnam:**
- Vietnam has PDPA-like law
- Requires localization? (maybe)
- Cross-border transfer to Thailand allowed? (need check)

**If expand to Cambodia:**
- No comprehensive PDPA yet
- Less regulation

**Strategy for multi-country:**
- Use regional data centers: Singapore for SEA? (better connectivity)
- Implement geo-restrictions on data access
- Privacy Policy per country (jurisdiction-specific)

---

## ❓ Open Questions

1. **Sup Bangkok region exist?** Check Supabase regions list — Bangkok available? If yes, just switch project to Bangkok region (no code change)
2. **Do we need lawyer review PDPA?** Yes, for consent wording
3. **What breaches need to be reported?** PDPA: within 72 hours to regulator + affected individuals
4. **Can we use US cloud if we encrypt data?** Encryption helps but doesn't eliminate requirement
5. **What about AI chat logs?** They contain personal data (name, phone) — same rules apply

---

## ✅ Recommendations

1. **Check Supabase Bangkok availability** — easiest fix (pay for Pro/Business plan and select region)
2. **If Bangkok not available:**
   - Add consent checkbox at lead capture
   - Document in Privacy Policy
   - Keep data minimized (delete after 3 years if not active)
3. **Create Data Processing Policy:**
   - What data we collect
   - Where stored (geographic location)
   - Who has access (employees, third parties)
   - How long retained
   - Security measures (encryption, access controls)
4. **Data retention schedule:**
   - Leads: keep 3 years after last contact (then delete)
   - Chat logs: 1 year
   - Installed customer data: 7 years (tax purposes)
5. **Data Subject Rights process:**
   - How to handle deletion requests
   - How to provide data export
   - Response time SLA (30 days?)
6. **Breach response plan:**
   - Notify regulator within 72h
   - Notify affected individuals
   - Contain, eradicate, recover
   - Post-mortem

---

**Next actions:**
1. Check Supabase regions for Bangkok
2. If not available, consult Thai lawyer about consent-based transfer
3. Update Privacy Policy draft with cross-border statement
4. Add consent checkbox to LeadForm (if needed)
5. Document data flow diagram (where data goes)
6. Set up data retention automation (delete old leads after 3 years)

---

*Status:* Not started — P2 (legal, low urgency if using Supabase US with consent)
