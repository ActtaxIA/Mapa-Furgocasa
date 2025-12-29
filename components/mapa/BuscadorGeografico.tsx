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
  const [isSelecting, setIsSelecting] = useState(false) // Evitar cierre durante selección
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initTimeoutRef = useRef<NodeJS.Timeout>()
  const blurTimeoutRef = useRef<NodeJS.Timeout>()
  const onLocationFoundRef = useRef(onLocationFound)
  const mapRef = useRef(map)

  // Mantener refs actualizadas
  useEffect(() => {
    onLocationFoundRef.current = onLocationFound
    mapRef.current = map
  }, [onLocationFound, map])

  // Limpiar autocomplete cuando el input se cierra
  // Esto es CRÍTICO para que funcionen búsquedas múltiples
  useEffect(() => {
    if (!isExpanded) {
      // Cuando se cierra, limpiar el autocomplete para que se reinicialice en la próxima apertura
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
      autocompleteRef.current = null
    }
  }, [isExpanded])

  // Inicializar Google Places Autocomplete cuando el input esté visible
  useEffect(() => {
    // Solo inicializar si el input está expandido y existe en el DOM
    if (!isExpanded || !inputRef.current) return

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
          initTimeoutRef.current = setTimeout(initAutocomplete, 500)
        } else {
          console.error('❌ Google Places API no disponible')
        }
        return
      }

      // Si ya hay un autocomplete (no debería pasar, pero por seguridad)
      if (autocompleteRef.current) {
        console.log('⚠️ Autocomplete ya existe, limpiando...')
        if (window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
        autocompleteRef.current = null
      }

      console.log('✅ Inicializando buscador geográfico...')

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!, {
          fields: ['address_components', 'geometry', 'name', 'formatted_address'],
          types: ['(regions)'], // Ciudades, regiones, países
        })

        autocompleteRef.current = autocomplete

        // Listener de selección
        autocomplete.addListener('place_changed', () => {
          setIsSelecting(true)
          const place = autocomplete.getPlace()

          if (!place.geometry || !place.geometry.location) {
            console.warn('⚠️ Sin geometría:', place.name)
            setIsSelecting(false)
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
              mapRef.current.fitBounds(location.viewport)
            } else {
              mapRef.current.panTo({ lat: location.lat, lng: location.lng })
              mapRef.current.setZoom(12)
            }
          }

          // Notificar al padre
          onLocationFoundRef.current(location)

          // Limpiar UI (el autocomplete se limpiará en el efecto de arriba)
          setSearchValue('')
          setIsExpanded(false)
          setIsSelecting(false)
        })

        console.log('✅ Buscador geográfico listo')
      } catch (error) {
        console.error('❌ Error al inicializar:', error)
      }
    }

    // Iniciar con un pequeño delay para asegurar que el input esté en el DOM
    initTimeoutRef.current = setTimeout(initAutocomplete, 200)

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [isExpanded]) // Solo depender de isExpanded

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current)
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [])

  const handleExpand = () => {
    setIsExpanded(true)
    // Pequeño delay para asegurar que el render ocurrió antes del focus
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  const handleClear = () => {
    setSearchValue('')
    setIsExpanded(false)
    // El autocomplete se limpia automáticamente cuando isExpanded cambia a false
  }

  const handleBlur = () => {
    // No cerrar si se está seleccionando del autocomplete
    if (isSelecting) return
    
    // Limpiar timeout anterior
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    
    // Delay largo para permitir clic en autocomplete (especialmente en móvil)
    blurTimeoutRef.current = setTimeout(() => {
      if (!searchValue && !isSelecting) {
        setIsExpanded(false)
      }
    }, 400)
  }

  const handleFocus = () => {
    // Cancelar blur pendiente
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Estilos globales para el dropdown de Google Places */}
      <style jsx global>{`
        .pac-container {
          z-index: 10000 !important;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: none;
          margin-top: 4px;
          font-family: inherit;
        }
        .pac-item {
          padding: 10px 12px;
          cursor: pointer;
          font-size: 14px;
        }
        .pac-item:hover {
          background-color: #f0f9ff;
        }
        .pac-item-selected {
          background-color: #e0f2fe;
        }
        .pac-icon {
          margin-right: 8px;
        }
        @media (max-width: 768px) {
          .pac-container {
            width: calc(100vw - 32px) !important;
            left: 16px !important;
            right: 16px !important;
          }
          .pac-item {
            padding: 14px 12px;
            font-size: 16px;
          }
        }
      `}</style>

      {!isExpanded ? (
        // Botón compacto (lupa)
        <button
          onClick={handleExpand}
          className="w-full bg-white rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all py-2.5 md:py-3 px-3 md:px-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-200"
          aria-label="Buscar ubicación para navegar en el mapa"
        >
          <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium truncate">¿A dónde ir?</span>
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
            placeholder="Ciudad, región o país..."
            className="w-full bg-white rounded-lg shadow-lg py-2.5 md:py-3 pl-10 pr-10 text-sm md:text-sm border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 active:text-gray-700"
              aria-label="Limpiar búsqueda"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      
      {/* Hint text - Solo en desktop */}
      {isExpanded && (
        <p className="hidden md:block text-[11px] text-blue-600 mt-1 px-2 bg-blue-50/80 rounded py-0.5">
          Navega por el mapa (no filtra áreas)
        </p>
      )}
    </div>
  )
}

