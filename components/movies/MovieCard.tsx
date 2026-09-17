'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Star, Calendar, Play, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDuration } from '@/lib/utils'
import type { Movie } from '@/types'
import { useState } from 'react'

interface MovieCardProps {
  movie: Movie
  variant?: 'default' | 'featured' | 'compact'
  className?: string
  priority?: boolean
}

export function MovieCard({ movie, variant = 'default', className, priority = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (variant === 'featured') {
    return (
      <Link href={`/movies/${movie.id}`}>
        <div
          className={cn(
            'group relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-red-500/50 transition-all duration-500',
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <Image
              src={movie.backdrop_url || movie.poster_url}
              alt={movie.title}
              fill
              className={cn(
                'object-cover transition-transform duration-700',
                isHovered && 'scale-110'
              )}
              sizes="100vw"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            
            <div className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Play className="h-6 w-6 md:h-8 md:w-8 text-white ml-0.5" />
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-1 md:mb-2 line-clamp-1">
              {movie.title}
            </h3>
            <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">
              {movie.synopsis}
            </p>

            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
              <span className="flex items-center gap-1 md:gap-1.5">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500" />
                {formatDuration(movie.duration)}
              </span>
              <span className="flex items-center gap-1 md:gap-1.5">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500" />
                {formatDate(movie.release_date)}
              </span>
              <span className="flex items-center gap-1 md:gap-1.5">
                <Star className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-500 fill-yellow-500" />
                {movie.rating}
              </span>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              {movie.genre.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="outline" className="border-gray-700 text-gray-400 text-[10px] md:text-xs px-1.5 md:px-2">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/movies/${movie.id}`}>
        <div className={cn(
          'group flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300',
          className
        )}>
          <div className="relative w-16 h-22 md:w-20 md:h-28 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={movie.poster_url}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-white text-sm md:text-base group-hover:text-red-500 transition-colors line-clamp-1">
              {movie.title}
            </h4>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mt-1">
              <Clock className="h-3 w-3" />
              {formatDuration(movie.duration)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] md:text-xs text-gray-400">{movie.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/movies/${movie.id}`}>
      <div
        className={cn(
          'group relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            className={cn(
              'object-cover transition-transform duration-700',
              isHovered && 'scale-110'
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
          
          {/* Rating - más chico en mobile */}
          <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-black/80 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 md:gap-1.5 border border-white/10">
            <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-white font-semibold text-xs md:text-sm">{movie.rating}</span>
          </div>

          {/* Classification */}
          <Badge className="absolute top-2 md:top-3 left-2 md:left-3 bg-red-600/90 backdrop-blur-sm border-0 text-[10px] md:text-xs px-1.5 md:px-2">
            {movie.classification}
          </Badge>

          {/* Hover button - solo en desktop */}
          <div className={cn(
            'absolute inset-x-4 bottom-4 transition-all duration-300 hidden md:block',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <Ticket className="h-4 w-4 mr-2" />
              Comprar Boletos
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 md:p-4">
          <h3 className="font-heading font-bold text-white text-sm md:text-lg mb-1 md:mb-2 group-hover:text-red-500 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm text-gray-400">
            <span className="flex items-center gap-1 md:gap-1.5">
              <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
              {formatDuration(movie.duration)}
            </span>
            <span className="flex items-center gap-1 md:gap-1.5">
              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
              {formatDate(movie.release_date)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 md:gap-1.5 mt-1.5 md:mt-3">
            {movie.genre.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="outline" className="border-gray-700 text-gray-500 text-[10px] md:text-xs px-1.5 md:px-2">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-2.5 md:p-4 space-y-2 md:space-y-3">
        <div className="h-4 md:h-5 bg-gray-800 rounded w-3/4" />
        <div className="h-3 md:h-4 bg-gray-800 rounded w-1/2" />
        <div className="flex gap-1.5 md:gap-2">
          <div className="h-4 md:h-5 bg-gray-800 rounded w-14 md:w-16" />
          <div className="h-4 md:h-5 bg-gray-800 rounded w-14 md:w-16" />
        </div>
      </div>
    </div>
  )
}