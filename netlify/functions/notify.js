exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const body = JSON.parse(event.body||'{}')
    const to = body.to
    const subject = body.subject || 'Notificación HRBP'
    const text = body.text || 'Recordatorio'
    if (!to) return { statusCode: 400, body: 'to required' }

    const from = process.env.NOTIFY_FROM || 'no-reply@example.com'

    // Resend (recomendado)
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({ from, to, subject, text })
      })
      const j = await res.text()
      return { statusCode: res.ok ? 200 : 500, body: j }
    }

    // SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method:'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type:'text/plain', value: text }]
        })
      })
      const j = await res.text()
      return { statusCode: res.ok ? 200 : 500, body: j }
    }

    return { statusCode: 501, body: 'No email provider configured. Set RESEND_API_KEY or SENDGRID_API_KEY + NOTIFY_FROM in Netlify env.' }
  } catch (err) {
    return { statusCode: 500, body: String(err.message || err) }
  }
}
