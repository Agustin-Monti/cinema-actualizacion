import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Crown, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ClubFanPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: plans } = await supabase
    .from('club_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  const planList = plans || []

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string, border: string, text: string, badge: string }> = {
      blue: { bg: 'from-blue-600 to-blue-800', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      purple: { bg: 'from-purple-600 to-purple-800', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
      red: { bg: 'from-red-600 to-red-800', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/30' },
      gold: { bg: 'from-yellow-600 to-amber-800', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' }
    }
    return colors[color] || colors.red
  }

  const getIcon = (index: number) => {
    const icons = [Star, Zap, Crown, Crown]
    return icons[index] || Star
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-4">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-400 text-xs font-medium">Club Fan</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-3">
            Club Fan CinemaConcep
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Elegí tu plan y disfrutá de beneficios exclusivos, descuentos y mucho más
          </p>
        </div>

        {planList.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800 p-12 text-center">
            <Crown className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">Planes disponibles próximamente</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {planList.map((plan: any, index: number) => {
              const colors = getColorClasses(plan.color)
              const Icon = getIcon(index)
              const isPopular = plan.name === 'Fan Premium'

              return (
                <Card key={plan.id} className={cn(
                  'bg-gray-900/50 border-gray-800 overflow-hidden transition-all hover:scale-105 relative',
                  isPopular && 'border-red-500/50 ring-1 ring-red-500/20'
                )}>
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center text-xs font-bold py-1">
                      MÁS POPULAR
                    </div>
                  )}
                  
                  <div className={cn('p-5 md:p-6', isPopular && 'pt-8')}>
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', colors.badge)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="text-xl font-heading font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-heading font-bold text-white">
                        ${plan.price?.toLocaleString('es-AR')}
                      </span>
                      <span className="text-gray-500 text-sm">
                        /{plan.duration_days === 30 ? 'mes' : 'año'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.benefits?.map((benefit: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className={cn('h-4 w-4 mt-0.5 flex-shrink-0', colors.text)} />
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button className={cn(
                      'w-full bg-gradient-to-r text-white font-heading font-semibold',
                      colors.bg,
                      'hover:opacity-90'
                    )}>
                      Elegir Plan
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}