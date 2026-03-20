// auth.ts  (raíz del proyecto)
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db'
import { authConfig } from '@/auth.config'

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
          'SELECT id, name, username, password FROM users WHERE username = $1 LIMIT 1',
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
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id       = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge:   8 * 60 * 60,
  },
})