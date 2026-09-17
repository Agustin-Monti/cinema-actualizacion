import { MovieCard } from '@/components/movies/MovieCard'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import type { Movie } from '@/types'

interface ComingSoonSectionProps {
  movies: Movie[]
}

export function ComingSoonSection({ movies }: ComingSoonSectionProps) {
  if (movies.length === 0) return null

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-3">
          <Calendar className="h-4 w-4 text-yellow-500" />
          <span className="text-yellow-400 text-xs font-medium">Próximamente</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-heading font-bold text-white mb-2">
          Próximos Estrenos
        </h2>
        <p className="text-gray-400 text-sm">
          Las películas que llegan pronto a CinemaConcep
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {movies.map((movie) => (
          <div key={movie.id} className="relative group cursor-pointer">
            {/* Overlay de fecha de estreno */}
            <div className="absolute inset-0 z-10 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-heading font-bold text-lg">
                  {new Date(movie.release_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  )
}