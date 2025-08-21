type Tab = { id: string; label: string }
export default function Tabs({ tabs, active, onChange }:{tabs:Tab[]; active:string; onChange:(id:string)=>void}) {
  return (
    <div className="flex gap-2 border-b px-4 max-w-5xl mx-auto">
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)}
          className={"px-4 py-2 -mb-px border-b-2 " + (active===t.id ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-gray-500 hover:text-gray-700")}>
          {t.label}
        </button>
      ))}
    </div>
  )
}