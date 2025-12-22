import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calculator, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 text-balance">Home Business Wealth and Lifestyle Optimiser</h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Unlike anything else in existence, this allows you to optimise your home business tax deductions as you
            enhance your business and personal wealth and your lifestyle with confidence. Receive ATO-compliant
            calculations based on the latest guidance from our Amazon Number 1 best selling book "Deduct Your Home", in
            tandem with private ATO correspondence addressed to us and to our founder.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Calculator className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Smart Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically calculate deductions using fixed rate or actual cost method
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>ATO Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Generate documents that meet ATO requirements and guidelines</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Secure Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Safely store receipts, photos, and confidential documents</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Save Time</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Complete your assessment in minutes with our guided questionnaire</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </span>
                  Answer Simple Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete our guided questionnaire about your home office setup and expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </span>
                  Upload Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Add photos of your home office and receipts for expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </span>
                  Get Your Deduction Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive ATO-compliant calculations and documentation for your tax return
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">For Registered Tax Agents</CardTitle>
              <CardDescription>Access advanced features and manage multiple clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">Sign Up as Tax Agent</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
