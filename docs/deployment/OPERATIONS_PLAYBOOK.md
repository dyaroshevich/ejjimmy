# 🎧 Tawan Power: Operations Playbook

**Document Type:** Customer Support & Lead Handoff Processes  
**Version:** 1.0  
**Date:** 2026-05-15  
**Project:** Solar Krabi AI Advisor → Tawan Power  
**Owner:** Support Lead / Founder  
**Status:** Active — Use for First 100 Leads (Pre-CRM)

---

## 🎯 Mission of This Playbook

Provide **consistent, high-quality, timely** service to every lead from the moment they click "Save" until they become an installation customer (or churn).

**Goals:**
- 100% of leads contacted within **24 hours**
- 80%+ of qualified leads converted to site survey
- First response time < 4 hours (during business hours)
- No lead left behind (follow-up until closure)
- Consistent tone: professional, helpful, no-pressure

---

## 📋 Table of Contents

1. [First 100 Leads: Manual Process](#1-first-100-leads-manual-process)
2. [Support Scripts: Thai & English](#2-support-scripts-thai--english)
3. [Lead Handoff Process (Chat → Human)](#3-lead-handoff-process-chat--human)
4. [Escalation Matrix](#4-escalation-matrix)
5. [Quality Assurance & Monitoring](#5-quality-assurance--monitoring)
6. [Tools & Templates](#6-tools--templates)
7. [SLA & Response Times](#7-sla--response-times)
8. [Common Pitfalls](#8-common-pitfalls)

---

## 1. First 100 Leads: Manual Process (Before CRM)

### Context

During the first 100 leads, the admin CRM might not be fully functional. We'll use a **Google Sheet** as temporary CRM.

**Sheet name:** `[Tawan Power] Leads - Master`

### Sheet Columns

| Column | Description | Example |
|--------|-------------|---------|
| **ID** | Sequential: L-001, L-002... | L-001 |
| **Created At** | Timestamp when lead saved | 2026-05-15 14:30 |
| **Session ID** | From localStorage | abc123... |
| **Name** | User-provided (if any) | Anand / คุณಅನಂತ् |
| **Phone** | Thai format: +66 XX XXX XXXX | +66 81 234 5678 |
| **LINE ID** | If provided | @anand_krabi |
| **Segment** | residential / commercial | residential |
| **Bill (kWh)** | Monthly electricity bill | 800 kWh |
| **Est. System (kW)** | From calculation | 6.2 kW |
| **Payback (years)** | From calculation | 4.8 years |
| **Status** | new → contacted → qualified → scheduled → installed → lost | new |
| **Contacted Date** | When we first reached out | 2026-05-15 16:00 |
| **Contact Method** | phone / line / email | phone |
| **Engineer Assigned** | Who is handling | Дмитрий |
| **Site Survey Scheduled** | Date/time | 2026-05-18 09:00 |
| **Installation Date** | If closed | 2026-06-01 |
| **Commission** | ฿ amount (if installed) | 50,000 |
| **Notes** | Free text |Client requested battery Quote |
| **Lost Reason** | If lost: price, timing, competitor | price |

---

### Workflow: Day of Lead Arrival

**Trigger:** User clicks "Save" in chat → data stored in Supabase `leads` table.

**Step 1: Notification (automated)**
- Set up webhook from Supabase to LINE Notify/Slack:
  ```
  NEW LEAD: {Name} {Segment} {Bill}kWh → {phone or line_id}
  URL: https://your-repo.supabase.co/table/leads?id={lead_id}
  ```
- **Action:** Use Supabase Realtime or weekly digest if volume low

**Step 2: Manual entry in Google Sheet**
- Open `[Tawan Power] Leads - Master`
- Add new row at bottom:
  ```
  L-001 | 2026-05-15 14:30 | abc123 | Anand | +66812345678 | @anand_krabi | residential | 800 | 6.2 | 4.8 | new | | phone | Dmitry | | | |
  ```
- **Color code row:** Light yellow (new, not yet contacted)

**Step 3: First contact (within 4 hours)**

#### If phone provided:
1. Call immediately (during business hours: 9:00-18:00 Thailand time)
2. Use **Phone Script** (see Section 2)
3. If answered and interested:
   - Ask: "Do you want to book a FREE site survey with our engineer?"
   - If YES → open Google Calendar, find slot, book → update sheet: `Status = scheduled`, `Site Survey Scheduled = date`, `Engineer Assigned = your name`
   - Send confirmation via LINE/ SMS:
     ```
     สวัสดีครับ/ค่ะ! ยืนยันนัดสำรวจหน้างานฟรี
     วัน: พน\, 21 พฤษ\, 2026 เวลา: 10:00 น.
     Engineer: คุณ Dmitry โทร: 081-234-5678
     ```
4. If no answer → send LINE message (if LINE ID provided) or SMS (if phone)
5. Mark `Contacted Date = today`, `Contact Method = phone` (or line)
6. Change row color to light blue (contacted)

#### If only LINE ID (no phone):
1. Send LINE message using **LINE Script** (Section 2)
2. Wait 2 hours → if no reply → send follow-up
3. Color as above

#### If no contact info (only chat, no save):
- Not actually a lead → ignore (they didn't click Save)

**Step 4: Follow-up if no response**

**Day 1 (today):** First contact  
**Day 2 (tomorrow):** If no reply → second message:  
"Following up - still interested in solar consultation? Let me know convenient time."  
**Day 4:** Third message: "Last try - please reply YES if interested, NO if not."  
**Day 7:** If still no response → mark `Status = cold`, color gray, stop contacting.

---

### Daily Routine (Morning)

**Time:** 9:00 AM (Thailand time)

1. Open Google Sheet → filter by `Status = new` AND `Created At` from yesterday/today
2. For each new lead → contact per above
3. Review overnight leads (if any)

**Time:** 5:00 PM

1. Check if any `new` leads from today not contacted → do final push
2. Review `contacted` leads that haven't responded → schedule follow-ups
3. Tomorrow's site surveys → confirm with engineers

---

## 2. Support Scripts: Thai & English

### Phone Script (Thai + English)

**場合:** Calling a lead with phone number

**Intro (Thai):**
```
สวัสดีครับ/คะ เจ้าของบ้าน庭ъ? ผม/ดิฉันชื่อ [Your Name] จาก Tawan Power Solar
(Hello, is this the homeowner? My name is [You] from Tawan Power Solar.)

 raison: เราได้รับคำขอเกี่ยวกับการติดSolar Panel ให้บ้าน/也odia的
(I'm calling about your solar consultation request from our website/chat.)
```

**If YES (I am interested):**
```
ดีครับ/ค่ะ اقعดีมาก ฉันจะไป數據你在的house that electricity bill [bill_kwh] ؟
(Great! I see your electricity bill is around [bill_kwh] per month.)

初步ประมาณ问:初步的系统是[system_size] kW，能帮你省下[savings] บาท/เดือน และคืนTher years。
(Preliminary estimate: [system_size] kW system, saves approximately [savings] THB/month, payback about [payback] years.)

คุณอยากให้เราสำรวจหน้างานActually市场价格要保修吗
(Would you like a FREE site survey by our licensed engineer? This is no-obligation.)
```

**If interested in survey:**
```
เยี่ยมเลยครับ/ค่ะ ฉันจะ帮助你จองวัน และส่งการยืนยันผ่านไลน์/短信
(Great. Let's book a slot. I need your availability Mon-Sat, 9am-5pm.)

[Check calendar with them] → book → confirm details.

---

**If NO (not interested):**
```
เข้าใจครับ/ค่ะ ลด monotonictakings: could you tell me why? 
(I understand. Just curious, what made you decide not to proceed? Price? Timing? or other?)

[Record reason in Notes]
(Thank you for your time! If you change your mind, contact us anytime.)
```

---

### LINE Script (Message Template)

**First message:**
```
สวัสดีครับ/ค่ะ! 🙏

นี่คือทีม Tawan Power Solar ✓ เราได้รับคำขอ相談 about solar for your [บ้าน/โรงแรม]

初步 estimated:
- ระบบขนาด: [system_size] kW
- ประหยัด: ~[savings] บาท/เดือน
- คืนTher: [payback] ปี

อยากให้เรางานสำรวจหน้างานฟรี ไม่เสียค่า anything?
weet dream ดำเนินการ by our licensed engineer FREE.

ตอบ "YES" ถ้าพร้อม book วัน 或 "INFO" if want more info

Regards,
Tawan Power Team 📞081-234-5678
🌐 tawanpower.com
```

**Follow-up (if no reply after 2 hours):**
```
附件: Just checking if you received my message?

 site survey is still free and no obligation. Let me know if you're interested or if you have questions!

---
Tawan Power Team
```

**Final follow-up (after 4 hours):**
```
.Last try:

Are you still interested in solar consultation? Reply YES to book site survey, NO if not.

We'll assume NO if no reply by tomorrow.

Thanks,
Tawan Power
```

---

### Email Template (if collected)

**Subject:** Follow-up: Your Solar Consultation Request | Tawan Power

**Body (English + Thai):**

```
Dear [Name],

Thank you for using Tawan Power's AI solar consultation tool!

We received your request with the following preliminary estimate:
- System size: [X] kW
- Estimated monthly savings: ฿[Y]
- Payback period: [Z] years

We'd like to offer you a **FREE site survey** by our licensed engineer.
This visit is no-obligation and helps you get an accurate quote.

To schedule:
1. Reply to this email with 2-3 preferred time slots (Mon-Sat, 9am-5pm)
2. Or book directly: [Calendly link]
3. Or message us on LINE: @tawanpower

Looking forward to helping you go solar!

Best regards,
Dmitry
Tawan Power Co., Ltd.
Mobile: +66 81 234 5678
LINE: @tawanpower
Website: tawanpower.com

---
สวัสดีครับ/ค่ะ,

ขอบคุณที่ใช้บริการ Tawan Power AI Chat

初步估算 preliminary:
- ขนาดระบบ: [X] kW
- ประหยัด: ~฿[Y]/เดือน
- คืนTher: [Z] ปี

เราแนะนำ service สำรวจหน้างานฟรี โดยวิศวกรที่licensed
ไม่มี commitment → ไม่เสียค่า anything

การจอง:
1. ตอบกลับ email ด้วยวัน/เวลา ที่สะดวก (จ-เสาร์ 9:00-17:00)
2. หรือ book ผ่าน: [Calendly link]
3. หรือ message ทางไลน์: @tawanpower

地vie with you!

---
```

---

## 3. Lead Handoff Process (Chat → Human Engineer)

### When AI Triggers Handoff

**Trigger 1:** User clicks "Consult Engineer" button in chat  
**Trigger 2:** User says "I want to talk to a person"  
**Trigger 3:** AI detects high intent (e.g., "Book site survey now")

### Handoff Steps

#### Step 1: Capture Lead Data
AI should have already called `saveLead()` tool with:
```
{
  "session_id": "abc123",
  "segment": "residential",
  "bill_kwh": 800,
  "system_size_kw": 6.2,
  "payback_years": 4.8,
  "phone": "+66812345678",  // optional
  "line_id": "@anand_krabi"  // optional
}
```

**Verify:** Lead saved in Supabase `leads` table with new `id` (UUID).

#### Step 2: Generate Lead Summary PDF (Optional but nice)
Create a one-pager:
```
┌─────────────────────────────────────────────┐
│ TAWAN POWER - LEAD SUMMARY                  │
├─────────────────────────────────────────────┤
│ Session ID: abc123                          │
│ Date: 2026-05-15 14:30                     │
├─────────────────────────────────────────────┤
│ CUSTOMER:                                  │
│   Name: Anand (if collected)               │
│   Phone: +66 81 234 5678                   │
│   LINE: @anand_krabi                       │
├─────────────────────────────────────────────┤
│ CONSULTATION DETAILS:                      │
│   Segment: Residential                     │
│   Monthly Bill: 800 kWh                    │
│   Estimated System: 6.2 kW                 │
│   Payback: 4.8 years                       │
│   Savings: ~฿3,760/month                   │
├─────────────────────────────────────────────┤
│ CHAT HIGHLIGHTS:                           │
│   User: "How many panels for 800 kWh?"    │
│   AI: "Approx 20 panels (400W each)..."   │
│   User: "Book site survey"                 │
├─────────────────────────────────────────────┤
│ NEXT ACTION:                               │
│   [ ] Contact within 4 hours              │
│   [ ] Schedule site survey                │
│   [ ] Send proposal                       │
└─────────────────────────────────────────────┘
```

Store in Supabase `lead_summaries` table or Google Drive.

#### Step 3: Notify Engineer
- **LINE Notify** to engineer's phone:
  ```
  🚨 NEW LEAD FROM CHAT
  Name: Anand
  Phone: +66812345678
  Segment: Residential
  Bill: 800 kWh → 6.2 kW system
  Action: CALL WITHIN 4 HOURS
  Link: https://your-admin.com/leads/lead_id
  ```
- **Slack** #leads channel:
  ```
  <@engineer> NEW LEAD: Anand (residential, 800 kWh) → 6.2 kW. First contact required.
  ```

#### Step 4: Engineer Takes Action
Engineer opens admin dashboard → finds lead → calls within 15 minutes (if possible).

**Script for engineer call:**
```
สวัสดีครับ/ค่ะ ฉันคือวิศวกรจาก Tawan Power ✓看似costas about solar for your house?
I see you just finished a chat with our AI and requested a site survey.

 preliminary từalculate says you could save ~฿3,760/month with 6.2 kW system.
I'd like to confirm the numbers and schedule a FREE site visit to measure your roof, check electrical panel.

When is convenient for you?今週?
```

---

## 4. Escalation Matrix

### When to Escalate to Founder

| Situation | Escalate? | Response Time | How to Escalate |
|-----------|-----------|---------------|-----------------|
| **Customer complaint** (service failure, AI gave wrong info) | ✅ YES | 1 hour | LINE/SMS to founder: +66XX |
| **Price negotiation** (client wants >20% discount or commission reduction) | ✅ YES | 4 hours | Discuss with founder before committing |
| **Technical impossibility** (Chat calculated wrong → legal risk) | ✅ YES | 1 hour | Stop AI that flow, investigate bug |
| **VIP client** (Hotel chain > 100kW, potential high-value) | ✅ YES | 15 minutes | Founder handles personally |
| **Legal threat** (客户 threatens lawsuit, PDPA complaint) | ✅ YES | IMMEDIATE | Founder + Lawyer |
| **System outage** > 1 hour (chat down, Supabase down) | ✅ YES | 30 minutes | Pager duty / Vercel status |
| **Partner dispute** (安装商 не хочет платить commission) | ✅ YES | 4 hours | Contract review |
| **Strange Lead Pattern** (bots, spam, fraud detected) | ⚠️ Monitor | 24 hours | Flag in sheet, discuss in weekly review |

---

### Slack/Channel Notification Templates

#### Critical (founder paged)
```
@founder CRITICAL:
Customer complaint: AI gave wrong calculation, client upset.
Lead ID: L-001, Phone: +66812345678
Customer wants refund/remedy.
Urgency: High (client threatening PDPA complaint)
```

#### High (founder notified, not paged)
```
@founder High:
Price negotiation: Hotel chain wants ฿50k discount on ฿500k deal.
Lead ID: L-042.
Please advise before responding to client.
```

#### Normal (no escalation)
```
#leads New lead: Anand (residential, 800kWh) → assigned to Dmitry.
```

---

## 5. Quality Assurance & Monitoring

### Daily QA Checklist (for Support Lead)

- [ ] **All new leads from yesterday contacted?** Check sheet → filter `Status = new` AND `Created At < yesterday`. Any? → assign urgency.
- [ ] **Uncontacted leads > 24 hours?** Color red → immediate action.
- [ ] **No response from client after 3 attempts?** Mark `Status = cold`, gray out, stop contacting.
- [ ] **Chat error rate** > 1%? Check Sentry → fix critical bugs.
- [ ] **Groq/Gemini API errors** > 5%? Revert to previous working config.

### Weekly Review (Friday 4:00 PM)

**Metrics to review:**
- Leads this week: __ (Target: 20-50 depending on stage)
- Contact rate: __% (Target > 80%)
- Response time average: __ hours (Target < 4h)
- Consultations booked: __ (Target: 30% of leads)
- Installations scheduled: __ (Target: 20% of consultations)
- Customer complaints: __ (Target: 0)

**Questions to answer:**
- Are we missing any follow-ups?
- Any stuck leads (contacted but no response for 5+ days)?
- Are engineers available for upcoming surveys?
- What are top reasons leads go cold?

**Action items from review:**
- Update scripts if objections common
- Adjust follow-up cadence if response rates low
- Add new FAQ items to knowledge base

### Monthly Review (End of Month)

**Financial:**
- Total leads: __
- Total installations: __
- Revenue (commission): __
- CAC: ฿__ (monthly ad spend / leads)
- LTV: ฿__ (avg commission / retention)
- LTV:CAC ratio: __ (target >3)

**Operations:**
- Avg time to first contact: __ hours (target <4)
- Avg time to schedule survey: __ hours (target <24)
- Survey no-show rate: __% (track reschedules)
- Lead quality score: __ (1-5 rating from engineers)

**Product/UX:**
- Chat messages per session: __ (target 10-15)
- Drop-off points in chat: at step X (identify friction)
- AI accuracy: random audit 10 chats → rate correct/incorrect

**Adjustments:**
- If conversion rates low → improve AI prompts
- If response times slow → hire more support
- If ad costs rising → optimize CPC, explore new channels

---

## 6. Tools & Templates

### Required Tools

| Tool | Purpose | Cost | Setup |
|------|---------|------|-------|
| **Google Workspace** | Sheets (temporary CRM), Calendar | ~฿300/mo | Create shared sheet |
| **LINE Notify** | Push notifications for new leads | Free | Create channel, integrate with Supabase webhook |
| **Slack** | Team communication, alerts | Free | Create #leads channel |
| **Calendly** (or Google Cal) | Self-service booking | Free/฿200/mo | Set up engineer availability |
| **Sentry** | Error tracking | Free tier | Integrate Next.js |
| **Supabase** | Database | ฿1,500/mo | Already set up |

---

### Templates

#### Google Sheet: `[Tawan Power] Leads - Master`

**Sheet protection:**
- Lock all formula cells (prevent accidental edit)
- Allow edit only in columns: Status, Contacted Date, Contact Method, Engineer Assigned, Site Survey Scheduled, Notes, Lost Reason

**Conditional formatting rules:**
- `Status = new` → Light yellow fill
- `Status = contacted` → Light blue fill
- `Status = scheduled` → Light green fill
- `Status = cold` → Gray fill
- `Status = installed` → Light purple fill
- `Status = lost` → Light red fill

**Data validation dropdowns:**
- `Status` column: "new", "contacted", "qualified", "scheduled", "installed", "lost", "cold"
- `Contact Method`: "phone", "line", "email", "whatsapp"
- `Engineer Assigned`: "Dmitry", "External Partner 1", "External Partner 2"

---

#### Lead Summary PDF Template

If you want to generate PDFs programmatically:

**Option 1: Simple HTML → PDF**
```html
<!DOCTYPE html>
<html>
<head><style>body { font-family: Arial; } table { border-collapse: collapse; } td { padding: 8px; border: 1px solid #ddd; }</style></head>
<body>
<h1>TAWAN POWER - LEAD SUMMARY</h1>
<table>
<tr><td>Session ID</td><td>{{session_id}}</td></tr>
<tr><td>Date</td><td>{{created_at}}</td></tr>
<tr><td>Name</td><td>{{name}}</td></tr>
<tr><td>Phone</td><td>{{phone}}</td></tr>
<tr><td>Segment</td><td>{{segment}}</td></tr>
<tr><td>Bill (kWh)</td><td>{{bill_kwh}}</td></tr>
<tr><td>Est. System</td><td>{{system_size_kw}} kW</td></tr>
</table>
</body>
</html>
```

Convert with `puppeteer` or send to engineer as plain HTML email.

**Option 2: Use Google Docs template** → fill with Apps Script → PDF → email.

---

## 7. SLA & Response Times

### Service Level Agreement (Internal)

| Incident/Request | Priority | Response Time | Resolution Time | Owner |
|------------------|----------|---------------|-----------------|-------|
| New lead (first contact) | P2 | < 4 hours | < 24 hours | Support |
| Customer complaint | P1 | < 1 hour | < 4 hours | Founder |
| AI error affecting user | P1 | < 30 minutes | < 2 hours | Dev Team |
| Site survey scheduling | P3 | < 24 hours | < 3 days | Support |
| Engineer unavailable | P2 | < 2 hours | < 8 hours | Founder |
| System outage | P1 | < 15 minutes | < 1 hour | Dev Team |

**Definitions:**
- **Response time:** First human acknowledgment (not auto-reply)
- **Resolution time:** Issue resolved to customer satisfaction

---

### Customer-Facing Response Times

承诺给客户 (in Privacy Policy / ToS):

- **Response to inquiries:** Within 24 hours (during business days)
- **Site survey scheduling:** Within 48 hours after consultation
- **Emergency issues:** Response within 4 hours (defined as: no power, system failure)

---

## 8. Common Pitfalls & How to Avoid

### Pitfall 1: Leads going cold because no follow-up
**Symptom:** Many leads marked "contacted" but never called back  
**Fix:**
- Use sheet filters to show `contacted` but `contacted_date < today - 2 days`
- Set calendar reminder daily 5:00 PM: "Follow up leads"
- Automate: script that sends LINE/SMS reminder after 2 days

### Pitfall 2: Engineers double-booked
**Symptom:** Two leads scheduled for same time with same engineer  
**Fix:**
- Use shared Google Calendar
- Color code: blue for morning, red for afternoon
- Engineer must block 2 hours minimum per site survey (travel + buffer)

### Pitfall 3: AI gives wrong numbers
**Symptom:** Customer complains estimate differs from engineer's calculation  
**Fix:**
- Compare AI calculator output with engineer's site-measured values → adjust calibration
- Add margin of error disclaimer: "±20% variance possible"
- Log discrepancies → improve AI prompt

### Pitfall 4: Lead data incomplete
**Symptom:** Many leads without phone number (only LINE ID)  
**Fix:**
- In chat UI, make phone number optional but encourage: "Provide phone for faster service"
- LINE ID is sufficient for Thailand (LINE is main messenger)
- Train support to use LINE messages effectively

### Pitfall 5: No tracking of why leads lost
**Symptom:** Can't improve because don't know why customers don't convert  
**Fix:**
- Always mark `Lost Reason` in sheet (price, timing, competitor, no response)
- Monthly review: top 3 lost reasons → address them
- Example: If "price" common → consider cheaper panel options or financing

---

## 📚 Appendix: Quick Reference Card

### One-page summary to print and keep at desk:

```
TAWAN POWER OPS CHEATSHEET
───────────────────────────

NEW LEAD ARRIVES:
1. Check Google Sheet → entry added?
2. Contact within 4 hours:
   - Phone? Call immediately
   - LINE ID? Send message
3. Script: "We received your consultation. Want FREE site survey?"
4. If YES → book via Calendly → update sheet
5. If no reply → follow up in 2h, 4h, next day → then cold

ESCALATION:
- Customer complaint → SMS founder immediately
- Price discount >20% → ask founder
- AI error/hallucination → stop that chat, report bug
- VIP client (hotel >100kW) → founder takes over

SHEET MAINTENANCE:
- Status dropdown: new / contacted / qualified / scheduled / installed / lost / cold
- Color fill: yellow → blue → green → purple → red → gray
- Every lead MUST have Status filled and Contacted Date

METRICS (weekly):
• Leads: target __/week
• Contact rate: >80%
• Consultation→Install: >20%
```

---

**Document Owner:** @dyaroshevich  
**Last Updated:** 2026-05-15  
**Next Review:** After first 50 leads (process improvements)
