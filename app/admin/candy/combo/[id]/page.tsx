import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ComboForm } from '@/components/admin/candy/ComboForm'

export const dynamic = 'force-dynamic'

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const { data: combo } = await adminClient
    .from('combos')
    .select('*, items:combo_items(*)')
    .eq('id', id)
    .single()
  return <ComboForm combo={combo} isEdit />
}