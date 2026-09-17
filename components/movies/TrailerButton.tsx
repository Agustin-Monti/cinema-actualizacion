'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Film, X } from 'lucide-react'

interface TrailerButtonProps {
  trailerUrl: string
}

export function TrailerButton({ trailerUrl }: TrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Convertir URL de YouTube a URL de embed
  const getEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0]
    if (!videoId) return url
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  }

  return (
    <>
      <Button 
        className="bg-red-600 hover:bg-red-700 text-white gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Play className="h-5 w-5 fill-white" />
        Ver Trailer
        <Film className="h-5 w-5" />
      </Button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-red-500 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Video */}
            <iframe
              src={getEmbedUrl(trailerUrl)}
              className="w-full h-full rounded-xl"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Trailer"
            />
          </div>
        </div>
      )}
    </>
  )
}