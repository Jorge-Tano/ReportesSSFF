'use client'
// app/ppff/page.tsx

import { useState } from 'react'
import { NavbarWithMobile } from '@/components/NavBar'
import { AppHeader } from '@/components/AppHeader'
import { usePPFF } from './hooks/usePPFF'
import { HeaderPPFF } from './components/HeaderPPFF'
import { SyncSelector } from './components/SyncSelector'
import { TablaPPFF } from './components/TablaPPFF'
import { HistorialPanelPPFF } from './components/HistorialPanelPPFF'

export default function PPFFPage() {
  const {
    data, historial, loading,
    fechaActiva, syncActivo,
    cambiarFecha, cambiarSync,
  } = usePPFF()

  const [showHistorial, setShowHistorial] = useState(false)
  const hoy   = new Date().toISOString().slice(0, 10)
  const esHoy = fechaActiva === hoy

  return (
    <div>
      <NavbarWithMobile />
      <AppHeader />
      <div className="min-h-screen bg-white text-gray-600 p-6 md:p-10 font-sans">
        <HeaderPPFF
          fecha={fechaActiva}
          esHoy={esHoy}
          lastSync={data?.sync_actual?.iniciado_en ?? null}
          onHistorialClick={() => setShowHistorial(true)}
          loading={loading}
        />

        {data && (data.syncs?.length ?? 0) > 1 && (
          <SyncSelector
            syncs={data.syncs}
            syncActivo={syncActivo ?? data.sync_actual?.sync_id ?? null}
            onSelect={cambiarSync}
          />
        )}

        <TablaPPFF
          segmentos={data?.segmentos ?? []}
          loading={loading}
        />

        {showHistorial && (
          <HistorialPanelPPFF
            historial={historial}
            fechaActiva={fechaActiva}
            onSelect={cambiarFecha}
            onClose={() => setShowHistorial(false)}
          />
        )}
      </div>
    </div>
  )
}