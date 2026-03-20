'use client'
// app/ppff/hooks/usePPFF.ts

import { useState, useEffect, useCallback } from 'react'
import type { PPFFData, DiaHistorial } from '../types'

export function usePPFF() {
  const hoy = new Date().toISOString().slice(0, 10)

  const [fechaActiva,   setFechaActiva]   = useState<string>(hoy)
  const [syncActivo,    setSyncActivo]    = useState<number | null>(null)
  const [data,          setData]          = useState<PPFFData | null>(null)
  const [historial,     setHistorial]     = useState<DiaHistorial[]>([])
  const [loading,       setLoading]       = useState(true)
  const [mensaje,       setMensaje]       = useState<{ texto: string; ok: boolean } | null>(null)

  // ── Fetch segmentos ─────────────────────────────────────────

  const fetchData = useCallback(async (fecha: string, syncId: number | null = null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ fecha })
      if (syncId !== null) params.set('sync_id', String(syncId))
      const res  = await fetch(`/api/ppff?${params}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch historial ─────────────────────────────────────────

  const fetchHistorial = useCallback(async () => {
    try {
      const res  = await fetch('/api/ppff?historial=1', { cache: 'no-store' })
      const json = await res.json()
      setHistorial(json.historial ?? [])
    } catch { /* silencioso */ }
  }, [])

  // ── Cambiar día ─────────────────────────────────────────────

  const cambiarFecha = useCallback((fecha: string) => {
    setFechaActiva(fecha)
    setSyncActivo(null)
    fetchData(fecha, null)
  }, [fetchData])

  // ── Cambiar sync dentro del día activo ──────────────────────

  const cambiarSync = useCallback((syncId: number) => {
    setSyncActivo(syncId)
    fetchData(fechaActiva, syncId)
  }, [fechaActiva, fetchData])

  // ── Carga inicial ───────────────────────────────────────────

  useEffect(() => {
    fetchData(hoy, null)
    fetchHistorial()
  }, [fetchData, fetchHistorial, hoy])

  return {
    data, historial, loading, mensaje,
    fechaActiva, syncActivo,
    cambiarFecha, cambiarSync,
  }
}