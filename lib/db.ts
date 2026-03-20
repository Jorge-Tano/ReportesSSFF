// lib/db.ts
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function createPool(): Pool {
  return new Pool({
    host:                        process.env.POSTGRES_HOST,
    port:                        parseInt(process.env.POSTGRES_PORT ?? '5432'),
    database:                    process.env.POSTGRES_DB,
    user:                        process.env.POSTGRES_USER,
    password:                    process.env.POSTGRES_PASSWORD,
    connectionTimeoutMillis:     10000,
    idleTimeoutMillis:           30000,
    max:                         10,
    keepAlive:                   true,
    keepAliveInitialDelayMillis: 10000,
  })
}

const pool: Pool = globalThis._pgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool
}

export default pool