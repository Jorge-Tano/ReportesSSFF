// app/registro/page.tsx
'use client'

import { useState } from 'react'
import { Lock, User, UserPlus, Eye, EyeOff, BadgeCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NavbarWithMobile } from '@/components/NavBar'
import { AppHeader } from '@/components/AppHeader'

const ROLES = [
  { value: 'administrador', label: 'Administrador', color: 'text-purple-700 bg-purple-50 border-purple-200'    },
  { value: 'usuario',       label: 'Usuario',       color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', confirmPassword: '', role: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [errors,       setErrors]       = useState<Record<string, string>>({})
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim())             e.name            = 'El nombre es obligatorio'
    if (!formData.username.trim())         e.username        = 'El usuario es obligatorio'
    else if (formData.username.length < 3) e.username        = 'Mínimo 3 caracteres'
    if (!formData.password)                e.password        = 'La contraseña es obligatoria'
    else if (formData.password.length < 6) e.password        = 'Mínimo 6 caracteres'
    if (formData.password !== formData.confirmPassword)
                                           e.confirmPassword = 'Las contraseñas no coinciden'
    if (!formData.role)                    e.role            = 'Selecciona un rol'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     formData.name,
          username: formData.username,
          password: formData.password,
          role:     formData.role,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ api: data.message }); return }

      setSuccess(true)
      setFormData({ name: '', username: '', password: '', confirmPassword: '', role: '' })
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setErrors({ api: 'Error de conexión. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <>
      <AppHeader />
      <NavbarWithMobile />

      <div className="overflow-y-auto bg-gray-50 flex items-start justify-center p-2"
        style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

            <div className="bg-emerald-800 px-6 py-3 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-1 bg-emerald-700/30">
                <UserPlus className="w-8 h-8 text-emerald-100" />
              </div>
              <h1 className="text-2xl font-bold text-white">Registrar usuario</h1>
            </div>
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-2">
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2">
                  ✓ Usuario creado exitosamente.
                </div>
              )}
              {errors.api && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
                  {errors.api}
                </div>
              )}

              {/* Nombre */}
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900 block">Nombre completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeCheck className="h-5 w-5 text-gray-600" />
                  </div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-gray-900 placeholder:text-gray-400 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-900'}`}
                    placeholder="Nombre completo del usuario" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
              </div>

              {/* Usuario */}
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900 block">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <input type="text" name="username" value={formData.username} onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2.5 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-gray-900 placeholder:text-gray-400 ${errors.username ? 'border-red-400 bg-red-50' : 'border-gray-900'}`}
                    placeholder="Nombre de usuario" />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-0.5">{errors.username}</p>}
              </div>

              {/* Rol */}
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900 block">Rol</label>
                <div className="grid grid-cols-2 gap-1">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, role: r.value })
                        if (errors.role) setErrors({ ...errors, role: '' })
                      }}
                      className={`flex items-center justify-center px-3 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                        formData.role === r.value
                          ? `${r.color} border-current`
                          : 'border-gray-900 text-gray-600 bg-white hover:border-gray-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-red-500 text-xs mt-0.5">{errors.role}</p>}
              </div>

              {/* Contraseña */}
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900 block">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-gray-900 placeholder:text-gray-400 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-900'}`}
                    placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-900 block">Confirmar contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-gray-900 placeholder:text-gray-400 ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-900'}`}
                    placeholder="Repite la contraseña" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-0.5">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-0.5">
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'Creando usuario...' : 'Crear usuario'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}