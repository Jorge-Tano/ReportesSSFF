'use client'

import { IconCalendar } from './icons'
import { fmtFecha } from '../utils/formatters'

interface FechaActivaProps {
  fecha: string
  esHoy: boolean
}

export function FechaActiva({ fecha, esHoy }: FechaActivaProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {esHoy ? (
        <span className="text-emerald-600 font-medium">Hoy</span>
      ) : (
        <>
          <span className="text-gray-500">{fmtFecha(fecha)}</span>
        </>
      )}
    </div>
  )
}