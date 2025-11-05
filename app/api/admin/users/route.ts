import { NextRequest, NextResponse } from 'next/server'
import { createClient, User } from '@supabase/supabase-js'

// Deshabilitar COMPLETAMENTE el caché de Next.js para esta ruta
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

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

    console.log('🔍 Iniciando carga de usuarios desde Supabase Auth...')

    while (hasMore) {
      console.log(`📄 Cargando página ${page} (${perPage} usuarios por página)...`)
      
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      })

      if (error) {
        console.error('❌ Error listando usuarios:', error)
        return NextResponse.json(
          { error: 'Error al obtener usuarios', details: error.message },
          { status: 500 }
        )
      }

      const usersInPage = data.users.length
      allUsers = allUsers.concat(data.users)
      
      console.log(`✅ Página ${page}: ${usersInPage} usuarios obtenidos. Total acumulado: ${allUsers.length}`)
      
      // Continuar si obtuvimos el máximo de usuarios en esta página
      hasMore = usersInPage === perPage
      page++
      
      // Seguridad: evitar loops infinitos
      if (page > 100) {
        console.warn('⚠️ Límite de páginas alcanzado (100). Deteniendo...')
        break
      }
    }

    const users = allUsers
    console.log(`✅ TOTAL FINAL: ${users.length} usuarios cargados desde Supabase Auth API`)

    // Log para debug - mostrar info de los primeros usuarios
    if (users.length > 0) {
      console.log('📊 Primeros 3 usuarios desde Supabase Auth:')
      users.slice(0, 3).forEach(user => {
        console.log({
          email: user.email,
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at,
          updated_at: (user as any).updated_at // Por si acaso existe
        })
      })
    }

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

    const response = NextResponse.json({
      success: true,
      total: formattedUsers.length,
      users: formattedUsers
    })

    // Headers para evitar cualquier tipo de caché
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response

  } catch (error: any) {
    console.error('Error en API de usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

