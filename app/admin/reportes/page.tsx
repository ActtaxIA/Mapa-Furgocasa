'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

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

interface ReporteAccidente {
  id: string
  vehiculo_matricula: string
  vehiculo_marca: string
  vehiculo_modelo: string
  propietario_nombre: string
  propietario_email: string
  testigo_nombre: string
  testigo_email: string
  testigo_telefono: string
  fecha_accidente: string
  ubicacion_lat: number
  ubicacion_lng: number
  ubicacion_descripcion: string
  descripcion: string
  tipo_dano: string
  leido: boolean
  cerrado: boolean
  created_at: string
}

export default function AdminReportesPage() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null)
  const [reportes, setReportes] = useState<ReporteAccidente[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'cerrados'>('todos')
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
      loadReportes()
    ])

    setLoading(false)
  }

  const loadMetricas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_dashboard_metricas')
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setMetricas(data[0])
      }
    } catch (error) {
      console.error('Error cargando métricas:', error)
    }
  }

  const loadReportes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_listado_reportes_accidentes')
      
      if (error) throw error
      
      setReportes(data || [])
    } catch (error) {
      console.error('Error cargando reportes:', error)
    }
  }

  const reportesFiltrados = reportes.filter(r => {
    if (filtro === 'pendientes') return !r.cerrado
    if (filtro === 'cerrados') return r.cerrado
    return true
  })

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
            <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Reportes de Accidentes
            </h1>
          </div>
          <p className="text-gray-600">
            Gestiona y analiza todos los reportes de accidentes del sistema
          </p>
        </div>

        {/* Métricas Clave */}
        {metricas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Reportes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {metricas.total_reportes_accidentes}
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {metricas.reportes_pendientes}
                  </p>
                </div>
                <CalendarIcon className="w-12 h-12 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vehículos Activos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {metricas.total_vehiculos}
                  </p>
                </div>
                <TruckIcon className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Usuarios con Vehículos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {metricas.usuarios_con_vehiculos}
                  </p>
                </div>
                <UserIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filtro === 'todos'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({reportes.length})
            </button>
            <button
              onClick={() => setFiltro('pendientes')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filtro === 'pendientes'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({reportes.filter(r => !r.cerrado).length})
            </button>
            <button
              onClick={() => setFiltro('cerrados')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filtro === 'cerrados'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cerrados ({reportes.filter(r => r.cerrado).length})
            </button>
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="space-y-6">
          {reportesFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay reportes en esta categoría</p>
            </div>
          ) : (
            reportesFiltrados.map((reporte) => (
              <div
                key={reporte.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  !reporte.leido ? 'border-l-4 border-orange-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className={`w-6 h-6 ${
                      reporte.cerrado ? 'text-gray-400' : 'text-red-600'
                    }`} />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {reporte.vehiculo_marca} {reporte.vehiculo_modelo} - {reporte.vehiculo_matricula}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Propietario: {reporte.propietario_nombre} ({reporte.propietario_email})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!reporte.leido && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        No leído
                      </span>
                    )}
                    {reporte.cerrado ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                        Cerrado
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Testigo:</p>
                    <p className="font-semibold">{reporte.testigo_nombre}</p>
                    <p className="text-gray-600">{reporte.testigo_email}</p>
                    {reporte.testigo_telefono && (
                      <p className="text-gray-600">{reporte.testigo_telefono}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 mb-1">Detalles del Accidente:</p>
                    <p className="font-semibold">Tipo: {reporte.tipo_dano}</p>
                    <p className="text-gray-600">
                      Fecha: {new Date(reporte.fecha_accidente).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Descripción:</p>
                  <p className="text-gray-800">{reporte.descripcion}</p>
                </div>

                {reporte.ubicacion_descripcion && (
                  <div className="mt-4 flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ubicación:</p>
                      <p className="text-gray-800">{reporte.ubicacion_descripcion}</p>
                      <a
                        href={`https://www.google.com/maps?q=${reporte.ubicacion_lat},${reporte.ubicacion_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-sm mt-1 inline-block"
                      >
                        Ver en Google Maps →
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                  Reportado el: {new Date(reporte.created_at).toLocaleString('es-ES')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

