/**
 * Script para verificar si existe la configuración del chatbot
 * Ejecutar: node scripts/verificar-chatbot-config.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificar() {
  console.log('🔍 Verificando configuración del chatbot...\n')
  
  // 1. Verificar si existe la tabla
  const { data: tablas, error: errorTablas } = await supabase
    .from('chatbot_config')
    .select('count')
    .limit(1)
  
  if (errorTablas) {
    console.error('❌ Error accediendo a chatbot_config:', errorTablas.message)
    console.error('\n💡 Probablemente la tabla no existe.')
    console.error('   Ejecuta: supabase/migrations/chatbot_schema.sql')
    return
  }
  
  console.log('✅ Tabla chatbot_config existe\n')
  
  // 2. Buscar el config principal
  const { data: config, error: errorConfig } = await supabase
    .from('chatbot_config')
    .select('*')
    .eq('nombre', 'asistente_principal')
    .single()
  
  if (errorConfig || !config) {
    console.error('❌ NO existe configuración "asistente_principal"')
    console.error('\n💡 SOLUCIÓN: Insertar configuración inicial')
    console.error('   Ver: supabase/migrations/chatbot_schema.sql (líneas 449+)')
    console.error('\n📝 O ejecuta este SQL en Supabase:')
    console.log(`
INSERT INTO chatbot_config (
  nombre,
  descripcion,
  modelo,
  temperature,
  max_tokens,
  system_prompt,
  activo
) VALUES (
  'asistente_principal',
  'Asistente principal de Furgocasa',
  'gpt-4o-mini',
  0.7,
  1000,
  'Eres el Tío Viajero IA, un asistente experto en autocaravanas y campings.',
  true
)
ON CONFLICT (nombre) DO NOTHING;
    `)
    return
  }
  
  console.log('✅ Configuración encontrada:')
  console.log('  - ID:', config.id)
  console.log('  - Nombre:', config.nombre)
  console.log('  - Modelo:', config.modelo)
  console.log('  - Temperature:', config.temperature)
  console.log('  - Max tokens:', config.max_tokens)
  console.log('  - Activo:', config.activo ? '✅' : '❌')
  console.log('  - System prompt:', config.system_prompt ? `${config.system_prompt.substring(0, 50)}...` : '❌ VACÍO')
  
  if (!config.activo) {
    console.warn('\n⚠️  La configuración existe pero está INACTIVA')
    console.warn('   Actívala con:')
    console.log(`
UPDATE chatbot_config 
SET activo = true 
WHERE nombre = 'asistente_principal';
    `)
  } else {
    console.log('\n✅ TODO CORRECTO - El chatbot debería funcionar')
  }
}

verificar().catch(console.error)

