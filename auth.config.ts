// auth.config.ts  (raíz del proyecto)
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      // El matcher ya excluye / y /registro
      // Aquí solo llegan rutas protegidas como /dashboard
      // Si no está logueado → NextAuth redirige automáticamente a pages.signIn (/)
      return isLoggedIn
    },
  },
  providers: [],
}