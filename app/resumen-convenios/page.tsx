'use client'

import { useState } from 'react'
import { NavbarWithMobile } from '@/components/NavBar'
import { AppHeader } from '@/components/AppHeader'
import { useConvenios } from './hooks/useConvenios'
import { Header } from './components/Header'
import { VersionSelector } from './components/VersionSelector'
import { TablaConvenios } from './components/TablaConvenios'
import { HistorialPanel } from './components/HistorialPanel'

export default function ConveniosPage() {
  const {
    data, historial, loading,
    fechaActiva, versionActiva,
    cambiarFecha, cambiarVersion,
  } = useConvenios()

  const [showHistorial, setShowHistorial] = useState(false)
  const hoy   = new Date().toISOString().slice(0, 10)
  const esHoy = fechaActiva === hoy

  return (
    <div>
      <NavbarWithMobile />
      <AppHeader />
      <div className="min-h-screen bg-white text-gray-600 m-2 font-sans">
        <Header
          lastSync={data?.last_sync ?? null}
          archivo={data?.archivo}
          fecha={fechaActiva}
          esHoy={esHoy}
          onHistorialClick={() => setShowHistorial(true)}
          loading={loading}
        />

        {data && (data.versiones?.length ?? 0) > 1 && (
          <VersionSelector
            versiones={data.versiones ?? []}
            versionActiva={versionActiva ?? data.version_actual}
            onSelect={cambiarVersion}
          />
        )}

        <TablaConvenios
          metricas={data?.metricas ?? []}
          q_seg={data?.q_seg}
          conv_seg={data?.conv_seg}
          loading={loading}
        />

        {showHistorial && (
          <HistorialPanel
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