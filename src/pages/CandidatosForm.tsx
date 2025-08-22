import { useEffect, useState } from 'react'
import { Field, Select, TextArea } from '../components/Field'
import { addRow } from '../lib/api'
import { todayISO, addDaysISO } from '../lib/format'
import { fetchCatalogs } from '../lib/catalogs'
import { Prefs } from '../config'

function genId() {
  const t = new Date()
  const ts = t.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)
  const rnd = Math.random().toString(36).slice(2,6).toUpperCase()
  return `CAN-${ts}-${rnd}`
}

export default function CandidatosForm() {
  const [catalogs, setCatalogs] = useState<Record<string,string[]>>({})
  const [form, setForm] = useState<any>({
    CandidatoID: genId(), RequisiciónID: '',
    Nombre: '', Email: '', Teléfono: '',
    Fuente: 'LinkedIn', EstadoCandidato: 'Aplicó', FechaEstado: todayISO(),
    PróximoPaso: '', RecordatorioFecha: '', RecordatorioEn: '',
    'Calificación(1-5)': '', Clasificación: '', Notas: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetchCatalogs().then(setCatalogs).catch(()=>{}) }, [])
  function set<K extends keyof any>(k:K, v:any){ setForm((prev:any)=>({...prev, [k]: v })) }

  function calcDueDate(): string | null {
    if (form.RecordatorioFecha) return form.RecordatorioFecha
    const map:any = { '2d':2, '3d':3, '7d':7, '14d':14, '30d':30 }
    if (map[form.RecordatorioEn]) return addDaysISO(todayISO(), map[form.RecordatorioEn])
    return null
  }

  async function submit(e:any){
    e.preventDefault()
    setLoading(true)
    try {
      const values = [
        form.CandidatoID, form.RequisiciónID, form.Nombre, form.Email || '',
        form.Teléfono || '', form.Fuente || '', form.EstadoCandidato, form.FechaEstado || '',
        form.PróximoPaso || '', form.RecordatorioFecha || '', form['Calificación(1-5)'] || '', form.Clasificación || '', form.Notas || ''
      ]
      await addRow('Candidatos', values)

      const due = calcDueDate()
      if (Prefs.notifyEmail && due) {
        await fetch('/.netlify/functions/enqueueReminder', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            type: 'Candidato',
            refId: form.CandidatoID,
            email: Prefs.notifyEmail,
            subject: `Recordatorio — Candidato ${form.CandidatoID}`,
            text: `Nombre: ${form.Nombre || '(sin nombre)'}\nPróximo paso: ${form.PróximoPaso || 'N/A'}`,
            dueDate: due
          })
        })
      }

      alert('Guardado ✅')
      setForm((f:any)=>({...f, CandidatoID: genId(), Notas:'', RecordatorioEn:'', RecordatorioFecha:''}))
    } catch (err:any) { alert('Error: ' + err.message) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <Field label="Candidato ID" value={form.CandidatoID} onChange={e=>set('CandidatoID', e.target.value)} />
        <Field label="Requisición ID" value={form.RequisiciónID} onChange={e=>set('RequisiciónID', e.target.value)} />
        <Field label="Nombre" value={form.Nombre} onChange={e=>set('Nombre', e.target.value)} />
        <Field label="Email" type="email" value={form.Email} onChange={e=>set('Email', e.target.value)} />
        <Field label="Teléfono" value={form.Teléfono} onChange={e=>set('Teléfono', e.target.value)} />
        <Select label="Fuente" value={form.Fuente} onChange={e=>set('Fuente', e.target.value)}>
          {(catalogs['FuentesCandidato']||[]).map((s:string)=><option key={s}>{s}</option>)}
        </Select>
        <Select label="Estado" value={form.EstadoCandidato} onChange={e=>set('EstadoCandidato', e.target.value)}>
          {(catalogs['EstadoCandidato']||[]).map((s:string)=><option key={s}>{s}</option>)}
        </Select>
        <Field label="Fecha estado" type="date" value={form.FechaEstado} onChange={e=>set('FechaEstado', e.target.value)} />
        <Select label="Próximo paso" value={form.PróximoPaso} onChange={e=>set('PróximoPaso', e.target.value)}>
          <option value=""></option>
          {(catalogs['Próximo paso']||[]).map((s:string)=><option key={s}>{s}</option>)}
        </Select>
        <Field label="Recordatorio (fecha exacta)" type="date" value={form.RecordatorioFecha} onChange={e=>set('RecordatorioFecha', e.target.value)} />
        <Select label="o Recordatorio en" value={form.RecordatorioEn} onChange={e=>set('RecordatorioEn', e.target.value)}>
          <option value=""></option>
          <option value="2d">2 días</option>
          <option value="3d">3 días</option>
          <option value="7d">1 semana</option>
          <option value="14d">2 semanas</option>
          <option value="30d">1 mes</option>
        </Select>
        <Field label="Calificación (1-5)" type="number" min={1} max={5} value={String(form['Calificación(1-5)']||'')} onChange={e=>set('Calificación(1-5)', Number(e.target.value))} />
        <Select label="Clasificación" value={form.Clasificación} onChange={e=>set('Clasificación', e.target.value)}>
          <option value=""></option>
          {(catalogs['Clasificación']||['A','B','C']).map((s:string)=><option key={s}>{s}</option>)}
        </Select>
        <TextArea label="Notas" rows={2} value={form.Notas} onChange={e=>set('Notas', e.target.value)} />
        <div className="md:col-span-2 flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Guardando…' : 'Guardar candidato'}</button>
        </div>
      </form>
    </div>
  )
}
