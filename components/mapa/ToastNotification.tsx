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
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border-2 border-sky-100 max-w-md mx-4">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-sm">GPS Activado</h3>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Mensaje principal */}
          <div className="flex items-start gap-3">
            <div className="bg-sky-100 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Te hemos localizado en {country || 'tu ubicación'}</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {message}
              </p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <p className="text-xs text-green-800">
                <strong>Filtro aplicado:</strong> Esto mejorará significativamente los tiempos de carga del mapa
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            {onViewFilters && (
              <button
                onClick={() => {
                  onViewFilters()
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium text-sm"
              >
                <FunnelIcon className="w-4 h-4" />
                Ver Filtros
              </button>
            )}
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}




