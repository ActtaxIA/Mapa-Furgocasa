import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: Verificar configuración de IA
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Consultar configuración
    const { data, error } = await (supabase as any)
      .from('ia_config')
      .select('*')
      .eq('config_key', 'valoracion_vehiculos')
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Error consultando configuración',
        details: error 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Configuración no encontrada' 
      }, { status: 404 })
    }

    // Devolver la configuración
    return NextResponse.json({
      success: true,
      config_key: data.config_key,
      descripcion: data.descripcion,
      modelo: data.config_value.model,
      temperature: data.config_value.temperature,
      max_tokens: data.config_value.max_tokens,
      prompts_count: data.config_value.prompts?.length || 0,
      updated_at: data.updated_at,
      full_config: data.config_value
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Error interno',
      message: error.message 
    }, { status: 500 })
  }
}

