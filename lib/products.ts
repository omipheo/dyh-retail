export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features?: string[]
  recurringPriceInCents?: number
  recurringInterval?: string
  recurringPeriods?: number
  upfrontPriceInCents?: number
}

// Product catalog for Deduct Your Home services
export const PRODUCTS: Product[] = [
  {
    id: "phase-1",
    name: "Phase 1 - Deduct Your Home Discovery and Implementation",
    description: "Complete Home Office Tax Strategy with ongoing support for 12 months",
    upfrontPriceInCents: 660000, // $6,600 upfront
    priceInCents: 66000, // $660 every 30 days
    recurringPriceInCents: 66000, // $660
    recurringInterval: "30 days",
    recurringPeriods: 12,
    features: [
      "Complete Home Office Tax Strategy",
      "Deduction Implementation Guide",
      "ATO Compliance Documentation",
      "System Setup & Record Keeping",
      "$6,600 upfront + $660 every 30 days for 12 periods",
    ],
  },
  {
    id: "phase-2",
    name: "Phase 2 - Ongoing Priority Service Access",
    description: "Priority access to tax advisors with ongoing strategy updates",
    priceInCents: 22000, // $220 every 30 days for first 12 periods
    recurringPriceInCents: 55000, // then $550 every 30 days thereafter
    recurringInterval: "30 days",
    recurringPeriods: 12,
    features: [
      "Priority Access to Tax Advisors",
      "Ongoing Strategy Updates",
      "Annual Review & Optimization",
      "Quarterly Tax Planning Sessions",
      "$220 every 30 days for first 12 periods, then $550/period",
    ],
  },
  {
    id: "full-package",
    name: "Complete Package (Phase 1 + Phase 2)",
    description: "Start with Phase 1, then continue to Phase 2 for ongoing support",
    priceInCents: 88000, // $880 due today ($660 + $220)
    upfrontPriceInCents: 660000, // $6,600 upfront for Phase 1
    features: [
      "All Phase 1 Features",
      "All Phase 2 Features",
      "Due today: $880 (Phase 1 $660 + Phase 2 $220)",
      "After 12 periods, Phase 2 continues at $550/period",
    ],
  },
]
