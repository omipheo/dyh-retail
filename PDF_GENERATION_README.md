# PDF Report Generation - Deployment Guide

This guide explains how to deploy the Word template to PDF generation feature on Vercel.

## Overview

The application generates PDF reports by:
1. Merging questionnaire JSON data into a Word template (`.docx`) using `docxtemplater`
2. Converting the populated Word document to PDF
3. Serving the PDF for download

## Libraries Used

- **docxtemplater** (v3.67.6): Merges JSON data into Word template placeholders
- **pizzip** (v3.2.0): Handles Word document ZIP structure
- **docx-pdf** (v0.1.1): Converts DOCX to PDF (requires LibreOffice)

## PDF Conversion Options

The system supports multiple PDF conversion methods:

### Option 1: Local Development (Recommended for Testing)

For local development, install LibreOffice:

**Windows:**
\`\`\`bash
# Download and install from https://www.libreoffice.org/download/
# Ensure LibreOffice is in your PATH
\`\`\`

**macOS:**
\`\`\`bash
brew install --cask libreoffice
\`\`\`

**Linux:**
\`\`\`bash
sudo apt-get update
sudo apt-get install libreoffice
\`\`\`

Then install the npm package:
\`\`\`bash
pnpm install docx-pdf
\`\`\`

### Option 2: CloudConvert API (Recommended for Vercel Production)

For Vercel serverless deployment, use CloudConvert API:

1. Sign up at https://cloudconvert.com/
2. Get your API key from the dashboard
3. Add to your Vercel environment variables:
   \`\`\`
   CLOUDCONVERT_API_KEY=your_api_key_here
   \`\`\`

The system will automatically use CloudConvert if the API key is configured.

### Option 3: Docker Container (Vercel Pro/Enterprise)

For Vercel Pro or Enterprise, you can use Docker containers with LibreOffice:

1. Create a Dockerfile:
\`\`\`dockerfile
FROM node:18-alpine
RUN apk add --no-cache libreoffice
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
\`\`\`

2. Configure Vercel to use Docker containers

## Template File

Place your Word template in:
\`\`\`
public/templates/final_report.docx
\`\`\`

Or use the fallback:
\`\`\`
public/templates/word_corrected.docx
\`\`\`

The system will automatically detect and use `final_report.docx` if it exists.

## Questionnaire Data Mapping

The system maps fields from both questionnaires:

### Quick Questionnaire Fields
- `q1_marital_status` → `MARITAL_STATUS`
- `q2_annual_income` → `TAXABLE_INCOME`
- `q3_partner_income` → `PARTNER_INCOME`
- `q11_home_value` → `PROPERTY_VALUE`
- `q29_loan_interest` → `MORTGAGE_INTEREST`
- `q29_council_rates` → `COUNCIL_RATES`
- `q29_water_rates` → `WATER_RATES`
- And many more...

### Full Questionnaire Fields
- `marital_status` → `MARITAL_STATUS`
- `annual_income` → `TAXABLE_INCOME`
- `partner_income` → `PARTNER_INCOME`
- `home_value` → `PROPERTY_VALUE`
- And more...

All fields are automatically mapped and formatted (currency, dates, etc.).

## API Endpoint

**POST** `/api/generate-report`

**Request Body:**
\`\`\`json
{
  "questionnaire1": {
    "q1_marital_status": "Married",
    "q2_annual_income": "85000",
    ...
  },
  "questionnaire2": {
    "marital_status": "Married",
    "annual_income": "85000",
    ...
  },
  "clientName": "John Doe"
}
\`\`\`

**Response:**
- Success: PDF file (or DOCX if PDF conversion fails)
- Error: JSON with error message

## Deployment Checklist

- [ ] Install dependencies: `pnpm install`
- [ ] Place Word template in `public/templates/final_report.docx`
- [ ] Configure PDF conversion method:
  - [ ] Local: Install LibreOffice
  - [ ] Production: Set `CLOUDCONVERT_API_KEY` in Vercel
  - [ ] Docker: Configure Vercel Docker support
- [ ] Test locally: `pnpm dev`
- [ ] Deploy to Vercel: `vercel deploy`

## Troubleshooting

### PDF Conversion Fails

If PDF conversion fails, the system automatically falls back to DOCX. Check:

1. **Local Development:**
   - LibreOffice is installed and in PATH
   - `docx-pdf` package is installed

2. **Vercel Production:**
   - `CLOUDCONVERT_API_KEY` is set in environment variables
   - API key is valid and has credits

3. **Check Logs:**
   - Server logs will show conversion errors
   - Client console will show download errors

### Template Not Found

- Ensure template is in `public/templates/` directory
- Check file name matches `final_report.docx` or `word_corrected.docx`
- Verify file is committed to repository

### Placeholders Not Filled

- Check questionnaire data structure matches expected format
- Verify placeholders in Word template use `{{PLACEHOLDER_NAME}}` format
- Check server logs for missing placeholder warnings

## Performance

- DOCX generation: ~1-2 seconds
- PDF conversion: ~2-5 seconds (depends on method)
- Total time: < 10 seconds for 40-page document

## Security

- All processing happens server-side
- No user data is stored permanently
- Temporary files are cleaned up after conversion
- API endpoint validates input data

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with sample questionnaire data
4. Check CloudConvert API status if using cloud conversion
