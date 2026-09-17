import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedMovies } from '@/components/home/FeaturedMovies'
import { PromotionsSection } from '@/components/home/PromotionsSection'
import { InfoSection } from '@/components/home/InfoSection'
import { getMovies } from '@/lib/supabase/services'
import { getPromotions } from '@/lib/supabase/services'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [movies, promotions] = await Promise.all([
    getMovies(),
    getPromotions()
  ])

  return (
    <div className="bg-black">
      <HeroSection movies={movies || []} />
      <FeaturedMovies movies={movies || []} />
      <PromotionsSection promotions={promotions || []} />
      <InfoSection />
    </div>
  )
}