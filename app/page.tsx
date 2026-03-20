// app/page.tsx

'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, User, LogIn } from 'lucide-react'

// Componente que contiene la lógica que usa useSearchParams
function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const registered   = searchParams.get('registered')

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username: formData.username,
      password: formData.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Usuario o contraseña incorrectos')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="bg-emerald-800 px-6 py-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-700/30">
            <LogIn className="w-8 h-8 text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bienvenido</h1>
          <p className="text-emerald-200 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {registered && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
              ¡Cuenta creada! Ya puedes iniciar sesión.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Usuario */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-gray-600 placeholder:text-gray-300"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 block">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all text-gray-600 placeholder:text-gray-300"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente principal envuelto en Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-700/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <LogIn className="w-8 h-8 text-emerald-100" />
          </div>
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}