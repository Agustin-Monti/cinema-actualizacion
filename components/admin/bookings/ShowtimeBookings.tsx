'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, Users, Popcorn, CreditCard, Clock, MapPin, Loader2, CheckCircle2, XCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ShowtimeBookingsProps {
  showtime: any
  bookings: any[]
}

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export function ShowtimeBookings({ showtime, bookings }: ShowtimeBookingsProps) {
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIMEZONE
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: TIMEZONE
    })
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('¿Cancelar esta reserva?')) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      alert(error.message)
      return
    }

    window.location.reload()
  }

  const handleConfirmBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      alert(error.message)
      return
    }

    window.location.reload()
  }

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)

  const totalSeats = bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0)

  return (
    <div>
      {/* Volver */}
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a horarios
      </Link>

      {/* Info del showtime */}
      <Card className="bg-gray-900/50 border-gray-800 p-5 mb-6">
        <div className="flex items-center gap-4">
          {showtime?.movie?.poster_url && (
            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img src={showtime.movie.poster_url} alt={showtime.movie.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-heading font-bold text-white">{showtime?.movie?.title}</h1>
            <div className="flex items-center gap-3 text-gray-400 text-sm mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-red-500" />
                {formatTime(showtime?.showtime)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-500" />
                {showtime?.room?.name}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-heading font-bold text-red-500">${totalRevenue.toLocaleString('es-AR')}</p>
            <p className="text-gray-500 text-xs">{totalSeats} asientos vendidos</p>
          </div>
        </div>
      </Card>

      {/* Lista de reservas */}
      {bookings.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
          <Users className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No hay reservas para este horario</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="bg-gray-900/50 border-gray-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={booking.status === 'confirmed' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : booking.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }>
                      {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                    </Badge>
                    <code className="text-xs text-gray-500">{booking.booking_code}</code>
                  </div>

                  {/* Asientos */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {booking.seats?.map((s: any, index: number) => (
                      <Badge key={`seat-${s.id || index}`} className="bg-gray-800 text-white text-xs">
                        {s.seat?.row_letter}{s.seat?.seat_number}
                      </Badge>
                    ))}
                  </div>

                  {/* Combos */}
                  {booking.combos?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Popcorn className="h-3.5 w-3.5" />
                      {booking.combos.map((c: any, index: number) => (
                        <span key={`combo-${c.id || index}`}>{c.combo?.name} x{c.quantity}</span>
                      ))}
                    </div>
                  )}

                  {/* Pago */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CreditCard className="h-3.5 w-3.5" />
                    {booking.payment_method || 'N/A'} · {booking.payment_status || 'Sin estado'}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-red-500 font-heading font-bold">${booking.total_amount?.toLocaleString('es-AR')}</p>
                  
                  {booking.status === 'pending' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleConfirmBooking(booking.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Confirmar
                    </Button>
                  )}
                  
                  {booking.status !== 'cancelled' && (
                    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}