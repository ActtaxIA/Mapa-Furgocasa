import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook personalizado para cargar dinámicamente la lista de países
 * desde las áreas existentes en la base de datos.
 * 
 * Esto permite que cualquier país pueda ser añadido sin limitaciones hardcodeadas.
 */
export function usePaisesDisponibles() {
  const [paises, setPaises] = useState<string[]>([
    'España', 'Portugal', 'Francia', 'Andorra' // valores por defecto mientras carga
  ])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadPaises = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('areas')
          .select('pais')
          .not('pais', 'is', null)
        
        if (!error && data) {
          // Obtener países únicos, limpiar y ordenar
          const paisesUnicos = Array.from(
            new Set(
              data
                .map(a => a.pais?.trim())
                .filter(Boolean) as string[]
            )
          ).sort()
          
          setPaises(paisesUnicos)
        }
      } catch (err) {
        console.error('Error cargando países:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadPaises()
  }, [])
  
  return { paises, loading }
}

