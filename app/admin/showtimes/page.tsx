import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ShowtimesManager } from '@/components/admin/showtimes/ShowtimesManager'

export const dynamic = 'force-dynamic'

export default async function AdminShowtimesPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: showtimes } = await supabase
    .from('showtimes')
    .select(`
      *,
      movie:movies(id, title, poster_url),
      room:rooms(id, name)
    `)
    .order('showtime', { ascending: true })

  const { data: movies } = await supabase
    .from('movies')
    .select('id, title')
    .eq('is_active', true)
    .order('title')

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')

  return (
    <ShowtimesManager 
      showtimes={showtimes || []} 
      movies={movies || []} 
      rooms={rooms || []} 
    />
  )
}