import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { promotionId } = await request.json()

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Obtener imagen para eliminar del bucket
    const { data: promo } = await adminClient
      .from('promotions')
      .select('image_url')
      .eq('id', promotionId)
      .single()

    if (promo?.image_url?.includes('supabase')) {
      try {
        const urlObj = new URL(promo.image_url)
        const pathParts = urlObj.pathname.split('/')
        const bucketIndex = pathParts.indexOf('promociones')
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          await adminClient.storage.from('promociones').remove([filePath])
        }
      } catch (err) {
        console.warn('No se pudo eliminar imagen:', err)
      }
    }

    const { error } = await adminClient
      .from('promotions')
      .delete()
      .eq('id', promotionId)

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