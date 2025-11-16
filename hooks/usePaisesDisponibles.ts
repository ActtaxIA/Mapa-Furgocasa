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
        
        // Obtener todos los países (con paginación para evitar límite de 1000)
        const allPaises: string[] = []
        const pageSize = 1000
        let page = 0
        let hasMore = true

        while (hasMore) {
          const { data, error } = await (supabase as any).from('areas')
            .select('pais')
            .not('pais', 'is', null)
            .range(page * pageSize, (page + 1) * pageSize - 1)

          if (error) throw error

          if (data && data.length > 0) {
            allPaises.push(...data.map((a: any) => a.pais?.trim()).filter(Boolean) as string[])
            page++
            if (data.length < pageSize) {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }
        
        // Obtener países únicos y ordenar
        const paisesUnicos = Array.from(new Set(allPaises)).sort()
        setPaises(paisesUnicos)
        
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

