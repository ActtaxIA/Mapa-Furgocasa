/**
 * 🚗 Script para rellenar el campo 'chasis' en datos_mercado_autocaravanas
 * 
 * ESTRATEGIA HÍBRIDA:
 * 1. Usa reglas simples para casos obvios (rápido, sin API calls)
 * 2. Usa OpenAI solo para casos ambiguos (preciso, mínimo coste)
 * 
 * Ejecutar: node scripts/rellenar-chasis-datos-mercado.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openaiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null

// Función para inferir chasis con reglas simples
function inferirChasisConReglas(marca, modelo) {
  const marcaLower = (marca || '').toLowerCase()
  const modeloLower = (modelo || '').toLowerCase()
  const textoCompleto = `${marcaLower} ${modeloLower}`.toLowerCase()
  
  // REGLA 1: Si la marca ES un fabricante de vehículos
  if (marcaLower.includes('fiat') || textoCompleto.includes('ducato')) {
    return 'Fiat Ducato'
  }
  if (marcaLower.includes('mercedes') || textoCompleto.includes('sprinter')) {
    return 'Mercedes Sprinter'
  }
  if (marcaLower.includes('peugeot') || textoCompleto.includes('boxer')) {
    return 'Peugeot Boxer'
  }
  if (marcaLower.includes('citro') || textoCompleto.includes('jumper')) {
    return 'Citroën Jumper'
  }
  if (marcaLower.includes('volks') || marcaLower.includes('vw') || textoCompleto.includes('crafter')) {
    return 'Volkswagen Crafter'
  }
  if (marcaLower.includes('ford') || textoCompleto.includes('transit')) {
    return 'Ford Transit'
  }
  if (marcaLower.includes('renault') || textoCompleto.includes('master')) {
    return 'Renault Master'
  }
  
  // REGLA 2: Si es un camperizador conocido, asumir Fiat Ducato (80% del mercado)
  const camperizadores = ['hymer', 'weinsberg', 'knaus', 'dethleffs', 'rapido', 'bürstner', 
                          'burstner', 'adria', 'roller', 'benimar', 'carado', 'pilote', 
                          'rimor', 'giottivan', 'mc louis', 'sunlight', 'challenger']
  
  for (const camper of camperizadores) {
    if (marcaLower.includes(camper)) {
      return 'Fiat Ducato' // El más común para camperizadores
    }
  }
  
  // REGLA 3: No se puede determinar con reglas simples
  return null
}

// Función para inferir chasis con IA (solo casos ambiguos)
async function inferirChasisConIA(marca, modelo) {
  if (!openai) {
    console.log('   ⚠️  OpenAI no configurada, usando Fiat Ducato por defecto')
    return 'Fiat Ducato'
  }
  
  const prompt = `Eres un experto en autocaravanas. 

DATOS:
- Marca: ${marca || 'Desconocida'}
- Modelo: ${modelo || 'Desconocido'}

Determina el CHASIS más probable (vehículo base).

OPCIONES COMUNES:
- Fiat Ducato (80% del mercado de campers)
- Mercedes Sprinter (premium)
- Peugeot Boxer
- Citroën Jumper
- Volkswagen Crafter
- Ford Transit
- Renault Master

REGLAS:
1. Si la marca es un camperizador (Hymer, Weinsberg, etc.) → probablemente Fiat Ducato
2. Si la marca es un fabricante (Fiat, Mercedes) → usa esa marca
3. Si no estás seguro → Fiat Ducato (el más común)

Responde SOLO con el nombre del chasis (ej: "Fiat Ducato"), sin explicaciones.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un experto en autocaravanas." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 20,
    })

    const chasis = completion.choices[0]?.message?.content?.trim() || 'Fiat Ducato'
    return chasis
  } catch (error) {
    console.error('   ⚠️  Error llamando OpenAI:', error.message)
    return 'Fiat Ducato' // Fallback al más común
  }
}

async function rellenarChasis() {
  console.log('🚗 Script de Rellenado de Chasis - Estrategia Híbrida\n')
  console.log('='.repeat(60))
  
  try {
    // 1. Obtener todos los registros sin chasis
    console.log('📥 Cargando registros sin chasis...')
    const { data: registros, error: errorCarga } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
      .is('chasis', null)
      .order('created_at', { ascending: false })
    
    if (errorCarga) throw errorCarga
    
    console.log(`✅ Encontrados ${registros.length} registros sin chasis\n`)
    
    if (registros.length === 0) {
      console.log('🎉 Todos los registros ya tienen chasis asignado')
      return
    }
    
    const estadisticas = {
      total: registros.length,
      conReglas: 0,
      conIA: 0,
      errores: 0,
      porChasis: {}
    }
    
    // 2. Procesar cada registro
    console.log('🔄 Procesando registros...\n')
    for (let i = 0; i < registros.length; i++) {
      const registro = registros[i]
      const progreso = `[${i + 1}/${registros.length}]`
      
      console.log(`${progreso} ${registro.marca || 'N/A'} ${registro.modelo || 'N/A'}`)
      
      // Intentar con reglas primero
      let chasisInferido = inferirChasisConReglas(registro.marca, registro.modelo)
      let metodo = ''
      
      if (chasisInferido) {
        console.log(`   📏 Regla simple → ${chasisInferido}`)
        estadisticas.conReglas++
        metodo = 'regla'
      } else {
        // Si las reglas no funcionan, usar IA
        console.log(`   🤖 Caso ambiguo, consultando IA...`)
        chasisInferido = await inferirChasisConIA(registro.marca, registro.modelo)
        console.log(`   🤖 IA sugiere → ${chasisInferido}`)
        estadisticas.conIA++
        metodo = 'ia'
        
        // Pausa para no saturar OpenAI (solo cuando se usa IA)
        if (openai) {
          await new Promise(resolve => setTimeout(resolve, 4000)) // 4 segundos
        }
      }
      
      // Actualizar en BD
      const { error: errorUpdate } = await supabase
        .from('datos_mercado_autocaravanas')
        .update({ chasis: chasisInferido })
        .eq('id', registro.id)
      
      if (errorUpdate) {
        console.log(`   ❌ Error actualizando: ${errorUpdate.message}`)
        estadisticas.errores++
      } else {
        console.log(`   ✅ Actualizado (método: ${metodo})`)
        
        // Contabilizar por chasis
        if (!estadisticas.porChasis[chasisInferido]) {
          estadisticas.porChasis[chasisInferido] = 0
        }
        estadisticas.porChasis[chasisInferido]++
      }
      
      console.log('')
    }
    
    // 3. Resumen final
    console.log('='.repeat(60))
    console.log('📊 RESUMEN DEL PROCESO')
    console.log('='.repeat(60))
    console.log(`📥 Total registros procesados:  ${estadisticas.total}`)
    console.log(`📏 Inferidos con reglas:        ${estadisticas.conReglas}`)
    console.log(`🤖 Inferidos con IA:            ${estadisticas.conIA}`)
    console.log(`❌ Errores:                     ${estadisticas.errores}`)
    console.log(`✅ Actualizados correctamente:  ${estadisticas.conReglas + estadisticas.conIA}`)
    console.log('')
    console.log('🚗 Distribución por chasis:')
    Object.entries(estadisticas.porChasis)
      .sort((a, b) => b[1] - a[1])
      .forEach(([chasis, count]) => {
        const porcentaje = ((count / (estadisticas.conReglas + estadisticas.conIA)) * 100).toFixed(1)
        console.log(`   - ${chasis}: ${count} (${porcentaje}%)`)
      })
    console.log('='.repeat(60))
    
    // 4. Verificar estado final
    const { data: finales } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('chasis', { count: 'exact' })
      .not('chasis', 'is', null)
    
    const { count: totales } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n✅ Estado final: ${finales?.length || 0} de ${totales || 0} registros tienen chasis asignado`)
    
    if (estadisticas.conIA > 0 && openai) {
      console.log(`\n💡 Se usó IA para ${estadisticas.conIA} registros (${((estadisticas.conIA / estadisticas.total) * 100).toFixed(1)}%)`)
      console.log(`   Esto minimizó el coste de API mientras mantiene precisión alta`)
    } else if (estadisticas.conIA > 0 && !openai) {
      console.log(`\n⚠️  OpenAI no configurada: ${estadisticas.conIA} registros recibieron Fiat Ducato por defecto`)
    }
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error)
    process.exit(1)
  }
}

// Ejecutar
rellenarChasis().then(() => {
  console.log('\n🎉 Proceso completado exitosamente\n')
  process.exit(0)
}).catch(error => {
  console.error('\n💥 Error fatal:', error)
  process.exit(1)
})

