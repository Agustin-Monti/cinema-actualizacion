'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/movies/ImageUpload'

interface ComboFormProps {
  combo?: any
  isEdit?: boolean
}

export function ComboForm({ combo, isEdit = false }: ComboFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: combo?.name || '',
    description: combo?.description || '',
    price: combo?.price || 0,
    image_url: combo?.image_url || '',
    is_active: combo?.is_active ?? true,
    items: combo?.items?.length ? combo.items : [{ item_name: '', quantity: 1 }]
  })

  const handleAddItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { item_name: '', quantity: 1 }] }))
  }

  const handleRemoveItem = (index: number) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_: any, i: number) => i !== index) }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(
        isEdit ? '/api/admin/candy/update-combo' : '/api/admin/candy/create-combo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEdit ? { ...form, comboId: combo.id } : form)
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

  const comboId = combo?.id || 'nuevo'

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/candy">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-heading font-bold text-white">
            {isEdit ? 'Editar Combo' : 'Nuevo Combo'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
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
        {/* Imagen + info */}
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <Card className="bg-gray-900/50 border-gray-800 p-2">
            <ImageUpload
              label="Imagen"
              bucket="combos"
              folder={comboId}
              value={form.image_url}
              onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
              aspect="square"
            />
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-3 space-y-2.5">
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Nombre</label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white text-sm h-9" 
                placeholder="Ej: Combo Individual"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Precio</label>
              <Input 
                type="number" 
                value={form.price} 
                onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="bg-gray-900 border-gray-700 text-white text-sm h-9" 
              />
            </div>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.is_active} 
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="accent-orange-600 w-4 h-4"
              />
              <span className="text-sm">Combo activo</span>
            </label>
          </Card>
        </div>

        {/* Descripción */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <label className="text-[10px] text-gray-500 mb-0.5 block uppercase tracking-wide">Descripción</label>
          <textarea 
            value={form.description} 
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-sm resize-none focus:border-red-500 focus:outline-none" 
            placeholder="Describe el combo"
          />
        </Card>

        {/* Items */}
        <Card className="bg-gray-900/50 border-gray-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-heading font-semibold text-xs">Items del combo</h3>
            <Button size="sm" variant="outline" onClick={handleAddItem} className="h-7 border-gray-700 text-gray-400 hover:text-white text-xs">
              <Plus className="h-3 w-3 mr-0.5" />
              Agregar
            </Button>
          </div>

          <div className="space-y-1.5">
            {form.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-1.5">
                <Input 
                  value={item.item_name} 
                  onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white text-sm h-8 flex-1" 
                  placeholder="Ej: Pochoclos Medianos"
                />
                <Input 
                  type="number" 
                  value={item.quantity} 
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  className="bg-gray-900 border-gray-700 text-white text-sm h-8 w-14 text-center" 
                  min={1}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-gray-400 hover:text-red-400"
                  onClick={() => handleRemoveItem(index)}
                  disabled={form.items.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}