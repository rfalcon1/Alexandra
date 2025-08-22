const TZ = 'America/Puerto_Rico'

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(baseISO: string, days: number): string {
  const [y,m,d] = baseISO.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m-1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth()+1).padStart(2,'0')
  const dd = String(dt.getUTCDate()).padStart(2,'0')
  return `${yy}-${mm}-${dd}`
}

export function isoTodayPR(): string {
  const f = new Intl.DateTimeFormat('en-CA',{ timeZone: 'America/Puerto_Rico', year:'numeric', month:'2-digit', day:'2-digit' })
  return f.format(new Date())
}

export function parse12h(s: string): number {
  if (!s) return NaN
  const m = s.match(/^\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*$/i)
  if (!m) return NaN
  let h = parseInt(m[1],10); const min = parseInt(m[2],10)
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h*60 + min
}

export function diffDHMS(startMin?: number, endMin?: number) {
  const invalid = isNaN(startMin||NaN) || isNaN(endMin||NaN) || (endMin! < startMin!)
  if (invalid) return { min: 0, text: '' }
  let total = (endMin! - startMin!)
  const days = Math.floor(total / (60*24))
  total -= days*60*24
  const hours = Math.floor(total / 60)
  const minutes = total - hours*60
  const parts = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes || parts.length===0) parts.push(`${minutes}m`)
  return { min: (endMin! - startMin!), text: parts.join(' ') }
}

export function fmtDatePR(d: string): string {
  const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return d || ''
  return `${m[2]}/${m[3]}/${m[1]}`
}
