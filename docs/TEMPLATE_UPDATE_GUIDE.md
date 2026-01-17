# Final Report Template Update Guide

## Overview
This guide provides instructions for updating the `final_report.docx` Word template to include the new LIMITATIONS section and remove page numbers from the Table of Contents.

## Step 1: Download Current Template

1. Navigate to `/admin/manage-templates` in your browser
2. Find `templates/final_report.docx`
3. Click **Download** to save the current template to your computer
4. Open the file in Microsoft Word

## Step 2: Update Table of Contents (Remove Page Numbers)

Replace the existing Table of Contents with this format:

```
TABLE OF CONTENTS
═══════════════════════════════════════════════

SECTION 1: SCOPE

SECTION 2: LIMITATIONS

SECTION 3: EXECUTIVE SUMMARY

SECTION 4: YOUR RECOMMENDED DYH STRATEGY

SECTION 5: FINANCIAL ANALYSIS & PROJECTIONS

SECTION 6: BUSINESS USE PERCENTAGE CALCULATIONS

SECTION 7: TAX DEDUCTION SUMMARY

SECTION 8: IMPLEMENTATION ROADMAP

SECTION 9: ATO COMPLIANCE & DOCUMENTATION

SECTION 10: NEXT STEPS

APPENDICES
```

**Why no page numbers?**
- Reports are delivered as PDFs with variable-length sections
- Dynamic content (like LIMITATIONS section) varies in length per client
- Page numbers would be inaccurate and misleading
- PDF bookmarks provide navigation instead

## Step 3: Add LIMITATIONS Section Placeholder

After **SECTION 1: SCOPE** content, add:

```
═══════════════════════════════════════════════
SECTION 2: LIMITATIONS
═══════════════════════════════════════════════

{{LIMITATIONS_SECTION}}

```

**Important Notes:**
- The placeholder MUST be exactly: `{{LIMITATIONS_SECTION}}` (double curly braces)
- Leave blank lines before and after the placeholder
- Do not add any other text between the section header and placeholder
- The system will automatically populate this with strategy-specific limitations

## Step 4: Renumber All Subsequent Sections

Update all section numbers after LIMITATIONS:

**OLD NUMBERING → NEW NUMBERING:**

| Old | New | Section Name |
|-----|-----|--------------|
| Section 1 | Section 1 | SCOPE |
| **NEW** | **Section 2** | **LIMITATIONS** |
| Section 2 | Section 3 | EXECUTIVE SUMMARY |
| Section 3 | Section 4 | YOUR RECOMMENDED DYH STRATEGY |
| Section 4 | Section 5 | FINANCIAL ANALYSIS & PROJECTIONS |
| Section 5 | Section 6 | BUSINESS USE PERCENTAGE CALCULATIONS |
| Section 6 | Section 7 | TAX DEDUCTION SUMMARY |
| Section 7 | Section 8 | IMPLEMENTATION ROADMAP |
| Section 8 | Section 9 | ATO COMPLIANCE & DOCUMENTATION |
| Section 9 | Section 10 | NEXT STEPS |

**Find and Replace Method:**
1. Press `Ctrl+H` (Windows) or `Cmd+H` (Mac)
2. Find: `SECTION 9:` → Replace with: `SECTION 10:`
3. Find: `SECTION 8:` → Replace with: `SECTION 9:`
4. Find: `SECTION 7:` → Replace with: `SECTION 8:`
5. Continue backwards to avoid duplicate numbering
6. Finally add the new `SECTION 2: LIMITATIONS`

## Step 5: Verify All Placeholders

Ensure these placeholders remain intact throughout the document:

### Client Information
- `{{CLIENT_NAME}}`
- `{{REPORT_DATE}}`
- `{{BUSINESS_NAME}}`
- `{{BUSINESS_TYPE}}`

### Strategy Details
- `{{RECOMMENDED_STRATEGY}}`
- `{{STRATEGY_DESCRIPTION}}`
- `{{STRATEGY_BENEFITS}}`

### Financial Data
- `{{BUSINESS_USE_PERCENTAGE}}`
- `{{ANNUAL_TAX_SAVINGS}}`
- `{{MORTGAGE_INTEREST_DEDUCTION}}`
- `{{DEPRECIATION_CLAIM}}`
- `{{TOTAL_DEDUCTIONS}}`

### New Placeholder (Section 2)
- `{{LIMITATIONS_SECTION}}` ← **Must be added**

## Step 6: Save and Upload

1. **Save** the updated document: `File → Save As → final_report.docx`
2. Navigate to `/admin/upload-template` in your browser
3. Select **Template Type**: "Final Report (Full Version)"
4. Click **Choose File** and select your updated `final_report.docx`
5. Click **Upload**
6. Verify success message appears

## Step 7: Test the Updated Template

1. Navigate to `/demo/scenarios`
2. Select a demo client (e.g., Sarah Chen)
3. Click **Generate Full Report**
4. Download the generated report
5. Verify:
   - ✅ Table of Contents has no page numbers
   - ✅ SECTION 2: LIMITATIONS appears with content
   - ✅ All sections are correctly numbered (1-10)
   - ✅ LIMITATIONS content is strategy-specific and professional

## What the LIMITATIONS Section Will Contain

The system automatically generates this content based on the client's strategy:

### For All Strategies:
- Strategy-specific implementation nuances
- Property type considerations (apartment vs house vs acreage)
- Business type factors (retail vs professional services vs manufacturing)
- Risk profile adjustments
- Cash flow timing strategies
- Accountant relationship considerations
- Geographic/regulatory variations
- Implementation sequencing

### Professional Consultation Note:
Every report will include:
> "This report provides general strategic guidance based on your questionnaire responses. However, numerous implementation nuances require direct consultation with your Registered Tax Agent, including [specific list]. Your RTA will address all strategy-specific details, compliance requirements, and personalized implementation steps during your consultation."

## Troubleshooting

### Issue: Placeholders not being replaced
**Solution:** Ensure placeholders use double curly braces: `{{PLACEHOLDER}}` not `{PLACEHOLDER}`

### Issue: Section numbering is inconsistent
**Solution:** Use Find & Replace working backwards from highest to lowest section number

### Issue: LIMITATIONS section is empty in generated reports
**Solution:** Check that the placeholder is exactly `{{LIMITATIONS_SECTION}}` with no extra spaces

### Issue: Template upload fails
**Solution:** Ensure file is `.docx` format (not `.doc` or other formats)

## Additional Resources

- **ATO Reference Library**: `/lib/ato-reference.ts` - Contains compliance references
- **Report Sections Module**: `/lib/report-sections/rta-nuances-disclosure.ts` - Limitations content generator
- **Report Generation API**: `/app/api/generate-report/route.ts` - Template processing logic

## Questions?

If you encounter issues during template updates, check:
1. Browser console for error messages (`F12` → Console tab)
2. Server logs (if self-hosting)
3. Vercel Blob Storage at `/admin/manage-templates` to verify upload succeeded

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Applies To:** final_report.docx template
