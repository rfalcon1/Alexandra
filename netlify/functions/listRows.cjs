const { getSheetsClient } = require('./utils/google.cjs')

function mapRows(headers, rows) {
  return rows.map(r => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = r[i] ?? '' })
    return obj
  })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const params = event.queryStringParameters || {}
    const sheet = params.sheet
    const limit = Number(params.limit || 25)
    if (!sheet) return { statusCode: 400, body: 'sheet required' }

    const { sheets, spreadsheetId } = await getSheetsClient()
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!A1:Z`,
    })
    const values = resp.data.values || []
    if (values.length === 0) return { statusCode: 200, body: JSON.stringify({ headers: [], rows: [] }) }
    const [headers, ...rows] = values
    const mapped = mapRows(headers, rows).slice(-limit).reverse()
    return { statusCode: 200, body: JSON.stringify({ headers, rows: mapped }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: String(err.message || err) }
  }
}
