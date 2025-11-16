import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/mapa'

  console.log('🔐 [OAuth Callback]', { code: !!code, next })

  if (code) {
    const cookieStore = await cookies()

    // SIEMPRE redirigir a producción
    const redirectUrl = new URL(next, 'https://www.mapafurgocasa.com')

    // Crear respuesta ANTES para poder establecer cookies
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
              path: '/',
              sameSite: 'lax',
              secure: true,
              httpOnly: false, // FALSE para que JavaScript pueda leer las cookies
              maxAge: options.maxAge || 31536000,
            })

            // También establecer en la respuesta
            response.cookies.set({
              name,
              value,
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: true,
              httpOnly: false, // FALSE para que JavaScript pueda leer las cookies
              maxAge: options.maxAge || 31536000,
            })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              path: '/',
              maxAge: 0,
            })

            response.cookies.set({
              name,
              value: '',
              ...options,
              path: '/',
              maxAge: 0,
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('✅ OAuth exitoso')
      return response
    }

    console.error('❌ Error OAuth:', error)
  }

  // Si hay error o no hay código, redirigir al login
  return NextResponse.redirect(new URL('/auth/login', 'https://www.mapafurgocasa.com'))
}
