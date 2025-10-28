/**
 * Script para actualizar websites, teléfonos y ratings desde Google Places API
 * para áreas que ya existen pero no tienen estos datos.
 * 
 * Uso:
 * node scripts/actualizar-websites-google.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridos')
  process.exit(1)
}

if (!googleApiKey) {
  console.error('❌ Error: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY es requerida')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Función para hacer delay entre llamadas
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function getPlaceDetails(placeId) {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.append('place_id', placeId)
    url.searchParams.append('key', googleApiKey)
    url.searchParams.append('fields', 'website,formatted_phone_number,international_phone_number,rating')
    url.searchParams.append('language', 'es')
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error(`❌ Error HTTP ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.result) {
      return {
        website: data.result.website || null,
        telefono: data.result.formatted_phone_number || data.result.international_phone_number || null,
        google_rating: data.result.rating || null
      }
    }
    
    if (data.status === 'NOT_FOUND') {
      console.warn(`⚠️ Lugar no encontrado en Google`)
      return null
    }
    
    if (data.status === 'INVALID_REQUEST') {
      console.error(`❌ Solicitud inválida: ${data.error_message}`)
      return null
    }
    
    console.warn(`⚠️ Estado de Google API: ${data.status}`)
    return null
    
  } catch (error) {
    console.error(`❌ Error al obtener detalles:`, error.message)
    return null
  }
}

async function actualizarWebsites() {
  console.log('🚀 Iniciando actualización de websites desde Google Places API\n')
  
  // 1. Obtener TODAS las áreas con google_place_id
  console.log('📊 Buscando todas las áreas con Google Place ID...')
  const { data: areas, error } = await supabase
    .from('areas')
    .select('id, nombre, google_place_id, website, telefono, google_rating')
    .not('google_place_id', 'is', null)
  
  if (error) {
    console.error('❌ Error al cargar áreas:', error.message)
    process.exit(1)
  }
  
  // Procesar TODAS (no filtrar)
  const areasSinDatos = areas
  
  console.log(`✅ Encontradas ${areas.length} áreas con Google Place ID`)
  console.log(`🔄 Se procesarán TODAS las áreas para actualizar/completar sus datos\n`)
  
  if (areasSinDatos.length === 0) {
    console.log('✨ Todas las áreas ya tienen datos completos!')
    return
  }
  
  // Confirmar antes de proceder
  console.log('⚙️  Se van a actualizar las siguientes áreas:')
  areasSinDatos.slice(0, 5).forEach(area => {
    console.log(`   - ${area.nombre}`)
  })
  if (areasSinDatos.length > 5) {
    console.log(`   ... y ${areasSinDatos.length - 5} más`)
  }
  console.log('')
  
  // 2. Procesar cada área
  let actualizadas = 0
  let errores = 0
  let sinCambios = 0
  
  for (let i = 0; i < areasSinDatos.length; i++) {
    const area = areasSinDatos[i]
    const progreso = `[${i + 1}/${areasSinDatos.length}]`
    
    console.log(`${progreso} Procesando: ${area.nombre}`)
    
    try {
      // Obtener detalles de Google
      const detalles = await getPlaceDetails(area.google_place_id)
      
      if (!detalles) {
        console.log(`   ⚠️  No se pudieron obtener detalles`)
        errores++
        // Esperar un poco antes de continuar
        await delay(100)
        continue
      }
      
      // Verificar si hay datos nuevos
      const tieneNuevoDatos = 
        (detalles.website && !area.website) ||
        (detalles.telefono && !area.telefono) ||
        (detalles.google_rating && area.google_rating === null)
      
      if (!tieneNuevoDatos) {
        console.log(`   ℹ️  Sin datos nuevos`)
        sinCambios++
        await delay(100)
        continue
      }
      
      // Preparar datos a actualizar (solo los que son nuevos)
      const datosActualizar = {}
      
      if (detalles.website && !area.website) {
        datosActualizar.website = detalles.website
      }
      if (detalles.telefono && !area.telefono) {
        datosActualizar.telefono = detalles.telefono
      }
      if (detalles.google_rating && area.google_rating === null) {
        datosActualizar.google_rating = detalles.google_rating
      }
      
      // Actualizar en Supabase
      const { error: updateError } = await supabase
        .from('areas')
        .update(datosActualizar)
        .eq('id', area.id)
      
      if (updateError) {
        console.log(`   ❌ Error al actualizar: ${updateError.message}`)
        errores++
      } else {
        const campos = Object.keys(datosActualizar).join(', ')
        console.log(`   ✅ Actualizado: ${campos}`)
        actualizadas++
      }
      
      // Delay para no saturar la API (Google tiene límites)
      await delay(150) // ~6-7 requests/segundo
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      errores++
    }
  }
  
  // 3. Resumen final
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE ACTUALIZACIÓN')
  console.log('='.repeat(60))
  console.log(`✅ Áreas actualizadas:     ${actualizadas}`)
  console.log(`ℹ️  Sin cambios:            ${sinCambios}`)
  console.log(`❌ Errores:                ${errores}`)
  console.log(`📝 Total procesadas:       ${areasSinDatos.length}`)
  console.log('='.repeat(60) + '\n')
  
  if (actualizadas > 0) {
    console.log('✨ ¡Actualización completada exitosamente!')
    console.log('💡 Ahora las áreas tienen websites para el scraping de servicios')
  }
}

// Ejecutar
actualizarWebsites()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })

