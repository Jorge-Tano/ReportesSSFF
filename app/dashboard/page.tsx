'use client'

import Link from 'next/link'
import { BarChart2, ArrowRight, TrendingUp, FileText } from 'lucide-react'
import { NavbarWithMobile } from '@/components/NavBar'
import { AppHeader } from '@/components/AppHeader'

interface CardProps {
  href:        string
  icon:        React.ReactNode
  iconBg:      string
  title:       string
  description: string
  accentFrom:  string
  accentTo:    string
  borderHover: string
}

function DashCard({ href, icon, iconBg, title, description, accentFrom, accentTo, borderHover }: CardProps) {
  return (
    <Link href={href} className="group flex-1 min-w-0">
      <div className={`relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 p-4 sm:p-3 cursor-pointer hover:shadow-xl flex flex-col h-full ${borderHover}`}>

        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-gray-50 opacity-50 translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute bottom-0 right-12 w-28 h-28 rounded-full bg-gray-50 translate-y-10 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-lg self-start sm:self-auto`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">{title}</h2>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accentFrom} ${accentTo} to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <AppHeader />
      <NavbarWithMobile />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-emerald-700 mt-1 font-medium opacity-60">
            Bienvenido al panel de control 2call
          </p>
        </div>

        {/* Grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <DashCard
            href="/resumen-convenios"
            icon={<BarChart2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            iconBg="bg-gradient-to-br from-emerald-600 to-emerald-800"
            title="Resumen Convenios"
            description="Métricas y seguimiento de convenios procesados. Historial de versiones por día y auditoría de archivos."
            accentFrom="from-emerald-500"
            accentTo="via-emerald-300"
            borderHover="hover:border-emerald-400"
          />

          <DashCard
            href="/ppff"
            icon={<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            iconBg="bg-gradient-to-br from-blue-600 to-blue-800"
            title="Ventas PPFF"
            description="Panel de ventas AV y SAV con métricas por segmento. Avances, conversión de seguros y financiado del día."
            accentFrom="from-blue-500"
            accentTo="via-blue-300"
            borderHover="hover:border-blue-400"
          />

          <DashCard
            href="/logs"
            icon={<FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            iconBg="bg-gradient-to-br from-gray-600 to-gray-800"
            title="Logs del Sistema"
            description="Registro de actividades, eventos y auditoría del sistema. Historial de acciones de usuarios y errores."
            accentFrom="from-gray-500"
            accentTo="via-gray-300"
            borderHover="hover:border-gray-400"
          />
        </div>
      </div>
    </div>
  )
}