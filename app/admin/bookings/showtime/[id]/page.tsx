import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ShowtimeBookings } from '@/components/admin/bookings/ShowtimeBookings'

export const dynamic = 'force-dynamic'

export default async function ShowtimeBookingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: showtime } = await adminClient
    .from('showtimes')
    .select(`
      *,
      movie:movies(title, poster_url),
      room:rooms(name)
    `)
    .eq('id', id)
    .single()

  const { data: bookings } = await adminClient
    .from('bookings')
    .select(`
      *,
      seats:booking_seats(
        seat:seats(row_letter, seat_number)
      ),
      combos:booking_combos(
        quantity,
        combo:combos(name)
      )
    `)
    .eq('showtime_id', id)
    .order('created_at', { ascending: false })

  return <ShowtimeBookings showtime={showtime} bookings={bookings || []} />
}