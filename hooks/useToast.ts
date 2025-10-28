import { useState, useCallback, useEffect, useRef } from 'react'

interface ToastConfig {
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toast, setToast] = useState<ToastConfig | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Mostrar el nuevo toast
    setToast({ message, type })

    // Auto-ocultar después de 3 segundos
    timeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 3000)
  }, [])

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setToast(null)
  }, [])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    toast,
    showToast,
    hideToast
  }
}

