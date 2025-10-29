'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import type { Area } from '@/types/database.types'
import { 
  MapPinIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalAreas: number
  totalUsers: number
  totalPaises: number
  totalComunidades: number
  areasPorPais: { pais: string; count: number; porcentaje: number }[]
  areasPorComunidad: { comunidad: string; pais: string; count: number }[]
  areasPorProvincia: { provincia: string; count: number }[]
  areasGratis: number
  areasDePago: number
  areasVerificadas: number
  areasConDescripcion: number
  areasConImagenes: number
  areasConServicios: { servicio: string; count: number }[]
  top10AreasPopulares: any[]
  promedioRating: number
  distribucionPrecios: { rango: string; count: number }[]
  crecimientoMensual: { mes: string; nuevas: number }[]
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadAnalytics()
  }, [])

  const checkAdminAndLoadAnalytics = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }

    loadAnalytics()
  }

  const loadAnalytics = async () => {
    try {
      const supabase = createClient()
      
      // Obtener todas las áreas (con paginación)
      const allAreas: Area[] = []
      const pageSize = 1000
      let page = 0
      let hasMore = true

      console.log('📦 Cargando todas las áreas para analytics (con paginación)...')

      while (hasMore) {
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allAreas.push(...data)
          console.log(`   ✓ Página ${page + 1}: ${data.length} áreas cargadas`)
          page++
          if (data.length < pageSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      console.log(`✅ Total cargadas: ${allAreas.length} áreas`)
      const areas = allAreas

      // ========== ESTADÍSTICAS POR PAÍS ==========
      const areasPorPais = areas?.reduce((acc: any, area) => {
        const pais = area.pais || 'Sin país'
        acc[pais] = (acc[pais] || 0) + 1
        return acc
      }, {})

      const totalPaises = Object.keys(areasPorPais).length
      const areasPorPaisArray = Object.entries(areasPorPais || {})
        .map(([pais, count]) => ({ 
          pais, 
          count: count as number,
          porcentaje: ((count as number) / areas.length) * 100
        }))
        .sort((a, b) => b.count - a.count)

      // ========== ESTADÍSTICAS POR COMUNIDAD/REGIÓN ==========
      const areasPorComunidad = areas?.reduce((acc: any, area) => {
        if (area.comunidad_autonoma) {
          const key = `${area.comunidad_autonoma}|${area.pais}`
          acc[key] = (acc[key] || 0) + 1
        }
        return acc
      }, {})

      const totalComunidades = Object.keys(areasPorComunidad).length
      const areasPorComunidadArray = Object.entries(areasPorComunidad || {})
        .map(([key, count]) => {
          const [comunidad, pais] = key.split('|')
          return { comunidad, pais, count: count as number }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)

      // ========== ESTADÍSTICAS POR PROVINCIA ==========
      const areasPorProvincia = areas?.reduce((acc: any, area) => {
        const provincia = area.provincia || 'Sin provincia'
        acc[provincia] = (acc[provincia] || 0) + 1
        return acc
      }, {})

      // ========== SERVICIOS MÁS COMUNES ==========
      const serviciosCount: any = {}
      areas?.forEach(area => {
        if (area.servicios && typeof area.servicios === 'object') {
          Object.entries(area.servicios).forEach(([key, value]) => {
            if (value === true) {
              serviciosCount[key] = (serviciosCount[key] || 0) + 1
            }
          })
        }
      })

      // ========== DISTRIBUCIÓN DE PRECIOS ==========
      const distribucionPrecios = {
        gratis: 0,
        bajo: 0, // 1-10€
        medio: 0, // 11-20€
        alto: 0  // 21+€
      }

      areas?.forEach(area => {
        if (area.precio_noche === 0 || area.precio_noche === null) {
          distribucionPrecios.gratis++
        } else if (area.precio_noche <= 10) {
          distribucionPrecios.bajo++
        } else if (area.precio_noche <= 20) {
          distribucionPrecios.medio++
        } else {
          distribucionPrecios.alto++
        }
      })

      // ========== TOP 10 ÁREAS CON MEJOR RATING ==========
      const areasConRating = areas?.filter(a => a.google_rating !== null) || []
      const top10 = areasConRating
        .sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0))
        .slice(0, 10)

      // Promedio de rating
      const sumRatings = areasConRating.reduce((sum, a) => sum + (a.google_rating || 0), 0)
      const promedioRating = areasConRating.length > 0 ? sumRatings / areasConRating.length : 0

      // ========== ÁREAS CON DESCRIPCIÓN E IMÁGENES ==========
      const DESCRIPCION_MIN_LENGTH = 200
      const PLACEHOLDER_TEXT = 'Área encontrada mediante búsqueda en Google Maps'
      
      const areasConDescripcion = areas?.filter(a => 
        a.descripcion && 
        a.descripcion.length >= DESCRIPCION_MIN_LENGTH && 
        !a.descripcion.includes(PLACEHOLDER_TEXT)
      ).length || 0

      const areasConImagenes = areas?.filter(a => 
        a.foto_principal || (a.fotos_urls && Array.isArray(a.fotos_urls) && a.fotos_urls.length > 0)
      ).length || 0

      // ========== CRECIMIENTO MENSUAL (últimos 6 meses) ==========
      const ahora = new Date()
      const mesesAtras = 6
      const crecimientoMensual = []
      
      for (let i = mesesAtras - 1; i >= 0; i--) {
        const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const mesNombre = fechaMes.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        
        const nuevasAreasMes = areas?.filter(a => {
          if (!a.created_at) return false
          const fechaCreacion = new Date(a.created_at)
          return fechaCreacion.getFullYear() === fechaMes.getFullYear() &&
                 fechaCreacion.getMonth() === fechaMes.getMonth()
        }).length || 0
        
        crecimientoMensual.push({ mes: mesNombre, nuevas: nuevasAreasMes })
      }

      setAnalytics({
        totalAreas: areas?.length || 0,
        totalUsers: 382,
        totalPaises,
        totalComunidades,
        areasPorPais: areasPorPaisArray,
        areasPorComunidad: areasPorComunidadArray,
        areasPorProvincia: Object.entries(areasPorProvincia || {})
          .map(([provincia, count]) => ({ provincia, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        areasGratis: distribucionPrecios.gratis,
        areasDePago: distribucionPrecios.bajo + distribucionPrecios.medio + distribucionPrecios.alto,
        areasVerificadas: areas?.filter(a => a.verificado).length || 0,
        areasConDescripcion,
        areasConImagenes,
        areasConServicios: Object.entries(serviciosCount)
          .map(([servicio, count]) => ({ servicio, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 7),
        top10AreasPopulares: top10,
        promedioRating,
        distribucionPrecios: [
          { rango: 'Gratis', count: distribucionPrecios.gratis },
          { rango: '1-10€', count: distribucionPrecios.bajo },
          { rango: '11-20€', count: distribucionPrecios.medio },
          { rango: '21€+', count: distribucionPrecios.alto },
        ],
        crecimientoMensual
      })

    } catch (error) {
      console.error('Error cargando analíticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Cargando analíticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const getServicioLabel = (servicio: string) => {
    const labels: Record<string, string> = {
      agua: 'Agua',
      electricidad: 'Electricidad',
      vaciado_aguas_negras: 'Vaciado Químico',
      vaciado_aguas_grises: 'Vaciado Aguas Grises',
      wifi: 'WiFi',
      duchas: 'Duchas',
      wc: 'WC',
      lavanderia: 'Lavandería',
      restaurante: 'Restaurante',
      supermercado: 'Supermercado',
      zona_mascotas: 'Zona Mascotas'
    }
    return labels[servicio] || servicio
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-sky-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analíticas y Estadísticas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Información detallada sobre áreas, usuarios y actividad
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Áreas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalAreas.toLocaleString()}</p>
                <p className="text-sm text-sky-600 mt-2">
                  {analytics.totalPaises} países · {analytics.totalComunidades} regiones
                </p>
              </div>
              <div className="p-3 bg-sky-100 rounded-lg">
                <MapPinIcon className="w-8 h-8 text-sky-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Usuarios</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalUsers}</p>
                <p className="text-sm text-gray-500 mt-2">Registrados activos</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contenido Enriquecido</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {((analytics.areasConDescripcion / analytics.totalAreas) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {analytics.areasConDescripcion.toLocaleString()} con descripción IA
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rating Promedio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.promedioRating.toFixed(1)}</p>
                <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                  <StarIcon className="w-4 h-4 fill-current" />
                  Google Reviews
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <StarIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Secundarios - Estado de las Áreas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <p className="text-sm font-medium text-green-700">✓ Verificadas</p>
            <p className="text-2xl font-bold text-green-900 mt-2">{analytics.areasVerificadas.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">
              {((analytics.areasVerificadas / analytics.totalAreas) * 100).toFixed(1)}% del total
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <p className="text-sm font-medium text-blue-700">📝 Con Descripción IA</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{analytics.areasConDescripcion.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">
              {((analytics.areasConDescripcion / analytics.totalAreas) * 100).toFixed(1)}% completado
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
            <p className="text-sm font-medium text-pink-700">📸 Con Imágenes</p>
            <p className="text-2xl font-bold text-pink-900 mt-2">{analytics.areasConImagenes.toLocaleString()}</p>
            <p className="text-xs text-pink-600 mt-1">
              {((analytics.areasConImagenes / analytics.totalAreas) * 100).toFixed(1)}% con foto
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <p className="text-sm font-medium text-amber-700">💰 Áreas Gratis</p>
            <p className="text-2xl font-bold text-amber-900 mt-2">{analytics.areasGratis.toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-1">
              {((analytics.areasGratis / analytics.totalAreas) * 100).toFixed(1)}% gratuitas
            </p>
          </div>
        </div>

        {/* Distribución por País */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🌍 Distribución Global por País</h3>
            <p className="text-sm text-gray-500">{analytics.totalPaises} países con áreas registradas</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.areasPorPais.slice(0, 10).map((item, index) => (
                <div key={item.pais} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200">
                  <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-full text-lg font-bold shadow-md">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-semibold text-gray-900">{item.pais}</span>
                      <span className="text-lg font-bold text-sky-600">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-sky-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.porcentaje}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.porcentaje.toFixed(1)}% del total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 15 Comunidades/Regiones */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🗺️ Top 15 Comunidades/Regiones</h3>
            <p className="text-sm text-gray-500">Regiones con más áreas registradas</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.areasPorComunidad.map((item, index) => (
                <div key={`${item.comunidad}-${item.pais}`} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.comunidad}</p>
                      <p className="text-xs text-gray-500">{item.pais}</p>
                      <p className="text-lg font-bold text-purple-600 mt-1">{item.count.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 Provincias */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Provincias</h3>
            <p className="text-sm text-gray-500">Áreas por provincia</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.areasPorProvincia.map((item, index) => (
                <div key={item.provincia}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {index + 1}. {item.provincia}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / analytics.totalAreas) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Servicios Más Comunes */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Servicios Más Comunes</h3>
              <p className="text-sm text-gray-500">Top 7 servicios disponibles</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics.areasConServicios.map((item, index) => (
                  <div key={item.servicio} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-sky-100 text-sky-600 rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {getServicioLabel(item.servicio)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">
                        {((item.count / analytics.totalAreas) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribución de Precios */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Distribución de Precios</h3>
              <p className="text-sm text-gray-500">Rangos de precio por noche</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {analytics.distribucionPrecios.map((item) => (
                  <div key={item.rango} className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-4 border border-sky-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">{item.rango}</p>
                    <p className="text-3xl font-bold text-sky-600">{item.count}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((item.count / analytics.totalAreas) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Áreas Gratis</span>
                  <span className="text-2xl font-bold text-green-600">{analytics.areasGratis}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-gray-700">Áreas de Pago</span>
                  <span className="text-2xl font-bold text-sky-600">{analytics.areasDePago}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Áreas Mejor Valoradas */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">⭐ Top 10 Áreas Mejor Valoradas</h3>
            <p className="text-sm text-gray-500">Según Google Reviews</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.top10AreasPopulares.map((area, index) => (
                <div key={area.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <span className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full text-lg font-bold">
                    {index + 1}
                  </span>
                  {area.foto_principal && (
                    <img 
                      src={area.foto_principal} 
                      alt={area.nombre}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{area.nombre}</h4>
                    <p className="text-sm text-gray-500">{area.ciudad || area.provincia}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900">{area.google_rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crecimiento Mensual */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">📈 Crecimiento Mensual</h3>
            <p className="text-sm text-gray-500">Nuevas áreas añadidas en los últimos 6 meses</p>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between gap-4 h-64">
              {analytics.crecimientoMensual.map((mes, index) => {
                const maxNuevas = Math.max(...analytics.crecimientoMensual.map(m => m.nuevas))
                const alturaPorcentaje = maxNuevas > 0 ? (mes.nuevas / maxNuevas) * 100 : 0
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-center mb-2">
                      <p className="text-lg font-bold text-sky-600">{mes.nuevas}</p>
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg transition-all hover:from-sky-600 hover:to-sky-500"
                      style={{ height: `${Math.max(alturaPorcentaje, 5)}%` }}
                    />
                    <p className="text-xs font-medium text-gray-600 mt-2">{mes.mes}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Total últimos 6 meses: <span className="font-bold text-gray-900">
                  {analytics.crecimientoMensual.reduce((sum, m) => sum + m.nuevas, 0).toLocaleString()}
                </span> nuevas áreas
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

