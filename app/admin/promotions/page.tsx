import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { PromotionsManager } from '@/components/admin/promotions/PromotionsManager'

export const dynamic = 'force-dynamic'

export default async function AdminPromotionsPage() {
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: promotions } = await adminClient
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  return <PromotionsManager promotions={promotions || []} />
}