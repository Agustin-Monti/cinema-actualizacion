import { getMovieById, getShowtimesByMovie } from '@/lib/supabase/services'
import { Badge } from '@/components/ui/badge'
import { Clock, Star, Calendar, Film, Ticket } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { formatDuration } from '@/lib/utils'
import { ShowtimeSelector } from '@/components/movies/ShowtimeSelector'
import { TrailerButton } from '@/components/movies/TrailerButton'

export const dynamic = 'force-dynamic'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const movie = await getMovieById(id)
  
  if (!movie) {
    notFound()
  }
  
  const showtimes = await getShowtimesByMovie(id)

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden">
        <Image
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          fill
          className="object-cover opacity-30"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          <div className="md:col-span-2 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-red-600 text-white px-3 py-1">
                {movie.classification}
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                {movie.rating}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                {formatDuration(movie.duration)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-5 w-5" />
                Estreno: {new Date(movie.release_date).toLocaleDateString('es-AR', { timeZone: TIMEZONE })}
              </span>
              <span className="flex items-center gap-1">
                <Film className="h-5 w-5" />
                {movie.language}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre.map((genre) => (
                <Badge key={genre} variant="outline" className="border-gray-700 text-gray-300">
                  {genre}
                </Badge>
              ))}
            </div>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {movie.synopsis}
            </p>

            <div className="mb-6">
              <h3 className="text-white font-heading font-semibold mb-2">Director</h3>
              <p className="text-gray-400">{movie.director}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-white font-heading font-semibold mb-2">Elenco</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.movie_cast.map((actor: string) => (
                  <Badge key={actor} className="bg-gray-800 text-gray-300 hover:bg-gray-700">
                    {actor}
                  </Badge>
                ))}
              </div>
              
              {movie.trailer_url && (
                <TrailerButton trailerUrl={movie.trailer_url} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
            <Ticket className="h-8 w-8 text-red-500" />
            Horarios Disponibles
          </h2>

          <ShowtimeSelector showtimes={showtimes} />
        </div>
      </div>
    </div>
  )
}