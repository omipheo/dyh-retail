import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, AlertTriangle } from "lucide-react"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const checklistExplanations: Record<string, string> = {
  "Locate the script":
    "Navigate to the /scripts folder in your project. Look for a file that matches the table name (e.g., '013_create_dyh_explorer_prospects.sql' for the prospects table). These SQL scripts contain the commands needed to create database tables and their structure.",
  "Execute the script":
    "Copy the SQL code from the script file, then go to your Supabase project dashboard > SQL Editor, paste the code, and click 'Run'. This will create the table in your database. Check for any error messages in the output panel.",
  "Refresh this page":
    "After creating the table, reload this Integration Status page (press F5 or click the browser refresh button) to verify that the system now detects the newly created table. The status should change from red X to green checkmark.",
  "Check for any foreign key":
    "Some tables depend on other tables to exist first. For example, 'client_group_members' requires 'client_groups' to exist. If the script fails, check the error message for 'foreign key' references and create those tables first, then retry.",
  "Add DYH_API_KEY":
    "Go to the sidebar > Vars section in v0, or your Vercel project settings > Environment Variables. Create a new variable named 'DYH_API_KEY' and set its value to a secure random string (e.g., use a password generator to create a 32+ character string). Save and redeploy.",
  "Use the same key":
    "The API key must be identical in both workspaces for them to communicate. Copy the exact same key value to DYH Explorer's environment variables (as 'PRACTICE_MGR_API_KEY'). Don't generate a new key - use the same one.",
  "Generate a secure random":
    "Use an online password generator or command like 'openssl rand -hex 32' to create a cryptographically secure random string. Avoid simple passwords or predictable patterns. The key should be at least 32 characters long.",
  "Get this from your Supabase":
    "Log into supabase.com, select your project, click the Settings gear icon, go to API section. You'll find your Project URL and anon public key listed there. Copy these values exactly as shown.",
  "Format: https://":
    "The Supabase URL should look like 'https://abcdefghijk.supabase.co' where the random letters are your project identifier. Make sure to include 'https://' at the beginning.",
  "Add to environment variables":
    "In v0, click the Vars icon in the left sidebar, then click '+ Add Variable'. Enter the variable name (exactly as shown) and paste the value. Click Save. For Vercel deployments, go to Project Settings > Environment Variables.",
  "This is the public anon":
    "The anon key is safe to use in public/client-side code. It starts with 'eyJ' and is a long string. This is different from the service_role key (which should never be exposed in client code). Copy the entire key including 'eyJ' at the start.",
  "Only required if using":
    "This is optional. You can skip this if you're not using the document upload/download features. The system will work fine without it, but file storage won't be available.",
  "Get from Vercel project":
    "Log into vercel.com, go to your project, click Settings > Storage > Blob. Create a new Blob store if you haven't, then copy the read-write token from the tokens section.",
  "Check deployment logs":
    "In Vercel, go to your project > Deployments, click on the latest deployment, then click 'View Function Logs'. Look for error messages or stack traces that indicate what's failing. Common issues include missing dependencies or syntax errors.",
  "Verify the /app/api":
    "In your code editor or file browser, navigate to the 'app/api/health' folder and confirm the 'route.ts' file exists and contains the API handler code. If it's missing, the endpoint won't be available.",
  "Ensure Supabase connection":
    "The API needs to connect to your database. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are correctly set in environment variables. Test the connection by trying to access the admin dashboard.",
  "Check if there are any middleware":
    "Look for 'middleware.ts' in your project root. If it exists, make sure it's not blocking API routes. Middleware can intercept requests before they reach your API endpoints, causing 404 or redirect issues.",
  "Verify the application":
    "Check your Vercel dashboard or hosting platform to confirm the deployment succeeded and the application is running. Look for a green 'Ready' status. If deployment failed, check the build logs for errors.",
  "Check for any network":
    "Try accessing the application from a different network or using your phone's mobile data (not WiFi). This helps identify if your workplace/home firewall is blocking access to the application.",
  "Ensure the domain/URL":
    "Confirm you're using the correct URL. For Vercel, it's typically 'your-project-name.vercel.app'. Check that there are no typos in the domain name and that the HTTPS certificate is valid.",
  "Review Vercel deployment":
    "In Vercel > Deployments > Click your latest deployment > Build Logs. Look for red error messages during the build process. Common issues: missing dependencies, TypeScript errors, or failed SQL migrations.",
  "Test the integration":
    "Go to DYH Explorer, fill out a questionnaire as if you're a real client, and submit it. Then check Practice Manager > Admin > Prospects to see if the prospect appears. This confirms the integration is working end-to-end.",
}

function getExplanation(checklistItem: string): string {
  for (const [key, explanation] of Object.entries(checklistExplanations)) {
    if (checklistItem.includes(key)) {
      return explanation
    }
  }
  return "Follow this step carefully and verify completion before moving to the next item. If you encounter errors, check the error message for specific guidance."
}

