"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, AlertCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { DEMO_CLIENTS } from "@/lib/demo-clients"
import { PRODUCTS } from "@/lib/products"
import Checkout from "@/components/checkout"
import { createBrowserClient } from "@/lib/supabase/client"
import { MainNav } from "@/components/main-nav"

const DEMO_CLIENTS_ARRAY = Object.values(DEMO_CLIENTS)

export default function FinalReportDemoPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(DEMO_CLIENTS_ARRAY[0].id)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function checkExistingPurchase() {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsCheckingPurchase(false)
          return
        }

        if (user.user_metadata?.is_admin === true) {
          setIsAdmin(true)
        }

        const { data: purchases, error } = await supabase
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .limit(1)

        if (!error && purchases && purchases.length > 0) {
          setHasPurchased(true)
        }
      } catch (err) {
        console.error("[v0] Error checking purchase:", err)
      } finally {
        setIsCheckingPurchase(false)
      }
    }

    checkExistingPurchase()
  }, [])

  const handleDownloadReport = async () => {
    if (!isAdmin) {
      alert("Admin access required to download reports.")
      return
    }

    if (!selectedQuestionnaire) {
      setError("Please select a client to generate report")
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsGenerating(true)
    setError(null)

    try {
      const selectedClient = DEMO_CLIENTS_ARRAY.find((q) => q.id === selectedQuestionnaire)
      if (!selectedClient) {
        throw new Error("Client not found")
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 90000)
      timeoutRef.current = timeoutId

      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionnaire1: selectedClient,
            questionnaire2: {},
          }),
          signal: controller.signal,
        })

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        if (!response.ok) {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            throw new Error(errorData.error || errorData.details || "Failed to generate report")
          } else {
            const errorText = await response.text()
            throw new Error(errorText || "Failed to generate report")
          }
        }

        const blob = await response.blob()
        const contentType = response.headers.get("Content-Type")
        const isPdf = contentType?.includes("application/pdf")
        const extension = isPdf ? "pdf" : "docx"
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedClient.client_name}_Report_${new Date().toISOString().split("T")[0]}.${extension}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setError("Request timed out after 90 seconds. Please try again.")
      } else {
        setError(error.message || "Could not generate report")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const currentQuestionnaire = DEMO_CLIENTS_ARRAY.find((q) => q.id === selectedQuestionnaire)

  if (showCheckout && selectedProduct) {
    const product = PRODUCTS.find((p) => p.id === selectedProduct)
    return (
      <>
        <MainNav />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setShowCheckout(false)} className="mb-4">
              ← Back to Reports
            </Button>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{product?.name}</CardTitle>
                <CardDescription>{product?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {product?.upfrontPriceInCents ? (
                  <div className="space-y-2 mb-4">
                    <div className="text-xl font-bold text-muted-foreground">
                      Upfront: ${(product.upfrontPriceInCents / 100).toLocaleString()}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      ${(product.priceInCents / 100).toFixed(2)} every 30 days
                    </div>
                    {product.recurringPeriods && (
                      <p className="text-sm text-muted-foreground">for {product.recurringPeriods} periods</p>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl font-bold mb-4">${(product.priceInCents / 100).toFixed(2)}</div>
                )}
                {product?.features && (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Checkout productId={selectedProduct} questionnaireId={selectedQuestionnaire || undefined} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MainNav />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">HOME BASED, BUSINESS & TAXATION ADVICE</h1>
            <p className="text-muted-foreground">
              Final client report with methodology comparison and tax deduction analysis
            </p>
          </div>

          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-2xl text-green-900">Decisive Action Report (Sales Version)</CardTitle>
              <CardDescription className="text-green-700">
                Download the sales-focused decisive action report with deduction totals, method comparison, and pricing
                info. These reports include "UNLOCK YOUR DEDUCTIONS" links with pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                {DEMO_CLIENTS_ARRAY.map((client) => (
                  <Button
                    key={client.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setSelectedQuestionnaire(client.id)}
                  >
                    {client.client_name} (Demo {DEMO_CLIENTS_ARRAY.indexOf(client) + 1})
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Each DAR includes pricing information and "UNLOCK YOUR DEDUCTIONS" links that direct clients to purchase
                packages.
              </p>

              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleDownloadReport}
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled={isGenerating || !selectedQuestionnaire || !isAdmin}
                >
                  <Download className="h-4 w-4" />
                  {isGenerating
                    ? "Generating DAR..."
                    : isAdmin
                      ? "Download Decisive Action Report (Admin Only)"
                      : "Download Decisive Action Report (Admin Access Required)"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">
                Available <span className="text-primary">"Deduct Your Home"</span> Strategies
              </CardTitle>
              <CardDescription>
                There are 20 possible Strategies that can operate as either a sole trader/partnership or as a company,
                making up 40 possible outcomes (2 x 20).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* SBRS Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-teal-700">SBRS - Small Business Re-Birth</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Variant</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Match "NO" Answers</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">SBRS (i)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Sell An Active Business Asset/s & Buy A{" "}
                            <span className="text-primary font-semibold">Home</span> To Live In & From Where To Start a
                            Business
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            3, 15, 16, 41
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">SBRS (ii)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Sell An Active Business Asset/s & Stay In Current Purchased{" "}
                            <span className="text-primary font-semibold">Home</span> & Start a Business From There
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            3, 13, 15, 16, 41
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">SBRS (iii)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Sell An Active Business Asset/s & Stay In Current Purchased{" "}
                            <span className="text-primary font-semibold">Home</span>, Extend It & Start a Business From
                            There
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            3, 13, 16, 41
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">SBRS (iv)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Sell An Active Business Asset/s & Upgrade To A Better{" "}
                            <span className="text-primary font-semibold">Home</span>/Better Area To Live In & From Where
                            To Start a Business
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            3, 13, 15, 41
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TERS Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-700">TERS - Twist Exist Re-Structure</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Variant</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Match "NO" Answers</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">TERS (i)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Stay In Current Purchased <span className="text-primary font-semibold">Home</span> & Start
                            or Continue a Business From There
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            1, 13, 15, 16, 41
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">TERS (ii)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Stay In Current Purchased <span className="text-primary font-semibold">Home</span>, Extend
                            It & Start or Continue a Business From There
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            1, 13, 16, 41
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">TERS (iii)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Upgrade To A Better <span className="text-primary font-semibold">Home</span>/Better Area To
                            Live In & From Where To Start or Continue a Business
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            1, 13, 15, 41
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-mono text-xs">TERS (iv)</td>
                          <td className="border border-gray-300 px-4 py-2">
                            Buy A <span className="text-primary font-semibold">Home</span> To Live In & From Where To
                            Start or Continue a Business
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-mono text-xs">
                            1, 15, 16, 41
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add more strategy tables as needed - HBRS, SELB, STAY */}
                <div className="text-sm text-muted-foreground italic mt-4">
                  Additional strategies: HBRS (Home Business Re-Structure), SELB (Small Business Lease Buster), STAY
                  (Home Business Re-Structure: Stay & Start), and more are available in the full report.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Final Report Preview
              </CardTitle>
              <CardDescription>
                This report includes all sections: Executive Summary, Strategy Selector Analysis, Expense Comparisons,
                Tax Calculations, Recommendations, Hints & Tips, and Next Steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3>Report Contents:</h3>
                <ol>
                  <li>
                    <strong>Table of Contents</strong>
                  </li>
                  <li>
                    <strong>Executive Summary</strong> - Overview of client situation and key findings
                  </li>
                  <li>
                    <strong>DYH Strategy Selector Analysis</strong> - Determined procedure and rationale
                  </li>
                  <li>
                    <strong>Property & Running Expenses</strong> - Detailed breakdown with comparisons
                  </li>
                  <li>
                    <strong>Tax Calculation Methods</strong> - Actual Cost vs Fixed Rate comparison
                  </li>
                  <li>
                    <strong>Recommended Strategy</strong> - Optimal approach with compliance requirements
                  </li>
                  <li>
                    <strong>Hints and Tips</strong> - Comprehensive guidance from Strategy Selector
                  </li>
                  <li>
                    <strong>Implementation Steps</strong> - Clear next actions for the client
                  </li>
                  <li>
                    <strong>Appendices</strong> - Supporting documentation and references
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Select Client:</h4>
                <div className="flex flex-wrap gap-3">
                  {DEMO_CLIENTS_ARRAY.map((q) => (
                    <Button
                      key={q.id}
                      variant={selectedQuestionnaire === q.id ? "default" : "outline"}
                      onClick={() => setSelectedQuestionnaire(q.id)}
                    >
                      {q.client_name || "Unnamed Client"}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
