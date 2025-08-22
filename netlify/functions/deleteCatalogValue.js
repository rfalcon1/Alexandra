const { getSheetsClient } = require('./utils/google')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const body = JSON.parse(event.body||'{}')
    const { category, value } = body
    if (!category || !value) return { statusCode: 400, body: 'category and value required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: `Catalogos!A1:B` })
    const values = resp.data.values || []
    const [header, ...rows] = values.length ? values : [['Categoria','Valor']]
    const idxCat = header.findIndex(h=>h==='Categoria')
    const idxVal = header.findIndex(h=>h==='Valor')
    const filtered = rows.filter(r=> !( (r[idxCat]||'')===category && (r[idxVal]||'')===value ))
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: `Catalogos!A1:B` })
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: `Catalogos!A1:B1`, valueInputOption: 'RAW',
      requestBody: { values: [header] }
    })
    if (filtered.length) {
      await sheets.spreadsheets.values.append({
        spreadsheetId, range: `Catalogos!A:B`, valueInputOption: 'USER_ENTERED',
        requestBody: { values: filtered }
      })
    }
    return { statusCode: 200, body: JSON.stringify({ ok:true }) }
  } catch (err) { console.error(err); return { statusCode: 500, body: String(err.message || err) } }
}