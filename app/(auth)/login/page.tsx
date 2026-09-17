'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Film, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams() // ← Agregar esto
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      const redirectTo = searchParams.get('redirect') || '/'
      // Usar window.location.origin que funciona tanto en localhost como ngrok
      window.location.href = window.location.origin + redirectTo
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Imagen/Decoración */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-red-900 via-red-800 to-black">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
        
        <div className="relative flex flex-col justify-center px-12 text-white">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Film className="h-10 w-10 text-red-500" />
            <span className="text-3xl font-heading font-bold">
              Cinema<span className="text-red-500">Concep</span>
            </span>
          </Link>
          
          <h1 className="text-5xl font-heading font-bold mb-6 leading-tight">
            Vive la mejor experiencia cinematográfica
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Únete a CinemaConcep y disfruta de los mejores estrenos, 
            promociones exclusivas y mucho más.
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-red-500">2</div>
              <div className="text-sm text-gray-300">Salas Premium</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-red-500">50</div>
              <div className="text-sm text-gray-300">Asientos/Sala</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-red-500">4K</div>
              <div className="text-sm text-gray-300">Resolución</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Formulario */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo para mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Film className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-heading font-bold text-white">
                Cinema<span className="text-red-500">Concep</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-white mb-2">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-gray-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Ingresando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-red-500 hover:text-red-400 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}