'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Film, Ticket, User, Menu, LogOut, X, Home, 
  Gift, ChevronDown, Candy, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMobileOpen(false)
    router.refresh()
    router.push('/')
  }

  const getInitials = (email: string) => email?.charAt(0).toUpperCase() || 'U'

  // Links para mobile
  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/movies', label: 'Cartelera', icon: Film },
    { href: '/promotions', label: 'Promociones', icon: Ticket },
    { href: '/candy', label: 'Candy Bar', icon: Candy },
    { href: '/club-fan', label: 'Club Fan', icon: Crown },
    { href: '/bookings', label: 'Mis Boletos', icon: Ticket, requireAuth: true },
    { href: '/profile', label: 'Mi Perfil', icon: User, requireAuth: true },
  ]

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20' 
          : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className={cn(
                  'w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center transition-all duration-300',
                  'group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-500/30'
                )}>
                  <Film className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-white text-xl md:text-2xl font-heading font-bold tracking-tight">
                Cinema<span className="text-red-500">Concep</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Inicio
                </span>
              </Link>

              <Link
                href="/movies"
                className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  Cartelera
                </span>
              </Link>

              {/* Beneficios Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
                    <Gift className="h-4 w-4" />
                    Beneficios
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-gray-900 border-gray-800 mt-1">
                  <Link href="/promotions" className="block">
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer py-2.5">
                      <Ticket className="h-4 w-4 mr-3 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Promociones</p>
                        <p className="text-xs text-gray-500">2x1 y descuentos</p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/candy" className="block">
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer py-2.5">
                      <Candy className="h-4 w-4 mr-3 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Candy Bar</p>
                        <p className="text-xs text-gray-500">Combos y coleccionables</p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/club-fan" className="block">
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer py-2.5">
                      <Crown className="h-4 w-4 mr-3 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Club Fan</p>
                        <p className="text-xs text-gray-500">Membresías premium</p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>

              {user && (
                <>
                  <Link
                    href="/bookings"
                    className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Mis Boletos
                    </span>
                  </Link>

                  <Link
                    href="/profile"
                    className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mi Perfil
                    </span>
                  </Link>
                </>
              )}

              <div className="w-px h-6 bg-white/10 mx-2" />

              {user ? (
                <div className="flex items-center gap-2 pl-2">
                  <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8 ring-2 ring-red-500/30 hover:ring-red-500/50 transition-all">
                      <AvatarFallback className="bg-red-600 text-white text-xs font-bold">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-400 text-xs"
                  >
                    Salir
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6">
                    <User className="h-4 w-4 mr-2" />
                    Ingresar
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Buttons */}
            <div className="flex items-center gap-2 md:hidden">
              {user && (
                <Link href="/profile">
                  <Avatar className="h-8 w-8 ring-2 ring-red-500/30">
                    <AvatarFallback className="bg-red-600 text-white text-xs font-bold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
              {!user && (
                <Link href="/login">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4">
                    Ingresar
                  </Button>
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl transition-all',
                  'text-white hover:bg-white/10',
                  mobileOpen && 'bg-white/10'
                )}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-gray-950 border-l border-white/10 shadow-2xl animate-slide-in">
            <div className="flex flex-col h-full pt-20 pb-6 px-6">
              
              {/* User info */}
              {user ? (
                <Link 
                  href="/profile" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-6 hover:bg-white/10 transition-colors"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-red-500/30">
                    <AvatarFallback className="bg-red-600 text-white font-bold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm">{user.email}</p>
                    <p className="text-gray-500 text-xs">Ver perfil</p>
                  </div>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block mb-6">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-6">
                    <User className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                {navLinks.map((link) => {
                  if (link.requireAuth && !user) return null
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all"
                    >
                      <Icon className="h-5 w-5 text-red-500" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-500 text-xs px-4 mb-3">CinemaConcep</p>
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full px-4 py-3 rounded-xl transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}