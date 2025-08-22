import { useEffect, useMemo, useState } from 'react'
import { listRows } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line, CartesianGrid } from 'recharts'
import { fmtDatePR } from '../lib/format'
import { Prefs, SETTINGS_PWD, THEME } from '../config'

export default function Dashboard() {
  const [tareas, setTareas] = useState<any[]>([])
  const [reqs, setReqs] = useState<any[]>([])
  const [cands, setCands] = useState<any[]>([])
  const [ok, setOk] = useState(Prefs.reportsUnlocked)
  const [pwd, setPwd] = useState('')

  useEffect(()=>{
    if (!ok) return
    Promise.all([
      listRows('TareasDiarias', 2000),
      listRows('Requisiciones', 2000),
      listRows('Candidatos', 2000),
    ]).then(([t, r, c])=>{
      setTareas(t.rows); setReqs(r.rows); setCands(c.rows)
    })
  }, [ok])

  function unlock(){ if (pwd === SETTINGS_PWD) { setOk(true); Prefs.reportsUnlocked = true } else alert('Contraseña inválida') }

  if (!ok) {
    return (
      <div className="max-w-md mx-auto p-6 mt-6 bg-white rounded-2xl shadow-soft">
        <h2 className="text-lg font-semibold mb-3">Reportes (protegido)</h2>
        <input type="password" placeholder="Contraseña" value={pwd} onChange={e=>setPwd(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 mb-3" />
        <button onClick={unlock} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Entrar</button>
        <p className="text-xs text-gray-500 mt-3">El dashboard está protegido por contraseña.</p>
      </div>
    )
  }

  const kpis = useMemo(()=>{
    const abiertas = tareas.filter(x=>x.Estado==='Abierta' || x.Estado==='En proceso').length
    const reqAbiertas = reqs.filter(x=>x.EstadoRequisición && !['Cancelada','Contratada'].includes(x.EstadoRequisición)).length
    const candActivos = cands.filter(x=>!['Rechazado','Contratado'].includes(x.EstadoCandidato||'')).length
    return { abiertas, reqAbiertas, candActivos }
  }, [tareas, reqs, cands])

  const porEstadoTarea = useMemo(()=>{
    const map: Record<string, number> = {}
    tareas.forEach(t=>{ const k=t.Estado||'N/A'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).map(([name, value])=>({ name, value }))
  }, [tareas])

  const porNegocio = useMemo(()=>{
    const map: Record<string, number> = {}
    tareas.forEach(t=>{ const k=t.Negocio||'N/A'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).map(([name, value])=>({ name, value }))
  }, [tareas])

  const reqPorEstado = useMemo(()=>{
    const map: Record<string, number> = {}
    reqs.forEach(r=>{ const k=r.EstadoRequisición||'N/A'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).map(([name, value])=>({ name, value }))
  }, [reqs])

  const candPorEstado = useMemo(()=>{
    const map: Record<string, number> = {}
    cands.forEach(r=>{ const k=r.EstadoCandidato||'N/A'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).map(([name, value])=>({ name, value }))
  }, [cands])

  const tareasPorFecha = useMemo(()=>{
    const map: Record<string, number> = {}
    tareas.forEach(t=>{ const k=t.Fecha || 'N/A'; map[k]=(map[k]||0)+1 })
    return Object.entries(map).map(([d, count])=>({ date: fmtDatePR(d), count })).sort((a,b)=> a.date.localeCompare(b.date))
  }, [tareas])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-soft p-4 border-2" style={{borderColor:THEME.c5}}>
          <p className="text-xs" style={{color: THEME.axis}}>Tareas activas</p>
          <p className="text-3xl font-semibold" style={{color: THEME.c5}}>{kpis.abiertas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-4 border-2" style={{borderColor:THEME.c2}}>
          <p className="text-xs" style={{color: THEME.axis}}>Requisiciones abiertas</p>
          <p className="text-3xl font-semibold" style={{color: THEME.c2}}>{kpis.reqAbiertas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-4 border-2" style={{borderColor:THEME.c6}}>
          <p className="text-xs" style={{color: THEME.axis}}>Candidatos activos</p>
          <p className="text-3xl font-semibold" style={{color: THEME.c6}}>{kpis.candActivos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Tareas por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEstadoTarea}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={THEME.axis} />
                <YAxis stroke={THEME.axis} />
                <Tooltip /><Legend />
                <Bar dataKey="value" name="Cantidad" fill={THEME.c1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Requisiciones por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reqPorEstado} dataKey="value" nameKey="name" label fill={THEME.c3} />
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Tareas por negocio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porNegocio}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={THEME.axis} />
                <YAxis stroke={THEME.axis} />
                <Tooltip /><Legend />
                <Bar dataKey="value" name="Cantidad" fill={THEME.c5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Candidatos por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candPorEstado}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={THEME.axis} />
                <YAxis stroke={THEME.axis} />
                <Tooltip /><Legend />
                <Bar dataKey="value" name="Cantidad" fill={THEME.c6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4 lg:col-span-2">
          <h3 className="font-medium mb-2">Tareas por fecha</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tareasPorFecha}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={THEME.axis} />
                <YAxis stroke={THEME.axis} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="count" name="Tareas" stroke={THEME.c1} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
