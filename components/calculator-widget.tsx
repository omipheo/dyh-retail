'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface CalculatorWidgetProps {
  initialData?: {
    homeSize: number
    officeSize: number
    hoursPerWeek: number
    internetAnnual: number
    phoneAnnual: number
    electricityAnnual: number
    heatingCoolingAnnual: number
    cleaningAnnual: number
  }
}

export function CalculatorWidget({ initialData }: CalculatorWidgetProps) {
  const [inputs, setInputs] = useState({
    homeSize: initialData?.homeSize || 0,
    officeSize: initialData?.officeSize || 0,
    hoursPerWeek: initialData?.hoursPerWeek || 0,
    internetAnnual: initialData?.internetAnnual || 0,
    phoneAnnual: initialData?.phoneAnnual || 0,
    electricityAnnual: initialData?.electricityAnnual || 0,
    heatingCoolingAnnual: initialData?.heatingCoolingAnnual || 0,
    cleaningAnnual: initialData?.cleaningAnnual || 0,
  })
  
  const [result, setResult] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)
  const { toast } = useToast()

  const handleCalculate = () => {
    setCalculating(true)
    
    // Client-side calculation for instant feedback
    const officePercentage = inputs.officeSize / inputs.homeSize
    const hoursPerYear = inputs.hoursPerWeek * 52
    const fixedRate = 0.67 * hoursPerYear
    
    const runningExpenses = 
      inputs.internetAnnual +
      inputs.phoneAnnual +
      inputs.electricityAnnual +
      inputs.heatingCoolingAnnual +
      inputs.cleaningAnnual
    
    const actualCost = runningExpenses * officePercentage
    
    const mockResult = {
      fixedRateDeduction: fixedRate,
      actualCostDeduction: actualCost,
      recommendedMethod: actualCost > fixedRate ? 'actual_cost' : 'fixed_rate',
      recommendedDeduction: Math.max(actualCost, fixedRate),
      savings: Math.abs(actualCost - fixedRate),
      eligibility: {
        meetsMinimumHours: inputs.hoursPerWeek >= 8,
        hasDedicatedSpace: inputs.officeSize > 0,
        isEligible: inputs.hoursPerWeek >= 8 && inputs.officeSize > 0,
        warnings: [],
      },
      actualCostDetails: {
        officePercentage: (officePercentage * 100).toFixed(2),
      },
    }
    
    setResult(mockResult)
    setCalculating(false)
    
    toast({
      title: 'Calculation Complete',
      description: `Recommended deduction: $${mockResult.recommendedDeduction.toFixed(2)}`,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Quick Calculator
        </CardTitle>
        <CardDescription>
          Get an instant estimate of your home business optimisation opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeSize">Total Home Size (sqm)</Label>
            <Input
              id="homeSize"
              type="number"
              value={inputs.homeSize}
              onChange={(e) => handleInputChange('homeSize', e.target.value)}
              placeholder="150"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="officeSize">Office Size (sqm)</Label>
            <Input
              id="officeSize"
              type="number"
              value={inputs.officeSize}
              onChange={(e) => handleInputChange('officeSize', e.target.value)}
              placeholder="15"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hoursPerWeek">Hours per Week</Label>
            <Input
              id="hoursPerWeek"
              type="number"
              value={inputs.hoursPerWeek}
              onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
              placeholder="40"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="internetAnnual">Internet (Annual)</Label>
            <Input
              id="internetAnnual"
              type="number"
              value={inputs.internetAnnual}
              onChange={(e) => handleInputChange('internetAnnual', e.target.value)}
              placeholder="1200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneAnnual">Phone (Annual)</Label>
            <Input
              id="phoneAnnual"
              type="number"
              value={inputs.phoneAnnual}
              onChange={(e) => handleInputChange('phoneAnnual', e.target.value)}
              placeholder="800"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="electricityAnnual">Electricity (Annual)</Label>
            <Input
              id="electricityAnnual"
              type="number"
              value={inputs.electricityAnnual}
              onChange={(e) => handleInputChange('electricityAnnual', e.target.value)}
              placeholder="2000"
            />
          </div>
        </div>

        <Button 
          onClick={handleCalculate} 
          className="w-full"
          disabled={calculating}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Deduction
        </Button>

        {result && (
          <>
            <Separator />
            
            {!result.eligibility.isEligible && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You may not be eligible for home business deductions. Please ensure you work at least 8 hours per week and have a dedicated office space.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Recommended Deduction</h4>
                </div>
                <p className="text-3xl font-bold text-primary">
                  ${result.recommendedDeduction.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Using {result.recommendedMethod === 'fixed_rate' ? 'Fixed Rate' : 'Actual Cost'} Method
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Fixed Rate</p>
                  <p className="text-xl font-semibold">
                    ${result.fixedRateDeduction.toFixed(2)}
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Actual Cost</p>
                  <p className="text-xl font-semibold">
                    ${result.actualCostDeduction.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Office Percentage: {result.actualCostDetails.officePercentage}%</p>
                <p>Potential Savings: ${result.savings.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
