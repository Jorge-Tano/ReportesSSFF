'use client'

import { fmtNum, fmtCLP } from '../utils/formatters'

const HEADERS = ['Producto', 'Operaciones', 'Capital', 'Prom. Capital', 'Financiado']

interface Metricas {
  label: string
  operaciones: number
  capital: number
  prom_capital: number
  financiado: number
}

interface TablaConveniosProps {
  metricas: Metricas[]
  loading?: boolean
}

export function TablaConvenios({ metricas, loading }: TablaConveniosProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4">
        <div className="p-4 space-y-3">
          {[1, 0.7, 0.5, 0.35].map((op, i) => (
            <div key={i} className="h-10 rounded-md bg-gray-50 animate-pulse" style={{ opacity: op }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-500 overflow-hidden bg-white mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-500 bg-gray-50">
            {HEADERS.map(h => (
              <th key={h} className={`px-4 py-3 text-xs font-medium uppercase tracking-widest text-gray-400 ${h === 'Producto' ? 'text-left' : 'text-right'
                }`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricas.map((r, i) => {
            const isTotals = i === metricas.length - 1
            return (
              <tr key={i} className={isTotals
                ? 'border-t border-emerald-200 bg-emerald-50/30'
                : 'border-b border-gray-400 hover:bg-gray-50/50 transition-colors'}>
                <td className={`px-4 py-3 text-left font-medium ${isTotals ? 'text-emerald-800' : 'text-gray-600'}`}>
                  {r.label}
                </td>
                <td className={`px-4 py-3 text-right ${isTotals ? 'text-emerald-800 font-medium' : 'text-gray-500'}`}>
                  {fmtNum(r.operaciones)}
                </td>
                <td className={`px-4 py-3 text-right ${isTotals ? 'text-emerald-800 font-medium' : 'text-gray-500'}`}>
                  {fmtCLP(r.capital)}
                </td>
                <td className={`px-4 py-3 text-right ${isTotals ? 'text-emerald-800 font-medium' : 'text-gray-500'}`}>
                  {fmtCLP(r.prom_capital)}
                </td>
                <td className={`px-4 py-3 text-right ${isTotals ? 'text-emerald-800 font-medium' : 'text-gray-500'}`}>
                  {fmtCLP(r.financiado)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}