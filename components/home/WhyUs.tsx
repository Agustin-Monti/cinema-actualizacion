import { Monitor, Volume2, Users, Coffee, Wifi, Car } from 'lucide-react'

const features = [
  {
    icon: Monitor,
    title: 'Proyección 4K Laser',
    description: 'Imagen ultra nítida con la última tecnología de proyección láser'
  },
  {
    icon: Volume2,
    title: 'Dolby Atmos',
    description: 'Sonido envolvente 360° que te transporta dentro de la película'
  },
  {
    icon: Users,
    title: 'Butacas Reclinables',
    description: 'Asientos premium con espacio extra para máximo confort'
  },
  {
    icon: Coffee,
    title: 'Candy Bar Premium',
    description: 'Combos con pochoclos, nachos, gaseosas y snacks importados'
  },
  {
    icon: Wifi,
    title: 'WiFi Gratis',
    description: 'Conectate mientras esperás tu función'
  },
  {
    icon: Car,
    title: 'Estacionamiento',
    description: 'Primeras 2 horas sin cargo presentando tu ticket'
  }
]

export function WhyUs() {
  return (
    <section className="bg-gradient-to-b from-black to-gray-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            ¿Por qué elegir{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
              CinemaConcep
            </span>
            ?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            La mejor experiencia cinematográfica de la ciudad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-3xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:border-red-500/50 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}