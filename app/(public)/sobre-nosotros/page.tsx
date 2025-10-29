'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MapPinIcon, 
  ArrowPathIcon, 
  StarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function SobreNosotrosPage() {
  const [totalAreas, setTotalAreas] = useState(1000)

  useEffect(() => {
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
        console.error('Error cargando total de áreas:', err)
      }
    }

    loadTotalAreas()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0b3c74] via-[#0d4a8f] to-[#0b3c74] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-2xl text-white/90 max-w-2xl mx-auto">
              Tu compañero de viaje en autocaravana por el mundo
            </p>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Nuestra Historia */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚐</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">
                Nuestra Historia
              </h2>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-[#0b3c74]/10 space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                <strong className="text-[#0b3c74]">Mapa Furgocasa</strong> nace de la pasión por viajar en autocaravana y la necesidad 
                de contar con información actualizada y confiable sobre áreas de pernocta en todo el mundo.
              </p>
              <p>
                Somos una empresa del grupo <a href="https://www.furgocasa.com" target="_blank" rel="noopener noreferrer" className="text-[#0b3c74] hover:text-[#0d4a8f] font-semibold underline">Furgocasa</a>, 
                especializados en la venta, alquiler y camperización de furgonetas. Con años de experiencia 
                en el sector, conocemos de primera mano las necesidades de los viajeros en autocaravana.
              </p>
              <p>
                Decidimos crear esta plataforma para que todos los amantes del caravaning tengan acceso 
                a información completa, verificada y actualizada sobre áreas de autocaravanas en todo el mundo.
              </p>
            </div>
          </section>

          {/* Nuestra Misión */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">
                Nuestra Misión
              </h2>
            </div>
            <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-2xl p-8 shadow-xl">
              <p className="text-xl text-white leading-relaxed">
                Facilitar la experiencia de viajar en autocaravana proporcionando la plataforma más completa 
                y actualizada de áreas de pernocta en el mundo, ayudando a miles de viajeros a planificar 
                sus rutas con confianza y libertad.
              </p>
            </div>
          </section>

          {/* Qué Ofrecemos */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                ✨ Qué Ofrecemos
              </h2>
              <p className="text-xl text-gray-600">
                Herramientas profesionales para tu viaje perfecto
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] text-white rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-all">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                  <MapPinIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  +{totalAreas} Áreas Verificadas
                </h3>
                <p className="text-white/90">
                  Base de datos actualizada de áreas en España, Portugal, Francia, Andorra, Argentina y más países en el mundo.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#0b3c74]/10 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                  <ArrowPathIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Planificador de Rutas
                </h3>
                <p className="text-gray-600">
                  Crea rutas personalizadas y descubre áreas cercanas a tu camino automáticamente.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#0b3c74]/10 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                  <StarIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Valoraciones Reales
                </h3>
                <p className="text-gray-600">
                  Opiniones y experiencias de otros viajeros para que tomes la mejor decisión.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#0b3c74]/10 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-xl flex items-center justify-center mb-6">
                  <GlobeAltIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  100% Gratis
                </h3>
                <p className="text-gray-600">
                  Toda la información es gratuita. Nuestro objetivo es ayudar a la comunidad viajera.
                </p>
              </div>
            </div>
          </section>

          {/* Parte de Furgocasa */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">
                Parte de Furgocasa
              </h2>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-[#0b3c74]/10 space-y-4">
              <p className="text-lg text-gray-700">
                Mapa Furgocasa es un proyecto de <strong><a href="https://www.furgocasa.com" target="_blank" rel="noopener noreferrer" className="text-[#0b3c74] hover:text-[#0d4a8f] underline">Furgocasa Campervans</a></strong>, 
                empresa líder en España en:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✅</span>
                  <span className="text-gray-700">Venta de furgonetas camperizadas nuevas y de ocasión</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✅</span>
                  <span className="text-gray-700">Alquiler de autocaravanas y furgonetas camper</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✅</span>
                  <span className="text-gray-700">Camperización profesional de furgonetas</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✅</span>
                  <span className="text-gray-700">Accesorios y equipamiento para campers</span>
                </div>
              </div>
              <p className="text-lg text-gray-700 pt-4">
                Con sede en España y alcance mundial, en Furgocasa conocemos cada detalle 
                del mundo del caravaning y queremos compartir nuestra experiencia con la comunidad.
              </p>
            </div>
          </section>

          {/* CTA Final */}
          <section>
            <div className="bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] rounded-2xl p-12 text-center shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Quieres saber más?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Ponte en contacto con nosotros o visita nuestra web principal
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0b3c74] text-lg font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg"
                >
                  <span>📧</span> Contactar
                </Link>
                <a
                  href="https://www.furgocasa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white text-lg font-bold rounded-xl border-2 border-white hover:bg-white/10 transition-all"
                >
                  <span>🌐</span> Visitar Furgocasa.com
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  )
}
