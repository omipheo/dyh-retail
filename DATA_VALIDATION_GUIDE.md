# Data Validation Requirements

## Purpose

This guide explains what data the system needs to generate accurate tax calculations and why each field is important.

## Critical Fields

### 1. Building Value
**Why Required:** Used to calculate building depreciation at 2.5% per annum, which is a significant deductible expense.

**What Happens Without It:** System cannot calculate property-related deductions accurately. Manual calculation required.

**How to Obtain:** 
- Property valuation report
- Purchase price minus land value
- Council valuation (building component only)

### 2. Internet & Phone Business Use Percentage
**Why Special Calculation Required:** These expenses cannot be calculated using floor space percentage like other running expenses. The ATO requires actual usage analysis.

**How to Calculate:**
1. Obtain a representative 30-day bill
2. Analyze usage patterns:
   - Business calls vs personal calls
   - Business data vs personal streaming/browsing
3. Calculate percentage of business use
4. Document the methodology

**Example:**
- Total internet data: 500GB
- Business video calls, cloud storage: 200GB
- Business use percentage: 40%

### 3. Property Expenses

#### Home Loan Interest
**Why Required:** One of the largest deductible expenses, apportioned by office percentage.

**Documentation:** Annual interest statement from lender.

#### Council Rates
**Why Required:** Deductible when apportioned to office use.

**Documentation:** Annual rates notice.

#### Water Rates
**Why Required:** Includes water usage and service charges, apportioned by office percentage.

**Documentation:** Quarterly water bills (sum for annual).

#### Building Insurance
**Why Required:** Protects the building asset, deductible when apportioned.

**Documentation:** Annual insurance policy/renewal notice.

### 4. Office Measurements

#### Total Home Size (sqm)
**Why Required:** Used to calculate office use percentage.

**How to Measure:** Include all internal living spaces, excluding garage and outdoor areas.

#### Home Office Size (sqm)
**Why Required:** Determines the proportion of home expenses that are deductible.

**Important Notes:**
- Office size cannot exceed total home size (logical impossibility)
- Office size over 50% of home may trigger ATO scrutiny
- Must be dedicated office space used regularly and exclusively for business

### 5. DYH Strategy Selector (65 Questions)

**Why Required:** The decision logic in Tables 1 and 2 uses your "NO" answers to these questions to determine which of the 15+ DYH procedures applies to your specific situation.

**What Happens Without It:** System cannot determine the appropriate strategy (Lease Buster, Twist Exist, SBRB, etc.) and cannot generate tailored advice.

**Time to Complete:** 15-20 minutes

### 6. Supporting Documents

**Why Required:** ATO requires substantiation for all claims. Without documents, deductions may be disallowed on audit.

**Minimum Required:**
- Utility bills (electricity, internet, phone)
- Property expense invoices/statements
- Business activity evidence
- Home office photos (showing dedicated workspace)

## Validation Warnings

### Office Size Warnings

**Warning: "Office size exceeds 50% of home"**
- **Risk:** ATO may question whether entire home is private dwelling
- **Action:** Tax agent will review and determine if strategy adjustment needed
- **May Require:** Additional documentation to support claim

### Deduction Warnings

**Warning: "Deductions exceed annual income"**
- **Risk:** Negative gearing in home-based business requires careful structuring
- **Action:** Manual review of business model and tax strategy
- **May Require:** Business plan and income projections

### Missing Data Warnings

**Warning: "No supporting documents uploaded"**
- **Impact:** Report can be generated but will note "subject to verification"
- **Risk:** Claims cannot be substantiated on audit
- **Action:** Upload documents before lodgment

## What the System Can Calculate Automatically

✅ Office use percentage (when measurements provided)
✅ Building depreciation at 2.5% p.a. (when building value provided)
✅ Apportioned property expenses (when amounts provided)
✅ Fixed rate method vs Actual cost method comparison
✅ ATO compliance assessment
✅ DYH strategy determination (when Strategy Selector completed)

## What Requires Manual Input

⚠️ Internet business use percentage (30-day bill analysis)
⚠️ Phone business use percentage (30-day bill analysis)
⚠️ Building value (if not in documents)
⚠️ Unusual expenses or circumstances
⚠️ Complex business structures
⚠️ Multiple property scenarios

## Getting Help

If you're unsure about any data requirements:

1. **Check the field's info box** (ℹ️ icon) in the questionnaire
2. **Send a message** to your tax agent via Messages
3. **Request a consultation** during report review
4. **Refer to the Quick Questionnaire PDF** for detailed instructions

## Best Practices

1. **Complete data collection before starting:** Gather all documents first
2. **Use actual figures, not estimates:** ATO requires substantiation
3. **Keep 30-day bill analysis documented:** You may need to explain methodology
4. **Upload all supporting documents:** More is better for audit protection
5. **Answer all Strategy Selector questions:** Even if some seem irrelevant, the decision logic needs complete information

---

**Remember:** The system is designed to protect you by ensuring all necessary data is collected before generating advice. Automated messages help identify gaps early, preventing costly mistakes or ATO disputes later.
