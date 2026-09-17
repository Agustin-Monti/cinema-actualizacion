'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2, Popcorn } from 'lucide-react'

interface ComboCardProps {
  combo: any
  onDelete: (id: string) => void
  isDeleting: boolean
}

export function ComboCard({ combo, onDelete, isDeleting }: ComboCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
      <div className="flex items-stretch">
        <div className="w-16 md:w-20 flex-shrink-0 bg-gray-800 relative">
          {combo.image_url ? (
            <Image
              src={combo.image_url}
              alt={combo.name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Popcorn className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 p-2.5">
          <h3 className="text-white font-heading font-semibold text-xs truncate">{combo.name}</h3>
          <p className="text-gray-500 text-[10px] line-clamp-1 mt-0.5">{combo.description}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-red-500 font-bold text-xs">${combo.price?.toLocaleString('es-AR')}</span>
            <div className="flex gap-0.5">
              <Link href={`/admin/candy/combo/${combo.id}`}>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                  <Edit className="h-3 w-3" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-red-400"
                onClick={() => onDelete(combo.id)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}