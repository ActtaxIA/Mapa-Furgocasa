// ===================================================================
// API: GESTIÓN DE VEHÍCULOS REGISTRADOS
// ===================================================================
// Endpoints para crear, leer, actualizar y eliminar vehículos
// ===================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

// GET: Obtener vehículos del usuario autenticado
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener vehículos del usuario
    const { data: vehiculos, error } = await supabase
      .from('vehiculos_registrados')
      .select('*')
      .eq('user_id', user.id)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo vehículos:', error)
      return NextResponse.json(
        { error: 'Error al obtener vehículos' },
        { status: 500 }
      )
    }

    return NextResponse.json({ vehiculos: vehiculos || [] })

  } catch (error) {
    console.error('Error en GET /api/vehiculos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Registrar un nuevo vehículo
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { matricula, marca, modelo, año, color, foto_url } = body

    // Validación básica
    if (!matricula || matricula.trim() === '') {
      return NextResponse.json(
        { error: 'La matrícula es obligatoria' },
        { status: 400 }
      )
    }

    // Verificar si ya existe la matrícula para este usuario
    const { data: existente, error: checkError } = await supabase
      .from('vehiculos_registrados')
      .select('id')
      .eq('user_id', user.id)
      .eq('matricula', matricula.trim().toUpperCase())
      .single()

    if (existente) {
      return NextResponse.json(
        { error: 'Ya has registrado un vehículo con esta matrícula' },
        { status: 400 }
      )
    }

    // Generar QR ID único usando la función de Supabase
    const { data: qrData, error: qrError } = await supabase
      .rpc('generar_qr_id')

    if (qrError) {
      console.error('Error generando QR ID:', qrError)
      return NextResponse.json(
        { error: 'Error generando código QR' },
        { status: 500 }
      )
    }

    // La función retorna directamente el string
    const qr_code_id = qrData as string

    if (!qr_code_id) {
      return NextResponse.json(
        { error: 'Error generando código QR' },
        { status: 500 }
      )
    }

    // Generar imagen del QR (base64 data URL)
    // El QR ahora lleva a /accidente con la matrícula como sugerencia
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mapafurgocasa.com'}/accidente?matricula=${matricula.trim().toUpperCase()}`
    let qr_image_url: string | undefined

    try {
      qr_image_url = await QRCode.toDataURL(qrUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (qrGenError) {
      console.error('Error generando imagen QR:', qrGenError)
      // Continuar sin imagen QR, se puede generar después
    }

    // Insertar vehículo
    const { data: nuevoVehiculo, error: insertError } = await supabase
      .from('vehiculos_registrados')
      .insert({
        user_id: user.id,
        matricula: matricula.trim().toUpperCase(),
        marca: marca?.trim() || null,
        modelo: modelo?.trim() || null,
        año: año || null,
        color: color?.trim() || null,
        foto_url: foto_url || null,
        qr_code_id,
        qr_image_url,
        activo: true,
        verificado: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error insertando vehículo:', insertError)
      return NextResponse.json(
        { error: 'Error al registrar vehículo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      vehiculo: nuevoVehiculo,
      message: 'Vehículo registrado correctamente'
    })

  } catch (error) {
    console.error('Error en POST /api/vehiculos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar (desactivar) un vehículo
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const vehiculo_id = searchParams.get('id')

    if (!vehiculo_id) {
      return NextResponse.json(
        { error: 'ID de vehículo requerido' },
        { status: 400 }
      )
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: checkError } = await supabase
      .from('vehiculos_registrados')
      .select('id')
      .eq('id', vehiculo_id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado o no tienes permisos' },
        { status: 404 }
      )
    }

    // Desactivar vehículo (no eliminamos físicamente)
    const { error: deleteError } = await supabase
      .from('vehiculos_registrados')
      .update({ activo: false })
      .eq('id', vehiculo_id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error desactivando vehículo:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar vehículo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Vehículo eliminado correctamente'
    })

  } catch (error) {
    console.error('Error en DELETE /api/vehiculos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

