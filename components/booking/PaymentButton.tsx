'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Wallet } from 'lucide-react'

interface PaymentButtonProps {
  bookingId: string
  totalAmount: number
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
  }>
  onError?: (error: string) => void
}

export function PaymentButton({ bookingId, totalAmount, items, onError }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          totalAmount,
          items
        })
      })

      const data = await response.json()

      if (data.error) {
        onError?.(data.error)
        return
      }

      // Redirigir al checkout de Mercado Pago
      if (data.sandbox_init_point || data.init_point) {
        window.location.href = data.sandbox_init_point || data.init_point
      }
    } catch (error) {
      onError?.('Error al conectar con Mercado Pago')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Conectando con Mercado Pago...
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5 mr-2" />
          Pagar con Mercado Pago
        </>
      )}
    </Button>
  )
}