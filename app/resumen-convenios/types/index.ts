export interface VersionInfo {
  version_dia:       number
  fecha_proceso:     string
  email_received_at: string | null
  email_subject:     string | null
  archivo:           string
  total_registros:   number
}

export interface DiaHistorial {
  fecha:             string | Date
  versiones:         number
  registros_totales: number
  ultima_version:    number
}