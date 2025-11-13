'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReporteCompletoUsuario } from '@/types/reportes.types'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Props {
  userId: string
  onReporteUpdate?: () => void
}

export function MisReportesTab({ userId, onReporteUpdate }: Props) {
  const [reportes, setReportes] = useState<ReporteCompletoUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadReportes()
  }, [userId])

  const loadReportes = async () => {
    try {
      const response = await fetch('/api/reportes')
      const data = await response.json()

      if (response.ok) {
        setReportes(data.reportes || [])
      } else {
        console.error('Error cargando reportes:', data.error)
      }
    } catch (error) {
      console.error('Error cargando reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarLeido = async (reporteId: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/reportes/${reporteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leido: true })
      })

      if (response.ok) {
        loadReportes()
        // Llamar al callback para actualizar contadores en la página padre
        if (onReporteUpdate) onReporteUpdate()
      } else {
        const data = await response.json()
        console.error('Error marcando como leído:', data.error)
      }
    } catch (error) {
      console.error('Error marcando como leído:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCerrarReporte = async (reporteId: string) => {
    if (!confirm('¿Marcar este reporte como resuelto/cerrado?')) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/reportes/${reporteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cerrado: true, leido: true })
      })

      if (response.ok) {
        loadReportes()
        // Llamar al callback para actualizar contadores en la página padre
        if (onReporteUpdate) onReporteUpdate()
      } else {
        const data = await response.json()
        console.error('Error cerrando reporte:', data.error)
      }
    } catch (error) {
      console.error('Error cerrando reporte:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getTipoDanoColor = (tipo?: string) => {
    switch (tipo) {
      case 'Choque': return 'bg-red-100 text-red-800'
      case 'Rotura': return 'bg-red-100 text-red-800'
      case 'Abolladura': return 'bg-orange-100 text-orange-800'
      case 'Rayón': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (reportes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes reportes de accidentes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Cuando alguien reporte un accidente usando tu código QR, aparecerá aquí
        </p>
      </div>
    )
  }

  const reportesNoLeidos = reportes.filter(r => !r.leido).length
  const reportesPendientes = reportes.filter(r => !r.cerrado).length

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-primary-500">
          <div className="text-sm font-medium text-gray-600">Total Reportes</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{reportes.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <div className="text-sm font-medium text-gray-600">No Leídos</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{reportesNoLeidos}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-600">Pendientes</div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">{reportesPendientes}</div>
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {reportes.map((reporte) => (
          <div
            key={reporte.id}
            className={`bg-white rounded-xl shadow border-2 transition-shadow hover:shadow-lg ${
              !reporte.leido ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className={`h-6 w-6 ${
                      reporte.cerrado ? 'text-green-500' : !reporte.leido ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Reporte de Accidente - {reporte.vehiculo_matricula}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reporte.vehiculo_marca && `${reporte.vehiculo_marca} `}
                        {reporte.vehiculo_modelo && reporte.vehiculo_modelo}
                      </p>
                    </div>
                  </div>

                  {/* Tipo de daño */}
                  {reporte.tipo_dano && (
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTipoDanoColor(reporte.tipo_dano)}`}>
                        {reporte.tipo_dano}
                      </span>
                    </div>
                  )}

                  {/* Descripción */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900">Descripción del Accidente:</h4>
                    <p className="mt-1 text-sm text-gray-700">{reporte.descripcion}</p>
                  </div>

                  {/* Información del tercero */}
                  {reporte.matricula_tercero && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900">Vehículo Causante:</h4>
                      <p className="mt-1 text-sm">
                        <strong>Matrícula:</strong> {reporte.matricula_tercero}
                      </p>
                      {reporte.descripcion_tercero && (
                        <p className="mt-1 text-sm">{reporte.descripcion_tercero}</p>
                      )}
                    </div>
                  )}

                  {/* Información del testigo */}
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Datos del Testigo:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nombre:</strong> {reporte.testigo_nombre}</p>
                      {reporte.testigo_email && (
                        <p className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          <a href={`mailto:${reporte.testigo_email}`} className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                            {reporte.testigo_email}
                          </a>
                        </p>
                      )}
                      {reporte.testigo_telefono && (
                        <p className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          <a href={`tel:${reporte.testigo_telefono}`} className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                            {reporte.testigo_telefono}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ubicación y fecha */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Ubicación:</p>
                        <p className="text-gray-600">
                          {reporte.ubicacion_direccion || `${reporte.ubicacion_lat}, ${reporte.ubicacion_lng}`}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${reporte.ubicacion_lat},${reporte.ubicacion_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline text-xs transition-colors"
                        >
                          Ver en Google Maps
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Fecha del Accidente:</p>
                        <p className="text-gray-600">
                          {new Date(reporte.fecha_accidente).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fotos */}
                  {reporte.fotos_urls && reporte.fotos_urls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Fotos del Accidente:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {reporte.fotos_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-24 object-cover rounded border hover:opacity-75"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estados */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!reporte.leido && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        No Leído
                      </span>
                    )}
                    {reporte.leido && !reporte.cerrado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                    {reporte.cerrado && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Cerrado
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Reportado: {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {!reporte.cerrado && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {!reporte.leido && (
                    <button
                      onClick={() => handleMarcarLeido(reporte.id)}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Marcar como Leído
                    </button>
                  )}
                  <button
                    onClick={() => handleCerrarReporte(reporte.id)}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Cerrar Reporte
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
