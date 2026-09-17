import Link from 'next/link'
import { Film } from 'lucide-react'
import { InstagramIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/SocialIcons'
import { Separator } from '@/components/ui/separator'

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Film className="h-8 w-8 text-red-500" />
              <span className="text-white text-xl font-heading font-bold">
                Cinema<span className="text-red-500">Concep</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              La mejor experiencia cinematográfica de la ciudad.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-600 hover:text-red-500 transition-colors">
                <InstagramIcon  className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500 transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500 transition-colors">
                <YoutubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><Link href="/movies" className="text-gray-500 hover:text-red-400 transition-colors text-sm">Cartelera</Link></li>
              <li><Link href="/promotions" className="text-gray-500 hover:text-red-400 transition-colors text-sm">Promociones</Link></li>
              <li><Link href="/bookings" className="text-gray-500 hover:text-red-400 transition-colors text-sm">Mis Boletos</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-4">Información</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-500 text-sm">Av. Colón 1234, Centro</span></li>
              <li><span className="text-gray-500 text-sm">Concepción, Argentina</span></li>
              <li><span className="text-gray-500 text-sm">+54 9 343 555-1234</span></li>
              <li><span className="text-gray-500 text-sm">info@cinemaconcep.com.ar</span></li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-4">Horarios</h4>
            <ul className="space-y-2">
              <li className="text-gray-500 text-sm">Lunes a Viernes</li>
              <li className="text-white text-sm font-medium">14:00 - 23:00</li>
              <li className="text-gray-500 text-sm mt-3">Sábados y Domingos</li>
              <li className="text-white text-sm font-medium">11:00 - 01:00</li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 my-8" />

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} CinemaConcep. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}