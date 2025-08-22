const { getSheetsClient } = require('./utils/google')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { category, value } = JSON.parse(event.body||'{}')
    if (!category || !value) return { statusCode: 400, body: 'category and value are required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'Catalogos!A:B', valueInputOption: 'RAW',
      requestBody: { values: [[ 'Categoria', 'Valor' ], [ category, value ]] }
    })
    return { statusCode: 200, body: 'OK' }
  } catch (err) { console.error(err); return { statusCode: 500, body: String(err.message || err) } }
}
