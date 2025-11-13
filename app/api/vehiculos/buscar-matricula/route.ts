// ===================================================================
// API: BUSCAR VEHÍCULO POR MATRÍCULA
// ===================================================================
// Endpoint público para buscar un vehículo registrado por su matrícula
// No requiere autenticación (para uso en reportes de accidentes)
// ===================================================================

import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matricula = searchParams.get('matricula')

    if (!matricula) {
      return NextResponse.json(
        { error: 'Matrícula no proporcionada' },
        { status: 400 }
      )
    }

    // Usar Service Role para búsqueda pública (bypasea RLS)
    const supabase = createServiceClient()

    // Buscar vehículo por matrícula (sin necesidad de autenticación)
    const { data: vehiculo, error } = await (supabase as any)
      .from('vehiculos_registrados')
      .select('id, matricula, marca, modelo, user_id')
      .eq('matricula', matricula.toUpperCase())
      .eq('activo', true)
      .single()

    if (error || !vehiculo) {
      return NextResponse.json({
        existe: false,
        message: 'Vehículo no encontrado'
      })
    }

    // Retornar datos básicos del vehículo (sin información sensible del propietario)
    return NextResponse.json({
      existe: true,
      vehiculo: {
        id: vehiculo.id,
        matricula: vehiculo.matricula,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo
      }
    })

  } catch (error) {
    console.error('Error en GET /api/vehiculos/buscar-matricula:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
