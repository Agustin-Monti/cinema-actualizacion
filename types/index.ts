export interface Movie {
  id: string
  title: string
  poster_url: string
  backdrop_url: string
  promo_desktop_url?: string
  promo_mobile_url?: string
  duration: number
  synopsis: string
  director: string
  movie_cast: string[]
  genre: string[]
  rating: number
  classification: string
  language: string
  release_date: string
  is_active: boolean
  trailer_url?: string
  is_coming_soon?: boolean
}

export interface Promotion {
  id: string
  title: string
  description: string
  image_url: string
  discount_type: '2x1' | 'percentage' | 'fixed' | 'bank_discount' | 'other'
  discount_value: string
  valid_days: string[]
  bank_name?: string
  card_type?: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface CandyProduct {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: 'vaso' | 'pochoclera' | 'peluche' | 'figura' | 'otro'
  movie_related?: string
  stock: number
  is_active: boolean
}

export interface Room {
  id: string
  name: string
  capacity: number
  description: string
}

export interface Showtime {
  id: string
  movie_id: string
  room_id: string
  showtime: string
  price: number
  available_seats: number
  audio_type?: 'Español Latino' | 'Subtitulada' | 'Castellano'
  movie?: Movie
  room?: Room
}

export interface Seat {
  id: string
  room_id: string
  row_letter: string
  seat_number: number
  seat_type: 'standard' | 'vip' | 'wheelchair'
}

export interface Booking {
  id: string
  user_id: string
  showtime_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount: number
  booking_code: string
  payment_id?: string
  payment_status?: string
  payment_method?: string
  created_at: string
  updated_at?: string
  showtime?: Showtime
  seats?: Seat[]
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  points: number
  role?: 'user' | 'admin' | 'superadmin'
  created_at?: string
  updated_at?: string
}

export interface TicketType {
  id: string
  name: string
  description: string
  is_active: boolean
}

export interface TicketPrice {
  id: string
  ticket_type_id: string
  price: number
  time_start: string | null
  time_end: string | null
  day_of_week: number | null
  is_active: boolean
}

export interface Combo {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  is_active: boolean
  items?: ComboItem[]
}

export interface ComboItem {
  id: string
  combo_id: string
  item_name: string
  quantity: number
}

export interface BookingCombo {
  id: string
  booking_id: string
  combo_id: string
  quantity: number
  unit_price: number
  subtotal: number
}