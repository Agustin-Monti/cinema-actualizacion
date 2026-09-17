'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, Trash2, Loader2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShowtimeCardProps {
  id: string
  movieTitle: string
  posterUrl?: string
  time: string
  roomName: string
  price: number
  availableSeats: number
  audioType?: string
  onDelete: (id: string) => void
  isDeleting: boolean
}

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export function ShowtimeCard({
  id, movieTitle, posterUrl, time, roomName, price, availableSeats, audioType, onDelete, isDeleting
}: ShowtimeCardProps) {
  const formattedTime = new Date(time).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIMEZONE
  })

  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
      <div className="flex items-stretch">
        <div className="w-20 md:w-24 flex-shrink-0 bg-gray-800">
          {posterUrl ? (
            <img src={posterUrl} alt={movieTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex-1 p-3 md:p-4">
          <h3 className="text-white font-heading font-semibold text-sm md:text-base truncate">{movieTitle}</h3>
          
          <div className="flex items-center gap-3 mt-1.5 text-xs md:text-sm text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-red-500" />
              <span className="text-white font-semibold">{formattedTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              {roomName}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {audioType && (
              <Badge className={cn(
                audioType === 'Subtitulada'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-green-500/10 text-green-400 border-green-500/30',
                'text-[10px] px-1.5'
              )}>
                <Volume2 className="h-3 w-3 mr-1" />
                {audioType}
              </Badge>
            )}
            <span className="text-red-500 font-heading font-bold text-sm">
              ${price.toLocaleString('es-AR')}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {availableSeats} disp.
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(id)}
        disabled={isDeleting}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all border-t border-gray-800 text-xs md:text-sm font-medium disabled:opacity-50"
      >
        {isDeleting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Eliminando...</>
        ) : (
          <><Trash2 className="h-4 w-4" />Eliminar Horario</>
        )}
      </button>
    </Card>
  )
}