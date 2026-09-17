import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { comboId, items, ...comboData } = await request.json()
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Actualizar combo
    const { error } = await adminClient.from('combos').update(comboData).eq('id', comboId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Eliminar items viejos
    await adminClient.from('combo_items').delete().eq('combo_id', comboId)

    // Insertar items nuevos
    if (items && items.length > 0) {
      const comboItems = items.map((item: any) => ({
        combo_id: comboId,
        item_name: item.item_name,
        quantity: item.quantity
      }))
      await adminClient.from('combo_items').insert(comboItems)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}