import { Card } from "@/components/ui/card"

interface ReportData {
  clientName: string
  clientAddress: string
  clientCouncil: string
  businessName: string
  businessType: string
  businessABN: string
  businessStartDate: string
  reportDate: string

  // Property details
  totalFloorArea: number
  habitableFloorArea: number
  businessUseArea: number
  businessUsePercentage: number
  officeArea: number
  meetingArea: number
  archiveArea: number

  // Property expenses
  mortgage: number
  mortgageDeductible: number
  rates: number
  ratesDeductible: number
  water: number
  waterDeductible: number
  insurance: number
  insuranceDeductible: number
  repairs: number
  repairsDeductible: number
  depreciation: number
  depreciationDeductible: number

  // Running expenses
  electricity: number
  electricityDeductible: number
  gas: number
  gasDeductible: number
  cleaning: number
  cleaningDeductible: number
  security: number
  securityDeductible: number

  // Totals
  totalPropertyExpenses: number
  totalPropertyDeductible: number
  totalRunningExpenses: number
  totalRunningDeductible: number
  totalAnnualDeduction: number

  // Fixed rate method
  hoursPerWeek: number
  weeksPerYear: number
  totalHoursWorked: number
  fixedRateMethodClaim: number

  // Tax calculations
  marginalTaxRate: number
  estimatedTaxSavings: number
  recommendedMethod: string

  // Service fee
  serviceFee: number
  serviceFeeAfterTax: number
  netBenefitAvailable: number

  // Strategy
  strategy: string
  strategyDescription: string
}

