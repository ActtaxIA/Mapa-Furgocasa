'use client'

import { useEffect, useRef, useState } from 'react'
import type { Area } from '@/types/database.types'
import { BuscadorGeografico } from './BuscadorGeografico'

// Importar Leaflet solo en cliente
let L: any = null
if (typeof window !== 'undefined') {
  L = require('leaflet')
  require('leaflet/dist/leaflet.css')
  
  // Fix para los iconos de Leaflet (problema conocido con webpack)
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface LeafletMapProps {
  areas: Area[]
  areaSeleccionada: Area | null
  onAreaClick: (area: Area) => void
  mapRef?: React.MutableRefObject<any>
  onCountryChange?: (country: string, previousCountry: string | null) => void
  currentCountry?: string
  estilo?: 'default' | 'waze' | 'satellite' | 'dark'
}

export function LeafletMap({ 
  areas, 
  areaSeleccionada, 
  onAreaClick, 
  mapRef: externalMapRef,
  onCountryChange,
  currentCountry,
  estilo = 'default'
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Obtener URL de tiles según estilo
  const getTileUrl = () => {
    switch (estilo) {
      case 'satellite':
        return 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      case 'waze':
      case 'default':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  }

  const getTileOptions = () => {
    const baseOptions = {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }

    if (estilo === 'satellite') {
      return {
        ...baseOptions,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google'
      }
    }

    return baseOptions
  }

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || !L) return

    console.log('🗺️ Inicializando Leaflet...')

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: [40.4168, -3.7038], // Madrid
      zoom: 6,
      zoomControl: true,
    })

    // Añadir capa de tiles
    L.tileLayer(getTileUrl(), getTileOptions()).addTo(map)

    mapRef.current = map

    // Pasar referencia al padre
    if (externalMapRef) {
      externalMapRef.current = map
    }

    setMapLoaded(true)
    console.log('✅ Leaflet cargado')

    return () => {
      map.remove()
    }
  }, [estilo])

  // Añadir marcadores cuando el mapa esté listo
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || areas.length === 0 || !L) return

    console.log(`📍 Añadiendo ${areas.length} marcadores a Leaflet...`)

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Crear nuevos marcadores
    const newMarkers = areas.map(area => {
      // Crear icono personalizado según tipo
      const iconHtml = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${getTipoAreaColor(area.tipo_area)};
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([area.latitud, area.longitud], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(createPopupContent(area))
        .on('click', () => {
          onAreaClick(area)
        })

      return marker
    })

    markersRef.current = newMarkers
    console.log(`✅ ${newMarkers.length} marcadores añadidos`)

  }, [areas, mapLoaded, onAreaClick])

  // Centrar en área seleccionada
  useEffect(() => {
    if (!mapRef.current || !areaSeleccionada) return

    mapRef.current.flyTo([areaSeleccionada.latitud, areaSeleccionada.longitud], 14, {
      duration: 1
    })
  }, [areaSeleccionada])

  // Handler para búsqueda geográfica
  const handleLocationFound = (location: { lat: number; lng: number; address: string; country: string; countryCode: string }) => {
    if (!mapRef.current) return

    console.log('📍 Búsqueda: volando a', location)

    mapRef.current.flyTo([location.lat, location.lng], 12, {
      duration: 1.5
    })

    // Notificar cambio de país si aplica
    if (onCountryChange && location.country && currentCountry !== location.country) {
      onCountryChange(location.country, currentCountry || null)
    }
  }

  const getTipoAreaColor = (tipo: string): string => {
    const colors: Record<string, string> = {
      publica: '#0284c7',
      privada: '#FF6B35',
      camping: '#52B788',
      parking: '#F4A261',
    }
    return colors[tipo] || '#0284c7'
  }

  const createPopupContent = (area: Area): string => {
    return `
      <div style="font-family: system-ui; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">
          ${area.nombre}
        </h3>
        ${area.ciudad || area.provincia ? `
          <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 13px;">
            ${[area.ciudad, area.provincia].filter(Boolean).join(', ')}
          </p>
        ` : ''}
        <a 
          href="/area/${area.slug}" 
          style="display: inline-block; background: #0284c7; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 8px;"
        >
          Ver Detalles
        </a>
      </div>
    `
  }

  if (!L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Cargando Leaflet...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Contenedor del mapa */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[400px]"
        style={{ touchAction: 'none' }}
      />

      {/* Buscador Geográfico - Igual que en Google Maps */}
      {mapLoaded && (
        <div className="absolute top-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 w-56 md:w-80 z-[1000]">
          <BuscadorGeografico
            map={mapRef.current}
            onLocationFound={handleLocationFound}
            currentCountry={currentCountry}
          />
        </div>
      )}

      {/* Badge Leaflet */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <p className="text-xs font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-green-600">🍃</span>
          Leaflet (OSM)
        </p>
      </div>

      {/* Contador de áreas */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <p className="text-sm font-semibold text-gray-700">
          {areas.length} {areas.length === 1 ? 'área' : 'áreas'}
        </p>
      </div>
    </div>
  )
}
