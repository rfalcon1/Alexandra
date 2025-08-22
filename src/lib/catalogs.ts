export async function fetchCatalogs() {
  const res = await fetch('/.netlify/functions/listCatalogs')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function addCatalogValue(category: string, value: string) {
  const res = await fetch('/.netlify/functions/addCatalogValue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, value })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
export async function deleteCatalogValue(category: string, value: string) {
  const res = await fetch('/.netlify/functions/deleteCatalogValue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, value })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}