/**
 * DYH Explorer Integration Helper
 *
 * Copy this file to your DYH Explorer workspace and use these functions
 * to integrate with Practice Manager.
 *
 * Required Environment Variables in DYH Explorer:
 * - PRACTICE_MGR_URL=https://your-practice-manager.vercel.app
 * - PRACTICE_MGR_API_KEY=your-shared-secret-key
 */

const PRACTICE_MGR_URL = process.env.PRACTICE_MGR_URL || "http://localhost:3000"
const API_KEY = process.env.PRACTICE_MGR_API_KEY || "practice-mgr-secret-key"

export interface ProspectData {
  client_email: string
  client_name: string
  phone?: string
  questionnaire_data: any
}

export interface MigrationData {
  client_email: string
  purchase_data: {
    stripe_payment_id?: string
    amount: number
    report_type: string
    purchased_at: string
  }
}

export interface SubmissionData {
  client_email: string
  client_name?: string
  questionnaire_type?: string
  questionnaire_data: any
  completed_at?: string
}

/**
 * Send prospect data to Practice Manager when a client completes a questionnaire
 * Call this after Quick Questionnaire or Strategy Selector completion
 */
export async function syncProspectToPracticeMgr(data: ProspectData) {
  try {
    const response = await fetch(`${PRACTICE_MGR_URL}/api/prospects/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        api_key: API_KEY,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to sync prospect")
    }

    return await response.json()
  } catch (error) {
    console.error("[DYH] Failed to sync prospect to Practice Manager:", error)
    throw error
  }
}

/**
 * Migrate prospect to client when Final Report is purchased
 * Call this in your Stripe webhook or purchase success handler
 */
export async function migrateToClient(data: MigrationData) {
  try {
    const response = await fetch(`${PRACTICE_MGR_URL}/api/prospects/migrate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        api_key: API_KEY,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to migrate client")
    }

    return await response.json()
  } catch (error) {
    console.error("[DYH] Failed to migrate client:", error)
    throw error
  }
}

/**
 * Sync form submission to Practice Manager for admin viewing
 * Call this after any questionnaire completion
 */
export async function syncFormSubmission(data: SubmissionData) {
  try {
    const response = await fetch(`${PRACTICE_MGR_URL}/api/submissions/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        api_key: API_KEY,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to sync submission")
    }

    return await response.json()
  } catch (error) {
    console.error("[DYH] Failed to sync form submission:", error)
    throw error
  }
}

/**
 * Check Practice Manager health status
 * Use this to verify connectivity before syncing data
 */
export async function checkPracticeMgrHealth() {
  try {
    const response = await fetch(`${PRACTICE_MGR_URL}/api/health`)

    if (!response.ok) {
      return { status: "unreachable", healthy: false }
    }

    const health = await response.json()
    return { ...health, healthy: health.status === "healthy" }
  } catch (error) {
    console.error("[DYH] Failed to check Practice Manager health:", error)
    return { status: "unreachable", healthy: false, error }
  }
}

/**
 * Example usage in DYH Explorer after questionnaire completion:
 *
 * import { syncProspectToPracticeMgr, syncFormSubmission } from '@/lib/dyh-integration-helper'
 *
 * async function handleQuestionnaireSubmit(formData) {
 *   // Save to DYH Explorer database first
 *   const submission = await saveToDatabase(formData)
 *
 *   // Then sync to Practice Manager
 *   try {
 *     await Promise.all([
 *       syncProspectToPracticeMgr({
 *         client_email: formData.email,
 *         client_name: formData.name,
 *         phone: formData.phone,
 *         questionnaire_data: formData
 *       }),
 *       syncFormSubmission({
 *         client_email: formData.email,
 *         client_name: formData.name,
 *         questionnaire_type: 'quick_questionnaire',
 *         questionnaire_data: formData,
 *         completed_at: new Date().toISOString()
 *       })
 *     ])
 *   } catch (error) {
 *     console.error('Failed to sync to Practice Manager:', error)
 *     // Continue with DYH Explorer flow - Practice Manager sync is non-critical
 *   }
 * }
 *
 * // In your Stripe success webhook:
 * async function handleFinalReportPurchase(session) {
 *   await migrateToClient({
 *     client_email: session.customer_email,
 *     purchase_data: {
 *       stripe_payment_id: session.payment_intent,
 *       amount: session.amount_total / 100,
 *       report_type: 'final_report',
 *       purchased_at: new Date().toISOString()
 *     }
 *   })
 * }
 */
