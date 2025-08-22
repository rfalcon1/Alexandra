const { getSheetsClient } = require('./utils/google')

const ID_COL = {
  'TareasDiarias': 'Referencia/ID',
  'Requisiciones': 'RequisiciónID',
  'Candidatos': 'CandidatoID'
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const sheet = event.queryStringParameters && event.queryStringParameters.sheet
    const id = event.queryStringParameters && event.queryStringParameters.id
    if (!sheet || !id) return { statusCode: 400, body: 'sheet and id are required' }

    const { sheets, spreadsheetId } = await getSheetsClient()
    const range = `${sheet}!A1:ZZ`
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const values = resp.data.values || []
    if (values.length === 0) return { statusCode: 404, body: 'Sheet empty' }

    const header = values[0]
    const idxByName = Object.fromEntries(header.map((h,i)=>[h,i]))
    const idColName = ID_COL[sheet] || header[0]
    const idIdx = idxByName[idColName]
    if (typeof idIdx === 'undefined') return { statusCode: 400, body: `ID column not found in header (${idColName})` }

    for (let r=1;r<values.length;r++){
      const row = values[r]
      if ((row[idIdx]||'') === id) {
        const obj = {}
        header.forEach((h,i)=>{ obj[h] = row[i] || '' })
        return { statusCode: 200, body: JSON.stringify({ header, rowIndex: r+1, data: obj }) }
      }
    }
    return { statusCode: 404, body: 'Row not found' }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: String(err.message || err) }
  }
}