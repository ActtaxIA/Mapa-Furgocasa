import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: Guardar datos extraídos y confirmados por el admin
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

    // Obtener datos del body
    const extractedData = await request.json();

    console.log("💾 [Save] Guardando datos confirmados:", extractedData);

    // Validar que tengan al menos marca y precio
    if (!extractedData.marca || !extractedData.precio) {
      return NextResponse.json(
        { error: "Marca y precio son obligatorios" },
        { status: 400 }
      );
    }

    // Preparar datos para insertar
    const dataToInsert = {
      marca: extractedData.marca || null,
      modelo: extractedData.modelo || null,
      chasis: extractedData.chasis || null,
      año: extractedData.año || null,
      precio: extractedData.precio || null,
      kilometros: extractedData.kilometros || null,
      fecha_transaccion: new Date().toISOString().split("T")[0],
      verificado: true, // Confirmado por admin
      estado: extractedData.estado || "Usado",
      origen: "URL Manual",
      tipo_dato: "Extracción Manual Admin",
      pais: "España",
      tipo_combustible: null,
      tipo_calefaccion: null,
      homologacion: null,
      region: null,
    };

    console.log("📊 [Save] Datos a insertar:", dataToInsert);

    // Guardar en BD
    const { data: insertedData, error: insertError } = await (supabase as any)
      .from("datos_mercado_autocaravanas")
      .insert(dataToInsert)
      .select()
      .single();

    if (insertError) {
      console.error("❌ [Save] Error insertando dato:", insertError);
      return NextResponse.json(
        {
          error: "Error al guardar datos en la base de datos",
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint,
        },
        { status: 500 }
      );
    }

    console.log("✅ [Save] Dato guardado exitosamente:", insertedData.id);

    return NextResponse.json({
      success: true,
      id: insertedData.id,
      ...insertedData,
    });
  } catch (error: any) {
    console.error("❌ Error en POST /api/admin/datos-mercado/save:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

