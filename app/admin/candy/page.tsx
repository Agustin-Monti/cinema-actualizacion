import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { CandyManager } from '@/components/admin/candy/CandyManager'

export const dynamic = 'force-dynamic'

export default async function AdminCandyPage() {
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: products } = await adminClient
    .from('candy_products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: combos } = await adminClient
    .from('combos')
    .select('*')
    .order('price', { ascending: true })

  return <CandyManager products={products || []} combos={combos || []} />
}