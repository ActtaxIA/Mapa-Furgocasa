'use client'

import { useEffect, useRef, useState } from 'react'
import type { Area } from '@/types/database.types'
import { BuscadorGeografico } from './BuscadorGeografico'

// Importar Leaflet solo en cliente
let L: any = null
let MarkerClusterGroup: any = null

if (typeof window !== 'undefined') {
  L = require('leaflet')
  require('leaflet/dist/leaflet.css')
  
  // Importar Leaflet.markercluster (TEMPORALMENTE COMENTADO PARA BUILD)
  try {
    require('leaflet.markercluster')
    require('leaflet.markercluster/dist/MarkerCluster.css')
    require('leaflet.markercluster/dist/MarkerCluster.Default.css')
  } catch (e) {
    console.warn('⚠️ leaflet.markercluster no disponible, usando marcadores sin clustering')
  }
  
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
  const markerClusterGroupRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const watchIdRef = useRef<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [gpsActive, setGpsActive] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

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

  // Añadir marcadores (SIN CLUSTERING por ahora - pendiente npm install)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || areas.length === 0 || !L) return

    console.log(`📍 Añadiendo ${areas.length} marcadores a Leaflet...`)

    // Limpiar marcadores anteriores
    if (markerClusterGroupRef.current) {
      mapRef.current.removeLayer(markerClusterGroupRef.current)
      markerClusterGroupRef.current = null
    }

    // Crear marcadores directamente (sin clustering)
    const markers: any[] = []
    
    areas.forEach(area => {
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

      markers.push(marker)
    })

    // Guardar referencia para limpieza
    markerClusterGroupRef.current = { markers }

    console.log(`✅ ${areas.length} marcadores añadidos (sin clustering - pendiente instalación)`)

    return () => {
      if (markerClusterGroupRef.current?.markers) {
        markerClusterGroupRef.current.markers.forEach((m: any) => m.remove())
      }
    }

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

  // Función GPS - Igual que Google Maps
  const toggleGPS = () => {
    if (!gpsActive && L) {
      // Activar GPS
      if (navigator.geolocation && mapRef.current) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            setUserLocation(pos)
            
            // Crear o actualizar marcador de usuario
            if (!userMarkerRef.current) {
              // Crear icono GPS personalizado
              const gpsIcon = L.divIcon({
                html: `<div style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background-color: #4285F4;
                  border: 3px solid white;
                  box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.3);
                "></div>`,
                className: 'gps-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })

              userMarkerRef.current = L.marker([pos.lat, pos.lng], { icon: gpsIcon })
                .addTo(mapRef.current)
              
              // Centrar en la primera ubicación
              mapRef.current.flyTo([pos.lat, pos.lng], 14, {
                duration: 1.5
              })
            } else {
              // Actualizar posición
              userMarkerRef.current.setLatLng([pos.lat, pos.lng])
            }
          },
          (error) => {
            console.error('Error GPS:', error)
            alert('No se pudo obtener tu ubicación. Verifica los permisos.')
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
          }
        )
        watchIdRef.current = watchId
        setGpsActive(true)
      }
    } else {
      // Desactivar GPS
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current)
        userMarkerRef.current = null
      }
      setGpsActive(false)
      setUserLocation(null)
    }
  }

  // Función restablecer zoom - Igual que Google Maps
  const resetZoom = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([40.4168, -3.7038], 6, {
        duration: 1.5
      })
    }
  }

  // Limpiar GPS al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current)
      }
    }
  }, [])

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

      {/* Botón GPS - Igual que Google Maps */}
      <button
        onClick={() => toggleGPS()}
        className={`absolute bottom-20 md:bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-semibold transition-all z-[1000] flex items-center gap-2 mb-16 md:mb-0 ${
          gpsActive
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        aria-label={gpsActive ? "Desactivar GPS" : "Activar GPS"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm">{gpsActive ? 'GPS Activado' : 'Ver ubicación'}</span>
      </button>

      {/* Botón Restablecer Zoom - Igual que Google Maps */}
      <button
        onClick={resetZoom}
        className="absolute bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all z-[1000] flex items-center gap-2 font-semibold text-gray-700 mb-16 md:mb-0"
        aria-label="Restablecer zoom"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
        <span className="text-sm">Restablecer Zoom</span>
      </button>
    </div>
  )
}
