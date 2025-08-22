const { getSheetsClient } = require('./utils/google')

async function ensureSheet(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const has = (meta.data.sheets||[]).some(s => s.properties && s.properties.title === 'Recordatorios')
  if (!has) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [ { addSheet: { properties: { title: 'Recordatorios' } } } ] }
    })
  }
}

function todayPRISO() {
  const f = new Intl.DateTimeFormat('en-CA',{ timeZone:'America/Puerto_Rico', year:'numeric', month:'2-digit', day:'2-digit' })
  return f.format(new Date())
}

async function sendEmail({ to, subject, text }) {
  const from = process.env.NOTIFY_FROM || 'no-reply@example.com'
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from, to, subject, text })
    })
    if (!res.ok) throw new Error(await res.text())
    return await res.json()
  }
  if (process.env.SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method:'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from }, subject,
        content: [{ type:'text/plain', value: text }]
      })
    })
    if (!res.ok) throw new Error(await res.text())
    return { ok: true }
  }
  throw new Error('No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY + NOTIFY_FROM')
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
  // Optional token auth
  const token = (event.queryStringParameters && event.queryStringParameters.token) || ''
  const need = process.env.REMINDERS_TOKEN || ''
  if (need && token !== need) {
    return { statusCode: 401, body: 'Unauthorized' }
  }
  try {
    const { sheets, spreadsheetId } = await getSheetsClient()
    await ensureSheet(sheets, spreadsheetId)
    const range = 'Recordatorios!A1:H'
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const values = resp.data.values || []
    if (values.length <= 1) { return { statusCode: 200, body: JSON.stringify({ ok:true, processed: 0 }) } }
    const [header, ...rows] = values
    const idx = (name) => header.indexOf(name)
    const I_EMAIL = idx('Email'), I_SUBJ = idx('Subject'), I_TEXT = idx('Text')
    const I_DUE = idx('DueDate'), I_STATUS = idx('Status'), I_TYPE = idx('Type'), I_REF = idx('RefID')

    const today = todayPRISO()
    let processed = 0
    const updated = [header, ...rows]

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]
      const status = row[I_STATUS] || ''
      const due = row[I_DUE] || ''
      if (status === 'Pending' && due && due <= today) {
        try {
          await sendEmail({ to: row[I_EMAIL], subject: row[I_SUBJ] || `Recordatorio ${row[I_TYPE]} ${row[I_REF]}`, text: row[I_TEXT] || '' })
          updated[r+1][I_STATUS] = 'Sent ' + new Date().toISOString()
          processed++
        } catch (e) {
          updated[r+1][I_STATUS] = 'Error: ' + (e.message || String(e))
        }
      }
    }

    if (processed > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId, range, valueInputOption: 'RAW', requestBody: { values: updated }
      })
    }

    return { statusCode: 200, body: JSON.stringify({ ok:true, processed }) }
  } catch (err) { console.error(err); return { statusCode: 500, body: String(err.message || err) } }
}
