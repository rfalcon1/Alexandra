const { getSheetsClient } = require('./utils/google')

const ID_COL = {
  'TareasDiarias': 'Referencia/ID',
  'Requisiciones': 'RequisiciónID',
  'Candidatos': 'CandidatoID'
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const body = JSON.parse(event.body||'{}')
    const { sheet, id, values } = body
    if (!sheet || !id || !values) return { statusCode: 400, body: 'sheet, id and values are required' }

    const { sheets, spreadsheetId } = await getSheetsClient()
    const readRange = `${sheet}!A1:ZZ`
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: readRange })
    const rows = resp.data.values || []
    if (rows.length === 0) return { statusCode: 404, body: 'Sheet empty' }

    const header = rows[0]
    const idxByName = Object.fromEntries(header.map((h,i)=>[h,i]))
    const idColName = ID_COL[sheet] || header[0]
    const idIdx = idxByName[idColName]
    if (typeof idIdx === 'undefined') return { statusCode: 400, body: `ID column not found in header (${idColName})` }

    let foundIndex = -1
    for (let r=1;r<rows.length;r++){
      const row = rows[r]
      if ((row[idIdx]||'') === id) { foundIndex = r; break }
    }
    if (foundIndex === -1) return { statusCode: 404, body: 'Row not found' }

    // Build full row array by header order
    const newRow = header.map(h => (values[h] !== undefined ? String(values[h]) : (rows[foundIndex][idxByName[h]] || '')))

    const lastColLetter = (n) => {
      // n = header length
      let s = ''
      let x = n
      while (x > 0) {
        x--
        s = String.fromCharCode(65 + (x % 26)) + s
        x = Math.floor(x / 26)
      }
      return s
    }
    const lastCol = lastColLetter(header.length)
    const writeRange = `${sheet}!A${foundIndex+1}:${lastCol}${foundIndex+1}`

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: writeRange,
      valueInputOption: 'RAW',
      requestBody: { values: [ newRow ] }
    })

    return { statusCode: 200, body: JSON.stringify({ ok:true, row: newRow, rowIndex: foundIndex+1 }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: String(err.message || err) }
  }
}