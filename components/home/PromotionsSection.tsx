import Link from 'next/link'
import Image from 'next/image'
import { Ticket, Candy, Crown, ArrowRight } from 'lucide-react'

interface PromotionsSectionProps {
  promotions?: any[]
}

export function PromotionsSection({ promotions = [] }: PromotionsSectionProps) {
  const features = [
    {
      icon: Ticket,
      title: 'Promociones',
      description: '2x1, descuentos bancarios y más',
      href: '/promotions',
      color: 'from-red-600 to-red-800',
      image: '/images/banners/promo.jpg'
    },
    {
      icon: Candy,
      title: 'Candy Bar & Combos',
      description: 'Combos, vasos, pochocleras y coleccionables',
      href: '/candy',
      color: 'from-purple-600 to-purple-800',
      image: '/images/banners/candy.jpg'
    },
    {
      icon: Crown,
      title: 'Club Fan',
      description: 'Membresías con beneficios exclusivos',
      href: '/club-fan',
      color: 'from-yellow-600 to-amber-800',
      image: '/images/banners/club.webp'
    }
  ]

  const displayItems = promotions.length > 0 
    ? promotions.map((promo: any) => ({
        icon: promo.discount_type === 'club_membership' ? Crown : 
              promo.discount_type === 'candy_discount' ? Candy : Ticket,
        title: promo.title,
        description: promo.description,
        href: promo.cta_url || '/promotions',
        color: 'from-red-600/80 to-red-900/50',
        image: promo.image_url || '/images/banners/promo.jpg',
      }))
    : features

  return (
    <section className="bg-gradient-to-b from-black to-gray-950 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-5xl font-heading font-bold text-white mb-3">
            Beneficios{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
              CinemaConcep
            </span>
          </h2>
          <p className="text-gray-400 text-xs md:text-base max-w-lg mx-auto">
            Aprovechá nuestras promos, combos y planes exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {displayItems.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer">
                {feature.image && (
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/promotions">
            <span className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
              Ver todas las promociones
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}