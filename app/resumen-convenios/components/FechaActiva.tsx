'use client'

import { fmtFecha } from '../utils/formatters'

interface FechaActivaProps {
  fecha: string
  esHoy: boolean
}

export function FechaActiva({ fecha, esHoy }: FechaActivaProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {esHoy ? (
        <span className="text-black font-medium">Hoy</span>
      ) : (
        <>
          <span className="text-black">{fmtFecha(fecha)}</span>
        </>
      )}
    </div>
  )
}