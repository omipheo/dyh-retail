import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") || "general"

  const templates: Record<string, string> = {
    tax_reminder: generateTaxReminderTemplate(),
    compliance_deadline: generateComplianceDeadlineTemplate(),
    new_client_welcome: generateNewClientWelcomeTemplate(),
    quarterly_update: generateQuarterlyUpdateTemplate(),
    fee_structure: generateFeeStructureTemplate(),
    engagement_letter: generateEngagementLetterTemplate(),
  }

  const template = templates[type] || templates.tax_reminder

  return new NextResponse(template, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${type}_template.docx"`,
    },
  })
}

function generateTaxReminderTemplate(): string {
  // RTF format that Word can open
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Calibri;}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22

\\b\\fs32 Tax Return Lodgment Reminder\\b0\\fs22\\par
\\par
Date: <<Date>>\\par
\\par
Dear <<ClientName>>,\\par
\\par
This is a friendly reminder that the upcoming tax return lodgment deadlines are approaching.\\par
\\par
\\b Client Information:\\b0\\par
Client Type: <<ClientType>>\\par
Status: <<Status>>\\par
Client Since: <<ClientSince>>\\par
\\par
\\b Important Deadlines:\\b0\\par
• Individual Tax Returns: 31 October\\par
• Company Tax Returns: Varies by lodgment program\\par
• SMSF Returns: As per lodgment schedule\\par
\\par
\\b Required Documents:\\b0\\par
• Payment summaries and income statements\\par
• Receipts for deductions\\par
• Interest statements\\par
• Dividend statements\\par
• Business records (if applicable)\\par
\\par
Please contact our office to arrange a convenient appointment or to submit your documents.\\par
\\par
Best regards,\\par
\\par
[Your Practice Name]\\par
[Contact Information]\\par
\\par
}`
}

function generateComplianceDeadlineTemplate(): string {
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Calibri;}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22

\\b\\fs32 Compliance Deadline Notice\\b0\\fs22\\par
\\par
Date: <<Date>>\\par
\\par
Dear <<ClientName>>,\\par
\\par
This notice is to inform you of upcoming ATO compliance obligations relevant to your circumstances.\\par
\\par
\\b Client Details:\\b0\\par
Name: <<ClientName>>\\par
Type: <<ClientType>>\\par
Email: <<Email>>\\par
Phone: <<Phone>>\\par
\\par
\\b Upcoming Obligations:\\b0\\par
[List specific compliance requirements based on client type]\\par
\\par
\\b Action Required:\\b0\\par
Please ensure all required information is provided to our office at least two weeks before the deadline to allow adequate time for preparation and lodgment.\\par
\\par
If you have any questions or concerns, please don't hesitate to contact us.\\par
\\par
Sincerely,\\par
\\par
[Your Practice Name]\\par
[Contact Details]\\par
}`
}

function generateNewClientWelcomeTemplate(): string {
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Calibri;}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22

\\b\\fs32 Welcome to Our Practice\\b0\\fs22\\par
\\par
Date: <<Date>>\\par
\\par
Dear <<ClientName>>,\\par
\\par
Welcome to [Your Practice Name]! We are delighted to have you as a new client and look forward to working with you.\\par
\\par
\\b Your Details:\\b0\\par
Email: <<Email>>\\par
Phone: <<Phone>>\\par
Client Type: <<ClientType>>\\par
Client Since: <<ClientSince>>\\par
\\par
\\b What to Expect:\\b0\\par
• Personalized tax and accounting services\\par
• Proactive compliance management\\par
• Regular updates on tax matters\\par
• Access to our client portal\\par
\\par
\\b Next Steps:\\b0\\par
1. Complete our client information form\\par
2. Provide necessary documentation\\par
3. Schedule your initial consultation\\par
\\par
Our team is here to support your financial success. Please feel free to contact us anytime.\\par
\\par
Best regards,\\par
\\par
[Your Name]\\par
[Your Practice Name]\\par
[Contact Information]\\par
}`
}

function generateQuarterlyUpdateTemplate(): string {
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Calibri;}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22

\\b\\fs32 Quarterly Client Update\\b0\\fs22\\par
\\par
Quarter: [Current Quarter] [Year]\\par
\\par
Dear <<ClientName>>,\\par
\\par
As we conclude another quarter, we wanted to share important updates and reminders with you.\\par
\\par
\\b Recent Developments:\\b0\\par
• [Tax legislation changes]\\par
• [ATO focus areas]\\par
• [Industry updates relevant to client]\\par
\\par
\\b Upcoming Obligations:\\b0\\par
Based on your client type (<<ClientType>>), please be aware of the following:
[List relevant quarterly obligations]\\par
\\par
\\b Practice News:\\b0\\par
[Any practice updates, new services, or team changes]\\par
\\par
We value your continued partnership and are committed to providing excellent service.\\par
\\par
Warm regards,\\par
\\par
[Your Practice Name]\\par
}`
}

function generateFeeStructureTemplate(): string {
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Calibri;}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22

\\b\\fs32 Fee Structure Notice\\b0\\fs22\\par
\\par
Date: <<Date>>\\par
\\par
Dear <<ClientName>>,\\par
\\par
This letter outlines our fee structure for the services we provide to you.\\par
\\par
\\b Client Information:\\b0\\par
Client Type: <<ClientType>>\\par
Status: <<Status>>\\par
\\par
\\b Standard Services:\\b0\\par
[List standard services and fees]\\par
\\par
\\b Additional Services:\\b0\\par
[List additional services available]\\par
\\par
\\b Payment Terms:\\b0\\par
• Invoices are issued upon completion of work\\par
• Payment is due within 14 days\\par
• Various payment methods accepted\\par
\\par
\\b Queries:\\b0\\par
If you have any questions about our fees or services, please contact us for clarification.\\par
\\par
Thank you for your business.\\par
\\par
Sincerely,\\par
\\par
[Your Practice Name]\\par
[Contact Information]\\par
}`
}

function generateEngagementLetterTemplate(): string {
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Calibri;}}
\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22

\\b\\fs32 Letter of Engagement\\b0\\fs22\\par
\\par
Date: <<Date>>\\par
\\par
Dear <<ClientName>>,\\par
\\par
This letter confirms the terms of our engagement to provide professional services to you.\\par
\\par
\\b Client Details:\\b0\\par
Name: <<ClientName>>\\par
Email: <<Email>>\\par
Phone: <<Phone>>\\par
Client Type: <<ClientType>>\\par
\\par
\\b Scope of Services:\\b0\\par
We agree to provide the following services:
[List services to be provided]\\par
\\par
\\b Your Responsibilities:\\b0\\par
• Provide accurate and complete information\\par
• Respond to queries in a timely manner\\par
• Review and approve work before lodgment\\par
• Make payment as per agreed terms\\par
\\par
\\b Our Responsibilities:\\b0\\par
• Provide professional services with due care\\par
• Maintain confidentiality\\par
• Meet all statutory deadlines\\par
• Communicate regularly\\par
\\par
\\b Fees and Payment:\\b0\\par
[Fee structure details]\\par
\\par
Please sign and return a copy of this letter to confirm your acceptance of these terms.\\par
\\par
Accepted and Agreed:\\par
\\par
______________________  Date: __________\\par
<<ClientName>>\\par
\\par
Yours faithfully,\\par
\\par
[Your Name]\\par
[Your Practice Name]\\par
}`
}
