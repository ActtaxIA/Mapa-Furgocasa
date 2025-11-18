/**
 * 🚗 SCRIPT: Recuperar Kilómetros Faltantes en datos_mercado_autocaravanas
 * 
 * PROBLEMA:
 * - Muchos registros en datos_mercado_autocaravanas tienen kilometros = null
 * - Esto reduce la utilidad de los datos para valoraciones IA
 * 
 * SOLUCIÓN:
 * - Buscar KM en las fuentes originales:
 *   1. vehiculo_valoracion_economica (compras y ventas de usuario)
 *   2. vehiculo_ficha_tecnica (ficha técnica del vehículo)
 *   3. vehiculo_kilometraje (historial de KM)
 * 
 * EJECUCIÓN:
 * node scripts/recuperar-kilometros-datos-mercado.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recuperarKilometros() {
  console.log('🔍 Iniciando recuperación de kilómetros...\n');

  try {
    // 1. Obtener todos los registros SIN kilometros
    const { data: sinKm, error: errorSinKm } = await supabase
      .from('datos_mercado_autocaravanas')
      .select('*')
      .is('kilometros', null)
      .order('created_at', { ascending: false });

    if (errorSinKm) {
      console.error('❌ Error obteniendo registros:', errorSinKm.message);
      return;
    }

    console.log(`📊 Registros sin kilómetros: ${sinKm.length}`);

    if (sinKm.length === 0) {
      console.log('✅ No hay registros sin kilómetros. ¡Todo en orden!');
      return;
    }

    let actualizados = 0;
    let noEncontrados = 0;

    // 2. Por cada registro, intentar recuperar KM
    for (const dato of sinKm) {
      console.log(`\n🔎 Procesando: ${dato.marca || '?'} ${dato.modelo || '?'} (${dato.año || '?'})`);
      console.log(`   ID: ${dato.id}`);
      console.log(`   Origen: ${dato.origen}`);
      console.log(`   Tipo: ${dato.tipo_dato}`);

      let kmRecuperado = null;

      // ESTRATEGIA 1: Si es de compra o venta de usuario, buscar en vehiculo_valoracion_economica
      if (dato.tipo_dato === 'Compra Real Usuario' || dato.origen === 'Compra Real Usuario') {
        const { data: compra } = await supabase
          .from('vehiculo_valoracion_economica')
          .select('kilometros_compra')
          .eq('precio_compra', dato.precio)
          .gte('fecha_compra', new Date(Date.parse(dato.fecha_transaccion) - 86400000).toISOString().split('T')[0]) // ±1 día
          .lte('fecha_compra', new Date(Date.parse(dato.fecha_transaccion) + 86400000).toISOString().split('T')[0])
          .not('kilometros_compra', 'is', null)
          .limit(1)
          .single();

        if (compra?.kilometros_compra) {
          kmRecuperado = compra.kilometros_compra;
          console.log(`   ✅ KM recuperado de compra: ${kmRecuperado}`);
        }
      }

      if (!kmRecuperado && (dato.tipo_dato === 'Venta Real Usuario' || dato.origen === 'Venta Real Usuario')) {
        const { data: venta } = await supabase
          .from('vehiculo_valoracion_economica')
          .select('kilometros_venta')
          .eq('precio_venta_final', dato.precio)
          .gte('fecha_venta', new Date(Date.parse(dato.fecha_transaccion) - 86400000).toISOString().split('T')[0])
          .lte('fecha_venta', new Date(Date.parse(dato.fecha_transaccion) + 86400000).toISOString().split('T')[0])
          .not('kilometros_venta', 'is', null)
          .limit(1)
          .single();

        if (venta?.kilometros_venta) {
          kmRecuperado = venta.kilometros_venta;
          console.log(`   ✅ KM recuperado de venta: ${kmRecuperado}`);
        }
      }

      // ESTRATEGIA 2: Si no encontró, buscar por marca/modelo/año en vehiculos_registrados + historial
      if (!kmRecuperado && dato.marca && dato.modelo) {
        const { data: vehiculos } = await supabase
          .from('vehiculos_registrados')
          .select('id')
          .eq('marca', dato.marca)
          .eq('modelo', dato.modelo)
          .eq('ano', dato.año)
          .limit(5);

        if (vehiculos && vehiculos.length > 0) {
          // Buscar KM más cercano en fecha
          for (const vehiculo of vehiculos) {
            const { data: kmHistorial } = await supabase
              .from('vehiculo_kilometraje')
              .select('kilometros, fecha')
              .eq('vehiculo_id', vehiculo.id)
              .order('fecha', { ascending: false })
              .limit(1)
              .single();

            if (kmHistorial?.kilometros) {
              // Verificar que la fecha sea cercana (±30 días)
              const fechaKm = new Date(kmHistorial.fecha);
              const fechaDato = new Date(dato.fecha_transaccion || dato.created_at);
              const diffDias = Math.abs((fechaKm - fechaDato) / (1000 * 60 * 60 * 24));

              if (diffDias <= 30) {
                kmRecuperado = kmHistorial.kilometros;
                console.log(`   ✅ KM recuperado de historial (${diffDias.toFixed(0)} días diff): ${kmRecuperado}`);
                break;
              }
            }
          }
        }
      }

      // 3. Si encontró KM, actualizar el registro
      if (kmRecuperado !== null) {
        const { error: updateError } = await supabase
          .from('datos_mercado_autocaravanas')
          .update({ kilometros: kmRecuperado })
          .eq('id', dato.id);

        if (updateError) {
          console.log(`   ❌ Error actualizando: ${updateError.message}`);
        } else {
          actualizados++;
          console.log(`   💾 Actualizado con ${kmRecuperado} km`);
        }
      } else {
        noEncontrados++;
        console.log(`   ⚠️ No se encontraron KM en fuentes originales`);
      }

      // Pequeña pausa para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 4. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE RECUPERACIÓN');
    console.log('='.repeat(60));
    console.log(`Total registros sin KM:     ${sinKm.length}`);
    console.log(`✅ KM recuperados:          ${actualizados}`);
    console.log(`⚠️ No encontrados:          ${noEncontrados}`);
    console.log(`📈 Tasa de recuperación:    ${((actualizados / sinKm.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    console.error(error);
  }
}

// Ejecutar
recuperarKilometros()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });

