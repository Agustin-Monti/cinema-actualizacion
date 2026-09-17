import { getMovies, getMoviesPaginated, getComingSoonMovies } from '@/lib/supabase/services'
import { MovieCard, MovieCardSkeleton } from '@/components/movies/MovieCard'
import { ComingSoonSection } from '@/components/movies/ComingSoonSection'
import { Suspense } from 'react'
import { Film } from 'lucide-react'

export const dynamic = 'force-dynamic'

function MoviesGrid() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {[...Array(4)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    }>
      <MoviesContent />
    </Suspense>
  )
}

async function MoviesContent() {
  const movies = await getMovies()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

async function ComingSoonContent() {
  const comingSoon = await getComingSoonMovies()
  if (comingSoon.length === 0) return null
  return <ComingSoonSection movies={comingSoon} />
}

// ============================================
// COMPONENTE CON PAGINACIÓN
// ============================================
import { PaginatedMovies } from '@/components/movies/PaginatedMovies'

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-full px-6 py-2 mb-6">
            <Film className="h-5 w-5 text-red-500" />
            <span className="text-red-400 font-medium">Cartelera</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
            Películas en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">Cartelera</span>
          </h1>
        </div>

        {/* Películas con paginación */}
        <PaginatedMovies />

        {/* Próximos Estrenos */}
        <Suspense fallback={null}>
          <ComingSoonContent />
        </Suspense>
      </div>
    </div>
  )
}