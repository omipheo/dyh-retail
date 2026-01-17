"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  calculateLifetimeOpportunityBenefits, // Import lifetime calculation functions
  calculateMarginalTaxRate,
} from "@/lib/tax-calculator"

const demoClients = [
  {
    id: 1,
    name: "Sarah Chen",
    businessType: "Digital Marketing & Content Creation",
    strategy: "HBRS(i)",
    strategyName: "Home Business Re-Structure: Acquire & Start",
    totalDeductions: 23238,
    taxSavings: 10922,
    withoutStrategy: 1512,
    withStrategy: 23238,
    mortgageValue: 750000,
    yearsReduced: 6.5,
    interestSaved: 245680,
    superBoost: 171434, // $4,322 annual savings over 32 years at 3.5% return (after 15% tax = 2.975% net)
    currentHomeValue: 950000,
    proposedHomeValue: 1032115,
    futureCurrentValue: 1770742, // $950k at 2% for 32 years
    futureProposedValue: 3105076, // $1,032,115 at 3.5% for 32 years
    extraWealth: 1334334, // Updated for 32-year timeframe
  },
  {
    id: 2,
    name: "Marcus Thompson",
    businessType: "Architecture & Design Studio",
    strategy: "HBRS(ii)",
    strategyName: "Home Business Re-Structure: Stay & Start",
    totalDeductions: 23238,
    taxSavings: 10922,
    withoutStrategy: 1512,
    withStrategy: 23238,
    mortgageValue: 850000,
    yearsReduced: 8.8,
    interestSaved: 328870,
    superBoost: 148389, // Updated: $10,922 annual savings over 27 years at 3.5% return (after 15% tax = 2.975% net)
    currentHomeValue: 1200000,
    proposedHomeValue: 1302118,
    futureCurrentValue: 2036842,
    futureProposedValue: 3215719,
    extraWealth: 1178877,
  },
  {
    id: 3,
    name: "Jennifer Ormond",
    businessType: "Financial Planning & Wealth Management",
    strategy: "HBRS(iii)",
    strategyName: "Home Business Re-Structure: Extend & Start",
    totalDeductions: 26842,
    taxSavings: 12616,
    withoutStrategy: 1512,
    withStrategy: 26842,
    mortgageValue: 920000,
    yearsReduced: 9.2,
    interestSaved: 356240,
    superBoost: 206456, // Updated: $12,616 annual savings over 27 years at 3.5% return (after 15% tax = 2.975% net)
    currentHomeValue: 1350000,
    proposedHomeValue: 1465125,
    futureCurrentValue: 2291447,
    futureProposedValue: 3617906,
    extraWealth: 1326459,
  },
]

