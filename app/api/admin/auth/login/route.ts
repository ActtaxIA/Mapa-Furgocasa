import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Endpoint especial para login de admin
 * Usa cliente desde servidor (menos rate limiting que desde cliente)
 * SOLO para emails de admin verificados
 *
 * URL: /api/admin/auth/login
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Lista de emails de admin permitidos
    const ADMIN_EMAILS = [
      'info@furgocasa.com',
      'admin@mapafurgocasa.com',
      // Añade más emails de admin aquí si es necesario
    ]

    // Verificar que el email es de admin
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Este endpoint es solo para administradores' },
        { status: 403 }
      )
    }

    // Usar cliente desde servidor (menos rate limiting que desde navegador)
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )

    // Login desde servidor (tiene menos rate limiting)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error login admin:', error)

      // Si es rate limit, dar mensaje más claro
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit alcanzado. Por favor espera unos minutos o usa "Continuar con Google"' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Error al iniciar sesión' },
        { status: 401 }
      )
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: 'No se pudo crear la sesión' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
      },
    })
  } catch (error: any) {
    console.error('Error en login admin:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
