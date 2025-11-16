import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await (supabase as any)
      .from('areas')
      .select('id, nombre, pais, ciudad, provincia')
      .eq('activo', true)
      .order('pais')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar por país
    const porPais: Record<string, any[]> = {}
    data.forEach(area => {
      const pais = area.pais || 'NULL'
      if (!porPais[pais]) {
        porPais[pais] = []
      }
      porPais[pais].push({
        nombre: area.nombre,
        ciudad: area.ciudad,
        provincia: area.provincia
      })
    })

    // Crear resumen
    const resumen = Object.keys(porPais).sort().map(pais => ({
      pais,
      count: porPais[pais].length,
      ejemplos: porPais[pais].slice(0, 3)
    }))

    // Verificar problemas
    const problemasEspacios = data.filter(a => a.pais && (a.pais !== a.pais.trim()))
    const paisesUnicos = Object.keys(porPais).sort()

    return NextResponse.json({
      totalAreas: data.length,
      paisesUnicos,
      resumen,
      problemasEspacios: problemasEspacios.length,
      ejemplosProblemas: problemasEspacios.slice(0, 5).map(a => ({
        pais: a.pais,
        paisTrimmed: a.pais?.trim(),
        nombre: a.nombre
      }))
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

