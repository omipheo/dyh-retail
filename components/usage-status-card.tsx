'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle, Crown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UsageStatus {
  outputsUsed: number
  outputsRemaining: number
  limitReached: boolean
  canGenerate: boolean
  requiresPayment: boolean
  isTaxAgent: boolean
}

export function UsageStatusCard() {
  const [status, setStatus] = useState<UsageStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStatus()
  }, [])

  const fetchUsageStatus = async () => {
    try {
      const response = await fetch('/api/usage/check')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  if (status.isTaxAgent) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Tax Agent Access
          </CardTitle>
          <CardDescription>
            You have unlimited access to all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">Unlimited Outputs</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usagePercentage = (status.outputsUsed / 3) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Usage Status
        </CardTitle>
        <CardDescription>
          You have {status.outputsRemaining} of 3 free outputs remaining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Outputs Used</span>
            <span className="font-medium">
              {status.outputsUsed} / 3
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        {status.limitReached ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have reached your free output limit. Contact a tax agent for additional access.
            </AlertDescription>
          </Alert>
        ) : status.outputsRemaining === 1 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have 1 output remaining. Make it count!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              You can generate {status.outputsRemaining} more outputs
            </span>
          </div>
        )}

        <div className="pt-2">
          <Badge variant={status.canGenerate ? 'default' : 'destructive'}>
            {status.canGenerate ? 'Active' : 'Limit Reached'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
