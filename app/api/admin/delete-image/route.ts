import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { url, bucket } = await request.json()

    if (!url || !bucket) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    console.log('🔍 Intentando eliminar:', { url, bucket })

    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.indexOf(bucket)
    
    if (bucketIndex === -1) {
      console.error('❌ Bucket no encontrado en URL:', bucket)
      return NextResponse.json({ error: 'URL inválida: bucket no encontrado' }, { status: 400 })
    }
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    console.log('🗑️ Eliminando:', bucket, filePath)

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,  // ← Usar la misma variable que upload
      { auth: { persistSession: false } }
    )

    const { data, error: deleteError } = await adminClient.storage
      .from(bucket)
      .remove([filePath])

    if (deleteError) {
      console.error('❌ Error eliminando:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log('✅ Imagen eliminada correctamente:', filePath)
    return NextResponse.json({ success: true, deleted: filePath })

  } catch (error: any) {
    console.error('❌ Error en delete:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}