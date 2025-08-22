import { useEffect, useMemo, useState } from 'react'
import { Field, Select, TextArea } from '../components/Field'
import { Negocios, Áreas, TiposTarea, Prioridades, EstadosTarea, Tarea } from '../types'
import { addRow, listRows } from '../lib/api'
import { parse12h, diffDHMS, todayISO } from '../lib/format'

function genId() {
  const t = new Date()
  const ts = t.toISOString().replace(/[-:TZ.]/g,'').slice(0,14)
  const rnd = Math.random().toString(36).slice(2,6).toUpperCase()
  return `TASK-${ts}-${rnd}`
}

export default function TareasForm() {
  const [form, setForm] = useState<Tarea>({
    Fecha: todayISO(),
    HoraInicio: '08:00 AM',
    HoraFin: '',
    DuraciónMin: '',
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
    Notas: '',
    'Adjuntos(URL)': ''
  })
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(()=>{
    listRows('TareasDiarias', 50).then(d=>setRecent(d.rows)).catch(()=>{})
  }, [])

  function set<K extends keyof Tarea>(k:K, v:any){
    setForm(prev=>({...prev, [k]: v }))
  }

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
        form['Resultado/Acción'] || '', form.Notas || '', form['Adjuntos(URL)'] || ''
      ]
      await addRow('TareasDiarias', values)
      alert('Guardado ✅')
      setForm(f=>({...f, Descripción:'', Notas:'', HoraFin:'', 'Referencia/ID': genId(), 'Resultado/Acción':''}))
      const d = await listRows('TareasDiarias', 50)
      setRecent(d.rows)
    } catch (err:any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <Field label="Fecha" type="date" value={form.Fecha} onChange={e=>set('Fecha', e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Hora inicio (12h)" placeholder="hh:mm AM/PM" value={form.HoraInicio} onChange={e=>set('HoraInicio', e.target.value)} />
          <Field label="Hora fin (12h)" placeholder="hh:mm AM/PM" value={form.HoraFin} onChange={e=>set('HoraFin', e.target.value)} />
          <Field label="Duración" value={diff.text} readOnly />
        </div>
        <Select label="Negocio" value={form.Negocio} onChange={e=>set('Negocio', e.target.value)}>
          {Negocios.map(n=><option key={n}>{n}</option>)}
        </Select>
        <Select label="Área" value={form.Área} onChange={e=>set('Área', e.target.value)}>
          {Áreas.map(a=><option key={a}>{a}</option>)}
        </Select>
        <Select label="Tipo de tarea" value={form.TipoTarea} onChange={e=>set('TipoTarea', e.target.value)}>
          {TiposTarea.map(t=><option key={t}>{t}</option>)}
        </Select>
        <Field label="Subtipo/Detalle" value={form.Subtipo} onChange={e=>set('Subtipo', e.target.value)} />
        <TextArea label="Descripción" rows={3} value={form.Descripción} onChange={e=>set('Descripción', e.target.value)} />
        <Select label="Prioridad" value={form.Prioridad} onChange={e=>set('Prioridad', e.target.value)}>
          {['Baja','Media','Alta','Crítica'].map(p=><option key={p}>{p}</option>)}
        </Select>
        <Field label="SLA (fecha)" type="date" value={form.SLA_Fecha} onChange={e=>set('SLA_Fecha', e.target.value)} />
        <Select label="Estado" value={form.Estado} onChange={e=>set('Estado', e.target.value)}>
          {EstadosTarea.map(s=><option key={s}>{s}</option>)}
        </Select>
        <Field label="Cliente interno/Unidad" value={form['ClienteInterno/Unidad']} onChange={e=>set('ClienteInterno/Unidad', e.target.value)} />
        <Field label="Responsable" value={form.Responsable} onChange={e=>set('Responsable', e.target.value)} />
        <Field label="Aprobador" value={form.Aprobador} onChange={e=>set('Aprobador', e.target.value)} />
        <Field label="Referencia/ID" value={form['Referencia/ID']} onChange={e=>set('Referencia/ID', e.target.value)} />
        <Field label="Resultado/Acción" value={form['Resultado/Acción']} onChange={e=>set('Resultado/Acción', e.target.value)} />
        <TextArea label="Notas" rows={2} value={form.Notas} onChange={e=>set('Notas', e.target.value)} />
        <Field label="Adjuntos (URL)" value={form['Adjuntos(URL)']} onChange={e=>set('Adjuntos(URL)', e.target.value)} />
        <div className="md:col-span-2 flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Guardando…' : 'Guardar tarea'}</button>
        </div>
      </form>
    </div>
  )
}