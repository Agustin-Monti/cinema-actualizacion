'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Plus, Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ShowtimeCard } from './ShowtimeCard'

interface Showtime {
  id: string
  movie_id: string
  room_id: string
  showtime: string
  price: number
  available_seats: number
  audio_type?: string
  movie?: { id: string; title: string; poster_url: string }
  room?: { id: string; name: string }
}

interface Movie {
  id: string
  title: string
}

interface Room {
  id: string
  name: string
  capacity: number
}

interface ShowtimesManagerProps {
  showtimes: Showtime[]
  movies: Movie[]
  rooms: Room[]
}

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export function ShowtimesManager({ showtimes, movies, rooms }: ShowtimesManagerProps) {
  const supabase = createClient()
  const [filterDate, setFilterDate] = useState('')
  const [filterMovie, setFilterMovie] = useState('all')
  const [filterRoom, setFilterRoom] = useState('all')
  const [filterAudio, setFilterAudio] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState(false)

  const [newShowtime, setNewShowtime] = useState({
    movie_id: '',
    room_id: '',
    date: '',
    time: '',
    price: 5000,
    audio_type: 'Español Latino'
  })

  useEffect(() => {
    const cleanOldShowtimes = async () => {
      setCleaning(true)
      try {
        const now = new Date().toISOString()
        const { data: oldShowtimes } = await supabase
          .from('showtimes')
          .select('id')
          .lt('showtime', now)

        if (oldShowtimes && oldShowtimes.length > 0) {
          await supabase.from('showtimes').delete().lt('showtime', now)
          console.log(`✅ ${oldShowtimes.length} horarios pasados eliminados`)
          window.location.reload()
        }
      } catch (err) {
        console.warn('⚠️ Error al limpiar horarios:', err)
      } finally {
        setCleaning(false)
      }
    }
    cleanOldShowtimes()
  }, [])

  const now = new Date()
  const futureShowtimes = showtimes.filter(st => new Date(st.showtime) > now)

  const filteredShowtimes = futureShowtimes.filter(st => {
    if (filterMovie !== 'all' && st.movie_id !== filterMovie) return false
    if (filterRoom !== 'all' && st.room_id !== filterRoom) return false
    if (filterAudio !== 'all' && st.audio_type !== filterAudio) return false
    if (filterDate) {
      const date = new Date(st.showtime).toLocaleDateString('en-CA', { timeZone: TIMEZONE })
      if (date !== filterDate) return false
    }
    return true
  })

  filteredShowtimes.sort((a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime())

  const groupedByDate = filteredShowtimes.reduce((acc, st) => {
    const date = new Date(st.showtime).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: TIMEZONE
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(st)
    return acc
  }, {} as Record<string, Showtime[]>)

  const handleAddShowtime = async () => {
    if (!newShowtime.movie_id || !newShowtime.room_id || !newShowtime.date || !newShowtime.time) {
      alert('Completá todos los campos')
      return
    }

    setSaving(true)
    try {
      const dateTimeStr = `${newShowtime.date}T${newShowtime.time}:00`
      const localDate = new Date(dateTimeStr + '-03:00')
      
      const { error } = await supabase
        .from('showtimes')
        .insert({
          movie_id: newShowtime.movie_id,
          room_id: newShowtime.room_id,
          showtime: localDate.toISOString(),
          price: newShowtime.price,
          available_seats: 50,
          audio_type: newShowtime.audio_type
        })

      if (error) throw error

      setNewShowtime({ movie_id: '', room_id: '', date: '', time: '', price: 5000, audio_type: 'Español Latino' })
      setShowAddForm(false)
      window.location.reload()
    } catch (err: any) {
      alert(err?.message || 'Error al crear horario')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteShowtime = async (id: string) => {
    if (!confirm('¿Eliminar este horario?')) return

    setDeletingId(id)
    const { error } = await supabase
      .from('showtimes')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      setDeletingId(null)
      return
    }

    window.location.reload()
  }

  if (cleaning) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500 mb-4" />
        <p className="text-gray-400 text-sm">Limpiando horarios pasados...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-white">Horarios</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Horario
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
          <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Película</label>
          <select value={filterMovie} onChange={(e) => setFilterMovie(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2">
            <option value="all">Todas</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Sala</label>
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2">
            <option value="all">Todas</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Idioma</label>
          <select value={filterAudio} onChange={(e) => setFilterAudio(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2">
            <option value="all">Todos</option>
            <option value="Español Latino">Español Latino</option>
            <option value="Subtitulada">Subtitulada</option>
            <option value="Castellano">Castellano</option>
          </select>
        </div>
      </div>

      {/* Formulario */}
      {showAddForm && (
        <Card className="bg-gray-900/50 border-gray-800 p-5 mb-6">
          <h3 className="text-white font-heading font-semibold mb-4">Nuevo Horario</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Película</label>
              <select value={newShowtime.movie_id} onChange={(e) => setNewShowtime(prev => ({ ...prev, movie_id: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2">
                <option value="">Seleccionar</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sala</label>
              <select value={newShowtime.room_id} onChange={(e) => setNewShowtime(prev => ({ ...prev, room_id: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2">
                <option value="">Seleccionar</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
              <Input type="date" value={newShowtime.date} onChange={(e) => setNewShowtime(prev => ({ ...prev, date: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Hora</label>
              <Input type="time" value={newShowtime.time} onChange={(e) => setNewShowtime(prev => ({ ...prev, time: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Idioma</label>
              <select value={newShowtime.audio_type} onChange={(e) => setNewShowtime(prev => ({ ...prev, audio_type: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2">
                <option value="Español Latino">Español Latino</option>
                <option value="Subtitulada">Subtitulada</option>
                <option value="Castellano">Castellano</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Precio</label>
              <Input type="number" value={newShowtime.price} onChange={(e) => setNewShowtime(prev => ({ ...prev, price: Number(e.target.value) }))} className="bg-gray-900 border-gray-700 text-white w-32" />
            </div>
            <Button onClick={handleAddShowtime} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white mt-5">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creando...</> : 'Crear Horario'}
            </Button>
          </div>
        </Card>
      )}

      {/* Lista */}
      {Object.keys(groupedByDate).length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
          <Clock className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No hay horarios futuros para los filtros seleccionados</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, showtimesList]: [string, Showtime[]]) => (
            <div key={date}>
              <h3 className="text-lg font-heading font-semibold text-white mb-3 capitalize flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" />
                {date}
                <Badge className="bg-gray-800 text-gray-400">{showtimesList.length}</Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {showtimesList.map((st: Showtime) => (
                  <ShowtimeCard
                    key={st.id}
                    id={st.id}
                    movieTitle={st.movie?.title || 'Sin título'}
                    posterUrl={st.movie?.poster_url}
                    time={st.showtime}
                    roomName={st.room?.name || 'Sin sala'}
                    price={st.price}
                    availableSeats={st.available_seats}
                    audioType={st.audio_type || 'Español Latino'}
                    onDelete={handleDeleteShowtime}
                    isDeleting={deletingId === st.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}