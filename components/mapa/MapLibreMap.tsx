'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Area } from '@/types/database.types'
import { BuscadorGeografico } from './BuscadorGeografico'

interface MapLibreMapProps {
  areas: Area[]
  areaSeleccionada: Area | null
  onAreaClick: (area: Area) => void
  mapRef?: React.MutableRefObject<any>
  onCountryChange?: (country: string, previousCountry: string | null) => void
  currentCountry?: string
  estilo?: 'default' | 'waze' | 'satellite' | 'dark'
}

export function MapLibreMap({ 
  areas, 
  areaSeleccionada, 
  onAreaClick, 
  mapRef: externalMapRef,
  onCountryChange,
  currentCountry,
  estilo = 'default'
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Obtener URL de estilo según configuración
  const getStyleUrl = () => {
    // MapTiler API Key - Obtén tu clave gratis en: https://www.maptiler.com/cloud/
    // Free tier: 100,000 tile loads/month (suficiente para empezar)
    const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'get_your_own_key'
    
    switch (estilo) {
      case 'waze':
      case 'default':
        return `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`
      case 'satellite':
        return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`
      case 'dark':
        return `https://api.maptiler.com/maps/dark/style.json?key=${MAPTILER_KEY}`
      default:
        return `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`
    }
  }

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return

    console.log('🗺️ Inicializando MapLibre GL...')

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleUrl(),
      center: [-3.7038, 40.4168], // Madrid (lng, lat - orden inverso a Google)
      zoom: 5,
      attributionControl: false
    })

    // Añadir controles
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.AttributionControl({
      compact: true
    }), 'bottom-right')

    map.on('load', () => {
      console.log('✅ MapLibre cargado')
      setMapLoaded(true)
    })

    mapRef.current = map

    // Pasar referencia al padre
    if (externalMapRef) {
      externalMapRef.current = map
    }

    return () => {
      map.remove()
    }
  }, [estilo])

  // Añadir marcadores cuando el mapa esté listo
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || areas.length === 0) return

    console.log(`📍 Añadiendo ${areas.length} marcadores a MapLibre...`)

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Crear nuevos marcadores
    const newMarkers = areas.map(area => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = getTipoAreaColor(area.tipo_area)
      el.style.border = '2px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([Number(area.longitud), Number(area.latitud)])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(createPopupContent(area))
        )
        .addTo(mapRef.current!)

      // Click en marcador
      el.addEventListener('click', () => {
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

    mapRef.current.flyTo({
      center: [Number(areaSeleccionada.longitud), Number(areaSeleccionada.latitud)],
      zoom: 14,
      duration: 1000
    })
  }, [areaSeleccionada])

  // Handler para búsqueda geográfica
  const handleLocationFound = (location: { lat: number; lng: number; address: string; country: string; countryCode: string }) => {
    if (!mapRef.current) return

    console.log('📍 Búsqueda: volando a', location)

    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 12,
      duration: 1500
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
        <div className="absolute top-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 w-56 md:w-80 z-10">
          <BuscadorGeografico
            map={mapRef.current}
            onLocationFound={handleLocationFound}
            currentCountry={currentCountry}
          />
        </div>
      )}

      {/* Badge MapLibre */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
        <p className="text-xs font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-green-600">⚡</span>
          MapLibre GL (OSM)
        </p>
      </div>

      {/* Contador de áreas */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
        <p className="text-sm font-semibold text-gray-700">
          {areas.length} {areas.length === 1 ? 'área' : 'áreas'}
        </p>
      </div>
    </div>
  )
}
