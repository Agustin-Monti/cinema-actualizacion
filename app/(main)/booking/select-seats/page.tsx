'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getShowtimeById, getSeatsByRoom, getOccupiedSeats } from '@/lib/supabase/services'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronLeft, 
  Clock, 
  Film, 
  MapPin,
  Ticket,
  Loader2,
  AlertCircle,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Showtime, Seat } from '@/types'

function SelectSeatsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showtimeId = searchParams.get('showtime')
  const supabase = createClient()

  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!showtimeId) {
        router.push('/movies')
        return
      }

      try {
        const [showtimeData, userData] = await Promise.all([
          getShowtimeById(showtimeId),
          supabase.auth.getUser()
        ])

        if (!showtimeData) {
          setError('Horario no encontrado')
          setLoading(false)
          return
        }

        setShowtime(showtimeData)
        setUser(userData.data.user)

        const [seatsData, occupiedData] = await Promise.all([
          getSeatsByRoom(showtimeData.room_id),
          getOccupiedSeats(showtimeId)
        ])

        setSeats(seatsData)
        setOccupiedSeats(occupiedData)
      } catch (err) {
        setError('Error al cargar los datos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [showtimeId, router, supabase])

  const toggleSeat = (seat: Seat) => {
    if (occupiedSeats.includes(seat.id)) return

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id)
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id)
      } else {
        return [...prev, seat]
      }
    })
  }

  const handleBooking = async () => {
    if (!user) {
      router.push(`/login?redirect=/booking/select-seats?showtime=${showtimeId}`)
      return
    }

    if (selectedSeats.length === 0) {
      setError('Selecciona al menos un asiento')
      return
    }

    // Redirigir a página de resumen con combos
    const seatIds = selectedSeats.map(s => s.id).join(',')
    router.push(`/booking/checkout?showtime=${showtimeId}&seats=${seatIds}`)
  }

  const getSeatStyle = (seat: Seat) => {
    if (occupiedSeats.includes(seat.id)) {
      return 'bg-gray-800/50 border-gray-700 cursor-not-allowed'
    }
    if (selectedSeats.find(s => s.id === seat.id)) {
      return 'bg-red-600 border-red-400 shadow-lg shadow-red-500/30 scale-110 z-10'
    }
    return 'bg-gray-700/50 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
  }

  // Agrupar asientos por fila
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row_letter]) {
      acc[seat.row_letter] = []
    }
    acc[seat.row_letter].push(seat)
    return acc
  }, {} as Record<string, Seat[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (error || !showtime) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">{error || 'Horario no encontrado'}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => router.push('/movies')}
          >
            Ver Cartelera
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            {showtime.available_seats} disponibles
          </Badge>
        </div>

        {/* Info de la función */}
        <Card className="bg-gray-900/50 border-gray-800 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-white">
              <Film className="h-5 w-5 text-red-500" />
              <span className="font-heading font-semibold">{showtime.movie?.title}</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-gray-800 hidden md:block" />
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4 text-red-500" />
              <span>
                {new Date(showtime.showtime).toLocaleString('es-CL', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-gray-800 hidden md:block" />
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="h-4 w-4 text-red-500" />
              <span>{showtime.room?.name}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAPA DE ASIENTOS REALISTA */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="bg-gray-900/50 border-gray-800 p-6 md:p-8">
              {/* Decoración de sala */}
              <div className="max-w-md mx-auto">
                {/* Pared superior */}
                <div className="h-3 bg-gray-800 rounded-t-2xl mb-6" />
                
                {/* Pantalla */}
                <div className="mb-10">
                  <div className="flex items-center justify-center mb-1">
                    <Monitor className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="relative">
                    <div className="h-1.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full mx-8" />
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent blur-sm mx-8" />
                  </div>
                  <p className="text-center text-gray-600 text-xs mt-3 tracking-widest uppercase">
                    Pantalla
                  </p>
                </div>

                {/* Asientos */}
                <div className="space-y-2.5 mb-10">
                  {Object.entries(rows).sort().map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-1">
                      {/* Etiqueta de fila */}
                      <span className="text-gray-600 text-xs font-medium w-5 text-right">
                        {row}
                      </span>
                      
                      {/* Asientos */}
                      <div className="flex-1 flex justify-center gap-1.5">
                        {rowSeats
                          .sort((a, b) => a.seat_number - b.seat_number)
                          .map((seat, index) => (
                            <React.Fragment key={seat.id}>
                              {/* Espacio de pasillo cada 5 asientos (excepto bordes) */}
                              {index === 5 && (
                                <div className="w-3 md:w-4" />
                              )}
                              <button
                                onClick={() => toggleSeat(seat)}
                                disabled={occupiedSeats.includes(seat.id)}
                                className={cn(
                                  'w-8 h-8 md:w-10 md:h-10 rounded-t-xl rounded-b-md border-2 transition-all duration-200',
                                  'flex items-center justify-center text-xs font-medium',
                                  'hover:scale-110 active:scale-95',
                                  getSeatStyle(seat),
                                  selectedSeats.find(s => s.id === seat.id)
                                    ? 'text-white'
                                    : occupiedSeats.includes(seat.id)
                                      ? 'text-gray-600'
                                      : 'text-gray-400'
                                )}
                                title={`${row}${seat.seat_number}`}
                              >
                                {seat.seat_number}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>
                      
                      {/* Etiqueta de fila */}
                      <span className="text-gray-600 text-xs font-medium w-5 text-left">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pared inferior */}
                <div className="h-3 bg-gray-800 rounded-b-2xl" />
              </div>

              {/* Leyenda */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-700/50 rounded-t-lg rounded-b border-2 border-gray-600" />
                  <span className="text-xs text-gray-400">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-t-lg rounded-b border-2 border-red-400 shadow-lg shadow-red-500/20" />
                  <span className="text-xs text-gray-400">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-800/50 rounded-t-lg rounded-b border-2 border-gray-700" />
                  <span className="text-xs text-gray-400">Ocupado</span>
                </div>
              </div>
            </Card>
          </div>

          {/* RESUMEN */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <Card className="bg-gray-900/50 border-gray-800 p-6 sticky top-24">
              <h3 className="text-xl font-heading font-bold text-white mb-4">
                Tu Selección
              </h3>
              
              {selectedSeats.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Asientos elegidos:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats
                        .sort((a, b) => {
                          if (a.row_letter !== b.row_letter) return a.row_letter.localeCompare(b.row_letter)
                          return a.seat_number - b.seat_number
                        })
                        .map((seat) => (
                          <Badge key={seat.id} className="bg-red-600 text-white">
                            {seat.row_letter}{seat.seat_number}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-800 my-4" />

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Entradas ({selectedSeats.length})</span>
                      <span>${(selectedSeats.length * (showtime?.price || 0)).toLocaleString('es-CL')}</span>
                    </div>
                    <Separator className="bg-gray-800" />
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Subtotal</span>
                      <span>${(selectedSeats.length * (showtime?.price || 0)).toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
                    onClick={handleBooking}
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    {user ? 'Continuar Compra' : 'Iniciar Sesión'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Selecciona tus asientos en el mapa
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Necesitamos importar React para Fragment
import React from 'react'

export default function SelectSeatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    }>
      <SelectSeatsContent />
    </Suspense>
  )
}