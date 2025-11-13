'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import {
  TruckIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface AnalisisMarcaModelo {
  marca: string
  modelo: string
  cantidad: number
  año_promedio: number
  km_promedio: number
  precio_compra_promedio: number
  valor_actual_promedio: number
  depreciacion_media: number
  coste_mantenimiento_anual: number
  coste_averias_total: number
  num_reportes_accidentes: number
}

interface DashboardMetricas {
  total_vehiculos: number
  vehiculos_mes_actual: number
  valor_total_parque: number
  total_reportes_accidentes: number
  reportes_pendientes: number
  datos_mercado_verificados: number
  datos_mercado_pendientes: number
  usuarios_con_vehiculos: number
  usuarios_compartiendo_datos: number
}

export default function AdminVehiculosPage() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null)
  const [analisis, setAnalisis] = useState<AnalisisMarcaModelo[]>([])
  const [ordenPor, setOrdenPor] = useState<'cantidad' | 'valor' | 'depreciacion'>('cantidad')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const checkAdminAndLoad = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }

    await Promise.all([
      loadMetricas(),
      loadAnalisis()
    ])

    setLoading(false)
  }

  const loadMetricas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_dashboard_metricas')

      if (error) {
        console.error('Error en RPC admin_dashboard_metricas:', error)
        setError(`Error cargando métricas: ${error.message}. Asegúrate de que las funciones SQL estén creadas en Supabase.`)
        throw error
      }

      console.log('Métricas cargadas:', data)

      if (data && data.length > 0) {
        setMetricas(data[0])
      }
    } catch (error: any) {
      console.error('Error cargando métricas:', error)
      setError(`Error: ${error.message || 'Error desconocido al cargar métricas'}`)
      // Establecer valores por defecto si hay error
      setMetricas({
        total_vehiculos: 0,
        vehiculos_mes_actual: 0,
        valor_total_parque: 0,
        total_reportes_accidentes: 0,
        reportes_pendientes: 0,
        datos_mercado_verificados: 0,
        datos_mercado_pendientes: 0,
        usuarios_con_vehiculos: 0,
        usuarios_compartiendo_datos: 0
      })
    }
  }

  const loadAnalisis = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_analisis_por_marca_modelo')

      if (error) {
        console.error('Error en RPC admin_analisis_por_marca_modelo:', error)
        throw error
      }

      console.log('Análisis cargado:', data)

      setAnalisis(data || [])
    } catch (error) {
      console.error('Error cargando análisis:', error)
      setAnalisis([])
    }
  }

  const analisisOrdenado = [...analisis].sort((a, b) => {
    switch (ordenPor) {
      case 'cantidad':
        return b.cantidad - a.cantidad
      case 'valor':
        return (b.valor_actual_promedio || 0) - (a.valor_actual_promedio || 0)
      case 'depreciacion':
        return (b.depreciacion_media || 0) - (a.depreciacion_media || 0)
      default:
        return 0
    }
  })

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 1
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver al Panel
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <TruckIcon className="w-10 h-10 text-cyan-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Gestión de Vehículos
            </h1>
          </div>
          <p className="text-gray-600">
            Análisis completo del parque de autocaravanas registradas
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error al cargar datos</h3>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  <strong>Solución:</strong> Ejecuta el archivo <code className="bg-red-100 px-2 py-1 rounded">reportes/12_funciones_admin.sql</code> en el Editor SQL de Supabase.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Clave */}
        {metricas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Vehículos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {metricas.total_vehiculos}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{metricas.vehiculos_mes_actual} este mes
                  </p>
                </div>
                <TruckIcon className="w-12 h-12 text-cyan-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Total Parque</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(metricas.valor_total_parque)}
                  </p>
                </div>
                <CurrencyEuroIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Datos de Mercado</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {metricas.datos_mercado_verificados}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {metricas.datos_mercado_pendientes} pendientes
                  </p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Usuarios Activos</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {metricas.usuarios_con_vehiculos}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {metricas.usuarios_compartiendo_datos} compartiendo datos
                  </p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros de Ordenación */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Ordenar por:</span>
            <button
              onClick={() => setOrdenPor('cantidad')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                ordenPor === 'cantidad'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cantidad
            </button>
            <button
              onClick={() => setOrdenPor('valor')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                ordenPor === 'valor'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Valor Actual
            </button>
            <button
              onClick={() => setOrdenPor('depreciacion')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                ordenPor === 'depreciacion'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Depreciación
            </button>
          </div>
        </div>

        {/* Tabla de Análisis */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca / Modelo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año Prom.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Km Prom.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Compra
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Actual
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depreciación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mant./Año
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accidentes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analisisOrdenado.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No hay datos de vehículos disponibles
                    </td>
                  </tr>
                ) : (
                  analisisOrdenado.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.marca}</div>
                            <div className="text-sm text-gray-500">{item.modelo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatNumber(item.año_promedio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatNumber(item.km_promedio)} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(item.precio_compra_promedio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                        {formatCurrency(item.valor_actual_promedio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.depreciacion_media !== null ? (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.depreciacion_media > 30
                              ? 'bg-red-100 text-red-800'
                              : item.depreciacion_media > 15
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {formatNumber(item.depreciacion_media)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(item.coste_mantenimiento_anual)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.num_reportes_accidentes > 0 ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {item.num_reportes_accidentes}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
