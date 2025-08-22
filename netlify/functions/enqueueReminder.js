const { getSheetsClient } = require('./utils/google')

async function ensureSheetAndHeader(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const has = (meta.data.sheets||[]).some(s => s.properties && s.properties.title === 'Recordatorios')
  if (!has) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [ { addSheet: { properties: { title: 'Recordatorios' } } } ] }
    })
  }
  try {
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Recordatorios!A1:H1' })
    const row = (resp.data.values && resp.data.values[0]) || []
    if ((row[0]||'') === 'CreatedAtISO') return true
  } catch (e) {}
  await sheets.spreadsheets.values.update({
    spreadsheetId, range: 'Recordatorios!A1:H1', valueInputOption: 'RAW',
    requestBody: { values: [[ 'CreatedAtISO','Type','RefID','Email','Subject','Text','DueDate','Status' ]] }
  })
  return true
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const body = JSON.parse(event.body||'{}')
    const { type, refId, email, subject, text, dueDate } = body
    if (!type || !refId || !email || !dueDate) return { statusCode: 400, body: 'type, refId, email, dueDate are required' }
    const { sheets, spreadsheetId } = await getSheetsClient()
    await ensureSheetAndHeader(sheets, spreadsheetId)
    const createdAt = new Date().toISOString()
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'Recordatorios!A:H', valueInputOption: 'RAW',
      requestBody: { values: [[ createdAt, type, refId, email, subject||'', text||'', dueDate, 'Pending' ]] }
    })
    return { statusCode: 200, body: JSON.stringify({ ok:true }) }
  } catch (err) { console.error(err); return { statusCode: 500, body: String(err.message || err) } }
}
