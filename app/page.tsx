'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { 
  MapIcon, 
  MapPinIcon, 
  ArrowPathIcon, 
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Detectar si se está ejecutando como PWA instalada
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window as any).navigator?.standalone === true
    
    if (isPWA) {
      // Si es PWA, redirigir automáticamente al mapa (experiencia app nativa)
      router.replace('/mapa')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mismo Navbar que el resto de la app */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Encuentra tu próxima
              <br />
              <span className="text-primary-600">aventura en autocaravana</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Descubre <strong>más de 600 áreas</strong> para autocaravanas en España. 
              Planifica rutas, compara servicios y viaja con total libertad.
            </p>
            
            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/mapa"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <MapIcon className="w-6 h-6" />
                Explorar Mapa Gratis
              </Link>
              <Link
                href="/ruta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 text-lg font-bold rounded-xl border-2 border-primary-600 hover:bg-primary-50 transition-all"
              >
                <ArrowPathIcon className="w-6 h-6" />
                Planificar Ruta
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">+600</div>
                <div className="text-sm text-gray-600 mt-1">Áreas</div>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">100%</div>
                <div className="text-sm text-gray-600 mt-1">Gratis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Actualizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para viajar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa diseñada específicamente para autocaravanistas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                <MapPinIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                +600 Áreas Verificadas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Áreas públicas, privadas, campings y parkings en el mundo con información detallada de servicios y precios.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                <ArrowPathIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Planificador de Rutas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Crea rutas personalizadas y descubre automáticamente áreas cercanas a tu camino. Optimiza tu viaje.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Guarda tus Favoritos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Crea tu lista personal de áreas favoritas y accede a ellas cuando quieras. Organiza tu próximo viaje.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Valoraciones Reales
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Lee opiniones de otros viajeros y comparte tu experiencia. Ayuda a la comunidad autocaravanista.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                App Móvil PWA
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Instala la app en tu móvil y úsala como una aplicación nativa. Funciona offline.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6">
                <CurrencyEuroIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Precios Transparentes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Conoce el precio por noche de cada área antes de visitarla. Sin sorpresas en tu presupuesto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Empieza tu aventura hoy
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Únete a miles de autocaravanistas que ya usan Furgocasa para planificar sus viajes por España
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mapa"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 text-lg font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg"
            >
              <MapIcon className="w-6 h-6" />
              Ver Mapa Ahora
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-700 text-white text-lg font-bold rounded-xl border-2 border-white hover:bg-primary-800 transition-all"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                ¿Por qué Mapa Furgocasa?
              </h2>
              <p className="text-xl text-gray-600">
                La plataforma más completa para autocaravanistas en España
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Información Verificada
                  </h3>
                  <p className="text-gray-600">
                    Todas nuestras áreas están verificadas y actualizadas regularmente con datos reales de ubicación, servicios y precios.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Comunidad Activa
                  </h3>
                  <p className="text-gray-600">
                    Conecta con otros autocaravanistas, comparte experiencias y descubre los mejores lugares gracias a la comunidad.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ahorra Tiempo
                  </h3>
                  <p className="text-gray-600">
                    Encuentra el lugar perfecto en segundos. Filtra por servicios, precio, ubicación y ve directamente al mapa.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MapIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Mapas Integrados
                  </h3>
                  <p className="text-gray-600">
                    Powered by Google Maps. Visualiza todas las áreas en el mapa, calcula distancias y obtén direcciones precisas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios / Stats */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <StarSolid key={i} className="w-8 h-8 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-gray-700 mb-6 italic">
              "La mejor aplicación para planificar rutas en autocaravana. 
              Encontré áreas que ni siquiera sabía que existían."
            </blockquote>
            <div className="text-gray-600 font-medium">
              — Comunidad Furgocasa
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Descubre España en autocaravana con la confianza de tener toda la información que necesitas
          </p>
          <Link
            href="/mapa"
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary-600 text-white text-xl font-bold rounded-xl hover:bg-primary-700 transition-all shadow-2xl hover:shadow-primary-600/50 transform hover:-translate-y-1"
          >
            <MapIcon className="w-7 h-7" />
            Comenzar Ahora - Es Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/logo_gris.jpg" 
                  alt="Furgocasa" 
                  width={40} 
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-white">Furgocasa</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                La plataforma más completa para encontrar áreas de autocaravanas en España. 
                Más de 600 ubicaciones verificadas y actualizadas.
              </p>
            </div>

            {/* Enlaces */}
            <div>
              <h3 className="text-white font-semibold mb-4">Explora</h3>
              <ul className="space-y-2">
                <li><Link href="/mapa" className="hover:text-white transition-colors">Mapa</Link></li>
                <li><Link href="/ruta" className="hover:text-white transition-colors">Planificar Ruta</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">info@furgocasa.com</li>
                <li><a href="https://www.furgocasa.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.furgocasa.com</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2025 Furgocasa Campervans. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
