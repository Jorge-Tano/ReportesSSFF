/**
 * app/api/convenios/route.ts
 *
 * GET /api/convenios
 *   Sin params          → métricas de la versión más reciente de hoy
 *   ?fecha=YYYY-MM-DD   → métricas de la versión más reciente de ese día
 *   ?fecha=X&version=N  → métricas de la versión N de ese día
 *   ?historial=1        → lista de días (últimos 90)
 *   ?fecha=X&versiones=1→ lista de versiones disponibles para ese día
 *
 * Modelo: cada versión es un control_id independiente.
 * Las métricas de una versión = registros de ESE control_id únicamente.
 * No se combinan versiones — cada una refleja el estado del CSV en ese momento.
 */

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

const PRODUCTOS = [
  { label: 'Pago Liviano',     key: 'Pago_Liviano'  },
  { label: 'Refinanciamiento', key: 'NORMAL'         },
  { label: 'Refi Comercial',   key: 'Refi_Comercial' },
]

// ── Métricas de un control_id específico ─────────────────────────────────────

async function getMetricasPorControl(controlId: number) {
  const { rows } = await pool.query(`
    SELECT
      fld_nom_producto,
      COUNT(*)                              AS operaciones,
      COALESCE(SUM(deuda_original), 0)      AS capital,
      COALESCE(SUM(fld_mto_con),    0)      AS financiado
    FROM convenios_procesados
    WHERE control_id = $1
      AND fld_nom_producto = ANY($2)
    GROUP BY fld_nom_producto
  `, [controlId, PRODUCTOS.map(p => p.key)])

  const map = new Map(rows.map((r: Record<string, unknown>) => [r.fld_nom_producto, r]))

  const metricas = PRODUCTOS.map(({ label, key }) => {
    const r           = map.get(key) as Record<string, unknown> | undefined
    const operaciones = r ? Number(r.operaciones)            : 0
    const capital     = r ? Math.round(Number(r.capital))    : 0
    const financiado  = r ? Math.round(Number(r.financiado)) : 0
    const prom_capital = operaciones > 0 ? Math.round(capital / operaciones) : 0
    return { label, operaciones, capital, prom_capital, financiado }
  })

  const tot = {
    label:        'Totales',
    operaciones:  metricas.reduce((s, r) => s + r.operaciones, 0),
    capital:      metricas.reduce((s, r) => s + r.capital,     0),
    financiado:   metricas.reduce((s, r) => s + r.financiado,  0),
    prom_capital: 0,
  }
  tot.prom_capital = tot.operaciones > 0 ? Math.round(tot.capital / tot.operaciones) : 0
  metricas.push(tot)

  return metricas
}

// ── Versiones disponibles para un día ────────────────────────────────────────

async function getVersionesDia(fecha: string) {
  const { rows } = await pool.query(`
    SELECT id, version_dia, archivo, fecha_proceso, total_registros,
           email_received_at, email_subject
    FROM control_reportes
    WHERE fecha_proceso::date = $1::date
    ORDER BY version_dia DESC
  `, [fecha])

  return rows.map((r: Record<string, unknown>) => ({
    control_id:        Number(r.id),
    version_dia:       Number(r.version_dia),
    archivo:           r.archivo,
    fecha_proceso:     r.fecha_proceso,
    total_registros:   Number(r.total_registros),
    email_received_at: r.email_received_at ?? null,
    email_subject:     r.email_subject     ?? null,
  }))
}

// ── Historial de días ─────────────────────────────────────────────────────────

async function getHistorial() {
  const { rows } = await pool.query(`
    SELECT
      fecha_proceso::date              AS fecha,
      COUNT(*)                         AS versiones,
      MAX(version_dia)                 AS ultima_version,
      SUM(total_registros)             AS registros_totales
    FROM control_reportes
    GROUP BY fecha_proceso::date
    ORDER BY fecha DESC
    LIMIT 90
  `)

  return rows.map((r: Record<string, unknown>) => ({
    fecha:            r.fecha,
    versiones:        Number(r.versiones),
    ultima_version:   Number(r.ultima_version),
    registros_totales: Number(r.registros_totales),
  }))
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hoy   = new Date().toISOString().slice(0, 10)
    const fecha = searchParams.get('fecha') ?? hoy

    // Historial de días
    if (searchParams.get('historial') === '1') {
      return NextResponse.json({ historial: await getHistorial() })
    }

    // Lista de versiones de un día
    if (searchParams.get('versiones') === '1') {
      return NextResponse.json({ versiones: await getVersionesDia(fecha), fecha })
    }

    // Métricas: buscar control_id según versión pedida o la más reciente
    const versionParam = searchParams.get('version')

    let controlRow: Record<string, unknown> | null = null

    if (versionParam) {
      const { rows } = await pool.query(`
        SELECT id, version_dia, archivo, fecha_proceso, total_registros,
               email_received_at, email_subject
        FROM control_reportes
        WHERE fecha_proceso::date = $1::date AND version_dia = $2
        LIMIT 1
      `, [fecha, Number(versionParam)])
      controlRow = rows[0] ?? null
    } else {
      // Versión más reciente del día
      const { rows } = await pool.query(`
        SELECT id, version_dia, archivo, fecha_proceso, total_registros,
               email_received_at, email_subject
        FROM control_reportes
        WHERE fecha_proceso::date = $1::date
        ORDER BY version_dia DESC
        LIMIT 1
      `, [fecha])
      controlRow = rows[0] ?? null
    }

    if (!controlRow) {
      return NextResponse.json({
        fecha,
        metricas:        PRODUCTOS.map(p => ({ label: p.label, operaciones: 0, capital: 0, prom_capital: 0, financiado: 0 }))
                           .concat([{ label: 'Totales', operaciones: 0, capital: 0, prom_capital: 0, financiado: 0 }]),
        version_actual:  null,
        versiones_dia:   0,
        archivo:         null,
        last_sync:       null,
      })
    }

    const metricas      = await getMetricasPorControl(Number(controlRow.id))
    const versionesDia  = await getVersionesDia(fecha)

    return NextResponse.json({
      fecha,
      metricas,
      version_actual:    Number(controlRow.version_dia),
      versiones_dia:     versionesDia.length,
      versiones:         versionesDia,
      archivo:           controlRow.archivo,
      last_sync:         controlRow.fecha_proceso,
      email_received_at: controlRow.email_received_at ?? null,
      email_subject:     controlRow.email_subject     ?? null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}