'use client'

import { Area } from '@/types/database.types'
import { MapPinIcon, PhoneIcon, StarIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface ListaResultadosProps {
  areas: Area[]
  onAreaClick: (area: Area) => void
  onClose?: () => void
  userLocation?: { lat: number; lng: number } | null
  gpsActive?: boolean
}

type SortOption = 'relevancia' | 'valoracion' | 'precio' | 'proximidad' | 'nombre'
type SortDirection = 'asc' | 'desc'

const MAX_RESULTS = 50

const getServicioIcon = (servicio: string): string => {
  const iconos: Record<string, string> = {
    agua: '💧',
    electricidad: '⚡',
    vaciado_aguas_negras: '♻️',
    vaciado_aguas_grises: '🚰',
    wifi: '📶',
    duchas: '🚿',
    wc: '🚻',
    lavanderia: '🧺',
    restaurante: '🍽️',
    supermercado: '🛒',
    zona_mascotas: '🐕'
  }
  return iconos[servicio] || '✓'
}

const getServicioLabel = (servicio: string): string => {
  const etiquetas: Record<string, string> = {
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
  return etiquetas[servicio] || servicio
}

export function ListaResultados({ areas, onAreaClick, onClose, userLocation, gpsActive }: ListaResultadosProps) {
  const [sortBy, setSortBy] = useState<SortOption>('nombre')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const getTipoAreaBadge = (tipo: string) => {
    const badges = {
      publica: { label: 'Pública', color: 'bg-sky-100 text-sky-800' },
      privada: { label: 'Privada', color: 'bg-orange-100 text-orange-800' },
      camping: { label: 'Camping', color: 'bg-green-100 text-green-800' },
      parking: { label: 'Parking', color: 'bg-yellow-100 text-yellow-800' }
    }
    return badges[tipo as keyof typeof badges] || badges.publica
  }

  // Calcular distancia entre dos puntos (Haversine formula)
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Ordenar áreas según la opción seleccionada
  const areasSorted = useMemo(() => {
    const areasCopy = [...areas]
    const direction = sortDirection === 'asc' ? 1 : -1

    switch (sortBy) {
      case 'nombre':
        return areasCopy.sort((a, b) => {
          const nombreA = (a.nombre || '').toLowerCase()
          const nombreB = (b.nombre || '').toLowerCase()
          return nombreA.localeCompare(nombreB) * direction
        })
      
      case 'valoracion':
        return areasCopy.sort((a, b) => {
          return ((b.google_rating || 0) - (a.google_rating || 0)) * direction
        })
      
      case 'precio':
        return areasCopy.sort((a, b) => {
          const precioA = a.precio_noche === null ? 0 : a.precio_noche
          const precioB = b.precio_noche === null ? 0 : b.precio_noche
          return (precioA - precioB) * direction
        })
      
      case 'proximidad':
        if (!userLocation) return areasCopy
        return areasCopy.sort((a, b) => {
          if (!a.latitud || !a.longitud) return 1
          if (!b.latitud || !b.longitud) return -1
          const distA = calcularDistancia(userLocation.lat, userLocation.lng, Number(a.latitud), Number(a.longitud))
          const distB = calcularDistancia(userLocation.lat, userLocation.lng, Number(b.latitud), Number(b.longitud))
          return (distA - distB) * direction
        })
      
      case 'relevancia':
      default:
        return areasCopy // Mantener orden original (filtros)
    }
  }, [areas, sortBy, sortDirection, userLocation])

  const totalResults = areasSorted.length
  const visibleResults = Math.min(totalResults, MAX_RESULTS)
  const visibleAreas = areasSorted.slice(0, MAX_RESULTS)
  const hasMoreResults = totalResults > MAX_RESULTS

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Azulado */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-bold text-sky-900">Lugares Encontrados</h2>
            <p className="text-sm text-sky-700">
              {hasMoreResults
                ? `Mostrando ${visibleResults} de ${totalResults} resultados`
                : `${totalResults} resultados`}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-sky-100 rounded-full transition-colors"
              aria-label="Cerrar lista"
            >
              <XMarkIcon className="w-6 h-6 text-sky-700" />
            </button>
          )}
        </div>
        
        {/* Selector de Ordenación */}
        <div className="px-4 pb-3">
          <label className="flex items-center gap-1 text-xs font-semibold text-sky-700 mb-1.5">
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Ordenar por
          </label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 px-3 py-2 bg-white border border-sky-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="nombre">🔤 Nombre</option>
              <option value="valoracion">⭐ Valoración</option>
              <option value="precio">💰 Precio</option>
              <option value="proximidad" disabled={!gpsActive || !userLocation}>
                📍 Proximidad {!gpsActive ? '(GPS off)' : ''}
              </option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-white border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors flex items-center justify-center min-w-[44px]"
              title={sortDirection === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
            >
              <span className="text-sm font-bold text-sky-700">
                {sortDirection === 'asc' ? 'A→Z' : 'Z→A'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista con scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {areas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MapPinIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron áreas
            </h3>
            <p className="text-gray-500 text-sm">
              Intenta ajustar los filtros para ver más resultados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAreas.map((area) => {
              // Servicios disponibles
              const serviciosValidos = [
                'agua',
                'electricidad',
                'vaciado_aguas_negras',
                'vaciado_aguas_grises',
                'wifi',
                'duchas',
                'wc',
                'lavanderia',
                'restaurante',
                'supermercado',
                'zona_mascotas'
              ]
              const serviciosDisponibles = area.servicios && typeof area.servicios === 'object' 
                ? Object.entries(area.servicios)
                    .filter(([key, value]) => value === true && serviciosValidos.includes(key))
                    .map(([key]) => key)
                : []

              return (
                <div
                  key={area.id}
                  onClick={() => onAreaClick(area)}
                  className="border border-gray-200 rounded-lg hover:border-sky-500 hover:shadow-md transition-all cursor-pointer overflow-hidden bg-white"
                >
                  {/* Imagen */}
                  {area.foto_principal && (
                    <div className="relative">
                      <img
                        src={area.foto_principal}
                        alt={area.nombre}
                        className="w-full h-40 object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      {/* Rating superpuesto */}
                      {area.google_rating && (
                        <div className="absolute top-3 right-3 flex items-center bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-bold text-gray-900">
                            {area.google_rating}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="p-4 space-y-2">
                    {/* Título */}
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2">
                      {area.nombre}
                    </h3>

                    {/* Ubicación */}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {[area.ciudad, area.provincia].filter(Boolean).join(', ')}
                      </span>
                    </div>

                    {/* Badges: Precio + Verificado */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        area.precio_noche === 0
                          ? 'bg-green-100 text-green-800'
                          : area.precio_noche === null || area.precio_noche === undefined
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {area.precio_noche === 0
                          ? '✨ Gratis'
                          : area.precio_noche === null || area.precio_noche === undefined
                          ? '❓ Precio no disponible'
                          : `💰 ${area.precio_noche}€/noche`
                        }
                      </span>
                      {area.verificado && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          ✓ Verificado
                        </span>
                      )}
                    </div>

                    {/* Servicios */}
                    {serviciosDisponibles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {serviciosDisponibles.slice(0, 4).map((servicio, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs"
                            title={getServicioLabel(servicio)}
                          >
                            <span>{getServicioIcon(servicio)}</span>
                            <span className="text-gray-700 font-medium hidden sm:inline">
                              {getServicioLabel(servicio)}
                            </span>
                          </div>
                        ))}
                        {serviciosDisponibles.length > 4 && (
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">
                            +{serviciosDisponibles.length - 4} más
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botón de detalles */}
                    <div className="pt-2 border-t">
                      <Link
                        href={`/area/${area.slug}`}
                        target="_blank"
                        className="text-sm text-sky-600 hover:text-sky-700 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
