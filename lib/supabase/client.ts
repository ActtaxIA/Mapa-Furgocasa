import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// Variable privada para mantener la instancia única (Singleton Pattern)
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

/**
 * Cliente de Supabase para el navegador (Singleton Pattern)
 *
 * IMPORTANTE:
 * - Solo crea UNA instancia por sesión del navegador
 * - Elimina el warning "Multiple GoTrueClient instances detected"
 * - NO afecta el comportamiento de login/auth
 * - La sesión sigue persistiendo 30 días
 * - Compatible con signInWithPassword, signInWithOAuth, setSession
 * - Mejora rendimiento al evitar inicializaciones múltiples
 */
export function createClient() {
  // Si ya existe una instancia, devolverla
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Si no existe, crear nueva instancia y guardarla
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseInstance;
}
