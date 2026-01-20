"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import type { ValidationResult } from "@/lib/form-validators"
import { useState } from "react"

interface ValidatedInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  validator?: (value: string) => ValidationResult
  type?: "text" | "number" | "email"
  placeholder?: string
  helpText?: string
  required?: boolean
}

export function ValidatedInput({
  label,
  value,
  onChange,
  validator,
  type = "text",
  placeholder,
  helpText,
  required = false,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleBlur = () => {
    setTouched(true)
    if (validator) {
      const result = validator(value)
      setValidationResult(result)
    }
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
    // Clear validation on change to avoid annoying red messages while typing
    if (touched && validationResult && !validationResult.isValid) {
      setValidationResult(null)
    }
  }

  const showValidation = touched && validationResult && (!validationResult.isValid || validationResult.message)

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={showValidation && !validationResult?.isValid ? "border-destructive" : ""}
      />

      {helpText && !showValidation && <p className="text-sm text-muted-foreground">{helpText}</p>}

      {showValidation && validationResult && (
        <Alert
          variant={validationResult.severity === "error" ? "destructive" : "default"}
          className={
            validationResult.severity === "warning"
              ? "border-yellow-500 bg-yellow-50 text-yellow-900"
              : validationResult.severity === "info"
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : ""
          }
        >
          {validationResult.severity === "error" && <AlertCircle className="h-4 w-4" />}
          {validationResult.severity === "warning" && <AlertTriangle className="h-4 w-4" />}
          {validationResult.severity === "info" && <Info className="h-4 w-4" />}
          <AlertDescription>{validationResult.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
