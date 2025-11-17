import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para el navegador
 * Configurado con sesión persistente extendida para mantener usuarios logueados
 * Las opciones de auth se manejan automáticamente por createBrowserClient
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
