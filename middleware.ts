import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // CRÍTICO: Excluir rutas API ANTES DE CUALQUIER PROCESAMIENTO
  const pathname = request.nextUrl.pathname

  // Lista completa de rutas a excluir
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Mejorar opciones de cookies para móviles
          const cookieOptions = {
            name,
            value,
            ...options,
            path: options.path || '/',
            sameSite: (options.sameSite || 'lax') as 'lax' | 'strict' | 'none',
            secure: request.headers.get('x-forwarded-proto') === 'https' ||
                    request.nextUrl.protocol === 'https:',
            httpOnly: options.httpOnly !== false,
          }

          request.cookies.set(cookieOptions)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(cookieOptions)
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions = {
            name,
            value: '',
            ...options,
            path: options.path || '/',
            maxAge: 0,
          }

          request.cookies.set(cookieOptions)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(cookieOptions)
        },
      },
    }
  )

  // Refrescar sesión si es necesario
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Static files
     * - API routes
     *
     * Nota: La exclusión real se hace en el código del middleware
     * para mayor control y evitar problemas con AWS Amplify
     */
    '/((?!_next|favicon).*)',
  ],
}
