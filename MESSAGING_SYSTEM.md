# Automated Messaging System

## Overview

The Tax Practice App includes an automated messaging system that monitors data quality and sends notifications to tax agents when client data cannot be calculated or requires manual review.

## How It Works

### Automatic Data Validation

When a client submits their questionnaire or the system generates Interim Reports, the following validations occur:

#### 1. Required Fields Validation
- Full Name
- Email Address
- Business Legal Structure
- Home Size (sqm)
- Office Size (sqm)
- Office Hours per Week

**Action:** If any required field is missing, a HIGH priority message is sent to the tax agent.

#### 2. Calculation-Critical Fields
- **Building Value**: Required for 2.5% p.a. depreciation calculation
- **Property Expenses**: Home loan interest, council rates, water rates, building insurance
- **Internet/Phone Business Use**: Must be calculated from 30-day bills, not floor space percentage

**Action:** If missing, a CRITICAL priority message is sent with details of what's needed.

#### 3. Data Consistency Checks
- Office size cannot exceed total home size
- Office size over 50% of home triggers ATO scrutiny warning
- Deductions cannot exceed annual income
- Negative deductions indicate calculation errors

**Action:** Validation failures trigger URGENT priority messages with specific issues listed.

#### 4. Strategy Selector Completion
- All 65 DYH Strategy Selector questions must be answered
- System cannot determine appropriate DYH procedure without these responses

**Action:** If incomplete, a CRITICAL priority message is sent.

#### 5. Document Upload Verification
- Supporting documents are required to verify client claims
- System tracks whether documents have been uploaded

**Action:** If no documents uploaded, a WARNING priority message is sent.

## Message Structure

### Automated System Messages Include:

```
**AUTOMATED SYSTEM ALERT: Manual Review Required**

**Client:** [Client Name] ([Client Email])
**Assessment ID:** [Assessment ID]

**CRITICAL ISSUES (X):**
1. **building_value**: Building value is required for depreciation calculation (2.5% p.a.)
2. **strategy_selector_responses**: DYH Strategy Selector questionnaire not completed

**ERRORS (X):**
1. **email**: Email Address is missing or invalid

**WARNINGS (X):**
1. **internet_business_use_percentage**: Internet business use percentage not provided - client must analyze 30-day bill

**ACTION REQUIRED:**
Please review this assessment manually and contact the client to obtain missing information or clarify discrepancies before proceeding with final report generation.
```

## Message Priorities

- **URGENT**: Critical data errors, logical impossibilities, ATO compliance risks
- **HIGH**: Missing required fields that prevent report generation
- **NORMAL**: Missing optional data that affects calculation accuracy
- **LOW**: General notifications

## User Interface

### For Tax Agents

1. **Messages Inbox** (`/messages`)
   - View all messages with filtering (All/Unread)
   - See message counts: Total, Unread, Read
   - Mark messages as read
   - Reply to messages
   - Download attachments

2. **Message Indicators**
   - Navigation header shows unread message count badge
   - System alerts highlighted in amber
   - Priority badges (Urgent/High/Normal/Low)

3. **Analysis Page Notifications**
   - When validation issues are detected during report generation
   - Amber alert card with link to messages
   - Direct links to contact client or view details

### For Clients

1. **Compose Messages** (`/messages/compose`)
   - Send messages to tax agent
   - Attach files
   - Set priority and type
   - Link to specific assessment

2. **View Responses**
   - See tax agent replies
   - Track conversation history
   - Download requested documents

## Validation Integration Points

### 1. Strategy Generation (`/api/analyze/generate-strategy`)
- Validates all client data variations before processing
- Automatically sends messages for any issues detected
- Returns validation status in response

### 2. Calculation Validation
- Validates calculation results after generation
- Checks for negative values, unrealistic amounts
- Compares against income thresholds

### 3. Document Analysis
- Verifies documents are uploaded
- Checks document types and completeness
- Alerts if critical documents missing

## Database Schema

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES client_assessments(id),
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

## Message Types

- `system_alert`: Automated validation alerts
- `client_query`: Questions from clients
- `tax_agent_response`: Replies from tax agents
- `general`: Other communications

## Benefits

1. **Proactive Issue Detection**: Problems identified before report generation
2. **Clear Communication**: Detailed explanations of what's missing and why
3. **Audit Trail**: All communications logged and timestamped
4. **Client Guidance**: Specific instructions on what data to provide
5. **Compliance Protection**: Prevents incomplete reports that could trigger ATO scrutiny

## Future Enhancements

- Email notifications for urgent messages
- SMS alerts for critical issues
- Client portal for real-time updates
- Automated follow-up reminders
- Message templates for common issues
