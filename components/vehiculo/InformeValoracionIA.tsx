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
  onPonerEnVenta?: (precio: number) => void
}

export default function InformeValoracionIA({ 
  informe, 
  vehiculoMarca = 'Vehículo',
  vehiculoModelo = '',
  onPonerEnVenta 
}: Props) {
  const [mostrarComparables, setMostrarComparables] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState<'informe' | 'comparables' | 'datos'>('informe')

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
      <div className="border-b border-gray-200 bg-white">
        <div className="flex gap-1 px-6">
          <button
            onClick={() => setSeccionActiva('informe')}
            className={`px-4 py-3 font-semibold text-sm transition-all ${
              seccionActiva === 'informe'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 Informe Completo
          </button>
          <button
            onClick={() => setSeccionActiva('comparables')}
            className={`px-4 py-3 font-semibold text-sm transition-all ${
              seccionActiva === 'comparables'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔍 Comparables ({informe.num_comparables})
          </button>
          <button
            onClick={() => setSeccionActiva('datos')}
            className={`px-4 py-3 font-semibold text-sm transition-all ${
              seccionActiva === 'datos'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Datos Técnicos
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

                {informe.comparables_json.map((comp, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1 pr-4">
                        {index + 1}. {comp.titulo}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        comp.relevancia >= 0.8 ? 'bg-green-100 text-green-800' :
                        comp.relevancia >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(comp.relevancia * 100).toFixed(0)}% relevancia
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
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No se encontraron comparables en esta valoración
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Datos Técnicos */}
        {seccionActiva === 'datos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Métrica: Depreciación */}
              {informe.depreciacion_aplicada !== null && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    📉 Depreciación Aplicada
                  </h4>
                  <p className="text-3xl font-bold text-red-600">
                    {informe.depreciacion_aplicada.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Pérdida de valor desde compra
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
      </div>

      {/* Footer con acciones */}
      {onPonerEnVenta && informe.precio_objetivo && (
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            ¿Quieres poner tu vehículo en venta con el precio recomendado?
          </p>
          <button
            onClick={() => onPonerEnVenta(informe.precio_objetivo!)}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            💰 Poner en Venta
          </button>
        </div>
      )}
    </div>
  )
}

