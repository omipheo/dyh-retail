import { createServiceRoleClient } from "@/lib/supabase/service-role"
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
      "industry:",
      industryIndex,
      "xero:",
      xeroIndex,
      "abn:",
      abnIndex,
      "status:",
      statusIndex,
    )

    if (nameIndex === -1) {
      return NextResponse.json(
        {
          error: "Missing required column 'Name'. Found headers: " + rawHeaders.join(", "),
        },
        { status: 400 },
      )
    }

    const clients = []
    const skippedRows: { row: number; reason: string; name?: string }[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])

      console.log(`[v0] Processing row ${i + 1}, parsed ${values.length} values (expected ~${rawHeaders.length})`)

      const name = nameIndex >= 0 ? values[nameIndex]?.trim().replace(/^"|"$/g, "") : ""
      const phone = phoneIndex >= 0 ? values[phoneIndex]?.trim() : ""
      const email = emailIndex >= 0 ? values[emailIndex]?.toLowerCase().trim() : ""
      const rawType = typeIndex >= 0 ? values[typeIndex]?.trim() : ""
      const industry = industryIndex >= 0 ? values[industryIndex]?.trim() : ""
      const xero = xeroIndex >= 0 ? values[xeroIndex]?.trim() : ""
      const abn = abnIndex >= 0 ? values[abnIndex]?.trim() : ""
      const rawStatus = statusIndex >= 0 ? values[statusIndex]?.toLowerCase().trim() : ""

      console.log(
        `[v0] Row ${i + 1} - Extracted: name="${name}" email="${email}" phone="${phone}" type="${rawType}" status="${rawStatus}"`,
      )

      let clientType = rawType.toLowerCase()
      let finalStatus = rawStatus

      // Check if Type contains status values (archived/active/inactive)
      if (clientType === "archived" || clientType === "inactive" || clientType === "active") {
        console.log(`[v0] Row ${i + 1} - Detected swapped Type/Status, fixing`)
        // Type and Status are swapped - correct them
        const temp = clientType
        clientType = rawStatus
        finalStatus = temp
      }

      // Check if Status contains type values (individual/company/trust/etc)
      if (
        finalStatus === "individual" ||
        finalStatus === "company" ||
        finalStatus === "trust" ||
        finalStatus === "smsf" ||
        finalStatus === "partnership" ||
        finalStatus === "sole trader" ||
        finalStatus === "sole_trader"
      ) {
        console.log(`[v0] Row ${i + 1} - Detected swapped Status/Type, fixing`)
        // Status and Type are swapped - correct them
        const temp = finalStatus
        finalStatus = clientType
        clientType = temp
      }

      console.log(`[v0] Row ${i + 1} - After swap detection: type="${clientType}" status="${finalStatus}"`)

      // Normalize client type
      if (clientType === "individual") clientType = "individual"
      else if (clientType === "sole trader") clientType = "sole_trader"
      else if (clientType === "partnership") clientType = "partnership"
      else if (clientType === "company") clientType = "company"
      else if (clientType === "trust") clientType = "trust"
      else if (clientType === "smsf" || clientType === "self managed superannuation fund") clientType = "smsf"
      else clientType = rawType.toLowerCase().replace(/\s+/g, "_")

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
        console.log(`[v0] SKIPPING row ${i + 1} - Missing name`)
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

    const supabase = createServiceRoleClient()

    console.log("[v0] Importing", clients.length, "clients")

    const results = {
      success: 0,
      failed: 0,
      updated: 0,
      skipped: skippedRows.length,
      skippedRows: skippedRows,
      errors: [] as { row: number; email: string; error: string }[],
    }

    for (let index = 0; index < clients.length; index++) {
      const client = clients[index]
      try {
        let cleanEmail = client.email
        let cleanPhone = client.phone_number

        // Detect if email looks like a phone number (numbers and +)
        if (cleanEmail && /^[\d\s+()-]+$/.test(cleanEmail)) {
          console.log(`[v0] Row ${client.rowNumber} - Email looks like phone, swapping`)
          const temp = cleanEmail
          cleanEmail = cleanPhone
          cleanPhone = temp
        }

        // Validate email format
        if (cleanEmail && !cleanEmail.includes("@")) {
          console.log(`[v0] Row ${client.rowNumber} - Invalid email format: ${cleanEmail}`)
          cleanEmail = null
        }

        const clientData = {
          full_name: client.full_name,
          email: cleanEmail,
          phone_number: cleanPhone,
          status: client.status.toLowerCase() === "archived" ? "archived" : "active", // normalize status
          questionnaire_data: {
            client_type: client.client_type,
            industry_classification: client.industry_classification,
            xero_plan: client.xero_plan,
            abn: client.abn,
          },
        }

        console.log(`[v0] Row ${client.rowNumber} - Processing:`, {
          name: client.full_name,
          email: clientData.email,
          phone: clientData.phone_number,
          status: clientData.status,
          type: client.client_type,
        })

        const { data: existing, error: checkError } = await supabase
          .from("dyh_practice_clients")
          .select("id, status, email")
          .eq("full_name", client.full_name)
          .maybeSingle()

        if (checkError) {
          console.error(`[v0] Row ${client.rowNumber} - Check failed:`, checkError)
          results.failed++
          results.errors.push({
            row: client.rowNumber,
            email: client.email,
            error: checkError.message,
          })
          continue
        }

        if (existing) {
          // Client exists - update status if different
          console.log(
            `[v0] Row ${client.rowNumber} - Client "${client.full_name}" already exists (id: ${existing.id}, status: ${existing.status})`,
          )

          if (existing.status !== clientData.status) {
            console.log(
              `[v0] Row ${client.rowNumber} - Updating existing client status from ${existing.status} to ${clientData.status}`,
            )
            const { error: updateError } = await supabase
              .from("dyh_practice_clients")
              .update({ status: clientData.status })
              .eq("id", existing.id)

            if (updateError) {
              console.error(`[v0] Row ${client.rowNumber} - Update FAILED:`, updateError.message)
              console.error(`[v0] Full error:`, JSON.stringify(updateError, null, 2))
              results.failed++
              results.errors.push({
                row: client.rowNumber,
                email: client.email,
                error: `${updateError.message}${updateError.hint ? ` (Hint: ${updateError.hint})` : ""}${updateError.code ? ` [Code: ${updateError.code}]` : ""}`,
              })
            } else {
              console.log(`[v0] Row ${client.rowNumber} - Update SUCCESS`)
              results.updated++
            }
          } else {
            console.log(`[v0] Row ${client.rowNumber} - Client already exists with same status, skipping`)
            skippedRows.push({
              row: client.rowNumber,
              reason: `Already exists as ${existing.status}`,
              name: client.full_name,
            })
            results.skipped++
          }
        } else {
          // New client - insert
          console.log(`[v0] Row ${client.rowNumber} - Inserting new client`)
          const { error: insertError } = await supabase.from("dyh_practice_clients").insert(clientData)

          if (insertError) {
            console.error(`[v0] Row ${client.rowNumber} - Insert FAILED:`, insertError.message, insertError)
            console.error(`[v0] Full error:`, JSON.stringify(insertError, null, 2))
            results.failed++
            results.errors.push({
              row: client.rowNumber,
              email: client.email,
              error: `${insertError.message}${insertError.hint ? ` (Hint: ${insertError.hint})` : ""}${insertError.code ? ` [Code: ${insertError.code}]` : ""}`,
            })
          } else {
            console.log(`[v0] Row ${client.rowNumber} - Insert SUCCESS`)
            results.success++
          }
        }
      } catch (err) {
        console.error(`[v0] Row ${client.rowNumber} - Exception:`, err)
        results.failed++
        results.errors.push({
          row: client.rowNumber,
          email: client.email,
          error: (err as Error).message,
        })
      }
    }

    console.log(
      "[v0] Import complete. Success:",
      results.success,
      "Failed:",
      results.failed,
      "Skipped:",
      results.skipped,
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Import failed:", error)
    return NextResponse.json({ error: "Import failed: " + (error as Error).message }, { status: 500 })
  }
}
