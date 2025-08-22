const { google } = require('googleapis')

function readServiceAccount() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64
  let parsed
  if (rawJson && rawJson.trim()) {
    try { parsed = JSON.parse(rawJson) } catch (e) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT is not valid JSON. Tip: minify to one line or use GOOGLE_SERVICE_ACCOUNT_BASE64.')
    }
  } else if (b64 && b64.trim()) {
    try {
      const jsonStr = Buffer.from(b64, 'base64').toString('utf8')
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      throw new Error('Failed to decode GOOGLE_SERVICE_ACCOUNT_BASE64. Ensure it is base64 of the full JSON content.')
    }
  } else {
    throw new Error('Missing credentials: set GOOGLE_SERVICE_ACCOUNT (JSON, one line) or GOOGLE_SERVICE_ACCOUNT_BASE64 (base64).')
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service Account JSON missing client_email or private_key.')
  }
  return parsed
}

function getAuth() {
  const creds = readServiceAccount()
  const scopes = ['https://www.googleapis.com/auth/spreadsheets']
  const auth = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    scopes
  )
  return auth
}
function getSheetId() {
  const id = process.env.SHEET_ID
  if (!id) throw new Error('Missing SHEET_ID env var')
  return id
}
async function getSheetsClient() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = getSheetId()
  return { sheets, spreadsheetId, auth }
}
module.exports = { getSheetsClient }