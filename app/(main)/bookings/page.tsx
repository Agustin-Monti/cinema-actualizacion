'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Ticket, 
  Film, 
  Clock, 
  MapPin, 
  Calendar,
  QrCode,
  Loader2,
  ArrowRight,
  Popcorn,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export default function BookingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/bookings')
        return
      }
      
      setUser(user)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            room:rooms(*)
          ),
          seats:booking_seats(
            seat:seats(*)
          ),
          combos:booking_combos(
            id,
            quantity,
            unit_price,
            subtotal,
            combo:combos(id, name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setBookings(data || [])
      }
      
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const getBookingStatus = (booking: any) => {
    const showtimeDate = new Date(booking.showtime?.showtime)
    const now = new Date()

    if (booking.status === 'cancelled') return 'cancelled'
    if (booking.status === 'pending') return 'pending'
    if (showtimeDate < now) return 'past'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { 
        icon: CheckCircle2, 
        color: 'bg-green-500/10 text-green-400 border-green-500/30', 
        label: 'Activo' 
      },
      pending: { 
        icon: Clock3, 
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', 
        label: 'Pendiente' 
      },
      past: { 
        icon: CheckCircle2, 
        color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', 
        label: 'Finalizada' 
      },
      cancelled: { 
        icon: XCircle, 
        color: 'bg-red-500/10 text-red-400 border-red-500/30', 
        label: 'Cancelada' 
      }
    }
    
    const config = configs[status as keyof typeof configs]
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => getBookingStatus(b) === activeTab)

  const counts = {
    all: bookings.length,
    active: bookings.filter(b => getBookingStatus(b) === 'active').length,
    past: bookings.filter(b => getBookingStatus(b) === 'past').length,
    cancelled: bookings.filter(b => getBookingStatus(b) === 'cancelled').length
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-white mb-2">
            Mis Boletos
          </h1>
          <p className="text-gray-400">
            Historial de tus compras y reservas
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6">
              <Ticket className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-white mb-2">
              No tenés boletos aún
            </h3>
            <p className="text-gray-400 mb-6">
              ¡Comprá tus entradas y disfrutá del cine!
            </p>
            <Link href="/movies">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-xl px-12 py-8 w-full sm:w-auto rounded-full font-heading font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all">
                <Ticket className="h-6 w-6 mr-3" />
                Ver Cartelera
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-gray-900/50 border border-gray-800 p-1 rounded-xl w-full flex">
                <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                  Todos ({counts.all})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                  Activos ({counts.active})
                </TabsTrigger>
                <TabsTrigger value="past" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                  Pasados ({counts.past})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Lista de boletos */}
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const showtime = booking.showtime
                const movie = showtime?.movie
                const room = showtime?.room
                const seats = booking.seats?.map((s: any) => s.seat) || []
                const bookingCombos = booking.combos || []
                const status = getBookingStatus(booking)
                const isClickable = status === 'active' || status === 'pending'

                const content = (
                  <Card 
                    className={cn(
                      'bg-gray-900/50 border-gray-800 overflow-hidden transition-all duration-300',
                      isClickable && 'hover:border-red-500/50 cursor-pointer',
                      status === 'past' && 'opacity-60',
                      status === 'cancelled' && 'opacity-50'
                    )}
                  >
                    {/* Barra superior de color según estado */}
                    <div className={cn(
                      'h-1',
                      status === 'active' && 'bg-green-500',
                      status === 'pending' && 'bg-yellow-500',
                      status === 'past' && 'bg-gray-500',
                      status === 'cancelled' && 'bg-red-500'
                    )} />

                    <div className="p-5 md:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                          {/* Poster */}
                          <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={movie?.poster_url || ''}
                              alt={movie?.title || ''}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          
                          {/* Info */}
                          <div>
                            <h3 className="text-lg font-heading font-bold text-white mb-1">
                              {movie?.title}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-red-500" />
                                {new Date(showtime?.showtime).toLocaleDateString('es-AR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  timeZone: TIMEZONE
                                })}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-red-500" />
                                {new Date(showtime?.showtime).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: TIMEZONE
                                })}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-red-500" />
                                {room?.name}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(status)}
                          <div className="text-right">
                            <p className="text-white font-heading font-bold text-lg">
                              ${booking.total_amount?.toLocaleString('es-AR')}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {seats.length} entrada{seats.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-800 mb-4" />

                      {/* Detalles expandidos */}
                      <div className="space-y-2">
                        {/* Asientos */}
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Ticket className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span>
                            Asientos:{' '}
                            <span className="text-white font-medium">
                              {seats
                                .sort((a: any, b: any) => {
                                  if (a.row_letter !== b.row_letter) return a.row_letter.localeCompare(b.row_letter)
                                  return a.seat_number - b.seat_number
                                })
                                .map((s: any) => `${s.row_letter}${s.seat_number}`)
                                .join(', ')}
                            </span>
                          </span>
                        </div>

                        {/* Combos */}
                        {bookingCombos.length > 0 && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Popcorn className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span>
                              {bookingCombos.map((bc: any) => 
                                `${bc.combo?.name} x${bc.quantity}`
                              ).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Código */}
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <QrCode className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <code className="text-gray-500 text-xs">{booking.booking_code}</code>
                        </div>
                      </div>

                      {/* Acción */}
                      {isClickable && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            Ver Detalles
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )

                // Si es clickable, envolver en Link
                if (isClickable) {
                  return (
                    <Link key={booking.id} href={`/booking/confirmation?booking=${booking.id}`}>
                      {content}
                    </Link>
                  )
                }
                
                return <div key={booking.id}>{content}</div>
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}