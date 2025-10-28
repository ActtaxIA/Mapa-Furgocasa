'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

// Tipos simplificados para Google Maps
type GoogleMap = any
type GoogleMarker = any
import { Visita, Area } from '@/types/database.types'

interface VisitaConArea extends Visita {
  area: Area
}

interface Props {
  visitas: VisitaConArea[]
}

export default function MapaVisitas({ visitas }: Props) {
  const mapRef = useRef<GoogleMap | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<GoogleMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visitas.length === 0) {
      setLoading(false)
      return
    }

    const initMap = async () => {
      if (!mapContainerRef.current) return

      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        console.log('🗺️ MapaVisitas - Inicializando mapa...', {
          hasApiKey: !!apiKey,
          visitasCount: visitas.length
        })
        
        if (!apiKey) {
          console.error('❌ MapaVisitas - API Key de Google Maps no configurada')
          setError('API Key de Google Maps no configurada')
          setLoading(false)
          return
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        })

        await loader.load()
        console.log('✅ MapaVisitas - Google Maps cargado')

        const google = (window as any).google

        // Crear mapa si no existe
        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = new google.maps.Map(mapContainerRef.current, {
            center: { lat: 40.4168, lng: -3.7038 },
            zoom: 6,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          })
        }

        // Limpiar marcadores anteriores
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []

        // Crear bounds para ajustar la vista
        const bounds = new google.maps.LatLngBounds()
        const infoWindow = new google.maps.InfoWindow()

        // Añadir marcadores para cada visita
        visitas.forEach((visita) => {
          if (!visita.area) return

          const marker = new google.maps.Marker({
            position: { lat: visita.area.latitud, lng: visita.area.longitud },
            map: mapRef.current,
            title: visita.area.nombre,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#0284c7',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }
          })

          const contentString = `
            <div style="min-width: 200px; padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 8px; color: #111827;">${visita.area.nombre}</h3>
              <p style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">
                📅 ${new Date(visita.fecha_visita).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p style="font-size: 14px; color: #6B7280; margin-bottom: 8px;">
                📍 ${visita.area.ciudad}, ${visita.area.provincia}
              </p>
              ${visita.notas ? `<p style="font-size: 14px; color: #374151; background: #F3F4F6; padding: 8px; border-radius: 6px; margin-top: 8px;">${visita.notas}</p>` : ''}
              <a href="/area/${visita.area.slug}" style="display: inline-block; margin-top: 12px; color: #0284c7; text-decoration: none; font-weight: 600; font-size: 14px;">
                Ver detalles →
              </a>
            </div>
          `

          marker.addListener('click', () => {
            infoWindow.setContent(contentString)
            infoWindow.open(mapRef.current, marker)
          })

          markersRef.current.push(marker)
          bounds.extend({ lat: visita.area.latitud, lng: visita.area.longitud })
        })

        // Ajustar vista para mostrar todos los marcadores
        if (!bounds.isEmpty() && mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: 50 })
        }

        console.log('✅ MapaVisitas - Mapa inicializado correctamente con', markersRef.current.length, 'marcadores')
        setLoading(false)
      } catch (error) {
        console.error('Error cargando Google Maps:', error)
        setError('Error al cargar el mapa')
        setLoading(false)
      }
    }

    initMap()

    return () => {
      // Limpiar marcadores al desmontar
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
    }
  }, [visitas])

  if (visitas.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
      <div ref={mapContainerRef} className="h-[500px] w-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center p-4">
            <p className="text-red-600 font-semibold mb-2">Error al cargar el mapa</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

