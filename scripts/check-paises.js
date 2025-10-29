const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rwcgvclnwkdymbgsmdgj.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y2d2Y2xud2tkeW1iZ3NtZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2OTU2MzQsImV4cCI6MjA0NTI3MTYzNH0.tDKYoiEtT_tNd62p09jjwUYPQP0WBFZ4UKmz0KU2x5w'
)

async function checkPaises() {
  try {
    console.log('🔍 Analizando la columna "pais" en la base de datos...\n')

    const { data, error } = await supabase
      .from('areas')
      .select('id, nombre, pais, ciudad, provincia')
      .eq('activo', true)
      .order('pais')

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log(`✅ Total áreas activas: ${data.length}\n`)

    // Agrupar por país
    const porPais = {}
    data.forEach(area => {
      const pais = area.pais || 'NULL'
      if (!porPais[pais]) {
        porPais[pais] = []
      }
      porPais[pais].push(area)
    })

    console.log('=== RESUMEN POR PAÍS ===\n')
    
    Object.keys(porPais).sort().forEach(pais => {
      const areas = porPais[pais]
      console.log(`📍 ${pais}: ${areas.length} áreas`)
      
      // Mostrar algunas áreas de ejemplo
      if (areas.length <= 5) {
        areas.forEach(a => {
          console.log(`   - ${a.nombre} (${a.ciudad || 'sin ciudad'}, ${a.provincia || 'sin provincia'})`)
        })
      } else {
        areas.slice(0, 3).forEach(a => {
          console.log(`   - ${a.nombre} (${a.ciudad || 'sin ciudad'}, ${a.provincia || 'sin provincia'})`)
        })
        console.log(`   ... y ${areas.length - 3} más`)
      }
      console.log('')
    })

    // Verificar problemas comunes
    console.log('\n=== VERIFICACIÓN DE PROBLEMAS ===\n')
    
    const problemasEspacios = data.filter(a => a.pais && (a.pais !== a.pais.trim()))
    if (problemasEspacios.length > 0) {
      console.log(`⚠️  ${problemasEspacios.length} áreas tienen espacios extras en el país`)
      problemasEspacios.slice(0, 3).forEach(a => {
        console.log(`   - "${a.pais}" (ID: ${a.id.substring(0, 8)}...)`)
      })
    }

    const paisesVariantes = Object.keys(porPais).filter(p => 
      p.toLowerCase().includes('espa') || p.toLowerCase().includes('port')
    )
    if (paisesVariantes.length > 0) {
      console.log(`\n📋 Variantes de España/Portugal encontradas:`)
      paisesVariantes.forEach(p => {
        console.log(`   - "${p}" (${porPais[p].length} áreas)`)
      })
    }

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

checkPaises()

