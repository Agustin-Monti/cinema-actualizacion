'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Film, Calendar, Clock, MapPin, Ticket, Popcorn
} from 'lucide-react'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

interface TicketContentProps {
  booking: any
  qrDataUrl: string
}

function formatDate(dateString: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-AR', {
    ...options,
    timeZone: TIMEZONE
  }).format(date)
}

export function TicketContent({ booking, qrDataUrl }: TicketContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const showtime = booking.showtime
  const movie = showtime?.movie
  const room = showtime?.room
  const seats = booking.seats?.map((s: any) => s.seat) || []
  const bookingCombos = booking.combos || []

  // Si no está montado, mostrar versión sin formato para evitar hidratación
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-24 md:pt-28">
        <Card className="max-w-md w-full bg-white shadow-2xl">
          <div className="bg-red-600 p-6 text-white text-center rounded-t-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Film className="h-8 w-8" />
              <span className="text-2xl font-bold">CinemaConcep</span>
            </div>
            <p className="text-red-100 text-sm">Cargando ticket...</p>
          </div>
          <div className="p-6 text-center text-gray-400">Cargando...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 md:pt-28 print:p-0 print:pt-0">
      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <Card className="print-card max-w-md w-full bg-white shadow-2xl">
        {/* Encabezado */}
        <div className="bg-red-600 p-6 text-white text-center rounded-t-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Film className="h-8 w-8" />
            <span className="text-2xl font-heading font-bold">CinemaConcep</span>
          </div>
          <p className="text-red-100 text-sm">Ticket de Reserva</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Película */}
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-gray-900">{movie?.title}</h2>
            <div className="flex justify-center gap-2 mt-2">
              {movie?.genre?.map((g: string) => (
                <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
              ))}
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(showtime.showtime, {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Hora</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(showtime.showtime, {
                    hour: '2-digit', minute: '2-digit', hour12: false
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Sala</p>
                <p className="text-sm font-semibold text-gray-900">{room?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Ticket className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Asientos</p>
                <p className="text-sm font-semibold text-gray-900">
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

          <Separator className="border-dashed" />

          {/* Combos */}
          {bookingCombos.length > 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Popcorn className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold">Combos incluidos</span>
                </div>
                {bookingCombos.map((bc: any) => (
                  <div key={bc.id} className="flex justify-between text-sm text-gray-600 ml-6">
                    <span>{bc.combo?.name} x{bc.quantity}</span>
                  </div>
                ))}
              </div>
              <Separator className="border-dashed" />
            </>
          )}

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">Total abonado</span>
            <span className="text-2xl font-heading font-bold text-red-600">
              ${booking.total_amount?.toLocaleString('es-AR')}
            </span>
          </div>

          {/* QR y Código */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-400 mb-1">Código de reserva</p>
              <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">
                {booking.booking_code}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Estado: <span className="text-green-600 font-semibold">Confirmado ✓</span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <img src={qrDataUrl} alt="QR Ticket" className="w-24 h-24" />
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="bg-gray-50 p-4 text-center rounded-b-xl">
          <p className="text-xs text-gray-400">
            Presentá este ticket en la entrada del cine
          </p>
        </div>
      </Card>

      {/* Botón imprimir */}
      <div className="fixed bottom-6 right-6 no-print z-50">
        <button
          onClick={() => window.print()}
          className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition-colors font-semibold text-sm"
        >
          🖨️ Imprimir Ticket
        </button>
      </div>
    </div>
  )
}