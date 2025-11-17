/**
 * Script de Limpieza Automática de datos_mercado_autocaravanas
 * 
 * Funciones:
 * 1. Elimina duplicados (mismo marca/modelo/año/precio/km)
 * 2. Archiva datos >18 meses marcándolos como no verificados
 * 3. Marca datos sospechosos como no verificados
 * 
 * Uso: npx ts-node scripts/limpiar-datos-mercado.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface DatoMercado {
  id: string
  marca: string | null
  modelo: string | null
  año: number | null
  precio: number | null
  kilometros: number | null
  created_at: string
  verificado: boolean
  origen: string | null
}

async function limpiarDatosMercado() {
  console.log('🧹 Iniciando limpieza de datos_mercado_autocaravanas...\n')

  // 1. Obtener todos los datos
  console.log('📥 Cargando datos de mercado...')
  const { data: datosMercado, error } = await supabase
    .from('datos_mercado_autocaravanas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error cargando datos:', error)
    return
  }

  console.log(`✅ Cargados ${datosMercado?.length || 0} registros\n`)

  const totalInicial = datosMercado?.length || 0
  let duplicadosEliminados = 0
  let antiguosMarcados = 0
  let sospechososMarcados = 0

  // 2. ELIMINAR DUPLICADOS
  console.log('🔄 Paso 1/3: Eliminando duplicados...')
  
  const registrosUnicos = new Map<string, DatoMercado>()
  const idsParaBorrar: string[] = []

  datosMercado?.forEach((dato: DatoMercado) => {
    // Crear clave única basada en datos importantes
    const clave = [
      dato.marca?.toLowerCase().trim(),
      dato.modelo?.toLowerCase().trim(),
      dato.año,
      dato.precio,
      dato.kilometros
    ].join('|')

    if (registrosUnicos.has(clave)) {
      // Es duplicado → marcar para borrar
      idsParaBorrar.push(dato.id)
      duplicadosEliminados++
      console.log(`   🗑️  Duplicado: ${dato.marca} ${dato.modelo} ${dato.año} - ${dato.precio}€`)
    } else {
      // Es único → guardar
      registrosUnicos.set(clave, dato)
    }
  })

  // Borrar duplicados en lotes de 100
  if (idsParaBorrar.length > 0) {
    console.log(`\n   Borrando ${idsParaBorrar.length} duplicados...`)
    
    for (let i = 0; i < idsParaBorrar.length; i += 100) {
      const lote = idsParaBorrar.slice(i, i + 100)
      const { error: deleteError } = await supabase
        .from('datos_mercado_autocaravanas')
        .delete()
        .in('id', lote)

      if (deleteError) {
        console.error(`   ❌ Error borrando lote ${i / 100 + 1}:`, deleteError)
      } else {
        console.log(`   ✅ Lote ${i / 100 + 1} borrado (${lote.length} registros)`)
      }
    }
  } else {
    console.log('   ✅ No se encontraron duplicados')
  }

  // 3. MARCAR DATOS ANTIGUOS (>18 meses)
  console.log('\n📅 Paso 2/3: Marcando datos antiguos (>18 meses)...')
  
  const hace18Meses = new Date()
  hace18Meses.setMonth(hace18Meses.getMonth() - 18)

  const datosAntiguos = Array.from(registrosUnicos.values()).filter((dato: DatoMercado) => {
    const fechaDato = new Date(dato.created_at)
    return fechaDato < hace18Meses && dato.verificado === true
  })

  if (datosAntiguos.length > 0) {
    console.log(`   Encontrados ${datosAntiguos.length} datos antiguos`)
    
    const idsAntiguos = datosAntiguos.map((d: DatoMercado) => d.id)
    
    const { error: updateError } = await supabase
      .from('datos_mercado_autocaravanas')
      .update({ 
        verificado: false,
        origen: 'Archivado (>18 meses)'
      })
      .in('id', idsAntiguos)

    if (updateError) {
      console.error('   ❌ Error actualizando datos antiguos:', updateError)
    } else {
      antiguosMarcados = datosAntiguos.length
      console.log(`   ✅ ${antiguosMarcados} datos marcados como no verificados`)
      datosAntiguos.slice(0, 5).forEach((d: DatoMercado) => {
        console.log(`      📦 ${d.marca} ${d.modelo} - ${new Date(d.created_at).toLocaleDateString()}`)
      })
    }
  } else {
    console.log('   ✅ No se encontraron datos antiguos')
  }

  // 4. MARCAR DATOS SOSPECHOSOS
  console.log('\n🔍 Paso 3/3: Identificando datos sospechosos...')
  
  const datosSospechosos = Array.from(registrosUnicos.values()).filter((dato: DatoMercado) => {
    // Criterios de sospecha:
    
    // 1. Sin precio o precio irreal
    if (!dato.precio || dato.precio < 5000 || dato.precio > 500000) {
      return true
    }
    
    // 2. Año imposible
    const añoActual = new Date().getFullYear()
    if (!dato.año || dato.año < 1990 || dato.año > añoActual + 1) {
      return true
    }
    
    // 3. Kilometraje irreal
    if (dato.kilometros && (dato.kilometros < 0 || dato.kilometros > 1000000)) {
      return true
    }
    
    // 4. Sin marca ni modelo
    if (!dato.marca && !dato.modelo) {
      return true
    }
    
    return false
  }).filter((d: DatoMercado) => d.verificado === true) // Solo los que aún están verificados

  if (datosSospechosos.length > 0) {
    console.log(`   Encontrados ${datosSospechosos.length} datos sospechosos`)
    
    const idsSospechosos = datosSospechosos.map((d: DatoMercado) => d.id)
    
    const { error: updateError } = await supabase
      .from('datos_mercado_autocaravanas')
      .update({ 
        verificado: false,
        origen: 'Datos sospechosos/incompletos'
      })
      .in('id', idsSospechosos)

    if (updateError) {
      console.error('   ❌ Error actualizando datos sospechosos:', updateError)
    } else {
      sospechososMarcados = datosSospechosos.length
      console.log(`   ✅ ${sospechososMarcados} datos marcados como no verificados`)
      datosSospechosos.slice(0, 5).forEach((d: DatoMercado) => {
        console.log(`      ⚠️  ${d.marca || 'N/A'} ${d.modelo || 'N/A'} - Precio: ${d.precio || 'N/A'}€`)
      })
    }
  } else {
    console.log('   ✅ No se encontraron datos sospechosos')
  }

  // 5. RESUMEN FINAL
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE LIMPIEZA')
  console.log('='.repeat(60))
  console.log(`📥 Registros iniciales:       ${totalInicial}`)
  console.log(`🗑️  Duplicados eliminados:    ${duplicadosEliminados}`)
  console.log(`📅 Antiguos marcados:         ${antiguosMarcados}`)
  console.log(`⚠️  Sospechosos marcados:     ${sospechososMarcados}`)
  console.log(`✅ Registros finales:         ${totalInicial - duplicadosEliminados}`)
  console.log(`🔄 Registros verificados:     ${totalInicial - duplicadosEliminados - antiguosMarcados - sospechososMarcados}`)
  console.log('='.repeat(60))

  // 6. OBTENER ESTADÍSTICAS ACTUALIZADAS
  console.log('\n📊 Estadísticas finales por fuente:')
  
  const { data: stats, error: statsError } = await supabase
    .from('datos_mercado_autocaravanas')
    .select('origen, verificado')

  if (!statsError && stats) {
    const porFuente = new Map<string, { total: number, verificados: number }>()
    
    stats.forEach((s: any) => {
      const fuente = s.origen || 'Desconocido'
      if (!porFuente.has(fuente)) {
        porFuente.set(fuente, { total: 0, verificados: 0 })
      }
      const stat = porFuente.get(fuente)!
      stat.total++
      if (s.verificado) stat.verificados++
    })

    porFuente.forEach((stat, fuente) => {
      console.log(`   ${fuente}: ${stat.total} total (${stat.verificados} verificados)`)
    })
  }

  console.log('\n✅ Limpieza completada!\n')
}

// Ejecutar
limpiarDatosMercado()
  .then(() => {
    console.log('🎉 Script finalizado correctamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error)
    process.exit(1)
  })

