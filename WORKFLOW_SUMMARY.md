# Tax Practice App - Complete Workflow

## System Overview
This tax practice application provides an end-to-end workflow for analyzing client home office tax situations and generating comprehensive advice reports.

## Workflow Steps

### 1. Document Upload (Tax Agent)
**Location:** `/admin/reference-docs/upload`

Tax agents upload reference documents that form the knowledge base:
- **DYH Book (Deduct Your Home)** - Amazon #1 bestselling book
- **ATO PBRs** - Private Binding Rulings from Australian Taxation Office
- **DYH Strategy Selector** - Strategy selection templates
- **Quick Questionnaire** - Client questionnaire templates
- **HOME BASED, BUSINESS & TAXATION ADVICE** - Final report template (client deliverable)

These documents are stored in Vercel Blob and serve as the AI's reference library.

### 2. Client Onboarding
**Location:** `/auth/sign-up`, `/auth/login`

Clients create accounts and log in to access the system.

### 3. Client Questionnaire
**Location:** `/questionnaire`

Clients complete a comprehensive questionnaire covering:
- Personal information
- Work patterns and hours
- Home office details
- Property information
- Business expenses
- Income details

Responses are stored in the database for analysis.

### 4. Client Document Upload
**Location:** `/dashboard` → Upload section

Clients upload supporting documents:
- Photos of home office
- Receipts and invoices
- Property documents
- Work contracts
- Any other relevant documentation

Files are stored in Vercel Blob under `documents/{clientId}/`.

### 5. AI Analysis & Interim Report Generation
**Location:** `/admin/analyze/{assessmentId}`

Tax agents trigger AI analysis which:

1. **Fetches all data:**
   - Client questionnaire responses
   - Client uploaded documents
   - Reference documents (DYH book, ATO PBRs, etc.)

2. **AI Document Analysis:**
   - Each client document is analyzed using GPT-4o
   - Key findings extracted
   - Relevant tax information identified

3. **Cross-Reference Analysis:**
   - Client situation is compared against DYH methodology
   - ATO PBRs are consulted for compliance
   - Strategy selectors help determine optimal approach

4. **Generate 3 Interim Report Versions:**
   - **Version 1: Conservative Approach** - Low risk, maximum ATO compliance
   - **Version 2: Balanced Optimization** - Moderate deductions with reasonable risk
   - **Version 3: Aggressive Maximization** - Maximum legal deductions

Each version includes:
   - Recommended method (Fixed Rate vs Actual Cost)
   - Detailed reasoning
   - Tax calculations
   - Potential deduction amount
   - Risk factors
   - ATO compliance requirements
   - Next steps

### 6. Client Selection
**Location:** `/admin/analyze/{assessmentId}` (shared with client)

The system presents all 3 versions side-by-side showing:
- Scenario name
- Calculation method
- Potential deduction
- Summary of approach

Client or tax agent selects their preferred version.

### 7. Final Report Generation
**Location:** `/admin/analyze/{assessmentId}` → "Generate Final Client Report"

Once a version is selected:

1. **Template Loading:**
   - System fetches the uploaded "HOME BASED, BUSINESS & TAXATION ADVICE" template
   - This is the professional client deliverable format

2. **AI Population:**
   - GPT-4o extracts key data from the selected interim report
   - Template is populated with:
     - Client details
     - Chosen strategy and reasoning
     - Detailed calculations
     - Compliance requirements
     - Action items
   - Professional formatting maintained

3. **Delivery:**
   - Final report saved to Vercel Blob as PDF
   - Downloadable link provided
   - Report ready for client delivery

### 8. Report Delivery to Client
The finalized "HOME BASED, BUSINESS & TAXATION ADVICE" report is provided to the client containing their personalized tax strategy and calculations.

## Key Features

### Multi-Version Analysis
- Up to 3 different scenario versions per assessment
- Varying risk levels and deduction strategies
- Client chooses their preferred approach

### AI-Powered Intelligence
- Document OCR and analysis
- Cross-referencing with authoritative sources
- Strategy optimization based on DYH methodology
- ATO compliance checking

### Template System
- Customizable final report templates
- Professional client-facing documents
- Maintain consistent branding

### Audit Trail
- All actions logged
- Document versioning
- Usage tracking
- Security compliance

## Modification Flexibility
Tax agents can instruct modifications to any aspect:
- AI analysis logic
- Calculation methods
- Report formats
- Workflow steps
- Document types
- Strategy approaches

## Technical Stack
- **Frontend:** Next.js 16, React 19.2, Tailwind CSS v4
- **Backend:** Next.js API Routes, Server Actions
- **Database:** Supabase (PostgreSQL)
- **Storage:** Vercel Blob
- **AI:** Vercel AI SDK v4, OpenAI GPT-4o
- **Auth:** Supabase Auth
- **Deployment:** Vercel
