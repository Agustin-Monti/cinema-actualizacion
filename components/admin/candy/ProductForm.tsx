'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/movies/ImageUpload'

interface ProductFormProps {
  product?: any
  isEdit?: boolean
}

export function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    image_url: product?.image_url || '',
    category: product?.category || 'vaso',
    movie_related: product?.movie_related || '',
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? true
  })

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        isEdit ? '/api/admin/candy/update-product' : '/api/admin/candy/create-product',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEdit ? { ...form, productId: product.id } : form)
        }
      )
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      router.push('/admin/candy')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const productId = product?.id || 'nuevo'

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/candy">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-heading font-bold text-white">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Guardar
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-2.5 mb-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Imagen */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <h3 className="text-white font-heading font-semibold text-sm mb-2">Imagen del producto</h3>
          <ImageUpload
            label="Imagen"
            bucket="combos"
            folder={productId}
            value={form.image_url}
            onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
            aspect="square"
          />
        </Card>

        {/* Nombre y precio */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Nombre</label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white text-sm h-9" 
                placeholder="Ej: Vaso Spider-Man"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Precio</label>
              <Input 
                type="number" 
                value={form.price} 
                onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="bg-gray-900 border-gray-700 text-white text-sm h-9" 
              />
            </div>
          </div>
        </Card>

        {/* Descripción con más espacio */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Descripción</label>
          <textarea 
            value={form.description} 
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none focus:border-red-500 focus:outline-none leading-relaxed" 
            placeholder="Describe el producto con más detalle..."
          />
        </Card>

        {/* Categoría, película y stock */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Categoría</label>
              <select 
                value={form.category} 
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-sm h-9"
              >
                <option value="vaso">Vaso</option>
                <option value="pochoclera">Pochoclera</option>
                <option value="peluche">Peluche</option>
                <option value="figura">Figura</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Película</label>
              <Input 
                value={form.movie_related} 
                onChange={(e) => setForm(prev => ({ ...prev, movie_related: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white text-sm h-9" 
                placeholder="Ej: Spider-Man"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Stock</label>
              <Input 
                type="number" 
                value={form.stock} 
                onChange={(e) => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                className="bg-gray-900 border-gray-700 text-white text-sm h-9" 
              />
            </div>
          </div>
        </Card>

        {/* Activo */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.is_active} 
              onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="accent-red-600 w-4 h-4"
            />
            <span className="text-sm">Producto activo</span>
          </label>
        </Card>
      </div>
    </div>
  )
}