// Report Generation Reference Library
// Ensures all reports reference the correct source materials

import { getATOReferenceContext, getStrategyATOGuidance } from "./ato-reference"

export interface ReportReferences {
  atoContext: string
  strategyGuidance: string
  bookReference: string
  complianceNotes: string
}

export function getReportReferences(strategyCode?: string): ReportReferences {
  return {
    atoContext: getATOReferenceContext(),
    strategyGuidance: strategyCode ? getStrategyATOGuidance(strategyCode) : "",
    bookReference: `
**Source Material**: 
This report is based on the principles and methodologies outlined in "Deduct Your Home" by Frank Genovesi (ISBN: 978-0-6481966-3-1), which documents ATO-acknowledged intellectual property for home business taxation strategies.
    `.trim(),
    complianceNotes: `
**Compliance Requirements**:
- Maintain all supporting documentation for 5 years
- Keep detailed records of home office usage and business activities  
- Ensure all claims are substantiated with proper evidence
- Seek professional review before lodging tax returns
- Stay informed of ATO ruling changes and updates
    `.trim(),
  }
}

// Add these references to reports
export function appendATOReferencesToReport(reportContent: string, strategyCode?: string): string {
  const refs = getReportReferences(strategyCode)

  return `${reportContent}

---

## ATO Compliance & Documentation

${refs.atoContext}

${refs.strategyGuidance}

${refs.bookReference}

${refs.complianceNotes}
  `.trim()
}
