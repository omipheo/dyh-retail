# Home Business Wealth and Lifestyle Optimiser - Complete System Overview

## Application Purpose

Professional tax practice application for Australian home office tax deduction calculations, combining client questionnaires, document management, AI-powered strategy analysis, and ATO-compliant reporting.

---

## Core Features

### 1. User Authentication & Roles
- **End Users**: Individual taxpayers seeking home office deductions
- **Tax Agents**: Registered professionals managing multiple clients
- Supabase authentication with role-based access control
- MFA support and session management

### 2. Questionnaire System
**Multi-step form collecting:**
- Personal information (name, TFN, address)
- Home office details (size, hours worked, business type)
- Expenses (internet, phone, electricity, cleaning, etc.)
- Employment status and business information

**Calculation Methods:**
- Fixed Rate Method ($0.67/hour)
- Actual Cost Method (percentage-based)
- Automatic comparison and recommendation

### 3. Document Management
**Client Uploads:**
- Photos of home office setup
- Utility bills and receipts
- Floor plans and measurements
- Supporting documentation
- Accepts: PDF, Word, images, videos (up to 100MB)

**Reference Documents (Tax Agent):**
- "Deduct Your Home" book
- ATO Private Binding Rulings (PBRs)
- ATO correspondence
- DYH Strategy Selectors
- Quick Questionnaire templates

**Storage:**
- Vercel Blob for file storage
- Organized by document type and user
- Permanent URLs for access
- Metadata tracked in database

### 4. AI Strategy Analysis
**Automated Process:**
1. Analyzes all client documents with GPT-4
2. Cross-references with DYH book and ATO PBRs
3. Recommends optimal deduction method
4. Performs ATO-compliant calculations
5. Generates professional interim report

**Output:**
- Personalized tax strategy
- Detailed reasoning and eligibility criteria
- Risk factor identification
- Compliance requirements
- Next steps for implementation

### 5. Admin Dashboard (Tax Agents)
- Client management and overview
- Assessment tracking and status
- Usage limits monitoring
- Reference document library
- Security and audit logs
- AI analysis access

### 6. Security & Compliance

**Australian Regulatory Compliance:**
- Australian Privacy Principles (APPs)
- ATO digital security obligations
- Tax Practitioners Board (TPB) requirements
- ASIC cyber resilience standards
- Notifiable Data Breaches (NDB) scheme

**Security Features:**
- Row Level Security (RLS) on all database tables
- TFN encryption (AES-256)
- Client-agent assignment controls
- Session timeout (2 hours for sensitive data)
- Comprehensive audit logging
- MFA support
- IP whitelisting for tax agents
- Data breach incident tracking

**Data Retention:**
- 7-year retention for tax records (ATO requirement)
- Automated archival after retention period
- GDPR-style data export and deletion

### 7. Usage Tracking
- 3 free outputs per end user
- Unlimited access for tax agents
- Tax agent override capabilities
- Usage reset and grant functions

---

## Technology Stack

**Framework:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript

**Database:**
- Supabase (PostgreSQL)
- Row Level Security policies
- Real-time subscriptions

**Storage:**
- Vercel Blob for files
- Blob storage for documents and images

**AI:**
- Vercel AI SDK v5
- OpenAI GPT-4 via AI Gateway
- Document analysis and report generation

**UI:**
- Tailwind CSS v4
- shadcn/ui components
- Radix UI primitives
- Responsive mobile-first design

**Authentication:**
- Supabase Auth
- Email/password with role selection
- MFA support
- Session management with middleware

---

## Database Schema

**Tables:**
1. `profiles` - User accounts and roles
2. `questionnaire_responses` - Assessment data
3. `documents` - Client uploaded files
4. `reference_documents` - Tax agent reference materials
5. `usage_tracking` - Output limits per user
6. `client_agent_relationships` - Assignment mapping
7. `audit_logs` - Security event tracking
8. `consent_records` - APP compliance
9. `data_breach_incidents` - NDB tracking
10. `rate_limit_tracking` - API throttling

