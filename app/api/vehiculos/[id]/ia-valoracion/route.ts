import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buscarComparables } from '@/lib/valoracion/buscar-comparables'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🤖 [IA-VALORACION] INICIANDO PROCESO`)
    console.log(`${'='.repeat(60)}`)
    console.log(`📍 Vehículo ID: ${params.id}`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('❌ Usuario no autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`👤 Usuario: ${user.id} (${user.email})`)

    // 1. RECOPILAR DATOS DEL VEHÍCULO
    console.log(`\n📥 [PASO 1/7] Recopilando datos del vehículo...`)

    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (vehiculoError || !vehiculo) {
      console.error('❌ Vehículo no encontrado:', vehiculoError)
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    console.log(`✅ Vehículo encontrado: ${vehiculo.marca} ${vehiculo.modelo}`)

    const { data: valoracion } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('*')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    console.log(`   💰 Datos económicos: ${valoracion ? 'Sí (precio: ' + valoracion.precio_compra + '€)' : 'No disponibles'}`)

    const { data: ficha } = await supabase
      .from('vehiculo_ficha_tecnica')
      .select('*')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    console.log(`   📋 Ficha técnica: ${ficha ? 'Sí' : 'No disponible'}`)

    const { data: averias } = await supabase
      .from('averias')
      .select('*')
      .eq('vehiculo_id', params.id)
      .in('severidad', ['alta', 'critica'])

    console.log(`   🔧 Averías graves: ${averias?.length || 0}`)

    const { data: mejoras } = await supabase
      .from('vehiculo_mejoras')
      .select('*')
      .eq('vehiculo_id', params.id)

    console.log(`   ⚙️  Mejoras: ${mejoras?.length || 0}`)

    // 2. BUSCAR COMPARABLES EN INTERNET (OPCIONAL)
    console.log(`\n🔍 [PASO 2/7] Buscando comparables en internet...`)
    let comparables: any[] = []

    try {
      if (process.env.SERPAPI_KEY) {
        console.log(`   🔑 SerpAPI key: ${process.env.SERPAPI_KEY.substring(0, 8)}...`)
        comparables = await buscarComparables(
          vehiculo.marca || 'Autocaravana',
          vehiculo.modelo || '',
          vehiculo.ano || 2020
        )
        console.log(`   ✅ Encontrados ${comparables.length} comparables`)
      } else {
        console.log(`   ⚠️  SerpAPI KEY no configurada`)
        console.log(`   ⏭️  Continuando sin comparables externos`)
      }
    } catch (error: any) {
      console.error(`   ❌ Error buscando comparables:`, error.message)
      console.log(`   ⏭️  Continuando sin comparables externos`)
      comparables = []
    }

    // 2B. BUSCAR COMPARABLES EN NUESTRA BASE DE DATOS
    console.log(`\n🔍 [PASO 2B/7] Buscando comparables en nuestra BD...`)

    try {
      // Buscar vehículos similares con valoraciones IA
      const { data: valoracionesSimilares, error: errorValoraciones } = await supabase
        .from('valoracion_ia_informes')
        .select(`
          precio_objetivo,
          precio_salida,
          precio_minimo,
          precio_base_mercado,
          fecha_valoracion,
          vehiculo_id
        `)
        .neq('vehiculo_id', params.id) // Excluir el vehículo actual
        .order('fecha_valoracion', { ascending: false })
        .limit(20)

      // Buscar datos de compra de usuarios
      const { data: datosCompra, error: errorCompra } = await supabase
        .from('vehiculo_valoracion_economica')
        .select(`
          precio_compra,
          fecha_compra,
          kilometros_compra,
          vehiculo_id
        `)
        .neq('vehiculo_id', params.id)
        .not('precio_compra', 'is', null)
        .order('fecha_compra', { ascending: false })
        .limit(20)

      // Buscar datos de mercado scrapeados
      const { data: datosMercado, error: errorMercado } = await supabase
        .from('datos_mercado_autocaravanas')
        .select('*')
        .eq('verificado', true)
        .not('precio', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      let comparablesInternos = []

      // Agregar valoraciones IA de otros vehículos
      if (valoracionesSimilares && valoracionesSimilares.length > 0) {
        comparablesInternos.push(...valoracionesSimilares.map(v => ({
          titulo: `Valoración IA similar`,
          precio: v.precio_objetivo || v.precio_base_mercado,
          link: null,
          fuente: 'BD Interna - Valoraciones IA',
          fecha: v.fecha_valoracion
        })))
      }

      // Agregar precios de compra de usuarios
      if (datosCompra && datosCompra.length > 0) {
        comparablesInternos.push(...datosCompra.map(d => ({
          titulo: `Vehículo similar comprado`,
          precio: d.precio_compra,
          link: null,
          fuente: 'BD Interna - Compras Usuarios',
          fecha: d.fecha_compra
        })))
      }

      // Agregar datos de mercado scrapeados
      if (datosMercado && datosMercado.length > 0) {
        comparablesInternos.push(...datosMercado.map(d => ({
          titulo: `${d.marca || ''} ${d.modelo || ''} - ${d.pais || 'España'}`.trim(),
          precio: d.precio,
          kilometros: d.kilometros,
          ubicacion: d.pais || 'España',
          link: null,
          fuente: d.origen || 'BD Interna - Mercado',
          fecha: d.fecha_transaccion || d.created_at
        })))
      }

      // Combinar comparables externos (SerpAPI) con internos (BD)
      const totalComparablesAntes = comparables.length
      comparables = [...comparables, ...comparablesInternos]

      console.log(`   ✅ Comparables de SerpAPI: ${totalComparablesAntes}`)
      console.log(`   ✅ Comparables de BD interna: ${comparablesInternos.length}`)
      console.log(`   ✅ Total comparables: ${comparables.length}`)

    } catch (error: any) {
      console.error(`   ⚠️  Error buscando en BD interna:`, error.message)
      console.log(`   ⏭️  Continuando con comparables de SerpAPI únicamente`)
    }

    // 3. OBTENER CONFIGURACIÓN DEL AGENTE DESDE LA BD
    console.log(`\n⚙️  [PASO 3/7] Cargando configuración del agente IA...`)

    const { data: configData, error: configError } = await supabase
      .from('ia_config')
      .select('config_value')
      .eq('config_key', 'valoracion_vehiculos')
      .single()

    if (configError) {
      console.error('   ❌ Error obteniendo configuración:', configError)
      throw new Error('No se pudo cargar la configuración del agente IA')
    }

    if (!configData) {
      console.error('   ❌ No se encontró configuración para "valoracion_vehiculos"')
      throw new Error('Configuración del agente IA no encontrada')
    }

    const config = configData.config_value

    console.log(`   ✅ Configuración cargada:`)
    console.log(`      📦 Modelo: ${config.model}`)
    console.log(`      🌡️  Temperature: ${config.temperature}`)
    console.log(`      📏 Max tokens: ${config.max_tokens}`)
    console.log(`      💬 Prompts: ${config.prompts?.length || 0}`)

    // 4. CONSTRUIR VARIABLES PARA EL PROMPT
    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const datosVehiculo = `- Marca/Chasis: ${vehiculo.marca || 'No especificado'}
