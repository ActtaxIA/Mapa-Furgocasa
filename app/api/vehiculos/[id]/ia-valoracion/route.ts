import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buscarComparables } from '@/lib/valoracion/buscar-comparables'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// FUNCIÓN PRINCIPAL DE PROCESAMIENTO (se ejecuta en segundo plano)
async function procesarValoracionIA(jobId: string, vehiculoId: string, userId: string) {
  const startTime = Date.now()

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🤖 [IA-VALORACION] INICIANDO PROCESO`)
    console.log(`${'='.repeat(60)}`)
    console.log(`📍 Job ID: ${jobId}`)
    console.log(`📍 Vehículo ID: ${vehiculoId}`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)

    const supabase = await createClient()

    // Actualizar estado a "procesando"
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        estado: 'procesando',
        fecha_inicio: new Date().toISOString(),
        progreso: 0,
        mensaje_estado: 'Recopilando datos del vehículo...'
      })
      .eq('id', jobId)

    // 1. RECOPILAR DATOS DEL VEHÍCULO
    console.log(`\n📥 [PASO 1/7] Recopilando datos del vehículo...`)

    const { data: vehiculo, error: vehiculoError } = await (supabase as any)
      .from('vehiculos_registrados')
      .select('*')
      .eq('id', vehiculoId)
      .eq('user_id', userId)
      .single()

    if (vehiculoError || !vehiculo) {
      throw new Error('Vehículo no encontrado')
    }

    console.log(`✅ Vehículo encontrado: ${vehiculo.marca} ${vehiculo.modelo}`)

    const { data: valoracion } = await (supabase as any)
      .from('vehiculo_valoracion_economica')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .maybeSingle()

    console.log(`   💰 Datos económicos: ${valoracion ? 'Sí (precio: ' + valoracion.precio_compra + '€)' : 'No disponibles'}`)

    const { data: ficha } = await (supabase as any)
      .from('vehiculo_ficha_tecnica')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .maybeSingle()

    console.log(`   📋 Ficha técnica: ${ficha ? 'Sí' : 'No disponible'}`)

    // Obtener último kilometraje registrado
    const { data: ultimoKilometraje } = await (supabase as any)
      .from('vehiculo_kilometraje')
      .select('kilometros, fecha')
      .eq('vehiculo_id', vehiculoId)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log(`   🚗 Último kilometraje: ${ultimoKilometraje?.kilometros?.toLocaleString() || 'N/A'} km (${ultimoKilometraje?.fecha || 'sin fecha'})`)

    const { data: averias } = await (supabase as any)
      .from('averias')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .in('severidad', ['alta', 'critica'])

    console.log(`   🔧 Averías graves: ${averias?.length || 0}`)

    const { data: mejoras } = await (supabase as any)
      .from('vehiculo_mejoras')
      .select('*')
      .eq('vehiculo_id', vehiculoId)

    console.log(`   ⚙️  Mejoras: ${mejoras?.length || 0}`)

    // Actualizar progreso: 15%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 15,
        mensaje_estado: 'Buscando comparables en internet...'
      })
      .eq('id', jobId)

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

    // Actualizar progreso: 30%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 30,
        mensaje_estado: 'Analizando datos de la base de datos...'
      })
      .eq('id', jobId)

    // 2B. BUSCAR COMPARABLES EN NUESTRA BASE DE DATOS
    console.log(`\n🔍 [PASO 2B/7] Buscando comparables en nuestra BD...`)

    try {
      // Buscar vehículos similares con valoraciones IA (con datos del vehículo)
      const { data: valoracionesSimilares, error: errorValoraciones } = await (supabase as any)
        .from('valoracion_ia_informes')
        .select(`
          precio_objetivo,
          precio_salida,
          precio_minimo,
          precio_base_mercado,
          fecha_valoracion,
          vehiculo_id,
          vehiculos_registrados (
            año,
            marca,
            modelo
          )
        `)
        .neq('vehiculo_id', vehiculoId) // Excluir el vehículo actual
        .order('fecha_valoracion', { ascending: false })
        .limit(20)

      // Buscar datos de compra de usuarios (con datos del vehículo)
      // IMPORTANTE: Usar pvp_base_particular (precio normalizado con impuesto incluido)
      // en lugar de precio_compra para evitar sesgos por empresas de alquiler exentas
      const { data: datosCompra, error: errorCompra } = await (supabase as any)
        .from('vehiculo_valoracion_economica')
        .select(`
          precio_compra,
          pvp_base_particular,
          precio_incluye_impuesto_matriculacion,
          origen_compra,
          fecha_compra,
          kilometros_compra,
          vehiculo_id,
          vehiculos_registrados (
            año,
            marca,
            modelo
          )
        `)
        .neq('vehiculo_id', vehiculoId)
        .not('pvp_base_particular', 'is', null)
        .order('fecha_compra', { ascending: false })
        .limit(20)

      // Buscar datos de mercado scrapeados
      const { data: datosMercado, error: errorMercado } = await (supabase as any)
        .from('datos_mercado_autocaravanas')
        .select('*')
        .eq('verificado', true)
        .not('precio', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      let comparablesInternos = []

      // DEDUPLICACIÓN GLOBAL: Un vehículo = Un comparable
      // Prioridad: Valoración IA más reciente > Precio de compra
      console.log(`   🔄 Deduplicando comparables por vehículo...`)
      console.log(`   📊 Valoraciones IA encontradas: ${valoracionesSimilares?.length || 0}`)
      console.log(`   📊 Compras encontradas: ${datosCompra?.length || 0}`)

      const vehiculosUnicos = new Map<string, any>()

      // 1. Primero procesar valoraciones IA (más actuales y relevantes)
      // MEJORA: Obtener km actuales de los vehículos de valoraciones IA
      if (valoracionesSimilares && valoracionesSimilares.length > 0) {
        // Obtener km actuales de todos los vehículos de una vez
        const vehiculosIds = [...new Set(valoracionesSimilares.map((v: any) => v.vehiculo_id))]
        const { data: fichasComparables } = await (supabase as any)
          .from('vehiculo_ficha_tecnica')
          .select('vehiculo_id, kilometros_actuales')
          .in('vehiculo_id', vehiculosIds)

        // Crear mapa rápido de km por vehículo
        const kmPorVehiculo = new Map<string, number>()
        fichasComparables?.forEach((f: any) => {
          if (f.kilometros_actuales) {
            kmPorVehiculo.set(f.vehiculo_id, f.kilometros_actuales)
          }
        })

        // Si no hay en ficha técnica, buscar en kilometraje más reciente
        if (kmPorVehiculo.size < vehiculosIds.length) {
          const { data: kmRegistros } = await (supabase as any)
            .from('vehiculo_kilometraje')
            .select('vehiculo_id, kilometros')
            .in('vehiculo_id', vehiculosIds)
            .order('fecha', { ascending: false })

          // Agrupar por vehículo y tomar el más reciente
          const kmPorVehiculoRegistro = new Map<string, number>()
          kmRegistros?.forEach((k: any) => {
            if (!kmPorVehiculoRegistro.has(k.vehiculo_id) && k.kilometros) {
              kmPorVehiculoRegistro.set(k.vehiculo_id, k.kilometros)
            }
          })

          // Combinar ambos mapas
          kmPorVehiculoRegistro.forEach((km: any, id: any) => {
            if (!kmPorVehiculo.has(id)) {
              kmPorVehiculo.set(id, km)
            }
          })
        }

        for (const valoracion of valoracionesSimilares as any[]) {
          const vehiculoIdComp = valoracion.vehiculo_id

          // FIX: Manejar JOIN que puede venir como objeto o array
          const vehiculoData = Array.isArray(valoracion.vehiculos_registrados)
            ? valoracion.vehiculos_registrados[0]
            : valoracion.vehiculos_registrados

          const existente = vehiculosUnicos.get(vehiculoIdComp)

          // Si no existe o esta valoración es más reciente, actualizar
          if (!existente || new Date(valoracion.fecha_valoracion) > new Date(existente.fecha)) {
            vehiculosUnicos.set(vehiculoIdComp, {
              tipo: 'valoracion_ia',
              precio: valoracion.precio_objetivo,
              fecha: valoracion.fecha_valoracion,
              vehiculo_id: vehiculoIdComp,
              año: vehiculoData?.año || null,
              marca: vehiculoData?.marca || null,
              modelo: vehiculoData?.modelo || null,
              kilometros: kmPorVehiculo.get(vehiculoIdComp) || null
            })
          }
        }

        console.log(`   ✅ Valoraciones IA procesadas: ${valoracionesSimilares.length} → Vehículos únicos: ${vehiculosUnicos.size}`)
      }

      // 2. Agregar compras SOLO si el vehículo NO tiene valoración IA
      if (datosCompra && datosCompra.length > 0) {
        for (const compra of datosCompra as any[]) {
          const vehiculoIdComp = compra.vehiculo_id

          // FIX: Manejar JOIN que puede venir como objeto o array
          const vehiculoDataCompra = Array.isArray(compra.vehiculos_registrados)
            ? compra.vehiculos_registrados[0]
            : compra.vehiculos_registrados

          // Solo agregar si este vehículo no tiene ya una valoración IA
          if (!vehiculosUnicos.has(vehiculoIdComp)) {
            // IMPORTANTE: Usar pvp_base_particular en lugar de precio_compra
            // para evitar sesgos por empresas de alquiler exentas del impuesto
            vehiculosUnicos.set(vehiculoIdComp, {
              tipo: 'compra',
              precio: compra.pvp_base_particular || compra.precio_compra,
              fecha: compra.fecha_compra,
              vehiculo_id: vehiculoIdComp,
              año: vehiculoDataCompra?.año || null,
              marca: vehiculoDataCompra?.marca || null,
              modelo: vehiculoDataCompra?.modelo || null,
              kilometros: compra.kilometros_compra || null
            })
          }
        }

        console.log(`   ✅ Compras procesadas: ${datosCompra.length} → Vehículos únicos totales: ${vehiculosUnicos.size}`)
      }

      // 3. FUNCIONES DE ANÁLISIS DE COMPARABLES
      // Datos del vehículo a valorar para comparación
      const kmVehiculo = ficha?.kilometros_actuales || null
      const añoVehiculo = vehiculo.año || null
      const precioCompraVehiculo = valoracion?.precio_compra || null

      // Función para calcular relevancia de un comparable
      const calcularRelevancia = (comparable: any): number => {
        let relevancia = 100

        // Penalizar diferencia de km (más importante)
        if (comparable.kilometros && kmVehiculo) {
          const diffKm = Math.abs(comparable.kilometros - kmVehiculo)
          // -0.5% por cada 1000 km de diferencia
          relevancia -= (diffKm / 1000) * 0.5
        } else if (!comparable.kilometros && kmVehiculo) {
          // Si falta km en comparable, penalizar más
          relevancia -= 15
        }

        // Penalizar diferencia de año
        if (comparable.año && añoVehiculo) {
          const diffAño = Math.abs(comparable.año - añoVehiculo)
          // -5% por cada año de diferencia
          relevancia -= diffAño * 5
        } else if (!comparable.año && añoVehiculo) {
          relevancia -= 10
        }

        // Penalizar diferencia de precio (muy diferente = menos relevante)
        if (comparable.precio && precioCompraVehiculo) {
          const diffPrecio = Math.abs(comparable.precio - precioCompraVehiculo) / precioCompraVehiculo
          if (diffPrecio > 0.3) relevancia -= 20 // -20% si precio difiere >30%
          else if (diffPrecio > 0.2) relevancia -= 10 // -10% si difiere >20%
        }

        return Math.max(0, Math.min(100, Math.round(relevancia)))
      }

      // Función para ajustar precio según diferencia de km
      const ajustarPrecioPorKm = (comparable: any): number => {
        if (!comparable.precio || !comparable.kilometros || !kmVehiculo) {
          return comparable.precio || 0
        }

        const diffKm = comparable.kilometros - kmVehiculo
        const ajustePor10k = 0.025 // 2.5% por cada 10.000 km de diferencia

        // Si comparable tiene más km → precio debería ser menor
        // Si comparable tiene menos km → precio debería ser mayor
        const factorAjuste = 1 - (diffKm / 10000) * ajustePor10k

        return Math.round(comparable.precio * factorAjuste)
      }

      // Función para filtrar comparables por similitud
      const esComparableRelevante = (comparable: any): boolean => {
        // Filtro por km: ±30.000 km (como dice el prompt)
        if (comparable.kilometros && kmVehiculo) {
          const diferenciaKm = Math.abs(comparable.kilometros - kmVehiculo)
          if (diferenciaKm > 30000) {
            console.log(`   ⚠️  Descartado por km: ${comparable.titulo} (diff: ${diferenciaKm} km)`)
            return false
          }
        }

        // Filtro por año: ±2 años
        if (comparable.año && añoVehiculo) {
          const diferenciaAño = Math.abs(comparable.año - añoVehiculo)
          if (diferenciaAño > 2) {
            console.log(`   ⚠️  Descartado por año: ${comparable.titulo} (diff: ${diferenciaAño} años)`)
            return false
          }
        }

        return true
      }

      // 4. Convertir a array y crear comparables con información completa
      // SEGURIDAD: Filtrar explícitamente el vehículo actual (aunque SQL ya lo hace)
      const vehiculosDeduplicados = Array.from(vehiculosUnicos.values())
        .filter((v: any) => v.vehiculo_id !== vehiculoId) // Excluir el vehículo actual

      console.log(`   🔒 Validación: Vehículos después de excluir el actual: ${vehiculosDeduplicados.length}`)

      let comparablesConRelevancia = vehiculosDeduplicados.map((v: any) => {
        const titulo = v.marca && v.modelo
          ? `${v.marca} ${v.modelo} - España`
          : (v.tipo === 'valoracion_ia' ? 'Valoración IA similar' : 'Vehículo similar comprado')

        const comparable = {
          titulo,
          precio: v.precio,
          año: v.año,
          kilometros: v.kilometros,
          link: null,
          fuente: v.tipo === 'valoracion_ia' ? 'BD Interna - Valoraciones IA' : 'BD Interna - Compras Usuarios',
          fecha: v.fecha,
          vehiculo_id: v.vehiculo_id, // FIX: Incluir vehiculo_id para deduplicación
          relevancia: 0 // Se calculará después
        }

        // Calcular relevancia
        comparable.relevancia = calcularRelevancia(comparable)

        // Ajustar precio por km
        const precioAjustado = ajustarPrecioPorKm(comparable)
        if (precioAjustado !== comparable.precio) {
          comparable.precio = precioAjustado
        }

        return comparable
      })

      // 5. Filtrar comparables irrelevantes
      const comparablesFiltrados = comparablesConRelevancia.filter(esComparableRelevante)
      console.log(`   🔍 Comparables después de filtrado: ${comparablesFiltrados.length} de ${comparablesConRelevancia.length}`)

      // 6. Ordenar por relevancia DESC, luego por fecha DESC
      comparablesConRelevancia = comparablesFiltrados
        .sort((a: any, b: any) => {
          if (a.relevancia !== b.relevancia) {
            return b.relevancia - a.relevancia
          }
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        })
        .slice(0, 8) // Máximo 8 comparables internos

      console.log(`   ✅ Comparables finales ordenados por relevancia: ${comparablesConRelevancia.length}`)

      // 7. Validación de comparables mínimos
      if (comparablesConRelevancia.length < 3) {
        console.warn(`   ⚠️  ADVERTENCIA: Solo ${comparablesConRelevancia.length} comparables relevantes encontrados`)
        console.warn(`   💡 Se recomienda ampliar criterios de búsqueda`)
      }

      comparablesInternos = comparablesConRelevancia

      // Agregar datos de mercado scrapeados (con relevancia y filtrado)
      if (datosMercado && datosMercado.length > 0) {
        const comparablesMercado = datosMercado.map((d: any) => {
          const comparable = {
            titulo: `${d.marca || ''} ${d.modelo || ''} - ${d.pais || 'España'}`.trim(),
            precio: d.precio,
            año: d.año || null,
            kilometros: d.kilometros,
            ubicacion: d.pais || 'España',
            link: null,
            fuente: d.origen || 'BD Interna - Mercado',
            fecha: d.fecha_transaccion || d.created_at,
            vehiculo_id: null, // No tiene vehiculo_id asociado
            relevancia: 0
          }

          // Calcular relevancia
          comparable.relevancia = calcularRelevancia(comparable)

          // Ajustar precio por km
          const precioAjustado = ajustarPrecioPorKm(comparable)
          if (precioAjustado !== comparable.precio) {
            comparable.precio = precioAjustado
          }

          return comparable
        })

        // Filtrar y ordenar comparables de mercado
        const comparablesMercadoFiltrados = comparablesMercado
          .filter(esComparableRelevante)
          .sort((a: any, b: any) => {
            if (a.relevancia !== b.relevancia) {
              return b.relevancia - a.relevancia
            }
            return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          })
          .slice(0, 5) // Máximo 5 comparables de mercado

        comparablesInternos.push(...comparablesMercadoFiltrados)
        console.log(`   ✅ Comparables de mercado filtrados: ${comparablesMercadoFiltrados.length} de ${comparablesMercado.length}`)
      }

      // Procesar comparables externos (SerpAPI) con relevancia y filtrado
      const totalComparablesAntes = comparables.length
      if (comparables.length > 0) {
        const comparablesExternosProcesados = comparables.map((c: any) => {
          const comparable = {
            ...c,
            vehiculo_id: c.vehiculo_id || null, // Asegurar que tenga vehiculo_id (null si es externo)
            relevancia: 0
          }

          // Calcular relevancia
          comparable.relevancia = calcularRelevancia(comparable)

          // Ajustar precio por km
          const precioAjustado = ajustarPrecioPorKm(comparable)
          if (precioAjustado !== comparable.precio) {
            comparable.precio = precioAjustado
          }

          return comparable
        })

        // Filtrar y ordenar comparables externos
        const comparablesExternosFiltrados = comparablesExternosProcesados
          .filter(esComparableRelevante)
          .sort((a: any, b: any) => {
            if (a.relevancia !== b.relevancia) {
              return b.relevancia - a.relevancia
            }
            return new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime()
          })
          .slice(0, 10) // Máximo 10 comparables externos

        comparables = comparablesExternosFiltrados
        console.log(`   ✅ Comparables externos filtrados: ${comparablesExternosFiltrados.length} de ${totalComparablesAntes}`)
      }

      // Combinar todos los comparables
      comparables = [...comparables, ...comparablesInternos]

      // DEDUPLICACIÓN FINAL: Eliminar duplicados exactos por vehiculo_id + precio + año
      const comparablesUnicosFinal = new Map<string, any>()
      const claveComparable = (c: any) => {
        // Crear clave única: vehiculo_id (si existe) o título + precio + año
        if (c.vehiculo_id) {
          return `vehiculo_${c.vehiculo_id}`
        }
        return `${c.titulo}_${c.precio}_${c.año || 'sin_año'}`
      }

      for (const comp of comparables) {
        // SEGURIDAD: Excluir explícitamente el vehículo actual (aunque SQL ya lo hace)
        if (comp.vehiculo_id === vehiculoId) {
          console.warn(`   ⚠️  BLOQUEADO: Intento de incluir el vehículo actual como comparable (ID: ${vehiculoId})`)
          continue
        }

        const clave = claveComparable(comp)
        const existente = comparablesUnicosFinal.get(clave)

        // Si no existe o este tiene mayor relevancia, reemplazar
        if (!existente || (comp.relevancia || 0) > (existente.relevancia || 0)) {
          comparablesUnicosFinal.set(clave, comp)
        }
      }

      comparables = Array.from(comparablesUnicosFinal.values())
      console.log(`   🔄 Deduplicación final: ${comparables.length} comparables únicos`)

      // Validar y corregir relevancia NaN
      comparables = comparables.map((c: any) => {
        if (isNaN(c.relevancia) || c.relevancia === null || c.relevancia === undefined) {
          console.warn(`   ⚠️  Comparable sin relevancia: ${c.titulo}, recalculando...`)
          c.relevancia = calcularRelevancia(c)
        }
        // Asegurar que relevancia es número válido entre 0-100
        c.relevancia = Math.max(0, Math.min(100, Math.round(c.relevancia || 0)))
        return c
      })

      // Ordenar todos por relevancia DESC
      comparables.sort((a: any, b: any) => {
        if (a.relevancia !== b.relevancia) {
          return b.relevancia - a.relevancia
        }
        return new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime()
      })

      // Limitar total a 15 comparables (los más relevantes)
      comparables = comparables.slice(0, 15)

      console.log(`   ✅ Comparables de SerpAPI: ${totalComparablesAntes}`)
      console.log(`   ✅ Comparables de BD interna: ${comparablesInternos.length}`)
      console.log(`   ✅ Total comparables finales (después de deduplicación): ${comparables.length}`)
      console.log(`   📊 Relevancia promedio: ${comparables.length > 0 ? Math.round(comparables.reduce((sum: any, c: any) => sum + (c.relevancia || 0), 0) / comparables.length) : 0}%`)

      // Log de muestra de comparables para debug
      if (comparables.length > 0) {
        console.log(`   📋 Muestra de comparables (primeros 3):`)
        comparables.slice(0, 3).forEach((c: any, i: any) => {
          console.log(`      ${i + 1}. ${c.titulo} - Precio: ${c.precio}€ - Año: ${c.año || 'N/A'} - Km: ${c.kilometros || 'N/A'} - Relevancia: ${c.relevancia}%`)
        })
      }

      // Validación final de comparables mínimos
      if (comparables.length < 3) {
        console.warn(`   ⚠️  ADVERTENCIA CRÍTICA: Solo ${comparables.length} comparables relevantes encontrados`)
        console.warn(`   💡 La valoración puede ser menos precisa. Se recomienda ampliar criterios de búsqueda.`)
      }

    } catch (error: any) {
      console.error(`   ⚠️  Error buscando en BD interna:`, error.message)
      console.log(`   ⏭️  Continuando con comparables de SerpAPI únicamente`)
    }

    // Actualizar progreso: 50%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 50,
        mensaje_estado: 'Cargando configuración de IA...'
      })
      .eq('id', jobId)

    // 3. OBTENER CONFIGURACIÓN DEL AGENTE DESDE LA BD
    console.log(`\n⚙️  [PASO 3/7] Cargando configuración del agente IA...`)

    const { data: configData, error: configError } = await (supabase as any)
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

    // Calcular datos derivados para el análisis
    const fechaCompra = valoracion?.fecha_compra || vehiculo.created_at?.split('T')[0]
    const añosAntiguedad = fechaCompra
      ? ((Date.now() - new Date(fechaCompra).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)
      : null

    // IMPORTANTE: Usar kilometraje de la tabla vehiculo_kilometraje (último registro)
    const kmActuales = ultimoKilometraje?.kilometros || null
    const kmCompra = valoracion?.kilometros_compra || 0
    const kmRecorridos = kmActuales && kmCompra ? kmActuales - kmCompra : null
    const kmPorAño = kmRecorridos && añosAntiguedad ? (kmRecorridos / parseFloat(añosAntiguedad)).toFixed(0) : null
    
    console.log(`   📊 Kilometraje para valoración:`)
    console.log(`      - KM Actual (vehiculo_kilometraje): ${kmActuales?.toLocaleString() || 'N/A'} km`)
    console.log(`      - KM Compra (valoracion_economica): ${kmCompra?.toLocaleString() || 'N/A'} km`)
    console.log(`      - KM Recorridos: ${kmRecorridos?.toLocaleString() || 'N/A'} km`)
    console.log(`      - Promedio anual: ${kmPorAño?.toLocaleString() || 'N/A'} km/año`)

    // IMPORTANTE: Usar pvp_base_particular si está disponible (precio normalizado con impuesto incluido)
    const precioReferencia = valoracion?.pvp_base_particular || valoracion?.precio_compra
    const incluyeImpuesto = valoracion?.precio_incluye_impuesto_matriculacion ?? true
    const origenCompra = valoracion?.origen_compra || 'particular'
    const impuestoEstimado = valoracion?.impuesto_matriculacion_estimado

    console.log(`   💰 Precios detectados:`)
    console.log(`      - Precio compra original: ${valoracion?.precio_compra?.toLocaleString() || 'N/A'}€`)
    console.log(`      - PVP base particular: ${valoracion?.pvp_base_particular?.toLocaleString() || 'N/A'}€`)
    console.log(`      - Incluye impuesto: ${incluyeImpuesto ? 'Sí' : 'No'}`)
    console.log(`      - Origen compra: ${origenCompra}`)
    console.log(`      - Impuesto estimado: ${impuestoEstimado?.toLocaleString() || 'N/A'}€`)
    console.log(`      ➡️  Usando para valoración: ${precioReferencia?.toLocaleString() || 'N/A'}€`)

    const datosEconomicos = `- Precio de compra original: ${valoracion?.precio_compra?.toLocaleString() || 'No especificado'}€
- PVP equivalente particular (normalizado): ${precioReferencia?.toLocaleString() || 'No especificado'}€${!incluyeImpuesto ? ' ⚠️ (precio original sin impuesto matriculación, normalizado añadiendo ~14.75%)' : ''}
- Origen/tipo de compra: ${origenCompra}${origenCompra === 'empresa_alquiler' ? ' ⚠️ (exento impuesto matriculación)' : ''}
- Fecha de compra/matriculación: ${fechaCompra || 'No especificado'}
- Antigüedad: ${añosAntiguedad ? añosAntiguedad + ' años' : 'No especificado'}
- Kilometraje en compra: ${kmCompra?.toLocaleString() || 'No especificado'} km
- Kilometraje actual: ${kmActuales?.toLocaleString() || 'No especificado'} km
- Kilómetros recorridos: ${kmRecorridos ? kmRecorridos.toLocaleString() + ' km' : 'No calculable'}
- Promedio anual: ${kmPorAño ? kmPorAño.toLocaleString() + ' km/año' : 'No calculable'}
- Inversión total (mantenimientos + averías + mejoras): ${valoracion?.inversion_total?.toLocaleString() || '0'}€`

    const averiasTexto = averias && averias.length > 0
      ? `${averias.length} averías críticas/graves registradas:\n` + averias.map((a: any) => `- ${a.descripcion} (${a.fecha}, severidad: ${a.severidad})`).join('\n')
      : 'No hay averías graves registradas'

    const mejorasTexto = mejoras && mejoras.length > 0
      ? mejoras.map((m: any) => `- ${m.nombre}: ${m.coste ? m.coste.toLocaleString() + '€' : 'coste no especificado'} (${m.fecha_instalacion || 'fecha no especificada'})`).join('\n')
      : 'No hay mejoras registradas'

    const comparablesTexto = comparables.length > 0
      ? comparables.map((c: any, i: any) => `${i + 1}. ${c.titulo}
   - Precio: ${c.precio ? c.precio.toLocaleString() + '€' : 'No especificado'}${c.relevancia ? ` (Relevancia: ${c.relevancia}%)` : ''}
   - Kilometraje: ${c.kilometros ? c.kilometros.toLocaleString() + ' km' : 'No especificado'}
   - Año: ${c.año || 'No especificado'}
   - Fuente: ${c.fuente}
   ${c.url ? `- URL: ${c.url}` : ''}`).join('\n\n')
      : 'No se encontraron comparables en esta búsqueda.'

    // Actualizar progreso: 60%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 60,
        mensaje_estado: 'Preparando mensajes para GPT-4...'
      })
      .eq('id', jobId)

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

    // Actualizar progreso: 70%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 70,
        mensaje_estado: 'Generando informe con GPT-4... (puede tardar 1-2 minutos)'
      })
      .eq('id', jobId)

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

    // Actualizar progreso: 85%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 85,
        mensaje_estado: 'Extrayendo precios del informe...'
      })
      .eq('id', jobId)

    // 6. EXTRAER PRECIOS DEL INFORME
    console.log(`\n💰 [PASO 6/7] Extrayendo precios del informe...`)

    // Regex mejorado: captura números con puntos o comas como separadores de miles
    // Ejemplos: "64.000€", "64,000€", "64000€", "64.000 €", "64,000 €"
    const precioSalidaMatch = informeTexto.match(/precio\s+de\s+salida\s+recomendado[:\s]+(\d{1,3}(?:[.,]\d{3})*)/i)
    const precioObjetivoMatch = informeTexto.match(/precio\s+objetivo\s+de\s+venta[:\s]+(\d{1,3}(?:[.,]\d{3})*)/i)
    const precioMinimoMatch = informeTexto.match(/precio\s+mínimo\s+aceptable[:\s]+(\d{1,3}(?:[.,]\d{3})*)/i)

    // Función auxiliar para parsear precios eliminando puntos y comas como separadores
    const parsearPrecio = (precioStr: string): number => {
      return parseFloat(precioStr.replace(/[.,]/g, ''))
    }

    // Debug: mostrar lo que capturó el regex
    console.log(`   🔍 Match Salida: "${precioSalidaMatch ? precioSalidaMatch[1] : 'NO MATCH'}"`)
    console.log(`   🔍 Match Objetivo: "${precioObjetivoMatch ? precioObjetivoMatch[1] : 'NO MATCH'}"`)
    console.log(`   🔍 Match Mínimo: "${precioMinimoMatch ? precioMinimoMatch[1] : 'NO MATCH'}"`)

    // IMPORTANTE: Usar pvp_base_particular (precio normalizado) como fallback en lugar de precio_compra
    const precioReferenciaFallback = valoracion?.pvp_base_particular || valoracion?.precio_compra
    const precioSalida = precioSalidaMatch ? parsearPrecio(precioSalidaMatch[1]) : precioReferenciaFallback ? precioReferenciaFallback * 1.1 : null
    const precioObjetivo = precioObjetivoMatch ? parsearPrecio(precioObjetivoMatch[1]) : precioReferenciaFallback || null
    const precioMinimo = precioMinimoMatch ? parsearPrecio(precioMinimoMatch[1]) : precioReferenciaFallback ? precioReferenciaFallback * 0.9 : null

    console.log(`   💵 Salida parseado: ${precioSalida}€`)
    console.log(`   🎯 Objetivo parseado: ${precioObjetivo}€`)
    console.log(`   📉 Mínimo parseado: ${precioMinimo}€`)

    // Actualizar progreso: 90%
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        progreso: 90,
        mensaje_estado: 'Guardando informe en base de datos...'
      })
      .eq('id', jobId)

    // 7. GUARDAR EN BASE DE DATOS
    console.log(`\n💾 [PASO 7/7] Guardando en base de datos...`)

    // Calcular precio base de mercado (promedio de comparables)
    // LIMPIEZA FINAL: Asegurar que todos los comparables tienen estructura válida antes de guardar
    // SEGURIDAD FINAL: Filtrar cualquier comparable que sea el vehículo actual (triple verificación)
    const comparablesLimpios = comparables
      .filter((c: any) => {
        // Excluir el vehículo actual por vehiculo_id
        if (c.vehiculo_id === vehiculoId) {
          console.warn(`   ⚠️  BLOQUEADO EN LIMPIEZA: Comparable del vehículo actual detectado y eliminado`)
          return false
        }
        return true
      })
      .map((c: any) => {
        return {
          titulo: c.titulo || 'Comparable sin título',
          precio: c.precio || null,
          año: c.año || null,
          kilometros: c.kilometros || null,
          link: c.link || c.url || null, // Compatibilidad con ambos campos
          url: c.url || c.link || null, // Mantener ambos para compatibilidad
          fuente: c.fuente || 'Fuente desconocida',
          fecha: c.fecha || null,
          descripcion: c.descripcion || null,
          relevancia: typeof c.relevancia === 'number' && !isNaN(c.relevancia)
            ? Math.max(0, Math.min(100, Math.round(c.relevancia)))
            : 0,
          // No incluir vehiculo_id en el JSON guardado (solo para deduplicación interna)
        }
      })

    console.log(`\n🧹 Limpieza final de comparables:`)
    console.log(`   ✅ Comparables antes de limpiar: ${comparables.length}`)
    console.log(`   ✅ Comparables después de limpiar: ${comparablesLimpios.length}`)
    console.log(`   📊 Relevancias válidas: ${comparablesLimpios.filter((c: any) => c.relevancia > 0).length}/${comparablesLimpios.length}`)
    console.log(`   📊 Con año: ${comparablesLimpios.filter((c: any) => c.año).length}/${comparablesLimpios.length}`)
    console.log(`   📊 Con km: ${comparablesLimpios.filter((c: any) => c.kilometros).length}/${comparablesLimpios.length}`)

    const precioBaseMercado = comparablesLimpios.length > 0
      ? comparablesLimpios.reduce((sum: any, c: any) => sum + (c.precio || 0), 0) / comparablesLimpios.filter((c: any) => c.precio).length
      : null

    // Calcular variación de valor (positivo = revalorización, negativo = depreciación)
    // IMPORTANTE: Usar pvp_base_particular (precio normalizado) para cálculos precisos
    const precioCompraUsuario = valoracion?.pvp_base_particular || valoracion?.precio_compra
    const variacionValor = precioCompraUsuario && precioObjetivo
      ? ((precioObjetivo - precioCompraUsuario) / precioCompraUsuario) * 100
      : null

    console.log(`\n📊 Cálculos finales:`)
    console.log(`   💰 Precio base mercado: ${precioBaseMercado ? precioBaseMercado.toFixed(0) + '€' : 'N/A'}`)
    console.log(`   💵 Precio compra usuario (normalizado): ${precioCompraUsuario ? precioCompraUsuario.toFixed(0) + '€' : 'No especificado'}`)
    console.log(`   🎯 Precio objetivo IA: ${precioObjetivo}€`)
    console.log(`   ${variacionValor !== null && variacionValor >= 0 ? '📈' : '📉'} Variación valor: ${variacionValor !== null ? (variacionValor >= 0 ? '+' : '') + variacionValor.toFixed(1) + '%' : 'N/A (no hay precio de compra)'}`)
    console.log(`   🔍 Cálculo: (${precioObjetivo} - ${precioCompraUsuario}) / ${precioCompraUsuario} * 100 = ${variacionValor}`)

    const { data: informeGuardado, error: errorGuardar } = await (supabase as any)
      .from('valoracion_ia_informes')
      .insert({
        vehiculo_id: vehiculoId,
        user_id: userId,
        fecha_valoracion: new Date().toISOString(),
        precio_salida: precioSalida,
        precio_objetivo: precioObjetivo,
        precio_minimo: precioMinimo,
        informe_texto: informeTexto,
        informe_html: null,
        comparables_json: comparablesLimpios, // Usar comparables limpios
        num_comparables: comparablesLimpios.length,
        nivel_confianza: comparablesLimpios.length >= 5 ? 'Alta' : comparablesLimpios.length >= 3 ? 'Media' : comparablesLimpios.length >= 1 ? 'Baja' : 'Estimativa',
        precio_base_mercado: precioBaseMercado,
        depreciacion_aplicada: variacionValor
      })
      .select()
      .single()

    if (errorGuardar) {
      console.error('   ❌ Error al guardar:', errorGuardar)
      throw errorGuardar
    }

    console.log(`   ✅ Informe guardado con ID: ${informeGuardado.id}`)

    // 8. GUARDAR COMPARABLES EN TABLA DE MERCADO (si hay)
    // IMPORTANTE: Usar comparablesLimpios (ya filtrados y sin el vehículo actual)
    if (comparablesLimpios.length > 0) {
      console.log(`\n📊 Guardando ${comparablesLimpios.length} comparables en datos_mercado_autocaravanas...`)

      const comparablesParaGuardar = comparablesLimpios.map((c: any) => ({
        marca: vehiculo.marca || null,
        modelo: vehiculo.modelo || null,
        año: vehiculo.año || null,
        precio: c.precio || null,
        kilometros: c.kilometros || null,
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

      const { data: mercadoGuardado, error: errorMercado } = await (supabase as any)
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

    // ACTUALIZAR TRABAJO COMO COMPLETADO
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        estado: 'completado',
        progreso: 100,
        mensaje_estado: '¡Valoración completada exitosamente!',
        informe_id: informeGuardado.id,
        fecha_finalizacion: new Date().toISOString(),
        tiempo_procesamiento_segundos: Math.round(tiempoTotal / 1000),
        tokens_usados: tokensUsados
      })
      .eq('id', jobId)

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ VALORACIÓN COMPLETADA EN ${(tiempoTotal / 1000).toFixed(2)}s`)
    console.log(`${'='.repeat(60)}\n`)

  } catch (error: any) {
    console.error(`\n${'='.repeat(60)}`)
    console.error('❌ [IA-VALORACION] ERROR CRÍTICO')
    console.error(`${'='.repeat(60)}`)
    console.error('📛 Mensaje:', error.message)
    console.error('📚 Stack:', error.stack)
    console.error(`${'='.repeat(60)}\n`)

    // ACTUALIZAR TRABAJO COMO ERROR
    const supabase = await createClient()
    await (supabase as any)
      .from('valoracion_ia_trabajos')
      .update({
        estado: 'error',
        mensaje_estado: 'Error al generar valoración',
        error_mensaje: error.message,
        error_detalle: error.stack,
        fecha_finalizacion: new Date().toISOString()
      })
      .eq('id', jobId)
  }
}

