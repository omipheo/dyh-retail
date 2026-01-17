export default function PropertyCalculationTable() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Property Upgrade Future Wealth Calculation</h1>

        {/* Word-friendly table with inline styles for better copy-paste */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  backgroundColor: "#1e3a8a",
                  color: "#ffffff",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Parameter
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  backgroundColor: "#1e3a8a",
                  color: "#ffffff",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Current Property
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  backgroundColor: "#1e3a8a",
                  color: "#ffffff",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Upgraded Property
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  backgroundColor: "#1e3a8a",
                  color: "#ffffff",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Today&apos;s Value
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                $950,000
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                $1,032,115
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                +$82,115
              </td>
            </tr>
            <tr style={{ backgroundColor: "#fef3c7" }}>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Annual Growth Rate
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                4.0%
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                5.5%
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#b91c1c",
                }}
              >
                +1.5%
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Years to say Age 65
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                27 years
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                27 years
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                -
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Future Value
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                $1,612,458
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                $2,549,088
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                +$936,630
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Transaction Costs
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                -
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                8% (~$82,569)
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                -
              </td>
            </tr>
            <tr style={{ backgroundColor: "#d4edda" }}>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Net Extra Wealth
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                -
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                -
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "12px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#15803d",
                }}
              >
                $936,630
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "32px", lineHeight: "1.6" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#1e3a8a",
            }}
          >
            Key Insight:
          </h2>
          <p style={{ marginBottom: "16px" }}>
            A <strong>1.5% higher annual growth rate</strong> (5.5% vs 4.0%) compounded over 27 years creates{" "}
            <strong>$936,630 in additional wealth</strong>, despite the higher purchase price and transaction costs.
          </p>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: "#6b7280" }}>
            <em>
              Note: The 4.0% growth rate shown is net after adjusting for average inflation of 2.8% per annum over the
              last 25 years. Historical property data shows that established homes in established suburbs have typically
              appreciated at approximately 6.8% per annum (nominal), while upgraded properties in premium locations have
              achieved approximately 8.3% per annum (nominal). After removing the inflation component, these translate
              to real growth rates of 4.0% and 5.5% respectively, providing a more accurate measure of genuine wealth
              accumulation.
            </em>
          </p>

          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
              marginTop: "24px",
              color: "#1e3a8a",
            }}
          >
            Formula:
          </h2>
          <p style={{ fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "4px" }}>
            Future Value = Present Value × (1 + Growth Rate)^Years
            <br />
            Extra Wealth = Future Upgraded Value - Future Current Value - Fees
          </p>
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            backgroundColor: "#eff6ff",
            border: "1px solid #3b82f6",
            borderRadius: "4px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#1e40af" }}>
            <strong>Instructions:</strong> Select the table above (click and drag to highlight), press Ctrl+C (or Cmd+C
            on Mac) to copy, then paste into your Word document. The formatting will be preserved.
          </p>
        </div>
      </div>
    </div>
  )
}
