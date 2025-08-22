import { useEffect, useMemo, useState } from 'react'
import { listRows, getRow, updateRow } from '../lib/api'
import { Prefs } from '../config'
import { fetchCatalogs } from '../lib/catalogs'

function mask(v: any) {
  if (!Prefs.maskSensitive) return String(v||'')
  if (!v) return ''
  const s = String(v)
  if (s.length <= 2) return '••'
  if (s.includes(' ')) return s.split(' ').map(p => p ? p[0] + '•••' : '').join(' ')
  return s[0] + '•••'
}

type SheetName = 'TareasDiarias' | 'Requisiciones' | 'Candidatos' | 'Todos'

const ID_COL: Record<string,string> = {
  'TareasDiarias': 'Referencia/ID',
  'Requisiciones': 'RequisiciónID',
  'Candidatos': 'CandidatoID'
}

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [sheet, setSheet] = useState<SheetName>('Todos')
  const [data, setData] = useState<{[k:string]: any[]}>({})
  const [edit, setEdit] = useState<{sheet: Exclude<SheetName,'Todos'>, id: string} | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [catalogs, setCatalogs] = useState<Record<string,string[]>>({})
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    Promise.all([listRows('TareasDiarias', 1000), listRows('Requisiciones', 1000), listRows('Candidatos', 1000)])
      .then(([t, r, c])=> setData({ TareasDiarias: t.rows, Requisiciones: r.rows, Candidatos: c.rows }))
    fetchCatalogs().then(setCatalogs).catch(()=>{})
  }, [])

  useEffect(()=>{
    if (edit) {
      getRow(edit.sheet, edit.id).then((res)=> setEditData(res.data)).catch(err=>{
        alert('No se pudo cargar el registro: ' + err.message)
        setEdit(null)
      })
    } else {
      setEditData(null)
    }
  }, [edit])

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

  async function saveChanges(){
    if (!edit || !editData) return
    setSaving(true)
    try {
      await updateRow(edit.sheet, editData[ID_COL[edit.sheet]], editData)
      // refresh table for that sheet
      const fresh = await listRows(edit.sheet, 1000)
      setData(prev=>({ ...prev, [edit.sheet]: fresh.rows }))
      alert('Actualizado ✅')
      setEdit(null)
    } catch (e:any) {
      alert('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Helpers to render inputs with catalogs where available
  function renderInput(field: string, value: any, onChange: (v:any)=>void, _sheet: string) {
    const catOptions = (catalogs[field] || [])
    if (catOptions.length) {
      return <select value={value||''} onChange={e=>onChange(e.target.value)} className="rounded-xl border px-3 py-2 w-full">
        <option value=""></option>
        {catOptions.map((o:string)=><option key={o}>{o}</option>)}
      </select>
    }
    // Dates
    if (/fecha/i.test(field)) {
      return <input type="date" value={value||''} onChange={e=>onChange(e.target.value)} className="rounded-xl border px-3 py-2 w-full" />
    }
    // 12h time fields
    if (/hora/i.test(field)) {
      const TIMES:string[] = []
      for (let n=0;n<24*60;n+=15){
        const h=Math.floor(n/60); const m=n%60; const ap=h>=12?'PM':'AM'; const hh=h%12===0?12:h%12
        TIMES.push(`${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`)
      }
      return <select value={value||''} onChange={e=>onChange(e.target.value)} className="rounded-xl border px-3 py-2 w-full">
        <option value=""></option>
        {TIMES.map(t=><option key={t}>{t}</option>)}
      </select>
    }
    // Default
    const long = /descrip|nota|coment|detalle/i.test(field)
    return long
      ? <textarea rows={3} value={value||''} onChange={e=>onChange(e.target.value)} className="rounded-xl border px-3 py-2 w-full" />
      : <input value={value||''} onChange={e=>onChange(e.target.value)} className="rounded-xl border px-3 py-2 w-full" />
  }

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
          <select value={sheet} onChange={e=>setSheet(e.target.value as SheetName)} className="mt-1 rounded-xl border px-3 py-2">
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
              <th className="py-2 pr-6"></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r,i)=>{
              const sheetName = r.__sheet || sheet
              if (sheetName==='TareasDiarias') {
                return <tr key={i} className="border-t">
                  <td className="py-2 pr-6">Tareas</td>
                  <td className="py-2 pr-6">{r['Referencia/ID']||''}</td>
                  <td className="py-2 pr-6">{mask(r['Descripción'])}</td>
                  <td className="py-2 pr-6">{r['Estado']||''}</td>
                  <td className="py-2 pr-6">{r['Negocio']||''} · {r['Área']||''}</td>
                  <td className="py-2 pr-6"><button className="text-blue-600" onClick={()=>setEdit({ sheet:'TareasDiarias', id:r['Referencia/ID'] })}>Editar</button></td>
                </tr>
              }
              if (sheetName==='Requisiciones') {
                return <tr key={i} className="border-t">
                  <td className="py-2 pr-6">Requisiciones</td>
                  <td className="py-2 pr-6">{r['RequisiciónID']||''}</td>
                  <td className="py-2 pr-6">{mask(r['Puesto']||r['Notas'])}</td>
                  <td className="py-2 pr-6">{r['EstadoRequisición']||''}</td>
                  <td className="py-2 pr-6">{r['Negocio']||''} · {r['Área']||''}</td>
                  <td className="py-2 pr-6"><button className="text-blue-600" onClick={()=>setEdit({ sheet:'Requisiciones', id:r['RequisiciónID'] })}>Editar</button></td>
                </tr>
              }
              return <tr key={i} className="border-t">
                <td className="py-2 pr-6">Candidatos</td>
                <td className="py-2 pr-6">{r['CandidatoID']||''}</td>
                <td className="py-2 pr-6">{mask(r['Nombre'])}</td>
                <td className="py-2 pr-6">{r['EstadoCandidato']||''}</td>
                <td className="py-2 pr-6">{r['RequisiciónID']||''} · {r['Fuente']||''}</td>
                <td className="py-2 pr-6"><button className="text-blue-600" onClick={()=>setEdit({ sheet:'Candidatos', id:r['CandidatoID'] })}>Editar</button></td>
              </tr>
            })}
          </tbody>
        </table>
        {Prefs.maskSensitive && <p className="text-xs text-gray-500 mt-2">* Datos sensibles ocultos. Puedes desactivar esta opción en Ajustes (protegido).</p>}
      </div>

      {edit && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Editar — {edit.sheet} / {editData[ID_COL[edit.sheet]]}</h3>
              <button onClick={()=>setEdit(null)} className="text-gray-600">Cerrar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(editData).map(([k,v])=>{
                return (
                  <div key={k}>
                    <label className="text-sm text-gray-700">{k}</label>
                    {renderInput(k, v, (nv)=> setEditData((prev:any)=>({ ...prev, [k]: nv })), edit.sheet)}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 rounded-2xl border" onClick={()=>setEdit(null)}>Cancelar</button>
              <button className="px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50" disabled={saving} onClick={saveChanges}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}