export const SETTINGS_PWD = 'Baelys@2025'

export const THEME = {
  c1: '#2563eb', // blue
  c2: '#16a34a', // green
  c3: '#f59e0b', // amber
  c4: '#db2777', // pink
  c5: '#0ea5e9', // sky
  c6: '#a855f7', // purple
  axis: '#475569', // slate-600
  grid: '#cbd5e1'  // slate-300
}

// Preferencias guardadas en el navegador
export const Prefs = {
  get maskSensitive(): boolean { return localStorage.getItem('MASK_SENSITIVE') !== '0' },
  set maskSensitive(v: boolean) { localStorage.setItem('MASK_SENSITIVE', v ? '1' : '0') },

  get notifyEmail(): string { return localStorage.getItem('NOTIFY_EMAIL') || '' },
  set notifyEmail(v: string) { localStorage.setItem('NOTIFY_EMAIL', v) },

  get reportsUnlocked(): boolean { return localStorage.getItem('REPORTS_OK') === '1' },
  set reportsUnlocked(v: boolean) { localStorage.setItem('REPORTS_OK', v ? '1':'0') },
}
