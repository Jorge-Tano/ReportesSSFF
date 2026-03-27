// components/AppHeader.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Home, BarChart2, UserPlus, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ROUTE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  '/dashboard': { label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  '/resumen-convenios': { label: 'Resumen Convenios', icon: <BarChart2 className="w-5 h-5" /> },
  '/registro': { label: 'Registro de Usuario', icon: <UserPlus className="w-5 h-5" /> },
}

function getRouteMeta(pathname: string) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname]
  const match = Object.keys(ROUTE_META).find(k => pathname.startsWith(k + '/'))
  return match ? ROUTE_META[match] : { label: 'Panel de control', icon: <Home className="w-5 h-5" /> }
}

export function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const meta = getRouteMeta(pathname)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const router = useRouter()
  
  // Corregido: agregar tipo explícito al parámetro 'w'
  const initials = session?.user?.name?.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() ?? '?'
  const username = (session?.user as { username?: string })?.username ?? 'usuario'

  return (
    <header className="w-full h-20 bg-white border-b border-emerald-200 shadow-sm flex items-center px-8 gap-6 select-none flex-shrink-0">

      {/* Página activa */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-slate-800 leading-tight truncate">{meta.label}</p>
          <p className="text-xs text-emerald-600 leading-tight font-medium tracking-wide uppercase mt-0.5 opacity-70">
            Panel de control · 2call
          </p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Menú usuario */}
      {session?.user && (
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={
              'flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border-2 transition-all duration-200 ' +
              (menuOpen
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50')
            }
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{session.user.name}</p>
              <p className="text-xs text-emerald-600 leading-tight opacity-70">{username}</p>
            </div>
            <ChevronDown className={
              'w-4 h-4 text-emerald-600 opacity-50 flex-shrink-0 transition-transform duration-200 hidden md:block ' +
              (menuOpen ? 'rotate-180' : '')
            } />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden z-10">
              <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{session.user.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{username}</p>
                  </div>
                </div>
              </div>

              <div className="p-2 border-t border-emerald-100">
                <button
                  onClick={() => signOut({
                    callbackUrl: typeof window !== 'undefined' ? window.location.origin : '/'
                  })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function DropdownLink({ href, icon, label, onClick }: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-emerald-50 hover:text-emerald-800 transition-colors duration-150 group"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0 transition-colors duration-150 text-emerald-600">
        {icon}
      </div>
      {label}
    </Link>
  )
}