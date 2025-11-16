/**
 * ================================================================
 * SCRIPT: Actualizar tipos de Google Maps en áreas existentes
 * ================================================================
 *
 * Este script actualiza el campo `google_types` para todas las áreas
 * que tienen `google_place_id` usando Google Place Details API.
 *
 * USO:
 *   npm run update:google-types          # Modo DRY RUN (solo muestra)
 *   npm run update:google-types -- --apply   # Aplica los cambios
 *
 * COSTE ESTIMADO:
 *   - Place Details API: $17 por 1,000 requests
 *   - ~5,486 áreas = ~$93 USD
 *
 * ================================================================
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

if (!supabaseUrl || !supabaseKey || !googleApiKey) {
  console.error('❌ Faltan variables de entorno requeridas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// TIPOS
// ============================================================================

interface Area {
  id: string
  nombre: string
  google_place_id: string
  google_types: string[] | null
}

interface PlaceDetailsResponse {
  result?: {
    types?: string[]
  }
  status: string
  error_message?: string
}

interface UpdateResult {
  area: Area
  oldTypes: string[] | null
  newTypes: string[]
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const BATCH_SIZE = 100 // Procesar en lotes de 100
const DELAY_MS = 100 // Delay entre requests (para rate limiting)
const MAX_RETRIES = 3 // Máximo de reintentos por request

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Obtiene los tipos de Google Places para un Place ID
 */
