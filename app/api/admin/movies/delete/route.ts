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

    // Verificar rol admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { movieId } = await request.json()

    if (!movieId) {
      return NextResponse.json({ error: 'Falta movieId' }, { status: 400 })
    }

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. Obtener URLs de las imágenes de la película
    const { data: movie, error: fetchError } = await adminClient
      .from('movies')
      .select('poster_url, backdrop_url, promo_desktop_url, promo_mobile_url')
      .eq('id', movieId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // 2. Recolectar URLs para eliminar
    const urlsToDelete: { url: string; bucket: string }[] = []

    if (movie?.poster_url?.includes('peliculas')) {
      urlsToDelete.push({ url: movie.poster_url, bucket: 'peliculas' })
    }
    if (movie?.backdrop_url?.includes('peliculas') && movie.backdrop_url !== movie.poster_url) {
      urlsToDelete.push({ url: movie.backdrop_url, bucket: 'peliculas' })
    }
    if (movie?.promo_desktop_url?.includes('banners')) {
      urlsToDelete.push({ url: movie.promo_desktop_url, bucket: 'banners' })
    }
    if (movie?.promo_mobile_url?.includes('banners') && movie.promo_mobile_url !== movie.promo_desktop_url) {
      urlsToDelete.push({ url: movie.promo_mobile_url, bucket: 'banners' })
    }

    // 3. Eliminar imágenes del bucket
    for (const { url, bucket } of urlsToDelete) {
      try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const bucketIndex = pathParts.indexOf(bucket)
        if (bucketIndex !== -1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          await adminClient.storage.from(bucket).remove([filePath])
          console.log(`🗑️ Eliminada: ${bucket}/${filePath}`)
        }
      } catch (deleteErr) {
        console.warn('⚠️ No se pudo eliminar:', url)
      }
    }

    // 4. Eliminar registros relacionados (horarios, reservas, etc.)
    // Esto se hace automáticamente con ON DELETE CASCADE si configuraste las FK

    // 5. Eliminar la película de la DB
    const { error: deleteError } = await adminClient
      .from('movies')
      .delete()
      .eq('id', movieId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log('✅ Película eliminada completamente')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar película' },
      { status: 500 }
    )
  }
}