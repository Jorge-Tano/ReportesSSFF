'use client'

import { fmtNum, fmtCLP } from '../utils/formatters'

// Headers base — Q_Seg y ConvSeg se añaden solo si la versión los tiene
const HEADERS_BASE = ['Producto', 'Operaciones', 'Capital', 'Prom. Capital', 'Financiado']
const HEADERS_SEG  = [...HEADERS_BASE, 'Q Seg', 'Conv Seg']

interface Metricas {
  label: string
  key: string   // 'Pago_Liviano' | 'NORMAL' | 'Refi_Comercial' | '__totales__'
  operaciones: number
  capital: number
  prom_capital: number
  financiado: number
}

interface TablaConveniosProps {
  metricas:  Metricas[]
  // null = SQL Server no respondió durante el sync (muestra —)
  // undefined = versión antigua sin las columnas (no las muestra)
  q_seg:    number | null | undefined
  conv_seg: number | null | undefined
  loading?: boolean
}

// Formatea conv_seg como porcentaje con 2 decimales.
// Puede superar el 100% porque q_seg cuenta coberturas, no clientes únicos.
// null = SQL Server no respondió → se muestra como 0.00%
function fmtPct(v: number | null | undefined): string {
  if (v == null) return '0.00%'
  return `${v.toFixed(2)}%`
}

export function TablaConvenios({ metricas, q_seg, conv_seg, loading }: TablaConveniosProps) {
  // Mostrar columnas de seguros solo si la prop está definida (undefined = versión antigua)
  const mostrarSeguros = q_seg !== undefined && conv_seg !== undefined
  const headers = mostrarSeguros ? HEADERS_SEG : HEADERS_BASE

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4">
        <div className="p-3 space-y-2">
          {[1, 0.7, 0.5, 0.35].map((op, i) => (
            <div key={i} className="h-8 rounded-md bg-gray-50 animate-pulse" style={{ opacity: op }} />
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
            {headers.map(h => (
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
            const isTotals    = i === metricas.length - 1
            const isPagoLiv   = r.key === 'Pago_Liviano'

            return (
              <tr
                key={i}
                className={
                  isTotals
                    ? 'border-t border-emerald-200 bg-emerald-50/30'
                    : 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors'
                }
              >
                {/* Producto */}
                <td className="px-3 py-2 text-left font-medium text-black">
                  {r.label}
                </td>

                {/* Operaciones */}
                <td className={`px-3 py-2 text-right ${isTotals ? 'font-medium' : ''} text-black`}>
                  {fmtNum(r.operaciones)}
                </td>

                {/* Capital */}
                <td className={`px-3 py-2 text-right ${isTotals ? 'font-medium' : ''} text-black`}>
                  {fmtCLP(r.capital)}
                </td>

                {/* Prom. Capital */}
                <td className={`px-3 py-2 text-right ${isTotals ? 'font-medium' : ''} text-black`}>
                  {fmtCLP(r.prom_capital)}
                </td>

                {/* Financiado */}
                <td className={`px-3 py-2 text-right ${isTotals ? 'font-medium' : ''} text-black`}>
                  {fmtCLP(r.financiado)}
                </td>

                {/* Q Seg — solo en Pago Liviano; guión en el resto */}
                {mostrarSeguros && (
                  <td className={`px-3 py-2 text-right ${isTotals ? 'font-medium' : ''} ${
                    isPagoLiv ? 'text-black' : 'text-gray-400'
                  }`}>
                    {isPagoLiv ? fmtNum(q_seg ?? 0) : '—'}
                  </td>
                )}

                {/* Conv Seg — solo en Pago Liviano; guión en el resto */}
                {mostrarSeguros && (
                  <td className={`px-3 py-2 text-right ${isTotals ? 'font-medium' : ''} ${
                    isPagoLiv ? 'text-black' : 'text-gray-400'
                  }`}>
                    {isPagoLiv ? fmtPct(conv_seg) : '—'}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}