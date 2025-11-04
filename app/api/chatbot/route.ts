/**
 * API ROUTE: CHATBOT CON FUNCTION CALLING
 * ========================================
 * Endpoint principal del chatbot que:
 * 1. Recibe mensajes del usuario
 * 2. Llama a OpenAI con Function Calling
 * 3. Ejecuta funciones de búsqueda en la BD
 * 4. Retorna respuestas inteligentes
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import {
  searchAreas,
  getAreaDetails,
  getAreasByCountry,
  BusquedaAreasParams,
  AreaResumen
} from '@/lib/chatbot/functions'
import { getCityAndProvinceFromCoords, GeocodeResult, formatLocation } from '@/lib/google/geocoding'

// ============================================
// CONFIGURACIÓN
// ============================================

// Cliente Supabase (service role para acceso completo)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  
  console.log('🔍 [SUPABASE] Buscando credenciales...')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Encontrada' : '❌ FALTA')
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Encontrada' : '❌ FALTA')
  console.log('  - NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? '✅ Encontrada' : '❌ FALTA')
  console.log('  - Variables con SUPABASE:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
  console.log('  - TODAS las variables:', Object.keys(process.env).sort())
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Supabase URL:', supabaseUrl ? '✅' : '❌ FALTA')
    console.error('❌ Service Role Key:', serviceRoleKey ? '✅' : '❌ FALTA')
    throw new Error('Missing Supabase credentials')
  }
  
  console.log('✅ [SUPABASE] Credenciales encontradas correctamente')
  return createClient(supabaseUrl, serviceRoleKey)
}

// Cliente OpenAI (se crea bajo demanda para asegurar que las env vars estén cargadas)
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY_ADMIN
  if (!apiKey) {
    console.error('❌ Variables OpenAI disponibles:', Object.keys(process.env).filter(k => k.includes('OPENAI')))
    throw new Error('OPENAI_API_KEY no está configurada')
  }
  return new OpenAI({ apiKey })
}

// ============================================
// DEFINICIÓN DE FUNCIONES DISPONIBLES
// ============================================

const AVAILABLE_FUNCTIONS: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [
  {
    name: 'search_areas',
    description: 'Busca áreas de autocaravanas según múltiples criterios. Retorna hasta 10 resultados ordenados por relevancia. USAR SIEMPRE que el usuario pregunte por áreas, ubicaciones, servicios o precios.',
    parameters: {
      type: 'object',
      properties: {
        ubicacion: {
          type: 'object',
          description: 'Ubicación de búsqueda. Si el usuario dice "cerca de mí", usar lat/lng. Si menciona ciudad/país, usar nombre.',
          properties: {
            lat: { 
              type: 'number', 
              description: 'Latitud del usuario (solo si está disponible la geolocalización)' 
            },
            lng: { 
              type: 'number', 
              description: 'Longitud del usuario (solo si está disponible la geolocalización)' 
            },
            nombre: { 
              type: 'string', 
              description: 'Nombre de ciudad, provincia o país. Ejemplo: "Barcelona", "Costa Brava", "España"' 
            },
            radio_km: { 
              type: 'number', 
              description: 'Radio de búsqueda en kilómetros (solo para búsquedas por lat/lng)',
              default: 50,
              enum: [10, 20, 30, 50, 100]
            }
          }
        },
        servicios: {
          type: 'array',
          description: 'Lista de servicios que DEBE tener el área (filtro AND)',
          items: {
            type: 'string',
            enum: [
              'agua',
              'electricidad',
              'vaciado_aguas_negras',
              'vaciado_aguas_grises',
              'wifi',
              'duchas',
              'wc',
              'lavanderia',
              'restaurante',
              'supermercado',
              'zona_mascotas'
            ]
          }
        },
        precio_max: {
          type: 'number',
          description: 'Precio máximo por noche en euros. Ejemplo: 15 para "máximo 15€"'
        },
        solo_gratuitas: {
          type: 'boolean',
          description: 'true para mostrar SOLO áreas completamente gratuitas (0€)'
        },
        tipo_area: {
          type: 'string',
          enum: ['publica', 'privada', 'camping', 'parking'],
          description: 'Tipo específico de área'
        },
        pais: {
          type: 'string',
          description: 'Filtrar por país específico. Ejemplo: "España", "Francia", "Portugal"'
        }
      }
    }
  },
  {
    name: 'get_area_details',
    description: 'Obtiene información COMPLETA y detallada de un área específica por su ID. Usar cuando el usuario pide "más detalles", "dime más sobre X", "información completa", o cuando necesite datos específicos como contacto, horarios, etc.',
    parameters: {
      type: 'object',
      properties: {
        area_id: {
          type: 'string',
          description: 'UUID del área a consultar (obtenido de una búsqueda previa)'
        }
      },
      required: ['area_id']
    }
  },
  {
    name: 'get_areas_by_country',
    description: 'Lista las mejores áreas de un país específico ordenadas por valoración. Usar para preguntas como "áreas en Francia", "mejores zonas de Portugal", "dónde ir en Italia".',
    parameters: {
      type: 'object',
      properties: {
        pais: {
          type: 'string',
          description: 'Nombre del país en español. Ejemplo: "España", "Francia", "Portugal", "Italia"'
        },
        limit: {
          type: 'number',
          description: 'Número máximo de resultados a retornar',
          default: 10,
          maximum: 20
        }
      },
      required: ['pais']
    }
  }
]

// ============================================
// TIPOS
// ============================================

interface ChatbotRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  conversacionId?: string
  ubicacionUsuario?: {
    lat: number
    lng: number
  }
  userId?: string
}

interface EstadisticasBD {
  totalAreas: number
  totalPaises: number
  totalCiudades: number
  areasEuropa: number
  areasLatam: number
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene estadísticas de la base de datos para contexto
 */
