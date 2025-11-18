/**
 * Script para sincronizar valoraciones IA a datos_mercado_autocaravanas
 * 
 * Este script:
 * 1. Lee todos los informes de valoración IA
 * 2. Extrae precio_objetivo, marca, modelo, año, km
 * 3. Guarda en datos_mercado_autocaravanas (sin duplicados)
 * 4. NO toca el proceso de valoración (funciona perfecto)
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

async function sincronizarValoraciones() {
  console.log('🔄 Sincronizando valoraciones IA a datos_mercado_autocaravanas...\n')
  
  try {
    // 1. Cargar todos los informes de valoración IA
    console.log('📥 Cargando informes de valoración IA...')
    const { data: informes, error: errorInformes } = await supabase
      .from('valoracion_ia_informes')
      .select(`
        id,
        vehiculo_id,
        precio_objetivo,
        fecha_valoracion,
        vehiculos_registrados!inner(
          marca,
          modelo,
          ano,
          kilometros_actual
        )
      `)
      .not('precio_objetivo', 'is', null)
      .order('fecha_valoracion', { ascending: false })
    
    if (errorInformes) throw errorInformes
    
    console.log(`✅ Cargados ${informes.length} informes de valoración\n`)
    
    const estadisticas = {
      total: informes.length,
      nuevos: 0,
      duplicados: 0,
      errores: 0
    }
    
    // 2. Procesar cada informe
    for (const informe of informes) {
      const vehiculo = informe.vehiculos_registrados
      
      if (!vehiculo || !vehiculo.marca || !vehiculo.modelo) {
        console.log(`   ⚠️  Informe ${informe.id}: Faltan datos del vehículo (saltando)`)
        estadisticas.errores++
        continue
      }
      
      const precioObjetivo = Math.round(informe.precio_objetivo)
      
      // 3. Verificar si ya existe en datos_mercado
      const { data: existente, error: errorCheck } = await supabase
        .from('datos_mercado_autocaravanas')
        .select('id')
        .eq('marca', vehiculo.marca)
        .eq('modelo', vehiculo.modelo)
        .eq('año', vehiculo.ano)
        .eq('precio', precioObjetivo)
        .maybeSingle()
      
      if (errorCheck && errorCheck.code !== 'PGRST116') {
        console.log(`   ❌ Error verificando duplicado:`, errorCheck.message)
        estadisticas.errores++
        continue
      }
      
      if (existente) {
        // Ya existe
        console.log(`   🔄 Duplicado: ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.ano} - ${precioObjetivo}€ (ya existe)`)
        estadisticas.duplicados++
        continue
      }
      
      // 4. NO existe, insertar
      const { error: errorInsert } = await supabase
        .from('datos_mercado_autocaravanas')
        .insert({
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          año: vehiculo.ano,
          precio: precioObjetivo,
          kilometros: vehiculo.kilometros_actual || null,
          fecha_transaccion: informe.fecha_valoracion.split('T')[0],
          verificado: true,
          estado: 'Usado',
          origen: 'Valoración IA Usuario',
          tipo_dato: 'Valoración IA Usuario',
          pais: 'España',
          tipo_combustible: null,
          tipo_calefaccion: null,
          homologacion: null,
          region: null
        })
      
      if (errorInsert) {
        console.log(`   ❌ Error insertando: ${vehiculo.marca} ${vehiculo.modelo} - ${errorInsert.message}`)
        estadisticas.errores++
      } else {
        console.log(`   ✅ Nuevo: ${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.ano} - ${precioObjetivo}€`)
        estadisticas.nuevos++
      }
    }
    
    // 5. Resumen final
    console.log('\n============================================================')
    console.log('📊 RESUMEN DE SINCRONIZACIÓN')
    console.log('============================================================')
    console.log(`📥 Informes procesados:       ${estadisticas.total}`)
    console.log(`✅ Nuevos insertados:         ${estadisticas.nuevos}`)
    console.log(`🔄 Duplicados (saltados):     ${estadisticas.duplicados}`)
    console.log(`❌ Errores:                   ${estadisticas.errores}`)
    console.log('============================================================\n')
    
    console.log('✅ Sincronización completada!')
    console.log('🎉 Script finalizado correctamente\n')
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar
sincronizarValoraciones()

