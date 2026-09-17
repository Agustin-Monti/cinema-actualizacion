'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, Film, Calendar, Clock, MapPin, Ticket,
  Printer, Loader2, ArrowRight, QrCode, Popcorn, Clock3, CreditCard, AlertCircle, Volume2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')
  const supabase = createClient()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        router.push('/movies')
        return
      }

      try {
        const urlPaymentId = searchParams.get('payment_id')
        const urlStatus = searchParams.get('status')
        const urlPaymentType = searchParams.get('payment_type')
        const urlCollectionStatus = searchParams.get('collection_status')

        // Si viene de MP con pago aprobado, actualizar booking
        if ((urlStatus === 'approved' || urlCollectionStatus === 'approved') && urlPaymentId) {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_id: urlPaymentId,
              payment_status: 'approved',
              payment_method: urlPaymentType || 'account_money',
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .eq('status', 'pending')
        }

        // Cargar datos del booking
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            showtime:showtimes(*, movie:movies(*), room:rooms(*)),
            seats:booking_seats(seat:seats(*)),
            combos:booking_combos(id, quantity, unit_price, subtotal, combo:combos(id, name))
          `)
          .eq('id', bookingId)
          .single()

        if (error) throw error
        setBooking(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId, router, supabase, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Reserva no encontrada</p>
          <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => router.push('/movies')}>
            Ver Cartelera
          </Button>
        </Card>
      </div>
    )
  }

  const showtime = booking.showtime
  const movie = showtime?.movie
  const room = showtime?.room
  const seats = booking.seats?.map((s: any) => s.seat) || []
  const bookingCombos = booking.combos || []

  const urlStatus = searchParams.get('status')
  const isApproved = urlStatus === 'approved' || booking.status === 'confirmed' || booking.payment_status === 'approved'
  const isPending = !isApproved && booking.status === 'pending'

  // URL del ticket
  const getTicketUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/ticket/${booking.booking_code}`
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Estado Pendiente */}
        {isPending && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-6 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
              <Clock3 className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-heading font-bold text-yellow-400 mb-2">Pago Pendiente</h2>
            <p className="text-yellow-400/80 mb-4">Tu pago está siendo procesado.</p>
            <Button 
              variant="outline" 
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => window.location.reload()}
            >
              Verificar estado del pago
            </Button>
          </div>
        )}

        {/* Header éxito */}
        {isApproved && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">¡Compra Exitosa!</h1>
            <p className="text-gray-400">Tu reserva ha sido confirmada</p>
          </div>
        )}

        {/* Código de Reserva */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Código de Reserva</p>
            <div className="flex items-center justify-center gap-3">
              <QrCode className="h-6 w-6 text-red-500" />
              <p className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-wider">
                {booking.booking_code}
              </p>
            </div>
            <div className="mt-3">
              {isApproved ? (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />Pago Aprobado
                </Badge>
              ) : isPending ? (
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  <Clock3 className="h-3 w-3 mr-1" />Pago Pendiente
                </Badge>
              ) : null}
            </div>
          </div>
        </Card>

        {/* Detalles de la Función */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 mb-6">
          <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Film className="h-5 w-5 text-red-500" />
            Detalles de la Función
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-heading font-bold text-white mb-1">{movie?.title}</h4>
              <div className="flex flex-wrap gap-2">
                {movie?.genre?.map((g: string) => (
                  <Badge key={g} variant="outline" className="border-gray-700 text-gray-400 text-xs">{g}</Badge>
                ))}

                {showtime.audio_type && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Volume2 className="h-4 w-4 text-red-500" />
                    <Badge className={showtime.audio_type === 'Subtitulada' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}>
                      {showtime.audio_type}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gray-800" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="text-sm text-white">
                    {new Date(showtime.showtime).toLocaleDateString('es-AR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: TIMEZONE
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Hora</p>
                  <p className="text-sm text-white">
                    {new Date(showtime.showtime).toLocaleTimeString('es-AR', {
                      hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Sala</p>
                  <p className="text-sm text-white">{room?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <Ticket className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Asientos</p>
                  <p className="text-sm text-white">
                    {seats
                      .sort((a: any, b: any) => {
                        if (a.row_letter !== b.row_letter) return a.row_letter.localeCompare(b.row_letter)
                        return a.seat_number - b.seat_number
                      })
                      .map((s: any) => `${s.row_letter}${s.seat_number}`)
                      .join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            {booking.payment_method && (
              <>
                <Separator className="bg-gray-800" />
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Método de Pago</p>
                    <p className="text-sm text-white capitalize">{booking.payment_method}</p>
                  </div>
                </div>
              </>
            )}

            <Separator className="bg-gray-800" />

            {/* Totales */}
            <div>
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Entradas ({seats.length})</span>
                <span>${(seats.length * showtime.price).toLocaleString('es-AR')}</span>
              </div>
              
              {bookingCombos.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Popcorn className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Combos</span>
                  </div>
                  {bookingCombos.map((bc: any) => (
                    <div key={bc.id} className="flex justify-between text-gray-400 text-sm ml-6">
                      <span>{bc.combo?.name} x{bc.quantity}</span>
                      <span>${bc.subtotal?.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator className="bg-gray-800 mb-2" />
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total Pagado</span>
                <span>${booking.total_amount?.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isApproved && (
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push(`/ticket/${booking.booking_code}`)}
            >
              <Printer className="h-4 w-4 mr-2" />
              Ver Ticket Imprimible
            </Button>
          )}
          <Link href="/movies" className={isApproved ? 'flex-1' : 'w-full'}>
            <Button className={cn('w-full text-white bg-red-600 hover:bg-red-700')}>
              <ArrowRight className="h-4 w-4 mr-2" />
              {isApproved ? 'Seguir Comprando' : 'Ver Cartelera'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}