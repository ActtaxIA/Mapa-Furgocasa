import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para el navegador (Singleton Global Pattern)
 *
 * IMPORTANTE:
 * - Solo crea UNA instancia global por toda la aplicación
 * - Elimina el warning "Multiple GoTrueClient instances detected"
 * - Compatible con React Strict Mode (renderiza 2 veces)
 * - La sesión persiste 30 días
 * - Compatible con signInWithPassword, signInWithOAuth, setSession
 */

// Declarar tipo global para TypeScript
declare global {
  var __supabase_browser_client: ReturnType<typeof createBrowserClient<Database>> | undefined;
}

export function createClient() {
  // Si ya existe en el scope global del navegador, reutilizarla
  if (typeof window !== 'undefined' && globalThis.__supabase_browser_client) {
    return globalThis.__supabase_browser_client;
  }

  // Crear nueva instancia solo si no existe
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Guardar en scope global solo en el navegador
  if (typeof window !== 'undefined') {
    globalThis.__supabase_browser_client = client;
  }

  return client;
}
