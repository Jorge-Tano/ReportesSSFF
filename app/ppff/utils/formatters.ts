// app/ppff/utils/formatters.ts
// Reutiliza los mismos formatters del proyecto de convenios

export const CLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const NUM = new Intl.NumberFormat('es-CL')
export const PCT = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtCLP  = (n: number) => CLP.format(n)
export const fmtNum  = (n: number) => NUM.format(n)
export const fmtPct  = (n: number) => `${PCT.format(n)}%`

export const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

export const fmtHora = (s: string) =>
  new Date(s).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })

export const fmtFecha = (s: string) =>
  new Date(s + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })