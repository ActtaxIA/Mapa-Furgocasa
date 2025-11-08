'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  exists_in_db?: boolean
}

interface Props {
  onMapReady: (map: google.maps.Map) => void
  onBoundsChanged: (bounds: google.maps.LatLngBounds) => void
  searchResults: PlaceResult[]
  existingAreas: any[]
}

export function MapaInteractivoAdmin({
  onMapReady,
  onBoundsChanged,
  searchResults,
  existingAreas
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [error, setError] = useState<string | null>(null)

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

        const { Map } = await loader.importLibrary('maps')
        const google = (window as any).google

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: { lat: 40.4168, lng: -3.7038 }, // Madrid centro
            zoom: 6,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            },
            streetViewControl: false,
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP
            },
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER
            },
            gestureHandling: 'greedy',
          })

          setMap(mapInstance)
          onMapReady(mapInstance)

          // Listener para cuando cambia el viewport (con debounce)
          let boundsTimeout: NodeJS.Timeout
          mapInstance.addListener('bounds_changed', () => {
            clearTimeout(boundsTimeout)
            boundsTimeout = setTimeout(() => {
              const bounds = mapInstance.getBounds()
              if (bounds) {
                onBoundsChanged(bounds)
              }
            }, 500) // Esperar 500ms después de que el usuario deje de mover el mapa
          })

          console.log('✅ Mapa admin inicializado')
        }
      } catch (err) {
        console.error('Error inicializando mapa:', err)
        setError('Error al cargar el mapa de Google')
      }
    }

    initMap()
  }, [])

  // Mostrar resultados de búsqueda en el mapa
  useEffect(() => {
    if (!map) return

    const google = (window as any).google
    if (!google) return

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (searchResults.length === 0) return

    const bounds = new google.maps.LatLngBounds()

    // Añadir marcadores para cada resultado
    searchResults.forEach(place => {
      const position = {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }

      // Color según si existe o no en la BD
      const isNew = !place.exists_in_db
      const fillColor = isNew ? '#10b981' : '#6b7280' // verde o gris
      const fillOpacity = isNew ? 0.9 : 0.4

      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isNew ? 10 : 7,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        animation: isNew ? google.maps.Animation.DROP : null
      })

      // InfoWindow al hacer click
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111;">
              ${place.name}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
              ${place.formatted_address}
            </p>
            <p style="margin: 0; font-size: 11px; font-weight: 600; color: ${isNew ? '#10b981' : '#6b7280'};">
              ${isNew ? '✨ Nueva' : '✓ Ya existe en BD'}
            </p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
      bounds.extend(position)
    })

    // Ajustar vista para mostrar todos los marcadores
    if (searchResults.length > 0) {
      map.fitBounds(bounds)

      // Si solo hay un resultado, hacer zoom apropiado
      if (searchResults.length === 1) {
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const currentZoom = map.getZoom()
          if (currentZoom && currentZoom > 15) {
            map.setZoom(15)
          }
        })
      }
    }
  }, [map, searchResults])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Verifica que la API Key de Google Maps esté configurada
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  )
}
