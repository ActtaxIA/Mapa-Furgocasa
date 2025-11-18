import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

// POST: Extraer datos de un anuncio a partir de una URL
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    const { data: userData } = await supabase.auth.getUser();
    const isAdmin = userData?.user?.user_metadata?.is_admin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { url, preview } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL es requerida" },
        { status: 400 }
      );
    }

    console.log("🔗 [Extract] Extrayendo datos de URL:", url);
    console.log("👁️ [Extract] Modo preview:", preview ? "SÍ (solo extraer)" : "NO (extraer y guardar)");

    // 1. Hacer fetch del HTML de la página
    let htmlContent = "";
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      htmlContent = await response.text();
      console.log("✅ [Extract] HTML obtenido:", htmlContent.length, "caracteres");
    } catch (fetchError: any) {
      console.error("❌ [Extract] Error obteniendo HTML:", fetchError);
      return NextResponse.json(
        { error: `Error al obtener la página: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // 2. Extraer texto visible del HTML (simplificado)
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Eliminar scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Eliminar styles
      .replace(/<[^>]+>/g, " ") // Eliminar tags HTML
      .replace(/\s+/g, " ") // Normalizar espacios
      .trim();

    // Limitar a primeros 10000 caracteres para no saturar OpenAI
    const textSnippet = textContent.substring(0, 10000);

    console.log("📄 [Extract] Texto extraído:", textSnippet.length, "caracteres");

    // 3. Usar OpenAI para extraer datos estructurados
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Eres un experto extractor de datos de anuncios de autocaravanas/furgonetas camper.

A partir del siguiente texto de un anuncio, extrae la siguiente información:

- marca: Marca de la autocaravana (ej: Adria, Weinsberg, Giottivan, Hymer, Bürstner, Fiat, Peugeot, etc.)
- modelo: Modelo completo (ej: Twin Plus 600, Cara One 550, MC Louis Menfys Van 3, etc.)
- año: Año de fabricación (número de 4 dígitos)
- precio: Precio de venta en euros (número entero, sin símbolos)
- kilometros: Kilometraje actual (número entero, sin símbolos)
- estado: Estado del vehículo (ej: "Usado", "Seminuevo", "Como nuevo", "Ocasión")

REGLAS IMPORTANTES:
1. Si no encuentras un dato, devuelve null para ese campo
2. Para el precio, si ves "desde" o "a partir de", usa ese valor
3. Para kilometraje, busca variantes como "km", "kms", "kilómetros"
4. El año debe ser entre 1990 y 2030
5. El precio debe ser mayor a 5000€
6. Devuelve SOLO un objeto JSON válido, sin texto adicional

TEXTO DEL ANUNCIO:
${textSnippet}

Responde en formato JSON con la estructura exacta:
{
  "marca": "...",
  "modelo": "...",
  "año": ...,
  "precio": ...,
  "kilometros": ...,
  "estado": "..."
}`;

    let extractedData: any = null;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto extractor de datos de anuncios de vehículos.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || "";
      console.log("🤖 [Extract] Respuesta OpenAI:", aiResponse);

      // Intentar parsear JSON
      try {
        // Limpiar posible markdown
        const cleanedResponse = aiResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        extractedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("❌ [Extract] Error parseando JSON de OpenAI:", parseError);
        return NextResponse.json(
          { error: "No se pudo extraer datos válidos del anuncio" },
          { status: 400 }
        );
      }
    } catch (aiError: any) {
      console.error("❌ [Extract] Error llamando OpenAI:", aiError);
      return NextResponse.json(
        { error: `Error de IA: ${aiError.message}` },
        { status: 500 }
      );
    }

    // 4. Validar datos extraídos
    if (!extractedData.marca || !extractedData.precio) {
      console.warn("⚠️ [Extract] Datos insuficientes:", extractedData);
      return NextResponse.json(
        { error: "No se pudo extraer marca y precio del anuncio" },
        { status: 400 }
      );
    }

    // 4.5 🚗 REGLA ESPECIAL: Si es NUEVO → año actual y 0 km
    const estadoLower = (extractedData.estado || "").toLowerCase();
    const esNuevo = estadoLower.includes("nueva") || 
                    estadoLower.includes("nuevo") || 
                    estadoLower.includes("0 km") ||
                    estadoLower.includes("sin estrenar");

    if (esNuevo) {
      const añoActual = new Date().getFullYear();
      console.log(`🆕 [Extract] Detectado vehículo NUEVO → Aplicando reglas especiales`);
      
      // Año = año actual (o año extraído si es mayor, porque puede ser modelo futuro)
      if (!extractedData.año || extractedData.año < añoActual) {
        console.log(`   📅 Año ajustado: ${extractedData.año || "null"} → ${añoActual}`);
        extractedData.año = añoActual;
      }
      
      // Kilómetros = 0 (vehículo nuevo)
      if (!extractedData.kilometros || extractedData.kilometros > 100) {
        console.log(`   🚗 Kilómetros ajustados: ${extractedData.kilometros || "null"} → 0`);
        extractedData.kilometros = 0;
      }
      
      // Asegurar que el estado diga claramente "Nuevo"
      if (!extractedData.estado || estadoLower === "nueva" || estadoLower === "nuevo") {
        extractedData.estado = "Nuevo";
      }
    }

    // 5. Si es preview, devolver datos SIN guardar
    if (preview) {
      console.log("👁️ [Extract] Modo preview - devolviendo datos sin guardar");
      return NextResponse.json({
        success: true,
        preview: true,
        ...extractedData,
      });
    }

    // 6. Si NO es preview, guardar en datos_mercado_autocaravanas
    console.log("💾 [Extract] Guardando en base de datos...");
    const dataToInsert = {
      marca: extractedData.marca || null,
      modelo: extractedData.modelo || null,
      año: extractedData.año || null,
      precio: extractedData.precio || null,
      kilometros: extractedData.kilometros || null,
      fecha_transaccion: new Date().toISOString().split("T")[0],
      verificado: true, // Se considera verificado porque viene de una URL real
      estado: extractedData.estado || "Usado",
      origen: `URL Manual`,
      tipo_dato: "Extracción Manual Admin",
      pais: "España",
      tipo_combustible: null,
      tipo_calefaccion: null,
      homologacion: null,
      region: null,
    };

    const { data: insertedData, error: insertError } = await (supabase as any)
      .from("datos_mercado_autocaravanas")
      .insert(dataToInsert)
      .select()
      .single();

    if (insertError) {
      console.error("❌ [Extract] Error insertando dato:", insertError);
      console.error("❌ [Extract] Detalles del error:", insertError);
      return NextResponse.json(
        { 
          error: "Error al guardar datos en la base de datos",
          details: insertError.message,
          code: insertError.code,
        },
        { status: 500 }
      );
    }

    console.log("✅ [Extract] Dato guardado exitosamente:", insertedData.id);

    return NextResponse.json({
      success: true,
      ...extractedData,
      id: insertedData.id,
    });
  } catch (error: any) {
    console.error("❌ Error en POST /api/admin/datos-mercado/extract:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
