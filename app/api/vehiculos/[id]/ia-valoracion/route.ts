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
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`🤖 Iniciando valoración IA para vehículo ${params.id}`)

    // 1. RECOPILAR DATOS DEL VEHÍCULO
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (vehiculoError || !vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    const { data: valoracion } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('*')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    const { data: ficha } = await supabase
      .from('vehiculo_ficha_tecnica')
      .select('*')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    const { data: averias } = await supabase
      .from('averias')
      .select('*')
      .eq('vehiculo_id', params.id)
      .in('severidad', ['alta', 'critica'])

    const { data: mejoras } = await supabase
      .from('vehiculo_mejoras')
      .select('*')
      .eq('vehiculo_id', params.id)

    // 2. BUSCAR COMPARABLES EN INTERNET (OPCIONAL)
    console.log(`🔍 Buscando comparables...`)
    let comparables: any[] = []

    try {
      if (process.env.SERPAPI_KEY) {
        comparables = await buscarComparables(
          vehiculo.marca || 'Autocaravana',
          vehiculo.modelo || '',
          vehiculo.ano || 2020
        )
        console.log(`✅ Encontrados ${comparables.length} comparables`)
      } else {
        console.log(`⚠️ SearchAPI no configurado, continuando sin comparables externos`)
      }
    } catch (error) {
      console.warn(`⚠️ Error buscando comparables (continuando sin ellos):`, error)
      comparables = []
    }

    // 3. OBTENER CONFIGURACIÓN DEL AGENTE DESDE LA BD
    const { data: configData } = await supabase
      .from('ia_config')
      .select('config_value')
      .eq('config_key', 'valoracion_vehiculos')
      .single()

    const config = configData?.config_value || {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2500,
      system_prompt: 'Eres un experto tasador de vehículos de segunda mano especializado en campers de gran volumen (FIAT Ducato, Peugeot Boxer, Citroën Jumper, etc.).',
      user_prompt: `OBJETIVO:
Tu tarea es redactar un INFORME EXPLICATIVO de valoración para una camper usada.

DATOS DEL VEHÍCULO:
{{datos_vehiculo}}

FICHA TÉCNICA:
{{ficha_tecnica}}

DATOS ECONÓMICOS:
{{datos_economicos}}

AVERÍAS GRAVES:
{{averias}}

MEJORAS INSTALADAS:
{{mejoras}}

COMPARABLES ENCONTRADOS:
{{comparables}}

Genera un informe profesional con estas secciones:
1. INTRODUCCIÓN
2. PRECIO DE NUEVA PARA PARTICULAR
3. DEPRECIACIÓN POR TIEMPO Y USO
4. VALOR DE LOS EXTRAS
5. COMPARACIÓN CON EL MERCADO
6. PRECIO (presenta 3 cifras: salida, objetivo, mínimo)
7. CONCLUSIÓN

Devuelve el informe en formato Markdown con encabezados ##`
    }

    console.log(`📝 [IA-VALORACION] Configuración cargada:`)
    console.log(`  - Modelo: ${config.model}`)
    console.log(`  - Temperature: ${config.temperature}`)
    console.log(`  - Max tokens: ${config.max_tokens}`)

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

    // Reemplazar variables en el user_prompt
    const userPrompt = config.user_prompt
      .replace(/\{\{fecha_hoy\}\}/g, fechaHoy)
      .replace(/\{\{datos_vehiculo\}\}/g, datosVehiculo)
      .replace(/\{\{ficha_tecnica\}\}/g, fichaTecnica)
      .replace(/\{\{datos_economicos\}\}/g, datosEconomicos)
      .replace(/\{\{averias\}\}/g, averiasTexto)
      .replace(/\{\{mejoras\}\}/g, mejorasTexto)
      .replace(/\{\{comparables\}\}/g, comparablesTexto)

    // 5. LLAMAR A OPENAI GPT-4
    console.log(`🤖 Generando informe con IA...`)

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: config.system_prompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: config.temperature,
      max_tokens: config.max_tokens
    })

    const informeTexto = completion.choices[0].message.content || 'No se pudo generar el informe'
    const tokensUsados = completion.usage?.total_tokens || 0

    console.log(`✅ Informe generado (${tokensUsados} tokens)`)

    // 6. EXTRAER PRECIOS DEL INFORME
    const precioSalidaMatch = informeTexto.match(/precio\s+de\s+salida\s+recomendado[:\s]+(\d{1,3}(?:\.\d{3})*)/i)
    const precioObjetivoMatch = informeTexto.match(/precio\s+objetivo\s+de\s+venta[:\s]+(\d{1,3}(?:\.\d{3})*)/i)
    const precioMinimoMatch = informeTexto.match(/precio\s+mínimo\s+aceptable[:\s]+(\d{1,3}(?:\.\d{3})*)/i)

    const precioSalida = precioSalidaMatch ? parseFloat(precioSalidaMatch[1].replace(/\./g, '')) : valoracion?.precio_compra ? valoracion.precio_compra * 1.1 : null
    const precioObjetivo = precioObjetivoMatch ? parseFloat(precioObjetivoMatch[1].replace(/\./g, '')) : valoracion?.precio_compra || null
    const precioMinimo = precioMinimoMatch ? parseFloat(precioMinimoMatch[1].replace(/\./g, '')) : valoracion?.precio_compra ? valoracion.precio_compra * 0.9 : null

    // 7. GUARDAR EN BASE DE DATOS
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
        precio_base_mercado: comparables.length > 0 ? comparables.reduce((sum, c) => sum + (c.precio || 0), 0) / comparables.filter(c => c.precio).length : null,
        depreciacion_aplicada: valoracion?.precio_compra && precioObjetivo ? ((valoracion.precio_compra - precioObjetivo) / valoracion.precio_compra) * 100 : null
      })
      .select()
      .single()

    if (errorGuardar) throw errorGuardar

    const tiempoTotal = Date.now() - startTime

    console.log(`✅ Valoración completada en ${(tiempoTotal / 1000).toFixed(2)}s`)

    return NextResponse.json({
      success: true,
      informe: informeGuardado,
      tokens_usados: tokensUsados
    })

  } catch (error: any) {
    console.error('❌ Error al generar valoración:', error)

    return NextResponse.json(
      {
        error: 'Error al generar valoración',
        detalle: error.message
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
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: informes, error } = await supabase
      .from('valoracion_ia_informes')
      .select('*')
      .eq('vehiculo_id', params.id)
      .eq('user_id', user.id)
      .order('fecha_valoracion', { ascending: false })

    if (error) throw error

    return NextResponse.json({ informes })

  } catch (error: any) {
    console.error('Error obteniendo valoraciones:', error)
    return NextResponse.json(
      { error: 'Error obteniendo valoraciones' },
      { status: 500 }
    )
  }
}
