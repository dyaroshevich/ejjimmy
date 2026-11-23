# 📋 Tawan Power Leads Master Template

This is the template for Google Sheet `[Tawan Power] Leads - Master`

## Sheet Structure

### Column Definitions

| Column | Name | Description | Example | Format |
|--------|------|-------------|---------|--------|
| **A** | ID | Sequential identifier | L-001 | Text |
| **B** | Timestamp | When lead was created | 2026-05-15 14:30:22 | DateTime |
| **C** | Session ID | Chat session identifier | chat_abc123 | Text |
| **D** | Name | Lead's name | John Smith | Text |
| **E** | Phone | Phone number with country code | +66812345678 | Phone |
| **F** | LINE ID | LINE account ID | @johnsmith | Text |
| **G** | Segment | Customer segment | Residential | Dropdown |
| **H** | Bill (kWh) | Monthly electricity bill | 800 | Number |
| **I** | System Size (kW) | Estimated system size | 5.2 | Number |
| **J** | Payback (years) | Estimated payback period | 6.5 | Number |
| **K** | Notes | Additional information | English speaking | Text |
| **L** | Status | Lead status | New → Contacted → Survey → Install | Dropdown |
| **M** | First Contact | Date/time of first contact | 2026-05-15 16:00:00 | DateTime |
| **N** | Engineer Assigned | Name of assigned engineer | Somchai | Text |
| **O** | Survey Date | Date of site survey | 2026-05-18 | Date |
| **P** | Install Date | Installation completion date | 2026-06-01 | Date |
| **Q** | Deal Size | Final contract value (THB) | 550,000 | Currency |
| **R** | Commission (THB) | Our commission (10%) | 55,000 | Currency |
| **S** | Status Notes | Detailed status updates | Called, agreed to survey | Text |

## Data Validation Rules

### Dropdown Lists
- **Segment**: Residential, Commercial, Hotel
- **Status**: New, Contacted, Survey Scheduled, Survey Done, Quoted, Won, Lost, Cold

### Number Formatting
- **Bill (kWh)**: Number, 0 decimal places
- **System Size (kW)**: Number, 1 decimal place  
- **Payback (years)**: Number, 1 decimal place
- **Deal Size**: Currency (THB)
- **Commission**: Currency (THB)

## Instructions for Use

1. **When new lead comes in**:
   - Create new row with ID = L-001, L-002, etc.
   - Fill in basic info from chat
   - Set Status = "New"

2. **Within 4 hours**:
   - Update Status = "Contacted"
   - Fill in First Contact timestamp
   - Assign engineer

3. **After survey**:
   - Update Survey Date and Status
   - Add Deal Size when quoted

4. **After installation**:
   - Update Install Date and Status = "Won"
   - Add final Deal Size and Commission

## Formulas

### Commission Calculation (Cell R2):
```
=IF(Q2>0, Q2*0.1, "")
```

### Total Commission (Cell S1):
```
=SUM(R:R)
```

### Total Revenue (Cell T1):
```
=SUM(Q:Q)
```

## Dashboard Links

Create separate sheets for:
- **Dashboard**: Summary metrics and charts
- **Leads**: Main tracking sheet
- **Consultations**: Feedback forms
- **Revenue**: Financial tracking