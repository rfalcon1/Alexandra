import { useEffect, useMemo, useState } from 'react'
import { listRows } from '../lib/api'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [sheet, setSheet] = useState<'TareasDiarias' | 'Requisiciones' | 'Candidatos' | 'Todos'>('Todos')
  const [data, setData] = useState<{[k:string]: any[]}>({})

  useEffect(()=>{
    Promise.all([
      listRows('TareasDiarias', 1000),
      listRows('Requisiciones', 1000),
      listRows('Candidatos', 1000),
    ]).then(([t, r, c])=>{
      setData({ TareasDiarias: t.rows, Requisiciones: r.rows, Candidatos: c.rows })
    })
  }, [])

  const results = useMemo(()=>{
    const hay = (x:any) => Object.values(x).some(v => String(v||'').toLowerCase().includes(q.toLowerCase()))
    if (sheet==='Todos') {
      const combined = [
        ...data.TareasDiarias?.map(r=>({__sheet:'TareasDiarias', ...r}))||[],
        ...data.Requisiciones?.map(r=>({__sheet:'Requisiciones', ...r}))||[],
        ...data.Candidatos?.map(r=>({__sheet:'Candidatos', ...r}))||[],
      ]
      return combined.filter(hay).slice(0,500)
    } else {
      return (data[sheet]||[]).filter(hay).slice(0,500)
    }
  }, [q, sheet, data])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-soft p-4 mb-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm text-gray-700">Buscar</label>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ID, nombre, descripción, negocio, etc."
            className="mt-1 w-full rounded-xl border px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-gray-700">Tabla</label>
          <select value={sheet} onChange={e=>setSheet(e.target.value as any)} className="mt-1 rounded-xl border px-3 py-2">
            {['Todos','TareasDiarias','Requisiciones','Candidatos'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-6">Tabla</th>
              <th className="py-2 pr-6">ID/Referencia</th>
              <th className="py-2 pr-6">Descripción/Nombre</th>
              <th className="py-2 pr-6">Estado</th>
              <th className="py-2 pr-6">Extra</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r,i)=>{
              if (r.__sheet==='TareasDiarias') {
                return <tr key={i} className="border-t">
                  <td className="py-2 pr-6">Tareas</td>
                  <td className="py-2 pr-6">{r['Referencia/ID']||''}</td>
                  <td className="py-2 pr-6">{r['Descripción']||''}</td>
                  <td className="py-2 pr-6">{r['Estado']||''}</td>
                  <td className="py-2 pr-6">{r['Negocio']||''} · {r['Área']||''}</td>
                </tr>
              }
              if (r.__sheet==='Requisiciones') {
                return <tr key={i} className="border-t">
                  <td className="py-2 pr-6">Requisiciones</td>
                  <td className="py-2 pr-6">{r['RequisiciónID']||''}</td>
                  <td className="py-2 pr-6">{r['Puesto']||''}</td>
                  <td className="py-2 pr-6">{r['EstadoRequisición']||''}</td>
                  <td className="py-2 pr-6">{r['Negocio']||''} · {r['Área']||''}</td>
                </tr>
              }
              return <tr key={i} className="border-t">
                <td className="py-2 pr-6">Candidatos</td>
                <td className="py-2 pr-6">{r['CandidatoID']||''}</td>
                <td className="py-2 pr-6">{r['Nombre']||''}</td>
                <td className="py-2 pr-6">{r['EstadoCandidato']||''}</td>
                <td className="py-2 pr-6">{r['RequisiciónID']||''} · {r['Fuente']||''}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}