import { createBrowserClient as supabaseCreateBrowserClient } from "@supabase/ssr"

// Export the createBrowserClient function for direct use
export function createBrowserClient(url: string, key: string) {
  return supabaseCreateBrowserClient(url, key)
}

// Convenience function that uses environment variables
export function createClient() {
  return supabaseCreateBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
