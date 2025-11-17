/**
 * Script de Limpieza de Datos de Mercado
 * 
 * Funciones:
 * 1. Elimina duplicados exactos
 * 2. Marca datos >18 meses como "no verificados"
 * 3. Marca datos sospechosos como "no verificados"
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Utilidades
function normalizarTexto(texto) {
  if (!texto) return ''
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function esDuplicado(dato1, dato2) {
  const marca1 = normalizarTexto(dato1.marca)
  const marca2 = normalizarTexto(dato2.marca)
  const modelo1 = normalizarTexto(dato1.modelo)
  const modelo2 = normalizarTexto(dato2.modelo)
  
  return (
    marca1 === marca2 &&
    modelo1 === modelo2 &&
    dato1.año === dato2.año &&
    Math.abs((dato1.precio || 0) - (dato2.precio || 0)) < 500 &&
    Math.abs((dato1.kilometros || 0) - (dato2.kilometros || 0)) < 1000
  )
}

function esDatoAntiguo(dato) {
  // Usar created_at como referencia de antigüedad
  if (!dato.created_at) return false
  const hace18Meses = new Date()
  hace18Meses.setMonth(hace18Meses.getMonth() - 18)
  return new Date(dato.created_at) < hace18Meses
}

function esDatoSospechoso(dato) {
  // Sin marca ni modelo
  if (!dato.marca || !dato.modelo || dato.marca === 'N/A' || dato.modelo === 'N/A') {
    return true
  }
  
  // Precio irreal
  if (!dato.precio || dato.precio < 5000 || dato.precio > 500000) {
    return true
  }
  
  // Año imposible
  const añoActual = new Date().getFullYear()
  if (!dato.año || dato.año < 1990 || dato.año > añoActual + 1) {
    return true
  }
  
  // Kilometraje absurdo
  if (dato.kilometros && (dato.kilometros < 0 || dato.kilometros > 1000000)) {
    return true
  }
  
  return false
}

// Función principal
async function limpiarDatosMercado() {
  console.log('🧹 Iniciando limpieza de datos_mercado_autocaravanas...\n')
  
  try {
    // 1. Cargar todos los datos
    console.log('📥 Cargando datos de mercado...')
    const { data: todos, error: errorCarga } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (errorCarga) throw errorCarga
    
    console.log(`✅ Cargados ${todos.length} registros\n`)
    
    const estadisticas = {
      inicial: todos.length,
      duplicadosEliminados: 0,
      antiguosMarcados: 0,
      sospechososMarcados: 0
    }
    
    // 2. Eliminar duplicados
    console.log('🔄 Paso 1/3: Eliminando duplicados...')
    const duplicadosIds = []
    const vistos = new Set()
    
    for (let i = 0; i < todos.length; i++) {
      const actual = todos[i]
      let esDup = false
      
      for (let j = 0; j < i; j++) {
        if (!duplicadosIds.includes(todos[j].id) && esDuplicado(actual, todos[j])) {
          duplicadosIds.push(actual.id)
          console.log(`   🗑️  Duplicado: ${actual.marca} ${actual.modelo} ${actual.año} - ${actual.precio}€`)
          esDup = true
          break
        }
      }
    }
    
    if (duplicadosIds.length > 0) {
      // Borrar en lotes de 50
      const BATCH_SIZE = 50
      for (let i = 0; i < duplicadosIds.length; i += BATCH_SIZE) {
        const lote = duplicadosIds.slice(i, i + BATCH_SIZE)
        const { error: errorBorrado } = await supabase
          .from('datos_mercado_autocaravanas')
          .delete()
          .in('id', lote)
        
        if (errorBorrado) {
          console.error(`   ❌ Error borrando lote ${Math.floor(i/BATCH_SIZE) + 1}:`, errorBorrado.message)
        } else {
          console.log(`   ✅ Lote ${Math.floor(i/BATCH_SIZE) + 1} borrado (${lote.length} registros)`)
        }
      }
      estadisticas.duplicadosEliminados = duplicadosIds.length
    } else {
      console.log('   ✨ No se encontraron duplicados')
    }
    console.log('')
    
    // 3. Marcar datos antiguos
    console.log('📅 Paso 2/3: Marcando datos antiguos (>18 meses)...')
    const antiguos = todos.filter(d => !duplicadosIds.includes(d.id) && esDatoAntiguo(d))
    
    if (antiguos.length > 0) {
      console.log(`   Encontrados ${antiguos.length} datos antiguos`)
      const { error: errorAntiguos } = await supabase
        .from('datos_mercado_autocaravanas')
        .update({ verificado: false })
        .in('id', antiguos.map(d => d.id))
      
      if (errorAntiguos) {
        console.error('   ❌ Error:', errorAntiguos.message)
      } else {
        console.log(`   ✅ ${antiguos.length} datos marcados como no verificados`)
        antiguos.slice(0, 5).forEach(d => {
          const fecha = new Date(d.created_at).toLocaleDateString('es-ES')
          console.log(`      📦 ${d.marca} ${d.modelo} - ${fecha}`)
        })
        if (antiguos.length > 5) {
          console.log(`      ... y ${antiguos.length - 5} más`)
        }
        estadisticas.antiguosMarcados = antiguos.length
      }
    } else {
      console.log('   ✨ No se encontraron datos antiguos')
    }
    console.log('')
    
    // 4. Marcar datos sospechosos
    console.log('🔍 Paso 3/3: Identificando datos sospechosos...')
    const sospechosos = todos.filter(d => 
      !duplicadosIds.includes(d.id) && 
      !antiguos.find(a => a.id === d.id) &&
      esDatoSospechoso(d)
    )
    
    if (sospechosos.length > 0) {
      console.log(`   Encontrados ${sospechosos.length} datos sospechosos`)
      const { error: errorSospechosos } = await supabase
        .from('datos_mercado_autocaravanas')
        .update({ verificado: false })
        .in('id', sospechosos.map(d => d.id))
      
      if (errorSospechosos) {
        console.error('   ❌ Error:', errorSospechosos.message)
      } else {
        console.log(`   ✅ ${sospechosos.length} datos marcados como no verificados`)
        sospechosos.slice(0, 5).forEach(d => {
          const razon = !d.marca || d.marca === 'N/A' ? 'Sin marca' :
                       !d.precio || d.precio < 5000 ? `Precio: ${d.precio}€` :
                       d.precio > 500000 ? `Precio: ${d.precio}€` :
                       !d.año || d.año < 1990 ? `Año: ${d.año}` :
                       d.kilometros > 1000000 ? `KM: ${d.kilometros}` : 'Datos incompletos'
          console.log(`      ⚠️  ${d.marca || 'N/A'} ${d.modelo || 'N/A'} - ${razon}`)
        })
        if (sospechosos.length > 5) {
          console.log(`      ... y ${sospechosos.length - 5} más`)
        }
        estadisticas.sospechososMarcados = sospechosos.length
      }
    } else {
      console.log('   ✨ No se encontraron datos sospechosos')
    }
    console.log('')
    
    // 5. Resumen final
    const { data: finales, error: errorFinales } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*', { count: 'exact', head: false })
    
    const verificados = finales ? finales.filter(d => d.verificado !== false).length : 0
    
    console.log('============================================================')
    console.log('📊 RESUMEN DE LIMPIEZA')
    console.log('============================================================')
    console.log(`📥 Registros iniciales:       ${estadisticas.inicial}`)
    console.log(`🗑️  Duplicados eliminados:    ${estadisticas.duplicadosEliminados}`)
    console.log(`📅 Antiguos marcados:         ${estadisticas.antiguosMarcados}`)
    console.log(`⚠️  Sospechosos marcados:     ${estadisticas.sospechososMarcados}`)
    console.log(`✅ Registros finales:         ${finales ? finales.length : 0}`)
    console.log(`🔄 Registros verificados:     ${verificados}`)
    console.log('============================================================\n')
    
    // 6. Estadísticas por fuente
    if (finales && finales.length > 0) {
      console.log('📊 Estadísticas finales por fuente:')
      const porFuente = {}
      finales.forEach(d => {
        const fuente = d.fuente || 'Sin fuente'
        if (!porFuente[fuente]) {
          porFuente[fuente] = { total: 0, verificados: 0 }
        }
        porFuente[fuente].total++
        if (d.verificado !== false) {
          porFuente[fuente].verificados++
        }
      })
      
      Object.entries(porFuente).forEach(([fuente, stats]) => {
        console.log(`   ${fuente}: ${stats.total} total (${stats.verificados} verificados)`)
      })
      console.log('')
    }
    
    console.log('✅ Limpieza completada!')
    console.log('🎉 Script finalizado correctamente\n')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar
limpiarDatosMercado()
