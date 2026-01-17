import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, phase1Option } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!phase1Option || !["upfront", "installment"].includes(phase1Option)) {
      return NextResponse.json({ error: "Valid phase1Option is required" }, { status: 400 })
    }

    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    let customerId: string
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: email,
      })
      customerId = customer.id
    }

    const lineItems: Array<{
      price_data: {
        currency: string
        product_data: {
          name: string
          description: string
        }
        unit_amount: number
        recurring?: {
          interval: string
          interval_count: number
        }
      }
      quantity: number
    }> = []

    if (phase1Option === "upfront") {
      // Phase 1 Upfront: $6,600 one-time payment
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Phase 1 - Deduct Your Home Discovery and Implementation Fee (Upfront)",
            description: "Complete home business tax optimization setup",
          },
          unit_amount: 660000, // $6,600 in cents
        },
        quantity: 1,
      })

      // Phase 2: $220/month for 12 months, then $550/month thereafter
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Phase 2 - Ongoing Priority Service Access Fee",
            description: "Priority access to tax advisors and ongoing strategy updates",
          },
          unit_amount: 22000, // $220 in cents
          recurring: {
            interval: "month",
            interval_count: 1,
          },
        },
        quantity: 1,
      })
    } else {
      // Phase 1 Installment: $660/month for 12 months
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Phase 1 - Deduct Your Home Discovery and Implementation Fee (Installment)",
            description: "Complete home business tax optimization setup - 12 monthly payments",
          },
          unit_amount: 66000, // $660 in cents
          recurring: {
            interval: "month",
            interval_count: 1,
          },
        },
        quantity: 1,
      })

      // Phase 2: $220/month for 12 months
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Phase 2 - Ongoing Priority Service Access Fee",
            description: "Priority access to tax advisors and ongoing strategy updates",
          },
          unit_amount: 22000, // $220 in cents
          recurring: {
            interval: "month",
            interval_count: 1,
          },
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: phase1Option === "upfront" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        email: email,
        phase1Option: phase1Option,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
