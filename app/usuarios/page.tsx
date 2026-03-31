// app/usuarios/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { NavbarWithMobile } from '@/components/NavBar'
import { AppHeader } from '@/components/AppHeader'
import { Users, Search, UserPlus, Calendar, User } from 'lucide-react'
import Link from 'next/link'

interface UserRow {
    id: number
    name: string
    username: string
    role: 'administrador' | 'usuario'
    created_at: string
}

const ROLE_STYLE: Record<string, { label: string; className: string }> = {
    administrador: { label: 'Administrador', className: 'text-purple-700 bg-purple-50 border-purple-200' },
    usuario:       { label: 'Usuario',       className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
}

export default function UsuariosPage() {
    const [users,   setUsers]   = useState<UserRow[]>([])
    const [search,  setSearch]  = useState('')
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')

    const fetchUsers = async () => {
        setLoading(true)
        setError('')
        try {
            const res  = await fetch('/api/users')
            const data = await res.json()
            if (!res.ok) { setError(data.message); return }
            setUsers(data.users)
        } catch {
            setError('Error al cargar los usuarios.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        ROLE_STYLE[u.role]?.label.toLowerCase().includes(search.toLowerCase())
    )

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('es-CL', {
            day: '2-digit', month: 'short', year: 'numeric'
        })

    const getInitials = (name: string) =>
        name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

    return (
        <>
            <AppHeader />
            <NavbarWithMobile />

            <div className="bg-gray-50 px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3">

                {/* Título + buscador + acciones */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <div>
                            <h1 className="text-sm font-medium uppercase tracking-widest text-black leading-tight">
                                Usuarios registrados
                            </h1>
                            <p className="text-xs text-gray-400">
                                {loading ? '...' : `${users.length} usuario${users.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-52">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 hover:border-gray-300 transition-all"
                        />
                    </div>

                    <div className="flex-1" />

                    <Link
                        href="/registro"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-700 text-xs font-medium uppercase tracking-widest transition-colors"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Nuevo usuario</span>
                    </Link>
                </div>

                {error && (
                    <div className="border border-red-200 bg-red-50/30 text-red-600 text-sm rounded-xl px-3 py-2">
                        {error}
                    </div>
                )}

                {/* Tabla */}
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">

                    {/* Header */}
                    <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-black uppercase tracking-widest">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Nombre</div>
                        <div className="col-span-3">Usuario</div>
                        <div className="col-span-2">Rol</div>
                        <div className="col-span-2">Registrado</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="grid grid-cols-12 px-4 py-3 animate-pulse">
                                    <div className="col-span-1 flex items-center"><div className="w-4 h-3 bg-gray-100 rounded" /></div>
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-xl bg-gray-100 flex-shrink-0" />
                                        <div className="w-28 h-3 bg-gray-100 rounded" />
                                    </div>
                                    <div className="col-span-3 flex items-center"><div className="w-20 h-3 bg-gray-100 rounded" /></div>
                                    <div className="col-span-2 flex items-center"><div className="w-16 h-5 bg-gray-100 rounded-full" /></div>
                                    <div className="col-span-2 flex items-center"><div className="w-20 h-3 bg-gray-100 rounded" /></div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <User className="w-6 h-6 mb-2 opacity-40" />
                                <p className="text-xs font-medium uppercase tracking-widest">
                                    {search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                                </p>
                            </div>
                        ) : (
                            filtered.map((user, index) => {
                                const role = ROLE_STYLE[user.role] ?? { label: user.role, className: 'text-black bg-gray-50 border-gray-200' }
                                return (
                                    <div
                                        key={user.id}
                                        className="grid grid-cols-12 px-4 py-2.5 hover:bg-gray-50/50 transition-colors duration-150"
                                    >
                                        <div className="col-span-1 flex items-center text-xs text-black font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                                                {getInitials(user.name)}
                                            </div>
                                            <span className="text-sm font-medium text-black truncate">{user.name}</span>
                                        </div>
                                        <div className="col-span-3 flex items-center">
                                            <span className="text-xs text-black font-medium truncate">
                                                {user.username}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-xl border ${role.className}`}>
                                                {role.label}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1.5 text-xs text-black">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && filtered.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex items-center justify-between">
                            <span>
                                Mostrando {filtered.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}