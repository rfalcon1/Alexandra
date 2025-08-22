import { useEffect, useState, useMemo } from 'react'
import { listRows } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line, CartesianGrid } from 'recharts'
import { fmtDatePR } from '../lib/format'

export default function Dashboard() {
  const [tareas, setTareas] = useState<any[]>([])
  const [reqs, setReqs] = useState<any[]>([])
  const [cands, setCands] = useState<any[]>([])

  useEffect(()=>{
    Promise.all([
      listRows('TareasDiarias', 1000),
      listRows('Requisiciones', 1000),
      listRows('Candidatos', 1000),
    ]).then(([t, r, c])=>{
      setTareas(t.rows)
      setReqs(r.rows)
      setCands(c.rows)
    })
  }, [])

  const kpis = useMemo(()=>{
    const abiertas = tareas.filter(x=>x.Estado==='Abierta' || x.Estado==='En proceso').length
    const reqAbiertas = reqs.filter(x=>x.EstadoRequisición && x.EstadoRequisición !== 'Cancelada' && x.EstadoRequisición !== 'Contratada').length
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
    return Object.entries(map).map(([d, count])=>({ date: fmtDatePR(d), count }))
      .sort((a,b)=> a.date.localeCompare(b.date))
  }, [tareas])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <p className="text-xs text-gray-500">Tareas activas</p>
          <p className="text-3xl font-semibold">{kpis.abiertas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <p className="text-xs text-gray-500">Requisiciones abiertas</p>
          <p className="text-3xl font-semibold">{kpis.reqAbiertas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <p className="text-xs text-gray-500">Candidatos activos</p>
          <p className="text-3xl font-semibold">{kpis.candActivos}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Tareas por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEstadoTarea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Requisiciones por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reqPorEstado} dataKey="value" nameKey="name" label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Tareas por negocio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porNegocio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-medium mb-2">Candidatos por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candPorEstado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4 lg:col-span-2">
          <h3 className="font-medium mb-2">Tareas por fecha</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tareasPorFecha}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Tareas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}