**Security:**
- RLS enabled on all tables
- Helper functions bypass RLS safely
- Foreign key constraints
- Indexed for performance

---

## Key User Flows

### End User Flow:
1. Sign up → Select "End User" role
2. Complete questionnaire (5 steps)
3. Upload supporting documents
4. Review calculation results
5. Receive report from tax agent (if using one)

### Tax Agent Flow:
1. Sign up → Select "Tax Agent" role
2. Upload reference documents (DYH, PBRs)
3. Access client assessments
4. Generate AI strategy analysis
5. Review and validate recommendations
6. Deliver report to client

---

## File Structure

\`\`\`
app/
├── auth/                    # Authentication pages
│   ├── login/
│   ├── sign-up/
│   └── error/
├── dashboard/               # Main dashboard
├── questionnaire/           # Assessment forms
│   ├── new/                # New assessment
│   ├── [id]/               # View/edit assessment
│   └── page.tsx            # Assessment list
├── admin/                   # Tax agent features
│   ├── clients/            # Client management
│   ├── assessments/        # All assessments
│   ├── reference-docs/     # Document library
│   │   └── upload/        # Upload interface
│   ├── analyze/           # AI analysis
│   │   └── [id]/          # Analysis page
│   ├── usage/             # Usage monitoring
│   └── security/          # Security dashboard
├── api/                    # API routes
│   ├── documents/         # Document upload/list
│   ├── reference-docs/    # Reference doc management
│   ├── calculate/         # Tax calculations
│   ├── analyze/          # AI strategy generation
│   └── usage/            # Usage tracking
└── privacy/               # Privacy policy

components/
├── ui/                    # shadcn components
├── site-header.tsx        # Navigation
├── questionnaire-form.tsx # Multi-step form
├── document-upload.tsx    # File upload
├── calculator-widget.tsx  # Quick calculator
└── security-dashboard.tsx # Security monitoring

lib/
├── supabase/             # Supabase clients
├── calculator.ts         # Calculation logic
├── document-analyzer.ts  # AI analysis
└── australian-compliance.ts # Compliance checks

scripts/
├── 001_create_tables.sql        # Initial schema
├── 002_profile_trigger.sql      # Auto profile creation
├── 003_usage_functions.sql      # Usage tracking
├── 004_enhanced_security.sql    # Advanced RLS
├── 005_australian_compliance.sql # Compliance tables
├── 006_fix_rls_recursion.sql    # RLS fixes
├── 009_add_reference_docs_columns.sql # Schema updates
└── 010_disable_reference_docs_rls.sql # Upload fixes
\`\`\`

---

## Environment Variables

**Supabase:**
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Vercel Blob:**
- `BLOB_READ_WRITE_TOKEN`

**Database (Auto-configured):**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`

All configured automatically via Vercel integrations.

---

## Deployment

**Platform:** Vercel
**Runtime:** Next.js Next.js (browser-based)
**Region:** Optimized for Australia

**Integrations:**
- Supabase (connected)
- Vercel Blob (connected)
- Vercel AI Gateway (automatic)

---

## Documentation Files

1. `SECURITY_DOCUMENTATION.md` - Complete security protocols
2. `AI_STRATEGY_SYSTEM.md` - AI analysis guide
3. `SYSTEM_OVERVIEW.md` - This file
4. All documents downloadable as HTML/Word

---

## Next Steps for Production

1. **Run SQL Scripts:** Execute all scripts in order in Supabase
2. **Upload Reference Docs:** Add DYH book and ATO materials
3. **Configure Tax Agent:** Promote user account to tax agent
4. **Test Flow:** Complete sample assessment
5. **Generate AI Report:** Test AI analysis on sample data
6. **Client Onboarding:** Invite first clients

---

## Support Resources

**Technical Issues:**
- Vercel support at vercel.com/help
- Supabase docs at supabase.com/docs
- AI SDK docs at sdk.vercel.ai

**Tax Compliance:**
- ATO website for latest guidance
- TPB for professional standards
- ASIC for financial services requirements

---

## Version Control

Upload new versions of reference materials anytime - system maintains all versions with timestamps and organizes by document type for easy access.
