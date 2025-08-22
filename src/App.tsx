import { useEffect, useState } from 'react'
import Header from './components/Header'
import Tabs from './components/Tabs'
import TareasForm from './pages/TareasForm'
import RequisicionesForm from './pages/RequisicionesForm'
import CandidatosForm from './pages/CandidatosForm'
import Dashboard from './pages/Dashboard'
import SearchPage from './pages/Search'
import SettingsPage from './pages/Settings'

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'buscar', label: 'Buscar' },
  { id: 'tareas', label: 'Tareas diarias' },
  { id: 'requisiciones', label: 'Requisiciones' },
  { id: 'candidatos', label: 'Candidatos' },
  { id: 'ajustes', label: 'Ajustes' }
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [ok, setOk] = useState(false)
  const [pwd, setPwd] = useState('')

  useEffect(()=>{
    const required = import.meta.env.VITE_APP_PASSWORD || (window as any).APP_PASSWORD
    if (!required) { setOk(true); return }
    const saved = localStorage.getItem('APP_OK') === '1'
    if (saved) setOk(true)
  }, [])

  function checkPwd(){
    const required = import.meta.env.VITE_APP_PASSWORD || (window as any).APP_PASSWORD
    if (!required || pwd === required) { setOk(true); localStorage.setItem('APP_OK', '1') }
  }

  return (
    <div className="app-bg min-h-screen">
      <Header />
      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {!ok ? (
        <div className="max-w-md mx-auto p-6 mt-6 bg-white rounded-2xl shadow-soft">
          <h2 className="text-lg font-semibold mb-3">Acceso</h2>
          <input type="password" placeholder="Contraseña" value={pwd} onChange={e=>setPwd(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 mb-3" />
          <button onClick={checkPwd} className="px-4 py-2 rounded-2xl bg-blue-600 text-white">Entrar</button>
          <p className="text-xs text-gray-500 mt-3">Protección simple en el UI (no reemplaza control de acceso del backend).</p>
        </div>
      ) : (
        <div>
          {active === 'dashboard' && <Dashboard />}
          {active === 'buscar' && <SearchPage />}
          {active === 'tareas' && <TareasForm />}
          {active === 'requisiciones' && <RequisicionesForm />}
          {active === 'candidatos' && <CandidatosForm />}
          {active === 'ajustes' && <SettingsPage />}
        </div>
      )}
    </div>
  )
}