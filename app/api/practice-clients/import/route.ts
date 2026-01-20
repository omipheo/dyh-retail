import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createServerClient()
  } catch (clientError) {
    console.error("[v0] Failed to create Supabase client:", clientError)
    return NextResponse.json({
      error: "Database connection failed",
      success: 0,
      failed: 0,
      updated: 0,
      skipped: 0,
      skippedRows: [],
      errors: [{ row: 0, email: "N/A", error: "Could not connect to database" }],
    }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const defaultStatus = (formData.get("defaultStatus") as string) || null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((line) => line.trim() && !line.match(/^,+$/))

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or invalid" }, { status: 400 })
    }

    const rawHeaders = parseCSVLine(lines[0])
    console.log("[v0] Raw headers:", rawHeaders)

    let nameIndex = -1
    let phoneIndex = -1
    let emailIndex = -1
    let typeIndex = -1
    let statusIndex = -1
    let industryIndex = -1
    let xeroIndex = -1
    let abnIndex = -1

    rawHeaders.forEach((header, index) => {
      const h = header.toLowerCase().trim()
      if (h === "name") nameIndex = index
      else if (h === "phone number") phoneIndex = index
      else if (h === "email") emailIndex = index
      else if (h === "type") typeIndex = index
      else if (h === "status") statusIndex = index
      else if (h === "industry classification") industryIndex = index
      else if (h === "xero plan") xeroIndex = index
      else if (h === "abn") abnIndex = index
    })

    console.log(
      "[v0] Column mapping - name:",
      nameIndex,
      "phone:",
      phoneIndex,
      "email:",
      emailIndex,
      "type:",
      typeIndex,
      "status:",
      statusIndex,
    )

    if (nameIndex === -1) {
      return NextResponse.json(
        { error: "Missing required column 'Name'. Found headers: " + rawHeaders.join(", ") },
        { status: 400 },
      )
    }

    const clients = []
    const skippedRows: { row: number; reason: string; name?: string }[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])

      const name = nameIndex >= 0 ? values[nameIndex]?.trim().replace(/^"|"$/g, "") : ""
      const phone = phoneIndex >= 0 ? values[phoneIndex]?.trim() : ""
      const email = emailIndex >= 0 ? values[emailIndex]?.toLowerCase().trim() : ""
      const rawType = typeIndex >= 0 ? values[typeIndex]?.trim() : ""
      const industry = industryIndex >= 0 ? values[industryIndex]?.trim() : ""
      const xero = xeroIndex >= 0 ? values[xeroIndex]?.trim() : ""
      const abn = abnIndex >= 0 ? values[abnIndex]?.trim() : ""
      const rawStatus = statusIndex >= 0 ? values[statusIndex]?.toLowerCase().trim() : ""

      let clientType = rawType.toLowerCase()
      let finalStatus = rawStatus

      // Auto-detect and fix swapped Type/Status columns
      if (clientType === "archived" || clientType === "inactive" || clientType === "active") {
        const temp = clientType
        clientType = rawStatus
        finalStatus = temp
      }

      if (
        ["individual", "company", "trust", "smsf", "partnership", "sole trader", "sole_trader"].includes(finalStatus)
      ) {
        const temp = finalStatus
        finalStatus = clientType
        clientType = temp
      }

      // Normalize client type
      if (clientType === "sole trader") clientType = "sole_trader"
      else if (clientType === "smsf" || clientType === "self managed superannuation fund") clientType = "smsf"
      else clientType = clientType.replace(/\s+/g, "_")

      // Normalize status
      if (finalStatus) {
        finalStatus = finalStatus === "inactive" ? "archived" : finalStatus
        finalStatus = finalStatus === "archived" ? "archived" : "active"
      } else if (defaultStatus) {
        finalStatus = defaultStatus
      } else {
        finalStatus = "active"
      }

      if (!name) {
        skippedRows.push({ row: i + 1, reason: "Missing name", name: "(empty)" })
        continue
      }

      clients.push({
        full_name: name,
        email: email || null,
        phone_number: phone || null,
        status: finalStatus,
        client_type: clientType || null,
        industry_classification: industry || null,
        xero_plan: xero || null,
        abn: abn || null,
        rowNumber: i + 1,
      })
    }

    console.log("[v0] Processing", clients.length, "clients")

    const results = {
      success: 0,
      failed: 0,
      updated: 0,
      skipped: skippedRows.length,
      skippedRows: skippedRows,
      errors: [] as { row: number; email: string; error: string }[],
    }

    const { error: testError } = await supabase.from("dyh_practice_clients").select("id").limit(1)
    if (testError) {
      console.error("[v0] Database connection test failed:", testError)
      return NextResponse.json(
        {
          error: `Database connection failed: ${testError.message}`,
          success: 0,
          failed: clients.length,
          updated: 0,
          skipped: results.skipped,
          skippedRows: results.skippedRows,
          errors: [{ row: 0, email: "N/A", error: `Database error: ${testError.message}` }],
        },
        { status: 500 },
      )
    }

    for (const client of clients) {
      try {
        let cleanEmail = client.email
        let cleanPhone = client.phone_number

        // Detect swapped email/phone
        if (cleanEmail && /^[\d\s+()-]+$/.test(cleanEmail)) {
          const temp = cleanEmail
          cleanEmail = cleanPhone
          cleanPhone = temp
        }

        // Validate email format
        if (cleanEmail && !cleanEmail.includes("@")) {
          cleanEmail = null
        }

        const clientData = {
          full_name: client.full_name,
          email: cleanEmail,
          phone: cleanPhone,
          status: client.status.toLowerCase() === "archived" ? "archived" : "active",
          client_type: client.client_type || null,
          questionnaire_data: {
            industry_classification: client.industry_classification,
            xero_plan: client.xero_plan,
            abn: client.abn,
          },
        }

        // Check if client already exists
        const { data: existing, error: checkError } = await supabase
          .from("dyh_practice_clients")
          .select("id, status")
          .eq("full_name", client.full_name)
          .maybeSingle()

        if (checkError) {
          console.error(`[v0] Row ${client.rowNumber} - Check error:`, checkError.message)
          results.failed++
          results.errors.push({ row: client.rowNumber, email: client.email || "", error: checkError.message })
          continue
        }

        if (existing) {
          if (existing.status !== clientData.status) {
            const { error: updateError } = await supabase
              .from("dyh_practice_clients")
              .update({ status: clientData.status })
              .eq("id", existing.id)

            if (updateError) {
              results.failed++
              results.errors.push({ row: client.rowNumber, email: client.email || "", error: updateError.message })
            } else {
              results.updated++
            }
          } else {
            skippedRows.push({
              row: client.rowNumber,
              reason: `Already exists as ${existing.status}`,
              name: client.full_name,
            })
            results.skipped++
          }
        } else {
          const { error: insertError } = await supabase.from("dyh_practice_clients").insert(clientData)

          if (insertError) {
            console.error(`[v0] Row ${client.rowNumber} - Insert error:`, insertError.message)
            results.failed++
            results.errors.push({ row: client.rowNumber, email: client.email || "", error: insertError.message })
          } else {
            results.success++
          }
        }
      } catch (err) {
        results.failed++
        results.errors.push({ row: client.rowNumber, email: client.email || "", error: (err as Error).message })
      }
    }

    console.log(
      "[v0] Import complete. Success:",
      results.success,
      "Failed:",
      results.failed,
      "Updated:",
      results.updated,
      "Skipped:",
      results.skipped,
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Import failed:", error)
    return NextResponse.json(
      {
        error: "Import failed: " + (error as Error).message,
        success: 0,
        failed: 0,
        updated: 0,
        skipped: 0,
        skippedRows: [],
        errors: [{ row: 0, email: "N/A", error: (error as Error).message }],
      },
      { status: 500 },
    )
  }
}
