'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CheckCircleIcon,
  PlusIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types?: string[]
  rating?: number
  user_ratings_total?: number
  photos?: any[]
  business_status?: string
  website?: string | null
  phone?: string | null
  exists_in_db?: boolean
}

type SupabaseAreaRow = {
  id: string | number
  nombre: string | null
  slug: string | null
  google_place_id: string | null
  latitud: number | string | null
  longitud: number | string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
}

type ExistingAreaRecord = {
  id: string | number
  nombre: string | null
  normalizedName: string
  nameTokens: string[]
  slug: string | null
  normalizedSlug: string
  google_place_id: string | null
  latitud: number | null
  longitud: number | null
  direccion: string | null
  normalizedAddress: string
  addressTokens: string[]
}

type ExistingAreasCache = {
  placeIds: Set<string>
  normalizedNames: Set<string>
  slugs: Set<string>
  normalizedAddresses: Set<string>
  areas: ExistingAreaRecord[]
}

declare global {
  interface Window {
    existingAreasData?: ExistingAreasCache
  }
}

const COMMON_WORDS = new Set([
  'area',
  'areas',
  'autocaravana',
  'autocaravanas',
  'camper',
  'campers',
  'camping',
  'motorhome',
  'parking',
  'pernocta',
  'caravaning',
  'de',
  'la',
  'el',
  'los',
  'las',
  'del',
  'para',
  'por',
  'en',
  'y'
])

