interface ReportData {
  CLIENT_NAME: string
  CLIENT_ADDRESS: string
  CLIENT_ABN: string
  CLIENT_BUSINESS_NAME: string
  CLIENT_BUSINESS_TYPE: string
  CLIENT_BUSINESS_START_DATE: string
  REPORT_DATE: string
  TOTAL_FLOOR_AREA_M2: number
  TOTAL_BUSINESS_USE_AREA_M2: number
  BUSINESS_USE_PERCENTAGE: number
  DEDICATED_OFFICE_AREA_M2: number
  DEDICATED_MEETING_AREA_M2: number
  DEDICATED_ARCHIVE_AREA_M2: number
  TOTAL_WEEKLY_HOURS_WORKED: number
  TOTAL_NUMBER_OF_WEEKS_WORKED: number
  TOTAL_NUMBER_OF_HOURS_WORKED: number
  MORTGAGE: number
  RATES: number
  INSURANCE: number
  REPAIRS: number
  DEPRECIATION: number
  WATER: number
  SECURITY: number
  CLEANING: number
  ELECTRICITY: number
  GAS: number
  TOTAL_PROPERTY_EXPENSES: number
  TOTAL_RUNNING_EXPENSES: number
  MORTGAGE_DEDUCTIBLE: number
  RATES_DEDUCTIBLE: number
  INSURANCE_DEDUCTIBLE: number
  REPAIRS_DEDUCTIBLE: number
  DEPRECIATION_DEDUCTIBLE: number
  WATER_DEDUCTIBLE: number
  SECURITY_DEDUCTIBLE: number
  CLEANING_DEDUCTIBLE: number
  ELECTRICITY_DEDUCTIBLE: number
  GAS_DEDUCTIBLE: number
  TOTAL_PROPERTY_DEDUCTIBLE: number
  TOTAL_RUNNING_COSTS_DEDUCTIBLE: number
  TOTAL_FIXED_RATE_METHOD_CLAIM: number
  RECOMMENDED_METHOD: string
  RECOMMENDATION_TEXT: string
  marginalTaxRate: number
  opportunities?: {
    name: string
    potentialValue: number
    afterTaxCost: number
    netBenefit: number
  }[]
  STRATEGY_NAME?: string
  STRATEGY?: string
  STRATEGY_DESCRIPTION?: string
}

