import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function POST(request: Request) {
  try {
    const { phase1Option } = await request.json()

    if (!phase1Option) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    if (phase1Option === "upfront") {
      // Phase 1 upfront payment: $6,600
      lineItems.push({
        price: "price_1SlkWMIuAUxn9QfxZ8OOsMy0",
        quantity: 1,
      })
    } else if (phase1Option === "installment") {
      // Phase 1 monthly payment: $660/month for 12 months
      lineItems.push({
        price: "price_1SlkaGIuAUxn9Qfxf8PlsCvq",
        quantity: 1,
      })
    }

    // Phase 2 first monthly payment: $220
    lineItems.push({
      price: "price_1SlkcKIuAUxn9QfxeMBLllSZ",
      quantity: 1,
    })

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/pricing?canceled=true`,
      metadata: {
        phase1_option: phase1Option,
        phase: "initial_payment",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    )
  }
}
