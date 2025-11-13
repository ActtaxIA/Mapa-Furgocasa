// ===================================================================
// API: GESTIÓN DE FOTOS DE VEHÍCULOS
// ===================================================================
// Endpoints para subir y eliminar fotos adicionales de vehículos
// ===================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: Subir una foto adicional
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    const vehiculoId = params.id

    // Verificar que el vehículo pertenece al usuario
    const { data: vehiculo, error: vehiculoError } = await supabase
      .from('vehiculos_registrados')
      .select('user_id, qr_code_id, fotos_adicionales')
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

    // Verificar límite de fotos (1 principal + 9 adicionales = 10 total)
    const fotosAdicionales = vehiculo.fotos_adicionales || []
    if (fotosAdicionales.length >= 9) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de 10 fotos por vehículo' },
        { status: 400 }
      )
    }

    // Obtener FormData
    const formData = await request.formData()
    const fotoFile = formData.get('foto') as File | null

    if (!fotoFile || fotoFile.size === 0) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna foto' },
        { status: 400 }
      )
    }

    // Validar tamaño (máx 5MB)
    if (fotoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La foto no puede superar los 5MB' },
        { status: 400 }
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
        return NextResponse.json(
          { error: 'Error al subir la foto al almacenamiento' },
          { status: 500 }
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
        return NextResponse.json(
          { error: 'Error al actualizar el registro' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        fotoUrl: publicUrl,
        message: 'Foto subida con éxito'
      })

    } catch (storageError) {
      console.error('Error en storage:', storageError)
      return NextResponse.json(
        { error: 'Error procesando la foto' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error en POST /api/vehiculos/[id]/fotos:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error?.message || 'Sin detalles',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar una foto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

    const vehiculoId = params.id
    const { fotoUrl, esFotoPrincipal } = await request.json()

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

    // Extraer el path del archivo de la URL
    const urlParts = fotoUrl.split('/vehiculos/')
    if (urlParts.length < 2) {
      return NextResponse.json(
        { error: 'URL de foto inválida' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: 'Foto eliminada con éxito'
    })

  } catch (error) {
    console.error('Error en DELETE /api/vehiculos/[id]/fotos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

