import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: any) {
          // Detectar si estamos en producción
          const isProduction = typeof window !== 'undefined' && 
            (window.location.hostname === 'www.mapafurgocasa.com' || 
             window.location.hostname === 'mapafurgocasa.com' ||
             window.location.hostname.includes('amplifyapp.com'))
          
          // Configurar cookies con atributos correctos para móviles
          const cookieOptions = [
            `${name}=${value}`,
            'path=/',
            'max-age=31536000',
            'SameSite=Lax',
          ]
          
          // Agregar Secure solo en producción (HTTPS)
          if (isProduction) {
            cookieOptions.push('Secure')
          }
          
          document.cookie = cookieOptions.join('; ')
        },
        remove(name: string, options: any) {
          const isProduction = typeof window !== 'undefined' && 
            (window.location.hostname === 'www.mapafurgocasa.com' || 
             window.location.hostname === 'mapafurgocasa.com' ||
             window.location.hostname.includes('amplifyapp.com'))
          
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
}
