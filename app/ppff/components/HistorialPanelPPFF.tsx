'use client'
// app/ppff/components/HistorialPanelPPFF.tsx

import { fmtFecha, fmtNum } from '../utils/formatters'
import type { DiaHistorial } from '../types'

interface HistorialPanelPPFFProps {
  historial:    DiaHistorial[]
  fechaActiva:  string
  onSelect:     (f: string) => void
  onClose:      () => void
}

export function HistorialPanelPPFF({ historial, fechaActiva, onSelect, onClose }: HistorialPanelPPFFProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 h-full w-72 bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <span className="font-medium text-black text-sm">Historial de reportes</span>
          <button
            onClick={onClose}
            className="text-black hover:text-black text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {historial.length === 0 && (
            <p className="text-black text-xs text-center py-6 animate-in fade-in duration-500">
              Sin registros históricos
            </p>
          )}

          {historial.map((d, index) => {
            const fecha    = String(d.fecha).slice(0, 10)
            const isActive = fecha === fechaActiva
            return (
              <button
                key={fecha}
                onClick={() => { onSelect(fecha); onClose() }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-emerald-50/70 border border-emerald-200 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm transition-colors text-black ${isActive ? 'font-medium' : ''}`}>
                    {fmtFecha(fecha)}
                  </span>
                  <span className="text-[10px] text-black bg-gray-100 px-1.5 py-0.5 rounded">
                    {d.syncs} {d.syncs === 1 ? 'sync' : 'syncs'}
                  </span>
                </div>
                <p className="text-xs text-black">
                  {fmtNum(d.filas_totales)} filas · último sync {d.ultimo_sync}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}