'use client'

import { useEffect, useState } from 'react'
import { XMarkIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline'

export interface ToastNotificationProps {
  show: boolean
  message: string
  country?: string
  onClose: () => void
  onViewFilters?: () => void
  autoHideDuration?: number
}

export function ToastNotification({ 
  show, 
  message, 
  country,
  onClose, 
  onViewFilters,
  autoHideDuration = 10000 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // Pequeño delay para animación
      setTimeout(() => setIsVisible(true), 100)

      // Auto-ocultar después de X segundos
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Esperar animación de salida
      }, autoHideDuration)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, autoHideDuration, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-sky-100 md:max-w-md overflow-hidden">
        {/* Header con gradiente - Más grande en móvil */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <MapPinIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white text-base">GPS Activado</h3>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Más espacioso */}
        <div className="p-5 space-y-4">
          {/* Mensaje principal con icono más grande */}
          <div className="flex items-start gap-4">
            <div className="bg-sky-100 rounded-full p-3 flex-shrink-0">
              <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 mb-2">
                Te hemos localizado en {country || 'tu ubicación'}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Info adicional con mejor diseño */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-sm text-green-900 leading-relaxed flex-1">
                <strong className="font-bold">Filtro aplicado:</strong> El mapa cargará mucho más rápido mostrando solo áreas de tu país
              </p>
            </div>
          </div>

          {/* Botones de acción - Stack en móvil, lado a lado en desktop */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onViewFilters && (
              <button
                onClick={() => {
                  onViewFilters()
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 active:bg-sky-800 transition-colors font-semibold text-sm shadow-lg shadow-sky-200"
              >
                <FunnelIcon className="w-5 h-5" />
                Ver Filtros
              </button>
            )}
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors font-semibold text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}





