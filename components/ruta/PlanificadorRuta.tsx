'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader } from '@googlemaps/js-api-loader'
import { createClient } from '@/lib/supabase/client'
import type { Area, Ruta } from '@/types/database.types'
import { ListaResultados } from '@/components/mapa/ListaResultados'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useToast } from '@/hooks/useToast'

// Tipos simplificados para Google Maps
type GoogleMap = any
type GoogleDirectionsService = any
type GoogleDirectionsRenderer = any
type GoogleMarker = any
type GoogleInfoWindow = any
type GoogleDirectionsResult = any
type GoogleDirectionsRoute = any
type GoogleDirectionsRequest = any
type GoogleDirectionsWaypoint = any

interface RoutePoint {
  name: string
  lat: number
  lng: number
}

export default function PlanificadorRuta() {
  const mapRef = useRef<HTMLDivElement>(null)
  const origenInputRef = useRef<HTMLInputElement>(null)
  const destinoInputRef = useRef<HTMLInputElement>(null)
  const { toast, showToast, hideToast } = useToast()
  const searchParams = useSearchParams()
  
  const [map, setMap] = useState<GoogleMap | null>(null)
  const [directionsService, setDirectionsService] = useState<GoogleDirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<GoogleDirectionsRenderer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  
  const [origen, setOrigen] = useState<RoutePoint | null>(null)
  const [destino, setDestino] = useState<RoutePoint | null>(null)
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([])
  const [radio, setRadio] = useState<number>(10) // km
  const [areasEnRuta, setAreasEnRuta] = useState<Area[]>([])
  const [markers, setMarkers] = useState<GoogleMarker[]>([])
  const [infoWindow, setInfoWindow] = useState<GoogleInfoWindow | null>(null)
  const [rutaInfo, setRutaInfo] = useState<{ distancia: string; duracion: string } | null>(null)
  const userMarkerRef = useRef<GoogleMarker | null>(null)
  const [gpsActive, setGpsActive] = useState(false) // Siempre false inicialmente para evitar hidratación
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const watchIdRef = useRef<number | null>(null)
  
  // Estados para guardar ruta
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<google.maps.DirectionsRoute | null>(null)
  const [saveForm, setSaveForm] = useState({
    nombre: '',
    descripcion: ''
  })
  
  const [loadedRuta, setLoadedRuta] = useState<Ruta | null>(null)
  
  // Cargar estado del GPS desde localStorage DESPUÉS de montar (solo cliente)
  useEffect(() => {
    const savedGpsState = localStorage.getItem('gpsActive') === 'true'
    if (savedGpsState) {
      setGpsActive(true)
    }
  }, [])
  
  // Cargar ruta desde URL si existe
  useEffect(() => {
    const rutaId = searchParams.get('ruta')
    if (rutaId && map && directionsService && directionsRenderer) {
      loadRutaFromId(rutaId)
    }
  }, [searchParams, map, directionsService, directionsRenderer])

  // Obtener ubicación del usuario para ordenación
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('GPS no disponible para ordenación:', error.message)
        }
      )
    }
  }, [])

  useEffect(() => {
    initMap()
  }, [])

  const initMap = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.error('❌ Google Maps API Key no está configurada')
        showToast('Error: No se encontró la API Key de Google Maps', 'error')
        setIsLoading(false)
        return
      }

      console.log('🗺️ Cargando Google Maps para rutas...')
      
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      })

      await loader.load()
      console.log('✅ Google Maps cargado correctamente')

      const google = (window as any).google

      if (!mapRef.current) return

      // Crear mapa centrado en España
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 40.4168, lng: -3.7038 }, // Madrid centro - SIEMPRE SE INICIA AQUÍ
        zoom: 6, // Vista completa de España - SIEMPRE SE INICIA AQUÍ
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

      // Crear servicios de direcciones
      const directionsServiceInstance = new google.maps.DirectionsService()
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        draggable: false, // Desactivar arrastrar ruta
        polylineOptions: {
          strokeColor: '#0ea5e9',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      })

      setDirectionsService(directionsServiceInstance)
      setDirectionsRenderer(directionsRendererInstance)

      // Crear InfoWindow
      const infoWindowInstance = new google.maps.InfoWindow()
      setInfoWindow(infoWindowInstance)

      // Configurar autocomplete para origen
      if (origenInputRef.current) {
        const origenAutocomplete = new google.maps.places.Autocomplete(origenInputRef.current, {
          componentRestrictions: { country: ['es', 'fr', 'pt', 'it'] }
        })

        origenAutocomplete.addListener('place_changed', () => {
          const place = origenAutocomplete.getPlace()
          if (place.geometry?.location) {
            setOrigen({
              name: place.name || place.formatted_address || 'Origen',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            })
          }
        })
      }

      // Configurar autocomplete para destino
      if (destinoInputRef.current) {
        const destinoAutocomplete = new google.maps.places.Autocomplete(destinoInputRef.current, {
          componentRestrictions: { country: ['es', 'fr', 'pt', 'it'] }
        })

        destinoAutocomplete.addListener('place_changed', () => {
          const place = destinoAutocomplete.getPlace()
          if (place.geometry?.location) {
            setDestino({
              name: place.name || place.formatted_address || 'Destino',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            })
          }
        })
      }

      setIsLoading(false)
      console.log('✅ Planificador de rutas inicializado')
    } catch (error: any) {
      console.error('❌ Error cargando Google Maps:', error)
      showToast(`Error al cargar Google Maps: ${error.message}`, 'error')
      setIsLoading(false)
    }
  }

  const actualizarInfoRuta = (directions: GoogleDirectionsResult) => {
    const route = directions.routes[0]
    if (!route || !route.legs[0]) return

    let distanciaTotal = 0
    let duracionTotal = 0

    // Sumar todas las etapas (legs)
    route.legs.forEach(leg => {
      if (leg.distance) distanciaTotal += leg.distance.value
      if (leg.duration) duracionTotal += leg.duration.value
    })

    // Convertir a formato legible
    const distanciaKm = (distanciaTotal / 1000).toFixed(1)
    const horas = Math.floor(duracionTotal / 3600)
    const minutos = Math.round((duracionTotal % 3600) / 60)
    
    const duracionTexto = horas > 0 
      ? `${horas}h ${minutos}min` 
      : `${minutos}min`

    setRutaInfo({
      distancia: `${distanciaKm} km`,
      duracion: duracionTexto
    })
  }

  // Función para activar/desactivar GPS
  const toggleGPS = (autoActivate: boolean = false) => {
    if (!gpsActive && navigator.geolocation && map) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          // Crear o actualizar marcador de usuario
          if (!userMarkerRef.current) {
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
            
            // Solo centrar si es activación MANUAL (clic en botón), no auto-activación
            if (!autoActivate) {
              map.setCenter(pos)
              map.setZoom(12)
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
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      )
      watchIdRef.current = watchId
      setGpsActive(true)
      localStorage.setItem('gpsActive', 'true')
    }
  }

  // Auto-activar GPS si estaba activo anteriormente
  useEffect(() => {
    console.log('📍 useEffect GPS (RUTA) - map:', !!map, 'gpsActive:', gpsActive, 'watchIdRef:', !!watchIdRef.current)
    
    if (map && gpsActive && !watchIdRef.current && navigator.geolocation) {
      console.log('🟢 Auto-activando GPS desde localStorage')
      
      // Activar directamente sin pasar por toggleGPS
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          // Crear o actualizar marcador de usuario
          if (!userMarkerRef.current) {
            console.log('📍 Creando marcador GPS (auto-activación RUTA) en:', pos)
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
            console.log('✅ Marcador GPS creado en RUTA (NO se centra el mapa)')
          } else {
            userMarkerRef.current.setPosition(pos)
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación (auto-activación RUTA):', error)
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
      console.log('✅ GPS auto-activado en RUTA, watchId:', watchId)
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

  const calcularRuta = async () => {
    if (!origen || !destino || !directionsService || !directionsRenderer || !map) {
      showToast('Por favor, selecciona origen y destino', 'error')
      return
    }

    setIsCalculating(true)

    const google = (window as any).google

    try {
      // Preparar waypoints para Google Maps
      const waypointsFormatted = waypoints.map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
      }))

      // Calcular ruta
      const request: GoogleDirectionsRequest = {
        origin: new google.maps.LatLng(origen.lat, origen.lng),
        destination: new google.maps.LatLng(destino.lat, destino.lng),
        waypoints: waypointsFormatted,
        optimizeWaypoints: false, // Mantener orden de waypoints
        travelMode: google.maps.TravelMode.DRIVING
      }

      directionsService.route(request, async (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result)
          
          // Guardar la ruta actual
          setCurrentRoute(result.routes[0])
          
          // Actualizar info de la ruta
          actualizarInfoRuta(result)
          
          // Buscar áreas cercanas a la ruta
          await buscarAreasCercanasARuta(result.routes[0])
        } else {
          showToast('No se pudo calcular la ruta', 'error')
        }
        setIsCalculating(false)
      })
    } catch (error) {
      console.error('Error calculando ruta:', error)
      showToast('Error al calcular la ruta', 'error')
      setIsCalculating(false)
    }
  }

  const buscarAreasCercanasARuta = async (route: GoogleDirectionsRoute) => {
    const google = (window as any).google

    try {
      // Limpiar marcadores anteriores
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])

      // Obtener puntos de la ruta
      const path = route.overview_path
      
      // Obtener todas las áreas activas de Supabase
      const supabase = createClient()
      const { data: todasLasAreas, error } = await supabase
        .from('areas')
        .select('*')
        .eq('activo', true)

      if (error) throw error

      if (!todasLasAreas || todasLasAreas.length === 0) {
        setAreasEnRuta([])
        return
      }

      // Filtrar áreas que están dentro del radio de la ruta
      const areasCercanas: Area[] = []
      const radioMetros = radio * 1000

      todasLasAreas.forEach((area: Area) => {
        const areaLatLng = new google.maps.LatLng(area.latitud, area.longitud)
        
        // Comprobar si el área está cerca de algún punto de la ruta
        for (const point of path) {
          const distancia = google.maps.geometry.spherical.computeDistanceBetween(
            point,
            areaLatLng
          )
          
          if (distancia <= radioMetros) {
            areasCercanas.push(area)
            break
          }
        }
      })

      console.log(`✅ Encontradas ${areasCercanas.length} áreas en un radio de ${radio}km`)
      
      setAreasEnRuta(areasCercanas)
      mostrarAreasEnMapa(areasCercanas)
    } catch (error) {
      console.error('Error buscando áreas:', error)
    }
  }

  const getTipoAreaColor = (tipo: string): string => {
    const colors: Record<string, string> = {
      publica: '#0284c7', // Azul
      privada: '#FF6B35', // Naranja
      camping: '#52B788', // Verde
      parking: '#F4A261', // Arena
    }
    return colors[tipo] || '#0284c7'
  }

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

  const createInfoWindowContent = (area: Area): string => {
    const tipoLabels: Record<string, string> = {
      publica: 'Pública',
      privada: 'Privada',
      camping: 'Camping',
      parking: 'Parking'
    }

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
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827; line-height: 1.3;">
            ${area.nombre}
          </h3>

          ${area.ciudad || area.provincia ? `
            <div style="display: flex; align-items: center; color: #6B7280; font-size: 14px; margin-bottom: 10px;">
              <svg style="width: 16px; height: 16px; margin-right: 6px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              <span>${[area.ciudad, area.provincia].filter(Boolean).join(', ')}</span>
            </div>
          ` : ''}

          ${area.descripcion ? `
            <p style="margin: 0 0 12px 0; color: #4B5563; font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${area.descripcion.replace(/'/g, "&#39;")}
            </p>
          ` : ''}

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

          ${area.plazas_camper ? `
            <div style="display: flex; align-items: center; padding: 8px 12px; background: #EFF6FF; border-radius: 8px; margin: 12px 0;">
              <svg style="width: 16px; height: 16px; margin-right: 6px; color: #2563EB;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span style="font-size: 13px; color: #1E40AF; font-weight: 500;">
                <strong>${area.plazas_camper}</strong> plazas disponibles
              </span>
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
        </div>
      </div>
    `
  }

  const mostrarAreasEnMapa = (areas: Area[]) => {
    if (!map || !infoWindow) return

    const google = (window as any).google
    const nuevosMarkers: GoogleMarker[] = []

    areas.forEach((area) => {
      const pinColor = getTipoAreaColor(area.tipo_area)
      
      const marker = new google.maps.Marker({
        position: { lat: area.latitud, lng: area.longitud },
        map: map,
        title: area.nombre,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: pinColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      })

      marker.addListener('click', () => {
        const content = createInfoWindowContent(area)
        infoWindow.setContent(content)
        infoWindow.open(map, marker)
      })

      nuevosMarkers.push(marker)
    })

    setMarkers(nuevosMarkers)
  }

  const agregarPuntoIntermedio = () => {
    setWaypoints([...waypoints, { name: '', lat: 0, lng: 0 }])
  }

  const eliminarPuntoIntermedio = (index: number) => {
    const nuevosWaypoints = waypoints.filter((_, i) => i !== index)
    setWaypoints(nuevosWaypoints)
  }

  const loadRutaFromId = async (rutaId: string) => {
    const google = (window as any).google

    try{
      const supabase = createClient()
      const { data: ruta, error } = await supabase
        .from('rutas')
        .select('*')
        .eq('id', rutaId)
        .single()

      if (error) throw error
      if (!ruta) {
        showToast('Ruta no encontrada', 'error')
        return
      }

      setLoadedRuta(ruta)

      // Extraer información de la ruta
      const origenData = ruta.origen as any
      const destinoData = ruta.destino as any
      const paradasData = (ruta.paradas as any[]) || []
      const geometriaData = ruta.geometria as any

      // Establecer origen y destino
      const origenPoint: RoutePoint = {
        name: origenData.nombre,
        lat: origenData.latitud,
        lng: origenData.longitud
      }
      
      const destinoPoint: RoutePoint = {
        name: destinoData.nombre,
        lat: destinoData.latitud,
        lng: destinoData.longitud
      }

      setOrigen(origenPoint)
      setDestino(destinoPoint)

      // Establecer valores en los inputs
      if (origenInputRef.current) {
        origenInputRef.current.value = origenPoint.name
      }
      if (destinoInputRef.current) {
        destinoInputRef.current.value = destinoPoint.name
      }

      // Establecer waypoints si existen
      if (paradasData.length > 0) {
        const waypointsData: RoutePoint[] = paradasData.map((parada: any) => ({
          name: parada.nombre,
          lat: parada.latitud,
          lng: parada.longitud
        }))
        setWaypoints(waypointsData)
      }

      // Si tenemos la geometría guardada, usarla directamente SIN recalcular
      // Esto ahorra llamadas a la API de Google Maps
      if (geometriaData?.features?.[0]?.properties?.legs && directionsRenderer && map) {
        console.log('📦 Cargando ruta desde caché (sin llamada a API)')
        
        const savedLegs = geometriaData.features[0].properties.legs
        const coordinates = geometriaData.features[0].geometry.coordinates
        
        // Recrear el path desde las coordenadas guardadas
        const path = coordinates.map((coord: [number, number]) => 
          new google.maps.LatLng(coord[1], coord[0])
        )

        // Crear un objeto de resultado simulado compatible con DirectionsResult
        // Necesitamos incluir TODOS los campos que Google Maps espera
        const mockResult = {
          geocoded_waypoints: [],
          request: {
            origin: { lat: origenPoint.lat, lng: origenPoint.lng },
            destination: { lat: destinoPoint.lat, lng: destinoPoint.lng },
            travelMode: google.maps.TravelMode.DRIVING
          },
          routes: [{
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(
                geometriaData.features[0].properties.bounds.southwest.lat,
                geometriaData.features[0].properties.bounds.southwest.lng
              ),
              new google.maps.LatLng(
                geometriaData.features[0].properties.bounds.northeast.lat,
                geometriaData.features[0].properties.bounds.northeast.lng
              )
            ),
            copyrights: 'Map data ©2025 Google',
            overview_path: path,
            overview_polyline: '',
            summary: `${origenPoint.name} to ${destinoPoint.name}`,
            warnings: [],
            waypoint_order: [],
            legs: savedLegs.map((leg: any) => ({
              distance: { value: leg.distance, text: leg.distance_text },
              duration: { value: leg.duration, text: leg.duration_text },
              start_address: origenPoint.name,
              end_address: destinoPoint.name,
              start_location: new google.maps.LatLng(leg.start_location.lat, leg.start_location.lng),
              end_location: new google.maps.LatLng(leg.end_location.lat, leg.end_location.lng),
              steps: leg.steps.map((step: any) => ({
                distance: { value: step.distance, text: `${(step.distance / 1000).toFixed(1)} km` },
                duration: { value: step.duration, text: `${Math.round(step.duration / 60)} min` },
                start_location: new google.maps.LatLng(step.start_location.lat, step.start_location.lng),
                end_location: new google.maps.LatLng(step.end_location.lat, step.end_location.lng),
                instructions: '',
                path: step.path.map((p: any) => new google.maps.LatLng(p.lat, p.lng)),
                travel_mode: google.maps.TravelMode.DRIVING
              }))
            }))
          }]
        } as google.maps.DirectionsResult

        // Limpiar cualquier ruta anterior
        directionsRenderer.setMap(null)
        directionsRenderer.setMap(map)
        
        // Mostrar la ruta en el mapa
        directionsRenderer.setDirections(mockResult)
        setCurrentRoute(mockResult.routes[0])
        
        // Actualizar info de la ruta
        actualizarInfoRuta(mockResult)
        
        // Ajustar el mapa a los bounds de la ruta
        map.fitBounds(mockResult.routes[0].bounds, { padding: 50 })
        
        // Buscar áreas cercanas usando el path guardado
        buscarAreasCercanasARuta(mockResult.routes[0])

        showToast('Ruta cargada desde caché', 'success')
      } else {
        // Si no tenemos geometría guardada, calcular la ruta (legacy)
        console.log('🔄 Calculando ruta (ruta antigua sin caché)')
        setTimeout(() => {
          calcularRutaConPuntos(origenPoint, destinoPoint, paradasData)
        }, 500)
        showToast('Ruta cargada correctamente', 'success')
      }
    } catch (error: any) {
      console.error('Error cargando ruta:', error)
      showToast(`Error al cargar la ruta: ${error.message}`, 'error')
    }
  }

  const calcularRutaConPuntos = async (
    origenPunto: RoutePoint,
    destinoPunto: RoutePoint,
    paradasPuntos: any[]
  ) => {
    if (!directionsService || !directionsRenderer || !map) return

    setIsCalculating(true)

    const waypointsFormatted: GoogleDirectionsWaypoint[] = paradasPuntos.map((parada: any) => ({
      location: new google.maps.LatLng(parada.latitud, parada.longitud),
      stopover: true
    }))

    try {
      directionsService.route(
        {
          origin: { lat: origenPunto.lat, lng: origenPunto.lng },
          destination: { lat: destinoPunto.lat, lng: destinoPunto.lng },
          waypoints: waypointsFormatted,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result)
            setCurrentRoute(result.routes[0])
            actualizarInfoRuta(result)
            buscarAreasCercanasARuta(result.routes[0])
          } else {
            console.error('Error calculando ruta:', status)
            showToast('No se pudo calcular la ruta', 'error')
          }
          setIsCalculating(false)
        }
      )
    } catch (error) {
      console.error('Error al calcular la ruta:', error)
      setIsCalculating(false)
      showToast('Error al calcular la ruta', 'error')
    }
  }

  const limpiarRuta = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any)
    }
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])
    setAreasEnRuta([])
    setOrigen(null)
    setDestino(null)
    setWaypoints([])
    setRutaInfo(null)
    setCurrentRoute(null)
    setLoadedRuta(null)
    if (origenInputRef.current) origenInputRef.current.value = ''
    if (destinoInputRef.current) destinoInputRef.current.value = ''
  }

  const handleSaveRuta = async () => {
    if (!currentRoute || !origen || !destino) {
      showToast('No hay ruta para guardar', 'error')
      return
    }

    if (!saveForm.nombre.trim()) {
      showToast('Por favor ingresa un nombre para la ruta', 'error')
      return
    }

    setSaving(true)
    
    try {
      const supabase = createClient()
      
      // Verificar que el usuario esté autenticado
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        showToast('Debes iniciar sesión para guardar rutas', 'error')
        window.location.href = '/auth/login'
        return
      }

      // Calcular distancia y duración totales
      let distanciaTotal = 0
      let duracionTotal = 0
      
      currentRoute.legs.forEach(leg => {
        if (leg.distance) distanciaTotal += leg.distance.value
        if (leg.duration) duracionTotal += leg.duration.value
      })

      // Preparar datos de la ruta
      // Guardar la ruta completa de Google Maps para no tener que recalcularla
      const rutaData = {
        user_id: session.user.id,
        nombre: saveForm.nombre.trim(),
        descripcion: saveForm.descripcion.trim() || null,
        origen: {
          nombre: origen.name,
          latitud: origen.lat,
          longitud: origen.lng
        },
        destino: {
          nombre: destino.name,
          latitud: destino.lat,
          longitud: destino.lng
        },
        paradas: waypoints.map((wp, index) => ({
          nombre: wp.name,
          latitud: wp.lat,
          longitud: wp.lng,
          orden: index
        })),
        distancia_km: distanciaTotal / 1000,
        duracion_minutos: Math.round(duracionTotal / 60),
        // Guardar toda la información de la ruta calculada
        geometria: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: currentRoute.overview_path.map(point => [
                point.lng(),
                point.lat()
              ])
            },
            properties: {
              // Guardar legs para recrear la ruta sin recalcular
              legs: currentRoute.legs.map(leg => ({
                distance: leg.distance?.value,
                distance_text: leg.distance?.text,
                duration: leg.duration?.value,
                duration_text: leg.duration?.text,
                start_location: {
                  lat: leg.start_location.lat(),
                  lng: leg.start_location.lng()
                },
                end_location: {
                  lat: leg.end_location.lat(),
                  lng: leg.end_location.lng()
                },
                // Guardar los steps para poder recrear exactamente la ruta
                steps: leg.steps.map(step => ({
                  distance: step.distance?.value,
                  duration: step.duration?.value,
                  start_location: {
                    lat: step.start_location.lat(),
                    lng: step.start_location.lng()
                  },
                  end_location: {
                    lat: step.end_location.lat(),
                    lng: step.end_location.lng()
                  },
                  path: step.path?.map(p => ({
                    lat: p.lat(),
                    lng: p.lng()
                  })) || []
                }))
              })),
              bounds: {
                northeast: {
                  lat: currentRoute.bounds.getNorthEast().lat(),
                  lng: currentRoute.bounds.getNorthEast().lng()
                },
                southwest: {
                  lat: currentRoute.bounds.getSouthWest().lat(),
                  lng: currentRoute.bounds.getSouthWest().lng()
                }
              }
            }
          }]
        }
      }

      const { error } = await supabase
        .from('rutas')
        .insert(rutaData)

      if (error) throw error

      // Primero cerrar el modal
      setShowSaveModal(false)
      setSaveForm({ nombre: '', descripcion: '' })
      
      // Luego mostrar el toast con un pequeño delay
      setTimeout(() => {
        showToast('✅ Ruta guardada correctamente', 'success')
      }, 100)
    } catch (error: any) {
      console.error('Error guardando ruta:', error)
      showToast(`Error al guardar la ruta: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex">
      {/* Modal para Guardar Ruta */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Guardar Ruta</h3>
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSaveForm({ nombre: '', descripcion: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la ruta *
                </label>
                <input
                  type="text"
                  value={saveForm.nombre}
                  onChange={(e) => setSaveForm({ ...saveForm, nombre: e.target.value })}
                  placeholder="Ej: Viaje a la Costa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={saveForm.descripcion}
                  onChange={(e) => setSaveForm({ ...saveForm, descripcion: e.target.value })}
                  placeholder="Añade notas o detalles sobre esta ruta..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
              </div>

              {rutaInfo && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumen de la ruta:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📍 Origen: <strong>{origen?.name}</strong></p>
                    <p>🏁 Destino: <strong>{destino?.name}</strong></p>
                    {waypoints.length > 0 && (
                      <p>📌 Paradas: <strong>{waypoints.length}</strong></p>
                    )}
                    <p>📏 Distancia: <strong>{rutaInfo.distancia}</strong></p>
                    <p>⏱️ Duración: <strong>{rutaInfo.duracion}</strong></p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveRuta}
                  disabled={saving || !saveForm.nombre.trim()}
                  className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false)
                    setSaveForm({ nombre: '', descripcion: '' })
                  }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Controles - Izquierda */}
      <aside className="w-80 bg-white shadow-lg overflow-y-auto flex-shrink-0 z-10 flex flex-col">
        {/* Header Azulado */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200 p-4 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-sky-900">Planifica tu Ruta</h2>
          <p className="text-sm text-sky-700 mb-2">
            Encuentra áreas a lo largo de tu viaje
          </p>
          {/* Mensaje informativo */}
          <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-900 leading-relaxed">
              💡 <strong>Importante:</strong> Debes seleccionar los puntos de ruta de la lista desplegable que aparece al escribir cada lugar.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚩 Punto de Origen
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={origenInputRef}
                type="text"
                placeholder="Buscar ciudad o dirección..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            {origen && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✅ {origen.name}
              </div>
            )}
          </div>

          {/* Puntos Intermedios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                📌 Puntos Intermedios {waypoints.length > 0 && `(${waypoints.length})`}
              </label>
              <button
                onClick={agregarPuntoIntermedio}
                className="text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition-colors font-medium"
                disabled={isLoading}
              >
                + Añadir
              </button>
            </div>

            {waypoints.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Parada ${index + 1}...`}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      onChange={(e) => {
                        if (!map) return
                        const autocomplete = new google.maps.places.Autocomplete(e.target, {
                          componentRestrictions: { country: ['es', 'fr', 'pt', 'it'] }
                        })
                        
                        autocomplete.addListener('place_changed', () => {
                          const place = autocomplete.getPlace()
                          if (place.geometry?.location) {
                            const nuevosWaypoints = [...waypoints]
                            nuevosWaypoints[index] = {
                              name: place.name || place.formatted_address || `Parada ${index + 1}`,
                              lat: place.geometry.location.lat(),
                              lng: place.geometry.location.lng()
                            }
                            setWaypoints(nuevosWaypoints)
                          }
                        })
                      }}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => eliminarPuntoIntermedio(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar parada"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {waypoints.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                Añade paradas intermedias a tu ruta
              </p>
            )}
          </div>

          {/* Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏁 Punto de Destino
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={destinoInputRef}
                type="text"
                placeholder="Buscar ciudad o dirección..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            {destino && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✅ {destino.name}
              </div>
            )}
          </div>

          {/* Radio de búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📏 Radio de búsqueda: <strong>{radio} km</strong>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadio(r)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    radio === r
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-3">
            <button
              onClick={calcularRuta}
              disabled={!origen || !destino || isCalculating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <MapPinIcon className="w-5 h-5" />
                  Calcular Ruta
                </>
              )}
            </button>

            {currentRoute && rutaInfo && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Guardar Ruta
              </button>
            )}

            <button
              onClick={limpiarRuta}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Limpiar Ruta
            </button>
          </div>

          {/* Información de la Ruta */}
          {rutaInfo && (
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-200">
              <h3 className="text-sm font-semibold text-sky-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Información de la Ruta
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Distancia
                  </span>
                  <span className="text-sm font-bold text-sky-700">{rutaInfo.distancia}</span>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Duración
                  </span>
                  <span className="text-sm font-bold text-sky-700">{rutaInfo.duracion}</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-sky-100 rounded text-xs text-sky-700 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Usa el botón "+ Añadir" para incluir paradas intermedias en tu ruta</span>
              </div>
            </div>
          )}

        </div>
      </aside>

      {/* Mapa - Centro */}
      <div className="flex-1 relative z-20">
        <div ref={mapRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
            <div className="text-center">
              <ArrowPathIcon className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Cargando mapa...</p>
            </div>
          </div>
        )}

        {/* Botón GPS - Arriba Centro */}
        <button
          onClick={() => {
            if (!gpsActive) {
              toggleGPS() // false = activación manual, SÍ centra el mapa
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
              setGpsActive(false)
              localStorage.setItem('gpsActive', 'false')
            }
          }}
          className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-semibold transition-all z-30 flex items-center gap-2 ${
            gpsActive 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm" suppressHydrationWarning>{gpsActive ? 'GPS Activo' : 'Activar GPS'}</span>
        </button>

        {/* Botón Restablecer Zoom - Abajo Centro */}
        <button
          onClick={() => {
            if (map) {
              map.setCenter({ lat: 40.4168, lng: -3.7038 })
              map.setZoom(6)
            }
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all z-30 flex items-center gap-2 font-semibold text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          <span className="text-sm">Restablecer Zoom</span>
        </button>
      </div>

      {/* Lista de Resultados - Derecha */}
      <aside className="w-96 bg-white shadow-lg overflow-y-auto flex-shrink-0 z-10">
        <ListaResultados
          areas={areasEnRuta}
          onAreaClick={(area) => {
            if (map) {
              map.panTo({ lat: area.latitud, lng: area.longitud })
              map.setZoom(15)
            }
          }}
          userLocation={userLocation}
          gpsActive={gpsActive}
        />
      </aside>

      {/* Toast Notifications */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
          <button onClick={hideToast} className="toast-close">×</button>
        </div>
      )}
    </div>
  )
}

