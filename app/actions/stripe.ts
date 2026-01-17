"use server"

import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function startCheckoutSession(productId: string, questionnaireId?: string): Promise<string> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: productId,
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "embedded",
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/demo/final-report?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      user_id: user.id,
      questionnaire_id: questionnaireId || "",
    },
  })

  return session.client_secret!
}
