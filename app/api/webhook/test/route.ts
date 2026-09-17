import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook test endpoint working! 🎉',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    site_url: process.env.NEXT_PUBLIC_SITE_URL,
    mercadopago_configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📨 Webhook test recibido:', JSON.stringify(body, null, 2))

    return NextResponse.json({
      success: true,
      message: 'POST recibido correctamente',
      received_data: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error en webhook test:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al procesar el body'
    }, { status: 400 })
  }
}