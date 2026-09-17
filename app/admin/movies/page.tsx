import { createServerSupabaseClient } from '@/lib/supabase/server'
import { MoviesTable } from '@/components/admin/movies/MoviesTable'

export const dynamic = 'force-dynamic'

export default async function AdminMoviesPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: movies } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })

  return <MoviesTable movies={movies || []} />
}