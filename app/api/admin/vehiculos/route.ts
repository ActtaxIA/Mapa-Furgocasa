import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Deshabilitar COMPLETAMENTE el caché de Next.js para esta ruta
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * API para obtener todos los vehículos (requiere Service Role Key para evitar RLS)
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase no disponible' },
        { status: 500 }
      )
    }

    // Crear cliente con Service Role (bypasea RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🚐 Cargando todos los vehículos...')

    // Obtener todos los vehículos
    const { data: vehiculos, error: errorVehiculos } = await supabaseAdmin
      .from('vehiculos_registrados')
      .select('id, created_at, user_id, marca, modelo, matricula, ano, tipo_vehiculo')

    if (errorVehiculos) {
      console.error('❌ Error cargando vehículos:', errorVehiculos)
      return NextResponse.json(
        { error: 'Error al obtener vehículos', details: errorVehiculos.message },
        { status: 500 }
      )
    }

    console.log(`✅ Vehículos cargados: ${vehiculos?.length || 0}`)

    // Obtener valoraciones económicas
    const { data: valoracionesEconomicas, error: errorValoraciones } = await supabaseAdmin
      .from('vehiculo_valoracion_economica')
      .select('*')

    if (errorValoraciones) {
      console.error('❌ Error cargando valoraciones:', errorValoraciones)
    }

    console.log(`💰 Valoraciones económicas: ${valoracionesEconomicas?.length || 0}`)

    // Obtener fichas técnicas
    const { data: fichasTecnicas, error: errorFichas } = await supabaseAdmin
      .from('vehiculo_ficha_tecnica')
      .select('*')

    if (errorFichas) {
      console.error('❌ Error cargando fichas técnicas:', errorFichas)
    }

    console.log(`📋 Fichas técnicas: ${fichasTecnicas?.length || 0}`)

    // Obtener datos de mercado IA
    const { data: datosMercado, error: errorMercado } = await supabaseAdmin
      .from('datos_mercado_autocaravanas')
      .select('*')

    if (errorMercado) {
      console.error('❌ Error cargando datos de mercado:', errorMercado)
    }

    console.log(`📊 Datos mercado IA: ${datosMercado?.length || 0}`)

    // Obtener valoraciones IA
    const { data: valoracionesIA, error: errorValoracionesIA } = await supabaseAdmin
      .from('valoracion_ia_informes')
      .select('*')

    if (errorValoracionesIA) {
      console.error('❌ Error cargando valoraciones IA:', errorValoracionesIA)
    }

    console.log(`🤖 Valoraciones IA: ${valoracionesIA?.length || 0}`)

    const response = NextResponse.json({
      success: true,
      vehiculos: vehiculos || [],
      valoracionesEconomicas: valoracionesEconomicas || [],
      fichasTecnicas: fichasTecnicas || [],
      datosMercado: datosMercado || [],
      valoracionesIA: valoracionesIA || []
    })

    // Headers para evitar cualquier tipo de caché
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response

  } catch (error: any) {
    console.error('Error en API de vehículos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

