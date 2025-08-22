import { useEffect, useState } from 'react'
import { addCatalogValue, deleteCatalogValue, fetchCatalogs } from '../lib/catalogs'

const CATEGORIES = ['Negocios','Áreas','TiposTarea','Prioridad','EstadoTarea','EstadoRequisición','EstadoCandidato','TiposContrato','FuentesCandidato']
const SETTINGS_PWD = 'Baelys@2025' // Protección básica en el UI

export default function SettingsPage() {
  const [catalogs, setCatalogs] = useState<Record<string,string[]>>({})
  const [cat, setCat] = useState('Negocios')
  const [val, setVal] = useState('')
  const [ok, setOk] = useState(false)
  const [pwd, setPwd] = useState('')

  useEffect(()=>{ fetchCatalogs().then(setCatalogs).catch(()=>{}) }, [])

  function checkPwd(){ if (pwd === SETTINGS_PWD) setOk(true); else alert('Contraseña inválida') }

  async function addVal(){
    if (!val.trim()) return
    await addCatalogValue(cat, val.trim())
    const fresh = await fetchCatalogs()
    setCatalogs(fresh)
    setVal('')
  }
  async function delVal(v: string){
    if (!confirm(`Eliminar "${v}" de ${cat}?`)) return
    await deleteCatalogValue(cat, v)
    const fresh = await fetchCatalogs()
    setCatalogs(fresh)
  }

  if (!ok) {
    return (
      <div className="max-w-md mx-auto p-6 mt-6 bg-white rounded-2xl shadow-soft">
        <h2 className="text-lg font-semibold mb-3">Ajustes — Acceso</h2>
        <input type="password" placeholder="Contraseña" value={pwd} onChange={e=>setPwd(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 mb-3" />
        <button onClick={checkPwd} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Entrar</button>
        <p className="text-xs text-gray-500 mt-3">Para seguridad avanzada, usar SSO/RBAC en el backend.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white p-4 rounded-2xl shadow-soft">
        <h3 className="text-lg font-semibold mb-2">Catálogos (listas desplegables)</h3>
        <div className="flex gap-3 mb-3">
          <select value={cat} onChange={e=>setCat(e.target.value)} className="rounded-xl border px-3 py-2">
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <input placeholder="Nuevo valor…" value={val} onChange={e=>setVal(e.target.value)} className="rounded-xl border px-3 py-2 flex-1" />
          <button onClick={addVal} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Añadir</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {(catalogs[cat]||[]).map((v:string)=>(
            <div key={v} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <span>{v}</span>
              <button onClick={()=>delVal(v)} className="text-red-600 text-sm">Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}