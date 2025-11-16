/**
 * 📊 MONITOR DE PROGRESO - Importación LATAM
 * ============================================================================
 * 
 * Este script monitorea en tiempo real el progreso de la importación masiva
 * de áreas de LATAM consultando la base de datos cada pocos segundos.
 * 
 * USO:
 *   npm run monitor:import
 * 
 * REQUISITOS:
 *   - Variables de Supabase configuradas
 *   - Script de importación ejecutándose
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

interface AreasPorPais {
  pais: string;
  total: number;
  ultimaCreada: string;
}

let previousTotal = 0;
let startTime = Date.now();
let areasIniciales = 0;

async function getAreaStats(): Promise<{
  total: number;
  porPais: AreasPorPais[];
  ultimasAreas: any[];
}> {
  // Total de áreas
  const { count: total } = await (supabase as any).from("areas")
    .select("*", { count: "exact", head: true })
    .eq("activo", true);

  // Áreas por país (LATAM)
  const paisesLATAM = [
    "Argentina",
    "Uruguay",
    "Chile",
    "Perú",
    "Bolivia",
    "Paraguay",
    "Colombia",
    "Ecuador",
    "Venezuela",
    "Panamá",
    "Costa Rica",
    "Nicaragua",
    "Honduras",
    "El Salvador",
    "Guatemala",
    "México",
    "Cuba",
    "República Dominicana",
  ];

  const porPais: AreasPorPais[] = [];

  for (const pais of paisesLATAM) {
    const { data, error } = await (supabase as any).from("areas")
      .select("created_at")
      .eq("activo", true)
      .eq("pais", pais)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const { count } = await (supabase as any).from("areas")
        .select("*", { count: "exact", head: true })
        .eq("activo", true)
        .eq("pais", pais);

      if (count && count > 0) {
        porPais.push({
          pais,
          total: count,
          ultimaCreada: data[0].created_at,
        });
      }
    }
  }

  // Últimas 10 áreas creadas
  const { data: ultimasAreas } = await (supabase as any).from("areas")
    .select("nombre, pais, ciudad, created_at")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    total: total || 0,
    porPais: porPais.sort((a, b) => b.total - a.total),
    ultimasAreas: ultimasAreas || [],
  };
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function clearConsole() {
  console.clear();
}

async function monitorProgress() {
  console.log("🔄 Iniciando monitor de progreso...\n");

  // Obtener estadísticas iniciales
  const statsIniciales = await getAreaStats();
  areasIniciales = statsIniciales.total;
  previousTotal = areasIniciales;

  console.log(`📊 Áreas iniciales: ${areasIniciales}`);
  console.log("⏱️  Iniciando monitoreo cada 10 segundos...\n");

  // Monitorear cada 10 segundos
  setInterval(async () => {
    try {
      const stats = await getAreaStats();
      const elapsed = Date.now() - startTime;
      const nuevasAreas = stats.total - areasIniciales;
      const areasUltimos10s = stats.total - previousTotal;
      previousTotal = stats.total;

      // Calcular velocidad
      const velocidadPorMinuto = (nuevasAreas / (elapsed / 1000)) * 60;

      clearConsole();

      console.log("=".repeat(90));
      console.log("📊 MONITOR DE IMPORTACIÓN MASIVA - LATINOAMÉRICA");
      console.log("=".repeat(90));
      console.log(`🕐 Tiempo transcurrido:       ${formatDuration(elapsed)}`);
      console.log(`📈 Áreas iniciales:          ${areasIniciales}`);
      console.log(`📊 Áreas actuales:           ${stats.total}`);
      console.log(`✨ Áreas nuevas importadas:  ${nuevasAreas}`);
      console.log(`⚡ Últimos 10 segundos:      +${areasUltimos10s} áreas`);
      console.log(`🚀 Velocidad promedio:       ${velocidadPorMinuto.toFixed(1)} áreas/min`);
      console.log("=".repeat(90));

      if (stats.porPais.length > 0) {
        console.log("\n📍 ÁREAS POR PAÍS (LATAM):\n");
        console.log(
          `${"País".padEnd(25)} ${"Total".padEnd(10)} ${"Última actualización"}`
        );
        console.log("-".repeat(90));

        stats.porPais.forEach((p) => {
          const fecha = new Date(p.ultimaCreada);
          const hace = Math.floor((Date.now() - fecha.getTime()) / 1000);
          let tiempoStr = "";

          if (hace < 60) {
            tiempoStr = `hace ${hace}s`;
          } else if (hace < 3600) {
            tiempoStr = `hace ${Math.floor(hace / 60)}m`;
          } else {
            tiempoStr = `hace ${Math.floor(hace / 3600)}h`;
          }

          console.log(
            `${p.pais.padEnd(25)} ${p.total.toString().padEnd(10)} ${tiempoStr}`
          );
        });
      }

      if (stats.ultimasAreas.length > 0) {
        console.log("\n🆕 ÚLTIMAS 10 ÁREAS IMPORTADAS:\n");

        stats.ultimasAreas.forEach((area, index) => {
          const fecha = new Date(area.created_at);
          const hace = Math.floor((Date.now() - fecha.getTime()) / 1000);
          let tiempoStr = "";

          if (hace < 60) {
            tiempoStr = `${hace}s`;
          } else if (hace < 3600) {
            tiempoStr = `${Math.floor(hace / 60)}m`;
          } else {
            tiempoStr = `${Math.floor(hace / 3600)}h`;
          }

          console.log(
            `${(index + 1).toString().padStart(2)}. [${tiempoStr.padStart(
              5
            )}] ${area.nombre.substring(0, 45).padEnd(45)} | ${area.pais} ${
              area.ciudad ? `- ${area.ciudad}` : ""
            }`
          );
        });
      }

      console.log("\n" + "=".repeat(90));
      console.log("💡 Presiona Ctrl+C para detener el monitor");
      console.log("=".repeat(90) + "\n");

      // Detectar si el script ha terminado (sin nuevas áreas en 2 minutos)
      if (areasUltimos10s === 0 && nuevasAreas > 0) {
        // Verificar si han pasado más de 2 minutos sin cambios
        const ultimaFecha = new Date(stats.ultimasAreas[0]?.created_at);
        const minutosSinCambios = (Date.now() - ultimaFecha.getTime()) / 1000 / 60;

        if (minutosSinCambios > 2) {
          console.log("\n⚠️  No se han detectado nuevas áreas en los últimos 2 minutos.");
          console.log("   El script de importación podría haber finalizado.\n");
        }
      }
    } catch (error: any) {
      console.error("❌ Error en monitoreo:", error.message);
    }
  }, 10000); // Cada 10 segundos
}

// Manejar Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\n⏸️  Monitor detenido por el usuario");
  console.log(`📊 Resumen final:`);
  console.log(`   Tiempo total: ${formatDuration(Date.now() - startTime)}`);
  console.log(`   Áreas importadas: ${previousTotal - areasIniciales}`);
  console.log("\n✅ Monitor finalizado\n");
  process.exit(0);
});

// Ejecutar
console.clear();
monitorProgress();

