import { NextRequest, NextResponse } from 'next/server'
import { createClient, User } from '@supabase/supabase-js'

/**
 * API para gestionar usuarios (requiere Service Role Key)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario actual es admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase no disponible' },
        { status: 500 }
      )
    }

    // Crear cliente con Service Role (tiene acceso a auth.users)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Obtener TODOS los usuarios con paginación
    let allUsers: User[] = []
    let page = 1
    const perPage = 1000
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      })

      if (error) {
        console.error('Error listando usuarios:', error)
        return NextResponse.json(
          { error: 'Error al obtener usuarios', details: error.message },
          { status: 500 }
        )
      }

      allUsers = allUsers.concat(data.users)
      hasMore = data.users.length === perPage
      page++
    }

    const users = allUsers

    // Formatear datos para el cliente
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      confirmed_at: user.confirmed_at,
      user_metadata: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
    }))

    return NextResponse.json({
      success: true,
      total: formattedUsers.length,
      users: formattedUsers
    })

  } catch (error: any) {
    console.error('Error en API de usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

