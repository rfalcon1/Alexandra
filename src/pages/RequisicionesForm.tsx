import { useEffect, useState } from 'react'
import { Field, Select, TextArea } from '../components/Field'
import { Negocios, Áreas, EstadosRequisición, Requisición } from '../types'
import { addRow, listRows } from '../lib/api'

export default function RequisicionesForm() {
  const [form, setForm] = useState<Requisición>({
    RequisiciónID: '',
    Negocio: 'Banca Retail',
    Puesto: '',
    Ubicación: '',
    Área: 'Reclutamiento',
    TipoContrato: 'Tiempo completo',
    FechaPublicación: new Date().toISOString().slice(0,10),
    SLA_Cierre: '',
    EstadoRequisición: 'Abierta',
    Responsable: '',
    Aprobador: '',
    Notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(()=>{
    listRows('Requisiciones', 15).then(d=>setRecent(d.rows)).catch(()=>{})
  }, [])

  function set<K extends keyof Requisición>(k:K, v:any){
    setForm(prev=>({...prev, [k]: v }))
  }

  async function submit(e:any){
    e.preventDefault()
    setLoading(true)
    try {
      const values = [
        form.RequisiciónID, form.Negocio, form.Puesto, form.Ubicación || '',
        form.Área, form.TipoContrato || '', form.FechaPublicación || '', form.SLA_Cierre || '',
        form.EstadoRequisición, form.Responsable || '', form.Aprobador || '', form.Notas || ''
      ]
      await addRow('Requisiciones', values)
      alert('Guardado ✅')
      const d = await listRows('Requisiciones', 15)
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
        <Field label="Requisición ID" value={form.RequisiciónID} onChange={e=>set('RequisiciónID', e.target.value)} />
        <Select label="Negocio" value={form.Negocio} onChange={e=>set('Negocio', e.target.value)}>
          {Negocios.map(n=><option key={n}>{n}</option>)}
        </Select>
        <Field label="Puesto" value={form.Puesto} onChange={e=>set('Puesto', e.target.value)} />
        <Field label="Ubicación" value={form.Ubicación} onChange={e=>set('Ubicación', e.target.value)} />
        <Select label="Área" value={form.Área} onChange={e=>set('Área', e.target.value)}>
          {Áreas.map(a=><option key={a}>{a}</option>)}
        </Select>
        <Field label="Tipo de contrato" value={form.TipoContrato} onChange={e=>set('TipoContrato', e.target.value)} />
        <Field label="Fecha de publicación" type="date" value={form.FechaPublicación} onChange={e=>set('FechaPublicación', e.target.value)} />
        <Field label="SLA cierre" type="date" value={form.SLA_Cierre} onChange={e=>set('SLA_Cierre', e.target.value)} />
        <Select label="Estado" value={form.EstadoRequisición} onChange={e=>set('EstadoRequisición', e.target.value)}>
          {EstadosRequisición.map(s=><option key={s}>{s}</option>)}
        </Select>
        <Field label="Responsable" value={form.Responsable} onChange={e=>set('Responsable', e.target.value)} />
        <Field label="Aprobador" value={form.Aprobador} onChange={e=>set('Aprobador', e.target.value)} />
        <TextArea label="Notas" rows={2} value={form.Notas} onChange={e=>set('Notas', e.target.value)} />
        <div className="md:col-span-2 flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Guardando…' : 'Guardar requisición'}</button>
        </div>
      </form>

      <div className="mt-6 bg-white p-4 rounded-2xl shadow-soft">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Últimas requisiciones</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                {['ID','Negocio','Puesto','Ubicación','Área','Estado','Publicación'].map(h=>(
                  <th key={h} className="py-2 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2 pr-6">{r['RequisiciónID']||''}</td>
                  <td className="py-2 pr-6">{r['Negocio']||''}</td>
                  <td className="py-2 pr-6">{r['Puesto']||''}</td>
                  <td className="py-2 pr-6">{r['Ubicación']||''}</td>
                  <td className="py-2 pr-6">{r['Área']||''}</td>
                  <td className="py-2 pr-6">{r['EstadoRequisición']||''}</td>
                  <td className="py-2 pr-6">{r['FechaPublicación']||''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}