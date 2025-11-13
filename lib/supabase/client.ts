import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

// Singleton pattern: almacenar la instancia del cliente para reutilizarla
// Esto evita crear múltiples instancias de GoTrueClient que causan warnings
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Si ya existe una instancia, reutilizarla
  if (supabaseClient) {
    return supabaseClient
  }

  // Crear nueva instancia solo si no existe
  // Verificar que estamos en el navegador antes de crear
  if (typeof window === 'undefined') {
    throw new Error('createClient() solo puede ser llamado en el navegador')
  }

  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Verificar que estamos en el navegador
          if (typeof document === 'undefined') return undefined

          // Decodificar URI para manejar valores especiales
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1]
          return cookie ? decodeURIComponent(cookie) : undefined
        },
        set(name: string, value: string, options: any) {
          // Verificar que estamos en el navegador
          if (typeof document === 'undefined') return

          // Detectar si estamos en producción (HTTPS)
          const isProduction = typeof window !== 'undefined' &&
            window.location.protocol === 'https:'

          // Encodear el valor para manejar caracteres especiales
          const encodedValue = encodeURIComponent(value)

          // Configurar cookies con atributos correctos
          const cookieOptions = [
            `${name}=${encodedValue}`,
            'path=/',
            `max-age=${options?.maxAge || 31536000}`, // 1 año por defecto
            'SameSite=Lax',
          ]

          // Agregar Secure en producción (HTTPS)
          if (isProduction) {
            cookieOptions.push('Secure')
          }

          document.cookie = cookieOptions.join('; ')
        },
        remove(name: string, options: any) {
          // Verificar que estamos en el navegador
          if (typeof document === 'undefined') return

          const isProduction = typeof window !== 'undefined' &&
            window.location.protocol === 'https:'

          const cookieOptions = [
            `${name}=`,
            'path=/',
            'max-age=0',
            'SameSite=Lax',
          ]

          if (isProduction) {
            cookieOptions.push('Secure')
          }

          document.cookie = cookieOptions.join('; ')
        },
      },
    }
  )

  return supabaseClient
}
