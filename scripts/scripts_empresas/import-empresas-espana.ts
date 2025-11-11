/**
 * 🇪🇸 BÚSQUEDA MASIVA DE EMPRESAS - ESPAÑA
 * ============================================================================
 *
 * Este script recorre España buscando empresas del sector autocaravanas:
 * - Alquiler de autocaravanas
 * - Concesionarios / Venta
 * - Camperización de furgonetas
 * - Campings especializados
 *
 * ESTRATEGIA:
 * - Divide España en cuadrículas geográficas (~55km)
 * - Busca múltiples términos en cada cuadrícula
 * - Detecta y evita duplicados (7 criterios)
 * - Obtiene: Nombre, Dirección, Teléfono, Website
 * - Extrae emails mediante scraping básico (cuando es posible)
 * - Genera CSV con todos los resultados
 *
 * USO:
 *   npm run import:empresas:dry     # Modo estimación (sin importar)
 *   npm run import:empresas         # Ejecutar búsqueda completa
 *   npm run import:empresas -- --limit=100  # Máximo 100 empresas
 *
 * COSTOS ESTIMADOS:
 *   - ~400-600 búsquedas en Google Places API
 *   - Costo aproximado: $30-50 USD
 *   - Tiempo estimado: 1-2 horas
 *
 * RESULTADO:
 *   Archivo CSV: empresas-autocaravanas-espana-[fecha].csv
 *   Columnas: Nombre | Dirección | Provincia | Teléfono | Website | Email
 *
 * REQUISITOS:
 *   - Variables de entorno NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

// Configurar Google API
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!googleApiKey) {
  console.error("❌ Error: Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  process.exit(1);
}

// ============================================================================
// CONFIGURACIÓN GEOGRÁFICA
// ============================================================================

interface Region {
  nombre: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  gridSize: number; // Tamaño de cuadrícula en grados
}

const ESPAÑA: Region = {
  nombre: "España",
  bounds: {
    north: 43.79, // Norte de España (Galicia)
    south: 36.0, // Sur (Andalucía, sin Canarias)
    east: 4.33, // Este (Cataluña)
    west: -9.3, // Oeste (Galicia)
  },
  gridSize: 0.5, // ~55km de cuadrícula
};

// Términos de búsqueda específicos para empresas
const TERMINOS_BUSQUEDA_EMPRESAS = [
  "alquiler autocaravanas",
  "alquiler camper",
  "concesionario autocaravanas",
  "venta autocaravanas",
  "camperización furgonetas",
  "taller camperización",
  "camping autocaravanas",
];

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Grid {
  north: number;
  south: number;
  east: number;
  west: number;
  center: { lat: number; lng: number };
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  website?: string | null;
  phone?: string | null;
}

interface Empresa {
  nombre: string;
  direccion: string;
  provincia: string;
  ciudad: string;
  telefono: string;
  website: string;
  email: string;
  rating: string;
  placeId: string;
}

interface Stats {
  busquedasRealizadas: number;
  resultadosEncontrados: number;
  empresasNuevas: number;
  empresasDuplicadas: number;
  emailsEncontrados: number;
  costoEstimado: number;
}

// ============================================================================
// CACHÉ DE EMPRESAS (EVITAR DUPLICADOS)
// ============================================================================

const empresasEncontradas = new Map<string, Empresa>();
const placeIdsSet = new Set<string>();
const slugsSet = new Set<string>();
const normalizedNamesSet = new Set<string>();

// ============================================================================
// UTILIDADES
// ============================================================================

function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSlug(text: string): string {
  return normalizeText(text).replace(/\s+/g, "-");
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// EXTRACCIÓN DE EMAILS DESDE WEBSITE
// ============================================================================

async function extractEmailFromWebsite(
  websiteUrl: string
): Promise<string | null> {
  if (!websiteUrl) return null;

  try {
    // Timeout de 5 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();

    // Regex para encontrar emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const matches = html.match(emailRegex);

    if (!matches || matches.length === 0) return null;

    // Filtrar emails comunes de redes sociales, imágenes, etc.
    const filteredEmails = matches.filter(
      (email) =>
        !email.includes("@sentry") &&
        !email.includes("@example") &&
        !email.includes("@placeholder") &&
        !email.includes("wixpress") &&
        !email.includes("facebook") &&
        !email.includes("twitter") &&
        !email.includes("linkedin") &&
        !email.includes("instagram") &&
        !email.includes(".png") &&
        !email.includes(".jpg")
    );

    if (filteredEmails.length === 0) return null;

    // Devolver el primer email válido
    return filteredEmails[0].toLowerCase();
  } catch (error: any) {
    // Timeout o error de red
    return null;
  }
}

// ============================================================================
// DETECCIÓN DE DUPLICADOS
// ============================================================================

function checkIfEmpresaExists(place: PlaceResult): boolean {
  // 1. Por Google Place ID
  if (place.place_id && placeIdsSet.has(place.place_id)) {
    return true;
  }

  // 2. Por slug
  const placeSlug = generateSlug(place.name);
  if (placeSlug && slugsSet.has(placeSlug)) {
    return true;
  }

  // 3. Por nombre normalizado
  const placeNormalizedName = normalizeText(place.name);
  if (placeNormalizedName && normalizedNamesSet.has(placeNormalizedName)) {
    return true;
  }

  // 4. Por coordenadas (radio 500m)
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;

  if (lat && lng) {
    for (const [_, empresa] of empresasEncontradas) {
      // Extraer coordenadas aproximadas (si las guardamos)
      // Por simplicidad, asumimos que direcciones iguales = duplicado
      if (normalizeText(empresa.direccion) === normalizeText(place.formatted_address)) {
        return true;
      }
    }
  }

  // 5. Similitud de nombre (Fuzzy Matching)
  const placeWords = new Set(
    placeNormalizedName.split(" ").filter((w) => w.length > 3)
  );

  for (const [_, empresa] of empresasEncontradas) {
    const empresaWords = new Set(
      normalizeText(empresa.nombre)
        .split(" ")
        .filter((w) => w.length > 3)
    );

    if (placeWords.size > 0 && empresaWords.size > 0) {
      const intersection = new Set(
        [...placeWords].filter((w) => empresaWords.has(w))
      );
      const similarity =
        intersection.size / Math.max(placeWords.size, empresaWords.size);

      if (similarity >= 0.8) {
        return true;
      }
    }
  }

  return false;
}

// ============================================================================
// GENERACIÓN DE CUADRÍCULA
// ============================================================================

function createGrid(bounds: Region["bounds"], gridSize: number): Grid[] {
  const grids: Grid[] = [];

  for (let lat = bounds.south; lat < bounds.north; lat += gridSize) {
    for (let lng = bounds.west; lng < bounds.east; lng += gridSize) {
      const grid: Grid = {
        south: lat,
        north: Math.min(lat + gridSize, bounds.north),
        west: lng,
        east: Math.min(lng + gridSize, bounds.east),
        center: {
          lat: lat + gridSize / 2,
          lng: lng + gridSize / 2,
        },
      };
      grids.push(grid);
    }
  }

  return grids;
}

// ============================================================================
// BÚSQUEDA EN GOOGLE PLACES API
// ============================================================================

async function searchInBounds(
  query: string,
  bounds: Grid
): Promise<PlaceResult[]> {
  try {
    // Calcular radio desde el centro
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const radiusKm =
      (Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111) / 2;
    const radiusMeters = Math.min(radiusKm * 1000, 50000); // Máximo 50km

    // Usar Nearby Search API
    const searchUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    );
    searchUrl.searchParams.append(
      "location",
      `${bounds.center.lat},${bounds.center.lng}`
    );
    searchUrl.searchParams.append("radius", radiusMeters.toString());
    searchUrl.searchParams.append("keyword", query);
    searchUrl.searchParams.append("key", googleApiKey!);
    searchUrl.searchParams.append("language", "es");

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      console.error(`❌ Error HTTP ${response.status} en búsqueda: ${query}`);
      return [];
    }

    const data: any = await response.json();

    if (data.status === "ZERO_RESULTS") {
      return [];
    }

    if (data.status !== "OK") {
      console.error(
        `⚠️  API Status: ${data.status} - ${data.error_message || ""}`
      );
      return [];
    }

    let allResults = data.results || [];

    // Obtener páginas adicionales (hasta 60 resultados)
    let nextPageToken = data.next_page_token;
    let pagesProcessed = 1;

    while (nextPageToken && pagesProcessed < 3) {
      await delay(2000); // Delay requerido por Google

      const nextPageUrl = new URL(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
      );
      nextPageUrl.searchParams.append("key", googleApiKey!);
      nextPageUrl.searchParams.append("pagetoken", nextPageToken);

      const nextResponse = await fetch(nextPageUrl.toString());

      if (nextResponse.ok) {
        const nextData: any = await nextResponse.json();

        if (nextData.status === "OK" && nextData.results) {
          allResults = [...allResults, ...nextData.results];
          nextPageToken = nextData.next_page_token;
          pagesProcessed++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Enriquecer con Place Details
    const enrichedResults: PlaceResult[] = [];

    for (const place of allResults) {
      try {
        const detailsUrl = new URL(
          "https://maps.googleapis.com/maps/api/place/details/json"
        );
        detailsUrl.searchParams.append("place_id", place.place_id);
        detailsUrl.searchParams.append("key", googleApiKey!);
        detailsUrl.searchParams.append(
          "fields",
          "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,business_status,address_components"
        );
        detailsUrl.searchParams.append("language", "es");

        const detailsResponse = await fetch(detailsUrl.toString());

        if (detailsResponse.ok) {
          const detailsData: any = await detailsResponse.json();

          if (detailsData.status === "OK" && detailsData.result) {
            enrichedResults.push({
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              geometry: {
                location: {
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                },
              },
              types: place.types,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              business_status: place.business_status,
              website: detailsData.result.website || null,
              phone: detailsData.result.formatted_phone_number || null,
            });
          }
        }

        await delay(100); // Pequeño delay entre detalles
      } catch (error) {
        // Añadir sin detalles adicionales
        enrichedResults.push({
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          geometry: {
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
          },
          types: place.types,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          business_status: place.business_status,
          website: null,
          phone: null,
        });
      }
    }

    return enrichedResults;
  } catch (error: any) {
    console.error(`❌ Error en búsqueda: ${error.message}`);
    return [];
  }
}

// ============================================================================
// GEOCODING INVERSO (OBTENER PROVINCIA/CIUDAD)
// ============================================================================

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ province: string; city: string } | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${googleApiKey}`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return null;
    }

    const components = data.results[0].address_components;

    let province = "";
    let city = "";

    for (const component of components) {
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

    return { province: province || "Desconocido", city: city || "Desconocido" };
  } catch (error) {
    return null;
  }
}

// ============================================================================
// PROCESAR EMPRESA
// ============================================================================

async function processEmpresa(
  place: PlaceResult,
  stats: Stats
): Promise<Empresa | null> {
  try {
    // Obtener provincia y ciudad
    const location = await reverseGeocode(
      place.geometry.location.lat,
      place.geometry.location.lng
    );

    const provincia = location?.province || "Desconocido";
    const ciudad = location?.city || "Desconocido";

    // Intentar extraer email del website
    let email = "";
    if (place.website) {
      process.stdout.write(`      🔍 Extrayendo email de ${place.website}... `);
      email = (await extractEmailFromWebsite(place.website)) || "";
      if (email) {
        console.log(`✅ ${email}`);
        stats.emailsEncontrados++;
      } else {
        console.log(`⚪ No encontrado`);
      }
      await delay(500); // Delay entre scraping
    }

    const empresa: Empresa = {
      nombre: place.name,
      direccion: place.formatted_address,
      provincia: provincia,
      ciudad: ciudad,
      telefono: place.phone || "",
      website: place.website || "",
      email: email,
      rating: place.rating ? place.rating.toString() : "",
      placeId: place.place_id,
    };

    // Actualizar caché
    placeIdsSet.add(place.place_id);
    slugsSet.add(generateSlug(place.name));
    normalizedNamesSet.add(normalizeText(place.name));
    empresasEncontradas.set(place.place_id, empresa);

    return empresa;
  } catch (error: any) {
    console.error(`❌ Error procesando empresa: ${error.message}`);
    return null;
  }
}

// ============================================================================
// EXPORTAR A CSV
// ============================================================================

function exportToCSV(empresas: Empresa[], filename: string): void {
  const headers = [
    "Nombre",
    "Dirección",
    "Provincia",
    "Ciudad",
    "Teléfono",
    "Website",
    "Email",
    "Rating Google",
    "Google Place ID",
  ];

  const rows = empresas.map((e) => [
    e.nombre,
    e.direccion,
    e.provincia,
    e.ciudad,
    e.telefono,
    e.website,
    e.email,
    e.rating,
    e.placeId,
  ]);

  // Escapar comillas y comas en CSV
  const escapeCsv = (value: string) => {
    if (!value) return "";
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  // Agregar BOM para Excel UTF-8
  const bom = "\uFEFF";
  fs.writeFileSync(filename, bom + csvContent, "utf-8");

  console.log(`\n✅ Archivo CSV generado: ${filename}`);
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function importEmpresasEspana() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry") || args.includes("--dry-run");
  const limit = parseInt(
    args.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || "0"
  );

  console.log("\n" + "=".repeat(80));
  console.log("🇪🇸 BÚSQUEDA MASIVA DE EMPRESAS - ESPAÑA");
  console.log("=".repeat(80));
  console.log(`📅 Fecha: ${new Date().toLocaleString("es-ES")}`);
  console.log(
    `Modo: ${isDryRun ? "👀 DRY RUN (estimación)" : "✅ BÚSQUEDA REAL"}`
  );
  if (limit > 0) {
    console.log(`🔢 Límite: ${limit} empresas`);
  }
  console.log("=".repeat(80) + "\n");

  const stats: Stats = {
    busquedasRealizadas: 0,
    resultadosEncontrados: 0,
    empresasNuevas: 0,
    empresasDuplicadas: 0,
    emailsEncontrados: 0,
    costoEstimado: 0,
  };

  // Crear cuadrícula
  const grids = createGrid(ESPAÑA.bounds, ESPAÑA.gridSize);
  console.log(`📐 Cuadrículas generadas: ${grids.length}`);
  console.log(`🔍 Términos de búsqueda: ${TERMINOS_BUSQUEDA_EMPRESAS.length}`);
  console.log(
    `📊 Total búsquedas estimadas: ${
      grids.length * TERMINOS_BUSQUEDA_EMPRESAS.length
    }\n`
  );

  // Procesar cada cuadrícula
  for (let i = 0; i < grids.length; i++) {
    const grid = grids[i];

    console.log(
      `\n📍 Cuadrícula ${i + 1}/${
        grids.length
      } - Centro: [${grid.center.lat.toFixed(2)}, ${grid.center.lng.toFixed(
        2
      )}]`
    );

    // Buscar cada término
    for (const termino of TERMINOS_BUSQUEDA_EMPRESAS) {
      // Verificar límite
      if (limit > 0 && empresasEncontradas.size >= limit) {
        console.log(`\n⚠️  Límite alcanzado: ${limit} empresas`);
        break;
      }

      stats.busquedasRealizadas++;

      process.stdout.write(`   Buscando "${termino}"... `);

      const resultados = await searchInBounds(termino, grid);

      if (resultados.length > 0) {
        console.log(`✅ ${resultados.length} resultados`);

        stats.resultadosEncontrados += resultados.length;

        // Filtrar duplicados
        const nuevas = resultados.filter((r) => !checkIfEmpresaExists(r));

        stats.empresasNuevas += nuevas.length;
        stats.empresasDuplicadas += resultados.length - nuevas.length;

        if (nuevas.length > 0) {
          console.log(
            `      → ${nuevas.length} nuevas, ${
              resultados.length - nuevas.length
            } duplicadas`
          );

          // Procesar si no es dry-run
          if (!isDryRun) {
            for (const place of nuevas) {
              // Verificar límite nuevamente
              if (limit > 0 && empresasEncontradas.size >= limit) {
                break;
              }

              const empresa = await processEmpresa(place, stats);
              if (empresa) {
                console.log(`      ✅ Procesada: ${empresa.nombre}`);
              }
              await delay(200); // Delay entre empresas
            }
          }
        } else {
          console.log(`      → Todas son duplicadas`);
        }
      } else {
        console.log(`⚪ 0 resultados`);
      }

      // Delay entre búsquedas
      await delay(500);
    }

    // Verificar límite de cuadrícula
    if (limit > 0 && empresasEncontradas.size >= limit) {
      break;
    }
  }

  // Calcular costo estimado
  // Nearby Search: $32/1000, Place Details: $17/1000, Geocoding: $5/1000
  const costoBusquedas = (stats.busquedasRealizadas * 32) / 1000;
  const costoDetalles = (stats.resultadosEncontrados * 17) / 1000;
  const costoGeocoding = (empresasEncontradas.size * 5) / 1000;
  stats.costoEstimado = costoBusquedas + costoDetalles + costoGeocoding;

  // Resumen
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📊 RESUMEN FINAL`);
  console.log(`${"=".repeat(80)}`);
  console.log(`Búsquedas realizadas:    ${stats.busquedasRealizadas}`);
  console.log(`Resultados encontrados:  ${stats.resultadosEncontrados}`);
  console.log(`Empresas nuevas:         ${stats.empresasNuevas}`);
  console.log(`Empresas duplicadas:     ${stats.empresasDuplicadas}`);
  if (!isDryRun) {
    console.log(`Empresas procesadas:     ${empresasEncontradas.size}`);
    console.log(`Emails encontrados:      ${stats.emailsEncontrados}`);
    console.log(
      `Tasa de éxito emails:    ${
        empresasEncontradas.size > 0
          ? ((stats.emailsEncontrados / empresasEncontradas.size) * 100).toFixed(
              1
            )
          : 0
      }%`
    );
  }
  console.log(
    `Costo estimado:          $${stats.costoEstimado.toFixed(2)} USD`
  );
  console.log(`${"=".repeat(80)}\n`);

  if (isDryRun) {
    console.log(`👀 Modo DRY RUN - No se procesaron empresas`);
    console.log(`   Para ejecutar realmente, ejecuta:`);
    console.log(`   npm run import:empresas\n`);
  } else {
    // Exportar a CSV
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = path.join(
      process.cwd(),
      "scripts",
      "scripts_empresas",
      `empresas-autocaravanas-espana-${timestamp}.csv`
    );

    const empresasArray = Array.from(empresasEncontradas.values());
    exportToCSV(empresasArray, filename);

    console.log(`\n✅ Búsqueda completada`);
    console.log(
      `   Total de empresas encontradas: ${empresasEncontradas.size}`
    );
    console.log(`   Archivo generado: ${filename}\n`);
  }
}

// Ejecutar
importEmpresasEspana()
  .then(() => {
    console.log("✅ Script completado\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });

