// /app/resumen-convenios/components/TablaConvenios.tsx
'use client'

import { fmtNum, fmtCLP } from '../utils/formatters'

const HEADERS = [
  'Producto', 'Operaciones', 'Capital', 'Prom. Capital',
  'Financiado', 'Q Seg', 'Conv Seg', 'Por Seg',
]

interface Metricas {
  label:        string
  key:          string
  operaciones:  number
  capital:      number
  prom_capital: number
  financiado:   number
  q_seg:        number | null
  conv_seg:     number | null
  por_seg:      number | null
  suma_seguros: number | null
}

interface TablaConveniosProps {
  metricas: Metricas[]
  loading?: boolean
}

// Porcentaje con 2 decimales — null muestra guión porque SQL Server no respondió
function fmtPct(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(2)}%`
}

// Entero con separador de miles — null muestra guión
function fmtSeg(v: number | null): string {
  if (v == null) return '—'
  return fmtNum(v)
}

// Monto CLP — null muestra guión
function fmtMontSeg(v: number | null): string {
  if (v == null) return '—'
  return fmtCLP(v)
}

export function TablaConvenios({ metricas, loading }: TablaConveniosProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4">
        <div className="p-3 space-y-2">
          {[1, 0.7, 0.5, 0.35].map((op, i) => (
            <div
              key={i}
              className="h-8 rounded-md bg-gray-50 animate-pulse"
              style={{ opacity: op }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {HEADERS.map(h => (
              <th
                key={h}
                className={`px-3 py-2 text-xs font-medium uppercase tracking-widest text-black ${
                  h === 'Producto' ? 'text-left' : 'text-right'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricas.map((r, i) => {
            const isTotals = i === metricas.length - 1

            return (
              <tr
                key={i}
                className={
                  isTotals
                    ? 'border-t border-emerald-200 bg-emerald-50/30'
                    : 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors'
                }
              >
                <td className="px-3 py-2 text-left font-medium text-black">
                  {r.label}
                </td>

                <td className={`px-3 py-2 text-right text-black ${isTotals ? 'font-medium' : ''}`}>
                  {fmtNum(r.operaciones)}
                </td>

                <td className={`px-3 py-2 text-right text-black ${isTotals ? 'font-medium' : ''}`}>
                  {fmtCLP(r.capital)}
                </td>

                <td className={`px-3 py-2 text-right text-black ${isTotals ? 'font-medium' : ''}`}>
                  {fmtCLP(r.prom_capital)}
                </td>

                <td className={`px-3 py-2 text-right text-black ${isTotals ? 'font-medium' : ''}`}>
                  {fmtCLP(r.financiado)}
                </td>

                {/* Q Seg — guión en totales (no es sumable) */}
                <td className={`px-3 py-2 text-right ${
                  isTotals ? 'text-gray-400' : 'text-black'
                }`}>
                  {isTotals ? '0' : fmtSeg(r.q_seg)}
                </td>

                {/* Conv Seg — guión en totales */}
                <td className={`px-3 py-2 text-right ${
                  isTotals ? 'text-gray-400' : 'text-black'
                }`}>
                  {isTotals ? '0' : fmtPct(r.conv_seg)}
                </td>

                {/* Por Seg — guión en totales */}
                <td className={`px-3 py-2 text-right ${
                  isTotals ? 'text-gray-400' : 'text-black'
                }`}>
                  {isTotals ? '0' : fmtPct(r.por_seg)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}