const { getSheetsClient } = require('./utils/google.cjs')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { sheet, values } = JSON.parse(event.body || '{}')
    if (!sheet || !Array.isArray(values)) return { statusCode: 400, body: 'sheet and values required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheet}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] }
    })
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: String(err.message || err) }
  }
}