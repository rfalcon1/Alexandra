import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export function Field({ label, hint, ...rest }: Props) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input {...rest} className={"mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 " + (rest.className || "")} />
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

export function Select({ label, children, ...rest }:{label:string; children:React.ReactNode} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <select {...rest} className={"mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 " + (rest.className || "")}>
        {children}
      </select>
    </label>
  )
}

export function TextArea({ label, ...rest }:{label:string} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <textarea {...rest} className={"mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 " + (rest.className || "")} />
    </label>
  )
}