// POST: Crear trabajo asíncrono
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`\n🚀 [POST IA-VALORACION] Creando trabajo asíncrono`)
    console.log(`📍 Vehículo ID: ${params.id}`)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('❌ Usuario no autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`👤 Usuario: ${user.id} (${user.email})`)

    // Verificar que el vehículo existe y pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await (supabase as any)
      .from('vehiculos_registrados')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (vehiculoError || !vehiculo) {
      console.error('❌ Vehículo no encontrado')
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Crear trabajo en estado "pendiente"
    const { data: trabajo, error: errorTrabajo } = await (supabase as any)
      .from('valoracion_ia_trabajos')
      .insert({
        vehiculo_id: params.id,
        user_id: user.id,
        estado: 'pendiente',
        progreso: 0,
        mensaje_estado: 'Trabajo creado, iniciando procesamiento...'
      })
      .select()
      .single()

    if (errorTrabajo) {
      console.error('❌ Error creando trabajo:', errorTrabajo)
      return NextResponse.json({ error: 'Error creando trabajo' }, { status: 500 })
    }

    console.log(`✅ Trabajo creado con ID: ${trabajo.id}`)

    // INICIAR PROCESAMIENTO EN SEGUNDO PLANO (sin await)
    procesarValoracionIA(trabajo.id, params.id, user.id).catch((error) => {
      console.error('❌ Error en procesamiento asíncrono:', error)
    })

    // RESPONDER INMEDIATAMENTE al cliente
    return NextResponse.json({
      success: true,
      job_id: trabajo.id,
      mensaje: 'Valoración iniciada. Consulta el estado con GET /api/vehiculos/[id]/ia-valoracion/status?job_id=' + trabajo.id
    })

  } catch (error: any) {
    console.error('\n❌ [POST IA-VALORACION] ERROR:', error)
    return NextResponse.json(
      {
        error: 'Error iniciando valoración',
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
    console.log(`\n🔍 [GET VALORACIONES] Iniciando carga para vehículo: ${params.id}`)

    const supabase = await createClient()
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

    const { data: informes, error } = await (supabase as any)
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

// DELETE: Eliminar una valoración específica del historial
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`\n🗑️ [DELETE VALORACION] Iniciando eliminación`)

    const supabase = await createClient()

    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Usuario no autenticado')
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Obtener el ID de la valoración a eliminar desde query params
    const { searchParams } = new URL(request.url)
    const valoracionId = searchParams.get('valoracion_id')

    if (!valoracionId) {
      return NextResponse.json(
        { error: 'ID de valoración requerido' },
        { status: 400 }
      )
    }

    console.log(`   📋 Vehículo ID: ${params.id}`)
    console.log(`   🗑️ Valoración ID: ${valoracionId}`)

    // 3. Verificar que la valoración pertenece al usuario y al vehículo
    const { data: valoracion, error: checkError } = await (supabase as any)
      .from('valoracion_ia_informes')
      .select('id, vehiculo_id, user_id')
      .eq('id', valoracionId)
      .eq('user_id', user.id)
      .eq('vehiculo_id', params.id)
      .single()

    if (checkError || !valoracion) {
      console.error('❌ Valoración no encontrada o sin permisos')
      return NextResponse.json(
        { error: 'Valoración no encontrada o no tienes permisos para eliminarla' },
        { status: 404 }
      )
    }

    // 4. Eliminar la valoración
    const { error: deleteError } = await (supabase as any)
      .from('valoracion_ia_informes')
      .delete()
      .eq('id', valoracionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ Error eliminando valoración:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar la valoración' },
        { status: 500 }
      )
    }

    console.log(`✅ Valoración eliminada correctamente`)

    return NextResponse.json({
      success: true,
      message: 'Valoración eliminada correctamente'
    })

  } catch (error: any) {
    console.error('\n❌ [DELETE VALORACION] ERROR:', error)
    console.error('   Mensaje:', error.message)

    return NextResponse.json(
      {
        error: 'Error eliminando valoración',
        detalle: error.message
      },
      { status: 500 }
    )
  }
}
