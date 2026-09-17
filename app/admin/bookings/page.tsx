import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { BookingsManager } from '@/components/admin/bookings/BookingsManager'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  // Usar service role para bypass RLS
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  
  const { data: bookings, error } = await adminClient
    .from('bookings')
    .select(`
      *,
      showtime:showtimes(
        *,
        movie:movies(title),
        room:rooms(name)
      ),
      seats:booking_seats(
        seat:seats(row_letter, seat_number)
      ),
      combos:booking_combos(
        quantity,
        combo:combos(name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('📊 Reservas encontradas:', bookings?.length)
  }

  return <BookingsManager bookings={bookings || []} />
}