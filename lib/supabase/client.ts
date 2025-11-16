import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Verificar que estamos en el navegador
          if (typeof document === "undefined") return undefined;

          // Decodificar URI para manejar valores especiales
          const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`))
            ?.split("=")[1];
          return cookie ? decodeURIComponent(cookie) : undefined;
        },
        set(name: string, value: string, options: any) {
          // Verificar que estamos en el navegador
          if (typeof document === "undefined") return;

          // Detectar si estamos en producción (HTTPS)
          const isProduction =
            typeof window !== "undefined" &&
            window.location.protocol === "https:";

          // Encodear el valor para manejar caracteres especiales
          const encodedValue = encodeURIComponent(value);

          // Configurar cookies con atributos correctos para móviles
          const cookieOptions = [
            `${name}=${encodedValue}`,
            "path=/",
            `max-age=${options?.maxAge || 31536000}`, // 1 año por defecto
            "SameSite=Lax",
          ];

          // Agregar Secure en producción (HTTPS) - CRÍTICO para móviles
          if (isProduction) {
            cookieOptions.push("Secure");

            // Añadir dominio para que funcione en subdominios (importante para móviles)
            if (typeof window !== "undefined") {
              const hostname = window.location.hostname;
              // Solo añadir domain si NO es localhost y es el dominio principal
              if (
                !hostname.includes("localhost") &&
                hostname.includes("mapafurgocasa.com")
              ) {
                cookieOptions.push(`domain=.mapafurgocasa.com`);
              }
            }
          }

          document.cookie = cookieOptions.join("; ");
        },
        remove(name: string, options: any) {
          // Verificar que estamos en el navegador
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