- Modelo: ${vehiculo.modelo || 'No especificado'}
- Tipo: ${vehiculo.tipo_vehiculo || 'Autocaravana'}
- Matrícula: ${vehiculo.matricula || 'No especificado'}
- Motor: ${ficha?.motor || 'No especificado'}
- Cambio: ${ficha?.cambio || 'No especificado'}
- Potencia: ${ficha?.potencia ? ficha.potencia + ' CV' : 'No especificado'}
- Kilometraje actual: ${ficha?.kilometros_actuales?.toLocaleString() || 'No especificado'} km`

    const fichaTecnica = ficha ? `
- Potencia: ${ficha.potencia || 'N/A'} CV
- Longitud: ${ficha.longitud || 'N/A'} m
- Altura: ${ficha.altura || 'N/A'} m
- MMA: ${ficha.mma || 'N/A'} kg
- Plazas día: ${ficha.plazas_dia || 'N/A'}
- Plazas noche: ${ficha.plazas_noche || 'N/A'}
- Depósito agua limpia: ${ficha.deposito_agua_limpia || 'N/A'} L
- Depósito aguas grises: ${ficha.deposito_aguas_grises || 'N/A'} L
` : 'No disponible'

    const datosEconomicos = `- Precio de compra Furgocasa (SIN Impuesto de Matriculación): ${valoracion?.precio_compra?.toLocaleString() || 'No especificado'}€
