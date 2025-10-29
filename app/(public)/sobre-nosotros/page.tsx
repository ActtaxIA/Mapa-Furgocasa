'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SobreNosotrosPage() {
  const [totalAreas, setTotalAreas] = useState(800) // valor por defecto

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-gray-600">
            Tu compañero de viaje en autocaravana por Europa
          </p>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          
          {/* Nuestra Historia */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚐 Nuestra Historia
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>Mapa Furgocasa</strong> nace de la pasión por viajar en autocaravana y la necesidad 
                de contar con información actualizada y confiable sobre áreas de pernocta en Europa.
              </p>
              <p>
                Somos una empresa del grupo <a href="https://www.furgocasa.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-semibold">Furgocasa</a>, 
                especializados en la venta, alquiler y camperización de furgonetas. Con años de experiencia 
                en el sector, conocemos de primera mano las necesidades de los viajeros en autocaravana.
              </p>
              <p>
                Decidimos crear esta plataforma para que todos los amantes del caravaning tengan acceso 
                a información completa, verificada y actualizada sobre áreas de autocaravanas en toda Europa.
              </p>
            </div>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Nuestra Misión */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎯 Nuestra Misión
            </h2>
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-r-lg">
              <p className="text-lg text-gray-800 leading-relaxed">
                Facilitar la experiencia de viajar en autocaravana proporcionando la plataforma más completa 
                y actualizada de áreas de pernocta en Europa, ayudando a miles de viajeros a planificar 
                sus rutas con confianza y libertad.
              </p>
            </div>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Qué Ofrecemos */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ✨ Qué Ofrecemos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-3">📍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  +{totalAreas} Áreas Verificadas
                </h3>
                <p className="text-gray-600">
                  Base de datos actualizada de áreas en España, Portugal, Francia, Andorra y más países europeos.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-3">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Planificador de Rutas
                </h3>
                <p className="text-gray-600">
                  Crea rutas personalizadas y descubre áreas cercanas a tu camino automáticamente.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Valoraciones Reales
                </h3>
                <p className="text-gray-600">
                  Opiniones y experiencias de otros viajeros para que tomes la mejor decisión.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  100% Gratis
                </h3>
                <p className="text-gray-600">
                  Toda la información es gratuita. Nuestro objetivo es ayudar a la comunidad viajera.
                </p>
              </div>
            </div>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Parte de Furgocasa */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🏢 Parte de Furgocasa
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Mapa Furgocasa es un proyecto de <strong><a href="https://www.furgocasa.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Furgocasa Campervans</a></strong>, 
                empresa líder en España en:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>✅ Venta de furgonetas camperizadas nuevas y de ocasión</li>
                <li>✅ Alquiler de autocaravanas y furgonetas camper</li>
                <li>✅ Camperización profesional de furgonetas</li>
                <li>✅ Accesorios y equipamiento para campers</li>
              </ul>
              <p>
                Con sede en España y presencia en toda Europa, en Furgocasa conocemos cada detalle 
                del mundo del caravaning y queremos compartir nuestra experiencia con la comunidad.
              </p>
            </div>
          </section>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Contacto CTA */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Quieres saber más?
            </h2>
            <p className="text-gray-600 mb-6">
              Ponte en contacto con nosotros o visita nuestra web principal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                📧 Contactar
              </Link>
              <a
                href="https://www.furgocasa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
              >
                🌐 Visitar Furgocasa.com
              </a>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

