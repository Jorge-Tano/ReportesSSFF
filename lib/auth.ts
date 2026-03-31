// auth.ts
import NextAuth, { DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db'
import { authConfig } from '@/auth.config'

// Extender los tipos de NextAuth para incluir role
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      role: string
    } & DefaultSession["user"]
  }
  
  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: string
  }
}

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

        // Retornar el usuario con el rol de la base de datos
        // Los roles esperados: 'administrador' o 'usuario'
        return {
          id:       String(user.id),
          name:     user.name,
          username: user.username,
          role:     user.role || 'usuario',
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.username = (user as any).username as string
        token.role = (user as any).role as string  // 'administrador' o 'usuario'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string  // 'administrador' o 'usuario'
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
})