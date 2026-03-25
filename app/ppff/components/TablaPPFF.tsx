'use client'
// app/ppff/components/TablaPPFF.tsx

import React, { useState } from 'react'
import { fmtNum, fmtCLP } from '../utils/formatters'
import type { SegmentoSAR } from '../types'

const GRUPOS: Record<string, {
  hijos: string[]
  color: string
  badgeBg: string
  badgeText: string
}> = {
  AV:  {
    hijos: ['AV-INB', 'AV-OUT', 'AV-LEAKAGE'],
    color: '#1D9E75', badgeBg: '#E1F5EE', badgeText: '#0F6E56',
  },
  SAV: {
    hijos: ['SAV-INB', 'SAV-OUT', 'SAV-LEAKAGE'],
    color: '#378ADD', badgeBg: '#E6F1FB', badgeText: '#185FA5',
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

function PctPill({ value }: { value: number }) {
  const label = `${value.toFixed(2).replace('.', ',')}%`
  if (value === 0)
    return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-400">{label}</span>
  if (value >= 50)
    return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: '#E6F1FB', color: '#185FA5' }}>{label}</span>
  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: '#E1F5EE', color: '#0F6E56' }}>{label}</span>
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
        <div className="p-4 space-y-3">
          {[1, 0.7, 0.5, 0.35, 0.25, 0.2, 0.15, 0.1, 0.08].map((op, i) => (
            <div key={i} className="h-10 rounded-md bg-gray-50 animate-pulse" style={{ opacity: op }} />
          ))}
        </div>
      </div>
    )
  }

  const num  = 'px-3 py-2.5 text-right text-xs font-mono tabular-nums text-gray-500'
  const numS = 'px-3 py-2   text-right text-xs font-mono tabular-nums text-gray-400'
  const numT = 'px-3 py-3   text-right text-xs font-mono tabular-nums text-emerald-800 font-medium'
  const total = map['Total']

  return (
    <>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              {HEADERS.map(h => (
                <th key={h.label} className={`px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 ${h.align === 'left' ? 'text-left' : 'text-right'}`}>
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
                  <tr onClick={() => toggle(nombre)}
                    className="cursor-pointer hover:bg-gray-50/70 transition-colors border-b border-gray-200">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <ChevronIcon open={isOpen} />
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                        <span className="text-sm font-medium text-gray-800">{nombre}</span>
                      </div>
                    </td>
                    <td className={num}>{fmtNum(s.op)}</td>
                    <td className={num}>{fmtCLP(s.capital)}</td>
                    <td className={num}>{fmtCLP(s.promedio_capital)}</td>
                    <td className={num}>{fmtCLP(s.financiado)}</td>
                    <td className={num}>{fmtCLP(s.promedio_financiado)}</td>
                    <td className="px-3 py-2.5 text-right"><PctPill value={s.conv_seguros} /></td>
                    <td className={num}>{fmtCLP(s.suma_seguros)}</td>
                    <td className="px-3 py-2.5 text-right"><PctPill value={s.por_seguro} /></td>
                  </tr>

                  {cfg.hijos.map((hijo, i) => {
                    const h = map[hijo]
                    if (!h) return null
                    return (
                      <tr key={hijo}
                        className="border-b border-gray-100"
                        style={{
                          display:    isOpen ? 'table-row' : 'none',
                          background: 'var(--color-background-secondary)',
                          animation:  isOpen ? `slideIn 0.18s ease ${i * 40}ms both` : 'none',
                        }}>
                        <td className="px-3 py-2">
                          <span className="pl-7 text-xs text-gray-400">{hijo}</span>
                        </td>
                        <td className={numS}>{fmtNum(h.op)}</td>
                        <td className={numS}>{fmtCLP(h.capital)}</td>
                        <td className={numS}>{fmtCLP(h.promedio_capital)}</td>
                        <td className={numS}>{fmtCLP(h.financiado)}</td>
                        <td className={numS}>{fmtCLP(h.promedio_financiado)}</td>
                        <td className="px-3 py-2 text-right"><PctPill value={h.conv_seguros} /></td>
                        <td className={numS}>{fmtCLP(h.suma_seguros)}</td>
                        <td className="px-3 py-2 text-right"><PctPill value={h.por_seguro} /></td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              )
            })}

            {total && (
              <tr className="border-t-2 border-emerald-200 bg-emerald-50/20">
                <td className="px-3 py-3">
                  <span className="text-sm font-medium text-emerald-800">Total</span>
                </td>
                <td className={numT}>{fmtNum(total.op)}</td>
                <td className={numT}>{fmtCLP(total.capital)}</td>
                <td className={numT}>{fmtCLP(total.promedio_capital)}</td>
                <td className={numT}>{fmtCLP(total.financiado)}</td>
                <td className={numT}>{fmtCLP(total.promedio_financiado)}</td>
                <td className="px-3 py-3 text-right"><PctPill value={total.conv_seguros} /></td>
                <td className={numT}>{fmtCLP(total.suma_seguros)}</td>
                <td className="px-3 py-3 text-right"><PctPill value={total.por_seguro} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}