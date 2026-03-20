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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

export function HeaderPPFF({ fecha, esHoy, lastSync, onHistorialClick, loading }: HeaderPPFFProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Ventas PPFF</h1>
        <div className="flex items-center gap-2 text-sm">
          {esHoy ? (
            <span className="text-emerald-600 font-medium">Hoy</span>
          ) : (
            <span className="text-gray-500">{fmtFecha(fecha)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {lastSync && (
          <span className="text-xs text-gray-400 hidden sm:block">
            Último sync: {new Date(lastSync).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        {/* Botón historial */}
        <div className="relative group">
          <button
            onClick={onHistorialClick}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200"
          >
            <IconCalendar />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-sm">
            Historial
          </span>
        </div>
      </div>
    </div>
  )
}