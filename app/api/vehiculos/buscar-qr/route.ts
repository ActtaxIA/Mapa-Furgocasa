// ===================================================================
// API: BUSCAR VEHÍCULO POR QR (PÚBLICO)
// ===================================================================
// Endpoint público para buscar vehículo por QR code
// ===================================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Buscar vehículo por QR code (público, no requiere autenticación)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { searchParams } = new URL(request.url)
    const qr_id = searchParams.get('qr_id')

    if (!qr_id) {
      return NextResponse.json(
        { error: 'QR ID requerido' },
        { status: 400 }
      )
    }

    // Buscar vehículo usando la función RPC
    const { data: vehiculoData, error } = await supabase
      .rpc('buscar_vehiculo_por_qr', { qr_id })

    if (error) {
      console.error('Error buscando vehículo:', error)
      return NextResponse.json(
        { error: 'Error al buscar vehículo' },
        { status: 500 }
      )
    }

    // La función retorna un array con un objeto
    const vehiculo = Array.isArray(vehiculoData) ? vehiculoData[0] : vehiculoData

    if (!vehiculo || !vehiculo.existe) {
      return NextResponse.json(
        { error: 'Código QR no válido o vehículo no encontrado', existe: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      existe: true,
      vehiculo: {
        id: vehiculo.vehiculo_id,
        matricula: vehiculo.matricula,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        color: vehiculo.color,
        foto_url: vehiculo.foto_url
      }
    })

  } catch (error) {
    console.error('Error en GET /api/vehiculos/buscar-qr:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

