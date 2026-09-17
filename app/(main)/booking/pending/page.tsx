import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PendingPaymentPage() {
  return (
    <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
      <Card className="bg-gray-900/50 border-gray-800 p-12 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full mb-6">
          <Clock className="h-10 w-10 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-white mb-4">
          Pago Pendiente
        </h1>
        <p className="text-gray-400 mb-6">
          Tu pago está siendo procesado. Una vez confirmado, recibirás un correo con los detalles de tu compra.
        </p>
        <Link href="/bookings">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Ver Mis Boletos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </Card>
    </div>
  )
}