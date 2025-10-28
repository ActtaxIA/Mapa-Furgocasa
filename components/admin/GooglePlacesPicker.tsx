'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MagnifyingGlassIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface PlaceData {
  nombre: string
  direccion: string
  ciudad: string
  provincia: string
  pais: string
  codigo_postal: string
  latitud: number
  longitud: number
  telefono?: string
  web?: string
  google_maps_url?: string
  foto_principal?: string
}

interface GooglePlacesPickerProps {
  onPlaceSelected: (placeData: PlaceData) => void
  initialLat?: number
  initialLng?: number
}

export default function GooglePlacesPicker({ onPlaceSelected, initialLat, initialLng }: GooglePlacesPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initMap()
  }, [])

  const initMap = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.error('❌ Google Maps API Key no está configurada')
        alert('Error: No se encontró la API Key de Google Maps')
        setIsLoading(false)
        return
      }

      console.log('🗺️ Cargando Google Maps...')
      
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'] // Mismas libraries que otros componentes
      })

      await loader.load()
      console.log('✅ Google Maps cargado correctamente')

      if (!mapRef.current) {
        console.error('❌ Referencia al mapa no encontrada')
        return
      }

      // Crear mapa centrado en España (o en las coordenadas iniciales)
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { 
          lat: initialLat || 40.4168, 
          lng: initialLng || -3.7038 
        },
        zoom: initialLat ? 15 : 6,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      })

      setMap(mapInstance)

      // Crear marcador inicial si hay coordenadas
      if (initialLat && initialLng) {
        const markerInstance = new google.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map: mapInstance,
          draggable: true,
          animation: google.maps.Animation.DROP,
        })

        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition()
          if (position) {
            reverseGeocode(position.lat(), position.lng())
          }
        })

        setMarker(markerInstance)
      }

      // Configurar autocomplete
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components', 'formatted_phone_number', 'website', 'photos', 'url'],
          componentRestrictions: { country: ['es', 'fr', 'pt', 'it'] }, // España, Francia, Portugal, Italia
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          
          if (!place.geometry || !place.geometry.location) {
            alert('No se encontraron detalles para este lugar')
            return
          }

          handlePlaceSelect(place, mapInstance)
        })
      }

      // Permitir hacer clic en el mapa para colocar marcador
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          placeMarkerAndReverseGeocode(e.latLng, mapInstance)
        }
      })

      setIsLoading(false)
      console.log('✅ Mapa inicializado completamente')
    } catch (error: any) {
      console.error('❌ Error cargando Google Maps:', error)
      console.error('Detalles del error:', error.message)
      alert(`Error al cargar Google Maps: ${error.message}`)
      setIsLoading(false)
    }
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult, mapInstance: google.maps.Map) => {
    if (!place.geometry?.location) return

    setSelectedPlace(place)

    // Centrar mapa en el lugar
    mapInstance.setCenter(place.geometry.location)
    mapInstance.setZoom(15)

    // Actualizar o crear marcador
    if (marker) {
      marker.setPosition(place.geometry.location)
    } else {
      const newMarker = new google.maps.Marker({
        position: place.geometry.location,
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP,
      })

      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition()
        if (position) {
          reverseGeocode(position.lat(), position.lng())
        }
      })

      setMarker(newMarker)
    }

    // Extraer datos del lugar
    extractPlaceData(place)
  }

  const placeMarkerAndReverseGeocode = (location: google.maps.LatLng, mapInstance: google.maps.Map) => {
    // Actualizar o crear marcador
    if (marker) {
      marker.setPosition(location)
    } else {
      const newMarker = new google.maps.Marker({
        position: location,
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP,
      })

      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition()
        if (position) {
          reverseGeocode(position.lat(), position.lng())
        }
      })

      setMarker(newMarker)
    }

    // Hacer geocodificación inversa
    reverseGeocode(location.lat(), location.lng())
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder()
    
    try {
      const response = await geocoder.geocode({ location: { lat, lng } })
      
      if (response.results[0]) {
        const place = response.results[0]
        
        // Crear un objeto PlaceResult simplificado
        const simplifiedPlace: google.maps.places.PlaceResult = {
          geometry: {
            location: new google.maps.LatLng(lat, lng),
          } as google.maps.places.PlaceGeometry,
          formatted_address: place.formatted_address,
          address_components: place.address_components,
          name: place.formatted_address?.split(',')[0] || '',
          url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        }

        setSelectedPlace(simplifiedPlace)
        extractPlaceData(simplifiedPlace)
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error)
    }
  }

  const extractPlaceData = (place: google.maps.places.PlaceResult) => {
    let ciudad = ''
    let provincia = ''
    let pais = ''
    let codigo_postal = ''

    // Extraer componentes de dirección
    place.address_components?.forEach(component => {
      const types = component.types

      if (types.includes('locality')) {
        ciudad = component.long_name
      }
      if (types.includes('administrative_area_level_2')) {
        provincia = component.long_name
      }
      if (types.includes('administrative_area_level_1') && !provincia) {
        provincia = component.long_name
      }
      if (types.includes('country')) {
        pais = component.long_name
      }
      if (types.includes('postal_code')) {
        codigo_postal = component.long_name
      }
    })

    // Obtener foto principal
    let foto_principal = ''
    if (place.photos && place.photos.length > 0) {
      foto_principal = place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 })
    }

    const placeData: PlaceData = {
      nombre: place.name || '',
      direccion: place.formatted_address || '',
      ciudad,
      provincia,
      pais,
      codigo_postal,
      latitud: place.geometry?.location?.lat() || 0,
      longitud: place.geometry?.location?.lng() || 0,
      telefono: place.formatted_phone_number || '',
      web: place.website || '',
      google_maps_url: place.url || '',
      foto_principal,
    }

    onPlaceSelected(placeData)
  }

  const handleUseSelected = () => {
    if (selectedPlace) {
      extractPlaceData(selectedPlace)
      alert('✅ Datos importados correctamente desde Google Places')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPinIcon className="w-6 h-6 text-sky-600" />
          Buscar en Google Places
        </h3>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar lugar, restaurante, camping, área de autocaravanas..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base"
          disabled={isLoading}
        />
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Cómo usar:</strong>
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
          <li>Escribe el nombre del lugar en el buscador</li>
          <li>Selecciona un resultado de la lista desplegable</li>
          <li>O haz clic directamente en el mapa para colocar un marcador</li>
          <li>Arrastra el marcador para ajustar la posición exacta</li>
          <li>Los datos se rellenarán automáticamente en el formulario</li>
        </ul>
      </div>

      {/* Mapa */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-[500px] rounded-lg border-2 border-gray-300"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
            <div className="text-center">
              <div className="spinner mb-2"></div>
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Información del lugar seleccionado */}
      {selectedPlace && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">Lugar seleccionado:</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>Nombre:</strong> {selectedPlace.name}</p>
                <p><strong>Dirección:</strong> {selectedPlace.formatted_address}</p>
                <p><strong>Coordenadas:</strong> {selectedPlace.geometry?.location?.lat().toFixed(6)}, {selectedPlace.geometry?.location?.lng().toFixed(6)}</p>
                {selectedPlace.formatted_phone_number && (
                  <p><strong>Teléfono:</strong> {selectedPlace.formatted_phone_number}</p>
                )}
                {selectedPlace.website && (
                  <p><strong>Web:</strong> {selectedPlace.website}</p>
                )}
              </div>
              <button
                onClick={handleUseSelected}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ✅ Usar estos datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

