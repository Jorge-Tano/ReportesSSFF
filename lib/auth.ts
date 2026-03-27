// auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuario',    type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string
          password: string
        }

        if (!username || !password) return null

        const result = await pool.query(
          'SELECT id, name, username, password, role FROM users WHERE username = $1 LIMIT 1',
          [username.trim().toLowerCase()]
        )

        if (!result.rowCount || result.rowCount === 0) return null

        const user = result.rows[0]

        // Comparación directa en texto plano
        if (password !== user.password) return null

        return {
          id:       String(user.id),
          name:     user.name,
          username: user.username,
          role:     user.role || 'user',
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.username = (user as any).username
        token.role     = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id as string
        session.user.username = token.username as string
        session.user.role     = token.role as string
      }
      return session
    },
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      const session = auth
      
      // Si no está autenticado, redirigir a login
      if (!session) {
        return false
      }
      
      // Rutas que solo pueden acceder administradores
      const adminOnlyPaths = ['/usuarios', '/registro', '/logs']
      
      // Verificar si la ruta es solo para admin
      if (adminOnlyPaths.some(adminPath => pathname.startsWith(adminPath))) {
        if (session.user?.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
      
      return true
    },
  },

  session: {
    strategy: 'jwt',
    maxAge:   8 * 60 * 60,
  },
})