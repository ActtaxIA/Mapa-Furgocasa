'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { Area } from '@/types/database.types'
import Link from 'next/link'

// Tipos simplificados para Google Maps (se cargan dinámicamente)
type GoogleMap = any
type GoogleMarker = any
type GoogleInfoWindow = any

interface MapaInteractivoProps {
  areas: Area[]
  areaSeleccionada: Area | null
  onAreaClick: (area: Area) => void
}

export function MapaInteractivo({ areas, areaSeleccionada, onAreaClick }: MapaInteractivoProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<GoogleMap | null>(null)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<GoogleMarker[]>([])
  const infoWindowRef = useRef<GoogleInfoWindow | null>(null)
  const markerClustererRef = useRef<MarkerClusterer | null>(null)
  const userMarkerRef = useRef<GoogleMarker | null>(null)
  const [gpsActive, setGpsActive] = useState(false) // Siempre false inicialmente para evitar hidratación
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const watchIdRef = useRef<number | null>(null)
  
  // Cargar estado del GPS desde localStorage DESPUÉS de montar (solo cliente)
  useEffect(() => {
    const savedGpsState = localStorage.getItem('gpsActive') === 'true'
    if (savedGpsState) {
      setGpsActive(true)
    }
  }, [])

  // Inicializar Google Maps
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
          console.log('🗺️ Inicializando mapa con centro:', { lat: 40.4168, lng: -3.7038 }, 'zoom:', 6)
          const mapInstance = new Map(mapRef.current, {
            center: { lat: 40.4168, lng: -3.7038 }, // Madrid centro por defecto
            zoom: 6,
            mapTypeControl: false, // Quitamos para evitar solapamiento
            streetViewControl: false,
            fullscreenControl: false, // Lo controlamos nosotros
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER
            },
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })

          setMap(mapInstance)

          // Crear InfoWindow única para reutilizar
          infoWindowRef.current = new google.maps.InfoWindow()

          console.log('✅ Mapa inicializado correctamente en Madrid, zoom 6')
        }
      } catch (err) {
        console.error('Error inicializando mapa:', err)
        setError('Error al cargar el mapa')
      }
    }

    initMap()
  }, [])

  // Añadir marcadores al mapa con clustering
  useEffect(() => {
    if (!map || areas.length === 0) return

    const google = (window as any).google

    // Limpiar clusterer anterior
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers()
    }

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Crear nuevos marcadores (sin animación)
    const newMarkers = areas.map((area) => {
      const pinColor = getTipoAreaColor(area.tipo_area)
      
      const marker = new google.maps.Marker({
        position: {
          lat: Number(area.latitud),
          lng: Number(area.longitud)
        },
        title: area.nombre,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: pinColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        // Sin animación para evitar el rebote
      })

      // Evento click en marcador
      marker.addListener('click', () => {
        // Notificar al componente padre
        onAreaClick(area)
        
        // Mostrar InfoWindow
        if (infoWindowRef.current) {
          const content = createInfoWindowContent(area)
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(map, marker)
          
          // Centrar mapa en el marcador
          map.panTo(marker.getPosition()!)
        }
      })

      return marker
    })

    markersRef.current = newMarkers

    // Crear clusterer con los marcadores
    markerClustererRef.current = new MarkerClusterer({
      map,
      markers: newMarkers,
      renderer: {
        render: ({ count, position }) => {
          // Crear un marcador personalizado para el cluster
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 25,
              fillColor: '#0284c7',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            label: {
              text: String(count),
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          })
        },
      },
    })

    // Cleanup
    return () => {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers()
      }
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
    }
  }, [map, areas, onAreaClick])

  // Actualizar cuando se selecciona un área desde la lista
  useEffect(() => {
    if (!map || !areaSeleccionada || !infoWindowRef.current) return

    // Buscar el marcador correspondiente
    const markerIndex = areas.findIndex(a => a.id === areaSeleccionada.id)
    if (markerIndex !== -1 && markersRef.current[markerIndex]) {
      const marker = markersRef.current[markerIndex]
      
      // Centrar mapa
      map.panTo(marker.getPosition()!)
      map.setZoom(14)
      
      // Mostrar InfoWindow
      const content = createInfoWindowContent(areaSeleccionada)
      infoWindowRef.current.setContent(content)
      infoWindowRef.current.open(map, marker)
    }
  }, [areaSeleccionada, map, areas])

  // Auto-activar GPS si estaba activo anteriormente
  useEffect(() => {
    console.log('📍 useEffect GPS - map:', !!map, 'gpsActive:', gpsActive, 'watchIdRef:', !!watchIdRef.current)
    
    if (map && gpsActive && !watchIdRef.current && navigator.geolocation) {
      console.log('🟢 Auto-activando GPS desde localStorage')
      
      const google = (window as any).google
      
      // Activar directamente sin pasar por toggleGPS
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(pos)
          
          // Crear o actualizar marcador de usuario
          if (!userMarkerRef.current) {
            console.log('📍 Creando marcador GPS (auto-activación) en:', pos)
            userMarkerRef.current = new google.maps.Marker({
              position: pos,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#FF6B35',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              },
              zIndex: 999999,
              title: 'Tu ubicación'
            })
            console.log('✅ Marcador GPS creado (NO se centra el mapa)')
          } else {
            userMarkerRef.current.setPosition(pos)
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación (auto-activación):', error)
          setGpsActive(false)
          localStorage.setItem('gpsActive', 'false')
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      )
      watchIdRef.current = watchId
      console.log('✅ GPS auto-activado, watchId:', watchId)
    }
  }, [map, gpsActive])

  // Limpiar watchPosition y marcador al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null)
      }
    }
  }, [])

  const getTipoAreaColor = (tipo: string): string => {
    const colors: Record<string, string> = {
      publica: '#0284c7', // Azul
      privada: '#FF6B35', // Naranja
      camping: '#52B788', // Verde
      parking: '#F4A261', // Arena
    }
    return colors[tipo] || '#0284c7'
  }

  // Obtener icono para cada servicio (coincide exactamente con los filtros)
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

  // Obtener etiqueta legible para cada servicio (coincide exactamente con los filtros)
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

  // Crear contenido HTML para InfoWindow
  const createInfoWindowContent = (area: Area): string => {
    const tipoLabels: Record<string, string> = {
      publica: 'Pública',
      privada: 'Privada',
      camping: 'Camping',
      parking: 'Parking'
    }

    // Lista de servicios válidos en español (coinciden con los filtros)
    const serviciosValidos = [
      'agua',
      'electricidad',
      'wc',
      'duchas',
      'vaciado_quimico',
      'vaciado_aguas_grises',
      'oferta_restauracion'
    ]

    // Obtener servicios disponibles (solo los válidos en español)
    const serviciosDisponibles = area.servicios && typeof area.servicios === 'object' 
      ? Object.entries(area.servicios)
          .filter(([key, value]) => value === true && serviciosValidos.includes(key))
          .map(([key]) => ({
            icon: getServicioIcon(key),
            label: getServicioLabel(key)
          }))
      : []

    const mostrarServicios = serviciosDisponibles.slice(0, 6)
    const serviciosRestantes = serviciosDisponibles.length - 6

    return `
      <div style="max-width: 360px; font-family: system-ui, -apple-system, sans-serif;">
        ${area.foto_principal ? `
          <div style="margin: -20px -20px 12px -20px; width: calc(100% + 40px); height: 180px; overflow: hidden; position: relative;">
            <img 
              src="${area.foto_principal}" 
              alt="${area.nombre}"
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.style.display='none'"
            />
            ${area.google_rating ? `
              <div style="position: absolute; top: 12px; right: 12px; display: flex; align-items: center; background: rgba(255, 255, 255, 0.95); padding: 6px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); backdrop-filter: blur(4px);">
                <span style="color: #F59E0B; font-size: 16px; margin-right: 4px;">★</span>
                <span style="font-weight: 700; font-size: 15px; color: #111827;">${area.google_rating}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div style="padding: ${area.foto_principal ? '0' : '8px 0'};">
          <!-- Título -->
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827; line-height: 1.3;">
            ${area.nombre}
          </h3>

          <!-- Ubicación -->
          ${area.ciudad || area.provincia ? `
            <div style="display: flex; align-items: center; color: #6B7280; font-size: 14px; margin-bottom: 10px;">
              <svg style="width: 16px; height: 16px; margin-right: 6px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              <span>${[area.ciudad, area.provincia].filter(Boolean).join(', ')}</span>
            </div>
          ` : ''}

          <!-- Descripción -->
          ${area.descripcion ? `
            <p style="margin: 0 0 12px 0; color: #4B5563; font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${area.descripcion.replace(/'/g, "&#39;")}
            </p>
          ` : ''}

          <!-- Badges -->
          <div style="display: flex; gap: 6px; margin: 12px 0; flex-wrap: wrap;">
            <span style="background: ${getTipoAreaColor(area.tipo_area)}20; color: ${getTipoAreaColor(area.tipo_area)}; padding: 6px 12px; border-radius: 14px; font-size: 12px; font-weight: 600; border: 1px solid ${getTipoAreaColor(area.tipo_area)}30;">
              ${tipoLabels[area.tipo_area] || 'Pública'}
            </span>
            ${area.precio_noche !== null && area.precio_noche !== undefined ? `
              <span style="background: #F3F4F6; color: #374151; padding: 6px 12px; border-radius: 14px; font-size: 12px; font-weight: 600; border: 1px solid #E5E7EB;">
                ${area.precio_noche === 0 ? '✨ Gratis' : `💰 ${area.precio_noche}€/noche`}
              </span>
            ` : ''}
            ${area.verificado ? `
              <span style="background: #D1FAE5; color: #059669; padding: 6px 12px; border-radius: 14px; font-size: 12px; font-weight: 600; border: 1px solid #A7F3D0;">
                ✓ Verificado
              </span>
            ` : ''}
          </div>

          <!-- Servicios -->
          ${mostrarServicios.length > 0 ? `
            <div style="background: #F9FAFB; border-radius: 12px; padding: 12px; margin: 12px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <svg style="width: 16px; height: 16px; margin-right: 6px; color: #6B7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span style="font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Servicios Disponibles</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                ${mostrarServicios.map(s => `
                  <div style="display: flex; align-items: center; font-size: 11px; color: #6B7280;">
                    <span style="font-size: 16px; margin-right: 4px;">${s.icon}</span>
                    <span>${s.label}</span>
                  </div>
                `).join('')}
              </div>
              ${serviciosRestantes > 0 ? `
                <div style="margin-top: 8px; text-align: center; font-size: 11px; color: #0284c7; font-weight: 600;">
                  +${serviciosRestantes} servicio${serviciosRestantes > 1 ? 's' : ''} más
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Botones de Acción -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px;">
            <a 
              href="/area/${area.slug}"
              style="text-align: center; background: #0284c7; color: white; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);"
              onmouseover="this.style.background='#0369a1'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(2, 132, 199, 0.4)'"
              onmouseout="this.style.background='#0284c7'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(2, 132, 199, 0.3)'"
            >
              <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver Detalles
            </a>
            
            ${area.google_maps_url || (area.latitud && area.longitud) ? `
              <a 
                href="${area.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${area.latitud},${area.longitud}`}"
                target="_blank"
                rel="noopener noreferrer"
                style="text-align: center; background: #34A853; color: white; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(52, 168, 83, 0.3);"
                onmouseover="this.style.background='#2d8e47'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(52, 168, 83, 0.4)'"
                onmouseout="this.style.background='#34A853'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(52, 168, 83, 0.3)'"
              >
                <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                Google Maps
              </a>
            ` : ''}
          </div>

          <!-- Botones secundarios -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
            <a
              href="/area/${area.slug}"
              style="background: #FEF3C7; color: #92400E; padding: 10px 12px; border: 1px solid #FDE68A; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; text-decoration: none;"
              onmouseover="this.style.background='#FDE68A'"
              onmouseout="this.style.background='#FEF3C7'"
            >
              <svg style="width: 14px; height: 14px;" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
              Favorito
            </a>
            
            <a
              href="/area/${area.slug}"
              style="background: #DBEAFE; color: #1E40AF; padding: 10px 12px; border: 1px solid #BFDBFE; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; text-decoration: none;"
              onmouseover="this.style.background='#BFDBFE'"
              onmouseout="this.style.background='#DBEAFE'"
            >
              <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Registrar Visita
            </a>
          </div>
        </div>
      </div>
    `
  }

  // Función para activar/desactivar GPS (ANTES del return condicional)
  const toggleGPS = (autoActivate: boolean = false) => {
    console.log('🔄 toggleGPS llamado - gpsActive:', gpsActive, 'autoActivate:', autoActivate, 'watchIdRef:', !!watchIdRef.current)
    
    if (!gpsActive) {
      // Activar GPS
          if (navigator.geolocation && map) {
        const google = (window as any).google
        const watchId = navigator.geolocation.watchPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
            setUserLocation(pos)
            
            // Crear o actualizar marcador de usuario
            if (!userMarkerRef.current) {
              console.log('📍 Creando marcador GPS en:', pos, 'autoActivate:', autoActivate)
              userMarkerRef.current = new google.maps.Marker({
                position: pos,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#FF6B35',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                },
                zIndex: 999999, // MUY ALTO - Por encima de clusters y todo
                title: 'Tu ubicación'
              })
              
              // Solo centrar si es activación MANUAL (clic en botón), no auto-activación
              if (!autoActivate) {
                console.log('🎯 Centrando mapa en ubicación GPS (activación manual)')
                map.setCenter(pos)
                map.setZoom(12)
              } else {
                console.log('✅ NO centrando mapa (auto-activación desde localStorage)')
              }
            } else {
              userMarkerRef.current.setPosition(pos)
            }
          },
          (error) => {
            console.error('Error obteniendo ubicación:', error)
            if (!autoActivate) {
              alert('No se pudo obtener tu ubicación')
            }
            setGpsActive(false)
            localStorage.setItem('gpsActive', 'false')
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
          }
        )
        watchIdRef.current = watchId
        setGpsActive(true)
        localStorage.setItem('gpsActive', 'true') // Guardar estado
      }
    } else {
      // Desactivar GPS
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null)
        userMarkerRef.current = null
      }
      setUserLocation(null)
      setGpsActive(false)
      localStorage.setItem('gpsActive', 'false') // Guardar estado
    }
  }

  // Función para restablecer zoom
  const resetZoom = () => {
    if (map) {
      map.setCenter({ lat: 40.4168, lng: -3.7038 }) // Madrid
      map.setZoom(6)
    }
  }

  // Limpiar GPS al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null)
      }
    }
  }, [])

  // DESPUÉS de todos los hooks y funciones, hacer el return condicional
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Botón GPS - Arriba Centro */}
      <button
        onClick={() => toggleGPS()}
        className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-semibold transition-all z-10 flex items-center gap-2 ${
          gpsActive 
            ? 'bg-orange-500 text-white hover:bg-orange-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        aria-label={gpsActive ? 'Desactivar GPS' : 'Activar GPS'}
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
        <span className="text-sm" suppressHydrationWarning>{gpsActive ? 'GPS Activo' : 'Activar GPS'}</span>
      </button>

      {/* Botón Restablecer Zoom - Abajo Centro */}
      <button
        onClick={resetZoom}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all z-10 flex items-center gap-2 font-semibold text-gray-700"
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

// Funciones auxiliares para servicios
function getServicioIcon(servicio: string): string {
  const icons: Record<string, string> = {
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
  return icons[servicio] || '✓'
}

function getServicioLabel(servicio: string): string {
  const labels: Record<string, string> = {
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
  return labels[servicio] || servicio
}
