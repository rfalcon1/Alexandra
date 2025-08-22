const { getSheetsClient } = require('./utils/google')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const body = JSON.parse(event.body||'{}')
    const { category, value } = body
    if (!category || !value) return { statusCode: 400, body: 'category and value required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `Catalogos!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[ 'Categoria','Valor' ], [ category, value ]] }
    })
    return { statusCode: 200, body: JSON.stringify({ ok:true }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: String(err.message || err) }
  }
}