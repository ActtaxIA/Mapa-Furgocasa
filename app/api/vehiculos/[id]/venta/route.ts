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

    const {
      precio_venta_final,
      fecha_venta,
      comprador_tipo,
      kilometros_venta,
      estado_venta,
      notas_venta
    } = body

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
          vendido: true,
          precio_venta_final,
          fecha_venta,
          comprador_tipo,
          kilometros_venta,
          estado_venta,
          notas_venta,
          en_venta: false,
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
          vendido: true,
          precio_venta_final,
          fecha_venta,
          comprador_tipo,
          kilometros_venta,
          estado_venta,
          notas_venta,
          en_venta: false
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error registrando venta:', result.error)
      return NextResponse.json(
        { error: 'Error registrando venta', details: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      mensaje: '¡Venta registrada exitosamente!'
    }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
