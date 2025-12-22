import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity, RefreshCw, Gift } from 'lucide-react'

export default async function AdminUsagePage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'tax_agent') {
    redirect('/dashboard')
  }

  // Get all users with their usage
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select(`
      user_id,
      outputs_generated,
      last_output_at,
      last_reset_at,
      profiles (
        full_name,
        email
      )
    `)
    .order('outputs_generated', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Usage Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage user output limits
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usage?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Users at Limit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage?.filter(u => u.outputs_generated >= 3).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage?.filter(u => u.outputs_generated > 0).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Usage</CardTitle>
              <CardDescription>
                View and manage output limits for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Outputs Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Output</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage?.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell className="font-medium">
                        {item.profiles?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{item.profiles?.email || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          {item.outputs_generated} / 3
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.outputs_generated >= 3 ? 'destructive' : 'default'}>
                          {item.outputs_generated >= 3 ? 'Limit Reached' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.last_output_at 
                          ? new Date(item.last_output_at).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                        <Button variant="outline" size="sm">
                          <Gift className="h-4 w-4 mr-1" />
                          Grant
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
