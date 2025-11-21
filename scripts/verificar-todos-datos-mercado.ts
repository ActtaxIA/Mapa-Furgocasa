/**
 * Script para verificar TODOS los datos de mercado y su origen
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface DatoMercado {
  id: number
  marca: string
  modelo: string
  año: number
  precio: number
  kilometros?: number
  tipo_dato: string
  origen: string
  fecha_transaccion?: string
  created_at: string
  verificado: boolean
}

async function verificarTodosDatosMercado() {
  console.log('🔍 VERIFICANDO TODOS LOS DATOS DE MERCADO\n')
  console.log('='.repeat(80))

  try {
    // Obtener TODOS los datos de mercado
    console.log('\n📊 Obteniendo TODOS los datos de mercado...\n')
    const { data: datosMercado, error: errorMercado } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
      .order('created_at', { ascending: false })

    if (errorMercado) {
      console.error('❌ Error obteniendo datos de mercado:', errorMercado)
      return
    }

    console.log(`✅ Total registros en datos_mercado_autocaravanas: ${datosMercado?.length || 0}\n`)
    console.log('='.repeat(80))

    // Contar por tipo_dato
    const porTipoDato = datosMercado?.reduce((acc: any, dm: DatoMercado) => {
      acc[dm.tipo_dato || 'Sin tipo'] = (acc[dm.tipo_dato || 'Sin tipo'] || 0) + 1
      return acc
    }, {})

    console.log('\n📋 DISTRIBUCIÓN POR TIPO DE DATO:\n')
    Object.entries(porTipoDato || {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .forEach(([tipo, count]) => {
        console.log(`   ${tipo}: ${count}`)
      })

    // Contar por origen
    const porOrigen = datosMercado?.reduce((acc: any, dm: DatoMercado) => {
      acc[dm.origen || 'Sin origen'] = (acc[dm.origen || 'Sin origen'] || 0) + 1
      return acc
    }, {})

    console.log('\n📋 DISTRIBUCIÓN POR ORIGEN:\n')
    Object.entries(porOrigen || {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .forEach(([origen, count]) => {
        console.log(`   ${origen}: ${count}`)
      })

    // Filtrar solo los de usuarios
    const datosUsuarios = datosMercado?.filter((dm: DatoMercado) => 
      dm.tipo_dato === 'Compra Real Usuario' || 
      dm.tipo_dato === 'Venta Real Usuario' ||
      dm.origen === 'Usuario' ||
      dm.origen === 'Venta Real Usuario'
    ) || []

    console.log('\n' + '='.repeat(80))
    console.log(`\n✅ DATOS DE USUARIOS: ${datosUsuarios.length}\n`)
    console.log('='.repeat(80))

    if (datosUsuarios.length > 0) {
      console.log('\n📋 Listado de datos de usuarios:\n')
      datosUsuarios.forEach((dm: DatoMercado, index: number) => {
        console.log(`${index + 1}. ${dm.marca} ${dm.modelo} (${dm.año})`)
        console.log(`   Tipo: ${dm.tipo_dato}`)
        console.log(`   Origen: ${dm.origen}`)
        console.log(`   Precio: ${dm.precio.toLocaleString('es-ES')} €`)
        console.log(`   KM: ${dm.kilometros?.toLocaleString('es-ES') || 'No registrado'}`)
        console.log(`   Fecha transacción: ${dm.fecha_transaccion || 'No registrada'}`)
        console.log(`   Creado: ${new Date(dm.created_at).toLocaleDateString('es-ES')}`)
        console.log(`   Verificado: ${dm.verificado ? '✅' : '❌'}`)
        console.log(`   ${'-'.repeat(76)}`)
      })
    }

    // Datos más recientes (últimos 50)
    console.log('\n' + '='.repeat(80))
    console.log('\n📅 ÚLTIMOS 50 REGISTROS CREADOS:\n')
    console.log('='.repeat(80))

    const ultimos50 = datosMercado?.slice(0, 50) || []
    ultimos50.forEach((dm: DatoMercado, index: number) => {
      console.log(`${index + 1}. ${dm.marca} ${dm.modelo} (${dm.año}) - ${dm.precio.toLocaleString('es-ES')} €`)
      console.log(`   Tipo: ${dm.tipo_dato} | Origen: ${dm.origen}`)
      console.log(`   Creado: ${new Date(dm.created_at).toLocaleString('es-ES')}`)
      console.log(`   ${'-'.repeat(76)}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log('\n💡 RESUMEN:\n')
    console.log(`Total registros: ${datosMercado?.length || 0}`)
    console.log(`De usuarios: ${datosUsuarios.length}`)
    console.log(`De otras fuentes: ${(datosMercado?.length || 0) - datosUsuarios.length}`)
    console.log('\n' + '='.repeat(80))

  } catch (error) {
    console.error('❌ Error en la verificación:', error)
  }
}

// Ejecutar
verificarTodosDatosMercado()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

