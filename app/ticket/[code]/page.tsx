import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { TicketContent } from '@/components/booking/TicketContent'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export default async function TicketPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  
  const supabase = await createServerSupabaseClient()
  
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      showtime:showtimes(*, movie:movies(*), room:rooms(*)),
      seats:booking_seats(seat:seats(*)),
      combos:booking_combos(id, quantity, combo:combos(name))
    `)
    .eq('booking_code', code)
    .single()

  if (error || !booking) {
    notFound()
  }

  const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ticket/${code}`
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, { width: 200, margin: 2 })

  return <TicketContent booking={booking} qrDataUrl={qrDataUrl} />
}