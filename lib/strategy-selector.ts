export interface StrategyMatch {
  name: string
  description: string
  matchPattern: number[]
}

// Table 2: DYH Strategy Decision Tree
export const STRATEGY_PATTERNS: StrategyMatch[] = [
  {
    name: "Small Business Re-Birth (i)",
    description: "Sell An Active Business Asset/s & Buy A Home To Live In & From Where To Start a Business.",
    matchPattern: [3, 15, 16, 40],
  },
  {
    name: "Small Business Re-Birth (ii)",
    description: "Sell An Active Business Asset/s & Stay In Current Purchased Home & Start a Business From There.",
    matchPattern: [3, 13, 15, 16, 40],
  },
  {
    name: "Small Business Re-Birth (iii)",
    description:
      "Sell An Active Business Asset/s & Stay In Current Purchased Home, Extend It & Start a Business From There.",
    matchPattern: [3, 13, 16, 40],
  },
  {
    name: "Small Business Re-Birth (iv)",
    description:
      "Sell An Active Business Asset/s & Upgrade To A Better Home/Better Area To Live In & From Where To Start a Business.",
    matchPattern: [3, 13, 15, 40],
  },
  {
    name: "Twist Exist Re-Structure (i)",
    description: "Stop Renting & Buy A Home To Live In & From Where To Continue Your Existing Home-Based Business.",
    matchPattern: [15, 16, 26, 40],
  },
  {
    name: "Twist Exist Re-Structure (ii)",
    description: "Stay In Current Purchased Home & Continue Running Your Existing Home-Based Business From There.",
    matchPattern: [13, 15, 16, 26, 40],
  },
  {
    name: "Twist Exist Re-Structure (iii)",
    description:
      "Stay In Current Purchased Home, Extend It & Continue Running Your Existing Home-Based Business From There.",
    matchPattern: [13, 16, 26, 40],
  },
  {
    name: "Twist Exist Re-Structure (iv)",
    description: "Upgrade To A Better Home/Better Area To Live In & To Run Your Existing Home-Based Business From.",
    matchPattern: [13, 15, 26, 40],
  },
  {
    name: "Home Business Re-Structure (i)",
    description: "Buy A Home To Live In & From Where To Start a Business.",
    matchPattern: [3, 15, 16, 26, 40],
  },
  {
    name: "Home Business Re-Structure (ii)",
    description: "Keep Living In Current Purchased Home & Start a Business.",
    matchPattern: [3, 13, 15, 16, 26, 40],
  },
  {
    name: "Home Business Re-Structure (iii)",
    description: "Stay In Current Purchased Home, Extend It & Start a Business From There.",
    matchPattern: [3, 13, 16, 26, 40],
  },
  {
    name: "Home Business Re-Structure (iv)",
    description:
      "An Existing Purchaser's Upgrade To A Better Home/Better Area To Live In & From Where To Start a Business.",
    matchPattern: [3, 13, 15, 26, 40],
  },
  {
    name: "Small Business Lease Buster (i)",
    description: "Initially Buy A Home To Live In & From Where To Start a Business.",
    matchPattern: [3, 15, 16, 26],
  },
  {
    name: "Small Business Lease Buster (ii)",
    description: "Keep Living In Current Purchased Home & Start a Business From There.",
    matchPattern: [3, 13, 15, 16, 26],
  },
  {
    name: "Small Business Lease Buster (iii)",
    description: "Stay In Current Purchased Home, Extend It & Start a Business From There.",
    matchPattern: [3, 13, 16, 26],
  },
  {
    name: "Small Business Lease Buster (iv)",
    description:
      "An Existing Purchaser's Upgrade To A Better Home/Better Area To Live In & From Where To Start a Business.",
    matchPattern: [3, 13, 15, 26],
  },
]

/**
 * Determines the recommended DYH Strategy based on "NO" answers from the questionnaire
 * @param noAnswers - Array of question numbers where the answer was "No"
 * @returns The matching strategy or null if no match found
 */
export function determineStrategy(noAnswers: number[]): StrategyMatch | null {
  // Sort both arrays for accurate comparison
  const sortedNoAnswers = [...noAnswers].sort((a, b) => a - b)

  // Find exact match
  for (const strategy of STRATEGY_PATTERNS) {
    const sortedPattern = [...strategy.matchPattern].sort((a, b) => a - b)

    // Check if arrays are identical
    if (arraysEqual(sortedNoAnswers, sortedPattern)) {
      return strategy
    }
  }

  return null
}

/**
 * Helper function to compare two arrays for equality
 */
function arraysEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }

  return true
}

/**
 * Gets all "NO" answer question numbers from questionnaire responses
 * Starting from Q3 as per instructions
 */
export function extractNoAnswers(responses: Record<string, any>): number[] {
  const noAnswers: number[] = []

  // Questions that have Yes/No answers (starting from Q3)
  const yesNoQuestions = [3, 13, 15, 16, 26, 40]

  for (const qNum of yesNoQuestions) {
    const key = `ss_q${qNum}`
    if (responses[key] === "no") {
      noAnswers.push(qNum)
    }
  }

  return noAnswers
}
