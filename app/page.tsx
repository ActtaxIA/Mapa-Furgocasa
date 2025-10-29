'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { 
  MapIcon, 
  MapPinIcon, 
  ArrowPathIcon, 
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function HomePage() {
  const router = useRouter()
  const [totalAreas, setTotalAreas] = useState(1000)
  
  useEffect(() => {
    // Detectar si se está ejecutando como PWA instalada
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window as any).navigator?.standalone === true
    
    if (isPWA) {
      router.replace('/mapa')
    }

    // Cargar contador dinámico de áreas
    const loadTotalAreas = async () => {
      try {
        const supabase = createClient()
        const { count, error } = await supabase
          .from('areas')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)

        if (!error && count) {
          setTotalAreas(count)
        }
      } catch (err) {
        console.error('Error loading total areas:', err)
      }
    }

    loadTotalAreas()
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Con color azul principal */}
      <section className="relative bg-gradient-to-br from-[#0b3c74] via-[#0d4a8f] to-[#0b3c74] py-20 md:py-28 overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
              <GlobeAltIcon className="w-4 h-4" />
              <span>+{totalAreas} áreas en todo el mundo</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Tu guía definitiva de áreas para
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-cyan-200">
                autocaravanas
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Descubre, planifica y viaja. Toda la información que necesitas sobre áreas de pernocta,
              campings y parkings para autocaravanas en <strong className="text-sky-200">Europa, América y resto del mundo</strong>.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/mapa"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0b3c74] text-lg font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <MapIcon className="w-6 h-6" />
                Explorar Mapa Gratis
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white text-lg font-bold rounded-xl border-2 border-white hover:bg-white/10 transition-all"
              >
                Crear Cuenta Gratis
              </Link>
            </div>

            {/* Stats mejoradas */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">+{totalAreas}</div>
                <div className="text-sm text-white/80">Áreas Verificadas</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white/80">Gratis Siempre</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-white/80">Actualizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features principales - Sin espacio blanco */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Información actualizada, mapas interactivos y herramientas profesionales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Feature 1 - Destacada */}
            <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] text-white rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-all">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <MapPinIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                +{totalAreas} Áreas Actualizadas
              </h3>
              <p className="text-white/90 leading-relaxed">
                Base de datos completa con áreas públicas, privadas, campings y parkings. 
                Información verificada de servicios, precios y ubicaciones exactas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <ArrowPathIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Planificador de Rutas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Crea rutas personalizadas y descubre automáticamente áreas de pernocta cercanas. 
                Optimiza distancias y tiempos de viaje.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <GlobeAltIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Cobertura Mundial
              </h3>
              <p className="text-gray-600 leading-relaxed">
                España, Portugal, Francia, Andorra, Argentina y más países. 
                Expandimos constantemente nuestra red global de áreas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <HeartIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Lista de Favoritos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Guarda tus áreas preferidas y accede a ellas desde cualquier dispositivo. 
                Organiza tu próximo viaje fácilmente.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <StarIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Valoraciones Reales
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Lee opiniones de otros autocaravanistas y comparte tu experiencia. 
                Comunidad activa y colaborativa.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#0b3c74]/10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                <DevicePhoneMobileIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                App Móvil (PWA)
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Instálala como app en tu móvil. Funciona offline y se actualiza automáticamente. 
                Sin descargar nada de la tienda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección "Por qué nosotros" con testimonial */}
      <section className="py-20 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f]">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                ¿Por qué más de 10.000 autocaravanistas confían en nosotros?
              </h2>
              <p className="text-xl text-white/80">
                Parte de Furgocasa, especialistas en el mundo del caravaning desde hace años
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Información Verificada
                    </h3>
                    <p className="text-white/80">
                      Cada área es revisada y actualizada por nuestro equipo. 
                      Datos reales de ubicación, servicios disponibles, precios actualizados y estado operativo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Comunidad Activa
                    </h3>
                    <p className="text-white/80">
                      Miles de autocaravanistas comparten experiencias, consejos y recomendaciones. 
                      La comunidad más grande de España y en crecimiento internacional.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Siempre Actualizado
                    </h3>
                    <p className="text-white/80">
                      Nuevas áreas añadidas constantemente. Sistema de reportes de la comunidad. 
                      Nunca llegarás a un lugar cerrado o inexistente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Tecnología Google Maps
                    </h3>
                    <p className="text-white/80">
                      Integración completa con Google Maps. Visualización precisa, cálculo de rutas, 
                      navegación directa y vista satélite de cada ubicación.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-white/20 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={i} className="w-8 h-8 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl text-white mb-6 italic font-light">
                "La mejor herramienta para planificar rutas en autocaravana. 
                He descubierto áreas increíbles que nunca hubiera encontrado por mi cuenta."
              </blockquote>
              <div className="text-white/80 font-medium">
                — Comunidad Furgocasa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final potente */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-3xl p-12 md:p-16 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Comienza tu próxima aventura hoy
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Únete a miles de autocaravanistas que ya planifican sus viajes con Mapa Furgocasa. 
                <strong className="text-sky-200"> Gratis, sin registros obligatorios</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/mapa"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-[#0b3c74] text-xl font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl transform hover:-translate-y-1"
                >
                  <MapIcon className="w-7 h-7" />
                  Explorar Mapa Ahora
                </Link>
                <Link
                  href="/ruta"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-transparent text-white text-xl font-bold rounded-xl border-2 border-white hover:bg-white/10 transition-all"
                >
                  <ArrowPathIcon className="w-7 h-7" />
                  Planificar Mi Ruta
                </Link>
              </div>

              <p className="text-sm text-white/70">
                No requiere tarjeta de crédito • Acceso inmediato • Compatible con todos los dispositivos
              </p>
            </div>

            {/* Mini features */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b3c74] mb-2">100%</div>
                <div className="text-sm text-gray-600">Gratis</div>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-3xl font-bold text-[#0b3c74] mb-2">+{totalAreas}</div>
                <div className="text-sm text-gray-600">Áreas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0b3c74] mb-2">10K+</div>
                <div className="text-sm text-gray-600">Usuarios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
