import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Usar globalThis para singleton VERDADERO entre módulos
declare global {
  var __supabase_client: SupabaseClient<Database> | undefined;
}

export function createClient() {
  // Reutilizar instancia global si existe
  if (globalThis.__supabase_client) {
    return globalThis.__supabase_client;
  }

  // Crear nueva instancia y guardarla globalmente
  globalThis.__supabase_client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === "undefined") return undefined;
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`))
            ?.split("=")[1];
          return cookie ? decodeURIComponent(cookie) : undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document === "undefined") return;

          const isProduction =
            typeof window !== "undefined" &&
            window.location.protocol === "https:";

          const encodedValue = encodeURIComponent(value);

          const cookieOptions = [
            `${name}=${encodedValue}`,
            "path=/",
            `max-age=${options?.maxAge || 31536000}`,
            "SameSite=Lax",
          ];

          if (isProduction) {
            cookieOptions.push("Secure");
            // NO establecer domain - dejar que el navegador lo maneje automáticamente
            // Esto evita problemas de cookies entre dominios en móviles
          }

          document.cookie = cookieOptions.join("; ");
        },
        remove(name: string, options: any) {
          if (typeof document === "undefined") return;

          const isProduction =
            typeof window !== "undefined" &&
            window.location.protocol === "https:";

          const cookieOptions = [
            `${name}=`,
            "path=/",
            "max-age=0",
            "SameSite=Lax",
          ];

          if (isProduction) {
            cookieOptions.push("Secure");
          }

          document.cookie = cookieOptions.join("; ");
        },
      },
    }
  );

  return globalThis.__supabase_client;
}
