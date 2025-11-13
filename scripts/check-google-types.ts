import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGoogleTypes() {
  console.log('🔍 Verificando google_types en áreas...\n')

  // Total de áreas
  const { count: total } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })

  // Áreas con google_types
  const { count: conTypes } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .not('google_types', 'is', null)

  // Áreas sin google_types
  const { count: sinTypes } = await supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .is('google_types', null)

  console.log('📊 ESTADÍSTICAS:')
  console.log(`Total de áreas: ${total}`)
  console.log(`Con google_types: ${conTypes}`)
  console.log(`Sin google_types: ${sinTypes}`)
  console.log()

  // Muestra de áreas
  const { data: muestra } = await supabase
    .from('areas')
    .select('nombre, google_place_id, google_types')
    .limit(5)

  console.log('📝 Muestra de 5 áreas:')
  muestra?.forEach((area, i) => {
    console.log(`\n${i + 1}. ${area.nombre}`)
    console.log(`   Place ID: ${area.google_place_id || 'NULL'}`)
    console.log(`   Types: ${area.google_types ? JSON.stringify(area.google_types) : 'NULL'}`)
  })
}

checkGoogleTypes()





