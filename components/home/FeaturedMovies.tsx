'use client'

import { useState } from 'react'
import { MovieCard } from '@/components/movies/MovieCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Film, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types'

interface FeaturedMoviesProps {
  movies: Movie[]
}

export function FeaturedMovies({ movies }: FeaturedMoviesProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const itemsPerPage = 6 // 2 filas de 3 en desktop, 3 filas de 2 en mobile

  if (movies.length === 0) return null

  // Obtener géneros e idiomas únicos
  const allGenres = [...new Set(movies.flatMap(m => m.genre))].sort()
  const allLanguages = [...new Set(movies.map(m => m.language))].filter(Boolean).sort()

  // Filtrar películas
  const filteredMovies = movies.filter(m => {
    if (selectedGenre && !m.genre.includes(selectedGenre)) return false
    if (selectedLanguage && m.language !== selectedLanguage) return false
    return true
  })

  // Paginación
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage)
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const clearFilters = () => {
    setSelectedGenre(null)
    setSelectedLanguage(null)
    setCurrentPage(1)
  }

  const hasFilters = selectedGenre || selectedLanguage

  return (
    <section className="bg-black py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 md:px-4 py-1 md:py-1.5 mb-3 md:mb-4">
            <Film className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
            <span className="text-red-400 text-[10px] md:text-xs font-medium">Cartelera</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-heading font-bold text-white mb-2 md:mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
              Películas
            </span>
          </h2>
          <p className="text-gray-400 text-xs md:text-base max-w-lg mx-auto">
            {filteredMovies.length} película{filteredMovies.length !== 1 ? 's' : ''} disponible{filteredMovies.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-8">
          <SlidersHorizontal className="h-4 w-4 text-gray-500 hidden sm:block" />
          
          {/* Filtro por género */}
          <select
            value={selectedGenre || ''}
            onChange={(e) => {
              setSelectedGenre(e.target.value || null)
              setCurrentPage(1)
            }}
            className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-xs md:text-sm focus:border-red-500 focus:outline-none"
          >
            <option value="">Todos los géneros</option>
            {allGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          {/* Filtro por idioma */}
          <select
            value={selectedLanguage || ''}
            onChange={(e) => {
              setSelectedLanguage(e.target.value || null)
              setCurrentPage(1)
            }}
            className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 text-xs md:text-sm focus:border-red-500 focus:outline-none"
          >
            <option value="">Todos los idiomas</option>
            {allLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          {/* Limpiar filtros */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs md:text-sm transition-colors"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>

        {/* Grid: 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-8">
          {paginatedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Sin resultados */}
        {paginatedMovies.length === 0 && (
          <div className="text-center py-12">
            <Film className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron películas con esos filtros</p>
            <button onClick={clearFilters} className="text-red-500 hover:text-red-400 text-sm mt-2">
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
            >
              Anterior
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                  page === currentPage
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                {page}
              </button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Ver Cartelera Completa */}
        <div className="text-center">
          <Link href="/movies">
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-5 md:px-8 py-4 md:py-6 text-xs md:text-base font-heading font-semibold group">
              Ver Cartelera Completa
              <ArrowRight className="h-3 w-3 md:h-5 md:w-5 ml-1.5 md:ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}