- Fecha de compra/matriculación: ${valoracion?.fecha_compra || vehiculo.created_at?.split('T')[0] || 'No especificado'}
- Kilometraje en compra: ${valoracion?.kilometros_compra?.toLocaleString() || 'No especificado'} km
- Inversión total (mantenimientos + averías + mejoras): ${valoracion?.inversion_total?.toLocaleString() || '0'}€`

    const averiasTexto = averias && averias.length > 0
      ? `${averias.length} averías críticas/graves registradas:\n` + averias.map((a: any) => `- ${a.descripcion} (${a.fecha}, severidad: ${a.severidad})`).join('\n')
      : 'No hay averías graves registradas'

    const mejorasTexto = mejoras && mejoras.length > 0
      ? mejoras.map((m: any) => `- ${m.nombre}: ${m.coste ? m.coste.toLocaleString() + '€' : 'coste no especificado'} (${m.fecha_instalacion || 'fecha no especificada'})`).join('\n')
      : 'No hay mejoras registradas'

    const comparablesTexto = comparables.length > 0
      ? comparables.map((c, i) => `${i + 1}. ${c.titulo}
   - Precio: ${c.precio ? c.precio.toLocaleString() + '€' : 'No especificado'}
   - Kilometraje: ${c.kilometros ? c.kilometros.toLocaleString() + ' km' : 'No especificado'}
   - Año: ${c.año || 'No especificado'}
   - Fuente: ${c.fuente}
   - URL: ${c.url}`).join('\n\n')
      : 'No se encontraron comparables en esta búsqueda.'

    // 5. CONSTRUIR MENSAJES PARA OPENAI DESDE LOS PROMPTS
    console.log(`\n🔨 [PASO 4/7] Preparando mensajes para OpenAI...`)

    if (!config.prompts || !Array.isArray(config.prompts) || config.prompts.length === 0) {
      console.error('   ❌ config.prompts no existe o está vacío')
      console.error('   📦 config recibido:', JSON.stringify(config, null, 2))
      throw new Error('Configuración del agente IA inválida. Faltan prompts.')
    }

    const messages = config.prompts
      .sort((a: any, b: any) => a.order - b.order)
      .map((prompt: any) => {
        // Reemplazar variables en el contenido del prompt
        let content = prompt.content
          .replace(/\{\{fecha_hoy\}\}/g, fechaHoy)
          .replace(/\{\{datos_vehiculo\}\}/g, datosVehiculo)
          .replace(/\{\{ficha_tecnica\}\}/g, fichaTecnica)
          .replace(/\{\{datos_economicos\}\}/g, datosEconomicos)
          .replace(/\{\{averias\}\}/g, averiasTexto)
          .replace(/\{\{mejoras\}\}/g, mejorasTexto)
          .replace(/\{\{comparables\}\}/g, comparablesTexto)

        return {
          role: prompt.role as 'system' | 'user' | 'assistant',
          content: content
        }
      })

    console.log(`   ✅ ${messages.length} mensajes preparados`)

    // 6. LLAMAR A OPENAI GPT-4
    console.log(`\n🤖 [PASO 5/7] Llamando a OpenAI GPT-4...`)
    console.log(`   🔑 API Key: ${process.env.OPENAI_API_KEY ? 'Configurada' : 'NO CONFIGURADA'}`)

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.max_tokens
    })

    const informeTexto = completion.choices[0].message.content || 'No se pudo generar el informe'
    const tokensUsados = completion.usage?.total_tokens || 0

    console.log(`   ✅ Informe generado`)
    console.log(`   📊 Tokens: ${tokensUsados}`)
    console.log(`   📝 Longitud: ${informeTexto.length} caracteres`)

    // 6. EXTRAER PRECIOS DEL INFORME
    console.log(`\n💰 [PASO 6/7] Extrayendo precios del informe...`)
    const precioSalidaMatch = informeTexto.match(/precio\s+de\s+salida\s+recomendado[:\s]+(\d{1,3}(?:\.\d{3})*)/i)
    const precioObjetivoMatch = informeTexto.match(/precio\s+objetivo\s+de\s+venta[:\s]+(\d{1,3}(?:\.\d{3})*)/i)
    const precioMinimoMatch = informeTexto.match(/precio\s+mínimo\s+aceptable[:\s]+(\d{1,3}(?:\.\d{3})*)/i)

    const precioSalida = precioSalidaMatch ? parseFloat(precioSalidaMatch[1].replace(/\./g, '')) : valoracion?.precio_compra ? valoracion.precio_compra * 1.1 : null
    const precioObjetivo = precioObjetivoMatch ? parseFloat(precioObjetivoMatch[1].replace(/\./g, '')) : valoracion?.precio_compra || null
    const precioMinimo = precioMinimoMatch ? parseFloat(precioMinimoMatch[1].replace(/\./g, '')) : valoracion?.precio_compra ? valoracion.precio_compra * 0.9 : null

    console.log(`   💵 Salida: ${precioSalida}€`)
    console.log(`   🎯 Objetivo: ${precioObjetivo}€`)
    console.log(`   📉 Mínimo: ${precioMinimo}€`)

    // 7. GUARDAR EN BASE DE DATOS
    console.log(`\n💾 [PASO 7/7] Guardando en base de datos...`)

    // Calcular precio base de mercado (promedio de comparables)
    const precioBaseMercado = comparables.length > 0
      ? comparables.reduce((sum, c) => sum + (c.precio || 0), 0) / comparables.filter(c => c.precio).length
      : null

    // Calcular depreciación aplicada (desde precio de compra del usuario hasta precio objetivo IA)
    const precioCompraUsuario = valoracion?.precio_compra
    const depreciacionAplicada = precioCompraUsuario && precioObjetivo
      ? ((precioCompraUsuario - precioObjetivo) / precioCompraUsuario) * 100
      : null

    console.log(`\n📊 Cálculos finales:`)
    console.log(`   💰 Precio base mercado: ${precioBaseMercado ? precioBaseMercado.toFixed(0) + '€' : 'N/A'}`)
    console.log(`   💵 Precio compra usuario: ${precioCompraUsuario ? precioCompraUsuario.toFixed(0) + '€' : 'No especificado'}`)
    console.log(`   🎯 Precio objetivo IA: ${precioObjetivo}€`)
    console.log(`   📉 Depreciación aplicada: ${depreciacionAplicada !== null ? depreciacionAplicada.toFixed(1) + '%' : 'N/A (no hay precio de compra)'}`)
    console.log(`   🔍 Cálculo depreciación: (${precioCompraUsuario} - ${precioObjetivo}) / ${precioCompraUsuario} * 100 = ${depreciacionAplicada}`)

    const { data: informeGuardado, error: errorGuardar } = await supabase
      .from('valoracion_ia_informes')
      .insert({
        vehiculo_id: params.id,
        user_id: user.id,
        fecha_valoracion: new Date().toISOString(),
        precio_salida: precioSalida,
        precio_objetivo: precioObjetivo,
        precio_minimo: precioMinimo,
        informe_texto: informeTexto,
        informe_html: null,
        comparables_json: comparables,
        num_comparables: comparables.length,
        nivel_confianza: comparables.length >= 5 ? 'Alta' : comparables.length >= 3 ? 'Media' : comparables.length >= 1 ? 'Baja' : 'Estimativa',
        precio_base_mercado: precioBaseMercado,
        depreciacion_aplicada: depreciacionAplicada
      })
      .select()
      .single()

    if (errorGuardar) {
      console.error('   ❌ Error al guardar:', errorGuardar)
      throw errorGuardar
    }

    console.log(`   ✅ Informe guardado con ID: ${informeGuardado.id}`)

    // 8. GUARDAR COMPARABLES EN TABLA DE MERCADO (si hay)
    if (comparables.length > 0) {
      console.log(`\n📊 Guardando ${comparables.length} comparables en datos_mercado_autocaravanas...`)

      const comparablesParaGuardar = comparables.map(c => ({
        marca: vehiculo.marca || null,
        modelo: vehiculo.modelo || null,
        año: vehiculo.año || null,
        precio: c.precio || null,
        kilometros: c.kilometros || null,
        // ubicacion no existe en la tabla
        // url_anuncio no existe en la tabla
        // fuente no existe en la tabla
        // descripcion no existe en la tabla
        fecha_transaccion: new Date().toISOString().split('T')[0], // Solo fecha, no timestamp
        verificado: true, // Viene de SerpAPI o BD interna
        tipo_calefaccion: null,
        homologacion: null,
        estado: 'Usado',
        origen: c.fuente || 'SerpAPI',
        tipo_combustible: null,
        tipo_dato: 'Valoración IA',
        pais: 'España',
        region: null
      }))

      const { data: mercadoGuardado, error: errorMercado } = await supabase
        .from('datos_mercado_autocaravanas')
        .insert(comparablesParaGuardar)
        .select()

      if (errorMercado) {
        console.error(`   ⚠️ Error guardando en mercado (no crítico):`, errorMercado)
      } else {
        console.log(`   ✅ ${mercadoGuardado?.length || 0} comparables guardados en BD de mercado`)
      }
    }

    const tiempoTotal = Date.now() - startTime

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ VALORACIÓN COMPLETADA EN ${(tiempoTotal / 1000).toFixed(2)}s`)
    console.log(`${'='.repeat(60)}\n`)

    return NextResponse.json({
      success: true,
      informe: informeGuardado,
      tokens_usados: tokensUsados
    })

  } catch (error: any) {
    console.error(`\n${'='.repeat(60)}`)
    console.error('❌ [IA-VALORACION] ERROR CRÍTICO')
    console.error(`${'='.repeat(60)}`)
    console.error('📛 Mensaje:', error.message)
    console.error('📚 Stack:', error.stack)
    console.error('🔍 Error completo:', JSON.stringify(error, null, 2))
    console.error(`${'='.repeat(60)}\n`)

    // Mensajes de error más específicos
    let errorMessage = 'Error al generar valoración'
    let errorDetails = error.message

    if (error.message?.includes('Configuración del agente IA no encontrada')) {
      errorMessage = 'Configuración no encontrada'
      errorDetails = 'El agente de valoración IA no está configurado. Por favor, contacta al administrador para ejecutar la configuración inicial.'
    } else if (error.message?.includes('OpenAI')) {
      errorMessage = 'Error de OpenAI'
      errorDetails = 'No se pudo generar la valoración. Verifica la configuración de la API de OpenAI.'
    } else if (error.code === '42P01') {
      errorMessage = 'Tabla no encontrada'
      errorDetails = 'La tabla de valoraciones no existe. Por favor, ejecuta las migraciones de base de datos.'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        detalle: errorDetails,
        mensaje_tecnico: error.message
      },
      { status: 500 }
    )
  }
}

// GET: Obtener historial de valoraciones
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`\n🔍 [GET VALORACIONES] Iniciando carga para vehículo: ${params.id}`)

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError)
      return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 })
    }

    if (!user) {
      console.error('❌ Usuario no autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`👤 Usuario autenticado: ${user.id}`)
    console.log(`📊 Consultando tabla valoracion_ia_informes...`)

    const { data: informes, error } = await supabase
      .from('valoracion_ia_informes')
      .select('*')
      .eq('vehiculo_id', params.id)
      .eq('user_id', user.id)
      .order('fecha_valoracion', { ascending: false })

    if (error) {
      console.error('❌ Error en query Supabase:', error)
      console.error('   Código:', error.code)
      console.error('   Mensaje:', error.message)
      console.error('   Detalles:', error.details)
      throw error
    }

    console.log(`✅ Valoraciones encontradas: ${informes?.length || 0}`)

    return NextResponse.json({ informes })

  } catch (error: any) {
    console.error('\n❌ [GET VALORACIONES] ERROR:', error)
    console.error('   Mensaje:', error.message)
    console.error('   Código:', error.code)
    console.error('   Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Error obteniendo valoraciones',
        detalle: error.message,
        codigo: error.code
      },
      { status: 500 }
    )
  }
}
