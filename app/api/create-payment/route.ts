import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

interface PaymentItem {
  id: string
  title: string
  quantity: number
  unit_price: number
}

export async function POST(request: Request) {
  try {
    const { bookingId, totalAmount, items } = await request.json()

    console.log('📝 Creando pago para booking:', bookingId)

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No hay items para pagar' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    // Formatear items con tipo explícito
    const formattedItems = items.map((item: PaymentItem) => ({
      id: String(item.id).slice(0, 50),
      title: String(item.title).slice(0, 255),
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      currency_id: 'ARS' as const
    }))

    // Filtrar items con tipo explícito
    const validItems = formattedItems.filter((item: { unit_price: number }) => item.unit_price > 0)

    if (validItems.length === 0) {
      return NextResponse.json({ error: 'No hay items válidos' }, { status: 400 })
    }

    const preference = new Preference(client)
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const result = await preference.create({
      body: {
        items: validItems,
        payer: {
          email: user.email
        },
        back_urls: {
          success: `${siteUrl}/booking/confirmation?booking=${bookingId}&status=success`,
          failure: `${siteUrl}/booking/checkout?status=failure`,
          pending: `${siteUrl}/booking/confirmation?booking=${bookingId}&status=pending`
        },
        auto_return: 'approved',
        external_reference: bookingId,
        notification_url: `${siteUrl}/api/webhook/mercadopago`,
        statement_descriptor: 'CINEMACONCEP'
      }
    })

    console.log('✅ Preferencia creada:', result.id)

    return NextResponse.json({ 
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point
    })

  } catch (error: any) {
    console.error('❌ Error en checkout:', error)
    
    if (error.cause) {
      console.error('Causa:', error.cause)
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al crear el pago' },
      { status: 500 }
    )
  }
}