import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * CRÍTICO: NO usar singleton global
 * Cada llamada crea una instancia NUEVA con su propia sesión
 * Esto evita que las sesiones se compartan entre usuarios
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Configuración segura de autenticación
        flowType: 'pkce', // Usar PKCE para mayor seguridad
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // NO especificar storage - dejar que Supabase use el default (localStorage)
        // pero de forma aislada por instancia
      },
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
}
