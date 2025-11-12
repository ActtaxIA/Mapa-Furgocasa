import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    // Actualizar el estado de venta
    const { data, error } = await supabase
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
    const { precio_venta_final, fecha_venta, notas_venta } = body

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

    // Registrar la venta
    const { data, error } = await supabase
      .from('vehiculo_valoracion_economica')
      .update({
        vendido: true,
        precio_venta_final,
        fecha_venta,
        notas_venta,
        en_venta: false,
        updated_at: new Date().toISOString()
      })
      .eq('vehiculo_id', params.id)
      .select()
      .single()

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

