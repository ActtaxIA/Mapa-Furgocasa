/**
 * Script para analizar y verificar los valores de la columna "pais"
 * Detecta inconsistencias y sugiere correcciones
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.log('   Asegúrate de tener .env.local con:')
  console.log('   - NEXT_PUBLIC_SUPABASE_URL')
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPaises() {
  try {
    console.log('🔍 Analizando columna "pais" en Supabase...\n')

    // Obtener todas las áreas activas
    const { data: areas, error } = await supabase
      .from('areas')
      .select('id, nombre, pais, provincia, ciudad, codigo_postal')
      .eq('activo', true)
      .order('pais, nombre')

    if (error) {
      console.error('❌ Error al obtener áreas:', error.message)
      process.exit(1)
    }

    console.log(`✅ Total áreas activas: ${areas.length}\n`)

    // Agrupar por país
    const porPais = {}
    const problemas = []

    areas.forEach(area => {
      const pais = area.pais || 'NULL'
      const paisTrimmed = area.pais ? area.pais.trim() : 'NULL'

      // Contar por país
      if (!porPais[paisTrimmed]) {
        porPais[paisTrimmed] = []
      }
      porPais[paisTrimmed].push(area)

      // Detectar espacios extra
      if (area.pais && area.pais !== area.pais.trim()) {
        problemas.push({
          id: area.id,
          nombre: area.nombre,
          tipo: 'Espacios extra',
          paisActual: `"${area.pais}"`,
          paisCorrecto: `"${area.pais.trim()}"`
        })
      }

      // Detectar posibles países incorrectos
      const provinciasPortugal = [
        'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
        'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
        'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
        'Viana do Castelo', 'Vila Real', 'Viseu',
        'Açores', 'Madeira', 'Região Autónoma dos Açores',
        'Região Autónoma da Madeira'
      ]

      if (paisTrimmed === 'España' && provinciasPortugal.includes(area.provincia)) {
        problemas.push({
          id: area.id,
          nombre: area.nombre,
          tipo: 'País incorrecto',
          paisActual: 'España',
          paisCorrecto: 'Portugal',
          razon: `Provincia portuguesa: ${area.provincia}`,
          ciudad: area.ciudad
        })
      }

      // Detectar Andorra
      if (paisTrimmed === 'España' && area.codigo_postal && area.codigo_postal.startsWith('AD')) {
        problemas.push({
          id: area.id,
          nombre: area.nombre,
          tipo: 'País incorrecto',
          paisActual: 'España',
          paisCorrecto: 'Andorra',
          razon: `Código postal: ${area.codigo_postal}`
        })
      }
    })

    // Mostrar distribución por país
    console.log('═══════════════════════════════════════════════════════')
    console.log('📍 DISTRIBUCIÓN POR PAÍS')
    console.log('═══════════════════════════════════════════════════════\n')

    Object.keys(porPais).sort().forEach(pais => {
      const areasDelPais = porPais[pais]
      console.log(`\n${pais}: ${areasDelPais.length} áreas`)

      // Mostrar ejemplos
      if (areasDelPais.length <= 5) {
        areasDelPais.forEach(a => {
          console.log(`   • ${a.nombre}`)
          console.log(`     ${a.ciudad || '(sin ciudad)'}, ${a.provincia || '(sin provincia)'}`)
        })
      } else {
        areasDelPais.slice(0, 3).forEach(a => {
          console.log(`   • ${a.nombre}`)
          console.log(`     ${a.ciudad || '(sin ciudad)'}, ${a.provincia || '(sin provincia)'}`)
        })
        console.log(`   ... y ${areasDelPais.length - 3} más`)
      }
    })

    // Mostrar problemas
    if (problemas.length > 0) {
      console.log('\n\n═══════════════════════════════════════════════════════')
      console.log('⚠️  PROBLEMAS DETECTADOS')
      console.log('═══════════════════════════════════════════════════════')

      const porTipo = {}
      problemas.forEach(p => {
        if (!porTipo[p.tipo]) {
          porTipo[p.tipo] = []
        }
        porTipo[p.tipo].push(p)
      })

      Object.keys(porTipo).forEach(tipo => {
        const items = porTipo[tipo]
        console.log(`\n\n${tipo}: ${items.length} caso(s)`)
        console.log('-'.repeat(60))
        
        items.forEach((item, i) => {
          console.log(`\n${i + 1}. ${item.nombre}`)
          console.log(`   ID: ${item.id}`)
          console.log(`   País actual: ${item.paisActual}`)
          console.log(`   País correcto: ${item.paisCorrecto}`)
          if (item.razon) {
            console.log(`   Razón: ${item.razon}`)
          }
          if (item.ciudad) {
            console.log(`   Ciudad: ${item.ciudad}`)
          }
        })
      })

      console.log('\n\n═══════════════════════════════════════════════════════')
      console.log(`📊 Total de problemas: ${problemas.length}`)
      console.log('═══════════════════════════════════════════════════════')

      console.log('\n💡 PARA CORREGIR ESTOS PROBLEMAS:')
      console.log('   1. Como admin, accede a: /api/admin/fix-paises?fix=true')
      console.log('   2. O edita manualmente en el panel de admin')
      console.log('')

    } else {
      console.log('\n\n✅ No se detectaron problemas en los datos\n')
    }

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

checkPaises()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error fatal:', error)
    process.exit(1)
  })

