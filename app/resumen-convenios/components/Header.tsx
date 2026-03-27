'use client'

import { IconCalendar } from './icons'
import { FechaActiva } from './FechaActiva'

interface HeaderProps {
  lastSync: string | null
  archivo?: string | null
  fecha: string
  esHoy: boolean
  onHistorialClick: () => void
  loading: boolean
}

export function Header({
  fecha,
  esHoy,
  onHistorialClick,
  loading,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-black tracking-tight">Resumen de Convenios</h1>
        <FechaActiva fecha={fecha} esHoy={esHoy} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group">
          <button
            onClick={onHistorialClick}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-black hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconCalendar className="w-5 h-5" />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-0.5 text-[10px] font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-sm">
            Historial
          </span>
        </div>
      </div>
    </div>
  )
}