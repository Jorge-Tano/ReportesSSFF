'use client'
// app/ppff/components/HeaderPPFF.tsx

import { fmtFecha } from '../utils/formatters'

interface HeaderPPFFProps {
  fecha:            string
  esHoy:            boolean
  lastSync:         string | null
  onHistorialClick: () => void
  loading:          boolean
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

export function HeaderPPFF({ fecha, esHoy, lastSync, onHistorialClick, loading }: HeaderPPFFProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-black tracking-tight">Ventas PPFF</h1>
        <div className="flex items-center gap-2 text-sm">
          {esHoy ? (
            <span className="text-black font-medium">Hoy</span>
          ) : (
            <span className="text-black">{fmtFecha(fecha)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {lastSync && (
          <span className="text-xs text-black hidden sm:block">
            Último sync: {new Date(lastSync).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        {/* Botón historial */}
        <div className="relative group">
          <button
            onClick={onHistorialClick}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-black hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconCalendar />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-0.5 text-[10px] font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-sm">
            Historial
          </span>
        </div>
      </div>
    </div>
  )
}