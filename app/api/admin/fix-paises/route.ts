import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Este endpoint analiza y opcionalmente corrige los valores de país
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fix = searchParams.get('fix') === 'true'
    
    const supabase = await createClient()
    
    // Verificar que el usuario es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener todas las áreas
    const { data: areas, error } = await (supabase as any)
      .from('areas')
      .select('id, nombre, pais, provincia, ciudad, codigo_postal')
      .eq('activo', true)
      .order('pais')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Analizar problemas
    const problemas: any[] = []
    const porPais: Record<string, number> = {}
    
    areas.forEach(area => {
      const pais = area.pais || 'NULL'
      const paisTrimmed = area.pais?.trim() || 'NULL'
      
      // Contar por país
      porPais[paisTrimmed] = (porPais[paisTrimmed] || 0) + 1
      
      // Detectar problemas
      if (area.pais && area.pais !== area.pais.trim()) {
        problemas.push({
          id: area.id,
          nombre: area.nombre,
          tipo: 'espacios_extra',
          paisActual: `"${area.pais}"`,
          paisCorrecto: `"${area.pais.trim()}"`
        })
      }
      
      // Detectar áreas que podrían estar en Portugal pero están marcadas como España
      if (paisTrimmed === 'España') {
        // Códigos postales de Portugal empiezan con 1-9 seguido de 3 dígitos
        // Provincias de Portugal
        const provinciasPortugal = [
          'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
          'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
          'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
          'Viana do Castelo', 'Vila Real', 'Viseu',
          'Açores', 'Madeira'
        ]
        
        if (provinciasPortugal.includes(area.provincia || '')) {
          problemas.push({
            id: area.id,
            nombre: area.nombre,
            tipo: 'pais_incorrecto',
            paisActual: 'España',
            paisCorrecto: 'Portugal',
            razon: `Provincia portuguesa: ${area.provincia}`
          })
        }
      }
      
      // Detectar áreas que podrían estar en Andorra
      if (paisTrimmed === 'España' && area.codigo_postal?.startsWith('AD')) {
        problemas.push({
          id: area.id,
          nombre: area.nombre,
          tipo: 'pais_incorrecto',
          paisActual: 'España',
          paisCorrecto: 'Andorra',
          razon: `Código postal: ${area.codigo_postal}`
        })
      }
    })

    // Si fix=true, aplicar las correcciones
    let correccionesAplicadas = 0
    if (fix) {
      for (const problema of problemas) {
        if (problema.tipo === 'espacios_extra' || problema.tipo === 'pais_incorrecto') {
          const { error: updateError } = await (supabase as any)
            .from('areas')
            .update({ pais: problema.paisCorrecto.replace(/"/g, '') })
            .eq('id', problema.id)
          
          if (!updateError) {
            correccionesAplicadas++
          }
        }
      }
    }

    return NextResponse.json({
      totalAreas: areas.length,
      distribucionPorPais: porPais,
      problemasEncontrados: problemas.length,
      problemas,
      correccionesAplicadas: fix ? correccionesAplicadas : 0,
      mensaje: fix 
        ? `Se aplicaron ${correccionesAplicadas} correcciones` 
        : `Encontrados ${problemas.length} problemas. Usa ?fix=true para corregir`
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

