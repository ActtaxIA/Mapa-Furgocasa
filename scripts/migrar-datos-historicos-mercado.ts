/**
 * Script de migración: Insertar datos históricos de compra/venta en datos_mercado_autocaravanas
 * 
 * Este script busca todos los vehículos que tienen datos de compra o venta
 * pero que NO están en la tabla datos_mercado_autocaravanas y los inserta.
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

interface VehiculoConDatos {
  vehiculo_id: string
  marca: string
  modelo: string
  año: number
  chasis: string
  // Datos de compra
  precio_compra?: number
  pvp_base_particular?: number
  fecha_compra?: string
  kilometros_compra?: number
  origen_compra?: string
  estado_general?: string
  pais_compra?: string
  // Datos de venta
  vendido: boolean
  precio_venta_final?: number
  fecha_venta?: string
  kilometros_venta?: number
  estado_venta?: string
}

async function migrarDatosHistoricos() {
  console.log('🔄 MIGRACIÓN DE DATOS HISTÓRICOS A DATOS DE MERCADO\n')
  console.log('='.repeat(80))

  try {
    // 1. Obtener todos los vehículos con valoración económica
    console.log('\n📋 1. Obteniendo vehículos con datos de compra/venta...\n')
    
    const { data: valoraciones, error: errorValoraciones } = await supabase
      .from('vehiculo_valoracion_economica')
      .select(`
        vehiculo_id,
        precio_compra,
        pvp_base_particular,
        fecha_compra,
        kilometros_compra,
        origen_compra,
        estado_general,
        pais_compra,
        vendido,
        precio_venta_final,
        fecha_venta,
        kilometros_venta,
        estado_venta,
        vehiculos_registrados (
          marca,
          modelo,
          año,
          chasis
        )
      `)

    if (errorValoraciones) {
      console.error('❌ Error obteniendo valoraciones:', errorValoraciones)
      return
    }

    console.log(`✅ Total valoraciones encontradas: ${valoraciones?.length || 0}`)

    // 2. Obtener datos de mercado existentes
    console.log('\n📊 2. Obteniendo datos de mercado existentes...\n')
    
    const { data: datosMercadoExistentes, error: errorMercado } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('marca, modelo, año, precio, fecha_transaccion, tipo_dato')

    if (errorMercado) {
      console.error('❌ Error obteniendo datos de mercado:', errorMercado)
      return
    }

    console.log(`✅ Total registros en datos de mercado: ${datosMercadoExistentes?.length || 0}`)

    // 3. Procesar cada vehículo
    console.log('\n' + '='.repeat(80))
    console.log('\n🔍 3. ANALIZANDO VEHÍCULOS...\n')
    console.log('='.repeat(80))

    let comprasAInsertar = 0
    let ventasAInsertar = 0
    let comprasYaExisten = 0
    let ventasYaExisten = 0
    let sinDatosCompletos = 0

    const insertarCompras: any[] = []
    const insertarVentas: any[] = []

    for (const val of valoraciones || []) {
      const vehiculo = (val as any).vehiculos_registrados
      
      if (!vehiculo) {
        console.log('⚠️  Valoración sin vehículo asociado, saltando...')
        continue
      }

      const nombreVehiculo = `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.año})`

      // Verificar si tiene datos de COMPRA completos
      const tieneDatosCompra = val.precio_compra && val.fecha_compra
      
      if (tieneDatosCompra) {
        // Verificar si ya existe en datos_mercado
        const yaExisteCompra = datosMercadoExistentes?.some(dm => 
          dm.marca?.toLowerCase() === vehiculo.marca?.toLowerCase() &&
          dm.modelo?.toLowerCase() === vehiculo.modelo?.toLowerCase() &&
          dm.año === vehiculo.año &&
          dm.fecha_transaccion === val.fecha_compra &&
          dm.tipo_dato === 'Compra Real Usuario'
        )

        if (yaExisteCompra) {
          console.log(`✅ ${nombreVehiculo} - Compra ya existe en datos de mercado`)
          comprasYaExisten++
        } else {
          console.log(`➕ ${nombreVehiculo} - AÑADIR COMPRA: ${val.precio_compra?.toLocaleString('es-ES')} € (${val.fecha_compra})`)
          comprasAInsertar++
          
          // Usar pvp_base_particular si está disponible, sino precio_compra
          const precioNormalizado = val.pvp_base_particular || val.precio_compra
          
          insertarCompras.push({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            chasis: vehiculo.chasis,
            año: vehiculo.año,
            precio: precioNormalizado,
            kilometros: val.kilometros_compra || null,
            fecha_transaccion: val.fecha_compra,
            verificado: true,
            estado: val.estado_general || 'Usado',
            origen: val.origen_compra || 'Usuario',
            tipo_dato: 'Compra Real Usuario',
            pais: val.pais_compra || 'España',
            tipo_combustible: null,
            tipo_calefaccion: null,
            homologacion: null,
            region: null
          })
        }
      }

      // Verificar si tiene datos de VENTA completos
      if (val.vendido && val.precio_venta_final && val.fecha_venta) {
        const yaExisteVenta = datosMercadoExistentes?.some(dm => 
          dm.marca?.toLowerCase() === vehiculo.marca?.toLowerCase() &&
          dm.modelo?.toLowerCase() === vehiculo.modelo?.toLowerCase() &&
          dm.año === vehiculo.año &&
          dm.fecha_transaccion === val.fecha_venta &&
          dm.tipo_dato === 'Venta Real Usuario'
        )

        if (yaExisteVenta) {
          console.log(`✅ ${nombreVehiculo} - Venta ya existe en datos de mercado`)
          ventasYaExisten++
        } else {
          console.log(`➕ ${nombreVehiculo} - AÑADIR VENTA: ${val.precio_venta_final?.toLocaleString('es-ES')} € (${val.fecha_venta})`)
          ventasAInsertar++
          
          insertarVentas.push({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            chasis: vehiculo.chasis,
            año: vehiculo.año,
            precio: val.precio_venta_final,
            kilometros: val.kilometros_venta || null,
            fecha_transaccion: val.fecha_venta,
            verificado: true,
            estado: val.estado_venta || 'Vendido',
            origen: 'Venta Real Usuario',
            tipo_dato: 'Venta Real Usuario',
            pais: 'España',
            tipo_combustible: null,
            tipo_calefaccion: null,
            homologacion: null,
            region: null
          })
        }
      }

      if (!tieneDatosCompra && !val.vendido) {
        console.log(`⚠️  ${nombreVehiculo} - Sin datos de compra/venta completos`)
        sinDatosCompletos++
      }
    }

    // 4. Resumen antes de insertar
    console.log('\n' + '='.repeat(80))
    console.log('\n📈 RESUMEN DE MIGRACIÓN:\n')
    console.log('='.repeat(80))
    console.log(`\n✅ Compras que ya existen: ${comprasYaExisten}`)
    console.log(`➕ Compras a insertar: ${comprasAInsertar}`)
    console.log(`✅ Ventas que ya existen: ${ventasYaExisten}`)
    console.log(`➕ Ventas a insertar: ${ventasAInsertar}`)
    console.log(`⚠️  Vehículos sin datos completos: ${sinDatosCompletos}`)
    console.log(`\n📊 Total a insertar: ${comprasAInsertar + ventasAInsertar} registros`)

    // 5. Insertar datos
    if (insertarCompras.length > 0 || insertarVentas.length > 0) {
      console.log('\n' + '='.repeat(80))
      console.log('\n💾 4. INSERTANDO DATOS EN datos_mercado_autocaravanas...\n')
      console.log('='.repeat(80))

      let insertadosExito = 0
      let erroresInsercion = 0

      // Insertar compras
      if (insertarCompras.length > 0) {
        console.log(`\n📥 Insertando ${insertarCompras.length} compras...`)
        
        for (const compra of insertarCompras) {
          const { error } = await supabase
            .from('datos_mercado_autocaravanas')
            .insert(compra)

          if (error) {
            console.error(`❌ Error insertando ${compra.marca} ${compra.modelo}:`, error.message)
            erroresInsercion++
          } else {
            console.log(`✅ Insertado: ${compra.marca} ${compra.modelo} - Compra ${compra.precio.toLocaleString('es-ES')} €`)
            insertadosExito++
          }
        }
      }

      // Insertar ventas
      if (insertarVentas.length > 0) {
        console.log(`\n📥 Insertando ${insertarVentas.length} ventas...`)
        
        for (const venta of insertarVentas) {
          const { error } = await supabase
            .from('datos_mercado_autocaravanas')
            .insert(venta)

          if (error) {
            console.error(`❌ Error insertando ${venta.marca} ${venta.modelo}:`, error.message)
            erroresInsercion++
          } else {
            console.log(`✅ Insertado: ${venta.marca} ${venta.modelo} - Venta ${venta.precio.toLocaleString('es-ES')} €`)
            insertadosExito++
          }
        }
      }

      console.log('\n' + '='.repeat(80))
      console.log('\n✅ MIGRACIÓN COMPLETADA\n')
      console.log('='.repeat(80))
      console.log(`\n✅ Registros insertados exitosamente: ${insertadosExito}`)
      console.log(`❌ Errores de inserción: ${erroresInsercion}`)
      console.log('\n' + '='.repeat(80))
    } else {
      console.log('\n✅ No hay datos nuevos para insertar. Todos los datos ya están en datos_mercado_autocaravanas.')
    }

  } catch (error) {
    console.error('❌ Error en la migración:', error)
  }
}

// Ejecutar
migrarDatosHistoricos()
  .then(() => {
    console.log('\n✅ Script de migración completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

