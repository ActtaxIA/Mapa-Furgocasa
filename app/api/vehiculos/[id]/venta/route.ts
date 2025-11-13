import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

type RouteParams = {
  params: { id: string }
}

// GET: Obtener datos de valoración y venta
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const vehiculoId = params.id

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo || vehiculo.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado o acceso denegado' },
        { status: 403 }
      )
    }

    // Obtener datos de valoración económica
    const { data, error } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .maybeSingle()

    if (error) {
      console.error('Error obteniendo datos:', error)
      return NextResponse.json(
        { error: 'Error obteniendo datos de venta' },
        { status: 500 }
      )
    }

    // Si no existe registro, devolver valores por defecto
    if (!data) {
      return NextResponse.json({
        vendido: false,
        en_venta: false,
        precio_venta_deseado: null,
        precio_venta_final: null,
        fecha_venta: null,
        fecha_compra: null,
        comprador_tipo: null,
        kilometros_venta: null,
        estado_venta: null,
        notas_venta: null,
        inversion_total: 0
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Registrar venta final
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const vehiculoId = params.id
    const body = await request.json()

    console.log('📤 [Venta API] Recibida solicitud POST para vehículo:', vehiculoId)
    console.log('📤 [Venta API] Body recibido:', JSON.stringify(body, null, 2))

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ [Venta API] Error de autenticación:', authError)
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo || vehiculo.user_id !== user.id) {
      console.error('❌ [Venta API] Error verificando vehículo:', vehiculoError)
      return NextResponse.json(
        { error: 'Vehículo no encontrado o acceso denegado' },
        { status: 403 }
      )
    }

    const {
      precio_venta_final,
      fecha_venta,
      comprador_tipo,
      kilometros_venta,
      estado_venta,
      notas_venta
    } = body

    // Validar campos requeridos
    if (!precio_venta_final || !fecha_venta) {
      console.error('❌ [Venta API] Campos requeridos faltantes')
      return NextResponse.json(
        { error: 'Precio de venta y fecha son obligatorios' },
        { status: 400 }
      )
    }

    // Obtener datos existentes de valoración económica para calcular rentabilidad
    const { data: existingData, error: fetchError } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ [Venta API] Error obteniendo datos existentes:', fetchError)
      return NextResponse.json(
        { error: 'Error obteniendo datos del vehículo', details: fetchError.message },
        { status: 500 }
      )
    }

    // Calcular rentabilidad y coste anual si tenemos datos de compra
    let rentabilidad = null
    let coste_anual = null

    if (existingData?.fecha_compra && existingData?.inversion_total) {
      const fechaCompra = new Date(existingData.fecha_compra)
      const fechaVenta = new Date(fecha_venta)
      const diffTime = Math.abs(fechaVenta.getTime() - fechaCompra.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const años = diffDays / 365.25

      if (años > 0) {
        rentabilidad = precio_venta_final - existingData.inversion_total
        coste_anual = Math.abs(rentabilidad / años)
      }
    }

    console.log('📊 [Venta API] Cálculos:', {
      rentabilidad,
      coste_anual,
      inversion_total: existingData?.inversion_total,
      precio_venta_final
    })

    // Preparar datos para guardar (solo campos que existen en BD)
    const dataToSave: any = {
      vendido: true,
      precio_venta_final: parseFloat(precio_venta_final),
      fecha_venta,
      comprador_tipo: comprador_tipo || null,
      kilometros_venta: kilometros_venta ? parseInt(kilometros_venta) : null,
      estado_venta: estado_venta || null,
      notas_venta: notas_venta || null,
      en_venta: false,
      updated_at: new Date().toISOString()
    }

    console.log('💾 [Venta API] Datos a guardar:', JSON.stringify(dataToSave, null, 2))

    let result

    if (existingData) {
      // Actualizar registro existente
      console.log('🔄 [Venta API] Actualizando registro existente:', existingData.id)
      result = await supabase
        .from('vehiculo_valoracion_economica')
        .update(dataToSave)
        .eq('vehiculo_id', vehiculoId)
        .select()
        .single()
    } else {
      // Crear nuevo registro
      console.log('➕ [Venta API] Creando nuevo registro')
      result = await supabase
        .from('vehiculo_valoracion_economica')
        .insert({
          vehiculo_id: vehiculoId,
          user_id: user.id,
          ...dataToSave
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('❌ [Venta API] Error en operación BD:', result.error)
      console.error('❌ [Venta API] Detalles del error:', JSON.stringify(result.error, null, 2))
      return NextResponse.json(
        { 
          error: 'Error registrando venta', 
          details: result.error.message,
          code: result.error.code,
          hint: result.error.hint
        },
        { status: 500 }
      )
    }

    console.log('✅ [Venta API] Venta registrada exitosamente:', result.data)

    // Añadir cálculos a la respuesta (aunque no se guarden en BD)
    const responseData = {
      ...result.data,
      rentabilidad: rentabilidad !== null ? rentabilidad : undefined,
      coste_anual: coste_anual !== null ? coste_anual : undefined
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      mensaje: '¡Venta registrada exitosamente!'
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ [Venta API] Error catch:', error)
    console.error('❌ [Venta API] Stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// PUT: Poner vehículo en venta o actualizar precio
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const vehiculoId = params.id
    const body = await request.json()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo || vehiculo.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado o acceso denegado' },
        { status: 403 }
      )
    }

    const { en_venta, precio_venta_deseado } = body

    // Verificar si existe el registro
    const { data: existingData } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('id')
      .eq('vehiculo_id', vehiculoId)
      .maybeSingle()

    let result

    if (existingData) {
      // Actualizar registro existente
      result = await supabase
        .from('vehiculo_valoracion_economica')
        .update({
          en_venta,
          precio_venta_deseado,
          fecha_puesta_venta: en_venta ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('vehiculo_id', vehiculoId)
        .select()
        .single()
    } else {
      // Crear nuevo registro
      result = await supabase
        .from('vehiculo_valoracion_economica')
        .insert({
          vehiculo_id: vehiculoId,
          user_id: user.id,
          en_venta,
          precio_venta_deseado,
          fecha_puesta_venta: en_venta ? new Date().toISOString() : null
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error actualizando estado de venta:', result.error)
      return NextResponse.json(
        { error: 'Error actualizando estado de venta' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
