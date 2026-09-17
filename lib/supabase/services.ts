import { createClient } from './client'
import type { Movie, Showtime, Seat, Booking } from '@/types'

// Función helper para obtener el cliente
function getSupabase() {
  return createClient()
}

// ============ PELÍCULAS ============
export async function getMovies() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_active', true)
    .order('release_date', { ascending: false })
  
  if (error) throw error
  return data as Movie[]
}

export async function getMovieById(id: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Movie
}

export async function getFeaturedMovies() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(4)
  
  if (error) throw error
  return data as Movie[]
}

export async function getComingSoonMovies() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_coming_soon', true)
    .order('release_date', { ascending: true })
  
  if (error) throw error
  return data as Movie[]
}

export async function getMoviesPaginated(page: number, pageSize: number) {
  const supabase = getSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('movies')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('release_date', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { movies: data as Movie[], total: count || 0 }
}

// ============ HORARIOS ============
export async function getShowtimesByMovie(movieId: string) {
  const supabase = getSupabase()
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('showtimes')
    .select(`
      *,
      movie:movies(*),
      room:rooms(*)
    `)
    .eq('movie_id', movieId)
    .gte('showtime', now)
    .order('showtime', { ascending: true })
  
  if (error) throw error
  
  console.log('🎬 Horarios encontrados:', data?.length)
  data?.forEach(st => {
    console.log(`  - UTC: ${st.showtime} | ARG: ${new Date(st.showtime).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`)
  })
  
  return data as Showtime[]
}

export async function getShowtimeById(id: string) {
  const supabase = getSupabase()
  console.log('🔍 Buscando showtime:', id)
  
  const { data, error } = await supabase
    .from('showtimes')
    .select(`
      *,
      movie:movies(*),
      room:rooms(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('❌ Error en getShowtimeById:', error)
    throw error
  }
  
  console.log('✅ Showtime encontrado:', data?.id)
  return data as Showtime
}

// ============ ASIENTOS ============
export async function getSeatsByRoom(roomId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .eq('room_id', roomId)
    .order('row_letter')
    .order('seat_number')
  
  if (error) throw error
  return data as Seat[]
}

export async function getOccupiedSeats(showtimeId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('booking_seats')
    .select(`
      seat_id,
      booking:bookings!inner(
        id,
        showtime_id,
        status
      )
    `)
    .eq('booking.showtime_id', showtimeId)
    .neq('booking.status', 'cancelled')
  
  if (error) throw error
  return data.map(item => item.seat_id)
}

// ============ RESERVAS ============
export async function createBooking(
  userId: string,
  showtimeId: string,
  seatIds: string[],
  totalAmount: number
) {
  const supabase = getSupabase()
  const bookingCode = `CC-${Date.now().toString(36).toUpperCase()}`
  
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      showtime_id: showtimeId,
      total_amount: totalAmount,
      booking_code: bookingCode,
      status: 'confirmed'
    })
    .select()
    .single()
  
  if (bookingError) throw bookingError
  
  const bookingSeats = seatIds.map(seatId => ({
    booking_id: booking.id,
    seat_id: seatId
  }))
  
  const { error: seatsError } = await supabase
    .from('booking_seats')
    .insert(bookingSeats)
  
  if (seatsError) throw seatsError
  
  return booking
}

export async function getUserBookings(userId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      showtime:showtimes(
        *,
        movie:movies(*),
        room:rooms(*)
      ),
      seats:booking_seats(
        seat:seats(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ============ COMBOS ============
export async function getCombos() {
  const supabase = getSupabase()
  console.log('🍿 Cargando combos...')
  
  const { data, error } = await supabase
    .from('combos')
    .select(`
      *,
      items:combo_items(*)
    `)
    .eq('is_active', true)
    .order('price', { ascending: true })
  
  if (error) {
    console.error('❌ Error en getCombos:', error)
    // No lanzar error, retornar array vacío
    return []
  }
  
  console.log('✅ Combos cargados:', data?.length || 0)
  return data || []
}

export async function createCompleteBooking(
  userId: string,
  showtimeId: string,
  seatIds: string[],
  comboSelections: { comboId: string; quantity: number }[],
  totalAmount: number
) {
  const supabase = getSupabase()
  const bookingCode = `CC-${Date.now().toString(36).toUpperCase()}`
  
  console.log('📝 Creando reserva...')
  
  // 1. Crear la reserva como PENDIENTE
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      showtime_id: showtimeId,
      total_amount: totalAmount,
      booking_code: bookingCode,
      status: 'pending'
    })
    .select()
    .single()
  
  if (bookingError) {
    console.error('❌ Error creating booking:', bookingError)
    throw new Error('Error al crear la reserva: ' + bookingError.message)
  }
  
  console.log('✅ Reserva creada:', booking.id)
  
  // 2. Asignar asientos
  const bookingSeats = seatIds.map(seatId => ({
    booking_id: booking.id,
    seat_id: seatId
  }))
  
  const { error: seatsError } = await supabase
    .from('booking_seats')
    .insert(bookingSeats)
  
  if (seatsError) {
    console.error('❌ Error inserting seats:', seatsError)
    throw new Error('Error al asignar asientos: ' + seatsError.message)
  }
  
  console.log('✅ Asientos asignados:', seatIds.length)
  
  // 3. Agregar combos si hay
  if (comboSelections.length > 0) {
    console.log('🍿 Agregando combos...')
    for (const selection of comboSelections) {
      const { data: comboData, error: comboError } = await supabase
        .from('combos')
        .select('price')
        .eq('id', selection.comboId)
        .single()
      
      if (comboError) {
        console.warn('⚠️ Error getting combo:', comboError)
        continue
      }
      
      const { error: comboInsertError } = await supabase
        .from('booking_combos')
        .insert({
          booking_id: booking.id,
          combo_id: selection.comboId,
          quantity: selection.quantity,
          unit_price: comboData.price,
          subtotal: comboData.price * selection.quantity
        })
      
      if (comboInsertError) {
        console.warn('⚠️ Error inserting combo:', comboInsertError)
      }
    }
    console.log('✅ Combos agregados')
  }
  
  // 4. Reducir asientos disponibles
  const { data: showtimeData, error: showtimeError } = await supabase
    .from('showtimes')
    .select('available_seats')
    .eq('id', showtimeId)
    .single()
  
  if (showtimeError) {
    console.warn('⚠️ Error getting showtime:', showtimeError)
  } else if (showtimeData) {
    const newAvailable = Math.max(0, showtimeData.available_seats - seatIds.length)
    
    const { error: updateError } = await supabase
      .from('showtimes')
      .update({ available_seats: newAvailable })
      .eq('id', showtimeId)
    
    if (updateError) {
      console.warn('⚠️ Error updating seats:', updateError)
    } else {
      console.log('✅ Asientos actualizados:', newAvailable)
    }
  }
  
  console.log('🎉 Reserva completada:', booking.id)
  return booking
}

// ============ PROMOCIONES ============
export async function getPromotions() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) throw error
  return data
}