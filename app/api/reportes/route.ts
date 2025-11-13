// ===================================================================
// API: GESTIÓN DE REPORTES DE ACCIDENTES
// ===================================================================
// Endpoints para crear y consultar reportes
// ===================================================================

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Obtener reportes del usuario autenticado
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

    // Usar función de Supabase para obtener reportes con toda la información
    const { data: reportes, error } = await supabase
      .rpc('obtener_reportes_usuario', { usuario_uuid: user.id })

    if (error) {
      console.error('Error obteniendo reportes:', error)
      return NextResponse.json(
        { error: 'Error al obtener reportes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reportes: reportes || [] })

  } catch (error) {
    console.error('Error en GET /api/reportes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Crear un nuevo reporte (endpoint PÚBLICO - no requiere autenticación)
export async function POST(request: Request) {
  try {
    // IMPORTANTE: Usar Service Role para bypassear RLS en reportes públicos
    // Es seguro porque validamos todos los datos antes de insertar
    const supabase = createServiceClient()

    // Obtener FormData para manejar fotos
    const formData = await request.formData()
    const qr_code_id = formData.get('qr_code_id') as string | null
    const vehiculo_id = formData.get('vehiculo_id') as string | null
    const matricula = formData.get('matricula') as string | null
    const matricula_tercero = formData.get('matricula_tercero') as string | null
    const descripcion_tercero = formData.get('descripcion_tercero') as string | null
    const testigo_nombre = formData.get('testigo_nombre') as string
    const testigo_email = formData.get('testigo_email') as string | null
    const testigo_telefono = formData.get('testigo_telefono') as string | null
    const descripcion = formData.get('descripcion') as string
    const tipo_dano = formData.get('tipo_dano') as string | null
    const ubicacion_lat = formData.get('ubicacion_lat') as string
    const ubicacion_lng = formData.get('ubicacion_lng') as string
    const ubicacion_direccion = formData.get('ubicacion_direccion') as string | null
    const ubicacion_descripcion = formData.get('ubicacion_descripcion') as string | null
    const fecha_accidente = formData.get('fecha_accidente') as string
    
    // Obtener todas las fotos
    const fotosFiles: File[] = []
    const fotosEntries = formData.getAll('fotos')
    fotosEntries.forEach((entry) => {
      if (entry instanceof File && entry.size > 0) {
        fotosFiles.push(entry)
      }
    })

    // Validaciones básicas - aceptar qr_code_id, vehiculo_id o matricula
    if (!qr_code_id && !vehiculo_id && !matricula) {
      return NextResponse.json(
        { error: 'QR code, ID de vehículo o matrícula requerido' },
        { status: 400 }
      )
    }

    if (!testigo_nombre || testigo_nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del testigo es obligatorio' },
        { status: 400 }
      )
    }

    if (!descripcion || descripcion.trim() === '') {
      return NextResponse.json(
        { error: 'La descripción del accidente es obligatoria' },
        { status: 400 }
      )
    }

    if (!ubicacion_lat || !ubicacion_lng) {
      return NextResponse.json(
        { error: 'La ubicación es obligatoria' },
        { status: 400 }
      )
    }

    if (!fecha_accidente) {
      return NextResponse.json(
        { error: 'La fecha del accidente es obligatoria' },
        { status: 400 }
      )
    }

    // Validar formato de email si se proporciona
    if (testigo_email && testigo_email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(testigo_email.trim())) {
        return NextResponse.json(
          { error: 'El formato del email no es válido' },
          { status: 400 }
        )
      }
    }

    // Validar coordenadas
    const lat = parseFloat(ubicacion_lat)
    const lng = parseFloat(ubicacion_lng)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Las coordenadas de ubicación no son válidas' },
        { status: 400 }
      )
    }

    // Validar fecha (no puede ser futura)
    const fechaAccidente = new Date(fecha_accidente)
    const ahora = new Date()
    if (fechaAccidente > ahora) {
      return NextResponse.json(
        { error: 'La fecha del accidente no puede ser futura' },
        { status: 400 }
      )
    }

    // Obtener vehiculo_afectado_id
    let vehiculo_afectado_id: string | null = null

    if (matricula) {
      // Si se proporciona matrícula directamente, buscar vehículo por matrícula
      const { data: vehiculoData, error: vehiculoError } = await (supabase as any)
        .from('vehiculos_registrados')
        .select('id')
        .eq('matricula', matricula.trim().toUpperCase())
        .eq('activo', true)
        .single()

      if (vehiculoError || !vehiculoData) {
        console.error('Error buscando vehículo por matrícula:', vehiculoError)
        return NextResponse.json(
          { error: 'Vehículo no encontrado o inactivo' },
          { status: 404 }
        )
      }

      vehiculo_afectado_id = (vehiculoData as { id: string }).id
    } else if (vehiculo_id) {
      // Si se proporciona vehiculo_id directamente, validar que existe
      const { data: vehiculoData, error: vehiculoError } = await (supabase as any)
        .from('vehiculos_registrados')
        .select('id')
        .eq('id', vehiculo_id)
        .eq('activo', true)
        .single()

      if (vehiculoError || !vehiculoData) {
        console.error('Error buscando vehículo por ID:', vehiculoError)
        return NextResponse.json(
          { error: 'Vehículo no encontrado o inactivo' },
          { status: 404 }
        )
      }

      vehiculo_afectado_id = (vehiculoData as { id: string }).id
    } else if (qr_code_id) {
      // Buscar vehículo por QR code
      const { data: vehiculoData, error: vehiculoError } = await (supabase as any)
        .rpc('buscar_vehiculo_por_qr', { qr_id: qr_code_id })

      if (vehiculoError) {
        console.error('Error buscando vehículo:', vehiculoError)
        return NextResponse.json(
          { error: 'Error al buscar vehículo' },
          { status: 500 }
        )
      }

      // La función retorna una tabla, obtener el primer resultado
      const vehiculo = Array.isArray(vehiculoData) ? vehiculoData[0] : vehiculoData

      if (!vehiculo || !vehiculo.existe) {
        return NextResponse.json(
          { error: 'Código QR no válido o vehículo no encontrado' },
          { status: 404 }
        )
      }

      vehiculo_afectado_id = vehiculo.vehiculo_id
    }

    // Subir fotos a Supabase Storage si existen
    const fotos_urls: string[] = []
    if (fotosFiles.length > 0) {
      try {
        const timestamp = Date.now()
        for (let i = 0; i < fotosFiles.length; i++) {
          const foto = fotosFiles[i]
          
          // Validar tamaño (máx 5MB)
          if (foto.size > 5 * 1024 * 1024) {
            console.warn(`Foto ${i + 1} excede 5MB, se omite`)
            continue
          }

          const fileExt = foto.name.split('.').pop() || 'jpg'
          const fileName = `reportes/${vehiculo_afectado_id}/${timestamp}_${i}.${fileExt}`
          
          // Convertir File a ArrayBuffer
          const fileBuffer = await foto.arrayBuffer()
          
          const { error: uploadError } = await supabase
            .storage
            .from('vehiculos')
            .upload(fileName, fileBuffer, {
              contentType: foto.type || 'image/jpeg',
              upsert: false
            })

          if (uploadError) {
            console.error(`Error subiendo foto ${i + 1}:`, uploadError)
            // Continuar con las demás fotos
            continue
          }

          // Obtener URL pública
          const { data: { publicUrl } } = supabase
            .storage
            .from('vehiculos')
            .getPublicUrl(fileName)
          
          fotos_urls.push(publicUrl)
        }
      } catch (fotoError) {
        console.error('Error procesando fotos:', fotoError)
        // Continuar sin fotos, no es crítico
      }
    }

    // Obtener IP del cliente (para prevenir spam)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip_address = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Insertar reporte
    const { data: nuevoReporte, error: insertError } = await (supabase as any)
      .from('reportes_accidentes')
      .insert({
        vehiculo_afectado_id,
        matricula_tercero: matricula_tercero?.trim().toUpperCase() || null,
        descripcion_tercero: descripcion_tercero?.trim() || null,
        testigo_nombre: testigo_nombre.trim(),
        testigo_email: testigo_email?.trim() || null,
        testigo_telefono: testigo_telefono?.trim() || null,
        descripcion: descripcion.trim(),
        tipo_dano: tipo_dano || null,
        ubicacion_lat: lat,
        ubicacion_lng: lng,
        ubicacion_direccion: ubicacion_direccion?.trim() || null,
        ubicacion_descripcion: ubicacion_descripcion?.trim() || null,
        fotos_urls: fotos_urls,
        fecha_accidente,
        ip_address,
        captcha_verificado: false, // Por ahora sin captcha
        leido: false,
        cerrado: false
        // Nota: 'verificado' removido temporalmente para debugging
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error insertando reporte:', insertError)
      return NextResponse.json(
        {
          error: 'Error al crear reporte',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    // El trigger de Supabase creará automáticamente la notificación

    return NextResponse.json({
      success: true,
      reporte: nuevoReporte,
      message: 'Reporte creado correctamente. El propietario ha sido notificado.'
    })

  } catch (error: any) {
    console.error('Error en POST /api/reportes:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
