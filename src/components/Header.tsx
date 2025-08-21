import { Briefcase } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-soft">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-blue-50"><Briefcase /></div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">HRBP — Tareas & Contrataciones</h1>
          <p className="text-sm text-gray-500">Registro diario y seguimiento de requisiciones y candidatos</p>
        </div>
      </div>
    </header>
  )
}