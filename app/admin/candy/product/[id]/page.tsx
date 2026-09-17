import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ProductForm } from '@/components/admin/candy/ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const { data: product } = await adminClient.from('candy_products').select('*').eq('id', id).single()
  return <ProductForm product={product} isEdit />
}