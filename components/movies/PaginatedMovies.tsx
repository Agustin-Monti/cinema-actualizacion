'use client'

import { useState, useEffect, useRef } from 'react'
import { getMoviesPaginated } from '@/lib/supabase/services'
import { MovieCard, MovieCardSkeleton } from '@/components/movies/MovieCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types'

export function PaginatedMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)
  
  const pageSize = 8

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true)
      const { movies: data, total } = await getMoviesPaginated(page, pageSize)
      setMovies(data)
      setTotal(total)
      setLoading(false)
    }
    loadMovies()
  }, [page])

  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    // Scroll al inicio del grid, no al final de la página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div ref={gridRef}>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[...Array(pageSize)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div key={page} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={cn(
                'w-8 h-8 md:w-10 md:h-10 rounded-lg text-sm font-medium transition-all',
                p === page
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              {p}
            </button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-center text-gray-500 text-sm mt-4">
        Página {page} de {totalPages} · {total} películas
      </p>
    </div>
  )
}