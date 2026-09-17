'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getShowtimeById, getSeatsByRoom, getCombos, createCompleteBooking } from '@/lib/supabase/services'
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
  ShoppingCart,
  Plus,
  Minus,
  Popcorn,
  GlassWater,
  Candy,
  Volume2 
} from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import Image from 'next/image'
import type { Showtime, Seat, Combo } from '@/types'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showtimeId = searchParams.get('showtime')
  const seatIdsParam = searchParams.get('seats')
  const seatIds = seatIdsParam ? seatIdsParam.split(',') : []
  const supabase = createClient()

  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [combos, setCombos] = useState<Combo[]>([])
  const [selectedCombos, setSelectedCombos] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!showtimeId || seatIds.length === 0) {
        router.push('/movies')
        return
      }

      try {
        const showtimeData = await getShowtimeById(showtimeId)
        if (!showtimeData) {
          setError('Horario no encontrado')
          setLoading(false)
          return
        }
        setShowtime(showtimeData)

        try {
          const { data: userData } = await supabase.auth.getUser()
          setUser(userData.user)
        } catch (userErr) {
          console.warn('Usuario no cargado')
        }

        const allSeats = await getSeatsByRoom(showtimeData.room_id)
        const selected = allSeats.filter(s => seatIds.includes(s.id))
        setSelectedSeats(selected)

        try {
          const combosData = await getCombos()
          setCombos(combosData as Combo[] || [])
        } catch (comboErr) {
          console.warn('Combos no cargados')
          setCombos([])
        }
      } catch (err: any) {
        setError('Error al cargar: ' + (err?.message || 'Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [showtimeId])

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
          <p className="text-white text-lg">{error || 'Error al cargar'}</p>
          <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => router.push('/movies')}>
            Ver Cartelera
          </Button>
        </Card>
      </div>
    )
  }

  const ticketPrice = showtime.price || 0
  const ticketsTotal = selectedSeats.length * ticketPrice

  const combosTotal = Object.entries(selectedCombos).reduce((total, [comboId, quantity]) => {
    const combo = combos.find(c => c.id === comboId)
    return total + (combo?.price || 0) * quantity
  }, 0)

  const totalAmount = ticketsTotal + combosTotal

  const handleComboQuantity = (comboId: string, change: number) => {
    setSelectedCombos(prev => {
      const current = prev[comboId] || 0
      const newQuantity = Math.max(0, current + change)
      if (newQuantity === 0) {
        const { [comboId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [comboId]: newQuantity }
    })
  }

  const handleConfirmBooking = async () => {
    if (!user) {
      router.push(`/login?redirect=/booking/checkout?showtime=${showtimeId}&seats=${seatIds.join(',')}`)
      return
    }

    setProcessing(true)
    setError('')

    try {
      const comboSelections = Object.entries(selectedCombos).map(([comboId, quantity]) => ({
        comboId,
        quantity
      }))

      const booking = await createCompleteBooking(user.id, showtimeId!, seatIds, comboSelections, totalAmount)

      const paymentItems = [
        {
          id: `tickets-${booking.id}`,
          title: `${selectedSeats.length} Entrada(s) - ${showtime?.movie?.title}`,
          quantity: 1,
          unit_price: ticketsTotal
        },
        ...Object.entries(selectedCombos)
          .filter(([_, quantity]) => quantity > 0)
          .map(([comboId, quantity]) => {
            const combo = combos.find(c => c.id === comboId)
            return {
              id: `combo-${comboId}`,
              title: `${combo?.name} x${quantity}`,
              quantity: 1,
              unit_price: (combo?.price || 0) * quantity
            }
          })
      ].filter(item => item.unit_price > 0)

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, totalAmount, items: paymentItems })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setProcessing(false)
        return
      }

      window.location.href = data.sandboxInitPoint || data.initPoint

    } catch (err) {
      setError('Error al procesar la compra. Intenta de nuevo.')
      console.error(err)
      setProcessing(false)
    }
  }

  const getComboIcon = (comboName: string) => {
    if (comboName.toLowerCase().includes('infantil')) return Candy
    if (comboName.toLowerCase().includes('mega')) return Popcorn
    if (comboName.toLowerCase().includes('familiar')) return Popcorn
    return GlassWater
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            Paso 2 de 2 - Revisar y Confirmar
          </Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-8">
          Resumen de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">Compra</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 p-5 md:p-6">
              <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Film className="h-5 w-5 text-red-500" />
                Detalles de la Función
              </h3>
              
              <div className="flex gap-4">
                <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={showtime.movie?.poster_url || ''}
                    alt={showtime.movie?.title || ''}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    {new Date(showtime.showtime).toLocaleString('es-AR', {
                      dateStyle: 'long', timeStyle: 'short', timeZone: TIMEZONE
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    {showtime.room?.name}
                  </div>
                  {showtime.audio_type && (
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-red-500" />
                      <Badge className={showtime.audio_type === 'Subtitulada' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}>
                        {showtime.audio_type}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-red-500" />
                    {formatDuration(showtime.movie?.duration || 0)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-5 md:p-6">
              <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-red-500" />
                Entradas ({selectedSeats.length})
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSeats.sort((a, b) => {
                  if (a.row_letter !== b.row_letter) return a.row_letter.localeCompare(b.row_letter)
                  return a.seat_number - b.seat_number
                }).map((seat) => (
                  <Badge key={seat.id} className="bg-red-600/20 text-red-400 border border-red-500/30 text-sm px-3 py-1">
                    {seat.row_letter}{seat.seat_number}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between text-gray-400 text-sm">
                <span>{selectedSeats.length} x ${ticketPrice.toLocaleString('es-AR')}</span>
                <span>${ticketsTotal.toLocaleString('es-AR')}</span>
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-5 md:p-6">
              <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <Popcorn className="h-5 w-5 text-red-500" />
                Agregar Combos
                <Badge className="bg-gray-800 text-gray-400 text-xs ml-2">Opcional</Badge>
              </h3>
              
              <div className="space-y-3">
                {combos.map((combo) => {
                  const ComboIcon = getComboIcon(combo.name)
                  const quantity = selectedCombos[combo.id] || 0
                  
                  return (
                    <div key={combo.id} className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border transition-all',
                      quantity > 0 ? 'bg-red-600/10 border-red-500/30' : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'
                    )}>
                      <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ComboIcon className="h-6 w-6 text-red-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-heading font-semibold text-sm">{combo.name}</h4>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{combo.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-500 font-bold text-sm">${combo.price.toLocaleString('es-AR')}</span>
                          {quantity > 0 && (
                            <Badge className="bg-red-600 text-white text-xs">${(combo.price * quantity).toLocaleString('es-AR')}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => handleComboQuantity(combo.id, -1)} disabled={quantity === 0}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-white font-heading font-bold w-6 text-center text-sm">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => handleComboQuantity(combo.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800 p-6 sticky top-24">
              <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-red-500" />
                Total a Pagar
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span className="text-sm">Entradas ({selectedSeats.length})</span>
                  <span className="text-sm">${ticketsTotal.toLocaleString('es-AR')}</span>
                </div>
                
                {Object.entries(selectedCombos).map(([comboId, quantity]) => {
                  const combo = combos.find(c => c.id === comboId)
                  if (!combo || quantity === 0) return null
                  return (
                    <div key={comboId} className="flex justify-between text-gray-400">
                      <span className="text-sm">{combo.name} x{quantity}</span>
                      <span className="text-sm">${(combo.price * quantity).toLocaleString('es-AR')}</span>
                    </div>
                  )
                })}
                
                <Separator className="bg-gray-800" />
                
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
                    ${totalAmount.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg mb-3"
                onClick={handleConfirmBooking} disabled={processing}>
                {processing ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" />Creando reserva...</>
                ) : (
                  <><Ticket className="h-5 w-5 mr-2" />{user ? 'Confirmar y Pagar' : 'Iniciar Sesión para Comprar'}</>
                )}
              </Button>
              
              <p className="text-gray-600 text-xs text-center mt-4">
                Al confirmar aceptás nuestros términos y condiciones
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-24 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}