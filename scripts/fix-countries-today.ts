/**
 * Script para corregir países de áreas AÑADIDAS HOY usando Google Geocoding API
 * ============================================================================
 *
 * Este script:
 * 1. Lee solo las áreas creadas HOY (desde las 00:00 del día actual)
 * 2. Usa Google Geocoding API para obtener el país real desde lat/lng
 * 3. Compara con el país actual en la base de datos
 * 4. Aplica las correcciones (solo si se pasa --apply)
 *
 * USO:
 *   npm run db:fix:countries:today           # Modo dry-run (solo muestra cambios)
 *   npm run db:fix:countries:today -- --apply # Aplica los cambios
 *
 * VENTAJAS:
 *   - Solo procesa áreas del día actual → ahorra dinero en API
 *   - Ideal para ejecutar al final del día después de importar
 *   - Perfecto para días de importación masiva
 *
 * REQUISITOS:
 *   - Variable de entorno NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 *   - Variables de Supabase configuradas
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Faltan variables de entorno de Supabase");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configurar Google Geocoding
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!googleApiKey) {
  console.error("❌ Error: Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  process.exit(1);
}

interface Area {
  id: string;
  nombre: string;
  pais: string | null;
  provincia: string | null;
  ciudad: string | null;
  latitud: number;
  longitud: number;
  created_at: string;
}

interface GeocodeResult {
  country: string;
  province: string;
  city: string;
}

/**
 * Función para obtener país desde coordenadas GPS usando Google Geocoding
 */
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResult | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${googleApiKey}`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return null;
    }

    const components = data.results[0].address_components;

    let country = "";
    let province = "";
    let city = "";

    for (const component of components) {
      if (component.types.includes("country")) {
        country = component.long_name;
      }
      if (component.types.includes("administrative_area_level_2")) {
        province = component.long_name;
      }
      if (
        component.types.includes("administrative_area_level_1") &&
        !province
      ) {
        province = component.long_name;
      }
      if (component.types.includes("locality")) {
        city = component.long_name;
      }
    }

    return { country: country || "Desconocido", province, city };
  } catch (error) {
    console.error("Error en reverse geocoding:", error);
    return null;
  }
}

/**
 * Delay para evitar saturar la API
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Función principal
 */
async function fixCountriesToday() {
  const applyChanges = process.argv.includes("--apply");

  // Calcular inicio del día de hoy (00:00:00)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyISO = hoy.toISOString();

  const ahora = new Date();

  console.log("\n" + "=".repeat(70));
  console.log("🔧 CORRECCIÓN DE PAÍSES - ÁREAS AÑADIDAS HOY");
  console.log("=".repeat(70));
  console.log(
    `📅 Fecha: ${ahora.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`
  );
  console.log(`🕐 Hora: ${ahora.toLocaleTimeString("es-ES")}`);
  console.log(`📊 Filtrando áreas desde: ${hoy.toLocaleString("es-ES")}`);
  console.log(
    `Modo: ${applyChanges ? "✅ APLICAR CAMBIOS" : "👀 DRY RUN (solo mostrar)"}`
  );
  console.log("=".repeat(70) + "\n");

  // 1. Obtener áreas creadas HOY con coordenadas GPS (en lotes)
  console.log("📊 Cargando áreas creadas hoy desde Supabase...");

  const allAreas: Area[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: areas, error } = await (supabase as any).from("areas")
      .select(
        "id, nombre, pais, provincia, ciudad, latitud, longitud, created_at"
      )
      .not("latitud", "is", null)
      .not("longitud", "is", null)
      .eq("activo", true)
      .gte("created_at", hoyISO) // ✨ SOLO ÁREAS CREADAS HOY
      .order("created_at", { ascending: false }) // Más recientes primero
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("❌ Error cargando áreas:", error.message);
      process.exit(1);
    }

    if (!areas || areas.length === 0) {
      hasMore = false;
    } else {
      allAreas.push(...(areas as Area[]));
      console.log(`   Cargadas ${allAreas.length} áreas...`);
      page++;

      if (areas.length < pageSize) {
        hasMore = false;
      }
    }
  }

  if (allAreas.length === 0) {
    console.log(
      "\n⚠️  No se encontraron áreas creadas hoy con coordenadas GPS"
    );
    console.log(
      "ℹ️  Puede que no se hayan importado áreas nuevas hoy, o que no tengan coordenadas.\n"
    );
    process.exit(0);
  }

  console.log(
    `\n✅ Total: ${allAreas.length} áreas creadas hoy con coordenadas GPS`
  );

  // Mostrar rango de fechas de las áreas encontradas
  const fechas = allAreas.map((a) => new Date(a.created_at));
  const masAntigua = new Date(Math.min(...fechas.map((f) => f.getTime())));
  const masReciente = new Date(Math.max(...fechas.map((f) => f.getTime())));

  console.log(`\n📅 Rango de fechas de las áreas:`);
  console.log(`   Primera área: ${masAntigua.toLocaleString("es-ES")}`);
  console.log(`   Última área:  ${masReciente.toLocaleString("es-ES")}`);
  console.log("");

  // 2. Analizar y corregir
  const changes: Array<{
    area: Area;
    oldCountry: string;
    newCountry: string;
    newProvince?: string;
    newCity?: string;
  }> = [];

  let processed = 0;
  let errors = 0;
  let apiCalls = 0;

  console.log("🔍 Analizando países con Google Geocoding API...\n");

  for (const area of allAreas) {
    try {
      // Llamar a Google Geocoding API
      const location = await reverseGeocode(area.latitud, area.longitud);
      apiCalls++;

      if (!location) {
        errors++;
        console.log(`⚠️  ${area.nombre}: No se pudo obtener ubicación`);
        continue;
      }

      // Comparar país actual vs país real
      const oldCountry = area.pais?.trim() || "NULL";
      const newCountry = location.country.trim();

      if (oldCountry !== newCountry) {
        changes.push({
          area,
          oldCountry,
          newCountry,
          newProvince: location.province || undefined,
          newCity: location.city || undefined,
        });

        console.log(`🔄 ${area.nombre}`);
        console.log(`   ${oldCountry} → ${newCountry}`);
      }

      processed++;

      // Mostrar progreso cada 10 áreas (o cada 50 si hay muchas)
      const progressInterval = allAreas.length > 100 ? 50 : 10;
      if (processed % progressInterval === 0) {
        console.log(
          `\n📈 Progreso: ${processed}/${allAreas.length} (${Math.round(
            (processed / allAreas.length) * 100
          )}%)\n`
        );
      }

      // Delay para no saturar la API (25 requests/segundo = 40ms)
      await delay(100);
    } catch (error: any) {
      errors++;
      console.error(`❌ Error procesando ${area.nombre}:`, error.message);
    }
  }

  // 3. Mostrar resumen
  console.log("\n" + "=".repeat(70));
  console.log("📊 RESUMEN");
  console.log("=".repeat(70));
  console.log(`Áreas procesadas:     ${processed}`);
  console.log(`Cambios necesarios:   ${changes.length}`);
  console.log(`Correctas:            ${processed - changes.length - errors}`);
  console.log(`Errores:              ${errors}`);
  console.log(`Llamadas API Google:  ${apiCalls}`);
  console.log(`Costo estimado:       ~$${(apiCalls * 0.005).toFixed(2)} USD`);
  console.log("=".repeat(70) + "\n");

  if (changes.length === 0) {
    console.log(
      "✅ ¡No hay cambios necesarios! Todos los países están correctos.\n"
    );
    return;
  }

  // 4. Mostrar cambios por país
  const changesByCountry: Record<string, number> = {};
  changes.forEach((change) => {
    const key = `${change.oldCountry} → ${change.newCountry}`;
    changesByCountry[key] = (changesByCountry[key] || 0) + 1;
  });

  console.log("📋 CAMBIOS POR PAÍS:");
  Object.entries(changesByCountry)
    .sort((a: any, b: any) => b[1] - a[1])
    .forEach(([change, count]) => {
      console.log(`   ${change}: ${count} área${count > 1 ? "s" : ""}`);
    });
  console.log("");

  // 5. Mostrar detalle de las áreas a cambiar
  if (changes.length <= 20) {
    console.log("📝 DETALLE DE ÁREAS A CORREGIR:");
    changes.forEach((change: any, index: any) => {
      console.log(`\n${index + 1}. ${change.area.nombre}`);
      console.log(`   País:      ${change.oldCountry} → ${change.newCountry}`);
      if (change.newProvince)
        console.log(`   Provincia: ${change.newProvince}`);
      if (change.newCity) console.log(`   Ciudad:    ${change.newCity}`);
      console.log(
        `   Creada:    ${new Date(change.area.created_at).toLocaleString(
          "es-ES"
        )}`
      );
    });
    console.log("");
  }

  // 6. Aplicar cambios si se especificó --apply
  if (applyChanges) {
    console.log("💾 Aplicando cambios a la base de datos...\n");

    let applied = 0;
    let failed = 0;

    for (const change of changes) {
      try {
        const updateData: any = {
          pais: change.newCountry,
        };

        // Solo actualizar provincia y ciudad si están vacías o son NULL
        if (
          change.newProvince &&
          (!change.area.provincia || change.area.provincia.trim() === "")
        ) {
          updateData.provincia = change.newProvince;
        }
        if (
          change.newCity &&
          (!change.area.ciudad || change.area.ciudad.trim() === "")
        ) {
          updateData.ciudad = change.newCity;
        }

        const { error: updateError } = await (supabase as any).from("areas")
          .update(updateData)
          .eq("id", change.area.id);

        if (updateError) {
          console.error(
            `❌ Error actualizando ${change.area.nombre}:`,
            updateError.message
          );
          failed++;
        } else {
          applied++;
          console.log(
            `✅ ${change.area.nombre}: ${change.oldCountry} → ${change.newCountry}`
          );
        }
      } catch (error: any) {
        console.error(
          `❌ Error actualizando ${change.area.nombre}:`,
          error.message
        );
        failed++;
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ CAMBIOS APLICADOS");
    console.log("=".repeat(70));
    console.log(`Actualizadas correctamente: ${applied}`);
    console.log(`Errores:                    ${failed}`);
    console.log("=".repeat(70) + "\n");
  } else {
    console.log("👀 Modo DRY RUN - No se aplicaron cambios");
    console.log("   Para aplicar los cambios, ejecuta:");
    console.log("   npm run db:fix:countries:today -- --apply\n");
  }
}

// Ejecutar
fixCountriesToday()
  .then(() => {
    console.log("✅ Script completado\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
