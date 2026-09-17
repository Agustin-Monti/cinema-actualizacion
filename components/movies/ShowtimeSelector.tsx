'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, Film, Users, Calendar, Volume2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Showtime } from '@/types'

interface ShowtimeSelectorProps {
  showtimes: Showtime[]
}

const TIMEZONE = 'America/Argentina/Buenos_Aires'

const getDateKey = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

export function ShowtimeSelector({ showtimes }: ShowtimeSelectorProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const now = new Date()
  const futureShowtimes = showtimes.filter(st => new Date(st.showtime) > now)

  const showtimesByDate = futureShowtimes.reduce((acc, showtime) => {
    const dateKey = getDateKey(showtime.showtime)
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(showtime)
    return acc
  }, {} as Record<string, Showtime[]>)

  const today = new Date()
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  const formatDateHeader = (date: Date) => {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana'
    return date.toLocaleDateString('es-AR', { weekday: 'short', timeZone: TIMEZONE })
  }

  const isPast = (date: Date) => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return date < t
  }

  const hasShowtimes = (date: Date) => {
    const dateKey = getDateKey(date.toISOString())
    return (showtimesByDate[dateKey] || []).some(st => new Date(st.showtime) > now)
  }

  const getSelectedShowtimes = () => {
    const dateKey = getDateKey(selectedDate.toISOString())
    return (showtimesByDate[dateKey] || []).filter(st => new Date(st.showtime) > now)
  }

  const selectedShowtimes = getSelectedShowtimes()

  const showtimesByMovie = selectedShowtimes.reduce((acc, st) => {
    const movieId = st.movie_id
    if (!acc[movieId]) acc[movieId] = { movie: st.movie, showtimes: [] }
    acc[movieId].showtimes.push(st)
    return acc
  }, {} as Record<string, { movie: any; showtimes: Showtime[] }>)

  if (futureShowtimes.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
        <Clock className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-400">No hay horarios disponibles</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra segmentada de días */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
        {nextDays.map((date, index) => {
          const active = selectedDate.toDateString() === date.toDateString()
          const disabled = isPast(date) || !hasShowtimes(date)
          
          return (
            <button
              key={index}
              onClick={() => !disabled && setSelectedDate(date)}
              disabled={disabled}
              className={cn(
                'flex-shrink-0 flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all duration-200 cursor-pointer',
                active
                  ? 'bg-red-600 text-white shadow-md'
                  : disabled
                    ? 'text-gray-600 opacity-40 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="text-[11px] md:text-xs font-medium uppercase">
                {formatDateHeader(date)}
              </span>
              <span className="text-xl md:text-2xl font-heading font-bold">
                {date.getDate()}
              </span>
              <span className="text-[10px] uppercase opacity-70">
                {date.toLocaleDateString('es-AR', { month: 'short', timeZone: TIMEZONE })}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cards de películas */}
      <div className="space-y-4">
        {Object.entries(showtimesByMovie).length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
            <Clock className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay funciones para este día</p>
          </Card>
        ) : (
          Object.entries(showtimesByMovie).map(([movieId, { movie, showtimes: movieShowtimes }]) => {
            const sortedShowtimes = [...movieShowtimes].sort(
              (a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime()
            )

            return (
              <Card 
                key={movieId} 
                className="bg-gray-900/40 border-gray-800/60 hover:border-gray-700/60 transition-colors overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 md:p-5 border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-red-600/10 rounded-xl flex items-center justify-center">
                        <Film className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-white font-heading font-semibold text-base md:text-lg">
                          {movie?.title}
                        </h4>
                        <p className="text-gray-400 text-sm flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {movieShowtimes[0]?.room?.name}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gray-800 text-gray-300 text-sm">
                      {movieShowtimes.length} funciones
                    </Badge>
                  </div>
                </div>

                {/* Grid de horarios */}
                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortedShowtimes.map(st => {
                      const isLow = st.available_seats < 10
                      return (
                        <button
                          key={st.id}
                          onClick={() => router.push(`/booking/select-seats?showtime=${st.id}`)}
                          className={cn(
                            'flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border transition-all group text-left cursor-pointer',
                            isLow
                              ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/15'
                              : 'border-gray-700/60 bg-gray-800/40 hover:border-red-500/50 hover:bg-red-500/10'
                          )}
                        >
                          {/* Hora grande */}
                          <span className={cn(
                            'text-xl md:text-2xl font-heading font-bold',
                            isLow ? 'text-red-400' : 'text-white group-hover:text-red-400'
                          )}>
                            {new Date(st.showtime).toLocaleTimeString('es-AR', {
                              hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIMEZONE
                            })}
                          </span>

                          {/* Info derecha */}
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm md:text-base font-semibold text-gray-300">
                              ${st.price.toLocaleString('es-AR')}
                            </span>
                            
                            {st.audio_type && (
                              <span className={cn(
                                'flex items-center gap-1 text-xs',
                                st.audio_type === 'Subtitulada' ? 'text-blue-400' : 'text-green-400'
                              )}>
                                <Volume2 className="h-3.5 w-3.5" />
                                {st.audio_type}
                              </span>
                            )}
                            
                            <span className={cn(
                              'flex items-center gap-1 text-xs',
                              isLow ? 'text-red-400 font-medium' : 'text-gray-500'
                            )}>
                              <Users className="h-3.5 w-3.5" />
                              {st.available_seats} disponibles
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}