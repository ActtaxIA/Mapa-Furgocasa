/**
 * Script para verificar estadísticas de áreas
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStats() {
  console.log('📊 Verificando estadísticas de áreas...\n')
  
  // Total de áreas
  const { count: totalAreas, error: error1 } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
  
  // Áreas con google_place_id
  const { count: conPlaceId, error: error2 } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .not('google_place_id', 'is', null)
  
  // Áreas sin google_place_id
  const { count: sinPlaceId, error: error3 } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .is('google_place_id', null)
  
  // Áreas con website
  const { count: conWebsite, error: error4 } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .not('website', 'is', null)
  
  // Áreas sin website
  const { count: sinWebsite, error: error5 } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .is('website', null)
  
  console.log('=' .repeat(60))
  console.log('📈 ESTADÍSTICAS GENERALES')
  console.log('=' .repeat(60))
  console.log(`📦 Total de áreas:              ${totalAreas || 0}`)
  console.log(`🆔 Con Google Place ID:         ${conPlaceId || 0}`)
  console.log(`❌ Sin Google Place ID:         ${sinPlaceId || 0}`)
  console.log(`🌐 Con website:                 ${conWebsite || 0}`)
  console.log(`⚠️  Sin website:                 ${sinWebsite || 0}`)
  console.log('=' .repeat(60))
  console.log()
  
  // Muestra de áreas sin google_place_id
  const { data: muestraSinPlaceId } = await supabase
    .from('areas')
    .select('nombre, website, telefono')
    .is('google_place_id', null)
    .limit(10)
  
  console.log('📝 Muestra de áreas SIN Google Place ID (primeras 10):')
  console.log('-' .repeat(60))
  muestraSinPlaceId?.forEach((area, i) => {
    console.log(`${i + 1}. ${area.nombre}`)
    console.log(`   Website: ${area.website || '(sin website)'}`)
    console.log(`   Teléfono: ${area.telefono || '(sin teléfono)'}`)
  })
  console.log()
  
  console.log('💡 CONCLUSIÓN:')
  console.log(`   ${sinPlaceId} áreas NO tienen Google Place ID`)
  console.log(`   → No se pueden actualizar automáticamente desde Google`)
  console.log(`   → Fueron agregadas manualmente o por migración`)
  console.log()
}

checkStats()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })

