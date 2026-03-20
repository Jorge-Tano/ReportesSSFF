'use client'

import { DiaHistorial } from '../types'
import { fmtFecha, fmtNum } from '../utils/formatters'

interface HistorialPanelProps {
  historial: DiaHistorial[]
  fechaActiva: string
  onSelect: (f: string) => void
  onClose: () => void
}

export function HistorialPanel({ historial, fechaActiva, onSelect, onClose }: HistorialPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div className="relative z-10 h-full w-80 bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-medium text-gray-600 text-sm">Historial de reportes</span>
          <button 
            onClick={onClose} 
            className="text-gray-300 hover:text-gray-500 text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {historial.length === 0 && (
            <p className="text-gray-300 text-xs text-center py-8 animate-in fade-in duration-500">
              Sin registros históricos
            </p>
          )}
          
          {historial.map((d, index) => {
            const fecha = String(d.fecha).slice(0, 10)
            const isActive = fecha === fechaActiva
            return (
              <button
                key={fecha}
                onClick={() => { onSelect(fecha); onClose() }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-emerald-50/70 border border-emerald-200 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm transition-colors ${
                    isActive ? 'text-emerald-800 font-medium' : 'text-gray-500'
                  }`}>
                    {fmtFecha(fecha)}
                  </span>
                  <span className="text-[10px] text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">
                    {d.versiones} {d.versiones === 1 ? 'versión' : 'versiones'}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {fmtNum(d.registros_totales)} registros · última v{d.ultima_version}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}