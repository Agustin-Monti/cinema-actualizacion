import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { comboId } = await request.json()

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Obtener imagen para eliminar
    const { data: combo } = await adminClient
      .from('combos')
      .select('image_url')
      .eq('id', comboId)
      .single()

    if (combo?.image_url?.includes('supabase')) {
      try {
        const urlObj = new URL(combo.image_url)
        const pathParts = urlObj.pathname.split('/')
        const bucketIndex = pathParts.indexOf('combos')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          await adminClient.storage.from('combos').remove([filePath])
        }
      } catch (err) {
        console.warn('No se pudo eliminar imagen:', err)
      }
    }

    const { error } = await adminClient
      .from('combos')
      .delete()
      .eq('id', comboId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar' },
      { status: 500 }
    )
  }
}