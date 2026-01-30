'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Supercluster from 'supercluster'
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
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({})
  const clusterIndexRef = useRef<Supercluster | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [gpsActive, setGpsActive] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

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

  // Añadir marcadores CON CLUSTERING cuando el mapa esté listo
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || areas.length === 0) return

    console.log(`📍 Inicializando clustering para ${areas.length} áreas...`)

    // Convertir áreas a formato GeoJSON para Supercluster
    const points: Supercluster.PointFeature<{ area: Area }>[] = areas.map(area => ({
      type: 'Feature',
      properties: { area },
      geometry: {
        type: 'Point',
        coordinates: [Number(area.longitud), Number(area.latitud)]
      }
    }))

    // Inicializar Supercluster
    const cluster = new Supercluster({
      radius: 100,
      maxZoom: 13,
      minPoints: 3
    })
    cluster.load(points)
    clusterIndexRef.current = cluster

    // Función para actualizar marcadores según el zoom/bounds
    const updateMarkers = () => {
      if (!mapRef.current || !clusterIndexRef.current) return

      const map = mapRef.current
      const zoom = Math.floor(map.getZoom())
      const bounds = map.getBounds()
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ]

      // Obtener clusters y puntos para el viewport actual
      const clusters = clusterIndexRef.current.getClusters(bbox, zoom)

      // Limpiar marcadores que ya no están visibles
      const newMarkerIds = new Set(clusters.map(c => 
        c.properties.cluster ? `cluster-${c.properties.cluster_id}` : `area-${c.properties.area.id}`
      ))

      Object.keys(markersRef.current).forEach(id => {
        if (!newMarkerIds.has(id)) {
          markersRef.current[id].remove()
          delete markersRef.current[id]
        }
      })

      // Añadir/actualizar marcadores
      clusters.forEach(cluster => {
        const [lng, lat] = cluster.geometry.coordinates
        const isCluster = cluster.properties.cluster

        if (isCluster) {
          const clusterId = `cluster-${cluster.properties.cluster_id}`
          const count = cluster.properties.point_count

          // Si el cluster ya existe, no recrearlo
          if (markersRef.current[clusterId]) return

          // Crear elemento del cluster
          const el = document.createElement('div')
          el.className = 'marker-cluster'
          el.style.width = '40px'
          el.style.height = '40px'
          el.style.borderRadius = '50%'
          el.style.backgroundColor = '#0284c7'
          el.style.color = 'white'
          el.style.display = 'flex'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          el.style.fontWeight = '700'
          el.style.fontSize = '14px'
          el.style.cursor = 'pointer'
          el.style.border = '3px solid white'
          el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)'
          el.textContent = count.toString()

          // Click en cluster: hacer zoom
          el.addEventListener('click', () => {
            const expansionZoom = clusterIndexRef.current!.getClusterExpansionZoom(cluster.properties.cluster_id!)
            map.flyTo({
              center: [lng, lat],
              zoom: Math.min(expansionZoom, 16),
              duration: 500
            })
          })

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map)

          markersRef.current[clusterId] = marker

        } else {
          // Marcador individual
          const area = cluster.properties.area
          const areaId = `area-${area.id}`

          if (markersRef.current[areaId]) return

          const el = document.createElement('div')
          el.className = 'marker'
          el.style.width = '20px'
          el.style.height = '20px'
          el.style.borderRadius = '50%'
          el.style.backgroundColor = getTipoAreaColor(area.tipo_area)
          el.style.border = '2px solid white'
          el.style.cursor = 'pointer'
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

          el.addEventListener('click', () => {
            onAreaClick(area)
          })

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 })
                .setHTML(createPopupContent(area))
            )
            .addTo(map)

          markersRef.current[areaId] = marker
        }
      })

      console.log(`✅ ${Object.keys(markersRef.current).length} marcadores visibles (clusters + áreas)`)
    }

    // Actualizar marcadores inicialmente
    updateMarkers()

    // Actualizar marcadores al mover/zoom
    const handleUpdate = () => {
      updateMarkers()
    }

    mapRef.current.on('moveend', handleUpdate)
    mapRef.current.on('zoomend', handleUpdate)

    return () => {
      // Limpiar todos los marcadores
      Object.values(markersRef.current).forEach(marker => marker.remove())
      markersRef.current = {}
      clusterIndexRef.current = null

      if (mapRef.current) {
        mapRef.current.off('moveend', handleUpdate)
        mapRef.current.off('zoomend', handleUpdate)
      }
    }

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

  // Función GPS - Igual que Google Maps
  const toggleGPS = () => {
    if (!gpsActive) {
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
              // Crear elemento HTML para el marcador GPS
              const el = document.createElement('div')
              el.style.width = '20px'
              el.style.height = '20px'
              el.style.borderRadius = '50%'
              el.style.backgroundColor = '#4285F4'
              el.style.border = '3px solid white'
              el.style.boxShadow = '0 0 0 4px rgba(66, 133, 244, 0.3)'

              userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([pos.lng, pos.lat])
                .addTo(mapRef.current!)
              
              // Centrar en la primera ubicación
              mapRef.current!.flyTo({
                center: [pos.lng, pos.lat],
                zoom: 14,
                duration: 1500
              })
            } else {
              // Actualizar posición
              userMarkerRef.current.setLngLat([pos.lng, pos.lat])
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
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      setGpsActive(false)
      setUserLocation(null)
    }
  }

  // Función restablecer zoom - Igual que Google Maps
  const resetZoom = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [-3.7038, 40.4168], // Madrid
        zoom: 6,
        duration: 1500
      })
    }
  }

  // Limpiar GPS al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
      }
    }
  }, [])

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

      {/* Botón GPS - Igual que Google Maps */}
      <button
        onClick={() => toggleGPS()}
        className={`absolute bottom-20 md:bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-semibold transition-all z-10 flex items-center gap-2 mb-16 md:mb-0 ${
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
        className="absolute bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all z-10 flex items-center gap-2 font-semibold text-gray-700 mb-16 md:mb-0"
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
