import { SecurityDashboard } from '@/components/security-dashboard'

export default function SecurityPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Monitor data access, audit trails, and security features
        </p>
      </div>

      <SecurityDashboard />
    </div>
  )
}
