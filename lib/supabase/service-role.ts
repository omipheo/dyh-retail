import { createClient } from "@supabase/supabase-js"

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log("[v0] Creating service role client")
  console.log("[v0] URL:", supabaseUrl)
  console.log("[v0] Service key exists:", !!supabaseServiceKey)
  console.log("[v0] Service key starts with:", supabaseServiceKey?.substring(0, 20))

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getServiceRoleClient = createServiceRoleClient
