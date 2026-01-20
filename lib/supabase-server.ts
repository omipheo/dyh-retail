import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that returns empty data instead of crashing
    return {
      from: () => ({
        select: () => ({
          order: () => ({
            eq: () => Promise.resolve({ data: null, error: { message: "Supabase not connected. Please add the Supabase integration." } }),
          }),
          eq: () => Promise.resolve({ data: null, error: { message: "Supabase not connected. Please add the Supabase integration." } }),
        }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }) }),
        upsert: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      _isDisconnected: true,
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
