// Script to find templates in Blob storage
const response = await fetch("/api/blob/list")
const data = await response.json()

console.log("[v0] All files in Blob storage:")
console.log(JSON.stringify(data, null, 2))

const templates = data.files?.filter(
  (file: any) => file.pathname?.includes("template") || file.pathname?.includes(".docx"),
)

console.log("[v0] Template files found:")
console.log(JSON.stringify(templates, null, 2))
