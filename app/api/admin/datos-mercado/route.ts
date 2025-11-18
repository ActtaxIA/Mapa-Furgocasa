import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Listar todos los datos de mercado (solo admins)
export async function GET() {
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

    // Obtener todos los datos de mercado ordenados por fecha desc
    const { data: datos, error } = await (supabase as any)
      .from("datos_mercado_autocaravanas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo datos de mercado:", error);
      return NextResponse.json(
        { error: "Error al obtener datos de mercado" },
        { status: 500 }
      );
    }

    return NextResponse.json({ datos: datos || [] });
  } catch (error: any) {
    console.error("Error en GET /api/admin/datos-mercado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

