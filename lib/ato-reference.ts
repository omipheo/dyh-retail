// ATO Private Correspondence and Tax Ruling Reference Library
// This file provides access to ATO documents for report generation

export const ATO_REFERENCE_DOCUMENTS = {
  deductYourHomeBook: {
    path: "user_read_only_context/text_attachments/DeductYourHome_interior_v7_new-bVfYg.pdf",
    title: "Deduct Your Home - Complete Guide",
    description:
      "Comprehensive guide on home business taxation including ATO Private Binding Rulings (PBRs), intellectual property acknowledgments, and approved strategies",
    keyTopics: [
      "ATO Private Binding Rulings (PBRs)",
      "Register of Private Binding Rulings",
      "ATO acknowledgment of intellectual property",
      "Five Strategies for home business",
      "Business structure recommendations",
      "Tax optimization principles",
      "Property strategies (build, buy, extensions, upgrades)",
      "Cash flow and costing methodologies",
      "Retirement and superannuation planning",
      "Resimercial asset sub-class concept",
      "ATO Law Administration Practice Statements (PSLA 2008/4)",
      "Promoter Penalty Laws compliance",
    ],
  },
  strategySelector: {
    path: "user_read_only_context/text_attachments/DYH-Strategy-Selector-V47z7.pdf",
    title: "DYH Strategy Selector (Corrected)",
    description:
      "64-question Business, Wealth & Lifestyle Self-Profiler with Table 2 decision tree logic (Q40 corrected)",
    keyTopics: [
      "Business asset valuation and disposal",
      "Home business assessment criteria",
      "Property goals and strategies",
      "Cash flow planning",
      "Insurance needs analysis",
      "Superannuation attitudes",
      "Employment preferences",
      "Business premises leasing (Q40)",
      "Business dependency analysis",
      "COWB (Change of Work Base) assessment",
      "Table 2 decision tree for strategy determination",
    ],
  },
}

// Key ATO compliance references
export const ATO_COMPLIANCE_REFERENCES = {
  privateBindingRulings: {
    description: "Highest form of taxpayer protection providing Commissioner's views in writing",
    registerUrl: "https://www.ato.gov.au/rba/",
    publicationDelay: "28 days after issuance",
    confidentialityProtection: "IP protection granted under PSLA 2008/4 Step 4",
  },
  lawAdministrationStatement: {
    reference: "PSLA 2008/4",
    title: "Law Administration Practice Statement",
    url: "https://www.ato.gov.au/law/view/document?docid=PSR/PS20084/NAT/ATO/00001",
    relevantSection: "Step 4: Remove or replace confidential information",
  },
  promoterPenaltyLaws: {
    description: "ATO review conducted in 2010 confirming no illegal tax exploitation scheme",
    outcome: "No issues identified - ATO ongoing monitoring confirmed compliance",
  },
  documentRetention: {
    period: "5 years from tax return lodgement date",
    requirements: [
      "Receipts, invoices, and bank statements for all business expenses",
      "Logbook for vehicle business use (minimum 12 weeks)",
      "Home office setup and usage pattern documentation",
      "Legible documents clearly showing date, amount, and supplier",
    ],
  },
}

// ATO clearances and acknowledgments
export const ATO_CLEARANCES = {
  taxExploitationScheme: {
    status: "CLEARED",
    description: "ATO Cleared As Not An Illegal Tax Exploitation Scheme",
  },
  partIVA: {
    status: "CLEARED",
    description: "ATO Part IV A Cleared As Not To Obtain An Illegal Tax Benefit",
  },
  intellectualProperty: {
    status: "ACKNOWLEDGED",
    description: "ATO Acknowledged Intellectual Property Fuelling Your Strategy",
  },
}

// Function to get ATO reference context for report generation
export function getATOReferenceContext(): string {
  return `
**ATO Compliance & Reference Documentation**

This advice is based on comprehensive research, testing, and interpretation of Federal and State Legislative Acts and Australian Taxation Office Rulings, including:

1. **Private Binding Rulings (PBRs)**: The highest form of taxpayer protection, providing the Commissioner's views in writing. Our strategies have been formally reviewed and acknowledged by the ATO.

2. **ATO Intellectual Property Acknowledgment**: The Australian Taxation Office has formally acknowledged our intellectual property both verbally and in writing regarding home business taxation matters.

3. **ATO Clearances**:
   - Cleared as NOT an illegal tax exploitation scheme
   - Part IV A cleared as NOT designed to obtain an illegal tax benefit
   - Intellectual property acknowledged by the ATO as fuelling these strategies

4. **Regulatory Compliance**: All strategies comply with ATO Law Administration Practice Statement PSLA 2008/4 and have undergone rigorous ATO review under Promoter Penalty Laws.

5. **Public Register**: While some PBRs are published at the Register of Private Binding Rulings (https://www.ato.gov.au/rba/), confidential business information and intellectual property has been protected under ATO directives.

**Important Disclaimers**:
- This report provides general information based on the "Deduct Your Home" intellectual property and should not be considered personal financial advice without a full consultation
- Tax laws and ATO rulings may change over time
- Professional implementation and ongoing compliance monitoring is essential
- Document retention requirements must be followed (5 years from tax return lodgement)

For full details, refer to "Deduct Your Home" by Frank Genovesi and the DYH Strategy Selector documentation.
  `.trim()
}

// Function to get strategy-specific ATO guidance
export function getStrategyATOGuidance(strategyCode: string): string {
  const baseGuidance = getATOReferenceContext()

  return `${baseGuidance}

**Strategy-Specific Guidance for ${strategyCode}**:
This strategy has been developed through extensive analysis of ATO rulings and legislative requirements. Implementation requires careful adherence to ATO compliance standards and proper documentation as outlined in the "Deduct Your Home" methodology.
  `.trim()
}
