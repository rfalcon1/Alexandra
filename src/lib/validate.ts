export const required = (v?: string) => (v && v.trim().length > 0) ? undefined : 'Requerido'

export function calcDurationMin(hini: string, hfin: string) {
  try {
    if (!hini || !hfin) return ''
    const [hi, mi] = hini.split(':').map(Number)
    const [hf, mf] = hfin.split(':').map(Number)
    let start = hi*60 + mi
    let end = hf*60 + mf
    if (end < start) end += 24*60
    return end - start
  } catch { return '' }
}