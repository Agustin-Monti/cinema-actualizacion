'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popcorn, Coffee, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const categories = ['todos', 'combo', 'vaso', 'pochoclera', 'peluche', 'figura', 'otro']

const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    todos: 'Todos', combo: 'Combos', vaso: 'Vasos',
    pochoclera: 'Pochocleras', peluche: 'Peluches',
    figura: 'Figuras', otro: 'Otros'
  }
  return labels[cat] || cat
}

const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    combo: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    vaso: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    pochoclera: 'bg-red-500/10 text-red-400 border-red-500/30',
    peluche: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    figura: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    otro: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
  return colors[cat] || ''
}

interface CandyContentProps {
  products: any[]
  combos: any[]
}

export default function CandyContent({ products = [], combos = [] }: CandyContentProps) {
  const [activeTab, setActiveTab] = useState('todos')

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <Coffee className="h-4 w-4 text-red-500" />
            <span className="text-red-400 text-xs font-medium">Candy Bar</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-3">
            Candy Bar & Combos
          </h1>
          <p className="text-gray-400">
            Combos, vasos, pochocleras y coleccionables de tus películas favoritas
          </p>
        </div>

        {/* Slider de categorías */}
        <div className="relative mb-8">
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none md:hidden" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:justify-center md:mx-0 md:px-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat)
                  const el = document.getElementById(`tab-${cat}`)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                }}
                id={`tab-${cat}`}
                className={cn(
                  'flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === cat
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                )}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {/* COMBOS */}
          {(activeTab === 'todos' || activeTab === 'combo') && combos.map((combo: any) => (
            <Card key={`combo-${combo.id}`} className="bg-gray-900/50 border-gray-800 overflow-hidden hover:border-red-500/30 transition-colors group">
              <div className="relative aspect-[3/4] md:aspect-square overflow-hidden bg-white/5">
                {combo.image_url ? (
                  <Image src={combo.image_url} alt={combo.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 33vw" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full"><Popcorn className="h-12 w-12 md:h-16 md:w-16 text-gray-700" /></div>
                )}
                <Badge className="absolute top-1.5 left-1.5 bg-orange-500/80 backdrop-blur-sm text-[10px] md:text-xs px-1.5">Combo</Badge>
              </div>
              <div className="p-2.5 md:p-4">
                <h3 className="text-white font-heading font-semibold text-xs md:text-base mb-0.5 md:mb-1 line-clamp-1">{combo.name}</h3>
                <p className="text-gray-500 text-[10px] md:text-xs mb-1.5 md:mb-2 line-clamp-2 leading-tight">{combo.description}</p>
                <span className="text-red-500 font-bold text-xs md:text-base">${combo.price?.toLocaleString('es-AR')}</span>
              </div>
            </Card>
          ))}

          {/* PRODUCTOS */}
          {(activeTab === 'todos' || activeTab !== 'combo') && products
            .filter(p => activeTab === 'todos' || p.category === activeTab)
            .map((product) => (
              <Card key={product.id} className="bg-gray-900/50 border-gray-800 overflow-hidden hover:border-red-500/30 transition-colors group">
                <div className="relative aspect-[3/4] md:aspect-square overflow-hidden">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 33vw" unoptimized />
                  {product.movie_related && (
                    <Badge className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-[10px] md:text-xs px-1.5">{product.movie_related}</Badge>
                  )}
                </div>
                <div className="p-2.5 md:p-4">
                  <h3 className="text-white font-heading font-semibold text-xs md:text-base mb-0.5 md:mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-[10px] md:text-xs mb-1.5 md:mb-2 line-clamp-2 leading-tight">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-red-500 font-bold text-xs md:text-base">${product.price?.toLocaleString('es-AR')}</span>
                    <Badge className={cn(getCategoryColor(product.category), 'text-[10px] md:text-xs px-1.5')}>{getCategoryLabel(product.category)}</Badge>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {(combos.length === 0 && products.length === 0) && (
          <Card className="bg-gray-900/50 border-gray-800 p-12 text-center mt-8">
            <ShoppingBag className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No hay productos disponibles</p>
          </Card>
        )}
      </div>
    </div>
  )
}