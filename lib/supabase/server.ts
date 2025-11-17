import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Forzar cookies de larga duración (30 días)
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              maxAge: options.maxAge || 2592000, // 30 días por defecto
              sameSite: (options.sameSite as 'lax' | 'strict' | 'none') || 'lax',
              secure: true,
            })
          } catch (error) {
            // El método `set` fue llamado desde un Server Component.
            // Esto puede ser ignorado si tienes middleware refrescando
            // las sesiones de usuario.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // El método `delete` fue llamado desde un Server Component.
            // Esto puede ser ignorado si tienes middleware refrescando
            // las sesiones de usuario.
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  )
}

// Cliente público sin autenticación (para endpoints públicos como reportes)
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

// Cliente con Service Role (bypasea RLS completamente)
// USAR SOLO para operaciones públicas que no exponen datos sensibles
// Como crear reportes de accidentes desde usuarios anónimos
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}
