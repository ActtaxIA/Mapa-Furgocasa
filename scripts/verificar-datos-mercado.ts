/**
 * Script para verificar qué vehículos están registrados y cuáles aparecen en datos de mercado
 * 
 * Propósito: Verificar si los vehículos registrados tienen datos de compra/venta
 *            y si se están añadiendo correctamente a datos_mercado_autocaravanas
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
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VehiculoRegistrado {
  id: string
  marca: string
  modelo: string
  matricula: string
  año: number
  created_at: string
}

interface ValoracionEconomica {
  vehiculo_id: string
  precio_compra?: number
  fecha_compra?: string
  kilometros_compra?: number
  pvp_base_particular?: number
  vendido: boolean
  precio_venta_final?: number
  fecha_venta?: string
  kilometros_venta?: number
}

interface DatoMercado {
  id: number
  marca: string
  modelo: string
  año: number
  precio: number
  kilometros?: number
  tipo_dato: string
  fecha_transaccion?: string
  created_at: string
}

async function verificarDatosMercado() {
  console.log('🔍 VERIFICANDO DATOS DE MERCADO\n')
  console.log('='.repeat(80))

  try {
    // 1. Obtener todos los vehículos registrados (últimos 20)
    console.log('\n📋 1. OBTENIENDO VEHÍCULOS REGISTRADOS...\n')
    const { data: vehiculos, error: errorVehiculos } = await supabase
      .from('vehiculos_registrados')
      .select('id, marca, modelo, matricula, año, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (errorVehiculos) {
      console.error('❌ Error obteniendo vehículos:', errorVehiculos)
      return
    }

    console.log(`✅ Total vehículos registrados (últimos 20): ${vehiculos?.length || 0}\n`)

    // 2. Obtener todas las valoraciones económicas
    console.log('💰 2. OBTENIENDO VALORACIONES ECONÓMICAS...\n')
    const { data: valoraciones, error: errorValoraciones } = await supabase
      .from('vehiculo_valoracion_economica')
      .select('*')
      .order('created_at', { ascending: false })

    if (errorValoraciones) {
      console.error('❌ Error obteniendo valoraciones:', errorValoraciones)
      return
    }

    console.log(`✅ Total valoraciones económicas: ${valoraciones?.length || 0}\n`)

    // 3. Obtener todos los datos de mercado
    console.log('📊 3. OBTENIENDO DATOS DE MERCADO...\n')
    const { data: datosMercado, error: errorMercado } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    if (errorMercado) {
      console.error('❌ Error obteniendo datos de mercado:', errorMercado)
      return
    }

    console.log(`✅ Total datos de mercado (últimos 30): ${datosMercado?.length || 0}\n`)

    // 4. Análisis detallado
    console.log('='.repeat(80))
    console.log('\n📊 ANÁLISIS DETALLADO POR VEHÍCULO\n')
    console.log('='.repeat(80))

    const valoracionesMap = new Map(
      valoraciones?.map(v => [v.vehiculo_id, v]) || []
    )

    let vehiculosConDatosCompra = 0
    let vehiculosSinDatosCompra = 0
    let vehiculosVendidos = 0

    vehiculos?.forEach((vehiculo: VehiculoRegistrado, index: number) => {
      const valoracion = valoracionesMap.get(vehiculo.id)
      const tieneDatosCompra = valoracion?.precio_compra && valoracion?.fecha_compra
      const estaVendido = valoracion?.vendido

      console.log(`\n${index + 1}. ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.matricula}`)
      console.log(`   ID: ${vehiculo.id}`)
      console.log(`   Año: ${vehiculo.año}`)
      console.log(`   Registrado: ${new Date(vehiculo.created_at).toLocaleDateString('es-ES')}`)
      
      if (valoracion) {
        console.log(`   ✅ Tiene registro en valoración económica`)
        
        if (tieneDatosCompra) {
          console.log(`   ✅ Tiene datos de COMPRA:`)
          console.log(`      - Precio: ${valoracion.precio_compra?.toLocaleString('es-ES')} €`)
          console.log(`      - Fecha: ${valoracion.fecha_compra}`)
          console.log(`      - KM compra: ${valoracion.kilometros_compra?.toLocaleString('es-ES') || 'No registrado'}`)
          console.log(`      - PVP base: ${valoracion.pvp_base_particular?.toLocaleString('es-ES') || 'No calculado'} €`)
          vehiculosConDatosCompra++
        } else {
          console.log(`   ⚠️  NO tiene datos de COMPRA completos`)
          console.log(`      - Precio: ${valoracion.precio_compra || 'No registrado'}`)
          console.log(`      - Fecha: ${valoracion.fecha_compra || 'No registrada'}`)
          vehiculosSinDatosCompra++
        }

        if (estaVendido) {
          console.log(`   ✅ VENDIDO:`)
          console.log(`      - Precio venta: ${valoracion.precio_venta_final?.toLocaleString('es-ES') || 'No registrado'} €`)
          console.log(`      - Fecha venta: ${valoracion.fecha_venta || 'No registrada'}`)
          console.log(`      - KM venta: ${valoracion.kilometros_venta?.toLocaleString('es-ES') || 'No registrado'}`)
          vehiculosVendidos++
        }
      } else {
        console.log(`   ❌ NO tiene registro en valoración económica`)
        vehiculosSinDatosCompra++
      }

      // Verificar si está en datos de mercado
      const enDatosMercado = datosMercado?.filter(dm => 
        dm.marca?.toLowerCase() === vehiculo.marca?.toLowerCase() &&
        dm.modelo?.toLowerCase() === vehiculo.modelo?.toLowerCase() &&
        dm.año === vehiculo.año
      ) || []

      if (enDatosMercado.length > 0) {
        console.log(`   ✅ APARECE EN DATOS DE MERCADO (${enDatosMercado.length} registro(s)):`)
        enDatosMercado.forEach(dm => {
          console.log(`      - Tipo: ${dm.tipo_dato}`)
          console.log(`      - Precio: ${dm.precio.toLocaleString('es-ES')} €`)
          console.log(`      - KM: ${dm.kilometros?.toLocaleString('es-ES') || 'No registrado'}`)
          console.log(`      - Fecha transacción: ${dm.fecha_transaccion || 'No registrada'}`)
          console.log(`      - Creado: ${new Date(dm.created_at).toLocaleDateString('es-ES')}`)
        })
      } else {
        console.log(`   ❌ NO APARECE EN DATOS DE MERCADO`)
        if (!tieneDatosCompra) {
          console.log(`      → Razón: No tiene datos de compra completos (precio + fecha)`)
        }
      }

      console.log(`   ${'-'.repeat(76)}`)
    })

    // 5. Resumen final
    console.log('\n' + '='.repeat(80))
    console.log('\n📈 RESUMEN FINAL\n')
    console.log('='.repeat(80))
    console.log(`\n✅ Vehículos registrados: ${vehiculos?.length || 0}`)
    console.log(`✅ Con datos de compra completos: ${vehiculosConDatosCompra}`)
    console.log(`⚠️  Sin datos de compra: ${vehiculosSinDatosCompra}`)
    console.log(`✅ Vendidos: ${vehiculosVendidos}`)
    console.log(`\n📊 Registros en datos_mercado_autocaravanas (últimos 30): ${datosMercado?.length || 0}`)

    // Contar tipos de datos en mercado
    const tiposDatos = datosMercado?.reduce((acc: any, dm: DatoMercado) => {
      acc[dm.tipo_dato] = (acc[dm.tipo_dato] || 0) + 1
      return acc
    }, {})

    console.log('\n📋 Distribución por tipo:')
    Object.entries(tiposDatos || {}).forEach(([tipo, count]) => {
      console.log(`   - ${tipo}: ${count}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log('\n💡 CONCLUSIÓN:\n')
    console.log('Los vehículos solo aparecen en "Datos de Mercado" cuando:')
    console.log('1. ✅ El usuario completa el formulario de "Datos de Compra" (precio + fecha)')
    console.log('2. ✅ El usuario registra una venta del vehículo')
    console.log('\nSi faltan vehículos en "Datos de Mercado", es porque no tienen')
    console.log('datos de compra/venta registrados todavía.\n')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error en la verificación:', error)
  }
}

// Ejecutar
verificarDatosMercado()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