export default function DemoScenariosPage() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null)

  useEffect(() => {
    if (selectedClient) {
      // Blur content when window loses focus (during screenshot attempts)
      const handleVisibilityChange = () => {
        const content = document.getElementById("protected-dar-content")
        if (content) {
          if (document.hidden || !document.hasFocus()) {
            content.style.filter = "blur(20px)"
            content.style.opacity = "0.3"
          } else {
            content.style.filter = "none"
            content.style.opacity = "1"
          }
        }
      }

      const handleBlur = () => {
        const content = document.getElementById("protected-dar-content")
        if (content) {
          content.style.filter = "blur(20px)"
          content.style.opacity = "0.3"
        }
      }

      const handleFocus = () => {
        const content = document.getElementById("protected-dar-content")
        if (content) {
          content.style.filter = "none"
          content.style.opacity = "1"
        }
      }

      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        alert("Screenshots and copying are not permitted on this confidential report.")
        return false
      }

      // Disable keyboard shortcuts (Ctrl+P, Ctrl+S, Print Screen, etc.)
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent print (Ctrl+P, Cmd+P)
        if ((e.ctrlKey || e.metaKey) && e.key === "p") {
          e.preventDefault()
          alert("Printing is not permitted on this confidential report.")
          return false
        }
        // Prevent save (Ctrl+S, Cmd+S)
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault()
          alert("Saving is not permitted on this confidential report.")
          return false
        }
        // Prevent screenshot tools (Print Screen, Cmd+Shift+3/4/5)
        if (e.key === "PrintScreen" || ((e.metaKey || e.ctrlKey) && e.shiftKey && ["3", "4", "5"].includes(e.key))) {
          e.preventDefault()
          const content = document.getElementById("protected-dar-content")
          if (content) {
            content.style.filter = "blur(20px)"
            content.style.opacity = "0.3"
            setTimeout(() => {
              content.style.filter = "none"
              content.style.opacity = "1"
            }, 2000)
          }
          alert("Screenshots are not permitted on this confidential report.")
          return false
        }
        // Prevent dev tools (F12, Ctrl+Shift+I, Cmd+Option+I)
        if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i"))) {
          e.preventDefault()
          alert("Developer tools are disabled for this confidential report.")
          return false
        }
        // Prevent Ctrl+C / Cmd+C (copy)
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
          e.preventDefault()
          alert("Copying is not permitted on this confidential report.")
          return false
        }
      }

      // Disable drag and drop
      const handleDragStart = (e: DragEvent) => {
        e.preventDefault()
        return false
      }

      // Add event listeners
      document.addEventListener("contextmenu", handleContextMenu)
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("dragstart", handleDragStart)
      document.addEventListener("visibilitychange", handleVisibilityChange)
      window.addEventListener("blur", handleBlur)
      window.addEventListener("focus", handleFocus)

      // Add CSS to prevent text selection and printing
      const style = document.createElement("style")
      style.id = "view-only-protection"
      style.textContent = `
        .protected-content {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          pointer-events: auto !important;
          transition: filter 0.3s, opacity 0.3s;
        }
        .protected-content img {
          pointer-events: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        @media print {
          .protected-content {
            display: none !important;
          }
          body::after {
            content: "This report cannot be printed. Please contact us for authorized copies.";
            display: block;
            text-align: center;
            padding: 2rem;
            font-size: 1.5rem;
            color: red;
          }
        }
        /* Prevent selection highlight */
        .protected-content::selection {
          background: transparent;
        }
        .protected-content::-moz-selection {
          background: transparent;
        }
      `
      document.head.appendChild(style)

      // Cleanup
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu)
        document.removeEventListener("keydown", handleKeyDown)
        document.removeEventListener("dragstart", handleDragStart)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        window.removeEventListener("blur", handleBlur)
        window.removeEventListener("focus", handleFocus)
        const styleElement = document.getElementById("view-only-protection")
        if (styleElement) styleElement.remove()
      }
    }
  }, [selectedClient])

  const handleViewReport = (clientId: number) => {
    setSelectedClient(clientId)
  }

  const client = selectedClient ? demoClients.find((c) => c.id === selectedClient) : null

  // Initialize selectedClient and calculate lifetime benefits
  const initializedSelectedClient = selectedClient !== null ? selectedClient : 1
  const clientData = demoClients.find((c) => c.id === initializedSelectedClient) || demoClients[0]

  const clientAge = initializedSelectedClient === 1 ? 33 : initializedSelectedClient === 2 ? 48 : 38 // Example ages
  const taxableIncome = 200000 // Demo clients are on $200k
  const marginalTaxRate = calculateMarginalTaxRate(taxableIncome)

  const lifetimeBenefits = calculateLifetimeOpportunityBenefits(
    clientData.taxSavings,
    clientAge,
    clientData.mortgageValue,
  )

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Demo Client Scenarios</h1>
        <p className="text-slate-600">View Decisive Action Reports for each demo client</p>
      </div>

      {!selectedClient ? (
        <div className="grid gap-6 md:grid-cols-3">
          {demoClients.map((client) => (
            <Card key={client.id} className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{client.name}</CardTitle>
                    <CardDescription className="mt-1">{client.businessType}</CardDescription>
                  </div>
                  <Badge className="bg-blue-600">{client.strategy}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate-600">{client.strategyName}</p>
                <Button onClick={() => handleViewReport(client.id)} className="w-full bg-green-600 hover:bg-green-700">
                  <span className="mr-2">👁</span> VIEW REPORT
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button onClick={() => setSelectedClient(null)} variant="outline" className="mb-6">
            ← Back to Scenarios
          </Button>

          {selectedClient && (
            <div
              id="protected-dar-content"
              className="protected-content max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-lg border relative"
            >
              {/* Watermark overlay for additional protection */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0,0,0,0.02) 100px, rgba(0,0,0,0.02) 200px)",
                  zIndex: 1,
                }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center border-b pb-6">
                  <h1 className="text-3xl font-bold mb-2">DECISIVE ACTION REPORT</h1>
                  <h2 className="text-2xl font-semibold">{clientData.name}</h2>
                  <p className="text-slate-600">{clientData.businessType}</p>
                </div>

                {/* Introduction */}
                <div className="space-y-4">
                  <br />
                  <p className="text-slate-700">
                    This report provides you with crucial information about your potential home business deductions. The
                    data contained herein has been calculated based on the information you provided, and represents our
                    analysis of your current situation compared to your optimised position.
                  </p>
                  <br />
                </div>

                {/* Recommended Strategy */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-blue-900 uppercase">YOUR RECOMMENDED STRATEGY</h3>
                  <div className="bg-green-50 border-l-4 border-green-600 p-4">
                    <h4 className="font-bold text-green-800 mb-2">
                      {clientData.strategy}: {clientData.strategyName}
                    </h4>
                    <p className="text-sm text-slate-700">
                      Home owner starting a business from existing purchased home
                    </p>
                    <p className="text-sm text-slate-700 mt-2">
                      The second Home Business Re-Structure Strategy is for individuals who already own their home and
                      want to commence a home-based business from their existing property without making any physical
                      changes. By starting a business from your existing home, you immediately create tax deductions for
                      the business use portion of your property. This includes a portion of loan interest, rates,
                      insurance, repairs, utilities, and depreciation on the building's business area.
                    </p>
                  </div>
                </div>

                {/* Deductions Summary Section */}
                <div className="mb-8">
                  <br />
                  <br />
                  <h2 className="mb-6 text-2xl font-bold text-[#0066CC]">YOUR TOTAL ANNUAL TAX DEDUCTIONS SUMMARY</h2>

                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Without Strategy Box */}
                    <Card className="border-2 border-red-200 bg-red-50 p-6">
                      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-900">
                        Without Strategy
                      </div>
                      <div className="text-4xl font-bold text-red-600">
                        {clientData.withoutStrategy.toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-red-700">Annual deductions without Deduct Your Home</div>
                    </Card>

                    {/* With Strategy Box */}
                    <Card className="border-2 border-green-200 bg-green-50 p-6">
                      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-900">
                        With Strategy
                      </div>
                      <div className="text-4xl font-bold text-green-600">
                        {clientData.withStrategy.toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-green-700">Annual deductions with Deduct Your Home</div>
                    </Card>

                    {/* Your Savings Box */}
                    <Card className="border-2 border-blue-200 bg-blue-50 p-6">
                      <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-900">
                        Extra Deductions
                      </div>
                      <div className="text-4xl font-bold text-blue-600">
                        {(clientData.withStrategy - clientData.withoutStrategy).toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs text-blue-700">
                        Extra deductions per year (at {Math.round(marginalTaxRate * 100)}% marginal rate)
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6 rounded-lg bg-blue-50 border-2 border-blue-200 p-6">
                    <h3 className="mb-3 text-lg font-bold text-blue-900">
                      💰 Complete Transparency: All Benefits Shown Are NET OF FEES
                    </h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>
                        <strong>What this means for you:</strong> Based on your disclosed income and at your marginal
                        rate of taxation, every dollar amount you see below represents TRUE wealth you'll build—after
                        deducting all Registered Tax Agent fees.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        <div className="bg-white rounded p-4">
                          <div className="font-semibold text-blue-900 mb-2">Year 1 (Implementation)</div>
                          <div className="text-xs space-y-1">
                            <div>
                              Annual Tax Savings:{" "}
                              <span className="font-semibold">${clientData.taxSavings.toLocaleString()}</span>
                            </div>
                            <div>
                              Less Implementation and Ongoing Fee:{" "}
                              <span className="font-semibold text-red-600">-$14,520</span>
                            </div>
                            <div className="pt-2 border-t border-blue-200">
                              Net Year 1 Benefit:{" "}
                              <span className="font-bold text-green-600">
                                ${lifetimeBenefits.lifetime.year1NetBenefit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded p-4">
                          <div className="font-semibold text-blue-900 mb-2">Year 2+ (Ongoing)</div>
                          <div className="text-xs space-y-1">
                            <div>
                              Annual Tax Savings:{" "}
                              <span className="font-semibold">${clientData.taxSavings.toLocaleString()}</span>
                            </div>
                            <div>
                              Less Ongoing Fee: <span className="font-semibold text-red-600">-$6,600</span>
                            </div>
                            <div className="pt-2 border-t border-blue-200">
                              Net Annual Benefit:{" "}
                              <span className="font-bold text-green-600">
                                ${lifetimeBenefits.lifetime.year2PlusAnnualNetBenefit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* CHANGE: Removed arrow SVG element */}
                      <p className="mt-3 text-xs italic">
                        No hidden surprises. No fine print. Just honest numbers showing your actual financial gain after
                        all costs.
                      </p>
                      <p className="mt-3 text-sm italic text-gray-700">
                        Furthermore where appropriate and at no extra charge, we'll also review your situation to see
                        what deductions you missed over the last two years in order to amend those returns for you so as
                        to put even more money rightfully back in your pocket, where it belongs!
                      </p>
                    </div>
                  </div>
                </div>

                {/* CHANGE: Adding prominent "Your Tax Savings Cover Our Fees" callout box */}
                <Card className="mb-8 border-4 border-emerald-500 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8 shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="rounded-full bg-emerald-500 p-4 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-4 text-3xl font-bold text-emerald-900">YOUR TAX SAVINGS COVER ALL OUR FEES</h2>

                      <div className="mb-6 space-y-3 text-lg text-gray-800">
                        <p className="leading-relaxed">
                          Thinking long-term, by the time you turn say 65, your annual tax savings of{" "}
                          <strong className="text-emerald-700">${clientData.taxSavings.toLocaleString()}</strong> will
                          total{" "}
                          <strong className="text-emerald-700">
                            ${lifetimeBenefits.lifetime.totalLifetimeGrossSavings.toLocaleString()}
                          </strong>
                          .
                        </p>
                        <p className="leading-relaxed">
                          Our lifetime fees over this same period total{" "}
                          <strong className="text-red-700">
                            ${lifetimeBenefits.lifetime.totalLifetimeFees.toLocaleString()}
                          </strong>
                          .
                        </p>
                      </div>

                      <div className="mb-6 rounded-xl bg-white p-6 shadow-lg border-2 border-emerald-200">
                        <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                          Net Surplus from Tax Savings Alone
                        </div>
                        <div className="text-5xl font-bold text-emerald-600">
                          ${lifetimeBenefits.lifetime.totalLifetimeNetBenefit.toLocaleString()}
                        </div>
                        <p className="mt-3 text-sm text-gray-700">
                          This means our Registered Tax Agent service <strong>effectively costs you NOTHING</strong>
                          —your tax savings cover all fees with surplus left over!
                        </p>
                      </div>

                      <p className="mt-6 text-sm italic text-gray-700">
                        <strong>Complete transparency:</strong> Every dollar delayed is wealth you're leaving on the
                        table. Our fees are an investment that pays for itself through tax savings alone—everything else
                        is pure upside for you and your family.
                      </p>
                      <p className="mt-3 text-sm italic text-gray-700">
                        Furthermore where appropriate and at no extra charge, we'll also review your situation to see
                        what deductions you missed over the last two years in order to amend those returns for you so as
                        to put even more money rightfully back in your pocket.
                      </p>

                      {/* CHANGE: Removed green "And the best part" box with duplicate "Furthermore" paragraph */}
                      <p className="mt-3 text-sm italic text-gray-700">
                        Furthermore where appropriate and at no extra charge, we'll also review your situation to see
                        what deductions you missed over the last two years in order to amend those returns for you so as
                        to put even more money rightfully back in your pocket.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Three Example Opportunities */}
                <div className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-[#0066CC]">
                    THREE HYPOTHETICAL WEALTH BUILDING EXAMPLES
                  </h2>
                  <p className="mb-6 text-gray-700">
                    Sure you can spend the savings to your heart's content however you could also use your annual tax
                    savings (net of our fees) to build real wealth:
                  </p>

                  <p className="mb-6 text-gray-700">
                    <strong>General Advice Warning:</strong> We are not licensed financial advisers hence this is merely
                    for your enlightenment and it may not be construed as personal financial advice!
                  </p>

                  <div className="space-y-6">
                    {/* Opportunity 1: Mortgage Acceleration */}
                    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-white p-6">
                      <div className="mb-4 flex items-start gap-4">
                        <div className="rounded-lg bg-green-100 p-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 text-green-600"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L11.5 20H4v-7.5L17 3z"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold text-green-900">
                            Example 1: Accelerate Your Mortgage Freedom
                          </h3>
                          <p className="text-sm text-gray-700">
                            Apply your net tax savings to extra mortgage repayments and own your home faster
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Year 1 Extra Payment
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${lifetimeBenefits.mortgageAcceleration.year1ExtraPayment.toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">After $14,520 implementation fee</div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow-sm">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Year 2+ Annual Payment
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${lifetimeBenefits.mortgageAcceleration.year2PlusExtraPayment.toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">After $6,600 ongoing fee</div>
                        </div>

                        <div className="rounded-lg bg-green-100 p-4 shadow-sm">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                            Total Interest Saved
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            ${lifetimeBenefits.mortgageAcceleration.totalInterestSaved.toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-green-700">
                            Pay off {lifetimeBenefits.mortgageAcceleration.yearsReduced} years earlier (NET benefit)
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Opportunity 2: Superannuation Boost */}
                    {/* Opportunity 2: Hypothetical Growth over Time */}
                    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6">
                      <div className="mb-4">
                        <h3 className="mb-3 text-xl font-bold text-blue-900">
                          Example 2: Hypothetical Growth over Time
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          If you were to take your annual tax saving of{" "}
                          <strong>${clientData.taxSavings.toLocaleString()}</strong> (after deducting the $6,600 ongoing
                          agent fee = <strong>${(clientData.taxSavings - 6600).toLocaleString()}</strong>) and it were
                          to return 3% p.a. (net of fees and taxes), in an investment of your choice, here is what that
                          compounding could look like for your future self:
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="border border-blue-300 px-4 py-3 text-left font-semibold text-blue-900">
                                Timeframe
                              </th>
                              <th className="border border-blue-300 px-4 py-3 text-left font-semibold text-blue-900">
                                Cumulative Savings
                                <br />
                                (Your Capital)
                              </th>
                              <th className="border border-blue-300 px-4 py-3 text-left font-semibold text-blue-900">
                                Potential Future Gain
                                <br />
                                (Total Value)*
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const annualNetSavings = clientData.taxSavings - 6600
                              const growthRate = 0.03
                              const timeframes = [10, 15, 20, 25, 30]

                              return timeframes.map((years) => {
                                const cumulativeSavings = annualNetSavings * years
                                const futureValue =
                                  annualNetSavings * ((Math.pow(1 + growthRate, years) - 1) / growthRate)

                                return (
                                  <tr key={years} className="hover:bg-blue-50">
                                    <td className="border border-blue-200 px-4 py-3">After {years} Years</td>
                                    <td className="border border-blue-200 px-4 py-3 font-semibold text-blue-700">
                                      ${Math.round(cumulativeSavings).toLocaleString()}**
                                    </td>
                                    <td className="border border-blue-200 px-4 py-3 font-semibold text-green-700">
                                      ${Math.round(futureValue).toLocaleString()}**
                                    </td>
                                  </tr>
                                )
                              })
                            })()}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-gray-600 italic">
                        <p>
                          * Total value includes your capital plus compounded growth at 3% p.a. (net of fees and taxes)
                        </p>
                        <p>
                          ** Formula used: FV = P × ((1 + r)^n - 1) / r, where P = annual net savings, r = 3% growth
                          rate, n = number of years
                        </p>
                      </div>
                    </Card>

                    {/* Opportunity 3: Home Upgrade Strategy */}
                    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white p-6">
                      <div className="mb-4 flex items-start gap-4">
                        <div className="rounded-lg bg-purple-100 p-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-8 w-8 text-purple-600"
                          >
                            <path d="M20 3h-9a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
                            <path d="M14 10h6"></path>
                            <path d="M14 14h6"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-bold text-purple-900">
                            Example 3: Upgrade to Your Dream Home
                          </h3>
                          <p className="text-sm text-gray-700">
                            Use your strategy to move into a superior property with enhanced business facilities
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Current Home Value
                          </div>
                          <div className="text-2xl font-bold text-gray-700">
                            ${clientData.currentHomeValue.toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">Today's market value</div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow-sm">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Upgraded Home Value
                          </div>
                          <div className="text-2xl font-bold text-purple-600">
                            ${clientData.proposedHomeValue.toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">Enhanced business-friendly property</div>
                        </div>

                        <div className="rounded-lg bg-purple-100 p-4 shadow-sm">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
                            Extra Wealth at Age 65
                          </div>
                          <div className="text-2xl font-bold text-purple-700">
                            ${clientData.extraWealth.toLocaleString()}
                          </div>
                          <div className="mt-1 text-xs text-purple-700">
                            Additional equity after {lifetimeBenefits.lifetime.yearsToRetirement} years (NET benefit)
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse bg-white shadow-sm">
                          <thead>
                            <tr className="bg-purple-900 text-white">
                              <th className="border border-purple-700 px-4 py-3 text-left font-bold">Parameter</th>
                              <th className="border border-purple-700 px-4 py-3 text-center font-bold">
                                Current Property
                              </th>
                              <th className="border border-purple-700 px-4 py-3 text-center font-bold">
                                Upgraded Property
                              </th>
                              <th className="border border-purple-700 px-4 py-3 text-center font-bold">Difference</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                                Today's Value
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                ${clientData.currentHomeValue.toLocaleString()}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                ${clientData.proposedHomeValue.toLocaleString()}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-green-700 font-semibold">
                                +${(clientData.proposedHomeValue - clientData.currentHomeValue).toLocaleString()}
                              </td>
                            </tr>
                            <tr className="bg-yellow-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">Annual Growth Rate</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">2.0%</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">3.5%</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold">+1.5%</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                                {/* CHANGE: Changed from "Years to Retirement" to "Years to say Age 65" */}
                                Years to say Age 65
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {lifetimeBenefits.lifetime.yearsToRetirement} years
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {lifetimeBenefits.lifetime.yearsToRetirement} years
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">-</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                                Future Value
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-700">
                                ${clientData.futureCurrentValue.toLocaleString()}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-bold text-purple-700">
                                ${clientData.futureProposedValue.toLocaleString()}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-green-700 font-semibold">
                                +${(clientData.futureProposedValue - clientData.futureCurrentValue).toLocaleString()}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                                Transaction Costs
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                8% (~${Math.round(clientData.proposedHomeValue * 0.08).toLocaleString()})
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">-</td>
                            </tr>
                            <tr className="bg-green-50">
                              <td className="border border-gray-300 px-4 py-2 font-bold">Net Extra Wealth</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-bold text-green-700 text-lg">
                                ${clientData.extraWealth.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Key Insights */}
                        <div className="mt-4 space-y-3">
                          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                            <h4 className="font-bold text-purple-900 mb-2">Key Insight:</h4>
                            <p className="text-sm text-gray-700">
                              A reasonable assumed <strong>1.5% higher annual growth rate</strong> (3.5% vs 2.0%)
                              compounded over {lifetimeBenefits.lifetime.yearsToRetirement} years creates{" "}
                              <strong>
                                ${(clientData.futureProposedValue - clientData.futureCurrentValue).toLocaleString()} in
                                additional wealth
                              </strong>
                              , despite the higher purchase price and transaction costs.
                            </p>
                          </div>

                          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                            <h4 className="font-bold text-blue-900 mb-2">Formula:</h4>
                            <div className="text-sm text-gray-700 space-y-1 font-mono">
                              <div>Future Value = Present Value × (1 + Growth Rate)^Years</div>
                              <div>Extra Wealth = Future Upgraded Value - Future Current Value - Fees</div>
                            </div>
                          </div>

                          {/* Removed the "And the best part" div here as it's moved above */}

                          <div className="rounded-lg bg-green-50 border border-green-600 border-2 p-4">
                            <p className="text-sm text-gray-700">
                              <strong className="text-green-900">And the best part:</strong> Your net tax savings (yes,
                              that's correct—<em>after</em> our fees) pays for the extra interest on your mortgage in
                              order that you can afford to live there.
                            </p>
                            <p className="text-sm text-green-900 font-bold mt-2">
                              This is more money for you from thin air.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <p className="text-sm text-gray-700">
                      <strong>All opportunity calculations include fee deductions:</strong> Year 1 benefits reflect the
                      $14,520 implementation fee, and ongoing years reflect the $6,600 annual fee. These are your TRUE
                      net benefits—what you actually keep after all professional costs.
                    </p>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 border-2 border-red-500 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-red-900 mb-4">WARNING: OCCUPANCY COST ELIGIBILITY</h3>
                  <p className="text-sm text-slate-700">
                    You have identified substantial potential Occupancy deductions such as mortgage interest, etc
                    however, these are subject to strict ATO review! We understand that most home businesses don&apos;t
                    legally qualify for this specific deduction in which case, if you make such claims without passing
                    various tests, you'll be at high risk of audit and penalties. Of course in becoming a client, we
                    will carefully assess your situation and advise of any required adjustments.
                  </p>
                </div>

                {/* Limitations */}
                <div className="space-y-4 mt-8">
                  <h3 className="text-xl font-bold text-blue-900 uppercase">LIMITATIONS</h3>

                  <p className="text-slate-700">
                    This Decisive Action Report provides a preliminary snapshot of your potential tax savings and
                    identifies your recommended Deduct Your Home strategy. However, this overview represents only the
                    beginning of your wealth-building journey.
                  </p>

                  {/* CHANGE: Removed General Advice Warning from this location - moved to THREE EXAMPLE OPPORTUNITIES section */}

                  <h4 className="text-lg font-bold text-blue-900 mt-6">What You're Still Missing:</h4>

                  <p className="text-slate-700">
                    This Decisive Action Report cannot address critical implementation details that directly impact your
                    success:
                  </p>

                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Property-specific optimization strategies (your exact home layout, council requirements, zoning
                      considerations)
                    </li>
                    <li>
                      Business operational nuances (space requirements, client access, equipment storage for YOUR
                      industry)
                    </li>
                    <li>
                      "Combo" strategy opportunities (combining multiple Deduct Your Home approaches for maximum
                      benefit)
                    </li>
                    <li>
                      Alternative Arrangements for Co-Owners Wealth Builder (COWB) if applicable to your situation
                    </li>
                    <li>
                      Precise timing strategies to maximize cashflow and minimize tax payments THIS financial year
                    </li>
                    <li>Risk mitigation tailored to your personal circumstances and risk tolerance</li>
                    <li>Coordination with your accountant and other professional advisors</li>
                    <li>Detailed implementation roadmap with specific action steps and deadlines</li>
                    <li>Direct Registered Tax Agent consultation to address every nuance of your unique situation</li>
                    {/* CHANGE: Adding final bullet point about capital gains tax advice */}
                    <li>
                      Expert advice to minimise if not obliterate any capital gains tax that may one day arise upon
                      disposal of your home business property
                    </li>
                  </ul>

                  <h4 className="text-lg font-bold text-blue-900 mt-6">
                    Your comprehensive HOME BASED, BUSINESS &amp; TAXATION ADVICE document provides:
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Complete financial analysis with validated calculations for your exact property and business
                    </li>
                    <li>Strategy-specific implementation guidance you can act on immediately</li>
                    <li>Professional indemnity-backed advice from your dedicated Registered Tax Agent</li>
                    <li>Detailed documentation requirements for full audit protection</li>
                    <li>Ongoing legislative monitoring and strategy updates</li>
                    <li>Direct Registered Tax Agent consultation to address every nuance of your unique situation</li>
                  </ul>

                  <h4 className="text-lg font-bold text-blue-900 mt-6">Don&apos;t Leave Money on the Table:</h4>
                  <p className="text-slate-700">
                    The difference between a general overview and personalised implementation guidance can mean tens of
                    thousands of dollars in missed deductions, delayed benefits, or compliance issues. Your Registered
                    Tax Agent will ensure every dollar of legitimate deduction is claimed while maintaining full ATO
                    compliance.
                  </p>

                  <h4 className="text-lg font-bold text-blue-900 mt-6">Next Step:</h4>
                  <p className="text-slate-700">
                    Upgrade to your Full Final Report to receive the comprehensive analysis, validated calculations, and
                    professional Registered Tax Agent consultation needed to confidently implement your Deduct Your Home
                    strategy and start enhancing wealth and lifestyle through your home-based business.
                  </p>

                  <p className="text-xs text-slate-600 italic">
                    All advice provided by your Registered Tax Agent is covered by professional indemnity insurance and
                    based on intellectual property formally acknowledged by the Australian Taxation Office.
                  </p>
                </div>

                {/* Our Service */}
                <div className="space-y-6 mt-12">
                  <h3 className="text-2xl font-bold text-blue-900 uppercase">OUR SERVICE</h3>
                  <p className="font-semibold">Just giving you the numbers is NOT nearly enough!</p>
                  <p className="text-sm text-slate-700">
                    As your intended new accountant and registered tax agent, we verify your eligibility to ensure you
                    are legally entitled to claim everything only after which we&apos;ll prepare and lodge your tax
                    returns.
                  </p>
                  <p className="text-sm text-slate-700">
                    Of course we'll also take care of your Business Activity Statements if you are GST registered and
                    your Instalment Activity Statements which will likely also apply.
                  </p>
                  <p className="text-sm text-slate-700">
                    You also receive your comprehensive 42 page report entitled &quot;HOME BASED, BUSINESS &amp;
                    TAXATION ADVICE&quot;. This clearly spells it out for you and is so potent, that given to an ATO
                    auditor and providing you have followed it correctly, the chances of the audit coming to a
                    favourable and swift conclusion for you will be very high.
                  </p>
                  <p className="text-sm text-slate-700">
                    Our 20 years of rigorous research and development is smart-deployed so you efficiently receive our
                    high-value project output that yields you a superb Return on Investment coupled with unmatched peace
                    of mind!
                  </p>
                </div>

                {/* Phase 1 */}
                <div className="bg-blue-50 border-2 border-blue-500 p-6 rounded-lg space-y-4">
                  <h3 className="text-xl font-bold text-blue-900">
                    Phase 1: Home Business Strategy Launch (The Project)
                  </h3>
                  <p className="text-sm">This is the required first 12-month engagement where the investment covers:</p>
                  <ul className="list-disc list-inside text-sm space-y-2 text-slate-700">
                    <li>
                      <span className="font-semibold">Strategy & Goal Setting:</span> Dedicated time for deep
                      Onboarding, Goal Setting, and Strategy Refinement to ensure the {clientData.strategy} plan is
                      perfectly tailored to your business structure and property and to determine if a &quot;combo&quot;
                      of home business strategies is beneficial.
                    </li>
                    <li>
                      <span className="font-semibold">Deduction Implementation:</span> Verification and setup to secure
                      all deductions.
                    </li>
                    <li>
                      <span className="font-semibold">System Setup & Compliance:</span> Check/setup of bookkeeping
                      systems (BAS/IAS) required to support the business overall.
                    </li>
                    <li>
                      <span className="font-semibold">The Payoff:</span> Preparation and filing of your critical First
                      Year Tax Return, realising the full benefit of the specialist strategy, all whilst under cover of
                      us being Registered Tax Agents with both practice audit and professional indemnity liability
                      cover.
                    </li>
                  </ul>
                  <p className="text-sm text-slate-700">
                    Your investment entitles you to participate in Australia&apos;s only purpose-built, regulator
                    vetted, advanced, tried, tested and proven, home business wealth and lifestyle enhancement system.
                  </p>
                  <p className="text-sm text-slate-700">
                    Our 20 years of rigorous research and development is smart-deployed so you efficiently receive our
                    high-value project output that yields you a Return on Investment many times over.
                  </p>
                </div>

                {/* Phase 2 */}
                <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg space-y-4">
                  <h3 className="text-xl font-bold text-green-900">
                    Phase 2: Ongoing Specialist Protection (The Retainer)
                  </h3>
                  <p className="text-sm">
                    Your initial implementation is only the beginning as We must attend to your ongoing typical advisory
                    and compliance tasks regardless, simply in order to maintain your Audit-Proof position.
                  </p>
                  <div className="bg-white p-4 rounded border">
                    <p className="font-bold text-lg mb-2">
                      Investment: A fully tax deductible $220 every 30 days for first 12 periods, then $550 every 30
                      days thereafter
                    </p>
                    <ul className="text-sm space-y-2 text-slate-700">
                      <li>
                        <span className="font-semibold">Annual Tax Filing:</span> Preparation and filing of all
                        subsequent annual tax returns, maximizing your home-based claims while ensuring sustained ATO
                        compliance.
                      </li>
                      <li>
                        <span className="font-semibold">Specialist Advisory:</span> Ongoing access to Australia&apos;s
                        only specialist home business tax advisors for routine and ad-hoc advice for yourself and your
                        business throughout the year.
                      </li>
                      <li>
                        <span className="font-semibold">Routine Compliance:</span> Management and filing of your routine
                        BAS/IAS obligations.
                      </li>
                      <li>
                        <span className="font-semibold">Audit Shield:</span> You're protected by our Tax Agent Audit
                        Insurance Cover with ongoing review, helping to protect you against future risk.
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-slate-700">
                    Retain our specialist protection that includes taxation audit insurance, ensuring your valuable home
                    business strategy is safely maintained year after year in line with your other business bookkeeping,
                    accounting and taxation requirements.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="text-center space-y-4 py-8">
                  <h3 className="text-xl font-bold text-gray-900">
                    Act now to secure your ${clientData.totalDeductions.toLocaleString()} in deductions and get yourself
                    Set Up For Life!
                  </h3>
                  <p className="text-base font-semibold text-gray-900">We are Australia&apos;s Sole Specialist,</p>
                  <p className="text-base font-semibold text-gray-900">Home Business Tax Advisers!</p>

                  {/* Credentials List */}
                  <div className="space-y-1 text-sm text-gray-800 pt-4">
                    <p>Amazon #1 Bestseller</p>
                    <p>Registered Tax Agent</p>
                    <p>Institute of Public Accountants Member</p>
                    <p>National Tax And Accountants Association Member</p>
                    <p>ATO Cleared As Not An Illegal Tax Exploitation Scheme</p>
                    <p>ATO Part IV A Cleared As Not To Obtain An Illegal Tax Benefit</p>
                    <p>ATO Acknowledged Intellectual Property Fuelling Your Strategy</p>
                    <p>Tax Practitioners Board Acknowledged Experts Advising & Supporting You</p>
                  </div>

                  {/* Trust Badge Logos */}
                  <div className="pt-6 flex justify-center items-center">
                    <img
                      src="/images/trust-20badges.jpg"
                      alt="Trust badges, credentials and book promotion"
                      className="w-full max-w-[224px] sm:max-w-[280px] md:max-w-[336px] lg:max-w-[392px] xl:max-w-[403px] h-auto"
                    />
                  </div>
                </div>

                {/* Unlock Button */}
                <div className="text-center pb-8">
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white text-3xl px-18 py-9 inline-flex items-center gap-4 mx-auto"
                    >
                      UNLOCK YOUR DEDUCTIONS
                      <img
                        src="/open-padlock-unlocked-security-icon.jpg"
                        alt="Open padlock"
                        className="w-12 h-12 inline-block"
                      />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
