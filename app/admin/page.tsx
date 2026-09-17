import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Film, Ticket, Users, DollarSign, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  
  // Obtener estadísticas
  const { count: totalMovies } = await supabase.from('movies').select('*', { count: 'exact', head: true })
  const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { data: revenue } = await supabase.from('bookings').select('total_amount').eq('status', 'confirmed')
  
  const totalRevenue = revenue?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0

  const stats = [
    { icon: Film, label: 'Películas', value: totalMovies || 0, color: 'text-red-500' },
    { icon: Ticket, label: 'Reservas', value: totalBookings || 0, color: 'text-green-500' },
    { icon: Users, label: 'Usuarios', value: totalUsers || 0, color: 'text-blue-500' },
    { icon: DollarSign, label: 'Ingresos', value: `$${totalRevenue.toLocaleString('es-AR')}`, color: 'text-yellow-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="bg-gray-900/50 border-gray-800 p-6">
              <Icon className={`h-8 w-8 ${stat.color} mb-4`} />
              <p className="text-3xl font-heading font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}