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
    usuario: { label: 'Usuario', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<UserRow[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchUsers = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/users')
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

            <div className="bg-white px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3">

                {/* Título + buscador + acciones */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-black flex items-center justify-center text-emerald-700">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-black leading-tight">Usuarios registrados</h1>
                            <p className="text-xs text-black font-medium uppercase tracking-wide opacity-70">
                                {loading ? '...' : `${users.length} usuario${users.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-52">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-black rounded-lg text-xs text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                        />
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <Link
                            href="/registro"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Nuevo usuario</span>
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                {/* Tabla */}
                <div className="bg-white rounded-xl border border-black overflow-hidden">

                    <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 border-b border-black text-xs font-semibold text-black uppercase tracking-wide">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Nombre</div>
                        <div className="col-span-3">Usuario</div>
                        <div className="col-span-2">Rol</div>
                        <div className="col-span-2">Registrado</div>
                    </div>

                    <div className="divide-y divide-black">
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
                            <div className="flex flex-col items-center justify-center py-10 text-black">
                                <User className="w-7 h-7 mb-2 opacity-30" />
                                <p className="text-sm font-medium">
                                    {search ? 'No se encontraron resultados' : 'No hay usuarios registrados'}
                                </p>
                            </div>
                        ) : (
                            filtered.map((user, index) => {
                                const role = ROLE_STYLE[user.role] ?? { label: user.role, className: 'text-black bg-gray-50 border-black' }
                                return (
                                    <div key={user.id} className="grid grid-cols-12 px-4 py-2.5 hover:bg-emerald-50/50 transition-colors duration-150">
                                        <div className="col-span-1 flex items-center text-xs text-black font-mono">{index + 1}</div>
                                        <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                                {getInitials(user.name)}
                                            </div>
                                            <span className="text-sm font-medium text-black truncate">{user.name}</span>
                                        </div>
                                        <div className="col-span-3 flex items-center">
                                            <span className="text-xs text-black font-mono bg-emerald-50 px-2 py-0.5 rounded-lg border border-black truncate">
                                                @{user.username}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${role.className}`}>
                                                {role.label}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1.5 text-xs text-black">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {!loading && filtered.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-black text-xs text-black flex items-center justify-between">
                            <span>Mostrando {filtered.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}