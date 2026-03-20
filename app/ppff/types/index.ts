// app/ppff/types.ts

export interface SegmentoSAR {
  nombre_producto:     string
  op:                  number
  capital:             number
  promedio_capital:    number
  financiado:          number
  promedio_financiado: number
  conv_seguros:        number
  suma_seguros:        number
  por_seguro:          number
}

export interface SyncInfo {
  sync_id:    number
  fecha_datos: string
  total_filas: number
  iniciado_en: string
}

export interface PPFFData {
  fecha:         string
  segmentos:     SegmentoSAR[]
  sync_actual:   SyncInfo | null
  syncs_dia:     number
  syncs:         SyncInfo[]
}

export interface DiaHistorial {
  fecha:         string
  syncs:         number
  ultimo_sync:   number
  filas_totales: number
}