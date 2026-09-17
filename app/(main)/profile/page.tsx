'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, Mail, Phone, Ticket, Star, LogOut, Loader2, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/profile')
        return
      }
      
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <Card className="bg-gray-900/50 border-gray-800 p-8 mb-6 text-center">
          <Avatar className="h-24 w-24 ring-4 ring-red-500/30 mx-auto mb-4">
            <AvatarFallback className="bg-red-600 text-white text-3xl font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-heading font-bold text-white mb-1">
            {profile?.full_name || 'Usuario'}
          </h1>
          <p className="text-gray-400">{user?.email}</p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Badge className="bg-red-600/10 text-red-400 border-red-500/30">
              <Star className="h-3 w-3 mr-1" />
              {profile?.points || 0} puntos
            </Badge>
          </div>
        </Card>

        {/* Info */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 mb-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">Información Personal</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <User className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-white">{profile?.full_name || 'No especificado'}</p>
              </div>
            </div>
            <Separator className="bg-gray-800" />
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
            </div>
            <Separator className="bg-gray-800" />
            <div className="flex items-center gap-3 text-gray-400">
              <Phone className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-white">{profile?.phone || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Acciones */}
        <div className="space-y-3">
          <Link href="/bookings">
            <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
              <Ticket className="h-4 w-4 mr-2" />
              Mis Boletos
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}