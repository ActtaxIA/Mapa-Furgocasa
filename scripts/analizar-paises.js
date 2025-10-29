/**
 * Script para analizar los valores de la columna "pais" en las áreas
 * y detectar posibles inconsistencias
 */

const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, '..', 'data', 'areas', 'areas.db')

console.log('📊 Analizando datos de países en la base de datos local...\n')
console.log(`Ubicación DB: ${dbPath}\n`)

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error al abrir la base de datos:', err.message)
    console.log('\n⚠️  Este script usa la DB local SQLite.')
    console.log('Para analizar datos de Supabase, usa el endpoint: /api/admin/fix-paises')
    process.exit(1)
  }

  console.log('✅ Base de datos abierta correctamente\n')

  // Query para obtener todas las áreas activas
  db.all(
    `SELECT id, nombre, pais, provincia, ciudad, codigo_postal 
     FROM areas 
     WHERE activo = 1 
     ORDER BY pais, nombre`,
    [],
    (err, rows) => {
      if (err) {
        console.error('❌ Error en query:', err.message)
        db.close()
        return
      }

      console.log(`Total de áreas activas: ${rows.length}\n`)

      // Agrupar por país
      const porPais = {}
      const problemas = []

      rows.forEach(area => {
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
            nombre: area.nombre,
            tipo: 'Espacios extra',
            actual: `"${area.pais}"`,
            correcto: `"${area.pais.trim()}"`
          })
        }

        // Detectar posibles errores de país
        const provinciasPortugal = [
          'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
          'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
          'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
          'Viana do Castelo', 'Vila Real', 'Viseu',
          'Açores', 'Madeira', 'Região Autónoma dos Açores'
        ]

        if (paisTrimmed === 'España' && provinciasPortugal.includes(area.provincia)) {
          problemas.push({
            nombre: area.nombre,
            tipo: 'País incorrecto',
            actual: 'España',
            correcto: 'Portugal',
            razon: `Provincia portuguesa: ${area.provincia}`
          })
        }

        // Detectar Andorra
        if (paisTrimmed === 'España' && area.codigo_postal && area.codigo_postal.startsWith('AD')) {
          problemas.push({
            nombre: area.nombre,
            tipo: 'País incorrecto',
            actual: 'España',
            correcto: 'Andorra',
            razon: `Código postal: ${area.codigo_postal}`
          })
        }
      })

      // Mostrar resultados
      console.log('═══════════════════════════════════════════════════════')
      console.log('📍 DISTRIBUCIÓN POR PAÍS')
      console.log('═══════════════════════════════════════════════════════\n')

      Object.keys(porPais).sort().forEach(pais => {
        const areas = porPais[pais]
        console.log(`${pais}: ${areas.length} áreas`)
        
        // Mostrar algunos ejemplos
        if (areas.length <= 5) {
          areas.forEach(a => {
            console.log(`  • ${a.nombre} (${a.ciudad || 'sin ciudad'}, ${a.provincia || 'sin provincia'})`)
          })
        } else {
          areas.slice(0, 3).forEach(a => {
            console.log(`  • ${a.nombre} (${a.ciudad || 'sin ciudad'}, ${a.provincia || 'sin provincia'})`)
          })
          console.log(`  ... y ${areas.length - 3} más`)
        }
        console.log('')
      })

      // Mostrar problemas
      if (problemas.length > 0) {
        console.log('\n═══════════════════════════════════════════════════════')
        console.log('⚠️  PROBLEMAS DETECTADOS')
        console.log('═══════════════════════════════════════════════════════\n')

        const problemsPorTipo = {}
        problemas.forEach(p => {
          if (!problemsPorTipo[p.tipo]) {
            problemsPorTipo[p.tipo] = []
          }
          problemsPorTipo[p.tipo].push(p)
        })

        Object.keys(problemsPorTipo).forEach(tipo => {
          const items = problemsPorTipo[tipo]
          console.log(`\n${tipo}: ${items.length} casos`)
          items.forEach(item => {
            console.log(`  • ${item.nombre}`)
            console.log(`    Actual: ${item.actual}`)
            console.log(`    Correcto: ${item.correcto}`)
            if (item.razon) {
              console.log(`    Razón: ${item.razon}`)
            }
          })
        })

        console.log('\n═══════════════════════════════════════════════════════')
        console.log(`Total de problemas: ${problemas.length}`)
        console.log('═══════════════════════════════════════════════════════\n')
      } else {
        console.log('\n✅ No se detectaron problemas en los datos\n')
      }

      db.close((err) => {
        if (err) {
          console.error('Error al cerrar la base de datos:', err.message)
        }
      })
    }
  )
})