async function getGoogleTypes(placeId: string, retries = 0): Promise<string[] | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=types&key=${googleApiKey}`

    const response = await fetch(url)
    const data: any = await response.json()

    if (data.status === 'OK' && data.result?.types) {
      return data.result.types
    }

    if (data.status === 'OVER_QUERY_LIMIT' && retries < MAX_RETRIES) {
      console.warn(`⚠️  Rate limit alcanzado, esperando 2 segundos... (intento ${retries + 1}/${MAX_RETRIES})`)
      await delay(2000)
      return getGoogleTypes(placeId, retries + 1)
    }

    if (data.status === 'INVALID_REQUEST' || data.status === 'NOT_FOUND') {
      console.warn(`⚠️  Place ID inválido o no encontrado: ${placeId}`)
      return null
    }

    console.error(`❌ Error en Google API: ${data.status} - ${data.error_message || 'Sin mensaje'}`)
    return null

  } catch (error) {
    console.error(`❌ Error consultando Google API:`, error)
    return null
  }
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Formatea los tipos de Google de forma legible
 */
function formatTypes(types: string[] | null): string {
  if (!types || types.length === 0) return 'N/A'
  return types.slice(0, 3).join(', ') + (types.length > 3 ? `, +${types.length - 3} más` : '')
}

/**
 * Script principal
 */
async function updateGoogleTypes() {
  const applyChanges = process.argv.includes('--apply')

  console.log('🚀 ACTUALIZACIÓN DE TIPOS DE GOOGLE MAPS')
  console.log('=' .repeat(70))
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`)
  console.log(`⚙️  Modo: ${applyChanges ? '✅ APLICAR CAMBIOS' : '🔍 DRY RUN (solo mostrar)'}`)
  console.log('=' .repeat(70))
  console.log()

  // ============================================================================
  // 1. Obtener áreas con google_place_id pero sin google_types (en lotes)
  // ============================================================================

  console.log('📊 Obteniendo áreas con Google Place ID...')
  let allAreas: Area[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data: batch, error } = await (supabase as any).from('areas')
      .select('id, nombre, google_place_id, google_types')
      .not('google_place_id', 'is', null)
      .range(offset, offset + 999) // Supabase límite de 1000

    if (error) {
      console.error('❌ Error obteniendo áreas:', error)
      process.exit(1)
    }

    if (!batch || batch.length === 0) {
      hasMore = false
    } else {
      allAreas = allAreas.concat(batch as Area[])
      offset += batch.length
      console.log(`   📦 Cargadas ${allAreas.length} áreas...`)
    }
  }

  const areasToUpdate = allAreas.filter((a: any) => !a.google_types || a.google_types.length === 0)
  const areasAlreadyUpdated = allAreas.filter((a: any) => a.google_types && a.google_types.length > 0)

  console.log()
  console.log('📈 RESUMEN:')
  console.log(`   ✅ Áreas con Place ID: ${allAreas.length}`)
  console.log(`   🔄 Áreas a actualizar: ${areasToUpdate.length}`)
  console.log(`   ✔️  Ya tienen tipos: ${areasAlreadyUpdated.length}`)
  console.log()

  if (areasToUpdate.length === 0) {
    console.log('✨ ¡Todas las áreas ya tienen tipos de Google!')
    return
  }

  // Calcular costo
  const costoPorRequest = 0.017 // $17 por 1000
  const costoEstimado = areasToUpdate.length * costoPorRequest

  console.log('💰 COSTO ESTIMADO:')
  console.log(`   📊 Requests API: ${areasToUpdate.length}`)
  console.log(`   💵 Costo: ~$${costoEstimado.toFixed(2)} USD`)
  console.log()

  if (!applyChanges) {
    console.log('⚠️  MODO DRY RUN - No se aplicarán cambios')
    console.log('   Para aplicar cambios, ejecuta: npm run update:google-types -- --apply')
    console.log()

    // Mostrar muestra de 10 áreas
    console.log('📝 Muestra de áreas a actualizar (primeras 10):')
    console.log('-' .repeat(70))
    areasToUpdate.slice(0, 10).forEach((area: any, i: any) => {
      console.log(`${i + 1}. ${area.nombre}`)
      console.log(`   Place ID: ${area.google_place_id}`)
      console.log()
    })

    return
  }

  // ============================================================================
  // 2. Consultar Google Places API y actualizar
  // ============================================================================

  console.log('🔄 Iniciando actualización...')
  console.log()

  const results: UpdateResult[] = []
  const errors: { area: Area; error: string }[] = []
  let processed = 0
  let apiCalls = 0
  const startTime = Date.now()

  for (let i = 0; i < areasToUpdate.length; i += BATCH_SIZE) {
    const batch = areasToUpdate.slice(i, i + BATCH_SIZE)
    console.log(`📦 Procesando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(areasToUpdate.length / BATCH_SIZE)} (${batch.length} áreas)...`)

    for (const area of batch) {
      try {
        // Consultar Google API
        const types = await getGoogleTypes(area.google_place_id)
        apiCalls++

        if (types && types.length > 0) {
          // Actualizar en BD
          const { error: updateError } = await (supabase as any).from('areas')
            .update({
              google_types: types,
              updated_at: new Date().toISOString()
            })
            .eq('id', area.id)

          if (updateError) {
            console.error(`   ❌ Error actualizando ${area.nombre}:`, updateError.message)
            errors.push({ area, error: updateError.message })
          } else {
            results.push({
              area,
              oldTypes: area.google_types,
              newTypes: types
            })
            console.log(`   ✅ ${area.nombre}: ${formatTypes(types)}`)
          }
        } else {
          console.warn(`   ⚠️  ${area.nombre}: No se pudieron obtener tipos`)
          errors.push({ area, error: 'No se pudieron obtener tipos' })
        }

        processed++

        // Progress bar
        const progress = ((processed / areasToUpdate.length) * 100).toFixed(1)
        const elapsed = Date.now() - startTime
        const rate = processed / (elapsed / 1000) // áreas por segundo
        const remaining = areasToUpdate.length - processed
        const eta = remaining / rate

        if (processed % 10 === 0) {
          console.log(`   📊 Progreso: ${processed}/${areasToUpdate.length} (${progress}%) | ETA: ${Math.ceil(eta / 60)} min`)
        }

        // Rate limiting
        await delay(DELAY_MS)

      } catch (error: any) {
        console.error(`   ❌ Error procesando ${area.nombre}:`, error.message)
        errors.push({ area, error: error.message })
      }
    }

    console.log()
  }

  // ============================================================================
  // 3. Resumen final
  // ============================================================================

  const duration = Date.now() - startTime
  const realCost = apiCalls * costoPorRequest

  console.log()
  console.log('=' .repeat(70))
  console.log('📊 RESUMEN FINAL')
  console.log('=' .repeat(70))
  console.log(`✅ Actualizadas exitosamente: ${results.length}`)
  console.log(`❌ Errores: ${errors.length}`)
  console.log(`📡 API calls realizadas: ${apiCalls}`)
  console.log(`💵 Costo real: ~$${realCost.toFixed(2)} USD`)
  console.log(`⏱️  Tiempo total: ${Math.ceil(duration / 1000)} segundos (${(duration / 60000).toFixed(1)} min)`)
  console.log('=' .repeat(70))
  console.log()

  if (errors.length > 0) {
    console.log('❌ Errores encontrados:')
    console.log('-' .repeat(70))
    errors.slice(0, 20).forEach((err: any, i: any) => {
      console.log(`${i + 1}. ${err.area.nombre}`)
      console.log(`   Error: ${err.error}`)
      console.log()
    })
    if (errors.length > 20) {
      console.log(`... y ${errors.length - 20} errores más`)
    }
  }

  console.log()
  console.log('✅ Actualización completada!')
}

// ============================================================================
// EJECUTAR
// ============================================================================

updateGoogleTypes().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