async function checkIntegrationStatus() {
  const supabase = await createClient()

  const errors: Array<{
    severity: "error" | "warning"
    category: string
    message: string
    solution: string
    checklist: string[]
  }> = []

  // Check database tables exist
  const tables = [
    "dyh_explorer_prospects",
    "dyh_practice_clients",
    "client_assessments",
    "client_followups",
    "client_groups",
    "client_group_members",
    "ato_due_dates",
    "june_balancers",
    "super_fund_lodgments",
    "todos",
    "complaints",
  ]

  const tableStatus = await Promise.all(
    tables.map(async (table) => {
      const { error, count } = await supabase.from(table).select("*", { count: "exact", head: true })

      if (error) {
        errors.push({
          severity: "error",
          category: "Database",
          message: `Table '${table}' is missing or inaccessible`,
          solution: `Run the SQL migration script to create the '${table}' table`,
          checklist: [
            `Locate the script in the /scripts folder that creates ${table}`,
            "Execute the script in your Supabase SQL editor",
            "Refresh this page to verify the table was created",
            "Check for any foreign key dependencies that need to be created first",
          ],
        })
      }

      return {
        name: table,
        exists: !error,
        count: count || 0,
        error: error?.message,
      }
    }),
  )

  // Check environment variables with specific guidance
  const envVarChecks = [
    {
      key: "DYH_API_KEY",
      required: true,
      description: "Shared secret for DYH Explorer integration",
      setup: [
        'Add DYH_API_KEY to environment variables (e.g., "your-secure-random-key-here")',
        "Use the same key in both Practice Manager and DYH Explorer",
        "Generate a secure random string (at least 32 characters)",
      ],
    },
    {
      key: "SUPABASE_URL",
      required: true,
      description: "Supabase project URL",
      setup: [
        "Get this from your Supabase project settings",
        "Format: https://xxxxx.supabase.co",
        "Add to environment variables in the Vars section",
      ],
    },
    {
      key: "SUPABASE_ANON_KEY",
      required: true,
      description: "Supabase anonymous public key",
      setup: [
        "Get this from Supabase project settings > API",
        "This is the public anon key (starts with 'eyJ...')",
        "Add to environment variables in the Vars section",
      ],
    },
    {
      key: "BLOB_READ_WRITE_TOKEN",
      required: false,
      description: "Vercel Blob storage token for file uploads",
      setup: [
        "Only required if using document upload features",
        "Get from Vercel project settings > Storage",
        "Add to environment variables in the Vars section",
      ],
    },
  ]

  const envVars: Record<string, { present: boolean; description: string; required: boolean }> = {}

  envVarChecks.forEach(({ key, required, description, setup }) => {
    const present = !!process.env[key]
    envVars[key] = { present, description, required }

    if (required && !present) {
      errors.push({
        severity: "error",
        category: "Configuration",
        message: `Missing required environment variable: ${key}`,
        solution: description,
        checklist: setup,
      })
    } else if (!required && !present) {
      errors.push({
        severity: "warning",
        category: "Configuration",
        message: `Optional environment variable not set: ${key}`,
        solution: description,
        checklist: setup,
      })
    }
  })

  // Test API endpoints
  const apiTests: Array<{
    name: string
    endpoint: string
    status: "operational" | "failed" | "untested"
    error?: string
  }> = []

  try {
    const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/health`, {
      method: "GET",
    })

    apiTests.push({
      name: "Health Check",
      endpoint: "/api/health",
      status: healthCheck.ok ? "operational" : "failed",
      error: healthCheck.ok ? undefined : `HTTP ${healthCheck.status}`,
    })

    if (!healthCheck.ok) {
      errors.push({
        severity: "error",
        category: "API",
        message: "Health check endpoint failed",
        solution: "The /api/health endpoint is not responding correctly",
        checklist: [
          "Check deployment logs for errors",
          "Verify the /app/api/health/route.ts file exists",
          "Ensure Supabase connection is working",
          "Check if there are any middleware blocking the endpoint",
        ],
      })
    }
  } catch (error) {
    apiTests.push({
      name: "Health Check",
      endpoint: "/api/health",
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })

    errors.push({
      severity: "error",
      category: "API",
      message: "Cannot reach health check endpoint",
      solution: "Network or deployment issue preventing API access",
      checklist: [
        "Verify the application is deployed and running",
        "Check for any network/firewall issues",
        "Ensure the domain/URL is correct",
        "Review Vercel deployment logs for errors",
      ],
    })
  }

  // Add note about DYH Explorer integration
  if (!process.env.DYH_API_KEY) {
    errors.push({
      severity: "warning",
      category: "Integration",
      message: "DYH Explorer integration not configured",
      solution: "Set up the API key to enable cross-workspace communication",
      checklist: [
        "Generate a secure random API key",
        "Add DYH_API_KEY to Practice Manager environment variables",
        "Add the same key to DYH Explorer as PRACTICE_MGR_API_KEY",
        "Test the integration by creating a prospect in DYH Explorer",
      ],
    })
  }

  return {
    tables: tableStatus,
    envVars,
    apiTests,
    errors,
    timestamp: new Date().toISOString(),
  }
}

export default async function IntegrationStatusPage() {
  const status = await checkIntegrationStatus()

  const allTablesExist = status.tables.every((t) => t.exists)
  const allRequiredEnvVarsPresent = Object.entries(status.envVars)
    .filter(([_, v]) => v.required)
    .every(([_, v]) => v.present)
  const allApisOperational = status.apiTests.every((t) => t.status === "operational")

  const overallStatus = allTablesExist && allRequiredEnvVarsPresent && allApisOperational ? "healthy" : "issues"

  const criticalErrors = status.errors.filter((e) => e.severity === "error")
  const warnings = status.errors.filter((e) => e.severity === "warning")

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integration Status & Diagnostics</h1>
        <p className="text-muted-foreground">
          Monitor the health of your Practice Manager system and get detailed troubleshooting guidance
        </p>
      </div>

      <TooltipProvider>
        {(criticalErrors.length > 0 || warnings.length > 0) && (
          <div className="mb-6 space-y-4">
            {criticalErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Issues Detected ({criticalErrors.length})</AlertTitle>
                <AlertDescription>
                  The following issues must be resolved for the system to function properly.
                </AlertDescription>
              </Alert>
            )}

            {warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warnings ({warnings.length})</AlertTitle>
                <AlertDescription>
                  These issues may limit functionality but do not prevent core operations.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Detailed Error Report & Resolution Steps</CardTitle>
                <CardDescription>Follow these checklists to resolve each issue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {status.errors.map((error, index) => (
                  <div
                    key={index}
                    className={`border-l-4 pl-4 py-3 ${
                      error.severity === "error" ? "border-red-500 bg-red-50/50" : "border-yellow-500 bg-yellow-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {error.severity === "error" ? (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          [{error.category}] {error.message}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{error.solution}</div>
                      </div>
                    </div>

                    <div className="ml-7 mt-3">
                      <div className="text-sm font-medium mb-2">Resolution Checklist:</div>
                      <ul className="space-y-2">
                        {error.checklist.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm flex items-start gap-2 group">
                            <span className="text-muted-foreground mt-0.5">☐</span>
                            <span className="flex-1">{step}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  type="button"
                                  aria-label="Help"
                                >
                                  <HelpCircle className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-3 bg-slate-900 text-white">
                                <p className="text-sm leading-relaxed">{getExplanation(step)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </TooltipProvider>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall Status
            {overallStatus === "healthy" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
          <CardDescription>Last checked: {new Date(status.timestamp).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant={overallStatus === "healthy" ? "default" : "secondary"}>
            {overallStatus === "healthy" ? "All Systems Operational" : "Configuration Issues Detected"}
          </Badge>
          {overallStatus !== "healthy" && (
            <div className="mt-4 text-sm space-y-1">
              {criticalErrors.length > 0 && (
                <div className="text-red-600">{criticalErrors.length} critical error(s) require attention</div>
              )}
              {warnings.length > 0 && <div className="text-yellow-600">{warnings.length} warning(s) detected</div>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Endpoints Health</CardTitle>
          <CardDescription>Real-time status of integration endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.apiTests.map((test) => (
              <div key={test.endpoint} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground font-mono">{test.endpoint}</div>
                  {test.error && <div className="text-sm text-red-500 mt-1">Error: {test.error}</div>}
                </div>
                {test.status === "operational" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : test.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>Integration database schema status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.tables.map((table) => (
              <div key={table.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{table.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {table.exists ? `${table.count} records` : `Error: ${table.error}`}
                  </div>
                </div>
                {table.exists ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Required and optional configuration variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(status.envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {key}
                    {!value.required && <span className="text-xs text-muted-foreground ml-2">(optional)</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {value.present ? "Configured" : `Missing - ${value.description}`}
                  </div>
                </div>
                {value.present ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : value.required ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available API Endpoints</CardTitle>
          <CardDescription>Integration endpoints for DYH Explorer workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div className="p-2 bg-muted rounded">
              <span className="text-green-600 font-semibold">POST</span> /api/prospects/create
              <div className="text-xs text-muted-foreground ml-14">Create or update prospect from questionnaire</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="text-green-600 font-semibold">POST</span> /api/prospects/migrate
              <div className="text-xs text-muted-foreground ml-14">Migrate prospect to client after purchase</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="text-green-600 font-semibold">POST</span> /api/submissions/sync
              <div className="text-xs text-muted-foreground ml-14">Sync form submission for admin viewing</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="text-blue-600 font-semibold">GET</span> /api/health
              <div className="text-xs text-muted-foreground ml-14">Check system health and connectivity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