async function getEstadisticasBD(supabase: any): Promise<EstadisticasBD> {
  try {
    // Total de áreas activas
    const { count: totalAreas } = await supabase
      .from('areas')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true)
    
    // Contar países únicos
    const { data: paises } = await supabase
      .from('areas')
      .select('pais')
      .eq('activo', true)
    const paisesUnicos = new Set(paises?.map((a: any) => a.pais).filter(Boolean))
    
    // Contar ciudades únicas
    const { data: ciudades } = await supabase
      .from('areas')
      .select('ciudad')
      .eq('activo', true)
    const ciudadesUnicas = new Set(ciudades?.map((a: any) => a.ciudad).filter(Boolean))
    
    // Áreas en Europa (aproximación por países principales)
    const { count: areasEuropa } = await supabase
      .from('areas')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true)
      .in('pais', ['España', 'Francia', 'Portugal', 'Italia', 'Alemania'])
    
    // Áreas en LATAM (aproximación)
    const { count: areasLatam } = await supabase
      .from('areas')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true)
      .in('pais', ['Argentina', 'Chile', 'Uruguay', 'Brasil', 'Colombia', 'Perú'])
    
    return {
      totalAreas: totalAreas || 0,
      totalPaises: paisesUnicos.size,
      totalCiudades: ciudadesUnicas.size,
      areasEuropa: areasEuropa || 0,
      areasLatam: areasLatam || 0
    }
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error)
    return {
      totalAreas: 0,
      totalPaises: 0,
      totalCiudades: 0,
      areasEuropa: 0,
      areasLatam: 0
    }
  }
}

