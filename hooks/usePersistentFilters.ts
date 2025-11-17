import { useState, useEffect } from 'react'

export interface Filtros {
  busqueda: string
  pais: string
  servicios: string[]
  precio: string
  caracteristicas: string[]
}

interface FilterMetadata {
  paisSource: 'gps' | 'manual' | null
  gpsCountry: string | null
  gpsActive: boolean
  lastUpdated: number
  version: string
}

interface SavedFilters extends Filtros, FilterMetadata {}

const STORAGE_KEY = 'mapa-filters'
const CURRENT_VERSION = '1.0'

export const usePersistentFilters = () => {
  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    pais: '',
    servicios: [],
    precio: '',
    caracteristicas: []
  })

  const [metadata, setMetadata] = useState<Omit<FilterMetadata, 'lastUpdated' | 'version'>>({
    paisSource: null,
    gpsCountry: null,
    gpsActive: false
  })

  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar filtros desde localStorage al montar
  useEffect(() => {
    const loadSavedFilters = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed: SavedFilters = JSON.parse(saved)
          
          // Restaurar filtros
          setFiltros({
            busqueda: parsed.busqueda || '',
            pais: parsed.pais || '',
            servicios: parsed.servicios || [],
            precio: parsed.precio || '',
            caracteristicas: parsed.caracteristicas || []
          })
          
          // Restaurar metadata
          setMetadata({
            paisSource: parsed.paisSource || null,
            gpsCountry: parsed.gpsCountry || null,
            gpsActive: parsed.gpsActive || false
          })
          
          console.log('✅ Filtros restaurados desde localStorage:', parsed)
        }
      } catch (error) {
        console.error('❌ Error cargando filtros:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    
    loadSavedFilters()
  }, [])

  // Guardar filtros en localStorage cada vez que cambien
  useEffect(() => {
    // No guardar hasta que se hayan cargado los filtros iniciales
    if (!isLoaded) return

    const toSave: SavedFilters = {
      ...filtros,
      ...metadata,
      lastUpdated: Date.now(),
      version: CURRENT_VERSION
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      console.log('💾 Filtros guardados automáticamente')
    } catch (error) {
      console.error('❌ Error guardando filtros:', error)
    }
  }, [filtros, metadata, isLoaded])

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      pais: '',
      servicios: [],
      precio: '',
      caracteristicas: []
    })
    setMetadata({
      paisSource: null,
      gpsCountry: null,
      gpsActive: false
    })
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ Todos los filtros limpiados')
  }

  // Contar filtros activos
  const contarFiltrosActivos = (): number => {
    let count = 0
    if (filtros.busqueda) count++
    if (filtros.pais) count++
    if (filtros.servicios.length > 0) count += filtros.servicios.length
    if (filtros.precio) count++
    if (filtros.caracteristicas.length > 0) count += filtros.caracteristicas.length
    return count
  }

  // Verificar si hay filtros activos
  const tienesFiltrosActivos = (): boolean => {
    return contarFiltrosActivos() > 0
  }

  return {
    filtros,
    setFiltros,
    metadata,
    setMetadata,
    limpiarFiltros,
    contarFiltrosActivos,
    tienesFiltrosActivos,
    isLoaded
  }
}





















