'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Loader2, Crown, Coffee, Popcorn, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/movies/ImageUpload'

interface PromotionFormProps {
  promotion?: any
  isEdit?: boolean
}

export function PromotionForm({ promotion, isEdit = false }: PromotionFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    image_url: promotion?.image_url || '',
    discount_type: promotion?.discount_type || '2x1',
    discount_value: promotion?.discount_value || '',
    valid_days: promotion?.valid_days?.join(', ') || '',
    bank_name: promotion?.bank_name || '',
    card_type: promotion?.card_type || 'all',
    start_date: promotion?.start_date || '',
    end_date: promotion?.end_date || '',
    is_active: promotion?.is_active ?? true,
    club_only: promotion?.club_only ?? false,
    cta_label: promotion?.cta_label || '',
    cta_url: promotion?.cta_url || ''
  })

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      valid_days: form.valid_days.split(',').map((d: string) => d.trim()).filter(Boolean),
    }

    try {
      const response = await fetch(
        isEdit ? `/api/admin/promotions/update` : `/api/admin/promotions/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEdit ? { ...payload, promotionId: promotion.id } : payload)
        }
      )

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      router.push('/admin/promotions')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const promotionId = promotion?.id || 'nueva'

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/promotions">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-white">
            {isEdit ? `Editar: ${promotion?.title}` : 'Nueva Promoción'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Imagen */}
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <h3 className="text-white font-heading font-semibold text-sm mb-3">Imagen de la promoción</h3>
          <ImageUpload
            label="Promoción"
            bucket="promotions"
            folder={promotionId}
            value={form.image_url}
            onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
            aspect="video"
          />
        </Card>

        {/* Información básica */}
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <h3 className="text-white font-heading font-semibold text-sm mb-3">Información</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título</label>
              <Input 
                value={form.title} 
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white" 
                placeholder="Ej: 2x1 en Entradas"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 resize-none focus:border-red-500 focus:outline-none" 
                placeholder="Describe la promoción"
              />
            </div>
          </div>
        </Card>

        {/* Tipo de promoción */}
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <h3 className="text-white font-heading font-semibold text-sm mb-3">Tipo de Promoción</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
              <select 
                value={form.discount_type} 
                onChange={(e) => setForm(prev => ({ ...prev, discount_type: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-red-500 focus:outline-none"
              >
                <option value="2x1">2x1 en Entradas</option>
                <option value="percentage">Descuento %</option>
                <option value="fixed">Precio fijo</option>
                <option value="bank_discount">Descuento bancario</option>
                <option value="club_membership">Unirse al Club Fan</option>
                <option value="candy_discount">Descuento Candy Bar</option>
                <option value="combo_discount">Descuento en Combos</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {(form.discount_type === '2x1' || form.discount_type === 'percentage' || 
              form.discount_type === 'fixed' || form.discount_type === 'candy_discount' || 
              form.discount_type === 'combo_discount') && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Valor</label>
                <Input 
                  value={form.discount_value} 
                  onChange={(e) => setForm(prev => ({ ...prev, discount_value: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white" 
                  placeholder="Ej: 2x1, 50%, $8000"
                />
              </div>
            )}

            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 block">Días válidos (separados por coma)</label>
              <Input 
                value={form.valid_days} 
                onChange={(e) => setForm(prev => ({ ...prev, valid_days: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white" 
                placeholder="Lunes, Miércoles"
              />
            </div>
          </div>
        </Card>

        {/* Campos bancarios */}
        {(form.discount_type === 'bank_discount') && (
          <Card className="bg-gray-900/50 border-gray-800 p-4">
            <h3 className="text-white font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-yellow-500" />
              Datos bancarios
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Banco</label>
                <Input 
                  value={form.bank_name} 
                  onChange={(e) => setForm(prev => ({ ...prev, bank_name: e.target.value }))}
                  className="bg-gray-900 border-gray-700 text-white" 
                  placeholder="Ej: Banco Galicia"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tarjeta</label>
                <select 
                  value={form.card_type} 
                  onChange={(e) => setForm(prev => ({ ...prev, card_type: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="all">Todas</option>
                  <option value="credit">Crédito</option>
                  <option value="debit">Débito</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Club Fan */}
        {(form.discount_type === 'club_membership') && (
          <Card className="bg-gray-900/50 border-gray-800 p-4">
            <h3 className="text-white font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Club Fan
            </h3>
            <p className="text-gray-400 text-sm">
              Esta promoción mostrará un botón para unirse al Club Fan y acceder a todos los beneficios.
            </p>
          </Card>
        )}

        {/* Candy Bar */}
        {(form.discount_type === 'candy_discount') && (
          <Card className="bg-gray-900/50 border-gray-800 p-4">
            <h3 className="text-white font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <Coffee className="h-4 w-4 text-orange-500" />
              Candy Bar
            </h3>
            <p className="text-gray-400 text-sm">
              Descuento aplicable a productos del Candy Bar.
            </p>
          </Card>
        )}

        {/* Combos */}
        {(form.discount_type === 'combo_discount') && (
          <Card className="bg-gray-900/50 border-gray-800 p-4">
            <h3 className="text-white font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <Popcorn className="h-4 w-4 text-pink-500" />
              Combos
            </h3>
            <p className="text-gray-400 text-sm">
              Descuento aplicable a combos del cine.
            </p>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <h3 className="text-white font-heading font-semibold text-sm mb-3">
            Botón de acción (opcional)
          </h3>
          <p className="text-gray-500 text-xs mb-3">
            Agregá un botón que lleve a una sección de la página
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Texto del botón</label>
              <Input 
                value={form.cta_label} 
                onChange={(e) => setForm(prev => ({ ...prev, cta_label: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white" 
                placeholder="Ej: Comprar entradas"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Link</label>
              <select 
                value={form.cta_url} 
                onChange={(e) => setForm(prev => ({ ...prev, cta_url: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="">Sin botón</option>
                <option value="/movies">Ver Cartelera</option>
                <option value="/club-fan">Unirse al Club Fan</option>
                <option value="/candy">Ver Candy Bar</option>
                <option value="/promotions">Ver Promociones</option>
                <option value="/bookings">Mis Boletos</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Exclusividad Club Fan */}
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <h3 className="text-white font-heading font-semibold text-sm mb-3">Exclusividad</h3>
          
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Solo Club CinemaConcep</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Esta promoción solo estará disponible para miembros del Club Fan
                </p>
              </div>
            </div>
            <button
              onClick={() => setForm(prev => ({ ...prev, club_only: !prev.club_only }))}
              className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                form.club_only ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                form.club_only ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </Card>

        {/* Fechas */}
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <h3 className="text-white font-heading font-semibold text-sm mb-3">Vigencia</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha inicio</label>
              <Input 
                type="date" 
                value={form.start_date} 
                onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
              <Input 
                type="date" 
                value={form.end_date} 
                onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          <Separator className="bg-gray-800 my-4" />
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.is_active} 
              onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="accent-red-600 w-4 h-4"
            />
            Promoción activa
          </label>
        </Card>
      </div>
    </div>
  )
}