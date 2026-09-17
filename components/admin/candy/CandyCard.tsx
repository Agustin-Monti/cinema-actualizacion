'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2, Coffee } from 'lucide-react'

interface CandyCardProps {
  product: any
  onDelete: (id: string) => void
  isDeleting: boolean
}

const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    vaso: 'Vaso', pochoclera: 'Pochoclera', peluche: 'Peluche',
    figura: 'Figura', otro: 'Otro'
  }
  return labels[cat] || cat
}

export function CandyCard({ product, onDelete, isDeleting }: CandyCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors group">
      <div className="relative aspect-square overflow-hidden bg-gray-800/50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coffee className="h-10 w-10 text-gray-600" />
          </div>
        )}
        <Badge className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-[10px] px-1.5">
          {getCategoryLabel(product.category)}
        </Badge>
      </div>
      
      <div className="p-2.5">
        <h3 className="text-white font-heading font-semibold text-xs truncate">{product.name}</h3>
        <p className="text-gray-500 text-[10px] line-clamp-1 mt-0.5">{product.movie_related || product.description}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-red-500 font-bold text-xs">${product.price?.toLocaleString('es-AR')}</span>
          <div className="flex gap-0.5">
            <Link href={`/admin/candy/product/${product.id}`}>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                <Edit className="h-3 w-3" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-400 hover:text-red-400"
              onClick={() => onDelete(product.id)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}