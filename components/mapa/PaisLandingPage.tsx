'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PaisSEO } from '@/config/paises-seo'
import { MapaInteractivo } from '@/components/mapa/MapaInteractivo'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { 
  MapPinIcon, 
  StarIcon,
  ClockIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import type { Area } from '@/types/database.types'

interface PaisLandingPageProps {
  pais: PaisSEO
}

export function PaisLandingPage({ pais }: PaisLandingPageProps) {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAreas, setTotalAreas] = useState(0)
  const [areaMejorValorada, setAreaMejorValorada] = useState<Area | null>(null)

  useEffect(() => {
    cargarAreas()
  }, [pais.nombre])

  const cargarAreas = async () => {
    try {
      const supabase = createClient()
      
      // Cargar áreas del país
      const { data, error, count } = await (supabase as any)
        .from('areas')
        .select('*', { count: 'exact' })
        .eq('pais', pais.nombre)
        .eq('activo', true)
        .order('valoracion_media', { ascending: false })
        .limit(1000)

      if (error) {
        console.error('Error cargando áreas:', error)
        return
      }

      setAreas(data || [])
      setTotalAreas(count || 0)
      
      // Área mejor valorada
      if (data && data.length > 0) {
        setAreaMejorValorada(data[0])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    if (areas.length === 0) return null

    const conValoracion = areas.filter(a => a.google_rating && a.google_rating > 0)
    const promedioValoracion = conValoracion.length > 0
      ? (conValoracion.reduce((sum, a) => sum + (a.google_rating || 0), 0) / conValoracion.length).toFixed(1)
      : 'N/A'

    const gratuitas = areas.filter(a => !a.precio_noche || a.precio_noche === 0).length
    const dePago = areas.filter(a => a.precio_noche && a.precio_noche > 0).length

    return {
      total: areas.length,
      promedioValoracion,
      gratuitas,
      dePago
    }
  }, [areas])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO - Específico del país */}
      <section className="relative bg-gradient-to-br from-[#0b3c74] via-[#0d4a8f] to-[#0b3c74] text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
              <Link href="/" className="hover:text-white transition">Inicio</Link>
              <span>/</span>
              <Link href="/mapa" className="hover:text-white transition">Mapa</Link>
              <span>/</span>
              <span className="text-white">{pais.nombre}</span>
            </nav>

            {/* Emoji del país */}
            <div className="text-7xl md:text-8xl mb-6 text-center">{pais.emoji}</div>

            {/* H1 Principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center">
              {pais.titulo}
            </h1>

            {/* Descripción principal */}
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed text-center max-w-4xl mx-auto">
              {pais.descripcion}
            </p>

            {/* Stats cards */}
            {!loading && estadisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                    {estadisticas.total}
                  </div>
                  <div className="text-sm text-white/80">Áreas</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-4xl md:text-5xl font-bold text-white">
                      {estadisticas.promedioValoracion}
                    </span>
                    <StarSolid className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-sm text-white/80">Valoración</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                    {estadisticas.gratuitas}
                  </div>
                  <div className="text-sm text-white/80">Gratuitas</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-6 border border-white/20">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                    {estadisticas.dePago}
                  </div>
                  <div className="text-sm text-white/80">De Pago</div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-10">
                <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto"></div>
                <p className="mt-4 text-white/70">Cargando estadísticas...</p>
              </div>
            )}

            {/* CTA */}
            <div className="text-center mt-10">
              <Link
                href="#mapa-interactivo"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0b3c74] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <MapPinIcon className="w-6 h-6 mr-2" />
                Ver Mapa Interactivo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAPA INTERACTIVO */}
      <section id="mapa-interactivo" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explora todas las áreas en {pais.nombre}
              </h2>
              <p className="text-xl text-gray-600">
                Mapa interactivo con ubicaciones verificadas, servicios y valoraciones reales
              </p>
            </div>

            {/* Mapa con altura fija */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
              <div style={{ height: '600px' }}>
                <MapaInteractivo 
                  areas={areas}
                  loading={loading}
                  paisFiltrado={pais.nombre}
                  centroInicial={{ lat: pais.lat, lng: pais.lng }}
                  zoomInicial={6}
                />
              </div>
            </div>

            {/* Enlace al mapa completo */}
            <div className="text-center mt-8">
              <Link
                href={`/mapa?pais=${encodeURIComponent(pais.nombre)}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#0b3c74] text-white rounded-lg font-semibold hover:bg-[#0d4a8f] transition"
              >
                Abrir Mapa Completo con Filtros
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONSEJOS Y REGULACIONES */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Consejos */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <SparklesIcon className="w-8 h-8 text-[#0b3c74]" />
                  Consejos para {pais.nombre}
                </h2>
                <ul className="space-y-4">
                  {pais.consejos.map((consejo, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#0b3c74] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{consejo}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Regulaciones */}
              {pais.regulaciones && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <ClockIcon className="w-8 h-8 text-[#0b3c74]" />
                    Regulaciones
                  </h2>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <p className="text-gray-800 leading-relaxed font-medium">
                      {pais.regulaciones}
                    </p>
                  </div>

                  {/* Área mejor valorada */}
                  {areaMejorValorada && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <StarSolid className="w-6 h-6 text-yellow-500" />
                        Área Mejor Valorada
                      </h3>
                      <Link 
                        href={`/area/${areaMejorValorada.slug}`}
                        className="block bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#0b3c74] hover:shadow-lg transition"
                      >
                        <h4 className="font-bold text-lg text-gray-900 mb-2">
                          {areaMejorValorada.nombre}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPinIcon className="w-4 h-4" />
                          {areaMejorValorada.ciudad}, {areaMejorValorada.provincia}
                        </div>
                        {areaMejorValorada.google_rating && (
                          <div className="flex items-center gap-1">
                            <StarSolid className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-gray-900">
                              {areaMejorValorada.google_rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              (Google Rating)
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KEYWORDS (oculto, solo para SEO) */}
      <div className="hidden">
        {pais.keywords.map(keyword => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>

      {/* CTA FINAL */}
      <section className="py-16 bg-gradient-to-br from-[#0b3c74] to-[#0d4a8f] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para tu aventura en {pais.nombre}?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Regístrate gratis y accede a funciones premium: guarda favoritos, crea rutas y valora áreas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0b3c74] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white rounded-xl font-bold text-lg border-2 border-white hover:bg-white/10 transition-all"
            >
              Explorar Todos los Países
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

