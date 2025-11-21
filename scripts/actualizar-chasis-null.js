/**
 * Script para actualizar el chasis de registros que se guardaron con NULL
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listarYActualizar() {
  console.log('🔍 Buscando registros recientes sin chasis...\n')
  
  // Buscar registros sin chasis
  const { data, error } = await supabase
    .from('datos_mercado_autocaravanas')
    .select('id, marca, modelo, chasis, precio, año, kilometros, created_at')
    .is('chasis', null)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
  
  if (!data || data.length === 0) {
    console.log('✅ No hay registros sin chasis')
    process.exit(0)
  }
  
  console.log('📋 Registros sin chasis (más recientes):')
  console.log('='.repeat(80))
  data.forEach((r, i) => {
    console.log(`\n${i+1}. ID: ${r.id}`)
    console.log(`   Marca: ${r.marca || 'N/A'}`)
    console.log(`   Modelo: ${r.modelo || 'N/A'}`)
    console.log(`   Precio: ${r.precio ? r.precio.toLocaleString() + '€' : 'N/A'}`)
    console.log(`   Año: ${r.año || 'N/A'}`)
    console.log(`   KM: ${r.kilometros ? r.kilometros.toLocaleString() : 'N/A'}`)
    console.log(`   Creado: ${new Date(r.created_at).toLocaleString('es-ES')}`)
  })
  console.log('\n' + '='.repeat(80))
  
  // Preguntar cuál actualizar
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('\n¿Qué registro quieres actualizar? (número 1-' + data.length + ' o "salir"): ', async (answer) => {
    if (answer.toLowerCase() === 'salir' || answer === '') {
      console.log('👋 Saliendo...')
      rl.close()
      process.exit(0)
    }
    
    const index = parseInt(answer) - 1
    if (isNaN(index) || index < 0 || index >= data.length) {
      console.log('❌ Número inválido')
      rl.close()
      process.exit(1)
    }
    
    const registro = data[index]
    console.log(`\n✅ Seleccionado: ${registro.marca} ${registro.modelo}`)
    
    rl.question('¿Qué chasis quieres asignar? (ej: Ford Transit, Mercedes Sprinter, Fiat Ducato): ', async (chasis) => {
      if (!chasis || chasis.trim() === '') {
        console.log('❌ Chasis no puede estar vacío')
        rl.close()
        process.exit(1)
      }
      
      console.log(`\n🔄 Actualizando chasis a "${chasis}"...`)
      
      const { error: updateError } = await supabase
        .from('datos_mercado_autocaravanas')
        .update({ chasis: chasis.trim() })
        .eq('id', registro.id)
      
      if (updateError) {
        console.error('❌ Error actualizando:', updateError.message)
        rl.close()
        process.exit(1)
      }
      
      console.log('✅ Chasis actualizado correctamente!')
      console.log(`\n📊 Registro actualizado:`)
      console.log(`   ID: ${registro.id}`)
      console.log(`   Vehículo: ${registro.marca} ${registro.modelo}`)
      console.log(`   Chasis: ${chasis}`)
      
      rl.close()
      process.exit(0)
    })
  })
}

listarYActualizar()