// ============================================
// ENDPOINT POST
// ============================================

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🤖 [CHATBOT] Nueva petición recibida')
    console.log('🔑 [CHATBOT] Verificando OPENAI_API_KEY...')
    
    // Validar variables de entorno
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY_ADMIN
    if (!apiKey) {
      const allEnvVars = Object.keys(process.env)
      console.error('❌ OPENAI_API_KEY no configurada')
      console.error('🔍 Variables con OPENAI:', allEnvVars.filter(k => k.includes('OPENAI')))
      console.error('🔍 TODAS las variables:', allEnvVars)
      return NextResponse.json(
        { 
          error: 'Chatbot no configurado: falta OPENAI_API_KEY',
          debug: { env_vars: allEnvVars }
        },
        { status: 500 }
      )
    }
    
    console.log('✅ [CHATBOT] OPENAI_API_KEY encontrada')
    
    // Parsear request
    const body: ChatbotRequest = await req.json()
    let { messages, conversacionId, ubicacionUsuario, userId } = body
    
    console.log('📨 Mensajes:', messages.length)
    console.log('🗺️ Ubicación usuario:', ubicacionUsuario ? 'Sí' : 'No')
    console.log('👤 User ID:', userId || 'No proporcionado')
    
    // Validar mensajes
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un mensaje' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    // Si NO hay conversacionId pero SÍ hay userId, crear conversación
    if (!conversacionId && userId) {
      console.log('🆕 Creando nueva conversación...')
      const sesionId = userId || `anon_${Date.now()}`
      
      const { data: nuevaConv, error: convError } = await supabase
        .from('chatbot_conversaciones')
        .insert({
          user_id: userId,
          sesion_id: sesionId,
          titulo: 'Nueva conversación',
          ubicacion_usuario: ubicacionUsuario || null,
          total_mensajes: 0
        })
        .select()
        .single()
      
      if (convError) {
        console.error('❌ Error creando conversación:', convError)
      } else if (nuevaConv) {
        conversacionId = nuevaConv.id
        console.log('✅ Conversación creada:', conversacionId)
      }
    }
    
    // Guardar mensaje del usuario en BD (si hay conversación)
    if (conversacionId && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage.role === 'user') {
        console.log('💾 Guardando mensaje del usuario...')
        await supabase.from('chatbot_mensajes').insert({
          conversacion_id: conversacionId,
          rol: 'user',
          contenido: lastUserMessage.content
        })
      }
    }
    
    // Cargar configuración del chatbot
    console.log('⚙️ Cargando configuración del chatbot...')
    const { data: config, error: configError } = await supabase
      .from('chatbot_config')
      .select('*')
      .eq('nombre', 'asistente_principal')
      .eq('activo', true)
      .single()
    
    if (configError || !config) {
      console.error('❌ Error cargando configuración:', configError)
      return NextResponse.json(
        { error: 'Configuración del chatbot no encontrada' },
        { status: 500 }
      )
    }
    
    console.log('✅ Configuración cargada:', config.modelo)
    
    // ============================================
    // ENRIQUECER CONTEXTO
    // ============================================
    
    // 1. GEOCODING: Convertir GPS a ciudad/provincia
    let ubicacionDetectada: GeocodeResult | null = null
    if (ubicacionUsuario?.lat && ubicacionUsuario?.lng) {
      console.log('🌍 Ejecutando geocoding reverso...')
      ubicacionDetectada = await getCityAndProvinceFromCoords(
        ubicacionUsuario.lat,
        ubicacionUsuario.lng
      )
      if (ubicacionDetectada) {
        console.log('✅ Ubicación detectada:', formatLocation(ubicacionDetectada))
      }
    }
    
    // 2. ESTADÍSTICAS: Obtener datos de la BD
    console.log('📊 Obteniendo estadísticas de la BD...')
    const stats = await getEstadisticasBD(supabase)
    console.log('✅ Estadísticas:', stats)
    
    // 3. HISTORIAL: Cargar mensajes previos de la conversación
    let historialPrevio: Array<{ rol: string, contenido: string }> = []
    if (conversacionId) {
      console.log('📜 Cargando historial de conversación...')
      const { data: historial, error: historialError } = await supabase
        .from('chatbot_mensajes')
        .select('rol, contenido')
        .eq('conversacion_id', conversacionId)
        .order('created_at', { ascending: true })
        .limit(10) // Últimos 10 mensajes
      
      if (!historialError && historial) {
        historialPrevio = historial
        console.log(`✅ Cargados ${historial.length} mensajes del historial`)
      }
    }
    
    // 4. CONSTRUIR SYSTEM PROMPT ENRIQUECIDO
    let systemPromptEnriquecido = config.system_prompt
    
    // Añadir información de ubicación si está disponible
    if (ubicacionDetectada) {
      systemPromptEnriquecido += `\n\n═══════════════════════════════════════
📍 UBICACIÓN ACTUAL DEL USUARIO
═══════════════════════════════════════
✅ GPS COMPARTIDO
- Ciudad: ${ubicacionDetectada.city}
- Provincia: ${ubicacionDetectada.province}
- Región: ${ubicacionDetectada.region}
- País: ${ubicacionDetectada.country}
- Coordenadas: ${ubicacionUsuario!.lat.toFixed(4)}, ${ubicacionUsuario!.lng.toFixed(4)}

REGLAS DE UBICACIÓN:
1. Cuando el usuario pregunte por "áreas cerca", "áreas aquí", "cerca de mí", o no mencione ciudad específica → USA su ubicación GPS (${ubicacionDetectada.city})
2. Si el usuario menciona EXPLÍCITAMENTE otra ciudad ("áreas en Barcelona"), IGNORA su GPS y busca en esa ciudad
3. Siempre incluye las distancias cuando uses búsqueda por GPS (el campo "distancia_km" estará disponible)
4. Radio de búsqueda:
   - Si dice "cerca", "aquí", "cerca de mí" → Radio 10-20km
   - Si es genérico ("áreas", "buscar") → Radio 50km
   - Si menciona ciudad específica → Búsqueda por nombre de ciudad (sin radio)`
    }
    
    // Añadir estadísticas de la plataforma
    systemPromptEnriquecido += `\n\n═══════════════════════════════════════
📊 ESTADÍSTICAS DE LA PLATAFORMA
═══════════════════════════════════════
- Total de áreas: ${stats.totalAreas} áreas verificadas
- Países disponibles: ${stats.totalPaises} países
- Ciudades cubiertas: ${stats.totalCiudades} ciudades
- Áreas en Europa: ${stats.areasEuropa} áreas
- Áreas en LATAM: ${stats.areasLatam} áreas

Usa estas estadísticas cuando el usuario pregunte "cuántas áreas hay", "dónde están", etc.`
    
    // 5. PREPARAR MENSAJES COMPLETOS
    const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { 
        role: 'system', 
        content: systemPromptEnriquecido 
      },
      // Añadir historial previo
      ...historialPrevio.map(h => ({
        role: h.rol as 'user' | 'assistant',
        content: h.contenido
      })),
      // Añadir nuevos mensajes
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))
    ]
    
    console.log(`📝 Total mensajes en contexto: ${fullMessages.length} (system: 1, historial: ${historialPrevio.length}, nuevos: ${messages.length})`)
    
    // Crear cliente OpenAI (bajo demanda para asegurar que las env vars estén cargadas)
    const openai = getOpenAIClient()
    
    // PRIMERA LLAMADA A OPENAI
    console.log('🔮 Llamando a OpenAI (primera llamada)...')
    const completion = await openai.chat.completions.create({
      model: config.modelo,
      messages: fullMessages,
      functions: AVAILABLE_FUNCTIONS,
      function_call: 'auto',
      temperature: config.temperature,
      max_tokens: config.max_tokens
    })
    
    const response = completion.choices[0].message
    const tokensUsados = completion.usage?.total_tokens || 0
    
    console.log('✅ OpenAI respondió')
    console.log('📊 Tokens usados:', tokensUsados)
    
    // ¿Llamó a alguna función?
    if (response.function_call) {
      const functionName = response.function_call.name
      const functionArgsRaw = response.function_call.arguments
      
      console.log('🔧 Function call detectado:', functionName)
      console.log('📝 Argumentos raw:', functionArgsRaw)
      
      let functionArgs: any
      try {
        functionArgs = JSON.parse(functionArgsRaw)
      } catch (parseError) {
        console.error('❌ Error parseando argumentos:', parseError)
        return NextResponse.json(
          { error: 'Error en los argumentos de la función' },
          { status: 500 }
        )
      }
      
      // Si hay ubicación del usuario y no viene en los args, inyectarla
      if (ubicacionUsuario && functionName === 'search_areas') {
        if (!functionArgs.ubicacion?.lat) {
          console.log('📍 Inyectando ubicación del usuario')
          functionArgs.ubicacion = {
            ...functionArgs.ubicacion,
            lat: ubicacionUsuario.lat,
            lng: ubicacionUsuario.lng,
            radio_km: functionArgs.ubicacion?.radio_km || config.radio_busqueda_default_km || 50
          }
        }
      }
      
      console.log('📝 Argumentos finales:', JSON.stringify(functionArgs, null, 2))
      
      // EJECUTAR LA FUNCIÓN
      let functionResult: any
      let areasEncontradas: AreaResumen[] | null = null
      
      try {
        console.log(`⚡ Ejecutando función: ${functionName}`)
        
        switch (functionName) {
          case 'search_areas':
            functionResult = await searchAreas(functionArgs as BusquedaAreasParams)
            areasEncontradas = functionResult
            console.log(`✅ Encontradas ${functionResult.length} áreas`)
            break
            
          case 'get_area_details':
            functionResult = await getAreaDetails(functionArgs.area_id)
            console.log('✅ Detalles obtenidos')
            break
            
          case 'get_areas_by_country':
            functionResult = await getAreasByCountry(functionArgs.pais, functionArgs.limit || 10)
            areasEncontradas = functionResult
            console.log(`✅ Encontradas ${functionResult.length} áreas en ${functionArgs.pais}`)
            break
            
          default:
            functionResult = { error: `Función ${functionName} no implementada` }
            console.error('❌ Función desconocida:', functionName)
        }
      } catch (functionError: any) {
        console.error('❌ Error ejecutando función:', functionError)
        functionResult = { 
          error: functionError.message || 'Error ejecutando la función',
          details: String(functionError)
        }
      }
      
      // SEGUNDA LLAMADA A OPENAI con el resultado
      console.log('🔮 Llamando a OpenAI (segunda llamada con resultado)...')
      
      const secondCompletion = await openai.chat.completions.create({
        model: config.modelo,
        messages: [
          ...fullMessages,
          response as OpenAI.Chat.ChatCompletionMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult)
          }
        ],
        temperature: config.temperature,
        max_tokens: config.max_tokens
      })
      
      const finalResponse = secondCompletion.choices[0].message.content
      const totalTokens = tokensUsados + (secondCompletion.usage?.total_tokens || 0)
      
      console.log('✅ Respuesta final generada')
      console.log('📊 Total tokens:', totalTokens)
      
      // Guardar en base de datos (si hay conversacionId)
      if (conversacionId) {
        console.log('💾 Guardando mensaje en BD...')
        
        const { error: insertError } = await supabase
          .from('chatbot_mensajes')
          .insert({
            conversacion_id: conversacionId,
            rol: 'assistant',
            contenido: finalResponse,
            tokens_usados: totalTokens,
            modelo_usado: config.modelo,
            temperatura_usada: config.temperature,
            function_call_name: functionName,
            function_call_args: functionArgs,
            function_call_result: functionResult,
            areas_mencionadas: areasEncontradas?.map(a => a.id) || []
          })
        
        if (insertError) {
          console.error('⚠️ Error guardando mensaje:', insertError)
        } else {
          console.log('✅ Mensaje guardado')
        }
        
        // Actualizar conversación
        const { data: conversacion } = await supabase
          .from('chatbot_conversaciones')
          .select('total_mensajes')
          .eq('id', conversacionId)
          .single()
        
        await supabase
          .from('chatbot_conversaciones')
          .update({
            ultimo_mensaje_at: new Date().toISOString(),
            total_mensajes: (conversacion?.total_mensajes || 0) + 1
          })
          .eq('id', conversacionId)
      }
      
      // Analytics
      await supabase.from('chatbot_analytics').insert({
        conversacion_id: conversacionId,
        evento: 'function_call',
        categoria: 'busqueda',
        detalles: {
          function_name: functionName,
          args: functionArgs,
          results_count: Array.isArray(functionResult) ? functionResult.length : 1
        }
      })
      
      const duration = Date.now() - startTime
      console.log(`⏱️ Duración total: ${duration}ms`)
      
      return NextResponse.json({
        message: finalResponse,
        conversacionId: conversacionId, // Retornar conversacionId para que el frontend lo guarde
        functionCalled: functionName,
        functionArgs: functionArgs,
        areas: areasEncontradas,
        tokensUsados: totalTokens,
        modelo: config.modelo,
        duration: duration
      })
    }
    
    // RESPUESTA DIRECTA (sin function call)
    console.log('💬 Respuesta directa (sin function call)')
    
    // Guardar mensaje
    if (conversacionId) {
      await supabase
        .from('chatbot_mensajes')
        .insert({
          conversacion_id: conversacionId,
          rol: 'assistant',
          contenido: response.content,
          tokens_usados: tokensUsados,
          modelo_usado: config.modelo,
          temperatura_usada: config.temperature
        })
      
      const { data: conversacionFinal } = await supabase
        .from('chatbot_conversaciones')
        .select('total_mensajes')
        .eq('id', conversacionId)
        .single()
      
      await supabase
        .from('chatbot_conversaciones')
        .update({
          ultimo_mensaje_at: new Date().toISOString(),
          total_mensajes: (conversacionFinal?.total_mensajes || 0) + 1
        })
        .eq('id', conversacionId)
    }
    
    const duration = Date.now() - startTime
    console.log(`⏱️ Duración total: ${duration}ms`)
    
    return NextResponse.json({
      message: response.content,
      conversacionId: conversacionId, // Retornar conversacionId
      tokensUsados: tokensUsados,
      modelo: config.modelo,
      duration: duration
    })
    
  } catch (error: any) {
    console.error('❌ [CHATBOT] Error general:', error)
    console.error('❌ [CHATBOT] Error message:', error.message)
    console.error('❌ [CHATBOT] Error stack:', error.stack)
    console.error('❌ [CHATBOT] Error completo:', JSON.stringify(error, null, 2))
    
    // Errors específicos de OpenAI
    if (error.status === 401) {
      return NextResponse.json({
        error: 'API Key de OpenAI inválida',
        details: 'Verifica OPENAI_API_KEY en las variables de entorno'
      }, { status: 401 })
    }
    
    if (error.status === 429) {
      return NextResponse.json({
        error: 'Límite de OpenAI alcanzado',
        details: 'Has superado tu cuota. Espera unos minutos o aumenta tu límite.'
      }, { status: 429 })
    }
    
    if (error.status === 400) {
      return NextResponse.json({
        error: 'Petición inválida a OpenAI',
        details: error.message || 'Verifica los parámetros'
      }, { status: 400 })
    }
    
    // Error genérico - MOSTRAR TODO EN PRODUCCIÓN TEMPORALMENTE PARA DEBUG
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error.message || 'Error desconocido',
      errorName: error.name,
      errorCode: error.code,
      stack: error.stack, // TEMPORAL: mostrar siempre para debugging
      fullError: String(error)
    }, { status: 500 })
  }
}

// ============================================
// ENDPOINT GET (info)
// ============================================

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasSupabase = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Logs para debugging
  console.log('🔍 [GET /api/chatbot] Verificando variables de entorno...')
  console.log('  OPENAI_API_KEY:', hasOpenAI ? '✅ Presente' : '❌ NO encontrada')
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', hasSupabase ? '✅ Presente' : '❌ NO encontrada')
  
  return NextResponse.json({
    service: 'Chatbot Furgocasa',
    version: '2.0',
    status: hasOpenAI ? 'active' : 'error',
    openai_configured: hasOpenAI,
    supabase_configured: hasSupabase,
    endpoints: {
      POST: '/api/chatbot - Enviar mensaje al chatbot'
    },
    functions: AVAILABLE_FUNCTIONS.map(f => ({
      name: f.name,
      description: f.description
    }))
  })
}

