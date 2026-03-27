'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Home, BarChart2, Phone, LogOut, UserPlus, Users, TrendingUp, FileText } from 'lucide-react'

interface NavItem { id: string; label: string; href: string; icon: React.ReactNode; badge?: number }

const navItems: NavItem[] = [
  { id: 'home',              label: 'Inicio',            href: '/dashboard',         icon: <Home       className="w-5 h-5" /> },
  { id: 'resumen-convenios', label: 'Resumen Convenios', href: '/resumen-convenios', icon: <BarChart2  className="w-5 h-5" /> },
  { id: 'ppff',              label: 'Ventas PPFF',       href: '/ppff',              icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'logs',              label: 'Logs del Sistema',  href: '/logs',              icon: <FileText   className="w-5 h-5" /> },
  { id: 'usuarios',          label: 'Usuarios',          href: '/usuarios',          icon: <Users      className="w-5 h-5" /> },
]

export function NavbarWithMobile() {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.paddingLeft = '5rem'
    document.body.style.transition  = 'padding-left 500ms ease-in-out'
    const mq = window.matchMedia('(max-width: 768px)')
    if (mq.matches) document.body.style.paddingLeft = '0'
    const handler = (e: MediaQueryListEvent) => {
      document.body.style.paddingLeft = e.matches ? '0' : '5rem'
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const initials = session?.user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '?'

  const shortLabel = (item: NavItem) => {
    if (item.label === 'Resumen Convenios') return 'Convenios'
    if (item.label === 'Ventas PPFF')       return 'PPFF'
    if (item.label === 'Logs del Sistema')  return 'Logs'
    return item.label
  }

  return (
    <aside className="fixed left-0 top-0 h-full z-50 w-20 flex flex-col bg-white border-r border-emerald-200 shadow-lg">

      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-emerald-100 flex-shrink-0">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center shadow-md">
          <Phone className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navegación */}
      <nav className="p-2 space-y-1 flex-1 mt-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive  = pathname === item.href
          const isHovered = hoveredItem === item.id

          return (
            <Link
              key={item.id}
              href={item.href}
              className={
                'relative flex flex-col items-center justify-center px-1 py-3 rounded-xl transition-all duration-200 group ' +
                (isActive
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-700')
              }
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {!isActive && (
                <span className={
                  'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 bg-emerald-600 rounded-r transition-all duration-200 ' +
                  (isHovered ? 'h-6 opacity-100' : 'h-0 opacity-0')
                } />
              )}

              <span className={isActive ? 'text-white' : ''}>{item.icon}</span>

              <span className={
                'text-[10px] font-semibold mt-1 leading-tight text-center transition-colors duration-200 ' +
                (isActive ? 'text-white opacity-90' : isHovered ? 'text-emerald-700' : 'text-slate-400')
              }>
                {shortLabel(item)}
              </span>

              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-50">
                <span className="font-semibold">{item.label}</span>
                <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
              </div>

              {item.badge && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 flex-shrink-0 space-y-1">
        {session?.user && (
          <div className="flex justify-center py-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
          </div>
        )}

        <FooterIconLink href="/registro" icon={<UserPlus className="w-5 h-5" />} label="Registrar usuario" shortLabel="Registro" />

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="relative flex flex-col items-center justify-center w-full px-1 py-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-1 text-slate-400 group-hover:text-red-500">Salir</span>
          <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-50">
            Cerrar sesión
            <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
          </div>
        </button>
      </div>
    </aside>
  )
}

function FooterIconLink({ href, icon, label, shortLabel }: {
  href: string; icon: React.ReactNode; label: string; shortLabel: string
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center w-full px-1 py-2.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-white transition-all duration-200 group"
    >
      {icon}
      <span className="text-[10px] font-semibold mt-1 text-slate-400 group-hover:text-emerald-600">{shortLabel}</span>
      <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-50">
        {label}
        <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
      </div>
    </Link>
  )
}