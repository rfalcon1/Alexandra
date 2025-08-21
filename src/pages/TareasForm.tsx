import { useEffect, useMemo, useState } from 'react'
import { Field, Select, TextArea } from '../components/Field'
import { Negocios, Áreas, TiposTarea, Prioridades, EstadosTarea, Tarea } from '../types'
import { addRow, listRows } from '../lib/api'
import { calcDurationMin } from '../lib/validate'

export default function TareasForm() {
  const now = new Date()
  const [form, setForm] = useState<Tarea>({
    Fecha: now.toISOString().slice(0,10),
    HoraInicio: String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0'),
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
    'Referencia/ID': '',
    'Resultado/Acción': '',
    Notas: '',
    'Adjuntos(URL)': ''
  })
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<any[]>([])
  const duration = useMemo(()=>calcDurationMin(form.HoraInicio, form.HoraFin), [form.HoraInicio, form.HoraFin])

  useEffect(()=>{
    listRows('TareasDiarias', 15).then(d=>setRecent(d.rows)).catch(()=>{})
  }, [])

  function set<K extends keyof Tarea>(k:K, v:any){
    setForm(prev=>({...prev, [k]: v }))
  }

  async function submit(e:any){
    e.preventDefault()
    setLoading(true)
    try {
      const values = [
        form.Fecha, form.HoraInicio, form.HoraFin, duration || '',
        form.Negocio, form.Área, form.TipoTarea, form.Subtipo || '',
        form.Descripción, form.Prioridad, form.SLA_Fecha || '', form.Estado,
        form['ClienteInterno/Unidad'] || '', form.Responsable || '', form.Aprobador || '', form['Referencia/ID'] || '',
        form['Resultado/Acción'] || '', form.Notas || '', form['Adjuntos(URL)'] || ''
      ]
      await addRow('TareasDiarias', values)
      alert('Guardado ✅')
      setForm(f=>({...f, Descripción:'', Notas:'', HoraFin:'', 'Referencia/ID':'', 'Resultado/Acción':''}))
      const d = await listRows('TareasDiarias', 15)
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora inicio" type="time" value={form.HoraInicio} onChange={e=>set('HoraInicio', e.target.value)} />
          <Field label="Hora fin" type="time" value={form.HoraFin} onChange={e=>set('HoraFin', e.target.value)} />
          <Field label="Duración (min)" value={String(duration || '')} readOnly />
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
          {Prioridades.map(p=><option key={p}>{p}</option>)}
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

      <div className="mt-6 bg-white p-4 rounded-2xl shadow-soft">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Últimas tareas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                {['Fecha','Inicio','Fin','Min','Negocio','Área','Tipo','Descripción','Prioridad','Estado'].map(h=>(
                  <th key={h} className="py-2 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2 pr-6">{r.Fecha||''}</td>
                  <td className="py-2 pr-6">{r.HoraInicio||''}</td>
                  <td className="py-2 pr-6">{r.HoraFin||''}</td>
                  <td className="py-2 pr-6">{r['DuraciónMin']||''}</td>
                  <td className="py-2 pr-6">{r.Negocio||''}</td>
                  <td className="py-2 pr-6">{r['Área']||''}</td>
                  <td className="py-2 pr-6">{r['TipoTarea']||''}</td>
                  <td className="py-2 pr-6 max-w-[300px] truncate">{r['Descripción']||''}</td>
                  <td className="py-2 pr-6">{r['Prioridad']||''}</td>
                  <td className="py-2 pr-6">{r['Estado']||''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}