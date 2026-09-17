'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Film, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email ya está registrado')
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.')
      }
      setLoading(false)
    } else {
      // Redirigir o mostrar mensaje de confirmación
      router.push('/login?registered=true')
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Formulario */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo para mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Film className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white">
                Cinema<span className="text-red-500">Concep</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Crear Cuenta
            </h2>
            <p className="text-gray-400">
              Únete a CinemaConcep y disfruta de beneficios exclusivos
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500"
                  required
                  minLength={6}
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
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Crear Cuenta
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-red-500 hover:text-red-400 font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decoración */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-bl from-red-900 via-red-800 to-black">
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
        
        <div className="relative flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Comienza tu aventura cinematográfica
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Regístrate y obtén acceso a preventas exclusivas, 
            descuentos especiales y la mejor experiencia en cine.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-lg">🎬</span>
              </div>
              <span className="text-gray-200">Acceso a preventas exclusivas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-lg">🎫</span>
              </div>
              <span className="text-gray-200">Descuentos en boletos y combos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-lg">⭐</span>
              </div>
              <span className="text-gray-200">Puntos de fidelidad por cada compra</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}