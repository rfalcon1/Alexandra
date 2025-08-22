const TZ = 'America/Puerto_Rico'
const LOCALE = 'es-PR'

export function todayISO() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth()+1).padStart(2,'0')
  const d = String(now.getDate()).padStart(2,'0')
  return `${y}-${m}-${d}`
}

export function parse12h(str: string): number | null {
  if (!str) return null
  const m = str.trim().match(/^([0]?[1-9]|1[0-2]):([0-5][0-9])\s*([AaPp][Mm])$/)
  if (!m) return null
  let h = parseInt(m[1],10)
  const min = parseInt(m[2],10)
  const ampm = m[3].toUpperCase()
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  return h*60 + min
}

export function diffDHMS(startMin: number | null, endMin: number | null): {min:number, text:string} {
  if (startMin==null || endMin==null) return { min: 0, text: '' }
  let diff = endMin - startMin
  if (diff < 0) diff += 24*60
  const days = Math.floor(diff / (24*60))
  const hrs = Math.floor((diff % (24*60))/60)
  const mins = diff % 60
  const parts = []
  if (days) parts.push(`${days}d`)
  if (hrs) parts.push(`${hrs}h`)
  if (mins || parts.length===0) parts.push(`${mins}m`)
  return { min: diff, text: parts.join(' ') }
}

export function fmtDatePR(dISO: string): string {
  try {
    const d = new Date(dISO + 'T00:00:00')
    return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit' }).format(d)
  } catch { return dISO }
}