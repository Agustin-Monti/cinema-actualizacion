'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Film, Plus, Search, Star, Calendar, Clock, 
  Edit, Trash2, Eye, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MoviesTableProps {
  movies: any[]
}

export function MoviesTable({ movies }: MoviesTableProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filtrar por búsqueda
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(search.toLowerCase()) ||
    movie.genre?.some((g: string) => g.toLowerCase().includes(search.toLowerCase()))
  )

  // Ordenar
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (!sortBy) return 0
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
    return aVal < bVal ? 1 : -1
  })

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const handleDelete = async (movieId: string) => {
    setDeleting(true)
    try {
      const response = await fetch('/api/admin/movies/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      window.location.reload()
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar')
      setDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const getStatusBadge = (movie: any) => {
    if (movie.is_active) {
      return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Activa</Badge>
    }
    if (movie.is_coming_soon) {
      return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Próximo</Badge>
    }
    return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">Inactiva</Badge>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-heading font-bold text-white">Películas</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar película..."
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
            />
          </div>
          
          <Link href="/admin/movies/new">
            <Button className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
        {/* Header de tabla */}
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_100px_120px_100px] gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/80">
          <span className="text-xs font-medium text-gray-500 uppercase">Poster</span>
          <button onClick={() => handleSort('title')} className="text-xs font-medium text-gray-500 uppercase text-left flex items-center gap-1 hover:text-white">
            Título
            {sortBy === 'title' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
          </button>
          <button onClick={() => handleSort('duration')} className="text-xs font-medium text-gray-500 uppercase text-left flex items-center gap-1 hover:text-white">
            Duración
            {sortBy === 'duration' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
          </button>
          <button onClick={() => handleSort('rating')} className="text-xs font-medium text-gray-500 uppercase text-left flex items-center gap-1 hover:text-white">
            Rating
            {sortBy === 'rating' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
          </button>
          <button onClick={() => handleSort('release_date')} className="text-xs font-medium text-gray-500 uppercase text-left flex items-center gap-1 hover:text-white">
            Estreno
            {sortBy === 'release_date' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
          </button>
          <span className="text-xs font-medium text-gray-500 uppercase">Estado</span>
          <span className="text-xs font-medium text-gray-500 uppercase text-right">Acciones</span>
        </div>

        {/* Filas */}
        <div className="divide-y divide-gray-800">
          {sortedMovies.length === 0 ? (
            <div className="py-12 text-center">
              <Film className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron películas</p>
            </div>
          ) : (
            sortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="group grid grid-cols-2 md:grid-cols-[60px_1fr_120px_100px_100px_120px_100px] gap-4 px-4 py-3 hover:bg-white/5 transition-colors items-center"
              >
                {/* Poster */}
                <div className="relative w-10 h-14 md:w-12 md:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  {movie.poster_url && (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  )}
                </div>

                {/* Título */}
                <div className="min-w-0">
                  <h3 className="text-white font-heading font-semibold text-sm truncate">{movie.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1 md:hidden">
                    {movie.genre?.slice(0, 2).map((g: string) => (
                      <span key={g} className="text-[10px] text-gray-500">{g}</span>
                    ))}
                  </div>
                </div>

                {/* Duración */}
                <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="h-3.5 w-3.5 text-gray-600" />
                  {movie.duration} min
                </div>

                {/* Rating */}
                <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  {movie.rating}
                </div>

                {/* Fecha estreno */}
                <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5 text-gray-600" />
                  {new Date(movie.release_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </div>

                {/* Estado mobile */}
                <div className="flex md:hidden justify-end">
                  {getStatusBadge(movie)}
                </div>

                {/* Estado desktop */}
                <div className="hidden md:block">
                  {getStatusBadge(movie)}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/movies/${movie.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5" title="Ver">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/movies/${movie.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10" 
                    title="Eliminar"
                    onClick={() => setDeleteConfirm(movie.id)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center">
          <p className="text-xs text-gray-500">{sortedMovies.length} películas</p>
        </div>
      </Card>

      {/* Modal de confirmación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full text-center">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-white mb-2">¿Eliminar esta película?</p>
            <p className="text-gray-500 text-sm mb-4">
              Se borrarán también sus imágenes del bucket y los registros relacionados.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => setDeleteConfirm(null)} 
                variant="outline" 
                className="border-gray-700 text-gray-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => handleDelete(deleteConfirm)} 
                disabled={deleting} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}