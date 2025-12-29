'use client'

import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface BuscadorGeograficoProps {
  map: any // Google Map instance
  onLocationFound: (location: { lat: number; lng: number; address: string; country: string; countryCode: string; viewport?: any }) => void
  currentCountry?: string
}

export function BuscadorGeografico({ map, onLocationFound, currentCountry }: BuscadorGeograficoProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const initTimeoutRef = useRef<NodeJS.Timeout>()
  const onLocationFoundRef = useRef(onLocationFound)
  const mapRef = useRef(map)

  // Mantener refs actualizadas
  useEffect(() => {
    onLocationFoundRef.current = onLocationFound
    mapRef.current = map
  }, [onLocationFound, map])

  // Inicializar Google Places Autocomplete cuando el input esté visible
  useEffect(() => {
    // Solo inicializar si el input está expandido y existe en el DOM
    if (!isExpanded || !inputRef.current) return

    // Evitar reinicializar si ya existe
    if (autocompleteRef.current) {
      console.log('✅ Autocomplete ya inicializado')
      return
    }

    let retryCount = 0
    const maxRetries = 30 // 15 segundos máximo

    const initAutocomplete = () => {
      // Verificar que window.google.maps.places esté disponible
      if (typeof window === 'undefined' || 
          !window.google || 
          !window.google.maps || 
          !window.google.maps.places ||
          !window.google.maps.places.Autocomplete) {
        retryCount++
        if (retryCount < maxRetries) {
          // Log moderado
          if (retryCount === 1 || retryCount % 10 === 0) {
            console.log(`⏳ Cargando Google Places... (${retryCount}/${maxRetries})`)
          }
          initTimeoutRef.current = setTimeout(initAutocomplete, 500)
        } else {
          console.error('❌ Google Places API no disponible. El buscador no funcionará.')
        }
        return
      }

      console.log('✅ Google Places listo. Inicializando buscador geográfico...')

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!, {
          fields: ['address_components', 'geometry', 'name', 'formatted_address'],
          types: ['(regions)'], // Ciudades, regiones, países
        })

        autocompleteRef.current = autocomplete

        // Listener de selección
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          if (!place.geometry || !place.geometry.location) {
            console.warn('⚠️ Sin geometría:', place.name)
            return
          }

          // Extraer país
          const countryComponent = place.address_components?.find((c: any) =>
            c.types.includes('country')
          )

          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name || '',
            country: countryComponent?.long_name || '',
            countryCode: countryComponent?.short_name || '',
            viewport: place.geometry.viewport
          }

          console.log('📍 Lugar seleccionado:', location.address)

          // Mover mapa si está disponible
          if (mapRef.current) {
            if (location.viewport) {
              console.log('🎯 Ajustando vista (fitBounds)')
              mapRef.current.fitBounds(location.viewport)
            } else {
              console.log('🎯 Moviendo a punto (panTo)')
              mapRef.current.panTo({ lat: location.lat, lng: location.lng })
              mapRef.current.setZoom(12)
            }
          }

          // Notificar al padre
          onLocationFoundRef.current(location)

          // Limpiar
          setSearchValue('')
          setIsExpanded(false)
          inputRef.current?.blur()
        })

        console.log('✅ Buscador geográfico listo para usar')
      } catch (error) {
        console.error('❌ Error al inicializar:', error)
      }
    }

    // Iniciar con un pequeño delay para asegurar que el input esté en el DOM
    initTimeoutRef.current = setTimeout(initAutocomplete, 150)

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [isExpanded]) // Solo depender de isExpanded

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [])

  const handleExpand = () => {
    setIsExpanded(true)
    // Pequeño delay para asegurar que el render ocurrió antes del focus
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleClear = () => {
    setSearchValue('')
    setIsExpanded(false)
  }

  return (
    <div className="relative">
      {!isExpanded ? (
        // Botón compacto (lupa)
        <button
          onClick={handleExpand}
          className="w-full bg-white rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all py-2 md:py-3 px-3 md:px-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-200"
          aria-label="Buscar ubicación para navegar en el mapa"
        >
          <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium truncate">¿A dónde quieres ir?</span>
        </button>
      ) : (
        // Input expandido
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Escribe una ciudad o país..."
            className="w-full bg-white rounded-lg shadow-lg py-2 md:py-3 pl-10 pr-10 text-xs md:text-sm border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            onBlur={() => {
              // Contraer si está vacío después de perder foco (con delay para permitir clics en autocomplete)
              if (!searchValue) {
                setTimeout(() => setIsExpanded(false), 300)
              }
            }}
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 active:text-gray-700"
              aria-label="Limpiar búsqueda"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      
      {/* Hint text - Solo en desktop */}
      {isExpanded && (
        <p className="hidden md:block text-xs text-blue-600 mt-1 px-1 bg-blue-50 rounded py-1">
          💡 Escribe para navegar por el mapa (no filtra las áreas)
        </p>
      )}
    </div>
  )
}

