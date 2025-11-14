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

    // 3. CONSTRUIR PROMPT PARA OPENAI
    const fechaHoy = new Date().toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })

    const prompt = `Eres un experto tasador de vehículos de segunda mano especializado en campers de gran volumen (FIAT Ducato, Peugeot Boxer, Citroën Jumper, etc.), camperizadas de fábrica por fabricantes como Weinsberg, Knaus, Pilote, Dethleffs, Adria, Dreamer y otros.

**FECHA DE VALORACIÓN:** ${fechaHoy}

**DATOS DEL VEHÍCULO:**
- Marca/Chasis: ${vehiculo.marca || 'No especificado'}
- Modelo: ${vehiculo.modelo || 'No especificado'}
- Tipo: ${vehiculo.tipo_vehiculo || 'Autocaravana'}
- Matrícula: ${vehiculo.matricula || 'No especificado'}
- Motor: ${ficha?.motor || 'No especificado'}
- Cambio: ${ficha?.cambio || 'No especificado'}
- Potencia: ${ficha?.potencia ? ficha.potencia + ' CV' : 'No especificado'}
- Kilometraje actual: ${ficha?.kilometros_actuales?.toLocaleString() || 'No especificado'} km

**DATOS ECONÓMICOS:**
- Precio de compra Furgocasa (SIN Impuesto de Matriculación): ${valoracion?.precio_compra?.toLocaleString() || 'No especificado'}€
- Fecha de compra/matriculación: ${valoracion?.fecha_compra || vehiculo.created_at?.split('T')[0] || 'No especificado'}
- Kilometraje en compra: ${valoracion?.kilometros_compra?.toLocaleString() || 'No especificado'} km
- Inversión total (mantenimientos + averías + mejoras): ${valoracion?.inversion_total?.toLocaleString() || '0'}€

**AVERÍAS GRAVES:** ${averias?.length || 0} averías críticas/graves registradas

**MEJORAS INSTALADAS:**
${mejoras && mejoras.length > 0 
  ? mejoras.map(m => `- ${m.nombre}: ${m.coste ? m.coste.toLocaleString() + '€' : 'coste no especificado'} (${m.fecha_instalacion || 'fecha no especificada'})`).join('\n')
  : '- No hay mejoras registradas'}

**COMPARABLES ENCONTRADOS EN INTERNET:**
${comparables.length > 0 
  ? comparables.map((c, i) => `${i + 1}. ${c.titulo}
   - Precio: ${c.precio ? c.precio.toLocaleString() + '€' : 'No especificado'}
   - Kilometraje: ${c.kilometros ? c.kilometros.toLocaleString() + ' km' : 'No especificado'}
   - Año: ${c.año || 'No especificado'}
   - Fuente: ${c.fuente}
   - URL: ${c.url}`).join('\n\n')
  : 'No se encontraron comparables en esta búsqueda.'}

**TU TAREA:**

Genera un INFORME PROFESIONAL de valoración siguiendo ESTRICTAMENTE esta estructura:

1. **INTRODUCCIÓN** (50-80 palabras)
   - Presenta el vehículo: chasis, modelo, motor, cambio, extras instalados
   - Indica fecha de compra/matriculación, kilometraje actual y uso

2. **PRECIO DE NUEVA PARA PARTICULAR** (60-100 palabras)
   - Explica cuánto costaría hoy comprar una unidad nueva igual o equivalente
   - IMPORTANTE: Incluye IVA (21%) e Impuesto de Matriculación (4.65%)
   - Un particular PAGA el Impuesto de Matriculación
   - Furgocasa NO pagó el Impuesto de Matriculación

3. **DEPRECIACIÓN POR TIEMPO Y USO** (100-150 palabras)
   - Analiza la edad del vehículo desde matriculación
   - Primer año (0-12 meses): pérdida mínima 0-5% (puede venderse por más)
   - 12-24 meses: bajada moderada 5-10%
   - 24-36 meses + >100k km: ajuste 15-20% por debajo de precio particular nuevo
   - Compara km recorridos vs media 25,000 km/año
   - Explica efecto de estar por encima o debajo

4. **VALOR DE LOS EXTRAS** (40-60 palabras)
   - Describe extras relevantes
   - Solo conservan 20-30% de coste inicial
   - Contribuyen a diferenciar la unidad

5. **COMPARACIÓN CON EL MERCADO** (100-150 palabras)
   ${comparables.length > 0 
     ? `- Comenta los ${comparables.length} anuncios comparables encontrados
   - Indica modelo, año, km, precio y fuente con URL
   - Resume rango de precios observados
   - Sitúa la camper de Furgocasa dentro del rango`
     : `- NO hay comparables externos disponibles en esta valoración
   - Basa la valoración en el precio de compra original, depreciación estándar y datos del vehículo
   - Justifica el precio basándote en: antigüedad, kilometraje, estado general, mejoras y mercado general`}

6. **PRECIO RECOMENDADO** (80-120 palabras)
   - Usa como referencia el precio particular nuevo (con IM)
   - Aplica descuento según antigüedad y km
   - Valida contra comparables reales
   - Presenta 3 cifras:
     * Precio de salida recomendado (negociación)
     * Precio objetivo de venta (realista)
     * Precio mínimo aceptable (límite)

7. **CONCLUSIÓN** (40-60 palabras)
   - Resumen y justificación de los 3 precios

**IMPORTANTE:**
- Extensión total: 400-700 palabras
- Estilo profesional, objetivo, claro
- NO inventes datos
- NO uses JSON ni tablas, solo texto narrativo
- Revisa coherencia: no vendas más caro que compra sin justificación
- Usa euros (€) y formato español

Devuelve el informe en formato Markdown con encabezados ## para cada sección.`

    // 4. LLAMAR A OPENAI GPT-4
    console.log(`🤖 Generando informe con IA...`)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto tasador de autocaravanas y campers con 20 años de experiencia en el mercado español de segunda mano."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })

    const informeTexto = completion.choices[0].message.content || 'No se pudo generar el informe'
    const tokensUsados = completion.usage?.total_tokens || 0

    console.log(`✅ Informe generado (${tokensUsados} tokens)`)

    // 5. EXTRAER PRECIOS DEL INFORME
    // Buscar los 3 precios en el texto
    const precioSalidaMatch = informeTexto.match(/precio\s+de\s+salida\s+recomendado[:\s]+(\d{1,3}(?:\.\d{3})*)/i)
    const precioObjetivoMatch = informeTexto.match(/precio\s+objetivo\s+de\s+venta[:\s]+(\d{1,3}(?:\.\d{3})*)/i)
    const precioMinimoMatch = informeTexto.match(/precio\s+mínimo\s+aceptable[:\s]+(\d{1,3}(?:\.\d{3})*)/i)

    const precioSalida = precioSalidaMatch ? parseFloat(precioSalidaMatch[1].replace(/\./g, '')) : valoracion?.precio_compra ? valoracion.precio_compra * 1.1 : null
    const precioObjetivo = precioObjetivoMatch ? parseFloat(precioObjetivoMatch[1].replace(/\./g, '')) : valoracion?.precio_compra || null
    const precioMinimo = precioMinimoMatch ? parseFloat(precioMinimoMatch[1].replace(/\./g, '')) : valoracion?.precio_compra ? valoracion.precio_compra * 0.9 : null

    // 6. GUARDAR EN BASE DE DATOS
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
        informe_html: null, // Se puede renderizar en frontend
        comparables_json: comparables,
        num_comparables: comparables.length,
        nivel_confianza: comparables.length >= 5 ? 'Alta' : comparables.length >= 3 ? 'Media' : comparables.length >= 1 ? 'Baja' : 'Estimativa',
        precio_base_mercado: comparables.length > 0 ? comparables.reduce((sum, c) => sum + (c.precio || 0), 0) / comparables.filter(c => c.precio).length : null,
        depreciacion_aplicada: valoracion?.precio_compra && precioObjetivo ? ((valoracion.precio_compra - precioObjetivo) / valoracion.precio_compra) * 100 : null
      })
      .select()
      .single()

    if (errorGuardar) {
      console.error('❌ Error guardando informe:', errorGuardar)
      throw errorGuardar
    }

    const tiempoProcesamiento = Date.now() - startTime

    console.log(`✅ Valoración completada en ${tiempoProcesamiento}ms`)

    return NextResponse.json({
      success: true,
      informe: informeGuardado,
      comparables,
      tiempo_procesamiento_ms: tiempoProcesamiento,
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

