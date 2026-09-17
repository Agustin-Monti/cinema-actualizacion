import { createServerSupabaseClient } from '@/lib/supabase/server'
import CandyContent from '@/components/combo/CandyContent'

export const dynamic = 'force-dynamic'

export default async function CandyPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: products } = await supabase
    .from('candy_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: combos } = await supabase
    .from('combos')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  return <CandyContent products={products || []} combos={combos || []} />
}