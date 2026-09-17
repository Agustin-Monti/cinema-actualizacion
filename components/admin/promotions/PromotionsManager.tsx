'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Gift, Plus, Edit, Trash2, Ticket, CreditCard, Tag, Calendar, Loader2, Crown, Coffee, Popcorn, ArrowRight
} from 'lucide-react'

interface PromotionsManagerProps {
  promotions: any[]
}

export function PromotionsManager({ promotions }: PromotionsManagerProps) {
  const [mounted, setMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción?')) return

    setDeletingId(id)
    const response = await fetch('/api/admin/promotions/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promotionId: id })
    })
    const data = await response.json()
    if (data.error) {
      alert(data.error)
      setDeletingId(null)
      return
    }
    window.location.reload()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '2x1': return Ticket
      case 'percentage': return Tag
      case 'fixed': return Tag
      case 'bank_discount': return CreditCard
      case 'club_membership': return Crown
      case 'candy_discount': return Coffee
      case 'combo_discount': return Popcorn
      default: return Gift
    }
  }

  const getTypeBadge = (type: string) => {
    const configs: Record<string, string> = {
      '2x1': 'bg-green-500/10 text-green-400 border-green-500/30',
      'percentage': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'fixed': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'bank_discount': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      'club_membership': 'bg-red-600/20 text-red-400 border-red-500/30',
      'candy_discount': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      'combo_discount': 'bg-pink-500/10 text-pink-400 border-pink-500/30'
    }
    return configs[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      '2x1': '2x1',
      'percentage': 'Descuento %',
      'fixed': 'Precio fijo',
      'bank_discount': 'Banco',
      'club_membership': 'Club Fan',
      'candy_discount': 'Candy Bar',
      'combo_discount': 'Combos'
    }
    return labels[type] || type
  }

  const getStatusBadge = (promo: any) => {
    const now = new Date()
    const start = new Date(promo.start_date)
    const end = new Date(promo.end_date)

    if (!promo.is_active) {
      return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/30">Inactiva</Badge>
    }
    if (now < start) {
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Próximamente</Badge>
    }
    if (now > end) {
      return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Vencida</Badge>
    }
    return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Activa</Badge>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-white">Promociones</h1>
        <Link href="/admin/promotions/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Promoción
          </Button>
        </Link>
      </div>

      {promotions.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
          <Gift className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No hay promociones registradas</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promo: any) => {
            const TypeIcon = getTypeIcon(promo.discount_type)
            
            return (
              <Card key={promo.id} className="bg-gray-900/50 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
                <div className="flex items-stretch">
                  <div className="w-28 md:w-32 flex-shrink-0 bg-gray-800 relative">
                    {promo.image_url ? (
                      <Image
                        src={promo.image_url}
                        alt={promo.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-heading font-semibold text-sm truncate">{promo.title}</h3>
                        <p className="text-gray-500 text-xs line-clamp-2 mt-1">{promo.description}</p>
                      </div>
                      {getStatusBadge(promo)}
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge className={getTypeBadge(promo.discount_type)}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {getTypeLabel(promo.discount_type)}
                        {promo.discount_value && ` · ${promo.discount_value}`}
                      </Badge>
                      {promo.bank_name && (
                        <Badge className="bg-gray-800 text-gray-400">{promo.bank_name}</Badge>
                      )}
                      {promo.club_only && (
                        <Badge className="bg-red-600/20 text-red-400 border-red-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          Club Fan
                        </Badge>
                      )}
                      {promo.cta_label && (
                        <Badge className="bg-gray-800 text-gray-400">
                          {promo.cta_label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(promo.start_date).toLocaleDateString('es-AR')} - {new Date(promo.end_date).toLocaleDateString('es-AR')}
                      </p>
                      
                      <div className="flex gap-1">
                        <Link href={`/admin/promotions/${promo.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-red-400"
                          onClick={() => handleDelete(promo.id)}
                          disabled={deletingId === promo.id}
                        >
                          {deletingId === promo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}