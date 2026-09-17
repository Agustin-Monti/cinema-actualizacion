'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Ticket, Search, Users, Clock, MapPin, Calendar, ArrowRight, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingsManagerProps {
  bookings: any[]
}

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export function BookingsManager({ bookings }: BookingsManagerProps) {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  // Agrupar reservas por showtime
  const showtimesMap = new Map<string, {
    showtime: any
    bookings: any[]
    totalSeats: number
    totalRevenue: number
  }>()

  bookings.forEach(b => {
    const stId = b.showtime_id
    if (!showtimesMap.has(stId)) {
      showtimesMap.set(stId, {
        showtime: b.showtime,
        bookings: [],
        totalSeats: 0,
        totalRevenue: 0
      })
    }
    const group = showtimesMap.get(stId)!
    group.bookings.push(b)
    group.totalSeats += b.seats?.length || 0
    if (b.status === 'confirmed') {
      group.totalRevenue += Number(b.total_amount || 0)
    }
  })

  const showtimesList = Array.from(showtimesMap.values())

  // Filtrar por búsqueda (película o código)
  const filteredShowtimes = showtimesList.filter(group => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      group.showtime?.movie?.title?.toLowerCase().includes(searchLower) ||
      group.bookings.some(b => b.booking_code?.toLowerCase().includes(searchLower))
    )
  })

  // Ordenar por fecha
  filteredShowtimes.sort((a, b) => {
    return new Date(a.showtime?.showtime).getTime() - new Date(b.showtime?.showtime).getTime()
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: TIMEZONE
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIMEZONE
    })
  }

  // Stats generales
  const stats = {
    totalBookings: bookings.length,
    totalShowtimes: showtimesList.length,
    totalRevenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0),
    totalSeats: bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0)
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-white mb-6">Horarios y Reservas</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <p className="text-2xl font-heading font-bold text-white">{stats.totalShowtimes}</p>
          <p className="text-gray-500 text-xs mt-1">Horarios</p>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <p className="text-2xl font-heading font-bold text-green-400">{stats.totalBookings}</p>
          <p className="text-gray-500 text-xs mt-1">Reservas</p>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <p className="text-2xl font-heading font-bold text-yellow-400">{stats.totalSeats}</p>
          <p className="text-gray-500 text-xs mt-1">Asientos vendidos</p>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <p className="text-2xl font-heading font-bold text-red-500">${stats.totalRevenue.toLocaleString('es-AR')}</p>
          <p className="text-gray-500 text-xs mt-1">Ingresos</p>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por película o código de reserva..."
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Lista de horarios */}
      {filteredShowtimes.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
          <Ticket className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No hay horarios con reservas</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredShowtimes.map((group) => (
            <Link key={group.showtime?.id} href={`/admin/bookings/showtime/${group.showtime?.id}`}>
              <Card className="bg-gray-900/50 border-gray-800 p-4 hover:border-red-500/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  {/* Fecha */}
                  <div className="flex-shrink-0 text-center w-16">
                    <p className="text-2xl font-heading font-bold text-white">
                      {new Date(group.showtime?.showtime).getDate()}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {new Date(group.showtime?.showtime).toLocaleDateString('es-AR', { month: 'short', timeZone: TIMEZONE })}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-heading font-semibold truncate">
                      {group.showtime?.movie?.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(group.showtime?.showtime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {group.showtime?.room?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {group.totalSeats} asientos
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-red-500 font-heading font-bold">
                      ${group.totalRevenue.toLocaleString('es-AR')}
                    </p>
                    <Badge className="bg-gray-800 text-gray-400 mt-1">
                      {group.bookings.length} reserva{group.bookings.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Flecha */}
                  <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}