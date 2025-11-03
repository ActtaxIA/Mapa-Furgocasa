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

// ============================================
// CONFIGURACIÓN
// ============================================

// Cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Cliente Supabase (service role para acceso completo)
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
}

// ============================================
// ENDPOINT POST
// ============================================

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🤖 [CHATBOT] Nueva petición recibida')
    
    // Parsear request
    const body: ChatbotRequest = await req.json()
    const { messages, conversacionId, ubicacionUsuario } = body
    
    console.log('📨 Mensajes:', messages.length)
    console.log('🗺️ Ubicación usuario:', ubicacionUsuario ? 'Sí' : 'No')
    
    // Validar mensajes
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un mensaje' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    
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
    
    // Preparar mensajes con system prompt
    const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { 
        role: 'system', 
        content: config.system_prompt 
      },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }))
    ]
    
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
        await supabase
          .from('chatbot_conversaciones')
          .update({
            ultimo_mensaje_at: new Date().toISOString(),
            total_mensajes: supabase.raw('total_mensajes + 1')
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
      
      await supabase
        .from('chatbot_conversaciones')
        .update({
          ultimo_mensaje_at: new Date().toISOString(),
          total_mensajes: supabase.raw('total_mensajes + 1')
        })
        .eq('id', conversacionId)
    }
    
    const duration = Date.now() - startTime
    console.log(`⏱️ Duración total: ${duration}ms`)
    
    return NextResponse.json({
      message: response.content,
      tokensUsados: tokensUsados,
      modelo: config.modelo,
      duration: duration
    })
    
  } catch (error: any) {
    console.error('❌ [CHATBOT] Error general:', error)
    
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
    
    // Error genérico
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error.message || 'Error desconocido',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// ============================================
// ENDPOINT GET (info)
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'Chatbot Furgocasa',
    version: '1.0',
    status: 'active',
    endpoints: {
      POST: '/api/chatbot - Enviar mensaje al chatbot'
    },
    functions: AVAILABLE_FUNCTIONS.map(f => ({
      name: f.name,
      description: f.description
    }))
  })
}

