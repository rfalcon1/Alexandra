export async function addRow(sheet: string, values: any[]) {
  const res = await fetch('/.netlify/functions/addRow', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ sheet, values })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function listRows(sheet: string, limit = 1000) {
  const res = await fetch(`/.netlify/functions/listRows?sheet=${encodeURIComponent(sheet)}&limit=${limit}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getRow(sheet: string, id: string) {
  const res = await fetch(`/.netlify/functions/getRow?sheet=${encodeURIComponent(sheet)}&id=${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateRow(sheet: string, id: string, values: Record<string, any>) {
  const res = await fetch('/.netlify/functions/updateRow', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ sheet, id, values })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}