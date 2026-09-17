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

    const { bucket, folder } = await request.json()

    if (!bucket || !folder) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: files, error } = await adminClient.storage
      .from(bucket)
      .list(folder)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generar URLs públicas
    const filesWithUrls = files.map(file => {
      const { data: { publicUrl } } = adminClient.storage
        .from(bucket)
        .getPublicUrl(`${folder}/${file.name}`)
      return { name: file.name, url: publicUrl, size: file.metadata?.size }
    })

    return NextResponse.json({ files: filesWithUrls })

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al listar imágenes' },
      { status: 500 }
    )
  }
}