'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Movie } from '@/types'

interface HeroSectionProps {
  movies: Movie[]
}

export function HeroSection({ movies = [] }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const safeMovies = movies || []
  const promoMovies = safeMovies.filter(m => m.promo_desktop_url || m.promo_mobile_url)
  const sliderMovies = promoMovies.length > 0 ? promoMovies : safeMovies

  useEffect(() => {
    if (sliderMovies.length <= 1) return
    const interval = setInterval(() => handleNext(), 5000)
    return () => clearInterval(interval)
  }, [current, sliderMovies.length])

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(prev => (prev === 0 ? sliderMovies.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 700)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(prev => (prev === sliderMovies.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 700)
  }

  if (sliderMovies.length === 0) return null

  const movie = sliderMovies[current]

  return (
    <section className="relative w-full bg-black">
      {/* Contenedor principal */}
      <div className="relative max-w-[100rem] mx-auto">
        
        {/* Slider - Desktop: con padding lateral, Mobile: full width */}
        <div className="relative w-full aspect-[1.44/1] md:aspect-[2.88/1] md:rounded-3xl overflow-hidden md:mt-24 md:mx-2">
          
          {/* Imágenes */}
          {sliderMovies.map((m, index) => (
            <Link
              key={m.id}
              href={`/movies/${m.id}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-700',
                index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              )}
            >
              {/* Desktop */}
              <div className="hidden md:block absolute inset-0">
                <Image
                  src={m.promo_desktop_url || m.backdrop_url || m.poster_url}
                  alt={m.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  unoptimized
                />
              </div>

              {/* Mobile */}
              <div className="block md:hidden absolute inset-0">
                <Image
                  src={m.promo_mobile_url || m.poster_url}
                  alt={m.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  unoptimized
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Navegación */}
        {sliderMovies.length > 1 && (
          <>
            {/* Flechas */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-20"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-20"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {sliderMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === current 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/70 w-1.5'
                  )}
                />
              ))}
            </div>

            {/* Contador */}
            <div className="absolute bottom-4 right-4 md:right-8 text-white/70 text-sm font-mono z-20">
              {current + 1} / {sliderMovies.length}
            </div>
          </>
        )}
      </div>
    </section>
  )
}