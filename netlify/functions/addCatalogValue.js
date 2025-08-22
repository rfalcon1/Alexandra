const { getSheetsClient } = require('./utils/google')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const body = JSON.parse(event.body||'{}')
    const { category, value } = body
    if (!category || !value) return { statusCode: 400, body: 'category and value required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    // Ensure header exists once
    let hasHeader = false
    try {
      const r = await sheets.spreadsheets.values.get({ spreadsheetId, range: `Catalogos!A1:B1` })
      const row = r.data.values && r.data.values[0]
      hasHeader = !!(row && row[0] === 'Categoria' && row[1] === 'Valor')
    } catch (e) { /* sheet may not exist or empty */ }
    if (!hasHeader) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range: `Catalogos!A1:B1`, valueInputOption: 'RAW',
        requestBody: { values: [[ 'Categoria','Valor' ]] }
      })
    }
    // Append row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `Catalogos!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[ category, value ]] }
    })
    return { statusCode: 200, body: JSON.stringify({ ok:true }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: String(err.message || err) }
  }
}