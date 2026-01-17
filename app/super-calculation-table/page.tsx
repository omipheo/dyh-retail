export default function SuperCalculationTable() {
  // Sarah Chen's data (now age 33, 32 years to retirement)
  const currentAge = 33
  const retirementAge = 65
  const yearsToRetirement = retirementAge - currentAge // 32 years
  const year1Contribution = 0 // After implementation fee
  const year2PlusContribution = 4322 // Annual contribution Year 2+
  const preTaxGrowthRate = 3.5 // 3.5% per annum
  const superTaxRate = 15 // 15% tax on super earnings
  const afterTaxGrowthRate = preTaxGrowthRate * (1 - superTaxRate / 100) // 2.975%
  const totalAccumulatedAt65 = 171434 // Calculated future value
  const implementationFee = 14520
  const ongoingFee = 6600

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-blue-900">Superannuation Balanced Fund Calculation</h1>

        {/* Word-optimized table with inline styles */}
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#000",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "2px solid #2563eb",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#2563eb" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #1e40af",
                  }}
                >
                  Parameter
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #1e40af",
                  }}
                >
                  Year 1
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    color: "#fff",
                    fontWeight: "bold",
                    border: "1px solid #1e40af",
                  }}
                >
                  Year 2-{yearsToRetirement}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Current Age */}
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Current Age
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                  }}
                  colSpan={2}
                >
                  {currentAge} years
                </td>
              </tr>

              {/* Years to say Age 65 */}
              <tr style={{ backgroundColor: "#fff" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Years to say Age 65
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                  }}
                  colSpan={2}
                >
                  {yearsToRetirement} years
                </td>
              </tr>

              {/* Annual Tax Savings */}
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Annual Tax Savings
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                  }}
                  colSpan={2}
                >
                  $10,922
                </td>
              </tr>

              {/* Agent Fees */}
              <tr style={{ backgroundColor: "#fff" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Less: Agent Fees
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                  }}
                >
                  ${implementationFee.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                  }}
                >
                  ${ongoingFee.toLocaleString()}/year
                </td>
              </tr>

              {/* Net Contribution */}
              <tr style={{ backgroundColor: "#dbeafe" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #93c5fd",
                  }}
                >
                  <strong>Net Annual Contribution to Super</strong>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    border: "1px solid #93c5fd",
                  }}
                >
                  ${year1Contribution.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    border: "1px solid #93c5fd",
                  }}
                >
                  ${year2PlusContribution.toLocaleString()}/year
                </td>
              </tr>

              {/* Growth Rate - Pre-Tax */}
              <tr style={{ backgroundColor: "#fef3c7" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #fbbf24",
                  }}
                >
                  <strong>Balanced Fund Growth Rate (Pre-Tax)</strong>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    border: "1px solid #fbbf24",
                  }}
                  colSpan={2}
                >
                  {preTaxGrowthRate.toFixed(1)}% p.a.
                </td>
              </tr>

              {/* Super Tax Rate */}
              <tr style={{ backgroundColor: "#fff" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #d1d5db",
                  }}
                >
                  Less: Superannuation Tax Rate
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    border: "1px solid #d1d5db",
                  }}
                  colSpan={2}
                >
                  {superTaxRate}%
                </td>
              </tr>

              {/* After-Tax Growth Rate */}
              <tr style={{ backgroundColor: "#fef3c7" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: "bold",
                    border: "1px solid #fbbf24",
                  }}
                >
                  <strong>Effective Growth Rate (After Super Tax)</strong>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    border: "1px solid #fbbf24",
                  }}
                  colSpan={2}
                >
                  {afterTaxGrowthRate.toFixed(3)}% p.a.
                </td>
              </tr>

              {/* Total at Age 65 */}
              <tr style={{ backgroundColor: "#dcfce7" }}>
                <td
                  style={{
                    padding: "12px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    border: "2px solid #16a34a",
                  }}
                >
                  <strong>TOTAL ACCUMULATED AT AGE 65</strong>
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: "16px",
                    border: "2px solid #16a34a",
                  }}
                  colSpan={2}
                >
                  ${totalAccumulatedAt65.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Supporting Information */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#eff6ff",
              border: "1px solid #93c5fd",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "16px" }}>Calculation Formula:</h3>
            <p style={{ marginBottom: "8px" }}>
              <strong>Future Value (FV)</strong> = Σ [PMT × (1 + r)^(n-t)]
            </p>
            <p style={{ marginBottom: "8px", fontSize: "13px", color: "#374151" }}>Where:</p>
            <ul style={{ marginLeft: "20px", fontSize: "13px", color: "#374151" }}>
              <li>PMT = Annual contribution after fees</li>
              <li>r = After-tax return rate ({afterTaxGrowthRate.toFixed(3)}%)</li>
              <li>n = Years to retirement ({yearsToRetirement})</li>
              <li>t = Current year in sequence</li>
            </ul>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "#fef3c7",
              border: "1px solid #fbbf24",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "16px" }}>Key Insight:</h3>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              By investing your <strong>net tax savings</strong> (after agent fees) into a balanced superannuation fund
              growing at <strong>{preTaxGrowthRate}% pre-tax</strong> ({afterTaxGrowthRate.toFixed(3)}% after super
              tax), you can accumulate <strong>${totalAccumulatedAt65.toLocaleString()}</strong> by age 65. This wealth
              is built entirely from tax deductions that wouldn't exist without the home business strategy.
            </p>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "#dcfce7",
              border: "1px solid #16a34a",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "16px" }}>
              The "Money from Thin Air" Effect:
            </h3>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              Remember: These contributions come from <strong>tax savings</strong> that reduce the tax you would
              otherwise pay to the ATO. Your agent fees are covered by the tax savings, and any remaining amount grows
              tax-effectively inside superannuation for your retirement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
