'use client'
// app/ppff/components/TablaPPFF.tsx

import React, { useState } from 'react'
import { fmtNum, fmtCLP } from '../utils/formatters'
import type { SegmentoSAR } from '../types'

const GRUPOS: Record<string, {
  hijos: string[]
  color: string
}> = {
  AV:  {
    hijos: ['AV-INB', 'AV-OUT', 'AV-LEAKAGE'],
    color: '#1D9E75',
  },
  SAV: {
    hijos: ['SAV-INB', 'SAV-OUT', 'SAV-LEAKAGE'],
    color: '#378ADD',
  },
}

const HEADERS = [
  { label: 'Nombre Producto', align: 'left'  },
  { label: 'Op',              align: 'right' },
  { label: 'Capital',         align: 'right' },
  { label: 'M Prom (C)',      align: 'right' },
  { label: 'Financiado',      align: 'right' },
  { label: 'M Prom (F)',      align: 'right' },
  { label: 'Conv Seg',        align: 'right' },
  { label: 'Suma Seg',        align: 'right' },
  { label: 'ConvPrima',       align: 'right' },
]

function fmtPct(v: number): string {
  return `${v.toFixed(2).replace('.', ',')}%`
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <path d="M3 2l4 3-4 3" />
    </svg>
  )
}

interface TablaPPFFProps {
  segmentos: SegmentoSAR[]
  loading?:  boolean
}

export function TablaPPFF({ segmentos, loading }: TablaPPFFProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (n: string) => setExpanded(p => ({ ...p, [n]: !p[n] }))
  const map = Object.fromEntries(segmentos.map(s => [s.nombre_producto, s]))

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4">
        <div className="p-3 space-y-2">
          {[1, 0.7, 0.5, 0.35, 0.25, 0.2, 0.15, 0.1, 0.08].map((op, i) => (
            <div key={i} className="h-8 rounded-md bg-gray-50 animate-pulse" style={{ opacity: op }} />
          ))}
        </div>
      </div>
    )
  }

  const total = map['Total']

  return (
    <>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {HEADERS.map(h => (
                <th
                  key={h.label}
                  className={`px-3 py-2 text-xs font-medium uppercase tracking-widest text-black ${
                    h.align === 'left' ? 'text-left' : 'text-right'
                  }`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(GRUPOS).map(([nombre, cfg]) => {
              const s      = map[nombre]
              const isOpen = !!expanded[nombre]
              if (!s) return null
              return (
                <React.Fragment key={nombre}>
                  {/* Fila de grupo */}
                  <tr
                    onClick={() => toggle(nombre)}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2 text-left font-medium text-black">
                      <div className="flex items-center gap-2">
                        <ChevronIcon open={isOpen} />
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                        <span>{nombre}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-black">{fmtNum(s.op)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtCLP(s.capital)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtCLP(s.promedio_capital)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtCLP(s.financiado)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtCLP(s.promedio_financiado)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtPct(s.conv_seguros)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtCLP(s.suma_seguros)}</td>
                    <td className="px-3 py-2 text-right text-black">{fmtPct(s.por_seguro)}</td>
                  </tr>

                  {/* Filas hijos */}
                  {cfg.hijos.map((hijo, i) => {
                    const h = map[hijo]
                    if (!h) return null
                    return (
                      <tr
                        key={hijo}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        style={{
                          display:   isOpen ? 'table-row' : 'none',
                          animation: isOpen ? `slideIn 0.18s ease ${i * 40}ms both` : 'none',
                        }}
                      >
                        <td className="px-3 py-2 text-left text-black">
                          <span className="pl-7 text-xs">{hijo}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtNum(h.op)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtCLP(h.capital)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtCLP(h.promedio_capital)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtCLP(h.financiado)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtCLP(h.promedio_financiado)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtPct(h.conv_seguros)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtCLP(h.suma_seguros)}</td>
                        <td className="px-3 py-2 text-right text-xs text-black">{fmtPct(h.por_seguro)}</td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              )
            })}

            {/* Fila Total */}
            {total && (
              <tr className="border-t border-emerald-200 bg-emerald-50/30">
                <td className="px-3 py-2 text-left font-medium text-black">Total</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtNum(total.op)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtCLP(total.capital)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtCLP(total.promedio_capital)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtCLP(total.financiado)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtCLP(total.promedio_financiado)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtPct(total.conv_seguros)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtCLP(total.suma_seguros)}</td>
                <td className="px-3 py-2 text-right font-medium text-black">{fmtPct(total.por_seguro)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}