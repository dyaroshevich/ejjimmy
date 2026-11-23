# 📝 Tawan Power Consultation Result Form

This form is filled by engineers after each client consultation.

## Google Form Structure

### Section 1: Client Information
- **Client Name** (Short text)
- **Phone Number** (Short text)
- **Email** (Short text)
- **Property Type** (Multiple choice: House, Condo, Hotel, Commercial, Other)
- **Location** (Short text - address/area)
- **Consultation Date** (Date)
- **Consultation Time** (Time)
- **Engineer Name** (Short text)

### Section 2: Technical Details
- **Monthly Electricity Bill** (Number, THB)
- **Current Bill Period** (Text - peak/off peak)
- **Roof Type** (Multiple choice: Concrete, Metal Tile, Ceramic Tile, Flat, Other)
- **Roof Area** (Number, square meters)
- **Orientation** (Multiple choice: South, Southeast, Southwest, East, West, North)
- **Shading Issues** (Multiple choice: None, Minimal, Moderate, Severe)
- **Interested System Size** (Number, kW)

### Section 3: Consultation Outcome
- **Client Interest Level** (Scale 1-5: 1=Not interested, 5=Very interested)
- **Key Concerns** (Checkbox: Price, Timeline, Technical, Warranty, Other)
- **Additional Notes** (Paragraph text)

### Section 4: Sales Status
- **Status** (Multiple choice: 
  - Ready to Survey
  - Need More Information
  - Not Interested
  - Wants to Compare
  - Decision Maker Not Available)
- **Next Steps** (Paragraph text)
- **Follow-up Date** (Date)
- **Probability to Install** (Scale 1-10)

### Section 5: Deal Information (if applicable)
- **Quoted Price** (Number, THB)
- **System Details** (Paragraph text - panels, inverter, etc.)
- **Payment Terms** (Multiple choice: Cash, Installment, Bank Loan)
- **Commission Estimate** (Number, THB - 10% of quoted price)

## Form Validation Rules

- Required fields marked with asterisk (*)
- Phone number format validation
- Bill amount must be positive
- System size must be between 1-100 kW

## Response Confirmation Message

"Thank you for completing the consultation report. The data will be used to improve our AI system and track conversion rates."

## Data Processing

1. **Automated to Google Sheet** `[Tawan Power] Consultation Results`
2. **Metrics calculated automatically**:
   - Conversion rate (leads → consultations)
   - Average deal size
   - Survey booking rate
   - Installation rate by segment

## Dashboard Integration

Form responses feed into:
- **Conversion Metrics Dashboard**
- **Revenue Projections**
- **Performance Analytics**

## Quality Assurance

Random sample 10% of consultations reviewed monthly for:
- Accuracy of information
- Professionalism
- Sales process adherence
```