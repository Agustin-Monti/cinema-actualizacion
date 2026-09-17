'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, ChevronLeft, ChevronRight, Coffee, Popcorn } from 'lucide-react'
import { CandyCard } from './CandyCard'
import { ComboCard } from './ComboCard'
import { CandyFilters } from './CandyFilters'
import { cn } from '@/lib/utils'

interface CandyManagerProps {
  products: any[]
  combos: any[]
}

const PRODUCTS_PER_PAGE = 5
const COMBOS_PER_PAGE = 5

export function CandyManager({ products, combos }: CandyManagerProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [productPage, setProductPage] = useState(1)
  const [comboPage, setComboPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
  }

  // Filtrar productos
  const filteredProducts = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'all' && p.category !== category) return false
    return true
  })

  // Filtrar combos
  const filteredCombos = combos.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Paginación productos
  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE
  )

  // Paginación combos
  const totalComboPages = Math.ceil(filteredCombos.length / COMBOS_PER_PAGE)
  const paginatedCombos = filteredCombos.slice(
    (comboPage - 1) * COMBOS_PER_PAGE,
    comboPage * COMBOS_PER_PAGE
  )

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    setDeletingId(id)
    const response = await fetch('/api/admin/candy/delete-product', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id })
    })
    const data = await response.json()
    if (data.error) { alert(data.error); setDeletingId(null); return }
    window.location.reload()
  }

  const handleDeleteCombo = async (id: string) => {
    if (!confirm('¿Eliminar este combo?')) return
    setDeletingId(id)
    const response = await fetch('/api/admin/candy/delete-combo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comboId: id })
    })
    const data = await response.json()
    if (data.error) { alert(data.error); setDeletingId(null); return }
    window.location.reload()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">Candy Bar</h1>
        <div className="flex gap-2">
          <Link href="/admin/candy/product/new">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Producto
            </Button>
          </Link>
          <Link href="/admin/candy/combo/new">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Combo
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setActiveTab('products'); setComboPage(1) }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeTab === 'products' ? 'bg-red-600 text-white' : 'bg-gray-900/50 text-gray-400 border border-gray-800'
          )}
        >
          <Coffee className="h-4 w-4" />
          Productos ({products.length})
        </button>
        <button
          onClick={() => { setActiveTab('combos'); setProductPage(1) }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            activeTab === 'combos' ? 'bg-orange-600 text-white' : 'bg-gray-900/50 text-gray-400 border border-gray-800'
          )}
        >
          <Popcorn className="h-4 w-4" />
          Combos ({combos.length})
        </button>
      </div>

      {/* Productos */}
      {activeTab === 'products' && (
        <>
          <CandyFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setProductPage(1) }}
            category={category}
            onCategoryChange={(v) => { setCategory(v); setProductPage(1) }}
            categories={['all', 'vaso', 'pochoclera', 'peluche', 'figura', 'otro']}
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {paginatedProducts.map((product: any) => (
              <CandyCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
                isDeleting={deletingId === product.id}
              />
            ))}
          </div>

          {totalProductPages > 1 && (
            <Pagination page={productPage} totalPages={totalProductPages} onPageChange={setProductPage} />
          )}
        </>
      )}

      {/* Combos */}
      {activeTab === 'combos' && (
        <>
          <CandyFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setComboPage(1) }}
            category="all"
            onCategoryChange={() => {}}
            categories={['all']}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {paginatedCombos.map((combo: any) => (
              <ComboCard
                key={combo.id}
                combo={combo}
                onDelete={handleDeleteCombo}
                isDeleting={deletingId === combo.id}
              />
            ))}
          </div>

          {totalComboPages > 1 && (
            <Pagination page={comboPage} totalPages={totalComboPages} onPageChange={setComboPage} />
          )}
        </>
      )}
    </div>
  )
}

// Componente de paginación reutilizable
function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="border-gray-700 text-gray-400 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            'w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs font-medium transition-all',
            p === page ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          {p}
        </button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="border-gray-700 text-gray-400 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}