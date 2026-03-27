// middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configuración secreta para JWT (debe coincidir con la de NextAuth)
const secret = process.env.NEXTAUTH_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Obtener el token de sesión directamente
  const token = await getToken({ req: request, secret })
  
  const isAuthenticated = !!token
  const userRole = token?.role as string || 'usuario'
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/', '/api/auth']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  
  // Si es ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    const url = new URL('/', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // Rutas que solo pueden acceder administradores
  const adminOnlyPaths = ['/usuarios', '/registro', '/logs']
  const isAdminPath = adminOnlyPaths.some(adminPath => pathname.startsWith(adminPath))
  
  // Verificar si la ruta requiere rol de administrador
  if (isAdminPath && userRole !== 'administrador') {
    // Redirigir al dashboard si no es admin
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Si el usuario está autenticado e intenta ir a login, redirigir a dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Permitir acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}