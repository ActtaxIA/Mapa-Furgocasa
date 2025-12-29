'use client'

import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface BuscadorGeograficoProps {
  map: any // Google Map instance
  onLocationFound: (location: { lat: number; lng: number; address: string; country: string; countryCode: string }) => void
  currentCountry?: string
}

export function BuscadorGeografico({ map, onLocationFound, currentCountry }: BuscadorGeograficoProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  // Inicializar Google Places Autocomplete
  useEffect(() => {
    if (!map || !inputRef.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['address_components', 'geometry', 'name', 'formatted_address'],
      types: ['(regions)'], // Permite ciudades, regiones, países
    })

    autocompleteRef.current = autocomplete

    // Listener cuando se selecciona un lugar
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        console.warn('No se encontró la ubicación para:', place.name)
        return
      }

      // Extraer información del país
      const countryComponent = place.address_components?.find((component: any) =>
        component.types.includes('country')
      )

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address || place.name || '',
        country: countryComponent?.long_name || '',
        countryCode: countryComponent?.short_name || '',
      }

      console.log('📍 Ubicación encontrada:', location)

      // Mover el mapa a la nueva ubicación
      map.panTo({ lat: location.lat, lng: location.lng })
      map.setZoom(10) // Zoom apropiado para ver la ciudad/región

      // Notificar al componente padre
      onLocationFound(location)

      // Limpiar y contraer
      setSearchValue('')
      setIsExpanded(false)
    })

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [map, onLocationFound])

  const handleExpand = () => {
    setIsExpanded(true)
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
          aria-label="Buscar ubicación en el mapa"
        >
          <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium truncate">Buscar en el mapa</span>
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
            placeholder="Ciudad, país, región..."
            className="w-full bg-white rounded-lg shadow-lg py-2 md:py-3 pl-10 pr-10 text-xs md:text-sm border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onBlur={() => {
              // Contraer si está vacío después de perder foco
              if (!searchValue) {
                setTimeout(() => setIsExpanded(false), 200)
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
        <p className="hidden md:block text-xs text-gray-500 mt-1 px-1">
          Escribe una ciudad, país o región para navegar en el mapa
        </p>
      )}
    </div>
  )
}

