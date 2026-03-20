// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    const result = await pool.query(
      `SELECT id, name, username, role, created_at
       FROM users
       ORDER BY created_at DESC`
    )
    return NextResponse.json({ users: result.rows })
  } catch (error) {
    console.error('[USERS GET ERROR]', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}