'use client'

import { VersionInfo } from '../types'
import { fmtHora, fmtDate } from '../utils/formatters'

interface VersionSelectorProps {
  versiones: VersionInfo[]
  versionActiva: number | null
  onSelect: (v: number) => void
}

export function VersionSelector({ versiones, versionActiva, onSelect }: VersionSelectorProps) {
  if (versiones.length <= 1) return null

  const versionesOrdenadas = [...versiones].reverse()
  const actual = versionActiva ?? versiones[0]?.version_dia
  const idxEnVersionesOriginal = versiones.findIndex(v => v.version_dia === actual)

  const isLast = idxEnVersionesOriginal === 0

  const horaAuditoria = (v: VersionInfo) =>
    v.email_received_at ? fmtHora(v.email_received_at) : fmtHora(v.fecha_proceso)

  const tooltipAuditoria = (v: VersionInfo) => [
    `Archivo: ${v.archivo}`,
    `Enviado: ${v.email_received_at ? fmtDate(v.email_received_at) : "—"}`,
    `Procesado: ${fmtDate(v.fecha_proceso)}`,
    `Registros: ${v.total_registros}`,
    v.email_subject ? `Asunto: ${v.email_subject}` : "",
  ].filter(Boolean).join("\n")

  return (
    <div className="flex flex-col gap-2 mt-3 p-2 rounded-lg bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-black uppercase tracking-widest">Versiones del día</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          {versionesOrdenadas.map(v => {
            const isActive = v.version_dia === actual
            const isLatest = v.version_dia === versiones[0].version_dia
            return (
              <button
                key={v.version_dia}
                onClick={() => onSelect(v.version_dia)}
                title={tooltipAuditoria(v)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${isActive
                    ? "bg-emerald-800 text-white border-emerald-900"
                    : "bg-white text-black hover:bg-gray-50 border-gray-200"
                  }`}
              >
                <span className="font-semibold">V{v.version_dia}</span>
                <span className={`text-[10px] font-mono ${isActive ? "text-emerald-200" : "text-black"}`}>
                  {horaAuditoria(v)}
                </span>
                {isLatest && (
                  <span className={`text-[9px] px-1 py-0.5 rounded ${isActive ? "bg-emerald-900 text-emerald-200" : "bg-gray-100 text-black"
                    }`}>
                    Última
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {!isLast && (
          <button
            onClick={() => onSelect(versiones[0].version_dia)}
            className="text-[10px] text-black border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            ir a última
          </button>
        )}
      </div>
    </div>
  )
}