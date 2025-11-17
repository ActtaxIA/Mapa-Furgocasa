/**
 * Script para eliminar los 52 registros con marca/modelo incorrectos
 * 
 * Problema: Los registros actuales tienen marca/modelo del vehículo valorado
 * en lugar de los comparables reales (error en código anterior)
 * 
 * Solución: Borrarlos para empezar desde cero con lógica correcta
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

async function limpiarRegistrosIncorrectos() {
  console.log('🧹 Limpiando registros con marca/modelo incorrectos...\n')
  
  try {
    // 1. Contar registros actuales
    const { data: todos, error: errorContar } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
    
    if (errorContar) throw errorContar
    
    console.log(`📊 Registros actuales: ${todos.length}`)
    console.log(`📊 Desglose por tipo_dato:`)
    const porTipo = {}
    todos.forEach(d => {
      const tipo = d.tipo_dato || 'Sin tipo'
      porTipo[tipo] = (porTipo[tipo] || 0) + 1
    })
    Object.entries(porTipo).forEach(([tipo, count]) => {
      console.log(`   - ${tipo}: ${count}`)
    })
    console.log('')
    
    // 2. Eliminar SOLO los de "Valoración IA" (que tienen marca/modelo incorrecto)
    console.log('🗑️  Eliminando registros tipo "Valoración IA" (marca/modelo incorrectos)...')
    
    const { data: eliminados, error: errorEliminar } = await supabase
      .from('datos_mercado_autocaravanas')
      .delete()
      .eq('tipo_dato', 'Valoración IA')
      .select()
    
    if (errorEliminar) throw errorEliminar
    
    console.log(`✅ Eliminados ${eliminados?.length || 0} registros incorrectos\n`)
    
    // 3. Verificar registros restantes
    const { data: restantes, error: errorRestantes } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
    
    if (errorRestantes) throw errorRestantes
    
    console.log('============================================================')
    console.log('📊 RESUMEN')
    console.log('============================================================')
    console.log(`📥 Registros iniciales:          ${todos.length}`)
    console.log(`🗑️  Registros eliminados:         ${eliminados?.length || 0}`)
    console.log(`✅ Registros restantes:          ${restantes?.length || 0}`)
    console.log('============================================================\n')
    
    if (restantes && restantes.length > 0) {
      console.log('📊 Registros restantes por tipo:')
      const porTipoRestante = {}
      restantes.forEach(d => {
        const tipo = d.tipo_dato || 'Sin tipo'
        porTipoRestante[tipo] = (porTipoRestante[tipo] || 0) + 1
      })
      Object.entries(porTipoRestante).forEach(([tipo, count]) => {
        console.log(`   - ${tipo}: ${count}`)
      })
      console.log('')
    }
    
    console.log('✅ Limpieza completada!')
    console.log('🎉 Ahora los nuevos comparables se guardarán con marca/modelo precisos\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

limpiarRegistrosIncorrectos()

