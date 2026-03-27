'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Metrica {
  label: string
  key: string          // 'Pago_Liviano' | 'NORMAL' | 'Refi_Comercial' | '__totales__'
  operaciones: number
  capital: number
  prom_capital: number
  financiado: number
}

export interface VersionInfo {
  control_id: number
  version_dia: number
  archivo: string
  fecha_proceso: string
  total_registros: number
  email_received_at: string | null
  email_subject: string | null
}

export interface ConveniosData {
  fecha: string
  metricas: Metrica[]
  version_actual: number | null
  versiones_dia: number
  versiones: VersionInfo[]
  archivo: string | null
  last_sync: string | null
  email_received_at: string | null
  email_subject: string | null
  // Métricas de seguros — solo aplican a Pago Liviano
  // null cuando SQL Server no respondió durante el sync o no había filas Pago Liviano
  q_seg:    number | null
  conv_seg: number | null
}

export interface DiaHistorial {
  fecha: string
  versiones: number
  ultima_version: number
  registros_totales: number
}

export function useConvenios() {
  const hoy = new Date().toISOString().slice(0, 10)

  const [fechaActiva,   setFechaActiva]   = useState<string>(hoy)
  const [versionActiva, setVersionActiva] = useState<number | null>(null)
  const [data,          setData]          = useState<ConveniosData | null>(null)
  const [historial,     setHistorial]     = useState<DiaHistorial[]>([])
  const [loading,       setLoading]       = useState(true)

  const fetchData = useCallback(async (fecha: string, version: number | null = null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ fecha })
      if (version !== null) params.set('version', String(version))
      const res = await fetch(`/api/convenios?${params}`, { cache: 'no-store' })
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistorial = useCallback(async () => {
    try {
      const res  = await fetch('/api/convenios?historial=1', { cache: 'no-store' })
      const json = await res.json()
      setHistorial(json.historial ?? [])
    } catch { /* silencioso */ }
  }, [])

  const cambiarFecha = useCallback((fecha: string) => {
    setFechaActiva(fecha)
    setVersionActiva(null)
    fetchData(fecha, null)
  }, [fetchData])

  const cambiarVersion = useCallback((version: number) => {
    setVersionActiva(version)
    fetchData(fechaActiva, version)
  }, [fechaActiva, fetchData])

  useEffect(() => {
    fetchData(hoy, null)
    fetchHistorial()
  }, [fetchData, fetchHistorial, hoy])

  return {
    data, historial, loading,
    fechaActiva, versionActiva,
    cambiarFecha, cambiarVersion,
  }
}