export function PDFReport({ data }: { data: ReportData }) {
  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white p-8 print:p-0" id="pdf-report">
      {/* Cover Page */}
      <div className="h-[297mm] flex flex-col justify-center items-center text-center page-break-after">
        <div className="space-y-8">
          <h1 className="text-5xl font-bold text-primary">
            HOME BASED BUSINESS
            <br />& TAXATION ADVICE
          </h1>
          <div className="text-2xl font-semibold">{data.clientName}</div>
          <div className="text-xl text-muted-foreground">{data.businessName}</div>
          <div className="text-lg text-muted-foreground mt-16">{data.reportDate}</div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="page-break-before page-break-after">
        <h2 className="text-3xl font-bold mb-6 text-primary">Executive Summary</h2>
        <div className="space-y-4">
          <p className="text-lg">
            This report provides comprehensive taxation advice for <strong>{data.clientName}</strong> operating{" "}
            <strong>{data.businessName}</strong> ({data.businessType}) from their home located at {data.clientAddress}.
          </p>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-xl font-semibold mb-4">Key Findings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Business Use Percentage</div>
                <div className="text-2xl font-bold text-primary">{data.businessUsePercentage}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Annual Deduction</div>
                <div className="text-2xl font-bold text-primary">${data.totalAnnualDeduction.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Tax Savings</div>
                <div className="text-2xl font-bold text-green-600">${data.estimatedTaxSavings.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Recommended Method</div>
                <div className="text-2xl font-bold">{data.recommendedMethod}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-xl font-semibold mb-4">Net Benefit After Service Fee</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span className="font-semibold">${data.serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>After-Tax Cost ({data.marginalTaxRate}% tax rate):</span>
                <span className="font-semibold">${data.serviceFeeAfterTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg">
                <span className="font-bold">Net Benefit Available:</span>
                <span className="font-bold text-green-600">${data.netBenefitAvailable.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Property Details */}
      <div className="page-break-before page-break-after">
        <h2 className="text-3xl font-bold mb-6 text-primary">Property Analysis</h2>

        <h3 className="text-xl font-semibold mb-4">Floor Area Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Floor Area</div>
            <div className="text-2xl font-bold">{data.totalFloorArea} m²</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Habitable Floor Area</div>
            <div className="text-2xl font-bold">{data.habitableFloorArea} m²</div>
          </Card>
          <Card className="p-4 bg-blue-50">
            <div className="text-sm text-muted-foreground">Business Use Area</div>
            <div className="text-2xl font-bold text-primary">{data.businessUseArea} m²</div>
          </Card>
          <Card className="p-4 bg-blue-50">
            <div className="text-sm text-muted-foreground">Business Use %</div>
            <div className="text-2xl font-bold text-primary">{data.businessUsePercentage}%</div>
          </Card>
        </div>

        <h3 className="text-xl font-semibold mb-4">Business Areas</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Dedicated Office</div>
            <div className="text-xl font-bold">{data.officeArea} m²</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Meeting Area</div>
            <div className="text-xl font-bold">{data.meetingArea} m²</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Archive/Storage</div>
            <div className="text-xl font-bold">{data.archiveArea} m²</div>
          </Card>
        </div>
      </div>

      {/* Property Expenses */}
      <div className="page-break-before page-break-after">
        <h2 className="text-3xl font-bold mb-6 text-primary">Property Expenses</h2>

        <div className="space-y-2">
          {[
            { label: "Mortgage Interest", total: data.mortgage, deductible: data.mortgageDeductible },
            { label: "Council Rates", total: data.rates, deductible: data.ratesDeductible },
            { label: "Water Rates", total: data.water, deductible: data.waterDeductible },
            { label: "Building Insurance", total: data.insurance, deductible: data.insuranceDeductible },
            { label: "Repairs & Maintenance", total: data.repairs, deductible: data.repairsDeductible },
            { label: "Depreciation", total: data.depreciation, deductible: data.depreciationDeductible },
          ].map((expense) => (
            <div key={expense.label} className="flex justify-between items-center py-3 border-b">
              <span className="font-medium">{expense.label}</span>
              <div className="flex gap-8">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="font-semibold">${expense.total.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Deductible ({data.businessUsePercentage}%)</div>
                  <div className="font-bold text-primary">${expense.deductible.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center py-4 bg-blue-50 px-4 rounded-lg font-bold text-lg">
            <span>Total Property Expenses</span>
            <div className="flex gap-8">
              <div className="text-right">${data.totalPropertyExpenses.toLocaleString()}</div>
              <div className="text-right text-primary">${data.totalPropertyDeductible.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Running Expenses */}
      <div className="page-break-before page-break-after">
        <h2 className="text-3xl font-bold mb-6 text-primary">Running Expenses</h2>

        <div className="space-y-2">
          {[
            { label: "Electricity", total: data.electricity, deductible: data.electricityDeductible },
            { label: "Gas", total: data.gas, deductible: data.gasDeductible },
            { label: "Cleaning", total: data.cleaning, deductible: data.cleaningDeductible },
            { label: "Security", total: data.security, deductible: data.securityDeductible },
          ].map((expense) => (
            <div key={expense.label} className="flex justify-between items-center py-3 border-b">
              <span className="font-medium">{expense.label}</span>
              <div className="flex gap-8">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="font-semibold">${expense.total.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Deductible ({data.businessUsePercentage}%)</div>
                  <div className="font-bold text-primary">${expense.deductible.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center py-4 bg-blue-50 px-4 rounded-lg font-bold text-lg">
            <span>Total Running Expenses</span>
            <div className="flex gap-8">
              <div className="text-right">${data.totalRunningExpenses.toLocaleString()}</div>
              <div className="text-right text-primary">${data.totalRunningDeductible.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Method Comparison */}
      <div className="page-break-before page-break-after">
        <h2 className="text-3xl font-bold mb-6 text-primary">Tax Calculation Methods Comparison</h2>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Actual Cost Method</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Property Expenses:</span>
                <span className="font-semibold">${data.totalPropertyDeductible.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Running Expenses:</span>
                <span className="font-semibold">${data.totalRunningDeductible.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total Deduction:</span>
                <span className="text-primary">${data.totalAnnualDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Savings ({data.marginalTaxRate}%):</span>
                <span className="text-green-600 font-bold">${data.estimatedTaxSavings.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Fixed Rate Method</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Hours/Week:</span>
                <span className="font-semibold">{data.hoursPerWeek}</span>
              </div>
              <div className="flex justify-between">
                <span>Weeks/Year:</span>
                <span className="font-semibold">{data.weeksPerYear}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hours:</span>
                <span className="font-semibold">{data.totalHoursWorked}</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per Hour:</span>
                <span className="font-semibold">$0.70</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total Deduction:</span>
                <span className="text-primary">${data.fixedRateMethodClaim.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Savings ({data.marginalTaxRate}%):</span>
                <span className="text-green-600 font-bold">
                  ${Math.round(data.fixedRateMethodClaim * (data.marginalTaxRate / 100)).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-xl font-semibold mb-2">Recommended Method</h3>
          <div className="text-2xl font-bold text-primary">{data.recommendedMethod}</div>
          <p className="mt-4">
            The {data.recommendedMethod} provides the highest tax deduction of $
            {data.totalAnnualDeduction.toLocaleString()}, resulting in estimated tax savings of $
            {data.estimatedTaxSavings.toLocaleString()} at your {data.marginalTaxRate}% marginal tax rate.
          </p>
        </Card>
      </div>

      {/* Strategy & Opportunities */}
      <div className="page-break-before page-break-after">
        <h2 className="text-3xl font-bold mb-6 text-primary">Strategy & Implementation</h2>

        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Recommended Strategy</h3>
          <div className="text-lg font-bold text-primary mb-2">{data.strategy}</div>
          <p className="text-muted-foreground">{data.strategyDescription}</p>
        </Card>

        <h3 className="text-xl font-semibold mb-4">Opportunities for Net Benefit</h3>
        <p className="mb-4">
          After accounting for our service fee, you have{" "}
          <strong className="text-green-600">${data.netBenefitAvailable.toLocaleString()}</strong> in net benefit
          available. We recommend deploying this benefit across three key opportunities:
        </p>

        <div className="space-y-4">
          <Card className="p-6">
            <h4 className="font-semibold text-lg mb-2">1. Debt Reduction</h4>
            <p className="text-muted-foreground">
              Apply a portion of your tax savings toward mortgage principal reduction, accelerating your path to debt
              freedom and saving on interest costs.
            </p>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-lg mb-2">2. Superannuation Contributions</h4>
            <p className="text-muted-foreground">
              Maximize concessional contributions to superannuation, leveraging the 15% tax rate within super versus
              your {data.marginalTaxRate}% marginal rate.
            </p>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-lg mb-2">3. Investment Portfolio Growth</h4>
            <p className="text-muted-foreground">
              Invest in a diversified portfolio to generate long-term wealth accumulation and passive income streams for
              future financial security.
            </p>
          </Card>
        </div>
      </div>

      {/* Next Steps */}
      <div className="page-break-before">
        <h2 className="text-3xl font-bold mb-6 text-primary">Next Steps</h2>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Review & Approve Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Review this report with your accountant and confirm the recommended strategy aligns with your goals.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Implement Record Keeping</h4>
                <p className="text-sm text-muted-foreground">
                  Establish robust record-keeping systems to track all business-related expenses and maintain ATO
                  compliance.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Lodge Tax Return</h4>
                <p className="text-sm text-muted-foreground">
                  Include the recommended deductions in your annual tax return, supported by proper documentation.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Deploy Net Benefit</h4>
                <p className="text-sm text-muted-foreground">
                  Allocate your ${data.netBenefitAvailable.toLocaleString()} net benefit across the three opportunities
                  outlined in this report.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Genovesi Enterprises Pty Ltd, T/As: Intellisolve
            <br />
            This report is confidential and prepared specifically for {data.clientName}
          </p>
        </div>
      </div>
    </div>
  )
}
