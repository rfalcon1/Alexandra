const { getSheetsClient } = require('./utils/google')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { category, value } = JSON.parse(event.body||'{}')
    if (!category || !value) return { statusCode: 400, body: 'category and value are required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Catalogos!A1:B' })
    const values = resp.data.values || []
    if (values.length === 0) return { statusCode: 200, body: 'OK' }
    const [header, ...rows] = values
    const idxCat = header.findIndex(h=>h==='Categoria')
    const idxVal = header.findIndex(h=>h==='Valor')
    const filtered = rows.filter(r => !((r[idxCat]||'')===category && (r[idxVal]||'')===value))
    const newValues = [ ['Categoria','Valor'], ...filtered ]
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: 'Catalogos!A1:B', valueInputOption: 'RAW',
      requestBody: { values: newValues }
    })
    return { statusCode: 200, body: 'OK' }
  } catch (err) { console.error(err); return { statusCode: 500, body: String(err.message || err) } }
}
