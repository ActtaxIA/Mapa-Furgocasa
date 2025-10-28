require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las credenciales de Supabase en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapeo de servicios inglés -> español
const serviceMapping = {
  'water': 'agua',
  'electricity': 'electricidad',
  'shower': 'duchas',
  'chemical_disposal': 'vaciado_aguas_negras',
  'grey_water_disposal': 'vaciado_aguas_grises',
  'restaurant': 'restaurante',
  'laundry': 'lavanderia',
  'wifi': 'wifi',
  'wc': 'wc',
  'supermarket': 'supermercado',
  'pet_area': 'zona_mascotas',
  'playground': 'area_juegos'
}

async function fixServicesLanguage() {
  console.log('🔧 CORRIGIENDO IDIOMA DE SERVICIOS EN SUPABASE')
  console.log('='.repeat(60))
  console.log('')

  try {
    // Obtener todas las áreas
    const { data: areas, error } = await supabase
      .from('areas')
      .select('id, nombre, servicios')

    if (error) throw error

    console.log(`📊 Total de áreas a actualizar: ${areas.length}\n`)

    let actualizadas = 0
    let errores = 0

    for (const area of areas) {
      try {
        const serviciosOriginales = area.servicios || {}
        const serviciosActualizados = {}

        // Convertir servicios de inglés a español
        for (const [key, value] of Object.entries(serviciosOriginales)) {
          // Si el servicio está en inglés, usar la traducción
          if (serviceMapping[key]) {
            serviciosActualizados[serviceMapping[key]] = value
          } 
          // Si ya está en español, mantenerlo
          else if (Object.values(serviceMapping).includes(key)) {
            serviciosActualizados[key] = value
          }
        }

        // Solo actualizar si hay cambios
        if (Object.keys(serviciosActualizados).length > 0) {
          const { error: updateError } = await supabase
            .from('areas')
            .update({ servicios: serviciosActualizados })
            .eq('id', area.id)

          if (updateError) throw updateError

          actualizadas++
          if (actualizadas % 50 === 0) {
            console.log(`  ✅ ${actualizadas} áreas actualizadas...`)
          }
        }

      } catch (error) {
        errores++
        console.log(`  ❌ Error al actualizar ${area.nombre}: ${error.message}`)
      }
    }

    console.log('\n')
    console.log('='.repeat(60))
    console.log('📈 RESUMEN')
    console.log('='.repeat(60))
    console.log(`✅ Áreas actualizadas: ${actualizadas}`)
    console.log(`❌ Errores: ${errores}`)
    console.log('')
    console.log('✨ Los servicios ahora están en español y coinciden con los filtros')

  } catch (error) {
    console.error('❌ Error general:', error.message)
    process.exit(1)
  }
}

fixServicesLanguage()

