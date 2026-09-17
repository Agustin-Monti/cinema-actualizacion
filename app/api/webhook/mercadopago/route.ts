import { NextResponse, NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔔 Webhook recibido:', JSON.stringify(body).slice(0, 300))
    
    // Obtener parámetros de la URL (por si vienen como query params)
    const searchParams = request.nextUrl.searchParams
    const paymentIdFromQuery = searchParams.get('data.id')
    
    // Si es notificación de prueba de MP
    if (body.data?.id === '123456' && body.type === 'payment') {
      console.log('✅ Notificación de prueba recibida')
      return NextResponse.json({ received: true })
    }
    
    if (body.type === 'payment') {
      const paymentId = body.data?.id || paymentIdFromQuery
      
      if (!paymentId) {
        console.log('⚠️ No se recibió ID de pago')
        return NextResponse.json({ received: true })
      }

      console.log('💰 Procesando pago:', paymentId)
      
      try {
        const payment = new Payment(client)
        const paymentInfo = await payment.get({ id: paymentId })
        
        console.log('💳 Estado:', paymentInfo.status)
        
        // Buscar el booking por external_reference
        const supabase = await createServerSupabaseClient()
        
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('id, status')
          .eq('id', paymentInfo.external_reference)
          .single()

        if (bookingError || !booking) {
          console.error('❌ Booking no encontrado:', paymentInfo.external_reference)
          return NextResponse.json({ received: true })
        }

        // Actualizar el booking
        const updateData: any = {
          payment_id: String(paymentId),
          payment_status: paymentInfo.status === 'approved' ? 'approved' : 'rejected',
          payment_method: paymentInfo.payment_method_id || paymentInfo.payment_type_id,
          updated_at: new Date().toISOString()
        }

        // Solo confirmar si el pago fue aprobado
        if (paymentInfo.status === 'approved') {
          updateData.status = 'confirmed'
        }

        const { error: updateError } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', paymentInfo.external_reference)

        if (updateError) {
          console.error('❌ Error actualizando booking:', updateError)
        } else {
          console.log('✅ Booking actualizado:', paymentInfo.external_reference, '→', updateData.status)
        }

      } catch (mpError) {
        console.error('❌ Error al obtener pago de MP:', mpError)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ received: true })
  }
}

// También soportar GET
export async function GET(request: NextRequest) {
  return POST(request)
}