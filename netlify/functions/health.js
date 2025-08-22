const { getSheetsClient } = require('./utils/google')

exports.handler = async () => {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient()
    // Try to fetch spreadsheet metadata (title) and the first row of TareasDiarias (if exists)
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    let firstRow = null
    try {
      const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'TareasDiarias!A1:Z1' })
      firstRow = (resp.data.values && resp.data.values[0]) || null
    } catch (e) { /* ignore if sheet missing */ }
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        spreadsheetTitle: meta.data.properties && meta.data.properties.title,
        hasTareasHeader: !!firstRow,
        message: 'Credentials and access look OK.'
      })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok:false, error: String(err.message || err) })
    }
  }
}