'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Comparable {
  titulo: string
  precio: number | null
  kilometros: number | null
  año: number | null
  url: string
  fuente: string
  descripcion?: string
  relevancia: number
}

interface InformeValoracion {
  id: string
  vehiculo_id: string
  user_id: string
  fecha_valoracion: string
  precio_salida: number | null
  precio_objetivo: number | null
  precio_minimo: number | null
  informe_texto: string
  informe_html: string | null
  comparables_json: Comparable[]
  num_comparables: number
  nivel_confianza: string
  precio_base_mercado: number | null
  depreciacion_aplicada: number | null
}

interface Props {
  informe: InformeValoracion
  vehiculoMarca?: string
  vehiculoModelo?: string
  onDescargarPDF?: () => void
  todasLasValoraciones?: InformeValoracion[] // Histórico completo
  onValoracionEliminada?: () => void // Callback para refrescar la lista
}

export default function InformeValoracionIA({
  informe,
  vehiculoMarca = 'Vehículo',
  vehiculoModelo = '',
  onDescargarPDF,
  todasLasValoraciones = [],
  onValoracionEliminada
}: Props) {
  const [mostrarComparables, setMostrarComparables] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState<'informe' | 'comparables' | 'datos' | 'historico'>('informe')
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearPrecio = (precio: number | null) => {
    if (!precio) return 'No disponible'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  const handleEliminarValoracion = async (valoracionId: string) => {
    // Verificar si es la valoración más reciente (actual)
    const valoracionesOrdenadas = [...todasLasValoraciones].sort(
      (a, b) => new Date(b.fecha_valoracion).getTime() - new Date(a.fecha_valoracion).getTime()
    )
    const valoracionMasReciente = valoracionesOrdenadas[0]

    if (valoracionId === valoracionMasReciente?.id) {
      // Es la valoración actual, mostrar mensaje informativo
      alert(
        '⚠️ No es posible borrar la valoración actual.\n\n' +
        'Para eliminar esta valoración, primero debe generar una nueva valoración. ' +
        'Una vez creada la nueva, podrá eliminar esta.'
      )
      setConfirmDelete(null)
      return
    }

    try {
      setEliminando(valoracionId)

      const response = await fetch(
        `/api/vehiculos/${informe.vehiculo_id}/ia-valoracion?valoracion_id=${valoracionId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        let errorMsg = 'Error al eliminar la valoración'
        try {
          const errorData = await response.json()
          errorMsg = errorData.error || errorData.detalle || errorMsg
        } catch (e) {
          // Si no se puede parsear JSON, usar mensaje por defecto
          errorMsg = `Error ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMsg)
      }

      // Cerrar confirmación y notificar al padre
      setConfirmDelete(null)
      if (onValoracionEliminada) {
        onValoracionEliminada()
      }

    } catch (error: any) {
      console.error('Error eliminando valoración:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setEliminando(null)
    }
  }

  const getNivelConfianzaColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'alta':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'baja':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              🤖 Informe de Valoración con IA
            </h2>
            <p className="text-blue-100">
              {vehiculoMarca} {vehiculoModelo}
            </p>
            <p className="text-sm text-blue-200 mt-1">
              Generado el {formatearFecha(informe.fecha_valoracion)}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getNivelConfianzaColor(informe.nivel_confianza)}`}>
            Confianza: {informe.nivel_confianza}
          </div>
        </div>
      </div>

      {/* Precios Destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
        {/* Precio de Salida */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚀</span>
            <h3 className="text-sm font-semibold text-gray-700">Precio de Salida</h3>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {formatearPrecio(informe.precio_salida)}
          </p>
          <p className="text-xs text-gray-600 mt-1">Precio inicial para negociación</p>
        </div>

        {/* Precio Objetivo */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-300 shadow-md ring-2 ring-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h3 className="text-sm font-semibold text-gray-700">Precio Objetivo</h3>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {formatearPrecio(informe.precio_objetivo)}
          </p>
          <p className="text-xs text-gray-600 mt-1">Precio realista de venta</p>
        </div>

        {/* Precio Mínimo */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-sm font-semibold text-gray-700">Precio Mínimo</h3>
          </div>
          <p className="text-3xl font-bold text-orange-700">
            {formatearPrecio(informe.precio_minimo)}
          </p>
          <p className="text-xs text-gray-600 mt-1">Límite aceptable</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white overflow-x-auto">
        <div className="flex gap-1 px-4 md:px-6 min-w-max">
          <button
            onClick={() => setSeccionActiva('informe')}
            className={`px-3 md:px-4 py-3 font-semibold text-xs md:text-sm transition-all whitespace-nowrap ${
              seccionActiva === 'informe'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 Informe Completo
          </button>
          <button
            onClick={() => setSeccionActiva('comparables')}
            className={`px-3 md:px-4 py-3 font-semibold text-xs md:text-sm transition-all whitespace-nowrap ${
              seccionActiva === 'comparables'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔍 Comparables ({informe.num_comparables})
          </button>
          <button
            onClick={() => setSeccionActiva('datos')}
            className={`px-3 md:px-4 py-3 font-semibold text-xs md:text-sm transition-all whitespace-nowrap ${
              seccionActiva === 'datos'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Datos Técnicos
          </button>
          <button
            onClick={() => setSeccionActiva('historico')}
            className={`px-3 md:px-4 py-3 font-semibold text-xs md:text-sm transition-all whitespace-nowrap ${
              seccionActiva === 'historico'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 Histórico ({todasLasValoraciones.length})
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Tab: Informe Completo */}
        {seccionActiva === 'informe' && (
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-blue-200">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900">
                    {children}
                  </strong>
                )
              }}
            >
              {informe.informe_texto}
            </ReactMarkdown>
          </div>
        )}

        {/* Tab: Comparables */}
        {seccionActiva === 'comparables' && (
          <div>
            {informe.comparables_json && informe.comparables_json.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📊 Análisis del Mercado
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Comparables encontrados:</span>
                      <span className="font-bold text-gray-900 ml-2">{informe.num_comparables}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio promedio mercado:</span>
                      <span className="font-bold text-gray-900 ml-2">
                        {formatearPrecio(informe.precio_base_mercado)}
                      </span>
                    </div>
                  </div>
                </div>

                {informe.comparables_json.map((comp: any, index: any) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1 pr-4">
                        {index + 1}. {comp.titulo}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        comp.relevancia >= 80 ? 'bg-green-100 text-green-800' :
                        comp.relevancia >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        comp.relevancia >= 40 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {comp.relevancia ? `${comp.relevancia}% relevancia` : 'Relevancia no calculada'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Precio:</span>
                        <p className="font-bold text-green-600">
                          {comp.precio ? formatearPrecio(comp.precio) : 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Año:</span>
                        <p className="font-semibold text-gray-900">
                          {comp.año || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Kilómetros:</span>
                        <p className="font-semibold text-gray-900">
                          {comp.kilometros ? comp.kilometros.toLocaleString('es-ES') + ' km' : 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Fuente:</span>
                        <p className="font-semibold text-blue-600">
                          {comp.fuente}
                        </p>
                      </div>
                    </div>

                    {comp.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {comp.descripcion}
                      </p>
                    )}

                    <a
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver anuncio completo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                <div className="max-w-md mx-auto">
                  <svg className="w-20 h-20 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay comparables disponibles
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Esta valoración se generó sin acceso a datos del mercado en tiempo real.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200 text-left">
                    <p className="text-xs font-semibold text-blue-900 mb-2">ℹ️ ¿Por qué no hay comparables?</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• El servicio de búsqueda de mercado puede estar temporalmente no disponible</li>
                      <li>• La valoración se basó únicamente en datos internos del vehículo</li>
                      <li>• Los precios son estimados usando modelos de IA sin comparación directa</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    💡 La valoración es válida pero tiene un nivel de confianza "{informe.nivel_confianza}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Datos Técnicos */}
        {seccionActiva === 'datos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Métrica: Variación de Valor (Revalorización o Depreciación) */}
              {informe.depreciacion_aplicada !== null ? (
                <div className={`bg-gradient-to-br rounded-lg p-4 border-2 ${
                  informe.depreciacion_aplicada >= 0
                    ? 'from-green-50 to-emerald-50 border-green-300'
                    : 'from-red-50 to-orange-50 border-red-300'
                }`}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {informe.depreciacion_aplicada >= 0 ? '📈 Revalorización' : '📉 Depreciación'}
                  </h4>
                  <p className={`text-3xl font-bold ${
                    informe.depreciacion_aplicada >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {informe.depreciacion_aplicada >= 0 ? '+' : ''}{informe.depreciacion_aplicada.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Desde precio de compra hasta valor actual
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    📊 Variación de Valor
                  </h4>
                  <p className="text-lg font-semibold text-gray-400">
                    No disponible
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Añade el precio de compra en "Datos de Compra"
                  </p>
                </div>
              )}

              {/* Métrica: Precio Base Mercado */}
              {informe.precio_base_mercado && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    💰 Precio Promedio Mercado
                  </h4>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatearPrecio(informe.precio_base_mercado)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Según {informe.num_comparables} anuncios
                  </p>
                </div>
              )}

              {/* Métrica: Nivel de Confianza */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  🎯 Nivel de Confianza
                </h4>
                <p className="text-3xl font-bold text-blue-600">
                  {informe.nivel_confianza}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Basado en {informe.num_comparables} comparables
                </p>
              </div>

              {/* Métrica: ID Valoración */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  🔑 ID de Valoración
                </h4>
                <p className="text-sm font-mono text-gray-600 break-all">
                  {informe.id}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Referencia única del informe
                </p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                Sobre esta valoración
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Esta valoración fue generada automáticamente por IA utilizando datos reales del mercado</li>
                <li>• Los precios pueden variar según el estado real del vehículo y la demanda actual</li>
                <li>• Se recomienda actualizar la valoración cada 3-6 meses</li>
                <li>• El precio objetivo es el más realista para una venta exitosa</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab: Histórico */}
        {seccionActiva === 'historico' && (
          <div>
            {todasLasValoraciones.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    📅 Evolución de Valoraciones
                  </h3>
                  <p className="text-sm text-blue-800">
                    Historial de {todasLasValoraciones.length} valoración(es) generada(s) para este vehículo.
                    Consulta la evolución de precios a lo largo del tiempo.
                  </p>
                </div>

                {/* Línea de tiempo */}
                <div className="relative">
                  {/* Línea vertical */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-300"></div>

                  {todasLasValoraciones.map((val: any, index: any) => {
                    const esMasReciente = val.id === informe.id
                    return (
                      <div key={val.id} className="relative pl-20 pb-8">
                        {/* Círculo indicador */}
                        <div className={`absolute left-5 w-6 h-6 rounded-full border-4 ${
                          esMasReciente
                            ? 'bg-blue-600 border-blue-200 ring-4 ring-blue-100'
                            : 'bg-white border-gray-300'
                        }`}>
                          {esMasReciente && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>

                        {/* Contenido */}
                        <div className={`rounded-lg border-2 p-4 ${
                          esMasReciente
                            ? 'bg-blue-50 border-blue-400 shadow-md'
                            : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Valoración #{todasLasValoraciones.length - index}
                                {esMasReciente && (
                                  <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                    Actual
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatearFecha(val.fecha_valoracion)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getNivelConfianzaColor(val.nivel_confianza)}`}>
                                {val.nivel_confianza}
                              </span>
                              {!esMasReciente && (
                                <button
                                  onClick={() => setConfirmDelete(val.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Eliminar valoración"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                              {esMasReciente && (
                                <div className="p-1 text-gray-400" title="No se puede eliminar la valoración actual. Genera una nueva para poder eliminar esta.">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-green-50 rounded p-2">
                              <span className="text-gray-600 text-xs">Precio Salida</span>
                              <p className="font-bold text-green-700">
                                {formatearPrecio(val.precio_salida)}
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded p-2">
                              <span className="text-gray-600 text-xs">Precio Objetivo</span>
                              <p className="font-bold text-blue-700">
                                {formatearPrecio(val.precio_objetivo)}
                              </p>
                            </div>
                            <div className="bg-orange-50 rounded p-2">
                              <span className="text-gray-600 text-xs">Precio Mínimo</span>
                              <p className="font-bold text-orange-700">
                                {formatearPrecio(val.precio_minimo)}
                              </p>
                            </div>
                          </div>

                          {val.num_comparables > 0 && (
                            <div className="mt-3 text-xs text-gray-600">
                              📊 {val.num_comparables} comparables •
                              {val.precio_base_mercado && ` Mercado: ${formatearPrecio(val.precio_base_mercado)}`}
                              {val.depreciacion_aplicada !== null && (
                                <span className={val.depreciacion_aplicada >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                  {` • ${val.depreciacion_aplicada >= 0 ? 'Revalorización' : 'Depreciación'}: ${val.depreciacion_aplicada >= 0 ? '+' : ''}${val.depreciacion_aplicada.toFixed(1)}%`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Esta es la primera valoración de este vehículo
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Descarga un informe completo en PDF con fotos y detalles del vehículo
        </p>
        {onDescargarPDF && (
          <button
            onClick={onDescargarPDF}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            📄 Descargar Valoración en PDF
          </button>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  ¿Eliminar valoración?
                </h3>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. La valoración será eliminada permanentemente del historial.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={eliminando !== null}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminarValoracion(confirmDelete)}
                disabled={eliminando !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminando === confirmDelete ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
