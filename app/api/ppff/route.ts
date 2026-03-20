/**
 * app/api/ppff/route.ts
 *
 * GET /api/ppff
 *   Sin params          → segmentos del sync más reciente de hoy
 *   ?fecha=YYYY-MM-DD   → segmentos del sync más reciente de ese día
 *   ?fecha=X&sync_id=N  → segmentos del sync N de ese día
 *   ?historial=1        → lista de días (últimos 90)
 */

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

// ── Segmentos de un sync_id específico ───────────────────────

async function getSegmentosPorSync(syncId: number) {
  const { rows } = await pool.query(`
    SELECT
      nombre_producto,
      op,
      capital,
      promedio_capital,
      financiado,
      promedio_financiado,
      conv_seguros,
      suma_seguros,
      por_seguro
    FROM resultado_sar
    WHERE sync_id = $1
    ORDER BY CASE nombre_producto
      WHEN 'AV'          THEN 1
      WHEN 'AV-INB'      THEN 2
      WHEN 'AV-OUT'      THEN 3
      WHEN 'AV-LEAKAGE'  THEN 4
      WHEN 'SAV'         THEN 5
      WHEN 'SAV-INB'     THEN 6
      WHEN 'SAV-OUT'     THEN 7
      WHEN 'SAV-LEAKAGE' THEN 8
      WHEN 'Total'       THEN 9
      ELSE 10
    END
  `, [syncId])

  return rows.map((r: Record<string, unknown>) => ({
    nombre_producto:     r.nombre_producto,
    op:                  Number(r.op),
    capital:             Number(r.capital),
    promedio_capital:    Number(r.promedio_capital),
    financiado:          Number(r.financiado),
    promedio_financiado: Number(r.promedio_financiado),
    conv_seguros:        Number(r.conv_seguros),
    suma_seguros:        Number(r.suma_seguros),
    por_seguro:          Number(r.por_seguro),
  }))
}

// ── Syncs disponibles para un día ────────────────────────────

async function getSyncsDia(fecha: string) {
  const { rows } = await pool.query(`
    SELECT id AS sync_id, fecha_datos, total_filas, iniciado_en
    FROM sync_log_ppff
    WHERE fecha_datos = $1::date
      AND estado = 'completado'
    ORDER BY id DESC
  `, [fecha])

  return rows.map((r: Record<string, unknown>) => ({
    sync_id:     Number(r.sync_id),
    fecha_datos: r.fecha_datos,
    total_filas: Number(r.total_filas),
    iniciado_en: r.iniciado_en,
  }))
}

// ── Historial de días ─────────────────────────────────────────

async function getHistorial() {
  const { rows } = await pool.query(`
    SELECT
      fecha_datos                    AS fecha,
      COUNT(*)                       AS syncs,
      MAX(id)                        AS ultimo_sync,
      SUM(total_filas)               AS filas_totales
    FROM sync_log_ppff
    WHERE estado = 'completado'
    GROUP BY fecha_datos
    ORDER BY fecha_datos DESC
    LIMIT 90
  `)

  return rows.map((r: Record<string, unknown>) => ({
    fecha:        r.fecha,
    syncs:        Number(r.syncs),
    ultimo_sync:  Number(r.ultimo_sync),
    filas_totales: Number(r.filas_totales),
  }))
}

// ── Segmentos vacíos (sin datos) ──────────────────────────────

const SEGMENTOS_VACIOS = [
  'AV','AV-INB','AV-OUT','AV-LEAKAGE',
  'SAV','SAV-INB','SAV-OUT','SAV-LEAKAGE','Total',
].map(nombre => ({
  nombre_producto: nombre, op: 0, capital: 0, promedio_capital: 0,
  financiado: 0, promedio_financiado: 0, conv_seguros: 0, suma_seguros: 0, por_seguro: 0,
}))

// ── Handler ───────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hoy   = new Date().toISOString().slice(0, 10)
    const fecha = searchParams.get('fecha') ?? hoy

    // Historial
    if (searchParams.get('historial') === '1') {
      return NextResponse.json({ historial: await getHistorial() })
    }

    // Buscar sync_id
    const syncParam = searchParams.get('sync_id')
    let syncRow: Record<string, unknown> | null = null

    if (syncParam) {
      const { rows } = await pool.query(`
        SELECT id AS sync_id, fecha_datos, total_filas, iniciado_en
        FROM sync_log_ppff
        WHERE fecha_datos = $1::date AND id = $2 AND estado = 'completado'
        LIMIT 1
      `, [fecha, Number(syncParam)])
      syncRow = rows[0] ?? null
    } else {
      const { rows } = await pool.query(`
        SELECT id AS sync_id, fecha_datos, total_filas, iniciado_en
        FROM sync_log_ppff
        WHERE fecha_datos = $1::date AND estado = 'completado'
        ORDER BY id DESC
        LIMIT 1
      `, [fecha])
      syncRow = rows[0] ?? null
    }

    if (!syncRow) {
      return NextResponse.json({
        fecha,
        segmentos:   SEGMENTOS_VACIOS,
        sync_actual: null,
        syncs_dia:   0,
        syncs:       [],
      })
    }

    const syncId   = Number(syncRow.sync_id)
    const segmentos = await getSegmentosPorSync(syncId)
    const syncsDia  = await getSyncsDia(fecha)

    return NextResponse.json({
      fecha,
      segmentos,
      sync_actual: {
        sync_id:     syncId,
        fecha_datos: syncRow.fecha_datos,
        total_filas: Number(syncRow.total_filas),
        iniciado_en: syncRow.iniciado_en,
      },
      syncs_dia: syncsDia.length,
      syncs:     syncsDia,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}