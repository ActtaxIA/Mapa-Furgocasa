// ===================================================================
// API: ESTABLECER FOTO PRINCIPAL DE VEHÍCULO
// ===================================================================
// Endpoint para cambiar la foto principal de un vehículo
// ===================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PUT: Establecer una foto como principal
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const params = await context.params
    const vehiculoId = params.id
    const { fotoUrl } = await request.json()

    if (!fotoUrl) {
      return NextResponse.json(
        { error: 'URL de foto no proporcionada' },
        { status: 400 }
      )
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id, foto_url, fotos_adicionales')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    if (vehiculo.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Verificar que la foto existe en fotos_adicionales
    const fotosAdicionales = vehiculo.fotos_adicionales || []
    if (!fotosAdicionales.includes(fotoUrl)) {
      return NextResponse.json(
        { error: 'La foto no existe en las fotos adicionales' },
        { status: 400 }
      )
    }

    // Intercambiar: la foto actual principal pasa a adicionales, la nueva se vuelve principal
    const fotoActualPrincipal = vehiculo.foto_url
    const nuevasFotosAdicionales = fotosAdicionales.filter((url: string) => url !== fotoUrl)
    
    // Si había una foto principal, añadirla a adicionales
    if (fotoActualPrincipal) {
      nuevasFotosAdicionales.push(fotoActualPrincipal)
    }

    // Actualizar en la base de datos
    const { error: updateError } = await supabase
      .from('vehiculos_registrados')
      .update({
        foto_url: fotoUrl,
        fotos_adicionales: nuevasFotosAdicionales
      })
      .eq('id', vehiculoId)

    if (updateError) {
      console.error('Error actualizando foto principal:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la foto principal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Foto principal actualizada con éxito'
    })

  } catch (error) {
    console.error('Error en PUT /api/vehiculos/[id]/fotos/principal:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

