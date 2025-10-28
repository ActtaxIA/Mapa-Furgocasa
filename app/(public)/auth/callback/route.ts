import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/mapa'

  if (code) {
    const cookieStore = await cookies()
    
    // 🔥 FORZAR redirección a producción si NO estamos en localhost
    const isLocalhost = request.nextUrl.hostname === 'localhost' || 
                       request.nextUrl.hostname === '127.0.0.1'
    
    let redirectUrl: URL
    if (isLocalhost) {
      // Desarrollo: usar localhost
      redirectUrl = new URL(next, request.url)
    } else {
      // Producción: SIEMPRE redirigir a www.mapafurgocasa.com
      redirectUrl = new URL(next, 'https://www.mapafurgocasa.com')
    }
    
    // Crear respuesta para poder establecer cookies
    const response = NextResponse.redirect(redirectUrl)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Establecer en cookieStore
            cookieStore.set({
              name,
              value,
              ...options,
              path: options.path || '/',
              sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
              secure: request.headers.get('x-forwarded-proto') === 'https' || 
                      request.nextUrl.protocol === 'https:',
              httpOnly: options.httpOnly ?? false,
              maxAge: options.maxAge || 31536000, // 1 año
            })
            
            // También establecer en la respuesta
            response.cookies.set({
              name,
              value,
              ...options,
              path: options.path || '/',
              sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
              secure: request.headers.get('x-forwarded-proto') === 'https' || 
                      request.nextUrl.protocol === 'https:',
              httpOnly: options.httpOnly ?? false,
              maxAge: options.maxAge || 31536000,
            })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              path: options.path || '/',
              maxAge: 0,
            })
            
            response.cookies.set({
              name,
              value: '',
              ...options,
              path: options.path || '/',
              maxAge: 0,
            })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Retornar respuesta con cookies establecidas
      return response
    }
  }

  // Si hay un error o no hay código, redirigir al login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}

