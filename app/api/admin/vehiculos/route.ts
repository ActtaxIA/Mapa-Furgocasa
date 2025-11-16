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
    console.log('🚐 [API VEHICULOS] Iniciando...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('🔑 Service Key existe:', !!supabaseServiceKey)
    console.log('🌐 URL:', supabaseUrl)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Faltan credenciales de Supabase')
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

    console.log('📦 Cliente Supabase Admin creado')

    // Obtener todos los vehículos
    console.log('📥 Consultando vehiculos_registrados...')
    const { data: vehiculos, error: errorVehiculos } = await supabaseAdmin
      .from('vehiculos_registrados')
      .select('id, created_at, user_id, marca, modelo, matricula, ano, tipo_vehiculo')

    console.log('📊 Resultado consulta vehiculos:')
    console.log('  - Data:', vehiculos?.length || 0, 'registros')
    console.log('  - Error:', errorVehiculos ? JSON.stringify(errorVehiculos) : 'ninguno')

    if (errorVehiculos) {
      console.error('❌ Error cargando vehículos:', JSON.stringify(errorVehiculos, null, 2))
      // NO retornar error, continuar con array vacío
    }

    console.log(`✅ Vehículos: ${vehiculos?.length || 0}`)
    if (vehiculos && vehiculos.length > 0) {
      console.log('📋 Primeros IDs de vehículos:', vehiculos.slice(0, 3).map((v: any) => v.id))
    } else {
      console.log('⚠️ La tabla vehiculos_registrados está VACÍA o no se puede acceder')
      console.log('⚠️ Service Key length:', supabaseServiceKey?.length)
      console.log('⚠️ Service Key prefix:', supabaseServiceKey?.substring(0, 20))
    }

    // Obtener valoraciones económicas
    console.log('📥 Consultando vehiculo_valoracion_economica...')
    const { data: valoracionesEconomicas, error: errorValoraciones } = await supabaseAdmin
      .from('vehiculo_valoracion_economica')
      .select('*')

    if (errorValoraciones) {
      console.error('❌ Error valoraciones:', JSON.stringify(errorValoraciones, null, 2))
    }
    console.log(`✅ Valoraciones: ${valoracionesEconomicas?.length || 0}`)
    if (valoracionesEconomicas && valoracionesEconomicas.length > 0) {
      console.log('💰 Primeros vehiculo_id en valoraciones:', valoracionesEconomicas.slice(0, 3).map((v: any) => v.vehiculo_id))
      console.log('💰 Precios:', valoracionesEconomicas.slice(0, 3).map((v: any) => v.precio_compra))
    }

    // Obtener fichas técnicas
    console.log('📥 Consultando vehiculo_ficha_tecnica...')
    const { data: fichasTecnicas, error: errorFichas } = await supabaseAdmin
      .from('vehiculo_ficha_tecnica')
      .select('*')

    if (errorFichas) {
      console.error('❌ Error fichas:', JSON.stringify(errorFichas, null, 2))
    }
    console.log(`✅ Fichas: ${fichasTecnicas?.length || 0}`)

    // Obtener datos de mercado IA
    console.log('📥 Consultando datos_mercado_autocaravanas...')
    const { data: datosMercado, error: errorMercado } = await supabaseAdmin
      .from('datos_mercado_autocaravanas')
      .select('*')

    if (errorMercado) {
      console.error('❌ Error mercado:', JSON.stringify(errorMercado, null, 2))
    }
    console.log(`✅ Mercado: ${datosMercado?.length || 0}`)

    // Obtener valoraciones IA
    console.log('📥 Consultando valoracion_ia_informes...')
    const { data: valoracionesIA, error: errorValoracionesIA } = await supabaseAdmin
      .from('valoracion_ia_informes')
      .select('*')

    if (errorValoracionesIA) {
      console.error('❌ Error valoraciones IA:', JSON.stringify(errorValoracionesIA, null, 2))
    }
    console.log(`✅ Valoraciones IA: ${valoracionesIA?.length || 0}`)

    console.log('✅ [API VEHICULOS] Completado exitosamente')

    const response = NextResponse.json({
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
    console.error('❌ [API VEHICULOS] ERROR FATAL:', error)
    console.error('   Mensaje:', error.message)
    console.error('   Stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