export function ComprehensiveReport({ data }: { data: ReportData }) {
  return (
    <div className="bg-white text-black">
      {/* Cover Page */}
      <section className="page-break h-screen flex flex-col justify-between p-12">
        <div>
          <div className="text-blue-600 font-bold text-2xl mb-8">INTELLISOLVE</div>
          <div className="text-sm text-gray-600 mb-12">
            <div className="font-bold mb-2">BUSINESS, COMPLIANCE & TAXATION ADVISERS</div>
            <div>NTAA & BAS Agent Registration No: 94567 - ATO Registered Agent</div>
            <div>Address: Suite Level 1, 48 Doggett Street, Newstead, Qld 4006</div>
            <div>ABN: 55 976 863 - admin@intellisolve.com.au - www.intellisolve.com.au</div>
            <div>Liability limited by a scheme approved under Professional Standards Legislation</div>
          </div>
        </div>

        <div className="text-center my-auto">
          <h1 className="text-4xl font-bold mb-8">HOME BASED</h1>
          <h2 className="text-3xl font-bold mb-4">BUSINESS & TAXATION ADVICE</h2>
          <div className="text-xl mt-12">For the exclusive use of:</div>
          <div className="text-2xl font-bold mt-4 mb-2">{data.CLIENT_NAME}</div>
          <div className="text-xl">{data.CLIENT_BUSINESS_NAME}</div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <div>Strictly Confidential</div>
          <div className="mt-2">{data.REPORT_DATE}</div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">INDEX</h2>
        <div className="space-y-2 max-w-2xl mx-auto">
          <div className="flex justify-between border-b pb-2">
            <span>INTERPRETATION, LINKS & WORDING</span>
            <span>2</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>WARNING</span>
            <span>2</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>SCOPE & PARTICULARS</span>
            <span>3</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>PREAMBLE</span>
            <span>4</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>OUR METHODOLOGY</span>
            <span>5</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>YOUR ENTITLEMENTS</span>
            <span>6</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>DEDUCTION SUMMARY & BREAKDOWN</span>
            <span>8</span>
          </div>
          {/* Updated title */}
          <div className="flex justify-between border-b pb-2">
            <span>PROPERTY & RUNNING EXPENSES</span>
            <span>9</span>
          </div>
          {/* Added new section */}
          <div className="flex justify-between border-b pb-2">
            <span>BUSINESS USE PERCENTAGE CALCULATION</span>
            <span>11</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>SHORTCOMINGS OF WORKING FROM HOME APPLICATION</span>
            <span>15</span>
          </div>
          {/* Updated title */}
          <div className="flex justify-between border-b pb-2">
            <span>OPPORTUNITIES PER THE RUNNING COST METHOD</span>
            <span>17</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>FREQUENCY ASKED QUESTIONS</span>
            <span>18</span>
          </div>
          {/* Updated title */}
          <div className="flex justify-between border-b pb-2">
            <span>APPENDIX A - HOME BUSINESS, HOME OCCUPATION</span>
            <span>31</span>
          </div>
          {/* Added new appendix entry */}
          <div className="flex justify-between border-b pb-2">
            <span>APPENDIX B - PROPERTY & DRAWING ZONING (LOCAL)</span>
            <span>35</span>
          </div>
          {/* Added new appendix entry */}
          <div className="flex justify-between border-b pb-2">
            <span>APPENDIX C - AUTHORITY TO COLLECT THE ADVICE</span>
            <span>38</span>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE REFERENCE INDEX */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-8">COMPREHENSIVE REFERENCE INDEX</h2>
        <div className="space-y-1 text-xs max-w-4xl">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR001 - Business structure types</span>
              <span>5</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR002 - Sole trader advantages/disadvantages</span>
              <span>5</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR003 - Partnership considerations</span>
              <span>6</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR004 - Company structure benefits</span>
              <span>6</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR005 - Trust structures overview</span>
              <span>7</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR006 - GST registration requirements</span>
              <span>7</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR007 - ABN application process</span>
              <span>8</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR008 - Record keeping obligations</span>
              <span>8</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR009 - Deduction substantiation rules</span>
              <span>9</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR010 - Actual cost method explained</span>
              <span>9</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR011 - Fixed rate method explained</span>
              <span>10</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR012 - Shortcut method (52c/67c per hour)</span>
              <span>10</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR013 - Occupancy expense definition</span>
              <span>11</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR014 - Running expense definition</span>
              <span>11</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR015 - Depreciation calculation methods</span>
              <span>12</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR016 - Effective life of assets</span>
              <span>12</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR017 - Instant asset write-off thresholds</span>
              <span>13</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR018 - Capital vs revenue expenses</span>
              <span>13</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR019 - CGT main residence exemption</span>
              <span>14</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR020 - Place of business vs business use</span>
              <span>14</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR021 - Floor area calculation methodology</span>
              <span>15</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR022 - Business use percentage determination</span>
              <span>15</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR023 - Exclusive vs non-exclusive use</span>
              <span>16</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR024 - Private vs business apportionment</span>
              <span>16</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR025 - Mortgage interest deductibility</span>
              <span>17</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR026 - Council rates apportionment</span>
              <span>17</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR027 - Home & contents insurance claims</span>
              <span>18</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR028 - Repairs & maintenance distinction</span>
              <span>18</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR029 - Water usage apportionment</span>
              <span>19</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR030 - Electricity usage calculations</span>
              <span>19</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR031 - Gas usage apportionment</span>
              <span>20</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR032 - Internet & phone expense rules</span>
              <span>20</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR033 - Cleaning expense deductibility</span>
              <span>21</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR034 - Security system claims</span>
              <span>21</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR035 - Equipment & furniture depreciation</span>
              <span>22</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR036 - Computer & technology deductions</span>
              <span>22</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR037 - Superannuation obligations</span>
              <span>23</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR038 - PAYG instalment requirements</span>
              <span>23</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR039 - BAS lodgment deadlines</span>
              <span>24</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR040 - Income tax return deadlines</span>
              <span>24</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR041 - ATO audit triggers & compliance</span>
              <span>25</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR042 - Penalty provisions & safe harbours</span>
              <span>25</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>TG-BR043 - Professional advice requirements</span>
              <span>26</span>
            </div>
          </div>
        </div>
      </section>

      {/* Replacing invented Interpretation content with proper structured sections matching template */}
      {/* Interpretation Section */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">INTERPRETATION</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          {/* Updated content */}
          <p>
            This report has been prepared exclusively for {data.CLIENT_NAME} trading as {data.CLIENT_BUSINESS_NAME}.
          </p>
          <p>
            This document contains advice specific to your individual circumstances as disclosed in your questionnaire
            and during our consultations.
          </p>

          {/* Updated content */}
          <h3 className="font-bold mt-6">LINKS</h3>
          <p>
            This document contains hyperlinks to external websites including the Australian Taxation Office (ATO). We
            recommend reviewing these resources for additional context.
          </p>
          <p>
            Please note that information on external websites may change after the date of this report. While we strive
            to provide current information, tax law and ATO guidance evolve regularly.
          </p>

          {/* Updated content */}
          <h3 className="font-bold mt-6">WORDING</h3>
          <p>
            Throughout this document, references to "the Client" mean {data.CLIENT_NAME}. References to "the Property"
            mean the premises located at {data.CLIENT_ADDRESS}.
          </p>
        </div>
      </section>

      {/* Warning Section */}
      <section className="page-break p-12 bg-yellow-50">
        <h2 className="text-2xl font-bold mb-6 text-red-600">WARNING</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          {/* Updated content */}
          <p className="font-bold text-red-700">
            IMPORTANT: This advice is based on information you have provided. You must maintain adequate records to
            substantiate all claims made in your tax return.
          </p>
          <p>
            Before claiming any deduction, you must ensure you keep appropriate records including receipts, invoices,
            diary records, floor plans, and calculations demonstrating how you arrived at your claim.
          </p>
          <p className="font-bold">Required Records Include:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Receipts and invoices for all expenses claimed</li>
            <li>Floor plan showing business use areas and measurements</li>
            <li>Diary or timesheet showing hours worked from home</li>
            <li>Loan statements and mortgage documents</li>
            <li>Utility bills and payment records</li>
            <li>Calculations showing how business percentages were determined</li>
          </ul>
          {/* Updated content */}
          <p className="mt-4 font-bold">
            Records must be kept for 5 years from the date you lodge your tax return. Failure to maintain adequate
            records may result in claims being disallowed by the ATO.
          </p>
        </div>
      </section>

      {/* Preamble Section */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">PREAMBLE</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          {/* Updated title and content */}
          <h3 className="font-bold">CLIENT PARTICULARS</h3>
          <div className="border-2 border-gray-300 p-6 my-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-gray-600">Client Name:</div>
                <div className="text-lg">{data.CLIENT_NAME}</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">Business Name:</div>
                <div className="text-lg">{data.CLIENT_BUSINESS_NAME}</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">ABN:</div>
                <div>{data.CLIENT_ABN}</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">Business Type:</div>
                <div>{data.CLIENT_BUSINESS_TYPE}</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">Property Address:</div>
                <div>{data.CLIENT_ADDRESS}</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">Business Start Date:</div>
                <div>{data.CLIENT_BUSINESS_START_DATE}</div>
              </div>
            </div>
          </div>

          {/* Updated title and content */}
          <h3 className="font-bold mt-6">SCOPE OF THIS ADVICE</h3>
          <p>
            This report provides comprehensive tax advice regarding the deductibility of expenses related to using your
            home for business purposes. It includes:
          </p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Analysis of your business use percentage</li>
            <li>Calculation of deductible expenses under different methods</li>
            <li>Comparison of actual cost method vs fixed rate method</li>
            <li>Recommendations for optimal tax position</li>
            <li>Capital gains tax considerations</li>
            <li>Record-keeping requirements</li>
            <li>Implementation guidance</li>
          </ul>

          <p className="mt-4">
            Please review this document carefully. If any information is incorrect or if you have questions about any
            recommendations, contact us immediately before implementing any strategies outlined herein.
          </p>
        </div>
      </section>

      {/* Scope & Property Particulars */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">SCOPE:</h2>
        <div className="space-y-6">
          <p className="text-sm leading-relaxed">
            In this our Property Assessment and audit advice re suitability of The Property and usage in a Home Business
            Package is presented to increase available run charge of Expenses and associated entity ownership.
          </p>

          <div className="border-2 border-gray-300 p-6 my-6">
            <h3 className="font-bold text-lg mb-4">Property Overview (Actual)</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="border-b">
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Square/Deductible</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Dedicated Office</td>
                  <td className="text-right p-2">{data.DEDICATED_OFFICE_AREA_M2}m²</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Dedicated Meeting Room</td>
                  <td className="text-right p-2">{data.DEDICATED_MEETING_AREA_M2}m²</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Dedicated Archive/Storage</td>
                  <td className="text-right p-2">{data.DEDICATED_ARCHIVE_AREA_M2}m²</td>
                </tr>
                <tr className="border-b font-bold">
                  <td className="p-2">Total Business Use Area</td>
                  <td className="text-right p-2">{data.TOTAL_BUSINESS_USE_AREA_M2}m²</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Total Property Floor Area</td>
                  <td className="text-right p-2">{data.TOTAL_FLOOR_AREA_M2}m²</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className="p-2">Business Use Percentage (BUP)</td>
                  <td className="text-right p-2">{data.BUSINESS_USE_PERCENTAGE}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-2 border-gray-300 p-6 my-6">
            <h3 className="font-bold text-lg mb-4">Working Hours (Annual)</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Weekly Hours:</td>
                  <td className="text-right p-2">{data.TOTAL_WEEKLY_HOURS_WORKED}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Number of Weeks:</td>
                  <td className="text-right p-2">{data.TOTAL_NUMBER_OF_WEEKS_WORKED}</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className="p-2">Total Annual Hours:</td>
                  <td className="text-right p-2">{data.TOTAL_NUMBER_OF_HOURS_WORKED}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Property Expenses Section */}
      {/* Replaced with new section */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">PROPERTY & RUNNING EXPENSES</h2>

        <h3 className="font-bold text-lg mb-4">1. PROPERTY EXPENSES (OCCUPANCY)</h3>
        <div className="border-2 border-gray-300 p-6 mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="border-b">
                <th className="text-left p-2">Expense Type</th>
                <th className="text-right p-2">Annual Amount</th>
                <th className="text-right p-2">Deductible @ {data.BUSINESS_USE_PERCENTAGE}%</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Mortgage Interest</td>
                <td className="text-right p-2">${data.MORTGAGE.toLocaleString()}</td>
                <td className="text-right p-2">${data.MORTGAGE_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Council Rates</td>
                <td className="text-right p-2">${data.RATES.toLocaleString()}</td>
                <td className="text-right p-2">${data.RATES_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Insurance</td>
                <td className="text-right p-2">${data.INSURANCE.toLocaleString()}</td>
                <td className="text-right p-2">${data.INSURANCE_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Repairs & Maintenance</td>
                <td className="text-right p-2">${data.REPAIRS.toLocaleString()}</td>
                <td className="text-right p-2">${data.REPAIRS_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Depreciation</td>
                <td className="text-right p-2">${data.DEPRECIATION.toLocaleString()}</td>
                <td className="text-right p-2">${data.DEPRECIATION_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Water</td>
                <td className="text-right p-2">${data.WATER.toLocaleString()}</td>
                <td className="text-right p-2">${data.WATER_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Security</td>
                <td className="text-right p-2">${data.SECURITY.toLocaleString()}</td>
                <td className="text-right p-2">${data.SECURITY_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="bg-blue-50 font-bold border-t-2">
                <td className="p-2">TOTAL PROPERTY EXPENSES</td>
                <td className="text-right p-2">${data.TOTAL_PROPERTY_EXPENSES.toLocaleString()}</td>
                <td className="text-right p-2">${data.TOTAL_PROPERTY_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold text-lg mb-4">2. RUNNING EXPENSES</h3>
        <div className="border-2 border-gray-300 p-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="border-b">
                <th className="text-left p-2">Expense Type</th>
                <th className="text-right p-2">Annual Amount</th>
                <th className="text-right p-2">Deductible @ {data.BUSINESS_USE_PERCENTAGE}%</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Electricity</td>
                <td className="text-right p-2">${data.ELECTRICITY.toLocaleString()}</td>
                <td className="text-right p-2">${data.ELECTRICITY_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Gas</td>
                <td className="text-right p-2">${data.GAS.toLocaleString()}</td>
                <td className="text-right p-2">${data.GAS_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Cleaning</td>
                <td className="text-right p-2">${data.CLEANING.toLocaleString()}</td>
                <td className="text-right p-2">${data.CLEANING_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
              <tr className="bg-blue-50 font-bold border-t-2">
                <td className="p-2">TOTAL RUNNING EXPENSES</td>
                <td className="text-right p-2">${data.TOTAL_RUNNING_EXPENSES.toLocaleString()}</td>
                <td className="text-right p-2">${data.TOTAL_RUNNING_COSTS_DEDUCTIBLE.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-green-50 border-2 border-green-300">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">TOTAL CLAIM PER THE RUNNING COST METHOD:</span>
            <span className="text-2xl font-bold text-green-700">
              ${(data.TOTAL_PROPERTY_DEDUCTIBLE + data.TOTAL_RUNNING_COSTS_DEDUCTIBLE).toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* Running Expenses Section */}
      {/* This section is now integrated into the "PROPERTY & RUNNING EXPENSES" section above */}

      {/* Method Comparison Section */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">3. DEDUCTION METHOD COMPARISON</h2>
        <div className="space-y-6">
          <div className="border-2 border-blue-200 bg-blue-50 p-6">
            <h3 className="font-bold text-lg mb-4">Actual Cost Method (Recommended)</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Total Property Expenses Deductible:</span>
                <span className="font-bold">${data.TOTAL_PROPERTY_DEDUCTIBLE.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Running Costs Deductible:</span>
                <span className="font-bold">${data.TOTAL_RUNNING_COSTS_DEDUCTIBLE.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg pt-4 border-t-2 border-blue-300">
                <span className="font-bold">TOTAL ANNUAL DEDUCTION:</span>
                <span className="font-bold">
                  ${(data.TOTAL_PROPERTY_DEDUCTIBLE + data.TOTAL_RUNNING_COSTS_DEDUCTIBLE).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-300 p-6">
            <h3 className="font-bold text-lg mb-4">Fixed Rate Method (Alternative)</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Hours worked per year:</span>
                <span>{data.TOTAL_NUMBER_OF_HOURS_WORKED}</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per hour:</span>
                <span>$0.67</span>
              </div>
              <div className="flex justify-between text-lg pt-4 border-t-2 border-gray-300">
                <span className="font-bold">TOTAL ANNUAL DEDUCTION:</span>
                <span className="font-bold">${data.TOTAL_FIXED_RATE_METHOD_CLAIM.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Replaced with new section */}
          <div className="bg-green-50 border-2 border-green-300 p-6">
            <h3 className="font-bold text-lg mb-4">OUR RECOMMENDATION</h3>
            <p className="text-sm leading-relaxed mb-4">{data.RECOMMENDATION_TEXT}</p>
            <div className="text-lg font-bold text-green-800">Recommended Method: {data.RECOMMENDED_METHOD}</div>
          </div>
        </div>
      </section>

      {/* Added new section matching template */}
      {/* Business Use Percentage Calculation Section */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">BUSINESS USE PERCENTAGE CALCULATION</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            The business use percentage is crucial for determining the deductible portion of your home expenses. It is
            calculated based on the area of your home used exclusively for business purposes compared to the total floor
            area.
          </p>

          <div className="border-2 border-gray-300 p-6 my-6">
            <h3 className="font-bold text-lg mb-4">Area Calculations</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="border-b">
                  <th className="text-left p-2">Area Description</th>
                  <th className="text-right p-2">Area (m²)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Dedicated Office Area</td>
                  <td className="text-right p-2">{data.DEDICATED_OFFICE_AREA_M2}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Dedicated Meeting Room</td>
                  <td className="text-right p-2">{data.DEDICATED_MEETING_AREA_M2}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Dedicated Archive/Storage</td>
                  <td className="text-right p-2">{data.DEDICATED_ARCHIVE_AREA_M2}</td>
                </tr>
                <tr className="border-b font-bold bg-blue-50">
                  <td className="p-2">Total Business Use Area</td>
                  <td className="text-right p-2">{data.TOTAL_BUSINESS_USE_AREA_M2}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Total Property Floor Area (excluding garage, unfinished areas)</td>
                  <td className="text-right p-2">{data.TOTAL_FLOOR_AREA_M2}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-green-50 border-2 border-green-300 my-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">CALCULATED BUSINESS USE PERCENTAGE:</span>
              <span className="text-2xl font-bold text-green-700">{data.BUSINESS_USE_PERCENTAGE}%</span>
            </div>
          </div>

          <h3 className="font-bold mt-6">Important Considerations:</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>The "Business Use Area" must be used exclusively for business purposes and be clearly identifiable.</li>
            <li>
              The "Total Property Floor Area" should exclude areas not typically considered living or usable space
              (e.g., garages, balconies, unfinished basements).
            </li>
            <li>It is recommended to keep a floor plan with accurate measurements as part of your record-keeping.</li>
          </ul>
        </div>
      </section>

      {/* FAQ Section - Extensive */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6 text-center">FREQUENTLY ASKED QUESTIONS</h2>

        <div className="space-y-8 text-sm">
          {/* FAQ 1 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">
              1. What does following advice and service are the associated cost?
            </h3>
            <p className="leading-relaxed text-gray-700">
              With regard to what we have covered/discussed at a safe online and hat you choose to buy-in or pay us to
              perform for you, we collectively and they ship separately charged for work as done. As they ship
              separately and they ship separately as of expenses charges. We wish to give everyone an option to choose
              how much they wish to spend with Intellisolve and how much they do themselves or otherwise engage the
              services of others. We will advise you on the best method associated to a thorough and responsive service.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">2. What about following and service and the associated cost?</h3>
            <p className="leading-relaxed text-gray-700">
              While we provide the upfront costs and Our hourly rates are typically kept confidential to Our or the
              Client based on the scope and complexity of work, we are transparent about the steps required and are
              always available to answer questions. On top of the preparation and Your other services of expenses
              changes. We well, in practical terms recommend the option of the service that works or may best suit you
              and your individual needs and circumstances, however other options are available to select should you wish
              to engage us.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">3. Dees it matter how I structure my business?</h3>
            <p className="leading-relaxed text-gray-700">
              Changes or addition to your sphere home. As you prefer to say, We are holders on we have to follow and Our
              recommendations are to suggest what options are available and which are not. The critical decision to
              elect a correct structure is central to the tax and financial planning of the business. The appropriate
              structure will commonly vary over time as well depending on turnover, profitability and compliance costs.
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">
              4. What is a realistic indication for expecting an income return or refund?
            </h3>
            <p className="leading-relaxed text-gray-700">
              You would expect this to be dependent on several factors including the size of your deductions, PAYG
              instalments and any credits applied during the financial year. After your structure. You should expect the
              preparing it will time available to completely examine tax return from July to mid-october with the ATO
              taking up to 2 weeks to process your return, however during busy periods this can extend to six weeks.
            </p>
          </div>

          {/* FAQ 5 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">
              5. If I conduct my business from home, can I claim a deduction?
            </h3>
            <p className="leading-relaxed text-gray-700">
              If you conduct business from a place of residence you can deduct the full cost of the proportion of
              expenses that relate to your income producing use. You can only claim deductions for the area and time you
              use for business purposes.
            </p>
          </div>

          {/* FAQ 6 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">6. Can I claim phone, internet and mobile costs?</h3>
            <p className="leading-relaxed text-gray-700">
              You can claim a deduction for the business-related portion of phone, internet and mobile costs. The ATO
              expects you to maintain records showing how you calculated your claim and to be able to demonstrate the
              percentage used for business purposes.
            </p>
          </div>

          {/* FAQ 7 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">7. What is occupancy expense and what can I claim?</h3>
            <p className="leading-relaxed text-gray-700">
              Occupancy expenses are costs associated with owning or renting your home. These include mortgage interest
              (or rent), council rates, land tax, house insurance and more. If you use part of your home exclusively for
              business purposes and it is clearly identifiable as a place of business, you can claim the business
              portion of these expenses.
            </p>
          </div>

          {/* FAQ 8 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">8. What records do I need to keep?</h3>
            <p className="leading-relaxed text-gray-700">
              You must keep records that show how you calculated your deduction. This includes receipts for all
              expenses, diary records for time spent in business areas, floor plans showing business use areas, and
              calculations demonstrating how you arrived at the business percentage. Records must be kept for five years
              from the date you lodge your tax return.
            </p>
          </div>

          {/* FAQ 9 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">9. Will claiming home office expenses trigger a CGT liability?</h3>
            <p className="leading-relaxed text-gray-700">
              Generally no. The main residence exemption from Capital Gains Tax (CGT) still applies even if you use part
              of your home for business purposes, provided the area is not a place of business separately identifiable
              from your home and the area is not used exclusively for business. However, if you conduct a business where
              clients regularly visit, or if the space is structurally adapted for business use, part of your main
              residence exemption may be lost.
            </p>
          </div>

          {/* FAQ 10 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">10. Can I claim depreciation on furniture and fittings?</h3>
            <p className="leading-relaxed text-gray-700">
              Yes, you can claim depreciation on furniture, fittings, and equipment used for business purposes. This
              includes desks, chairs, computers, printers, and other office equipment. The depreciation deduction
              depends on the cost of the item and its effective life as determined by the ATO.
            </p>
          </div>
        </div>
      </section>

      {/* Additional FAQ Pages */}
      <section className="page-break p-12">
        <h2 className="text-xl font-bold mb-6">FREQUENTLY ASKED QUESTIONS (Continued)</h2>

        <div className="space-y-8 text-sm">
          {/* FAQ 11-20 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">
              11. What is the difference between 'place of business' and 'business use of home'?
            </h3>
            <p className="leading-relaxed text-gray-700">
              A 'place of business' is an area set aside exclusively for business and clearly identifiable as a place of
              business. A 'business use of home' refers to using part of your home for business without it being
              exclusively set aside. The distinction affects what expenses you can claim and potential CGT implications.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">12. Can I use the fixed rate method and claim other expenses?</h3>
            <p className="leading-relaxed text-gray-700">
              If you use the fixed rate method ($0.67 per hour), you cannot also claim separate deductions for running
              expenses like electricity, gas, and cleaning. However, you can still claim depreciation on equipment and
              furniture as a separate deduction.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">13. How do I calculate floor area for business use percentage?</h3>
            <p className="leading-relaxed text-gray-700">
              Measure the area used exclusively for business (in square metres) and divide by the total floor area of
              your home (excluding garages and unfinished areas). This gives you the business use percentage to apply to
              occupancy expenses. You should keep a floor plan with measurements as evidence.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">14. What if I only use my home office occasionally?</h3>
            <p className="leading-relaxed text-gray-700">
              If the area is not used exclusively for business, you can only claim running costs for the hours actually
              worked, not occupancy expenses. You would calculate hours worked multiplied by the running costs per hour
              to determine your deduction.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">15. Can I claim interest on a home loan?</h3>
            <p className="leading-relaxed text-gray-700">
              You can claim the business portion of interest on a loan used to purchase, construct, or renovate your
              home if part of it is used as a place of business. The amount you can claim is limited to the business use
              percentage of the interest paid.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">16. Are there simpler record keeping alternatives?</h3>
            <p className="leading-relaxed text-gray-700">
              The ATO's shortcut method (52 cents per hour for periods before 2022-23, 67 cents per hour from 2022-23)
              provides a simplified approach with minimal record keeping. You only need to keep a record of the hours
              worked from home. However, this method typically results in a lower deduction than the actual cost method.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">17. What expenses can't be claimed?</h3>
            <p className="leading-relaxed text-gray-700">
              You cannot claim expenses of a private nature such as mortgage principal repayments, costs related to the
              initial purchase of property, and expenses that are capital in nature. Additionally, you can't claim
              expenses for areas used exclusively for private purposes.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">18. Do I need a separate meter for utilities?</h3>
            <p className="leading-relaxed text-gray-700">
              No, you don't need separate meters for electricity, gas, or water. You can apportion the costs based on
              floor area and usage patterns. However, having separate meters can make it easier to substantiate your
              claim if the business use is significant.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">19. What if my circumstances change during the year?</h3>
            <p className="leading-relaxed text-gray-700">
              If your work from home arrangements change (e.g., hours worked, area used), you need to keep separate
              records for each period and calculate deductions accordingly. You can use different methods for different
              periods if your circumstances warrant it.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">20. Can I claim home office expenses if I'm an employee?</h3>
            <p className="leading-relaxed text-gray-700">
              Employees can claim home office expenses if they work from home and the expenses are directly related to
              earning their employment income. However, you can't claim occupancy expenses (mortgage interest, rent,
              rates) unless your home is a place of business. Most employees are limited to claiming running expenses
              only.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Part 3 */}
      <section className="page-break p-12">
        <h2 className="text-xl font-bold mb-6">FREQUENTLY ASKED QUESTIONS (Continued - Part 3)</h2>

        <div className="space-y-8 text-sm">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">21. What is the 'Income Deductibility Test'?</h3>
            <p className="leading-relaxed text-gray-700">
              The income deductibility test requires that an expense must be incurred in gaining or producing your
              assessable income, or necessarily incurred in carrying on a business for the purpose of gaining or
              producing assessable income. The expense must have a sufficient connection to your income-earning
              activities.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">22. Can I claim land tax?</h3>
            <p className="leading-relaxed text-gray-700">
              Yes, if you use part of your home as a place of business, you can claim the business proportion of land
              tax. However, like other occupancy expenses, this can only be claimed if the area is set aside exclusively
              for business use and is clearly identifiable as a place of business.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">23. What's the difference between repairs and improvements?</h3>
            <p className="leading-relaxed text-gray-700">
              Repairs restore something to its original condition and are immediately deductible. Improvements enhance
              or add value beyond the original condition and are capital in nature, typically claimed through
              depreciation. For example, repainting a room is a repair, while adding a new room is an improvement.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">24. Can I claim for renovations?</h3>
            <p className="leading-relaxed text-gray-700">
              Renovations are generally capital improvements and cannot be immediately deducted. However, if the
              renovations are specifically for the business area and create depreciable assets, you may be able to claim
              depreciation on the improvement over time.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">25. What if I rent rather than own my home?</h3>
            <p className="leading-relaxed text-gray-700">
              If you rent your home and use part of it as a place of business, you can claim the business proportion of
              rent as a deduction. The same floor area calculation applies. You should also check your lease agreement
              to ensure running a business from the premises is permitted.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">
              26. Do I need permission from my landlord to claim home office expenses?
            </h3>
            <p className="leading-relaxed text-gray-700">
              While you don't need landlord permission to claim home office expenses for tax purposes, your lease
              agreement may restrict business use of the premises. Running a business in breach of your lease could
              result in termination of your tenancy, so always check your lease terms first.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">27. Can I claim a deduction for childcare?</h3>
            <p className="leading-relaxed text-gray-700">
              No, childcare expenses are generally private in nature and not deductible, even if the childcare enables
              you to work. However, if you employ someone to care for your children and that person also performs
              business duties (such as reception or administration), a portion may be deductible.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">28. What about meals and entertainment?</h3>
            <p className="leading-relaxed text-gray-700">
              Meals consumed while working from home are generally not deductible as they are private expenses. However,
              if you provide meals to clients or employees in the course of business, these may be deductible (subject
              to FBT implications if provided to employees).
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">29. Can I claim coffee and tea for clients?</h3>
            <p className="leading-relaxed text-gray-700">
              Yes, reasonable costs of providing refreshments to clients during business meetings are generally
              deductible. However, the cost of your own coffee and tea for personal consumption is not deductible, even
              if consumed while working.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">30. What substantiation do I need for small expenses?</h3>
            <p className="leading-relaxed text-gray-700">
              For individual expenses under $10, you don't need a receipt but must record the details in your accounts.
              For expenses between $10 and $82.50, you generally need a receipt. For expenses over $82.50, a tax invoice
              is required. Different rules apply for certain expense types like motor vehicle and travel expenses.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">31. Can I claim gym membership?</h3>
            <p className="leading-relaxed text-gray-700">
              Generally no, unless you are in a profession where physical fitness is essential (such as personal
              trainer, athlete, or fitness instructor). For most businesses, gym memberships are considered private
              expenses and are not deductible.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">32. What about professional development and courses?</h3>
            <p className="leading-relaxed text-gray-700">
              You can claim deductions for work-related self-education expenses if the course has a sufficient
              connection to your current employment or business. The course must maintain or improve skills required in
              your current role. Courses that enable you to get a new job or start a new business are generally not
              deductible.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">33. Can I claim subscriptions and memberships?</h3>
            <p className="leading-relaxed text-gray-700">
              Yes, if they relate to your business. Professional association memberships, trade journals, industry
              publications, and software subscriptions used for business purposes are generally deductible. Personal
              magazines, streaming services, and social club memberships are not deductible.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">34. What if I have a home loan with an offset account?</h3>
            <p className="leading-relaxed text-gray-700">
              If you have money in an offset account, this reduces the interest charged on your home loan. You can only
              claim a deduction for the interest actually paid (after the offset reduction), apportioned to the business
              use percentage. The interest saved through the offset is effectively tax-free.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">35. Can I refinance and still claim the interest?</h3>
            <p className="leading-relaxed text-gray-700">
              Yes, you can continue to claim interest after refinancing, provided the loan is still secured against your
              home and you continue to use part of it for business. However, if you increase the loan amount for private
              purposes, the additional interest on the increased portion is not deductible.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">36. What happens if I sell my home?</h3>
            <p className="leading-relaxed text-gray-700">
              If you've claimed home office expenses for a place of business (occupancy expenses), you may partially
              lose your main residence CGT exemption for that period. The capital gain on the business portion may be
              assessable. However, if you only claimed running costs, the main residence exemption generally remains
              fully available.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">
              37. Can I claim home office expenses if I also have business premises?
            </h3>
            <p className="leading-relaxed text-gray-700">
              Yes, you can claim home office expenses even if you also rent or own separate business premises, provided
              the home office is genuinely used for business purposes. You'll need to demonstrate that both locations
              are necessary for your business operations and maintain appropriate records for both.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">38. What if multiple people work from the same home office?</h3>
            <p className="leading-relaxed text-gray-700">
              If multiple people (such as spouses or business partners) work from the same home office, each person can
              claim their proportionate share of the expenses. However, the total claims cannot exceed 100% of the
              actual expenses incurred. You'll need to apportion the expenses reasonably between the users.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">39. Can I claim for a home office used by my employees?</h3>
            <p className="leading-relaxed text-gray-700">
              If your employees work from your home, you can generally claim the business portion of home office
              expenses. However, be aware of potential Fringe Benefits Tax (FBT) implications if employees are working
              from your home for their own convenience rather than business necessity.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-base mb-2">40. Where can I get more information?</h3>
            <p className="leading-relaxed text-gray-700">
              For the most current information, visit the ATO website at www.ato.gov.au or contact our office for
              personalized advice. The ATO also provides decision tools and calculators to help you determine the best
              claiming method for your circumstances. Always consult with a registered tax agent before making
              significant tax decisions.
            </p>
          </div>
        </div>
      </section>

      {/* ATO Compliance & Methodology Section */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">OUR METHODOLOGY & ATO COMPLIANCE</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <h3 className="font-bold text-lg">Business Use of Home - Legislative Framework</h3>

          <p>
            The Australian Taxation Office (ATO) provides specific guidance on claiming expenses for business use of
            your home. The key legislation and rulings that apply include:
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Income Tax Assessment Act 1997 (ITAA 1997) - Division 8: Deductions</li>
            <li>Taxation Ruling TR 93/30 - Income tax: deductions for home office expenses</li>
            <li>
              Taxation Ruling TR 2023/1 - Income tax: when are deductions allowed for employees' transport expenses
            </li>
            <li>Practical Compliance Guideline PCG 2023/1 - Claiming home office expenses</li>
          </ul>

          <h3 className="font-bold text-lg mt-6">Calculation Methodologies</h3>

          <div className="bg-gray-50 border-2 border-gray-300 p-4 my-4">
            <h4 className="font-bold mb-2">1. Actual Cost Method (Recommended for Place of Business)</h4>
            <p>
              This method involves calculating the actual business portion of all occupancy and running expenses. It
              provides the most accurate reflection of costs and typically results in the highest deduction.
            </p>

            <div className="mt-4">
              <p className="font-bold">Formula:</p>
              <p className="font-mono bg-white p-2 border">
                Deduction = (Business Use Area ÷ Total Floor Area) × Annual Expense
              </p>
            </div>

            <div className="mt-4">
              <p className="font-bold">Eligible Expenses:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Mortgage interest or rent (business portion)</li>
                <li>Council rates (business portion)</li>
                <li>Land tax (business portion)</li>
                <li>Home and contents insurance (business portion)</li>
                <li>Repairs and maintenance (business portion)</li>
                <li>Depreciation on home value and fixtures</li>
                <li>Electricity, gas, water (business portion)</li>
                <li>Cleaning costs (business portion)</li>
                <li>Security system (business portion)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-300 p-4 my-4">
            <h4 className="font-bold mb-2">2. Fixed Rate Method</h4>
            <p>
              The ATO's shortcut method allows a flat rate per hour worked from home, covering running expenses. From 1
              July 2022, the rate is 67 cents per hour.
            </p>

            <div className="mt-4">
              <p className="font-bold">Formula:</p>
              <p className="font-mono bg-white p-2 border">Deduction = Hours Worked × $0.67</p>
            </div>

            <div className="mt-4">
              <p className="font-bold">What it covers:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Electricity and gas</li>
                <li>Internet</li>
                <li>Mobile and home phone</li>
                <li>Stationery and computer consumables</li>
              </ul>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-300 p-3">
              <p className="font-bold">Note:</p>
              <p>
                If using this method, you cannot separately claim running expenses, but you can still claim depreciation
                on equipment and furniture as a separate deduction.
              </p>
            </div>
          </div>

          <h3 className="font-bold text-lg mt-6">Record Keeping Requirements</h3>

          <p>To substantiate your claim, you must keep:</p>

          <div className="bg-blue-50 border-2 border-blue-300 p-4 my-4">
            <h4 className="font-bold mb-2">For Actual Cost Method:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Receipts for all expenses claimed</li>
              <li>Floor plan showing business use areas with measurements</li>
              <li>Diary or log of hours worked (for running costs calculation)</li>
              <li>Loan statements showing interest paid</li>
              <li>Council rates notices</li>
              <li>Insurance policy documents and payment receipts</li>
              <li>Utility bills (electricity, gas, water)</li>
              <li>Depreciation schedules</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 p-4 my-4">
            <h4 className="font-bold mb-2">For Fixed Rate Method:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Records of the number of hours worked from home</li>
              <li>Evidence that you incurred expenses (e.g., internet bill showing you have an internet connection)</li>
            </ul>
          </div>

          <p className="font-bold mt-4">
            All records must be kept for five years from the date you lodge your tax return.
          </p>
        </div>
      </section>

      {/* Capital Gains Tax Considerations */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">CAPITAL GAINS TAX (CGT) CONSIDERATIONS</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <div className="bg-red-50 border-2 border-red-300 p-4">
            <h3 className="font-bold text-lg mb-3 text-red-800">Important CGT Warning</h3>
            <p className="font-bold">
              Claiming occupancy expenses for a home office may affect your main residence CGT exemption in certain
              circumstances.
            </p>
          </div>

          <h3 className="font-bold text-lg mt-6">When CGT Applies</h3>

          <p>The main residence exemption from CGT may be partially lost if ALL of the following conditions apply:</p>

          <ul className="list-disc ml-6 space-y-2 my-4">
            <li>You use part of your home as a place of business</li>
            <li>That part of your home is used exclusively for business purposes</li>
            <li>That part of your home has been specifically constructed or set aside for business use</li>
            <li>You claim occupancy expenses (mortgage interest, rates, etc.) for the business area</li>
          </ul>

          <h3 className="font-bold text-lg mt-6">When CGT Does NOT Apply</h3>

          <p>You will generally retain the full main residence exemption if:</p>

          <ul className="list-disc ml-6 space-y-2 my-4">
            <li>The area is not used exclusively for business (e.g., you also use it as a spare bedroom)</li>
            <li>You only claim running expenses, not occupancy expenses</li>
            <li>The business use is incidental to the main use as a residence</li>
            <li>You don't make structural changes to accommodate the business</li>
          </ul>

          <div className="bg-yellow-50 border-2 border-yellow-300 p-4 my-6">
            <h4 className="font-bold mb-2">Example:</h4>
            <p className="mb-2">
              Sarah uses a bedroom in her home as a dedicated office for her consulting business. She works from home
              full-time and the room contains only business equipment and files. She claims{" "}
              {data.BUSINESS_USE_PERCENTAGE}% of her occupancy expenses.
            </p>
            <p className="font-bold">CGT Impact:</p>
            <p>
              When Sarah sells her home, {data.BUSINESS_USE_PERCENTAGE}% of any capital gain may be subject to CGT.
              However, she can calculate the CGT using either the time-based method or the actual CGT method, whichever
              is more favourable.
            </p>
          </div>

          <h3 className="font-bold text-lg mt-6">Minimizing CGT Impact</h3>

          <p>To reduce potential CGT liability:</p>

          <ul className="list-disc ml-6 space-y-2 my-4">
            <li>
              Consider only claiming running expenses (electricity, phone, internet) rather than occupancy expenses
            </li>
            <li>Ensure the business area can also be used for personal purposes</li>
            <li>Avoid making structural changes that clearly identify the area as a place of business</li>
            <li>Keep good records of business use periods to calculate CGT accurately if required</li>
            <li>Seek professional advice before selling your property</li>
          </ul>

          <div className="bg-blue-50 border-2 border-blue-300 p-4 my-6">
            <h4 className="font-bold mb-2">CGT Calculation Methods:</h4>

            <div className="space-y-4 mt-3">
              <div>
                <p className="font-bold">1. Time-Based Method:</p>
                <p className="font-mono bg-white p-2 border mt-2">
                  CGT = Total Gain × (Days used for business ÷ Total days owned) × (Business area ÷ Total area)
                </p>
              </div>

              <div>
                <p className="font-bold">2. Actual CGT Method:</p>
                <p className="font-mono bg-white p-2 border mt-2">
                  CGT = (Gain attributable to business period) × (Business area ÷ Total area)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-300 p-4 my-6">
            <p className="font-bold text-green-800">Good News:</p>
            <p>
              For most taxpayers who use the fixed rate method or only claim running expenses, there is NO CGT impact on
              their main residence.
            </p>
          </div>
        </div>
      </section>

      {/* Strategic Advice & Tax Planning Opportunities */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">STRATEGIC ADVICE & TAX PLANNING OPPORTUNITIES</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <div className="bg-green-50 border-2 border-green-300 p-4">
            <h3 className="font-bold text-lg mb-3 text-green-800">Our Recommendation for {data.CLIENT_NAME}</h3>
            <p>{data.RECOMMENDATION_TEXT}</p>
            <p className="mt-3 font-bold">
              Based on our analysis, we recommend using the:{" "}
              <span className="text-green-800">{data.RECOMMENDED_METHOD}</span>
            </p>
          </div>

          {/* Your Recommended Tax Strategy section */}
          <h3 className="font-bold text-lg mt-6">Your Recommended Tax Strategy</h3>

          <div className="bg-blue-50 border-2 border-blue-300 p-4 my-6">
            <h4 className="font-bold mb-3 text-blue-800">{data.STRATEGY_NAME || data.STRATEGY}</h4>
            <p className="mb-4">{data.STRATEGY_DESCRIPTION}</p>

            <div className="bg-white border border-blue-200 p-4 rounded mt-4">
              <h5 className="font-bold mb-2">Key Benefits of This Strategy:</h5>
              <ul className="list-disc ml-6 space-y-1">
                <li>Maximizes tax deductions for your {data.BUSINESS_USE_PERCENTAGE}% business use</li>
                <li>Ensures full ATO compliance with proper documentation</li>
                <li>Optimizes depreciation benefits on building improvements</li>
                <li>Provides clear structure for ongoing expense claims</li>
                <li>Positions your business for growth while maintaining tax efficiency</li>
              </ul>
            </div>
          </div>

          <h3 className="font-bold text-lg mt-6">Additional Tax Planning Opportunities</h3>

          <div className="bg-purple-50 border-2 border-purple-300 p-4 my-6">
            <h4 className="font-bold mb-3 text-purple-800">Professional Service Opportunities</h4>
            <p className="mb-4">
              The following professional services could further optimize your tax position. All costs shown are
              after-tax (at your {data.marginalTaxRate}% marginal rate), meaning the actual out-of-pocket cost to you is
              significantly lower than the service fee.
            </p>

            <div className="space-y-4">
              {data.opportunities?.map((opp: any, index: number) => (
                <div key={index} className="bg-white border border-purple-200 p-4 rounded">
                  <h5 className="font-bold text-md mb-2">{opp.name}</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Potential Additional Value:</span>
                      <p className="font-semibold">${opp.potentialValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">After-Tax Service Cost:</span>
                      <p className="font-semibold">${opp.afterTaxCost.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Net Annual Benefit:</span>
                      <p className={`font-bold text-lg ${opp.netBenefit > 0 ? "text-green-600" : "text-gray-600"}`}>
                        {opp.netBenefit > 0 ? "+" : ""}${opp.netBenefit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-700 italic">
              Note: After-tax costs reflect the tax deductibility of professional fees. Actual ROI depends on
              implementation and your specific circumstances.
            </p>
          </div>

          <h3 className="font-bold text-lg mt-6">Ongoing Compliance</h3>

          <p>To maintain compliance and optimize your tax position:</p>

          <ul className="list-disc ml-6 space-y-2 my-4">
            <li>Review and update your floor plan annually</li>
            <li>Keep detailed time records if using actual cost method</li>
            <li>Maintain all receipts and invoices in an organized system</li>
            <li>Schedule quarterly reviews with your tax advisor</li>
            <li>Stay informed of ATO guidance updates</li>
            <li>Consider implementing accounting software for expense tracking</li>
          </ul>

          <div className="bg-yellow-50 border-2 border-yellow-300 p-4 my-6">
            <h4 className="font-bold mb-2">Annual Review Recommended</h4>
            <p>We recommend reviewing your home office arrangements annually to ensure:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Your business use percentage remains accurate</li>
              <li>You're using the most tax-effective claiming method</li>
              <li>Your record-keeping systems are adequate</li>
              <li>You're aware of any legislative changes</li>
              <li>You're maximizing all available deductions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">NEXT STEPS & IMPLEMENTATION</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>To implement the recommendations in this report, we suggest the following action plan:</p>

          <div className="space-y-4 mt-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold mb-2">Step 1: Review & Confirm</h3>
              <p>
                Review this report thoroughly and confirm that all details are accurate. Contact us immediately if any
                information needs correction or clarification.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold mb-2">Step 2: Implement Record-Keeping Systems</h3>
              <p>Set up systems to track:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Hours worked from home (diary or app)</li>
                <li>All relevant receipts and invoices</li>
                <li>Floor plan with measurements</li>
                <li>Calculations for business use percentage</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold mb-2">Step 3: Prepare Supporting Documentation</h3>
              <p>Gather and organize:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Mortgage statements</li>
                <li>Council rates notices</li>
                <li>Insurance policy documents</li>
                <li>Utility bills for the financial year</li>
                <li>Receipts for repairs and maintenance</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold mb-2">Step 4: Schedule Tax Return Appointment</h3>
              <p>
                Contact our office to schedule your tax return preparation appointment. We recommend booking at least
                2-3 weeks before the October 31 lodgment deadline.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold mb-2">Step 5: Consider Additional Services</h3>
              <p>Depending on your circumstances, you may benefit from:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Quarterly BAS preparation and lodgment</li>
                <li>Bookkeeping services</li>
                <li>Tax planning consultation</li>
                <li>Business structure review</li>
                <li>Superannuation advice</li>
              </ul>
            </div>
          </div>

          <h3 className="font-bold text-lg mt-8">Contact Information</h3>

          <div className="bg-gray-50 border-2 border-gray-300 p-6 my-4">
            <div className="space-y-2">
              <p className="font-bold text-lg">INTELLISOLVE</p>
              <p>Business, Compliance & Taxation Advisers</p>
              <p>NTAA & BAS Agent Registration No: 94567</p>
              <p>ATO Registered Agent</p>
              <p className="mt-4">Address: Suite Level 1, 48 Doggett Street, Newstead, Qld 4006</p>
              <p>ABN: 55 976 863</p>
              <p>Email: admin@intellisolve.com.au</p>
              <p>Web: www.intellisolve.com.au</p>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-300 p-4 my-6">
            <h4 className="font-bold mb-2">Ready to Proceed?</h4>
            <p>Contact us to discuss this report and arrange your next appointment:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Phone: (07) 3xxx xxxx</li>
              <li>Email: admin@intellisolve.com.au</li>
              <li>Online: Book through our client portal</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Legal Disclaimers & Appendix */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">LEGAL DISCLAIMERS & IMPORTANT INFORMATION</h2>

        <div className="space-y-6 text-sm leading-relaxed">
          <div className="bg-red-50 border-2 border-red-300 p-4">
            <h3 className="font-bold text-lg mb-3">General Disclaimer</h3>
            <p>
              This report has been prepared specifically for {data.CLIENT_NAME} based on information provided as at{" "}
              {data.REPORT_DATE}. The advice and calculations contained in this report are general in nature and do not
              take into account your personal financial situation, objectives, or needs beyond what has been
              specifically discussed.
            </p>
          </div>

          <h3 className="font-bold text-lg mt-6">Limitation of Liability</h3>
          <p>Intellisolve and its representatives:</p>
          <ul className="list-disc ml-6 space-y-2 my-3">
            <li>
              Accept no liability for any loss or damage suffered by any person or entity acting or relying on
              information in this report without first obtaining professional advice specific to their circumstances
            </li>
            <li>Assume all information provided by the client is true, accurate, and complete</li>
            <li>
              Are not liable for any consequences arising from incorrect, incomplete, or misleading information provided
            </li>
            <li>Liability is limited by a scheme approved under Professional Standards Legislation</li>
          </ul>

          <h3 className="font-bold text-lg mt-6">Tax Law Changes</h3>
          <p>
            Tax law and ATO administrative positions are subject to change. The advice in this report is based on tax
            law and ATO positions current as at {data.REPORT_DATE}. We strongly recommend reviewing this advice annually
            or whenever there are material changes to your circumstances or tax legislation.
          </p>

          <h3 className="font-bold text-lg mt-6">Independence & Professional Standards</h3>
          <p>Intellisolve is an independent taxation and business advisory practice. We are:</p>
          <ul className="list-disc ml-6 space-y-2 my-3">
            <li>Registered with the Tax Practitioners Board (TPB)</li>
            <li>Members of the National Tax & Accountants' Association (NTAA)</li>
            <li>Bound by the Code of Professional Conduct</li>
            <li>Required to maintain professional indemnity insurance</li>
            <li>Subject to regular quality reviews and audits</li>
          </ul>

          <h3 className="font-bold text-lg mt-6">Privacy & Confidentiality</h3>
          <p>
            We treat all client information with strict confidentiality in accordance with the Privacy Act 1988. Your
            information:
          </p>
          <ul className="list-disc ml-6 space-y-2 my-3">
            <li>Is stored securely in encrypted systems</li>
            <li>Is only shared with third parties with your consent (e.g., ATO lodgments)</li>
            <li>Will be retained for the required period under tax law (minimum 5 years)</li>
            <li>Can be accessed or corrected upon your written request</li>
          </ul>

          <h3 className="font-bold text-lg mt-6">Complaints & Disputes</h3>
          <p>If you have any concerns about our service or advice:</p>
          <ol className="list-decimal ml-6 space-y-2 my-3">
            <li>Contact your advisor directly to discuss the issue</li>
            <li>If unresolved, lodge a formal complaint with our complaints officer</li>
            <li>If still unresolved, you may escalate to the Tax Practitioners Board</li>
          </ol>

          <div className="bg-gray-100 border-2 border-gray-400 p-4 my-6">
            <h4 className="font-bold mb-2">Legislative References</h4>
            <p className="text-xs">This advice is based on the following legislation and ATO guidance:</p>
            <ul className="list-disc ml-6 mt-2 text-xs space-y-1">
              <li>Income Tax Assessment Act 1997 (ITAA 1997)</li>
              <li>Income Tax Assessment Act 1936 (ITAA 1936)</li>
              <li>Taxation Ruling TR 93/30 - Home office expenses</li>
              <li>Taxation Ruling TR 2020/1 - Superannuation guarantee</li>
              <li>Practical Compliance Guideline PCG 2023/1 - Claiming home office expenses</li>
              <li>
                ATO website: www.ato.gov.au/business/income-and-deductions-for-business/home-based-business-expenses
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 p-4 my-6">
            <h4 className="font-bold mb-2">Acknowledgment</h4>
            <p>By proceeding to implement the advice in this report, you acknowledge that:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>You have read and understood this entire report</li>
              <li>All information you provided is true and accurate</li>
              <li>You have had the opportunity to ask questions and seek clarification</li>
              <li>You understand the tax implications and record-keeping requirements</li>
              <li>You will maintain adequate records to substantiate your claims</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Added new appendix sections */}
      {/* Appendix A */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">APPENDIX A</h2>
        <h3 className="text-xl font-bold mb-4">Home Business, Home Occupation and Home Office</h3>
        <h4 className="font-semibold mb-4">Local Government Area, General Requirements</h4>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Before establishing a home-based business, it's important to understand your local council's requirements
            and zoning regulations.
          </p>

          <h5 className="font-bold mt-6">Home Business:</h5>
          <p>
            A home business is generally defined as a business or commercial activity carried out in a dwelling or on
            land around a dwelling by one or more permanent residents of the dwelling.
          </p>

          <h5 className="font-bold mt-4">Home Occupation:</h5>
          <p>
            A home occupation is generally a business activity that: is secondary to the use of the dwelling as a place
            of residence, and employs only residents of the dwelling.
          </p>

          <h5 className="font-bold mt-4">Home Office:</h5>
          <p>
            A home office is generally administrative or clerical work carried out by a resident of the dwelling, where
            clients or customers do not visit the premises.
          </p>

          <h5 className="font-bold mt-6">General Requirements:</h5>
          <ul className="list-disc ml-6 space-y-2 mt-2">
            <li>The business must not adversely affect the amenity of the neighbourhood</li>
            <li>There should be no external evidence of the business (such as signage)</li>
            <li>Parking must be adequate and not impact neighbours</li>
            <li>No storage of hazardous materials</li>
            <li>Noise levels must comply with local regulations</li>
            <li>Operating hours may be restricted</li>
          </ul>

          <p className="mt-6 font-bold">
            Note: Requirements vary by local government area. Check with your local council for specific regulations.
          </p>
        </div>
      </section>

      {/* Appendix B */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">APPENDIX B</h2>
        <h3 className="text-xl font-bold mb-4">Property & Drawing Zoning (Local Council)</h3>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>This appendix would typically contain:</p>
          <ul className="list-disc ml-6 space-y-2 mt-2">
            <li>Zoning certificate from local council</li>
            <li>Property survey or site plan</li>
            <li>Floor plan with business areas marked</li>
            <li>Measurement calculations</li>
          </ul>

          <div className="border-2 border-gray-300 p-6 mt-6">
            <h4 className="font-bold mb-4">Property Details: {data.CLIENT_ADDRESS}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-gray-600">Total Floor Area:</div>
                <div>{data.TOTAL_FLOOR_AREA_M2}m²</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">Business Use Area:</div>
                <div>{data.TOTAL_BUSINESS_USE_AREA_M2}m²</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">Business Use Percentage:</div>
                <div className="text-lg font-bold">{data.BUSINESS_USE_PERCENTAGE}%</div>
              </div>
            </div>
          </div>

          <p className="mt-6 italic text-gray-600">
            Note: Attach relevant council documents, floor plans, and zoning certificates to this section.
          </p>
        </div>
      </section>

      {/* Appendix C */}
      <section className="page-break p-12">
        <h2 className="text-2xl font-bold mb-6">APPENDIX C</h2>
        <h3 className="text-xl font-bold mb-4">Authority to Collect the Advice</h3>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            I, <span className="font-bold">{data.CLIENT_NAME}</span>, hereby acknowledge that I have received and
            reviewed this Home Based Business & Taxation Advice report dated {data.REPORT_DATE}.
          </p>

          <div className="border-2 border-gray-300 p-6 my-6">
            <h4 className="font-bold mb-4">Client Acknowledgment:</h4>
            <ul className="list-disc ml-6 space-y-2">
              <li>I confirm all information provided in my questionnaire is accurate and complete</li>
              <li>I understand I must maintain adequate records to substantiate all claims</li>
              <li>I acknowledge this advice is based on current tax law and my specific circumstances</li>
              <li>I understand I should contact Intellisolve if my circumstances change</li>
              <li>I authorize Intellisolve to prepare my tax returns based on this advice</li>
            </ul>
          </div>

          <div className="mt-12 space-y-8">
            <div>
              <div className="border-b-2 border-black w-64 mb-2"></div>
              <div className="text-sm">Client Signature</div>
            </div>

            <div>
              <div className="border-b-2 border-black w-64 mb-2"></div>
              <div className="text-sm">Client Name (Print): {data.CLIENT_NAME}</div>
            </div>

            <div>
              <div className="border-b-2 border-black w-64 mb-2"></div>
              <div className="text-sm">Date</div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t-2 border-gray-300">
            <h4 className="font-bold mb-4">For Office Use:</h4>
            <div className="space-y-4">
              <div>
                <div className="border-b-2 border-black w-64 mb-2"></div>
                <div className="text-sm">Authorized Person - Intellisolve</div>
              </div>
              <div>
                <div className="border-b-2 border-black w-64 mb-2"></div>
                <div className="text-sm">Date</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Page - Contact Information */}
      <section className="page-break p-12">
        <div className="h-screen flex flex-col justify-center items-center text-center">
          <div className="text-blue-600 font-bold text-3xl mb-8">INTELLISOLVE</div>
          <div className="text-lg mb-12">Business, Compliance & Taxation Advisers</div>

          <div className="space-y-4 text-sm max-w-2xl">
            <div>
              <div className="font-bold">Address:</div>
              <div>Suite Level 1, 48 Doggett Street, Newstead, Qld 4006</div>
            </div>
            <div>
              <div className="font-bold">Email:</div>
              <div>admin@intellisolve.com.au</div>
            </div>
            <div>
              <div className="font-bold">Website:</div>
              <div>www.intellisolve.com.au</div>
            </div>
            <div>
              <div className="font-bold">ABN:</div>
              <div>55 976 863</div>
            </div>
            <div className="mt-8">
              <div>NTAA & BAS Agent Registration No: 94567</div>
              <div>ATO Registered Agent</div>
            </div>
            <div className="mt-8 text-xs text-gray-600">
              Liability limited by a scheme approved under Professional Standards Legislation
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-600">
            <div className="font-bold mb-2">Report Date: {data.REPORT_DATE}</div>
            <div>This document is confidential and prepared exclusively for {data.CLIENT_NAME}</div>
          </div>
        </div>
      </section>

      {/* Footer on every page */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-gray-800 text-white flex items-center justify-between px-6 text-xs print-only">
        <div>© 2025 Intellisolve/Business/Accounting Pty Ltd, ABN: {data.CLIENT_ABN}</div>
        <div>Prepared for: {data.CLIENT_NAME}</div>
        <div>{data.REPORT_DATE}</div>
      </div>
    </div>
  )
}
