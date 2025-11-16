// ===================================================================
// API: GESTIÓN DE FOTOS DE VEHÍCULOS
// ===================================================================
// Endpoints para subir y eliminar fotos adicionales de vehículos
// ===================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Configuración de runtime para evitar interceptaciones
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Helper para respuestas JSON con headers explícitos
const jsonResponse = (data: any, status = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

// POST: Subir una foto adicional
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔵 POST /api/vehiculos/[id]/fotos iniciado')
    const supabase = await createClient()
    console.log('✅ Supabase client creado')

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Usuario:', user?.id, 'Error auth:', authError)

    if (authError || !user) {
      console.error('❌ No autenticado:', authError)
      return jsonResponse(
        { error: 'No autenticado', details: authError?.message },
        401
      )
    }

    const params = await context.params
    const vehiculoId = params.id
    console.log('🚗 Vehículo ID:', vehiculoId)

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await (supabase as any)
      .from('vehiculos_registrados')
      .select('user_id, qr_code_id, fotos_adicionales')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo) {
      return jsonResponse(
        { error: 'Vehículo no encontrado' },
        404
      )
    }

    if (vehiculo.user_id !== user.id) {
      return jsonResponse(
        { error: 'No autorizado' },
        403
      )
    }

    // Verificar límite de fotos (1 principal + 9 adicionales = 10 total)
    const fotosAdicionales = vehiculo.fotos_adicionales || []
    if (fotosAdicionales.length >= 9) {
      return jsonResponse(
        { error: 'Has alcanzado el límite de 10 fotos por vehículo' },
        400
      )
    }

    // ============================================================
    // NUEVO: Recibir URL de foto ya subida desde el frontend
    // El frontend sube directamente a Supabase Storage
    // ============================================================
    const body = await request.json()
    const foto_url = body.foto_url as string | null

    if (!foto_url) {
      return jsonResponse(
        { error: 'No se proporcionó ninguna URL de foto' },
        400
      )
    }

    console.log('📸 [Backend] Recibida URL de foto adicional:', foto_url)

    // Actualizar base de datos con la nueva URL
    try {
      const nuevasFotos = [...fotosAdicionales, foto_url]

      const { error: updateError } = await (supabase as any)
        .from('vehiculos_registrados')
        .update({ fotos_adicionales: nuevasFotos })
        .eq('id', vehiculoId)

      if (updateError) {
        console.error('Error actualizando BD:', updateError)
        return jsonResponse(
          { error: 'Error al actualizar el registro' },
          500
        )
      }

      return jsonResponse({
        success: true,
        fotoUrl: foto_url,
        message: 'Foto guardada con éxito'
      })

    } catch (error) {
      console.error('Error guardando foto:', error)
      return jsonResponse(
        { error: 'Error procesando la foto' },
        500
      )
    }

  } catch (error: any) {
    console.error('Error en POST /api/vehiculos/[id]/fotos:', error)
    return jsonResponse(
      {
        error: 'Error interno del servidor',
        details: error?.message || 'Sin detalles',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      500
    )
  }
}

// DELETE: Eliminar una foto
export async function DELETE(
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
    const { fotoUrl, esFotoPrincipal } = await request.json()

    if (!fotoUrl) {
      return jsonResponse(
        { error: 'URL de foto no proporcionada' },
        400
      )
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await (supabase as any)
      .from('vehiculos_registrados')
      .select('user_id, foto_url, fotos_adicionales')
      .eq('id', vehiculoId)
      .single()

    if (vehiculoError || !vehiculo) {
      return jsonResponse(
        { error: 'Vehículo no encontrado' },
        404
      )
    }

    if (vehiculo.user_id !== user.id) {
      return jsonResponse(
        { error: 'No autorizado' },
        403
      )
    }

    // Extraer el path del archivo de la URL
    const urlParts = fotoUrl.split('/vehiculos/')
    if (urlParts.length < 2) {
      return jsonResponse(
        { error: 'URL de foto inválida' },
        400
      )
    }
    const filePath = urlParts[1]

    // Eliminar del storage
    const { error: deleteError } = await supabase
      .storage
      .from('vehiculos')
      .remove([filePath])

    if (deleteError) {
      console.error('Error eliminando de storage:', deleteError)
      // Continuar de todos modos para limpiar la BD
    }

    // Actualizar la base de datos
    if (esFotoPrincipal) {
      // Eliminar foto principal
      await (supabase as any)
        .from('vehiculos_registrados')
        .update({ foto_url: null })
        .eq('id', vehiculoId)
    } else {
      // Eliminar de fotos adicionales
      const fotosAdicionales = vehiculo.fotos_adicionales || []
      const nuevasFotos = fotosAdicionales.filter((url: string) => url !== fotoUrl)

      await (supabase as any)
        .from('vehiculos_registrados')
        .update({ fotos_adicionales: nuevasFotos })
        .eq('id', vehiculoId)
    }

    return jsonResponse({
      success: true,
      message: 'Foto eliminada con éxito'
    })

  } catch (error) {
    console.error('Error en DELETE /api/vehiculos/[id]/fotos:', error)
    return jsonResponse(
      { error: 'Error interno del servidor' },
      500
    )
  }
}
