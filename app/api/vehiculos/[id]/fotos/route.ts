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
    const { data: vehiculo, error: vehiculoError } = await supabase
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

    // Obtener FormData
    const formData = await request.formData()
    const fotoFile = formData.get('foto') as File | null

    if (!fotoFile || fotoFile.size === 0) {
      return jsonResponse(
        { error: 'No se proporcionó ninguna foto' },
        400
      )
    }

    // Validar tamaño (máx 5MB)
    if (fotoFile.size > 5 * 1024 * 1024) {
      return jsonResponse(
        { error: 'La foto no puede superar los 5MB' },
        400
      )
    }

    // Subir foto a Supabase Storage
    try {
      const fileExt = fotoFile.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${user.id}/${vehiculo.qr_code_id}_${timestamp}.${fileExt}`

      // Convertir File a ArrayBuffer
      const fileBuffer = await fotoFile.arrayBuffer()

      const { error: uploadError } = await supabase
        .storage
        .from('vehiculos')
        .upload(fileName, fileBuffer, {
          contentType: fotoFile.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Error subiendo foto:', uploadError)
        return jsonResponse(
          { error: 'Error al subir la foto al almacenamiento' },
          500
        )
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase
        .storage
        .from('vehiculos')
        .getPublicUrl(fileName)

      // Actualizar array de fotos_adicionales en la base de datos
      const nuevasFotos = [...fotosAdicionales, publicUrl]

      const { error: updateError } = await supabase
        .from('vehiculos_registrados')
        .update({ fotos_adicionales: nuevasFotos })
        .eq('id', vehiculoId)

      if (updateError) {
        console.error('Error actualizando BD:', updateError)
        // Intentar limpiar la foto subida
        await supabase.storage.from('vehiculos').remove([fileName])
        return jsonResponse(
          { error: 'Error al actualizar el registro' },
          500
        )
      }

      return jsonResponse({
        success: true,
        fotoUrl: publicUrl,
        message: 'Foto subida con éxito'
      })

    } catch (storageError) {
      console.error('Error en storage:', storageError)
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
    const { data: vehiculo, error: vehiculoError } = await supabase
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
      await supabase
        .from('vehiculos_registrados')
        .update({ foto_url: null })
        .eq('id', vehiculoId)
    } else {
      // Eliminar de fotos adicionales
      const fotosAdicionales = vehiculo.fotos_adicionales || []
      const nuevasFotos = fotosAdicionales.filter((url: string) => url !== fotoUrl)

      await supabase
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
