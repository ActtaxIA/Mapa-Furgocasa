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
  const containerRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout>()
  const onLocationFoundRef = useRef(onLocationFound)
  const mapRef = useRef(map)
  const isInitializedRef = useRef(false)

  // Mantener refs actualizadas
  useEffect(() => {
    onLocationFoundRef.current = onLocationFound
    mapRef.current = map
  }, [onLocationFound, map])

  // Inicializar Google Places Autocomplete UNA SOLA VEZ cuando el componente monta
  // El input siempre existe en el DOM (solo se oculta/muestra con CSS)
  useEffect(() => {
    if (isInitializedRef.current || !inputRef.current) return

    let retryCount = 0
    const maxRetries = 60 // 30 segundos máximo
    let timeoutId: NodeJS.Timeout

    const initAutocomplete = () => {
      // Verificar que window.google.maps.places esté disponible
      if (typeof window === 'undefined' || 
          !window.google || 
          !window.google.maps || 
          !window.google.maps.places ||
          !window.google.maps.places.Autocomplete) {
        retryCount++
        if (retryCount < maxRetries) {
          timeoutId = setTimeout(initAutocomplete, 500)
        } else {
          console.error('❌ Google Places API no disponible')
        }
        return
      }

      if (!inputRef.current) return

      console.log('✅ Inicializando buscador geográfico (una sola vez)...')

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['address_components', 'geometry', 'name', 'formatted_address'],
          types: ['(regions)'], // Ciudades, regiones, países
        })

        autocompleteRef.current = autocomplete
        isInitializedRef.current = true

        // Listener de selección - PERMANENTE
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          // Validación estricta
          if (!place || !place.geometry || !place.geometry.location) {
            console.warn('⚠️ Lugar sin geometría válida:', place?.name)
            return
          }

          // Extraer coordenadas INMEDIATAMENTE (antes de cualquier otra operación)
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const viewport = place.geometry.viewport
          const address = place.formatted_address || place.name || ''

          // Extraer país
          const countryComponent = place.address_components?.find((c: any) =>
            c.types.includes('country')
          )

          // Log detallado para debugging
          console.log('📍 Lugar seleccionado:', {
            address,
            lat,
            lng,
            hasViewport: !!viewport,
            country: countryComponent?.long_name
          })

          const location = {
            lat,
            lng,
            address,
            country: countryComponent?.long_name || '',
            countryCode: countryComponent?.short_name || '',
            viewport
          }

          // Mover mapa si está disponible
          if (mapRef.current) {
            const mapInstance = mapRef.current
            
            if (viewport) {
              // CON VIEWPORT: Usar fitBounds para mostrar toda la región/país/ciudad
              // NO hacer setCenter antes - interfiere con fitBounds
              console.log('🗺️ Usando fitBounds para mostrar área completa')
              
              // fitBounds ajusta automáticamente el zoom y centro para mostrar el viewport
              mapInstance.fitBounds(viewport)
              
              // Esperar a que termine el movimiento
              const idleListener = mapInstance.addListener('idle', () => {
                window.google.maps.event.removeListener(idleListener)
                
                const finalZoom = mapInstance.getZoom()
                const finalCenter = mapInstance.getCenter()
                
                console.log('✅ Mapa posicionado:', {
                  zoom: finalZoom,
                  centerLat: finalCenter?.lat(),
                  centerLng: finalCenter?.lng(),
                  targetAddress: address
                })
                
                // Solo ajustar si el zoom es extremo
                // Zoom < 3: Continente entero (demasiado alejado)
                // Zoom > 18: Nivel calle (demasiado cerca)
                if (finalZoom && finalZoom < 3) {
                  console.log('🔧 Zoom excesivamente bajo (continente), ajustando a 5')
                  mapInstance.setZoom(5)
                } else if (finalZoom && finalZoom > 18) {
                  console.log('🔧 Zoom excesivamente alto (calle), ajustando a 15')
                  mapInstance.setZoom(15)
                }
              })
            } else {
              // SIN VIEWPORT: Usar centro exacto + zoom predeterminado
              // Esto es raro, pero puede pasar con lugares muy específicos
              console.log('📍 Sin viewport, centrando en coordenadas exactas:', lat, lng)
              mapInstance.setCenter({ lat, lng })
              mapInstance.setZoom(12)
            }
          }

          // Notificar al padre
          onLocationFoundRef.current(location)

          // Limpiar UI y cerrar
          setSearchValue('')
          setIsExpanded(false)
        })

        console.log('✅ Buscador geográfico listo para múltiples búsquedas')
      } catch (error) {
        console.error('❌ Error al inicializar:', error)
      }
    }

    // Iniciar con un pequeño delay
    timeoutId = setTimeout(initAutocomplete, 300)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, []) // Array vacío - solo se ejecuta una vez al montar

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [])

  const handleExpand = () => {
    setIsExpanded(true)
    // Focus en el input después de expandir
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  const handleClear = () => {
    setSearchValue('')
    setIsExpanded(false)
  }

  const handleBlur = () => {
    // Limpiar timeout anterior
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    
    // Delay para permitir clic en autocomplete
    blurTimeoutRef.current = setTimeout(() => {
      if (!searchValue) {
        setIsExpanded(false)
      }
    }, 300)
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

      {/* Input único - SIEMPRE en el DOM */}
      {/* Cambia de apariencia según si está expandido o no */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <MagnifyingGlassIcon className={`h-5 w-5 ${isExpanded ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            // Expandir automáticamente cuando el usuario empiece a escribir
            if (!isExpanded) setIsExpanded(true)
          }}
          onFocus={() => {
            setIsExpanded(true)
            handleFocus()
          }}
          placeholder={isExpanded ? "Ciudad, región o país..." : "¿A dónde ir?"}
          className={`w-full bg-white rounded-lg shadow-lg py-2.5 md:py-3 pl-10 text-sm transition-all
            ${isExpanded 
              ? 'pr-10 border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400' 
              : 'pr-4 border border-gray-200 hover:shadow-xl hover:border-gray-300 cursor-pointer'
            }`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          onBlur={handleBlur}
          inputMode="text"
          enterKeyHint="search"
        />
        
        {/* Botón de limpiar - solo visible cuando está expandido y hay texto */}
        {isExpanded && searchValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 active:text-gray-700 z-10"
            aria-label="Limpiar búsqueda"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Hint text - Solo en desktop cuando está expandido */}
      {isExpanded && (
        <p className="hidden md:block text-[11px] text-blue-600 mt-1 px-2 bg-blue-50/80 rounded py-0.5">
          Navega por el mapa (no filtra áreas)
        </p>
      )}
    </div>
  )
}

