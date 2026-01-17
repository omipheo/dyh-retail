/**
 * Registered Tax Agent Nuances Disclosure Section
 *
 * This section is to be included in all Final Reports (HOME BASED, BUSINESS & TAXATION ADVICE documents)
 * to acknowledge the complexity of Deduct Your Home strategies and the role of the Registered Tax Agent.
 */

export const RTA_NUANCES_DISCLOSURE = `This report provides a comprehensive analysis based on your responses to the Deduct Your Home Strategy Selector questionnaire. However, the implementation of "Deduct Your Home" strategies involves numerous nuances that cannot be fully addressed in a templated report and require careful consideration of your specific circumstances.

What This Report Does Not Cover:

The Deduct Your Home methodology encompasses multiple strategies (SBRB, HBRS, TERS, SBLB, COWB) with various implementation approaches. This report provides general guidance but does not address specific nuances that depend on:

- Property type variations (apartments, houses, acreage, dual occupancy, strata regulations)
- Business-specific operational requirements (space allocation, client access, equipment storage)
- Life stage considerations (family growth, downsizing plans, retirement timing)
- Risk tolerance and financial capacity (conservative vs. aggressive implementation)
- Geographic and regulatory variations (council zoning, state-specific stamp duty, heritage overlays)
- Existing business structure transitions and timing strategies
- Co-ownership arrangements and family succession planning
- Cashflow optimization and tax payment timing strategies
- Interaction with other tax concessions and government benefits
- Accountant relationship and professional coordination requirements
- "Combo" strategies (combining multiple Deduct Your Home strategies for complex situations)
- Alternative Arrangements (A/A) for the Co-Owners Wealth Builder (COWB) strategy

Your Registered Tax Agent Will Address:

As part of your service, your dedicated Registered Tax Agent will directly address all nuances specific to your situation, including:

- Review and validation of all calculations and recommendations in this report
- Specific implementation guidance tailored to your property, business type, and personal circumstances
- ATO compliance verification with current legislation and private binding rulings
- Timing strategy optimization for maximum tax benefit and cashflow management
- Professional coordination with solicitors, financial planners, mortgage brokers as needed
- Documentation requirements for audit protection and ongoing record-keeping
- Legislative monitoring for changes that may affect your strategy
- Ongoing support throughout implementation and beyond
- Assessment of whether a "Combo" strategy (combining multiple approaches) may be appropriate
- Exploration of Alternative Arrangements for COWB implementation if applicable

Professional Indemnity Protection:

All advice provided by your Registered Tax Agent is covered by professional indemnity insurance. The strategies in this report are based on intellectual property formally acknowledged by the Australian Taxation Office and protected under ATO Law Administration Practice Statement PSLA 2008/4 Step 4.

Important Advisory:

This report should not be acted upon without direct consultation with your Registered Tax Agent. Tax law is complex and ever-changing. What appears optimal in principle may require adjustment based on factors not fully captured in the questionnaire process or that have changed since the report was generated.

Your Success is Our Priority:

The combination of this detailed report and your Registered Tax Agent's personalised guidance ensures you receive both the strategic vision and the tactical execution support necessary for successful implementation of your "Deduct Your Home" strategy.`

/**
 * Shorter version for Decisive Action Reports (DAR)
 */
export const RTA_NUANCES_DISCLOSURE_SHORT = `This Decisive Action Report provides an overview of your potential tax deductions and recommended Deduct Your Home strategy. However, successful implementation requires addressing numerous nuances specific to your property type, business operations, life stage, and personal circumstances that cannot be fully addressed in this templated report.

Your Registered Tax Agent Will Address All Nuances Including:

- Strategy-specific implementation details relevant to your situation
- Validation of calculations and ATO compliance requirements
- Detailed timing strategies for optimal tax and cashflow outcomes
- Coordination with other professionals (solicitors, planners, brokers)
- Assessment of whether "Combo" strategies or COWB Alternative Arrangements apply
- Ongoing support with professional indemnity protection

`

/**
 * Sales-focused version for Decisive Action Reports (DAR)
 * Designed to increase conversion to the Full Final Report
 */
export const RTA_NUANCES_DISCLOSURE_DAR = `This Decisive Action Report provides a preliminary snapshot of your potential tax savings and identifies your recommended Deduct Your Home strategy. However, this overview represents only the beginning of your wealth-building journey.

What You're Still Missing:

This Decisive Action Report cannot address critical implementation details that directly impact your success:

- Property-specific optimization strategies (your exact home layout, council requirements, zoning considerations)
- Business operational nuances (space requirements, client access, equipment storage for YOUR industry)
- "Combo" strategy opportunities (combining multiple Deduct Your Home approaches for maximum benefit)
- Alternative Arrangements for Co-Owners Wealth Builder (COWB) if applicable to your situation
- Precise timing strategies to maximize cashflow and minimize tax payments THIS financial year
- Risk mitigation tailored to your personal circumstances and risk tolerance
- Coordination with your other professional advisors
- Detailed implementation roadmap with specific action steps and deadlines

Your Comprehensive HOME BASED, BUSINESS & TAXATION ADVICE Document Provides:

- Complete financial analysis with validated calculations for your exact property and business
- Strategy-specific implementation guidance you can act on immediately
- Professional indemnity-backed advice from your dedicated Registered Tax Agent
- Detailed documentation requirements for full audit protection
- Ongoing legislative monitoring and strategy updates
- Direct Registered Tax Agent consultation to address every nuance of your unique situation

Don't Leave Money on the Table:

The difference between a general overview and personalised implementation guidance can mean tens of thousands of dollars in missed deductions, delayed benefits, or compliance issues. Your Registered Tax Agent will ensure every dollar of legitimate deduction is claimed while maintaining full ATO compliance.

Next Step:

Upgrade to your Full Final Report to receive the comprehensive analysis, validated calculations, and professional Registered Tax Agent consultation needed to confidently implement your Deduct Your Home strategy and start enhancing wealth and lifestyle through your home-based business.

All advice provided by your Registered Tax Agent is covered by professional indemnity insurance and based on intellectual property formally acknowledged by the Australian Taxation Office.`

/**
 * Helper function to inject the disclosure into report templates
 */
export function addRTADisclosure(reportContent: string, isDAR = false): string {
  let disclosure: string
  if (isDAR) {
    disclosure = RTA_NUANCES_DISCLOSURE_DAR
  } else {
    disclosure = RTA_NUANCES_DISCLOSURE
  }

  // Insert before "Next Steps" or "Implementation" section if it exists
  const insertMarkers = [
    "## NEXT STEPS",
    "## Next Steps",
    "## IMPLEMENTATION",
    "## Implementation",
    "## APPENDIX",
    "## Appendix",
  ]

  for (const marker of insertMarkers) {
    if (reportContent.includes(marker)) {
      return reportContent.replace(marker, `${disclosure}\n\n${marker}`)
    }
  }

  // If no insertion point found, append to end before any appendices
  return reportContent + "\n\n" + disclosure
}
