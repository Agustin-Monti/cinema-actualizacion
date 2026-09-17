import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // Obtener el usuario actual
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar rol de admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener archivo del form
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const folder = formData.get('folder') as string

    if (!file || !bucket || !folder) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagen demasiado grande (máx 5MB)' }, { status: 400 })
    }

    // Crear nombre de archivo único
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir usando service_role_key para permisos completos
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error subiendo:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Obtener URL pública
    const { data: { publicUrl } } = adminClient.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('✅ Imagen subida:', publicUrl)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: filePath 
    })

  } catch (error: any) {
    console.error('Error en upload:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al subir imagen' },
      { status: 500 }
    )
  }
}