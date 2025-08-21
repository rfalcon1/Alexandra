const { google } = require('googleapis')

function getAuth() {
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT
  if (!saRaw) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT env var')
  let creds
  try { creds = JSON.parse(saRaw) } catch (e) { throw new Error('GOOGLE_SERVICE_ACCOUNT must be JSON') }
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
  return { sheets, spreadsheetId }
}

module.exports = { getSheetsClient }