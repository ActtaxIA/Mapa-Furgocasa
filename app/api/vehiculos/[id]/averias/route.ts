import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: { id: string }
}

// GET: Obtener todas las averías de un vehículo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const vehiculoId = params.id

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo || vehiculo.user_id !== user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { data: averias, error } = await supabase
      .from('averias')
      .select('*')
      .eq('vehiculo_id', vehiculoId)
      .order('fecha_averia', { ascending: false })

    if (error) {
      console.error('Error obteniendo averías:', error)
      return NextResponse.json({ error: 'Error obteniendo averías' }, { status: 500 })
    }

    return NextResponse.json(averias || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Crear una nueva avería
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const vehiculoId = params.id
    const body = await request.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo || vehiculo.user_id !== user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { data: averia, error } = await supabase
      .from('averias')
      .insert({
        vehiculo_id: vehiculoId,
        user_id: user.id,
        ...body
      })
      .select()
      .single()

    if (error) {
      console.error('Error creando avería:', error)
      return NextResponse.json({ error: 'Error creando avería' }, { status: 500 })
    }

    return NextResponse.json(averia, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
