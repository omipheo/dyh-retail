"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const [phase1Option, setPhase1Option] = useState<"upfront" | "installment">("installment")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const calculateTotal = () => {
    const phase1Amount = phase1Option === "upfront" ? 6600 : 660
    const phase2Amount = 220
    return phase1Amount + phase2Amount
  }

  const handleCheckout = async () => {
    setError("")

    if (!agreedToTerms) {
      setError("You must agree to the Terms and Conditions and Privacy Policy to continue.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phase1Option,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Green Header */}
      <div className="bg-green-600 py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">UNLOCK YOUR DEDUCTIONS</h1>
        <p className="text-lg md:text-xl text-white max-w-3xl mx-auto">
          Subscribe to Australia's ONLY specialist home business tax advisory service
        </p>
      </div>

      {/* Fees Section */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-green-600 mb-6">Fees (GST inclusive)</h2>

          {/* Phase 1 - Added radio buttons for selection */}
          <div className="mb-6 border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-4">
              <span className="text-green-600 mt-1">📅</span>
              <h2 className="font-semibold text-gray-900">
                Phase 1 - Deduct Your Home Discovery and Implementation Fee:
              </h2>
            </div>
            <div className="ml-6 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="phase1"
                  value="upfront"
                  checked={phase1Option === "upfront"}
                  onChange={(e) => setPhase1Option(e.target.value as "upfront")}
                  className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-lg">$6,600</span>
                  <span className="text-gray-600">upfront</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="phase1"
                  value="installment"
                  checked={phase1Option === "installment"}
                  onChange={(e) => setPhase1Option(e.target.value as "installment")}
                  className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-lg">$660</span>
                  <span className="text-gray-600">every 30 days for 12 x consecutive 30-day periods</span>
                </div>
              </label>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="mb-6">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-blue-600 mt-1">➤</span>
              <h2 className="font-semibold text-blue-600">Phase 2 - Ongoing Priority Service Access Fee:</h2>
            </div>
            <div className="ml-6 space-y-2">
              <div>
                <span className="text-green-600 font-semibold">$220</span>
                <span className="text-gray-600"> every 30 days for first 12 periods</span>
              </div>
              <div>
                <span className="text-gray-600">then </span>
                <span className="text-green-600 font-semibold">$550</span>
                <span className="text-gray-600"> every 30 days thereafter</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* What's Included Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">What's Included</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Phase 1 Includes */}
            <div>
              <h3 className="text-green-600 font-semibold mb-4">Phase 1 Includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Complete Home Business Tax Strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Deduction Implementation Guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">ATO Compliance Documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">System Setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">
                    Analysis of Property Photos and or Floor Plans to Expertly Guide you
                  </span>
                </li>
              </ul>
            </div>

            {/* Phase 2 Includes */}
            <div>
              <h3 className="text-blue-600 font-semibold mb-4">Phase 2 Includes:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Priority Access to Tax Advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Ongoing Strategy Updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Annual Review & Optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Quarterly Tax Planning Sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-sm text-gray-700">Ongoing Taxation Compliance Services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Payment Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Start with Phase 1, then continue to Phase 2</h3>

          {/* Due Today - Dynamic calculation based on selected option */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Due today:</span>
              <span className="text-3xl font-bold text-green-600">${calculateTotal()}</span>
            </div>
            <p className="text-sm text-gray-600">
              {phase1Option === "upfront"
                ? `Phase 1 ($6,600 upfront) + Phase 2 ($220) = $${calculateTotal()} today, then $220 every 30 days for 11 more periods. After 12 periods, Phase 2 continues at $550/period.`
                : `Phase 1 ($660) + Phase 2 ($220) = $${calculateTotal()} every 30 days for 12 periods. After 12 periods, Phase 1 ends and Phase 2 continues at $550/period.`}
            </p>
          </div>

          {/* Terms Checkbox - Added state management */}
          <div className="mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked)
                  setError("") // Clear error when user checks box
                }}
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-blue-600 underline" rel="noreferrer">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="text-blue-600 underline" rel="noreferrer">
                  Privacy Policy
                </a>
                . I understand this is a recurring subscription that will be charged every 30 days.
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Unlock Button - Integrated with Stripe checkout */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg text-lg transition-colors"
          >
            {isLoading ? "Processing..." : "UNLOCK YOUR DEDUCTIONS"}
          </button>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Credentials List */}
        <div className="text-center">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Amazon #1 Bestseller</li>
            <li>• Registered Tax Agent</li>
            <li>• Institute of Public Accountants Member</li>
            <li>• National Tax And Accountants Association Member</li>
            <li>• ATO Cleared As Not An Illegal Tax Exploitation Scheme</li>
            <li>• ATO Part IV A Cleared As Not To Obtain An Illegal Tax Benefit</li>
            <li>• ATO Acknowledged Intellectual Property Fuelling Your Strategy</li>
            <li>• Tax Practitioners Board Acknowledged Experts Advising & Supporting You</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
