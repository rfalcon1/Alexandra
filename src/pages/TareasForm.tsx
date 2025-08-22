import { useEffect, useMemo, useState } from 'react'
import { Field, Select, TextArea } from '../components/Field'
import { addRow } from '../lib/api'
import { parse12h, diffDHMS, todayISO } from '../lib/format'
import { fetchCatalogs } from '../lib/catalogs'
import { Prefs } from '../config'

function genId() {
  const t = new Date()
  const ts = t.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)
  const rnd = Math.random().toString(36).slice(2,6).toUpperCase()
  return `TASK-${ts}-${rnd}`
}

function timeOptions(){
  const out:string[] = []
  const labels=(n:number)=>{
    const h = Math.floor(n/60)
    const m = n%60
    const ampm = h>=12?'PM':'AM'
    const hh = h%12===0?12:h%12
    return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`
  }
  for (let n=0; n<24*60; n+=15) out.push(labels(n))
  return out
}
const TIMES = timeOptions()

export default function TareasForm() {
  const [catalogs, setCatalogs] = useState<Record<string,string[]>>({})
  const [form, setForm] = useState<any>({
    Fecha: todayISO(),
    HoraInicio: '08:00 AM',
    HoraFin: '',
    Negocio: 'Banca Retail',
    Área: 'Reclutamiento',
    TipoTarea: 'Reunión',
    Subtipo: '',
    Descripción: '',
    Prioridad: 'Media',
    SLA_Fecha: '',
    Estado: 'En proceso',
    'ClienteInterno/Unidad': '',
    Responsable: '',
    Aprobador: '',
    'Referencia/ID': genId(),
    'Resultado/Acción': '',
    'SLA_NotaExtension': '',
    Notas: '',
    'Adjuntos(URL)': ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetchCatalogs().then(setCatalogs).catch(()=>{}) }, [])

  function set<K extends keyof any>(k:K, v:any){ setForm((prev:any)=>({...prev, [k]: v })) }

  const startMin = useMemo(()=>parse12h(form.HoraInicio), [form.HoraInicio])
  const endMin = useMemo(()=>parse12h(form.HoraFin), [form.HoraFin])
  const diff = useMemo(()=>diffDHMS(startMin, endMin), [startMin, endMin])

  async function submit(e:any){
    e.preventDefault()
    setLoading(true)
    try {
      const values = [
        form.Fecha, form.HoraInicio, form.HoraFin, diff.min || '',
        form.Negocio, form.Área, form.TipoTarea, form.Subtipo || '',
        form.Descripción, form.Prioridad, form.SLA_Fecha || '', form.Estado,
        form['ClienteInterno/Unidad'] || '', form.Responsable || '', form.Aprobador || '', form['Referencia/ID'] || '',
        form['Resultado/Acción'] || '', form['SLA_NotaExtension'] || '', form.Notas || '', form['Adjuntos(URL)'] || ''
      ]
      await addRow('TareasDiarias', values)
      alert('Guardado ✅')
      setForm((f:any)=>({...f, Descripción:'', Notas:'', HoraFin:'', 'Referencia/ID': genId(), 'Resultado/Acción':'', 'SLA_NotaExtension':''}))
    } catch (err:any) { alert('Error: ' + err.message) } finally { setLoading(false) }
  }

  async function quickNotify(){
    if (!Prefs.notifyEmail) { alert('Configura tu email en Ajustes.'); return }
    const body = {
      to: Prefs.notifyEmail,
      subject: 'Recordatorio de SLA/Seguimiento — HRBP',
      text: `Tarea ${form['Referencia/ID']} — ${form.Descripción || '(sin descripción)'}\nSLA: ${form.SLA_Fecha || 'N/A'}`
    }
    const res = await fetch('/.netlify/functions/notify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    const ok = res.ok
    const msg = await res.text()
    alert(ok ? 'Recordatorio enviado ✅' : 'No se pudo enviar: ' + msg)
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <Field label="Fecha" type="date" value={form.Fecha} onChange={e=>set('Fecha', e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <Select label="Hora inicio (12h)" value={form.HoraInicio} onChange={e=>set('HoraInicio', e.target.value)}>
            {TIMES.map(t=><option key={t}>{t}</option>)}
          </Select>
          <Select label="Hora fin (12h)" value={form.HoraFin} onChange={e=>set('HoraFin', e.target.value)}>
            <option value=""></option>
            {TIMES.map(t=><option key={t}>{t}</option>)}
          </Select>
          <Field label="Duración" value={diff.text} readOnly />
        </div>

        <Select label="Negocio" value={form.Negocio} onChange={e=>set('Negocio', e.target.value)}>
          {(catalogs['Negocios']||[]).map((n:string)=><option key={n}>{n}</option>)}
        </Select>
        <Select label="Área" value={form.Área} onChange={e=>set('Área', e.target.value)}>
          {(catalogs['Áreas']||[]).map((a:string)=><option key={a}>{a}</option>)}
        </Select>
        <Select label="Tipo de tarea" value={form.TipoTarea} onChange={e=>set('TipoTarea', e.target.value)}>
          {(catalogs['TiposTarea']||[]).map((t:string)=><option key={t}>{t}</option>)}
        </Select>
        <Select label="Subtipo/Detalle" value={form.Subtipo} onChange={e=>set('Subtipo', e.target.value)}>
          <option value=""></option>
          {(catalogs['Subtipo/Detalle']||[]).map((t:string)=><option key={t}>{t}</option>)}
        </Select>

        <TextArea label="Descripción" rows={3} value={form.Descripción} onChange={e=>set('Descripción', e.target.value)} />
        <Select label="Prioridad" value={form.Prioridad} onChange={e=>set('Prioridad', e.target.value)}>
          {(catalogs['Prioridad']||['Baja','Media','Alta','Crítica']).map((p:string)=><option key={p}>{p}</option>)}
        </Select>
        <Field label="SLA (fecha)" type="date" value={form.SLA_Fecha} onChange={e=>set('SLA_Fecha', e.target.value)} />
        <TextArea label="Nota extensión SLA" rows={2} value={form['SLA_NotaExtension']} onChange={e=>set('SLA_NotaExtension', e.target.value)} />

        <Select label="Estado" value={form.Estado} onChange={e=>set('Estado', e.target.value)}>
          {(catalogs['EstadoTarea']||[]).map((s:string)=><option key={s}>{s}</option>)}
        </Select>
        <Select label="Cliente interno/Unidad" value={form['ClienteInterno/Unidad']} onChange={e=>set('ClienteInterno/Unidad', e.target.value)}>
          <option value=""></option>
          {(catalogs['ClienteInterno/Unidad']||[]).map((t:string)=><option key={t}>{t}</option>)}
        </Select>
        <Select label="Responsable" value={form.Responsable} onChange={e=>set('Responsable', e.target.value)}>
          <option value=""></option>
          {(catalogs['Responsable']||[]).map((t:string)=><option key={t}>{t}</option>)}
        </Select>
        <Select label="Aprobador" value={form.Aprobador} onChange={e=>set('Aprobador', e.target.value)}>
          <option value=""></option>
          {(catalogs['Aprobador']||[]).map((t:string)=><option key={t}>{t}</option>)}
        </Select>
        <Field label="Referencia/ID" value={form['Referencia/ID']} onChange={e=>set('Referencia/ID', e.target.value)} />
        <Select label="Resultado/Acción" value={form['Resultado/Acción']} onChange={e=>set('Resultado/Acción', e.target.value)}>
          <option value=""></option>
          {(catalogs['Resultado/Acción']||[]).map((t:string)=><option key={t}>{t}</option>)}
        </Select>

        <TextArea label="Notas" rows={2} value={form.Notas} onChange={e=>set('Notas', e.target.value)} />
        <Field label="Adjuntos (URL)" value={form['Adjuntos(URL)']} onChange={e=>set('Adjuntos(URL)', e.target.value)} />
        <div className="md:col-span-2 flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Guardando…' : 'Guardar tarea'}</button>
          <button type="button" onClick={quickNotify} className="px-4 py-2 rounded-2xl bg-amber-500 text-white">Enviar recordatorio</button>
        </div>
      </form>
    </div>
  )
}