const normalizeText = (value?: string | null): string => {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const tokenize = (value?: string | null): string[] => {
  return normalizeText(value)
    .split(' ')
    .filter(token => token.length > 2 && !COMMON_WORDS.has(token))
}

const getTokenOverlapScore = (tokensA: string[], tokensB: string[]): number => {
  if (tokensA.length === 0 || tokensB.length === 0) return 0
  const setB = new Set(tokensB)
  const shared = tokensA.filter(token => setB.has(token)).length
  return shared / Math.max(tokensA.length, tokensB.length)
}

const toNumberOrNull = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const generateSlug = (nombre: string) => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Función para calcular distancia entre dos coordenadas (Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Función COMPLETA para verificar si un lugar ya existe (TODOS LOS CRITERIOS)
function checkIfPlaceExists(place: PlaceResult): boolean {
  const cache = window.existingAreasData
  
  if (!cache || !cache.areas || cache.areas.length === 0) {
    console.log('⚠️ No hay cache de áreas existentes')
    return false
  }
  
  // 1. VERIFICAR POR GOOGLE PLACE ID (criterio más fuerte)
  if (place.place_id && cache.placeIds.has(place.place_id)) {
    console.log(`✅ DUPLICADO por Google Place ID: ${place.name} (${place.place_id})`)
    return true
  }
  
  // 2. VERIFICAR POR SLUG GENERADO
  const placeSlug = generateSlug(place.name)
  if (placeSlug && cache.slugs.has(placeSlug)) {
    console.log(`✅ DUPLICADO por Slug: ${place.name} → ${placeSlug}`)
    return true
  }
  
  // 3. VERIFICAR POR NOMBRE NORMALIZADO (exacto)
  const placeNormalizedName = normalizeText(place.name)
  if (placeNormalizedName && cache.normalizedNames.has(placeNormalizedName)) {
    console.log(`✅ DUPLICADO por Nombre normalizado: ${place.name} → ${placeNormalizedName}`)
    return true
  }
  
  // 4. VERIFICAR POR DIRECCIÓN NORMALIZADA (exacta)
  const placeNormalizedAddress = normalizeText(place.formatted_address)
  if (placeNormalizedAddress && cache.normalizedAddresses.has(placeNormalizedAddress)) {
    console.log(`✅ DUPLICADO por Dirección exacta: ${place.formatted_address}`)
    return true
  }
  
  // 5. VERIFICAR POR COORDENADAS (mismo lugar físico, radio 500m)
  const lat = place.geometry?.location?.lat
  const lng = place.geometry?.location?.lng
  
  if (lat && lng) {
    for (const area of cache.areas) {
      if (area.latitud !== null && area.longitud !== null) {
        const distance = calculateDistance(lat, lng, area.latitud, area.longitud)
        
        // Si está a menos de 500 metros, es el mismo lugar
        if (distance < 0.5) {
          console.log(`✅ DUPLICADO por Coordenadas (${(distance * 1000).toFixed(0)}m): ${place.name} ≈ ${area.nombre}`)
          return true
        }
      }
    }
  }
  
  // 6. VERIFICAR POR SIMILITUD DE TOKENS DE NOMBRE (fuzzy matching)
  const placeTokens = tokenize(place.name)
  
  if (placeTokens.length > 0) {
    for (const area of cache.areas) {
      const overlapScore = getTokenOverlapScore(placeTokens, area.nameTokens)
      
      // Si comparten más del 80% de tokens significativos, probablemente es el mismo lugar
      if (overlapScore >= 0.8) {
        console.log(`✅ DUPLICADO por Similitud de Nombre (${(overlapScore * 100).toFixed(0)}%): ${place.name} ≈ ${area.nombre}`)
        return true
      }
    }
  }
  
  // 7. VERIFICAR POR SIMILITUD DE DIRECCIÓN + PROXIMIDAD DE COORDENADAS
  const placeAddressTokens = tokenize(place.formatted_address)
  
  if (placeAddressTokens.length > 0 && lat && lng) {
    for (const area of cache.areas) {
      // Combinar criterios: dirección similar + coordenadas cercanas
      const addressOverlap = getTokenOverlapScore(placeAddressTokens, area.addressTokens)
      
      if (addressOverlap >= 0.6 && area.latitud !== null && area.longitud !== null) {
        const distance = calculateDistance(lat, lng, area.latitud, area.longitud)
        
        // Si dirección es 60%+ similar Y está a menos de 2km, probablemente es el mismo
        if (distance < 2) {
          console.log(`✅ DUPLICADO por Dirección similar (${(addressOverlap * 100).toFixed(0)}%) + Proximidad (${distance.toFixed(1)}km): ${place.name} ≈ ${area.nombre}`)
          return true
        }
      }
    }
  }
  
  console.log(`✓ NUEVO lugar: ${place.name}`)
  return false
}

export default function BusquedaMasivaPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set())
  const [existingAreas, setExistingAreas] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    checkAdmin()
    loadExistingAreas()
  }, [])

  const checkAdmin = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user || !session.user.user_metadata?.is_admin) {
      router.push('/mapa')
      return
    }
  }

  const loadExistingAreas = async () => {
    try {
      console.log('🔄 Cargando áreas existentes para verificación de duplicados...')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('areas')
        .select('id, nombre, slug, google_place_id, latitud, longitud, direccion, ciudad, provincia')

      if (error) throw error

      if (!data || data.length === 0) {
        console.log('⚠️ No hay áreas en la base de datos')
        return
      }

      // Construir cache optimizado con TODOS los criterios de búsqueda
      const placeIds = new Set<string>()
      const normalizedNames = new Set<string>()
      const slugs = new Set<string>()
      const normalizedAddresses = new Set<string>()
      const areas: ExistingAreaRecord[] = []

      data.forEach((row: SupabaseAreaRow) => {
        // Convertir coordenadas a números
        const lat = toNumberOrNull(row.latitud)
        const lng = toNumberOrNull(row.longitud)
        
        // Normalizar y tokenizar textos
        const normalizedName = normalizeText(row.nombre)
        const nameTokens = tokenize(row.nombre)
        const normalizedSlug = row.slug ? normalizeText(row.slug) : ''
        const normalizedAddress = normalizeText(row.direccion)
        const addressTokens = tokenize(row.direccion)

        // Agregar a los Sets para búsqueda rápida
        if (row.google_place_id) {
          placeIds.add(row.google_place_id)
        }
        if (normalizedName) {
          normalizedNames.add(normalizedName)
        }
        if (row.slug) {
          slugs.add(row.slug)
        }
        if (normalizedAddress) {
          normalizedAddresses.add(normalizedAddress)
        }

        // Agregar al array completo para verificaciones complejas
        areas.push({
          id: row.id,
          nombre: row.nombre,
          normalizedName,
          nameTokens,
          slug: row.slug,
          normalizedSlug,
          google_place_id: row.google_place_id,
          latitud: lat,
          longitud: lng,
          direccion: row.direccion,
          normalizedAddress,
          addressTokens
        })
      })

      // Guardar cache en window para que esté disponible globalmente
      const cache: ExistingAreasCache = {
        placeIds,
        normalizedNames,
        slugs,
        normalizedAddresses,
        areas
      }

      window.existingAreasData = cache
      
      // También guardar en state para tracking
      const allKeys = new Set<string>([
        ...placeIds,
        ...normalizedNames,
        ...slugs,
        ...normalizedAddresses
      ])
      setExistingAreas(allKeys)

      console.log(`✅ Cache de duplicados construido:`)
      console.log(`   - ${areas.length} áreas totales`)
      console.log(`   - ${placeIds.size} Google Place IDs`)
      console.log(`   - ${normalizedNames.size} nombres únicos`)
      console.log(`   - ${slugs.size} slugs únicos`)
      console.log(`   - ${normalizedAddresses.size} direcciones únicas`)
    } catch (error) {
      console.error('❌ Error cargando áreas existentes:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage({ type: 'error', text: 'Por favor, escribe un término de búsqueda' })
      return
    }

    setSearching(true)
    setMessage(null)
    setResults([])
    setSelectedPlaces(new Set())

    try {
      console.log('🔍 Buscando:', searchQuery)
      
      const response = await fetch('/api/admin/search-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Error en la búsqueda: ${response.status}`)
      }
      
      if (!data.results || data.results.length === 0) {
        setMessage({ type: 'info', text: 'No se encontraron resultados para esta búsqueda' })
        setSearching(false)
        return
      }

      console.log(`📊 Resultados recibidos: ${data.results.length}`)

      // Marcar qué lugares ya existen en la base de datos usando verificación inteligente
      const resultsWithStatus = data.results.map((place: PlaceResult) => ({
        ...place,
        exists_in_db: checkIfPlaceExists(place)
      }))

      setResults(resultsWithStatus)
      
      const existingCount = resultsWithStatus.filter((p: PlaceResult) => p.exists_in_db).length
      const newCount = resultsWithStatus.length - existingCount
      
      setMessage({ 
        type: 'success', 
        text: `✅ Se encontraron ${data.results.length} resultados (hasta 60 máx. de Google): ${newCount} nuevos y ${existingCount} ya en la base de datos` 
      })
    } catch (error: any) {
      console.error('Error en búsqueda:', error)
      setMessage({ type: 'error', text: error.message || 'Error al realizar la búsqueda' })
    } finally {
      setSearching(false)
    }
  }

  const toggleSelection = (placeId: string) => {
    const newSelection = new Set(selectedPlaces)
    if (newSelection.has(placeId)) {
      newSelection.delete(placeId)
    } else {
      newSelection.add(placeId)
    }
    setSelectedPlaces(newSelection)
  }

  const selectAll = () => {
    const newSelection = new Set<string>()
    results.forEach(place => {
      if (!place.exists_in_db) {
        newSelection.add(place.place_id)
      }
    })
    setSelectedPlaces(newSelection)
  }

  const deselectAll = () => {
    setSelectedPlaces(new Set())
  }

  const handleImport = async () => {
    if (selectedPlaces.size === 0) {
      setMessage({ type: 'error', text: 'Por favor, selecciona al menos un lugar para importar' })
      return
    }

    setImporting(true)
    setMessage({ type: 'info', text: `Importando ${selectedPlaces.size} áreas...` })

    try {
      const supabase = createClient()
      const selectedResults = results.filter(r => selectedPlaces.has(r.place_id))
      
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const place of selectedResults) {
        try {
          // Extraer información de la dirección
          let ciudad = ''
          let provincia = ''
          let pais = 'España' // valor por defecto
          
          // Intentar extraer de la dirección formateada
          const addressParts = place.formatted_address.split(',').map(p => p.trim())
          
          // Detectar el país desde la dirección
          // El país suele estar en la última parte de la dirección
          if (addressParts.length > 0) {
            const ultimaParte = addressParts[addressParts.length - 1].toLowerCase()
            
            if (ultimaParte.includes('spain') || ultimaParte.includes('españa')) {
              pais = 'España'
            } else if (ultimaParte.includes('portugal')) {
              pais = 'Portugal'
            } else if (ultimaParte.includes('andorra')) {
              pais = 'Andorra'
            } else if (ultimaParte.includes('france') || ultimaParte.includes('francia')) {
              pais = 'Francia'
            } else if (ultimaParte.includes('morocco') || ultimaParte.includes('marruecos')) {
              pais = 'Marruecos'
            } else {
              // Si no se detecta, usar la última parte como país
              pais = addressParts[addressParts.length - 1]
            }
          }
          
          // Extraer ciudad y provincia
          if (addressParts.length >= 2) {
            ciudad = addressParts[addressParts.length - 2] || ''
            provincia = addressParts[addressParts.length - 2] || ''
          }

          // Generar nombre único si el slug ya existe
          let finalName = place.name
          let slug = generateSlug(finalName)

          // Verificar si ya existe el slug
          let { data: existingSlug } = await supabase
            .from('areas')
            .select('id')
            .eq('slug', slug)
            .single()

          if (existingSlug) {
            // Si el nombre ya existe, añadir la ciudad para hacerlo único
            if (ciudad) {
              finalName = `${place.name} ${ciudad}`
              slug = generateSlug(finalName)
              console.log(`🔄 Nombre duplicado detectado. Renombrado: "${place.name}" → "${finalName}"`)
              
              // Verificar de nuevo si el nuevo slug también existe
              const { data: existingSlugWithCity } = await supabase
                .from('areas')
                .select('id')
                .eq('slug', slug)
                .single()
              
              if (existingSlugWithCity) {
                // Si aún existe, añadir un número
                let counter = 2
                let uniqueSlug = `${slug}-${counter}`
                let uniqueName = `${finalName} ${counter}`
                
                while (counter < 100) {
                  const { data: exists } = await supabase
                    .from('areas')
                    .select('id')
                    .eq('slug', uniqueSlug)
                    .single()
                  
                  if (!exists) {
                    finalName = uniqueName
                    slug = uniqueSlug
                    console.log(`🔄 Añadido sufijo numérico: "${finalName}"`)
                    break
                  }
                  
                  counter++
                  uniqueSlug = `${slug}-${counter}`
                  uniqueName = `${finalName} ${counter}`
                }
              }
            } else {
              // Si no hay ciudad, saltar
              console.log(`⚠️ Ya existe un área con slug ${slug} y no hay ciudad disponible, saltando...`)
              errorCount++
              errors.push(`${place.name}: Ya existe`)
              continue
            }
          }

          const newArea = {
            nombre: finalName,
            slug: slug,
            descripcion: null, // Se dejará NULL para ser enriquecido posteriormente con IA
            tipo_area: 'publica',
            pais: pais,
            provincia: provincia,
            ciudad: ciudad,
            direccion: place.formatted_address,
            latitud: place.geometry.location.lat,
            longitud: place.geometry.location.lng,
            precio_noche: null,
            plazas_camper: null,
            google_place_id: place.place_id,
            google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            website: place.website || null,
            telefono: place.phone || null,
            google_rating: place.rating || null,
            verificado: false,
            activo: true,
            servicios: {}
          }

          const { error } = await supabase
            .from('areas')
            .insert([newArea])

          if (error) throw error

          successCount++
          console.log(`✅ Importada: ${place.name}`)
        } catch (error: any) {
          console.error(`❌ Error importando ${place.name}:`, error)
          errorCount++
          errors.push(`${place.name}: ${error.message}`)
        }
      }

      // Recargar áreas existentes
      await loadExistingAreas()

      // Limpiar selección
      setSelectedPlaces(new Set())

      // Actualizar estado de resultados
      const updatedResults = results.map(place => ({
        ...place,
        exists_in_db: selectedPlaces.has(place.place_id) ? true : place.exists_in_db
      }))
      setResults(updatedResults)

      // Mostrar resumen
      let messageText = `✅ Importación completada: ${successCount} áreas importadas`
      if (errorCount > 0) {
        messageText += `, ${errorCount} errores`
      }
      
      setMessage({ 
        type: successCount > 0 ? 'success' : 'error', 
        text: messageText 
      })

      if (errors.length > 0 && errors.length <= 5) {
        console.log('Errores:', errors)
      }
    } catch (error: any) {
      console.error('Error en importación masiva:', error)
      setMessage({ type: 'error', text: error.message || 'Error al importar áreas' })
    } finally {
      setImporting(false)
    }
  }

  const selectedCount = selectedPlaces.size
  const newPlacesCount = results.filter(p => !p.exists_in_db).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/areas"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Búsqueda Masiva de Áreas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Busca y añade múltiples áreas desde Google Maps
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : message.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar en Google Maps</h2>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: areas autocaravanas murcia, camping barcelona..."
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={searching}
              />
              {searchQuery && !searching && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <XCircleIcon className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Ejemplos de búsqueda:</strong>
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>"areas autocaravanas murcia" - Busca áreas específicas en Murcia</li>
              <li>"camping autocaravanas valencia" - Busca campings en Valencia</li>
              <li>"parking autocaravanas madrid" - Busca parkings en Madrid</li>
              <li>"área pernocta barcelona" - Busca zonas de pernocta en Barcelona</li>
            </ul>
          </div>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <>
            {/* Acciones en masa */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedCount} de {newPlacesCount} áreas nuevas seleccionadas
                </span>
                <button
                  onClick={selectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Seleccionar todas las nuevas
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deseleccionar todas
                </button>
              </div>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || importing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Añadir {selectedCount} áreas
                  </>
                )}
              </button>
            </div>

            {/* Lista de resultados */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        Seleccionar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dirección
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Valoración
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((place) => (
                      <tr 
                        key={place.place_id} 
                        className={`${
                          place.exists_in_db 
                            ? 'bg-gray-100 opacity-60' 
                            : selectedPlaces.has(place.place_id)
                            ? 'bg-primary-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          {place.exists_in_db ? (
                            <CheckCircleIcon className="w-5 h-5 text-gray-400 mx-auto" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedPlaces.has(place.place_id)}
                              onChange={() => toggleSelection(place.place_id)}
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <MapPinIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{place.name}</div>
                              <div className="text-xs text-gray-500">{place.types?.[0]?.replace(/_/g, ' ')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{place.formatted_address}</div>
                          <div className="text-xs text-gray-500">
                            {place.geometry.location.lat.toFixed(6)}, {place.geometry.location.lng.toFixed(6)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {place.rating ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900">⭐ {place.rating}</div>
                              <div className="text-xs text-gray-500">({place.user_ratings_total} opiniones)</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin valoración</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {place.exists_in_db ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                              <CheckCircleIcon className="w-4 h-4" />
                              Ya existe
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <PlusIcon className="w-4 h-4" />
                              Nueva
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Estado vacío */}
        {!searching && results.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay resultados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Escribe un término de búsqueda arriba para empezar
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

