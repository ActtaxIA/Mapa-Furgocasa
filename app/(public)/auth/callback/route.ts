import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 [OAuth Callback] Iniciando...')
    
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/mapa'
    
    console.log('   Code presente:', !!code)
    console.log('   Next URL:', next)

    if (code) {
      const cookieStore = await cookies()
      
      // Determinar la URL base correcta
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mapafurgocasa.com'
      const redirectUrl = new URL(next, baseUrl)
      
      console.log('   Redirect URL:', redirectUrl.toString())
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              try {
                cookieStore.set({
                  name,
                  value,
                  ...options,
                  path: '/',
                  sameSite: 'lax',
                  secure: true,
                  httpOnly: true,
                })
              } catch (error) {
                console.error('Error setting cookie in store:', error)
              }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({
                  name,
                  value: '',
                  ...options,
                  path: '/',
                  maxAge: 0,
                })
              } catch (error) {
                console.error('Error removing cookie:', error)
              }
            },
          },
        }
      )
      
      console.log('   Intercambiando código por sesión...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Error en exchangeCodeForSession:', error)
        return NextResponse.redirect(new URL('/auth/login?error=callback_error', baseUrl))
      }
      
      if (data.session) {
        console.log('✅ Sesión creada exitosamente')
        console.log('   User:', data.user?.email)
        console.log('   Session expira:', new Date(data.session.expires_at! * 1000).toISOString())
        
        // Crear respuesta con cookies
        const response = NextResponse.redirect(redirectUrl)
        
        // Establecer cookies de sesión manualmente para asegurar persistencia
        const sessionCookies = [
          {
            name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
            value: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
              expires_in: data.session.expires_in,
              token_type: 'bearer',
              user: data.user,
            }),
          },
        ]
        
        for (const cookie of sessionCookies) {
          response.cookies.set({
            name: cookie.name,
            value: cookie.value,
            path: '/',
            sameSite: 'lax',
            secure: true,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 días
          })
        }
        
        console.log('   Cookies establecidas en respuesta')
        return response
      }
    }

    console.log('❌ No hay código o error en el proceso')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mapafurgocasa.com'
    return NextResponse.redirect(new URL('/auth/login?error=no_code', baseUrl))
    
  } catch (error) {
    console.error('❌ [OAuth Callback] Error general:', error)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mapafurgocasa.com'
    return NextResponse.redirect(new URL('/auth/login?error=server_error', baseUrl))
  }
}

