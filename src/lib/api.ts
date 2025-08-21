export async function addRow(sheet: string, values: any[]) {
  const res = await fetch('/.netlify/functions/addRow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, values })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function listRows(sheet: string, limit = 25) {
  const params = new URLSearchParams({ sheet, limit: String(limit) })
  const res = await fetch('/.netlify/functions/listRows?' + params.toString())
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<{ headers: string[]; rows: any[] }>
}