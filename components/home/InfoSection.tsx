import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/SocialIcons'
import { Button } from '@/components/ui/button'

export function InfoSection() {
  return (
    <section className="bg-gray-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Instagram */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <InstagramIcon  className="h-12 w-12 mb-6" />
              <h3 className="text-3xl font-heading font-bold mb-4">Seguinos en Instagram</h3>
              <p className="text-white/80 mb-6 text-lg">
                @cinemaconcep · Enterate de estrenos, promos y sorteos exclusivos
              </p>
              <Button className="bg-white text-pink-600 hover:bg-gray-100 rounded-full px-8">
                Seguir
              </Button>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-heading font-bold text-white mb-6">Visitános</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">CinemaConcep</p>
                  <p className="text-gray-400">Av. Colón 1234, Centro</p>
                  <p className="text-gray-400">Concepción, Argentina</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-gray-400">+54 9 343 555-1234</p>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-gray-400">info@cinemaconcep.com.ar</p>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Lunes a Viernes: 14:00 - 23:00</p>
                  <p className="text-gray-400">Sábados y Domingos: 11:00 - 01:00</p>
                </div>
              </div>
            </div>

            {/* Mapa simulado */}
            <div className="mt-8 h-48 bg-gray-800 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Av. Colón 1234, Centro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}