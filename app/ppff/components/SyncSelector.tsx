'use client'
// app/ppff/components/SyncSelector.tsx
// Réplica de VersionSelector de convenios — muestra los syncs del día

import { fmtHora, fmtDate } from '../utils/formatters'
import type { SyncInfo } from '../types'

interface SyncSelectorProps {
  syncs:       SyncInfo[]
  syncActivo:  number | null
  onSelect:    (syncId: number) => void
}

export function SyncSelector({ syncs, syncActivo, onSelect }: SyncSelectorProps) {
  if (syncs.length <= 1) return null

  const syncsOrdenados = [...syncs].reverse()
  const actual         = syncActivo ?? syncs[0]?.sync_id
  const idxActual      = syncs.findIndex(s => s.sync_id === actual)
  const isLast         = idxActual === 0

  const tooltipSync = (s: SyncInfo) => [
    `Sync ID: ${s.sync_id}`,
    `Iniciado: ${fmtDate(s.iniciado_en)}`,
    `Filas procesadas: ${s.total_filas}`,
  ].join('\n')

  return (
    <div className="flex flex-col gap-2 mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-700 uppercase tracking-widest">Versiones del día</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          {syncsOrdenados.map(s => {
            const isActive = s.sync_id === actual
            const isLatest = s.sync_id === syncs[0].sync_id
            return (
              <button
                key={s.sync_id}
                onClick={() => onSelect(s.sync_id)}
                title={tooltipSync(s)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-emerald-800 text-white border-emerald-900'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
                }`}
              >
                <span className="font-semibold">V{s.sync_id}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-emerald-200' : 'text-gray-300'}`}>
                  {fmtHora(s.iniciado_en)}
                </span>
                {isLatest && (
                  <span className={`text-[9px] px-1 py-0.5 rounded ${
                    isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-gray-100 text-gray-400'
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
            onClick={() => onSelect(syncs[0].sync_id)}
            className="text-[10px] text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-50 transition-colors whitespace-nowrap"
          >
            ir a última
          </button>
        )}
      </div>
    </div>
  )
}