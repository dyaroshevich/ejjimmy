# 📊 Tawan Power: Google Sheets Templates

**Purpose:** Ready-to-use spreadsheets for tracking business metrics, leads, and operations  
**How to use:** Create new Google Sheet → copy structure below → formulas auto-calculate  
**Sheets included:** 8 templates covering Finance, CRM, SEO, Partners, Support

---

## 📋 Table of Contents

1. [Financial Dashboard](#1-financial-dashboard)
2. [Leads Master Sheet](#2-leads-master-sheet)
3. [Customer Interviews Tracker](#3-customer-interviews-tracker)
4. [Competitor Analysis](#4-competitor-analysis)
5. [SEO Content Calendar](#5-seo-content-calendar)
6. [Support Tickets & Follow-ups](#6-support-tickets--follow-ups)
7. [Installation Partners Database](#7-installation-partners-database)
8. [Monthly Metrics Dashboard](#8-monthly-metrics-dashboard)

---

## 1. FINANCIAL DASHBOARD

**File name:** `Tawan Power - Financial Model`  
**Structure:** 4 tabs

---

### Tab 1: Unit_Economics

**Purpose:** Calculate CAC, LTV, conversion rates in real-time

```
A1: TAWAN POWER - UNIT ECONOMICS CALCULATOR
A3: INPUTS (Monthly)
B3: Ad Spend (฿): 10000
B4: Leads generated: 30
B5: Lead→Consultation rate (%): 30%
B6: Consult→Install rate (%): 20%
B7: Average deal size (฿): 500000
B8: Commission (%): 10%
B9: Retention multiplier: 1.0

A12: CALCULATIONS
B12: Cost per lead (฿): =B3/B4
B13: Consultations: =B4*B5
B14: Installations: =B13*B6
B15: Revenue per install (฿): =B7*B8/100
B16: Total monthly revenue (฿): =B14*B15
B17: CAC per install (฿): =B3/B14
B18: LTV per install (฿): =B15*B9
B19: LTV:CAC ratio: =B18/B17

A21: HEALTH ASSESSMENT
B21: =IF(B19>=3, "✅ HEALTHY (LTV:CAC > 3)", IF(B19>=2, "⚠️ WATCH (LTV:CAC 2-3)", "❌ UNHEALTHY (LTV:CAC < 2)"))
B22: =IF(B16>B3, "✅ Profitable (Revenue > Ad Spend)", "⚠️ Revenue < Ad Spend")
```

**Conditional Formatting (B12:B19):**
- Green if >0
- Red if <0

**Notes:**
- For percentages (B5,B6,B8) format as `%` (Format → Number → Percent)
- For currencies (B3,B7,B12,B15,B16,B17,B18) format as `฿` (Format → Number → Currency → Thai Baht)

---

### Tab 2: Monthly_Projections

**Purpose:** 12-month revenue forecast based on assumptions

```
A1: TAWAN POWER - MONTHLY REVENUE PROJECTIONS
A3: Month | Leads | Consultations | Installations | Revenue (฿) | Cumulative (฿) | Notes
A4: 1 | 20 | =B4*$B$5 | =C4*$B$6 | =D4*$B$15 | =E4 | Soft launch
A5: 2 | 25 | =B5*$B$5 | =C5*$B$6 | =D5*$B$15 | =E5+E4
...
A15: 12 | 200 | =B15*$B$5 | =C15*$B$6 | =D15*$B$15 | =E15+E14

B17: TOTAL INSTALLATIONS (Year): =SUM(D4:D15)
B18: TOTAL REVENUE (Year): =SUM(E4:E15)
B19: AVERAGE REVENUE/MONTH: =B18/12
```

** formulas reference Unit_Economics!B5,B6,B15** (conversion rates, revenue/install)

**Chart:** Select A4:E15 → Insert → Chart → Line chart showing Revenue (col E) and Installations (col D)

---

### Tab 3: Actual_vs_Plan

**Purpose:** Track real performance against projections

```
A1: ACTUAL vs PLAN - MONTHLY TRACKING
A3: Month | Plan Leads | Actual Leads | Plan Installs | Actual Installs | Plan Revenue | Actual Revenue | Variance %
A4: 1 | 20 | (manual) | 1.2 | (manual) | 60000 | (manual) | =IFERROR((G4-F4)/F4, 0)
A5: 2 | 25 | | 1.6 | | 80000 | | =IFERROR((G5-F5)/F5, 0)
...
A15: 12 | 200 | | 12.0 | | 600000 | |

B17: CUMULATIVE PLAN REVENUE: =SUM(F4:F15)
B18: CUMULATIVE ACTUAL REVENUE: =SUM(G4:G15)
B19: VARIANCE: =B18-B17
B20: VARIANCE %: =IFERROR(B19/B17, 0)
```

**Conditional Formatting (H4:H15):**
- Green if >10% (overperforming)
- Yellow if -10% to 10% (on track)
- Red if <-10% (underperforming)

---

### Tab 4: Leads_Log (Raw Data)

**Purpose:** Raw export from Supabase for analysis

```
A1: RAW LEADS EXPORT (from Supabase)
A2: id | created_at | session_id | name | phone | line_id | segment | bill_kwh | system_size_kw | payback_years | status | contacted_date
A3: (paste CSV data here)
```

**Pivot Table (separate area):**
- Rows: `segment` (residential/commercial)
- Columns: `status` (new, contacted, scheduled, installed, lost)
- Values: COUNT(id)
- → Shows lead distribution by segment + status

---

## 2. LEADS MASTER SHEET (from Operations Playbook)

**File name:** `[Tawan Power] Leads - Master`  
**Columns:**

```
A: ID (L-001, L-002...) — formula: ="L-"&TEXT(ROW()-1,"000")
B: Created At (auto-date): =NOW() when new row added (or manual)
C: Session ID (from chat)
D: Name
E: Phone (Thai format: +66 81 234 5678)
F: LINE ID
G: Segment (dropdown: residential, commercial)
H: Bill (kWh) (number)
I: Est. System (kW) (number)
J: Payback (years) (number)
K: Status (dropdown: new, contacted, qualified, scheduled, installed, lost, cold)
L: Contacted Date (date picker)
M: Contact Method (dropdown: phone, line, email, whatsapp)
N: Engineer Assigned (dropdown: Dmitry, External Partner 1, External Partner 2)
O: Site Survey Scheduled (date picker + time)
P: Installation Date (date picker)
Q: Commission (฿) (number)
R: Notes (free text)
S: Lost Reason (dropdown: price, timing, competitor, no response, other)
```

---

### Data Validation (Setup):

**K Column (Status):**
- Data → Data validation → List of items: `new, contacted, qualified, scheduled, installed, lost, cold`

**M Column (Contact Method):**
- List: `phone, line, email, whatsapp`

**N Column (Engineer Assigned):**
- List: `Dmitry, External Partner 1, External Partner 2`

**S Column (Lost Reason):**
- List: `price, timing, competitor, no response, other`

---

### Conditional Formatting (Rules):

**Whole row formatting based on K column:**

Select A2:Z1000 → Format → Conditional formatting → Add rule:

1. `K = "new"` → Background: `#FFF9C4` (light yellow)
2. `K = "contacted"` → Background: `#E1F5FE` (light blue)
3. `K = "scheduled"` → Background: `#E8F5E9` (light green)
4. `K = "installed"` → Background: `#F3E5F5` (light purple)
5. `K = "lost"` → Background: `#FFEBEE` (light red)
6. `K = "cold"` → Background: `#F5F5F5` (gray)

---

### Formulas:

**Column A (ID):**
```
First data row (A3): ="L-"&TEXT(ROW()-2,"000")
Drag down
```

**Column B (Created At):**
```
New leads: =IF(C3<>"", NOW(), "")
But better: manual entry or use Google Form to auto-populate
```

**Auto-filter:**
- Turn on filter: Data → Create filter
- Filter by Status, Engineer Assigned, Date range

---

### Daily Use Workflow:

1. **Morning (9:00):** Filter K = "new" → contact all
2. **Afternoon:** Filter K = "contacted" → follow up if >2 days no reply
3. **Evening:** Filter K = "scheduled" → confirm next day's surveys

---

## 3. CUSTOMER INTERVIEWS TRACKER

**File name:** `Customer Interviews - First 100`  
**Purpose:** Track qualitative feedback from conversations

```
A: Interview ID (INT-001, INT-002...)
B: Date
C: Lead ID (from Leads Master)
D: Customer Name
E: Segment (residential/commercial)
F: Installation Completed? (checkbox: TRUE/FALSE)
G: Why did you choose solar? (free text)
H: What was your main concern? (free text)
I: How did you hear about us? (dropdown: LINE, Google, Friend, Other)
J: What convinced you to choose Tawan Power? (free text)
K: What could we improve? (free text)
L: Price sensitivity (1-5: 1=very sensitive, 5=not sensitive)
M: Decision factors (multiple choice: price, quality, speed, brand, warranty)
N: Would you refer us? (1-5: NPS)
O: Engineer notes (internal)
```

---

### Pivot Tables (create separate sheets):

**Sheet "Analysis"**

| Metric | Value |
|--------|-------|
| Total interviews | =COUNTA(Interviews!A:A)-1 |
| Installation rate | =COUNTIF(Interviews!F:F, TRUE)/COUNTA(Interviews!F:F) |
| Avg price sensitivity | =AVERAGE(Interviews!L:L) |
| Avg NPS | =AVERAGE(Interviews!N:N) |
| Top referral sources | =QUERY(Interviews!I:I, "SELECT I, COUNT(I) GROUP BY I ORDER BY COUNT(I) DESC") |
| Common concerns (word cloud later) | |

---

### Charts:

1. **Bar chart:** Referral sources (I column) → count
2. **Histogram:** Price sensitivity (L column) distribution
3. **Scatter:** Decision factors vs NPS (if enough data)

---

## 4. COMPETITOR ANALYSIS

**File name:** `Competitor Analysis - Solar Thailand`  
**Columns:**

```
A: Competitor Name
B: Website URL
C: Location (Krabi/Phuket/Online/Thailand)
D: Services Offered (checkbox: Consultation, Installation, Rooftop, Ground-mount)
E: Pricing Model (free consultation, paid, commission-based?)
F: AI/Calculator? (YES/NO/NOT SURE)
G: Chat on site? (YES/NO)
H: LINE integration? (YES/NO)
I: Pricing Information (transparent? vague? none)
J: Unique Value Proposition (1 sentence)
K: Strengths (bullet list)
L: Weaknesses (bullet list)
M: Reviews (Google/FB rating out of 5)
N: Our advantage vs them (notes)
O: Threat level (Low/Medium/High)
```

---

### Sample entries (pre-fill):

| Competitor | Website | Location | Services | AI? | Chat? | Our advantage |
|-----------|---------|----------|----------|-----|-------|---------------|
| Solaric | solaric.co.th | Thailand-wide | Install | No | No | Local Krabi focus + AI |
| Power Solar | powersolar.co.th | Phuket | Both | No | Yes (slow) | Faster AI response |
| SunPower Thailand | sunpower.com/thailand | Bangkok | Install | No | No | Local presence, personal |

---

### Dashboard (separate sheet):

Create summary:
- Total competitors tracked: =COUNTA(Competitors!A2:A)
- With AI: =COUNTIF(Competitors!F:F, "YES")
- With chat: =COUNTIF(Competitors!G:G, "YES")
- Avg rating: =AVERAGE(Competitors!M:M)
- High threats: =COUNTIF(Competitors!O:O, "High")

---

## 5. SEO CONTENT CALENDAR

**File name:** `SEO Content Calendar - Tawan Power`  
**Purpose:** Plan and track blog articles for organic traffic

```
A: Article # (1,2,3...)
B: Title (EN)
C: Title (TH)
D: Target Keyword (EN)
E: Target Keyword (TH)
F: Word Count Goal (min 1000)
G: Status (dropdown: planned, writing, editing, published, promoted)
H: Publish Date (date picker)
I: URL (once published)
J: Target search volume (per month) — estimate
K: Difficulty (1-10: 1=easy, 10=hard)
L: Top 3 competitors ranking (URLs)
M: Internal links to add (from existing pages)
N: External links (citations, sources)
O: Meta description (EN) (155 chars)
P: Meta description (TH)
Q: Featured image (URL or name)
R: Author
S: Last updated
T: Current ranking (after 1 month)
U: Traffic from this article (monthly)
V: Leads generated (from this article)
```

---

### Content Plan (pre-filled):

| # | Title EN | Title TH | Keyword | Status | Publish Date |
|---|----------|----------|---------|--------|--------------|
| 1 | Solar Panel Cost in Krabi 2026 | ราคาแผ่นโซลาร์摄在กระบี่ 2026 | solar panel price krabi | planned | 2026-06-01 |
| 2 | How Many Panels Do I Need? | ต้องใช้แผ่นกี่แผ่น? | solar calculator krabi | writing | 2026-06-08 |
| 3 | ROI of Solar for Hotels | ROI ของ Solar สำหรับโรงแรม | solar hotel krabi | editing | 2026-06-15 |
| ... | ... | ... | ... | ... | ... |

---

### Charts:

1. **Gantt chart** using Conditional formatting on H (publish dates)
2. **Pie chart:** Status breakdown (how many planned vs published)
3. **Trend:** Leads generated per article over time

---

### Top Keywords List (separate sheet):

```
Keyword (EN) | Search Volume | Difficulty | Article Target | Current Rank | Target Rank
solar krabi | 1000/mo | 45 | home page | N/A | 1-3
solar panel installation krabi | 500/mo | 52 | article #5 | N/A | 1-3
solar calculator thailand | 300/mo | 38 | article #2 | N/A | 1-5
```

---

## 6. SUPPORT TICKETS & FOLLOW-UPS

**File name:** `Support Tickets - Tawan Power`  
**Purpose:** Track all customer support interactions

```
A: Ticket ID (TKT-001, TKT-002...)
B: Created At (timestamp)
C: Source (dropdown: phone, line, email, chat, whatsapp)
D: Customer Name
E: Contact Info (phone/LINE/email)
F: Related Lead ID (from Leads Master)
G: Category (dropdown: technical, pricing, scheduling, complaint, other)
H: Subject (short summary)
I: Status (dropdown: open, in-progress, waiting on customer, resolved, closed)
J: Assigned To (Dmitry, External Partner)
K: Created By (who logged ticket)
L: Priority (dropdown: low, medium, high, critical)
M: Due Date (date)
N: Last Contact Date (date)
O: Resolution (free text)
P: Resolved Date (date)
Q: CSAT (1-5: customer satisfaction after resolution)
```

---

### Formulas:

**Column A (Ticket ID):**
```
="TKT-"&TEXT(ROW()-1,"000")
```

**Column M (Overdue?):**
```
=IF(AND(I3<>"resolved", I3<>"closed", M3<TODAY(), L3<>"low"), "OVERDUE", "")
```

**Column Q (CSAT average):**
```
=AVERAGEIFS(P:P, I:I, "resolved")
```

---

### Dashboard (separate sheet "Summary"):

| Metric | Value | Target |
|--------|-------|--------|
| Open tickets | =COUNTIF(I:I, "open") | 0 |
| In-progress | =COUNTIF(I:I, "in-progress") | <5 |
| Backlog (open > 3 days) | =COUNTIFS(I:I, "open", B:B, "<="&TODAY()-3) | 0 |
| Avg response time | =AVERAGE(N:N - B:B) | <4h |
| CSAT | =AVERAGE(Q:Q) | >4.0 |
| Tickets by category | =QUERY(Support!G:G, "SELECT G, COUNT(G) GROUP BY G") |

---

## 7. INSTALLATION PARTNERS DATABASE

**File name:** `Installation Partners - Database`  
**Purpose:** Track all installation partners, commissions, performance

```
A: Partner ID (PART-001, PART-002...)
B: Company Name
C: Contact Person
D: Phone
E: LINE ID
F: Email
G: Location (Krabi/Phuket/Other)
H: Services (dropdown: residential, commercial, both)
I: License number (if available)
J: Commission rate (%) offered
K: Min commission (฿)
L: Typical project size (kW range) — e.g., "5-20 kW"
M: Avg deal size (฿) — their estimate
N: Warranty offered (panels/inverter)
O: Contract signed? (checkbox)
P: Contract start date
Q: Leads sent (count)
R: Installations completed (count)
S: Conversion rate (%): =R/Q
T: Commission paid (฿ total)
U: Last lead sent (date)
V: Notes (quality, responsiveness, issues)
```

---

### Formulas:

**Column S (Conversion rate):**
```
=IFERROR(R3/Q3, 0)
Format as %
```

**Column T (Commission paid, from Finance data):**
```
=SUMIF(Financial_Model!Leads_Log!$N:$N, "="&A3, Financial_Model!Leads_Log!$Q:$Q)
```

---

### Dashboard (separate sheet):

| Summary | Value |
|---------|-------|
| Total partners | =COUNTA(Partners!B2:B) |
| Signed contract | =COUNTIF(Partners!O:O, TRUE) |
| Avg conversion rate | =AVERAGE(Partners!S:S) |
| Top performer (by installs) | =INDEX(Partners!B:B, MATCH(MAX(Partners!R:R), Partners!R:R, 0)) |
| Partners needing attention (0 conversions) | =FILTER(Partners!B:B, Partners!S:S=0) |

---

### Commission Payout Schedule (sheet):

```
Partner | Month | Installations | Commission/inst | Total due | Paid? | Payment date
PART-001 | May-26 | 2 | 50000 | 100000 | FALSE |
```

**Formula for Total due:** =C2*D2  
**Sum by partner (pivot):** Total outstanding per partner

---

## 8. MONTHLY METRICS DASHBOARD

**File name:** `Monthly Metrics - Tawan Power`  
**Purpose:** Executive summary of KPIs (copy to monthly email report)

```
A1: TAWAN POWER - MONTHLY PERFORMANCE
A3: Metric | This Month | Last Month | YTD | Target | Status
A4: Leads Generated | =SUM(Leads!H:H for month) | | | 50-200 | 
A5: Contact Rate (%) | =countif(Leads!K:K, "contacted")/total_leads | | | >80% |
A6: Consultations Scheduled | | | | | 
A7: Installations Completed | | | | | 
A8: Revenue (฿) | | | | | 
A9: CAC (฿) | | | | <5000 |
A10: LTV (฿) | | | | >50000 |
A11: LTV:CAC Ratio | | | | >3 |
A12: Avg System Size (kW) | | | | ~6kW |
A13: Avg Bill (kWh) | | | | ~800kWh |
A14: AI TTFT (ms) | | | | <200 |
A15: Error Rate (%) | | | | <1% |
A16: Customer CSAT | | | | >4.0 |
```

---

### Monthly Data Entry (sheets for each month):

Create sheets: `January 2026`, `February 2026`, etc.

Each sheet copies the same structure as above, but for daily logging:

```
Date | Leads | Consultations | Installations | Revenue | CAC | Notes
2026-05-01 | 2 | 0 | 0 | 0 | |
2026-05-02 | 3 | 0 | 0 | 0 | |
...
2026-05-31 | | | | | |
```

Formulas in Dashboard pull from these monthly sheets using `SUMIF` by date range.

---

## 🎯 Quick Setup Instructions

### Step 1: Create the Master Spreadsheet

1. Go to Google Sheets
2. Create new spreadsheet: `Tawan Power - Operations Dashboard`
3. Rename default sheet to `Unit_Economics` and add 3 more tabs:
   - `Monthly_Projections`
   - `Actual_vs_Plan`
   - `Leads_Log`

4. Copy formulas from above into appropriate cells

5. Format:
   - Header rows (A1, A3, etc.) → bold, background color
   - Currency columns → Format → Number → Currency → Thai Baht
   - Percentage columns → Format → Number → Percent (1 decimal)

---

### Step 2: Create Separate Spreadsheets

1. `Tawan Power - Leads Master` (use structure above, share with support team)
2. `Tawan Power - Customer Interviews` (track qualitative feedback)
3. `Tawan Power - Competitor Analysis` (market research)
4. `Tawan Power - SEO Content Calendar` (content planning)
5. `Tawan Power - Support Tickets` (ticketing system)
6. `Tawan Power - Partners` (partner management)
7. `Tawan Power - Monthly Metrics` (executive dashboard)

Or combine all into ONE master spreadsheet with 8 tabs (maybe better for consolidation).

---

### Step 3: Connect Sheets (Optional)

Use `IMPORTRANGE` to pull data from Leads Master into Metrics Dashboard:

```
=IMPORTRANGE("URL_of_Leads_Master", "Leads!A:S")
```

Then use QUERY to filter by date:
```
=QUERY(IMPORTRANGE(...), "SELECT * WHERE date >= '2026-05-01'")
```

---

### Step 4: Automate Data Sync (Optional, needs Apps Script)

Create script to auto-export Supabase data to Google Sheets:

```javascript
// Apps Script in Google Sheets
// Extensions → Apps Script

function importLeadsFromSupabase() {
  const response = UrlFetchApp.fetch('https://your-project.supabase.co/rest/v1/leads', {
    headers: {
      'Authorization': 'Bearer sb_publishable_u_...',
      'Content-Type': 'application/json'
    }
  });
  const data = JSON.parse(response.getContentText());
  
  // Write to sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads_Log');
  data.forEach(row => {
    sheet.appendRow([row.id, row.created_at, ...]);
  });
}
```

Schedule: Triggers → Time-driven → daily at 6am

---

## 📥 Import Template (CSV)

If you want to pre-fill data structures, create CSV with headers:

**leads_master_template.csv:**
```csv
ID,Created At,Session ID,Name,Phone,LINE ID,Segment,Bill (kWh),Est. System (kW),Payback (years),Status,Contacted Date,Contact Method,Engineer Assigned,Site Survey Scheduled,Installation Date,Commission,Notes,Lost Reason
L-001,,,,,,,,,,,,new,,,,
```

Then in Google Sheets: File → Import → Upload CSV → "Replace current sheet"

---

## 🎨 Styling Recommendations

**Color scheme (match Tawan Power brand):**
- Primary green: `#10b981`
- Secondary yellow: `#f59e0b`
- Success green: `#d1fae5` background
- Warning yellow: `#fef3c7` background
- Error red: `#fee2e2` background
- Neutral grays: `#f9fafb` (light), `#374151` (text)

**Font:** Inter (if available), otherwise Arial/Helvetica

**Header style:**
- Background: `#0f172a` (dark blue/black)
- Text: white
- Font weight: bold, 12-14pt

---

## 📱 Mobile Access

Share sheets with team:
- Leads Master: share with @tawanpower.com emails
- Set permissions: "Editor" for support team, "Viewer" for others
- Access on mobile via Google Sheets app (offline mode available)

---

## 🔄 Sync with Supabase

To keep Google Sheets in sync with database:

**Option A: Manual export**
1. Supabase → Table Editor → leads → Export CSV
2. Import into `Leads_Log` tab (replaces old data)
3. Formulas in `Actual_vs_Plan` auto-update

**Option B: Automated (Apps Script)**
See script above. Requires:
- Supabase anon key (public, safe in script)
- Service URL
- Schedule via Triggers

**Option C: Use Zapier/Make.com**
- Trigger: New row in Supabase (webhook)
- Action: Append row to Google Sheet
- Cost: ~$20/month

---

## ✅ Checklist: Complete Setup

- [ ] Create `Tawan Power - Operations Dashboard` with 4 tabs
- [ ] Copy formulas exactly (pay attention to cell references like `$B$5` absolute refs)
- [ ] Set up conditional formatting (colors by status)
- [ ] Create data validation dropdowns (Status, Contact Method, Engineer)
- [ ] Format currencies as ฿, percentages as %
- [ ] Share with team (`@tawanpower.com` domain)
- [ ] Create `Leads Master` separate sheet (more detailed)
- [ ] Set up filter views (for morning routine: filter by Status=new)
- [ ] Create `Monthly Metrics` dashboard (executive summary)
- [ ] Test formulas: change B5 (conversion rate) → calculations update
- [ ] Freeze header rows (View → Freeze → 1 row)
- [ ] Protect formula cells (Data → Protected sheets) to prevent accidental edit
- [ ] Add scripts for auto-import if desired
- [ ] Document in OPERATIONS_PLAYBOOK how to use these sheets

---

**All sheets ready to copy-paste. Need help connecting to Supabase for auto-sync?**
