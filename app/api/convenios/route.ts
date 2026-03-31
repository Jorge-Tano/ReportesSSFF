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
 * Las métricas de seguros (q_seg, conv_seg, por_seg, suma_seguros) viven en
 * convenios_procesados por fila. Se agregan aquí por producto usando MAX()
 * porque todas las filas del mismo producto/control_id comparten el mismo valor
 * (se calcularon una vez y se replicaron en el sync).
 *
 * NULL en esas columnas = SQL Server no respondió durante el sync de ese archivo.
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
  // Una sola query — agrupa por producto y levanta las métricas de seguro con MAX().
  // MAX() es seguro aquí porque todas las filas del mismo (control_id, producto)
  // tienen idénticos valores de q_seg/conv_seg/por_seg/suma_seguros.
  const { rows } = await pool.query(`
    SELECT
      fld_nom_producto,
      COUNT(*)                              AS operaciones,
      COALESCE(SUM(deuda_original), 0)      AS capital,
      COALESCE(SUM(fld_mto_con),    0)      AS financiado,
      MAX(q_seg)                            AS q_seg,
      MAX(conv_seg)                         AS conv_seg,
      MAX(por_seg)                          AS por_seg,
      MAX(suma_seguros)                     AS suma_seguros
    FROM convenios_procesados
    WHERE control_id = $1
      AND fld_nom_producto = ANY($2)
    GROUP BY fld_nom_producto
  `, [controlId, PRODUCTOS.map(p => p.key)])

  const map = new Map(rows.map((r: Record<string, unknown>) => [r.fld_nom_producto, r]))

  const metricas = PRODUCTOS.map(({ label, key }) => {
    const r            = map.get(key) as Record<string, unknown> | undefined
    const operaciones  = r ? Number(r.operaciones)            : 0
    const capital      = r ? Math.round(Number(r.capital))    : 0
    const financiado   = r ? Math.round(Number(r.financiado)) : 0
    const prom_capital = operaciones > 0 ? Math.round(capital / operaciones) : 0

    return {
      label,
      key,
      operaciones,
      capital,
      prom_capital,
      financiado,
      // null si SQL Server no respondió durante el sync
      q_seg:        r?.q_seg        != null ? Number(r.q_seg)        : null,
      conv_seg:     r?.conv_seg     != null ? Number(r.conv_seg)     : null,
      por_seg:      r?.por_seg      != null ? Number(r.por_seg)      : null,
      suma_seguros: r?.suma_seguros != null ? Number(r.suma_seguros) : null,
    }
  })

  // Fila de totales — suma_seguros y por_seg se suman; q_seg y conv_seg
  // no son promediables directamente, se dejan null en la fila de totales
  // (el panel original también los dejaba en 0/comentados para Totales)
  const tot = {
    label:        'Totales',
    key:          '__totales__',
    operaciones:  metricas.reduce((s, r) => s + r.operaciones, 0),
    capital:      metricas.reduce((s, r) => s + r.capital,     0),
    financiado:   metricas.reduce((s, r) => s + r.financiado,  0),
    prom_capital: 0,
    q_seg:        null as number | null,
    conv_seg:     null as number | null,
    por_seg:      null as number | null,
    suma_seguros: metricas.every(r => r.suma_seguros === null)
      ? null
      : metricas.reduce((s, r) => s + (r.suma_seguros ?? 0), 0),
  }
  tot.prom_capital = tot.operaciones > 0
    ? Math.round(tot.capital / tot.operaciones)
    : 0

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
    fecha:             r.fecha,
    versiones:         Number(r.versiones),
    ultima_version:    Number(r.ultima_version),
    registros_totales: Number(r.registros_totales),
  }))
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hoy   = new Date().toISOString().slice(0, 10)
    const fecha = searchParams.get('fecha') ?? hoy

    if (searchParams.get('historial') === '1') {
      return NextResponse.json({ historial: await getHistorial() })
    }

    if (searchParams.get('versiones') === '1') {
      return NextResponse.json({ versiones: await getVersionesDia(fecha), fecha })
    }

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

    // Respuesta vacía — sin datos para esta fecha/versión
    const metricasVacias = PRODUCTOS
      .map(p => ({
        label: p.label, key: p.key,
        operaciones: 0, capital: 0, prom_capital: 0, financiado: 0,
        q_seg: null, conv_seg: null, por_seg: null, suma_seguros: null,
      }))
      .concat([{
        label: 'Totales', key: '__totales__',
        operaciones: 0, capital: 0, prom_capital: 0, financiado: 0,
        q_seg: null, conv_seg: null, por_seg: null, suma_seguros: null,
      }])

    if (!controlRow) {
      return NextResponse.json({
        fecha,
        metricas:       metricasVacias,
        version_actual: null,
        versiones_dia:  0,
        versiones:      [],
        archivo:        null,
        last_sync:      null,
        email_received_at: null,
        email_subject:     null,
      })
    }

    const metricas     = await getMetricasPorControl(Number(controlRow.id))
    const versionesDia = await getVersionesDia(fecha)

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