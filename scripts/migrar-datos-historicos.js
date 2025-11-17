/**
 * Script de Migración de Datos Históricos
 * 
 * Objetivo: Poblar datos_mercado_autocaravanas con datos existentes en:
 * 1. vehiculo_valoracion_economica (compras y ventas reales)
 * 2. valoracion_ia_informes (precios promedio para estadísticas)
 * 
 * Ejecutar una sola vez para migrar datos históricos
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrarDatosHistoricos() {
  console.log('🚀 Iniciando migración de datos históricos...\n')
  
  const estadisticas = {
    comprasEncontradas: 0,
    comprasMigradas: 0,
    ventasEncontradas: 0,
    ventasMigradas: 0,
    valoracionesEncontradas: 0,
    valoracionesMigradas: 0,
    errores: []
  }
  
  try {
    // ========================================
    // 1. MIGRAR COMPRAS DE USUARIOS
    // ========================================
    console.log('📦 Paso 1/3: Migrando compras de usuarios...')
    
    const { data: compras, error: errorCompras } = await supabase
      .from('vehiculo_valoracion_economica')
      .select(`
        *,
        vehiculos_registrados (
          marca,
          modelo,
          año
        )
      `)
      .not('precio_compra', 'is', null)
      .not('fecha_compra', 'is', null)
    
    if (errorCompras) {
      console.error('❌ Error cargando compras:', errorCompras.message)
    } else {
      estadisticas.comprasEncontradas = compras?.length || 0
      console.log(`   ✅ Encontradas ${estadisticas.comprasEncontradas} compras con precio y fecha`)
      
      if (compras && compras.length > 0) {
        const comprasParaInsertar = []
        
        for (const compra of compras) {
          const vehiculo = Array.isArray(compra.vehiculos_registrados) 
            ? compra.vehiculos_registrados[0] 
            : compra.vehiculos_registrados
          
          if (!vehiculo || !vehiculo.marca || !vehiculo.modelo) {
            console.warn(`   ⚠️  Compra sin datos de vehículo: ${compra.id}`)
            continue
          }
          
          // Usar pvp_base_particular si existe, sino precio_compra
          const precioFinal = compra.pvp_base_particular || compra.precio_compra
          
          comprasParaInsertar.push({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            año: vehiculo.año,
            precio: precioFinal,
            kilometros: compra.kilometros_compra || null,
            fecha_transaccion: compra.fecha_compra,
            verificado: true,
            estado: compra.estado_general || 'Usado',
            origen: compra.origen_compra || 'Usuario',
            tipo_dato: 'Compra Real Usuario',
            pais: compra.pais_compra || 'España',
            tipo_combustible: null,
            tipo_calefaccion: null,
            homologacion: null,
            region: null
          })
        }
        
        if (comprasParaInsertar.length > 0) {
          const { data: insertadas, error: errorInsert } = await supabase
            .from('datos_mercado_autocaravanas')
            .insert(comprasParaInsertar)
            .select()
          
          if (errorInsert) {
            console.error('   ❌ Error insertando compras:', errorInsert.message)
            estadisticas.errores.push(`Compras: ${errorInsert.message}`)
          } else {
            estadisticas.comprasMigradas = insertadas?.length || 0
            console.log(`   ✅ Migradas ${estadisticas.comprasMigradas} compras`)
            
            // Mostrar primeras 3 como ejemplo
            if (insertadas && insertadas.length > 0) {
              console.log('   📋 Ejemplos:')
              insertadas.slice(0, 3).forEach(c => {
                console.log(`      - ${c.marca} ${c.modelo} ${c.año}: ${c.precio}€ (${c.kilometros || 'N/A'} km)`)
              })
            }
          }
        } else {
          console.log('   ⚠️  No hay compras válidas para migrar')
        }
      }
    }
    console.log('')
    
    // ========================================
    // 2. MIGRAR VENTAS DE USUARIOS
    // ========================================
    console.log('💰 Paso 2/3: Migrando ventas de usuarios...')
    
    const { data: ventas, error: errorVentas } = await supabase
      .from('vehiculo_valoracion_economica')
      .select(`
        *,
        vehiculos_registrados (
          marca,
          modelo,
          año
        )
      `)
      .eq('vendido', true)
      .not('precio_venta_final', 'is', null)
      .not('fecha_venta', 'is', null)
    
    if (errorVentas) {
      console.error('❌ Error cargando ventas:', errorVentas.message)
    } else {
      estadisticas.ventasEncontradas = ventas?.length || 0
      console.log(`   ✅ Encontradas ${estadisticas.ventasEncontradas} ventas completadas`)
      
      if (ventas && ventas.length > 0) {
        const ventasParaInsertar = []
        
        for (const venta of ventas) {
          const vehiculo = Array.isArray(venta.vehiculos_registrados)
            ? venta.vehiculos_registrados[0]
            : venta.vehiculos_registrados
          
          if (!vehiculo || !vehiculo.marca || !vehiculo.modelo) {
            console.warn(`   ⚠️  Venta sin datos de vehículo: ${venta.id}`)
            continue
          }
          
          ventasParaInsertar.push({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            año: vehiculo.año,
            precio: venta.precio_venta_final,
            kilometros: venta.kilometros_venta || null,
            fecha_transaccion: venta.fecha_venta,
            verificado: true,
            estado: venta.estado_venta || 'Vendido',
            origen: 'Venta Real Usuario',
            tipo_dato: 'Venta Real Usuario',
            pais: 'España',
            tipo_combustible: null,
            tipo_calefaccion: null,
            homologacion: null,
            region: null
          })
        }
        
        if (ventasParaInsertar.length > 0) {
          const { data: insertadas, error: errorInsert } = await supabase
            .from('datos_mercado_autocaravanas')
            .insert(ventasParaInsertar)
            .select()
          
          if (errorInsert) {
            console.error('   ❌ Error insertando ventas:', errorInsert.message)
            estadisticas.errores.push(`Ventas: ${errorInsert.message}`)
          } else {
            estadisticas.ventasMigradas = insertadas?.length || 0
            console.log(`   ✅ Migradas ${estadisticas.ventasMigradas} ventas`)
            
            // Mostrar primeras 3 como ejemplo
            if (insertadas && insertadas.length > 0) {
              console.log('   📋 Ejemplos:')
              insertadas.slice(0, 3).forEach(v => {
                console.log(`      - ${v.marca} ${v.modelo} ${v.año}: ${v.precio}€ (${v.kilometros || 'N/A'} km)`)
              })
            }
          }
        } else {
          console.log('   ⚠️  No hay ventas válidas para migrar')
        }
      }
    }
    console.log('')
    
    // ========================================
    // 3. MIGRAR VALORACIONES IA (PROMEDIO)
    // ========================================
    console.log('🤖 Paso 3/3: Migrando valoraciones IA (solo para estadísticas)...')
    
    const { data: valoraciones, error: errorValoraciones } = await supabase
      .from('valoracion_ia_informes')
      .select(`
        *,
        vehiculos_registrados (
          marca,
          modelo,
          año
        )
      `)
      .not('precio_objetivo', 'is', null)
    
    if (errorValoraciones) {
      console.error('❌ Error cargando valoraciones:', errorValoraciones.message)
    } else {
      estadisticas.valoracionesEncontradas = valoraciones?.length || 0
      console.log(`   ✅ Encontradas ${estadisticas.valoracionesEncontradas} valoraciones IA`)
      
      if (valoraciones && valoraciones.length > 0) {
        const valoracionesParaInsertar = []
        
        for (const val of valoraciones) {
          const vehiculo = Array.isArray(val.vehiculos_registrados)
            ? val.vehiculos_registrados[0]
            : val.vehiculos_registrados
          
          if (!vehiculo || !vehiculo.marca || !vehiculo.modelo) {
            console.warn(`   ⚠️  Valoración sin datos de vehículo: ${val.id}`)
            continue
          }
          
          // Calcular precio promedio
          let precioPromedio = val.precio_objetivo
          if (val.precio_salida && val.precio_minimo) {
            precioPromedio = Math.round((val.precio_salida + val.precio_objetivo + val.precio_minimo) / 3)
          }
          
          valoracionesParaInsertar.push({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            año: vehiculo.año,
            precio: precioPromedio,
            kilometros: null, // No tenemos km en valoracion_ia_informes
            fecha_transaccion: val.created_at.split('T')[0],
            verificado: false, // IMPORTANTE: false para que IA no lo use como comparable
            estado: 'Valorado IA',
            origen: 'Valoración IA Histórica',
            tipo_dato: 'Estimación IA',
            pais: 'España',
            tipo_combustible: null,
            tipo_calefaccion: null,
            homologacion: null,
            region: null
          })
        }
        
        if (valoracionesParaInsertar.length > 0) {
          const { data: insertadas, error: errorInsert } = await supabase
            .from('datos_mercado_autocaravanas')
            .insert(valoracionesParaInsertar)
            .select()
          
          if (errorInsert) {
            console.error('   ❌ Error insertando valoraciones:', errorInsert.message)
            estadisticas.errores.push(`Valoraciones: ${errorInsert.message}`)
          } else {
            estadisticas.valoracionesMigradas = insertadas?.length || 0
            console.log(`   ✅ Migradas ${estadisticas.valoracionesMigradas} valoraciones (verificado=false)`)
            
            // Mostrar primeras 3 como ejemplo
            if (insertadas && insertadas.length > 0) {
              console.log('   📋 Ejemplos:')
              insertadas.slice(0, 3).forEach(v => {
                console.log(`      - ${v.marca} ${v.modelo} ${v.año}: ${v.precio}€ (estimación)`)
              })
            }
          }
        } else {
          console.log('   ⚠️  No hay valoraciones válidas para migrar')
        }
      }
    }
    console.log('')
    
    // ========================================
    // 4. RESUMEN FINAL
    // ========================================
    const { data: finales, error: errorFinales } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
    
    const totalMigrado = estadisticas.comprasMigradas + estadisticas.ventasMigradas + estadisticas.valoracionesMigradas
    const verificados = finales ? finales.filter(d => d.verificado === true).length : 0
    const noVerificados = finales ? finales.filter(d => d.verificado === false).length : 0
    
    console.log('============================================================')
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('============================================================')
    console.log('COMPRAS:')
    console.log(`   Encontradas:  ${estadisticas.comprasEncontradas}`)
    console.log(`   Migradas:     ${estadisticas.comprasMigradas}`)
    console.log('')
    console.log('VENTAS:')
    console.log(`   Encontradas:  ${estadisticas.ventasEncontradas}`)
    console.log(`   Migradas:     ${estadisticas.ventasMigradas}`)
    console.log('')
    console.log('VALORACIONES IA:')
    console.log(`   Encontradas:  ${estadisticas.valoracionesEncontradas}`)
    console.log(`   Migradas:     ${estadisticas.valoracionesMigradas} (verificado=false)`)
    console.log('')
    console.log('TOTALES:')
    console.log(`   Total migrado:        ${totalMigrado}`)
    console.log(`   Verificados (usables):   ${verificados}`)
    console.log(`   No verificados (stats):  ${noVerificados}`)
    console.log(`   Total en BD:          ${finales?.length || 0}`)
    console.log('============================================================\n')
    
    if (estadisticas.errores.length > 0) {
      console.log('⚠️  ERRORES ENCONTRADOS:')
      estadisticas.errores.forEach(err => console.log(`   - ${err}`))
      console.log('')
    }
    
    // Desglose por fuente
    if (finales && finales.length > 0) {
      console.log('📊 Desglose por tipo de dato:')
      const porTipo = {}
      finales.forEach(d => {
        const tipo = d.tipo_dato || 'Sin tipo'
        porTipo[tipo] = (porTipo[tipo] || 0) + 1
      })
      Object.entries(porTipo)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tipo, count]) => {
          const verificados = finales.filter(d => d.tipo_dato === tipo && d.verificado === true).length
          console.log(`   ${tipo}: ${count} total (${verificados} verificados)`)
        })
      console.log('')
    }
    
    console.log('✅ Migración completada!')
    console.log('🎉 Datos históricos ahora disponibles para análisis y valoraciones\n')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    console.error(error)
    process.exit(1)
  }
}

migrarDatosHistoricos()

