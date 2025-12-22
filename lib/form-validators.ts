export interface ValidationResult {
  isValid: boolean
  message?: string
  severity?: "error" | "warning" | "info"
}

export const validateNumericField = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number,
): ValidationResult => {
  if (!value || value.trim() === "") {
    return {
      isValid: false,
      message: `${fieldName} is required for accurate analysis`,
      severity: "error",
    }
  }

  const numValue = Number.parseFloat(value)
  if (isNaN(numValue)) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid number. Please enter digits only.`,
      severity: "error",
    }
  }

  if (min !== undefined && numValue < min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${min}`,
      severity: "error",
    }
  }

  if (max !== undefined && numValue > max) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed ${max}. Please verify your input.`,
      severity: "error",
    }
  }

  return { isValid: true }
}

export const validatePercentage = (value: string, fieldName: string): ValidationResult => {
  const result = validateNumericField(value, fieldName, 0, 100)
  if (!result.isValid) return result

  const numValue = Number.parseFloat(value)
  if (numValue === 0) {
    return {
      isValid: false,
      message: `${fieldName} cannot be 0%. If there's no business use, please explain in comments.`,
      severity: "warning",
    }
  }

  if (numValue > 90) {
    return {
      isValid: true,
      message: `${fieldName} is ${numValue}%. This is unusually high - please confirm this is accurate.`,
      severity: "info",
    }
  }

  return { isValid: true }
}

export const validateFloorSpace = (totalSqm: string, businessSqm: string): ValidationResult => {
  if (!totalSqm || !businessSqm) {
    return {
      isValid: false,
      message: "Both total floor space and business floor space are required for tax calculations",
      severity: "error",
    }
  }

  const total = Number.parseFloat(totalSqm)
  const business = Number.parseFloat(businessSqm)

  if (isNaN(total) || isNaN(business)) {
    return {
      isValid: false,
      message: "Floor space values must be valid numbers in square meters",
      severity: "error",
    }
  }

  if (business > total) {
    return {
      isValid: false,
      message: "Business floor space cannot exceed total floor space. Please check your measurements.",
      severity: "error",
    }
  }

  if (business === 0) {
    return {
      isValid: false,
      message: "Business floor space cannot be 0. Please measure your dedicated business area.",
      severity: "error",
    }
  }

  const percentage = (business / total) * 100
  if (percentage < 5) {
    return {
      isValid: true,
      message: `Business use is ${percentage.toFixed(1)}% of total space. This is quite small - ensure this is accurate.`,
      severity: "info",
    }
  }

  if (percentage > 50) {
    return {
      isValid: true,
      message: `Business use is ${percentage.toFixed(1)}% of total space. This may require additional documentation.`,
      severity: "info",
    }
  }

  return { isValid: true }
}

export const validateIncome = (value: string, fieldName: string): ValidationResult => {
  const result = validateNumericField(value, fieldName, 0)
  if (!result.isValid) return result

  const numValue = Number.parseFloat(value)

  if (numValue < 1000) {
    return {
      isValid: false,
      message: `${fieldName} of $${numValue} seems unusually low. Please verify or provide explanation in comments.`,
      severity: "warning",
    }
  }

  if (numValue > 1000000) {
    return {
      isValid: true,
      message: `${fieldName} exceeds $1M. Additional tax strategies may be available - we'll review this.`,
      severity: "info",
    }
  }

  return { isValid: true }
}

export const validateYesNoField = (value: string, fieldName: string): ValidationResult => {
  if (!value || (value !== "YES" && value !== "NO")) {
    return {
      isValid: false,
      message: `${fieldName} requires a YES or NO answer for strategy determination`,
      severity: "error",
    }
  }
  return { isValid: true }
}

export const validateBuildingValue = (value: string): ValidationResult => {
  const result = validateNumericField(value, "Building value", 1000)
  if (!result.isValid) return result

  const numValue = Number.parseFloat(value)

  if (numValue < 50000) {
    return {
      isValid: false,
      message: "Building value seems unusually low. Please provide current market value or replacement cost.",
      severity: "warning",
    }
  }

  return { isValid: true }
}

export const validateExpenseAmount = (value: string, expenseName: string): ValidationResult => {
  if (!value || value.trim() === "") {
    return {
      isValid: true, // Optional expense
      message: `${expenseName} not provided. If this expense exists, please add it for accurate calculations.`,
      severity: "info",
    }
  }

  const result = validateNumericField(value, expenseName, 0)
  return result
}

export const validateBusinessUsePercentage = (internetPct: string, phonePct: string): ValidationResult => {
  if (!internetPct && !phonePct) {
    return {
      isValid: false,
      message:
        "Internet and phone business use percentages are required. Review a 30-day bill to determine business usage.",
      severity: "error",
    }
  }

  if (!internetPct) {
    return {
      isValid: false,
      message: "Internet business use percentage is required. Check your 30-day bill for business vs personal usage.",
      severity: "error",
    }
  }

  if (!phonePct) {
    return {
      isValid: false,
      message: "Phone business use percentage is required. Check your 30-day bill for business vs personal usage.",
      severity: "error",
    }
  }

  const internetResult = validatePercentage(internetPct, "Internet business use")
  if (!internetResult.isValid) return internetResult

  const phoneResult = validatePercentage(phonePct, "Phone business use")
  if (!phoneResult.isValid) return phoneResult

  return { isValid: true }
}
