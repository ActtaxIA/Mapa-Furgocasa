import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET - Obtener datos de valoración y venta
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

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (vehiculoError || !vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Obtener datos de valoración económica
    const { data, error } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('*')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    // Si no existe registro, devolver valores por defecto
    if (!data) {
      return NextResponse.json({
        vendido: false,
        en_venta: false,
        precio_venta_deseado: null,
        precio_venta_final: null,
        fecha_venta: null,
        fecha_puesta_venta: null,
        comprador_tipo: null,
        kilometros_venta: null,
        estado_venta: null,
        notas_venta: null,
        inversion_total: 0
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener datos de venta:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de venta' },
      { status: 500 }
    )
  }
}

// PUT - Poner vehículo en venta o actualizar precio
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { en_venta, precio_venta_deseado } = body

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (vehiculoError || !vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Verificar si existe el registro
    const { data: existingData } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('id')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    let data, error

    if (existingData) {
      // Actualizar registro existente
      const result = await supabase
        .from('vehiculo_valoracion_economica')
        .update({
          en_venta,
          precio_venta_deseado,
          fecha_puesta_venta: en_venta ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('vehiculo_id', params.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Crear nuevo registro
      const result = await supabase
        .from('vehiculo_valoracion_economica')
        .insert({
          vehiculo_id: params.id,
          user_id: user.id,
          en_venta,
          precio_venta_deseado,
          fecha_puesta_venta: en_venta ? new Date().toISOString() : null
        })
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error al actualizar estado de venta:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado de venta' },
      { status: 500 }
    )
  }
}

// POST - Registrar venta final
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      precio_venta_final,
      fecha_venta,
      comprador_tipo,
      kilometros_venta,
      estado_venta,
      notas_venta
    } = body

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (vehiculoError || !vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    // Verificar si existe el registro
    const { data: existingData } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('id')
      .eq('vehiculo_id', params.id)
      .maybeSingle()

    let data, error

    if (existingData) {
      // Actualizar registro existente
      const result = await supabase
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
        .eq('vehiculo_id', params.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Crear nuevo registro
      const result = await supabase
        .from('vehiculo_valoracion_economica')
        .insert({
          vehiculo_id: params.id,
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
      
      data = result.data
      error = result.error
    }

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      mensaje: '¡Venta registrada exitosamente!'
    })
  } catch (error) {
    console.error('Error al registrar venta:', error)
    return NextResponse.json(
      { error: 'Error al registrar venta' },
      { status: 500 }
    )
  }
}
