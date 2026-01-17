import { createClient } from "@/lib/supabase/client"

// Generate a readable 8-character password (e.g., "AB12-CD34")
export function generateSessionPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing chars
  let password = ""
  for (let i = 0; i < 8; i++) {
    if (i === 4) {
      password += "-"
    } else {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  return password
}

export interface FormSession {
  id: string
  session_token: string
  email: string
  questionnaire_type: string
  form_data: Record<string, any>
  current_step: number
  status: string
  created_at: string
  last_accessed: string
  expires_at: string
}

export async function saveFormSession(
  email: string,
  questionnaireType: string,
  formData: Record<string, any>,
  currentStep: number,
  existingToken?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const supabase = createClient()
    const token = existingToken || generateSessionPassword()

    if (existingToken) {
      // Update existing session
      const { error } = await supabase
        .from("form_sessions")
        .update({
          form_data: formData,
          current_step: currentStep,
          last_accessed: new Date().toISOString(),
        })
        .eq("session_token", existingToken)

      if (error) throw error
    } else {
      // Create new session
      const { error } = await supabase.from("form_sessions").insert({
        session_token: token,
        email,
        questionnaire_type: questionnaireType,
        form_data: formData,
        current_step: currentStep,
      })

      if (error) throw error
    }

    return { success: true, token }
  } catch (error) {
    console.error("[v0] Error saving form session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save session",
    }
  }
}

export async function loadFormSession(token: string): Promise<{
  success: boolean
  session?: FormSession
  error?: string
}> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("form_sessions")
      .select("*")
      .eq("session_token", token.toUpperCase())
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "No saved session found with this code. Please check your code and try again." }
      }
      throw error
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: "This session has expired (30 days). Please start a new questionnaire." }
    }

    // Update last accessed
    await supabase
      .from("form_sessions")
      .update({
        last_accessed: new Date().toISOString(),
        status: "resumed",
      })
      .eq("session_token", token.toUpperCase())

    return { success: true, session: data }
  } catch (error) {
    console.error("[v0] Error loading form session:", error)
    return {
      success: false,
      error: "Unable to load session. Please try again or contact support if the problem persists.",
    }
  }
}

export async function deleteFormSession(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("form_sessions").delete().eq("session_token", token.toUpperCase())

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting form session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete session",
    }
  }
}
