'use client'

import { Search } from 'lucide-react'

interface CandyFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
}

const categoryLabels: Record<string, string> = {
  all: 'Todos', vaso: 'Vasos', pochoclera: 'Pochocleras',
  peluche: 'Peluches', figura: 'Figuras', otro: 'Otros'
}

export function CandyFilters({ search, onSearchChange, category, onCategoryChange, categories }: CandyFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Búsqueda */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar..."
          className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:border-red-500 focus:outline-none"
        />
      </div>

      {/* Categorías */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat
                ? 'bg-red-600 text-white'
                : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>
    </div>
  )
}