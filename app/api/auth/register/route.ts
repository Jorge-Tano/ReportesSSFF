// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

const VALID_ROLES = ['administrador', 'usuario'] as const
type Role = typeof VALID_ROLES[number]

export async function POST(req: NextRequest) {
  try {
    const { name, username, password, role } = await req.json()

    if (!name || !username || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { message: 'Rol inválido' },
        { status: 400 }
      )
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1 LIMIT 1',
      [username.trim().toLowerCase()]
    )
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { message: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      )
    }

    const result = await pool.query(
      `INSERT INTO users (name, username, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, username, role, created_at`,
      [name.trim(), username.trim().toLowerCase(), password, role as Role]
    )

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}