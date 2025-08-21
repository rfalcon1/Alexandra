import { useEffect, useState } from 'react'
import { Field, Select, TextArea } from '../components/Field'
import { EstadosCandidato, Candidato } from '../types'
import { addRow, listRows } from '../lib/api'

export default function CandidatosForm() {
  const [form, setForm] = useState<Candidato>({
    CandidatoID: '',
    RequisiciónID: '',
    Nombre: '',
    Email: '',
    Teléfono: '',
    Fuente: 'LinkedIn',
    EstadoCandidato: 'Aplicó',
    FechaEstado: new Date().toISOString().slice(0,10),
    PróximoPaso: '',
    'Calificación(1-5)': '',
    Notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(()=>{
    listRows('Candidatos', 15).then(d=>setRecent(d.rows)).catch(()=>{})
  }, [])

  function set<K extends keyof Candidato>(k:K, v:any){
    setForm(prev=>({...prev, [k]: v }))
  }

  async function submit(e:any){
    e.preventDefault()
    setLoading(true)
    try {
      const values = [
        form.CandidatoID, form.RequisiciónID, form.Nombre, form.Email || '',
        form.Teléfono || '', form.Fuente || '', form.EstadoCandidato, form.FechaEstado || '',
        form.PróximoPaso || '', form['Calificación(1-5)'] || '', form.Notas || ''
      ]
      await addRow('Candidatos', values)
      alert('Guardado ✅')
      const d = await listRows('Candidatos', 15)
      setRecent(d.rows)
      setForm(f=>({...f, Notas:''}))
    } catch (err:any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-soft">
        <Field label="Candidato ID" value={form.CandidatoID} onChange={e=>set('CandidatoID', e.target.value)} />
        <Field label="Requisición ID" value={form.RequisiciónID} onChange={e=>set('RequisiciónID', e.target.value)} />
        <Field label="Nombre" value={form.Nombre} onChange={e=>set('Nombre', e.target.value)} />
        <Field label="Email" type="email" value={form.Email} onChange={e=>set('Email', e.target.value)} />
        <Field label="Teléfono" value={form.Teléfono} onChange={e=>set('Teléfono', e.target.value)} />
        <Field label="Fuente" value={form.Fuente} onChange={e=>set('Fuente', e.target.value)} />
        <Select label="Estado" value={form.EstadoCandidato} onChange={e=>set('EstadoCandidato', e.target.value)}>
          {['Aplicó','Screening','Entrevista 1','Entrevista 2','Oferta','Rechazado','Contratado'].map(s=><option key={s}>{s}</option>)}
        </Select>
        <Field label="Fecha estado" type="date" value={form.FechaEstado} onChange={e=>set('FechaEstado', e.target.value)} />
        <Field label="Próximo paso" value={form.PróximoPaso} onChange={e=>set('PróximoPaso', e.target.value)} />
        <Field label="Calificación (1-5)" type="number" min={1} max={5} value={String(form['Calificación(1-5)']||'')} onChange={e=>set('Calificación(1-5)', Number(e.target.value))} />
        <TextArea label="Notas" rows={2} value={form.Notas} onChange={e=>set('Notas', e.target.value)} />
        <div className="md:col-span-2 flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Guardando…' : 'Guardar candidato'}</button>
        </div>
      </form>

      <div className="mt-6 bg-white p-4 rounded-2xl shadow-soft">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Últimos candidatos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                {['ID','ReqID','Nombre','Estado','Fecha','Próximo paso','Calif.'].map(h=>(
                  <th key={h} className="py-2 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2 pr-6">{r['CandidatoID']||''}</td>
                  <td className="py-2 pr-6">{r['RequisiciónID']||''}</td>
                  <td className="py-2 pr-6">{r['Nombre']||''}</td>
                  <td className="py-2 pr-6">{r['EstadoCandidato']||''}</td>
                  <td className="py-2 pr-6">{r['FechaEstado']||''}</td>
                  <td className="py-2 pr-6">{r['PróximoPaso']||''}</td>
                  <td className="py-2 pr-6">{r['Calificación(1-5)']||''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}