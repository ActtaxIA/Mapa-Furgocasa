/**
 * Script para verificar cuántos usuarios hay en Supabase Auth
 * 
 * Uso:
 *   node scripts/check-users-count.js
 * 
 * Requiere:
 *   - NEXT_PUBLIC_SUPABASE_URL en .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkUsersCount() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 VERIFICACIÓN DE USUARIOS EN SUPABASE AUTH')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no encontrada en .env.local')
    process.exit(1)
  }

  if (!supabaseServiceKey) {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY no encontrada en .env.local')
    process.exit(1)
  }

  console.log('✅ Variables de entorno encontradas')
  console.log(`   📍 URL: ${supabaseUrl}`)
  console.log(`   🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...\n`)

  // Crear cliente con Service Role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('🔍 Obteniendo lista de usuarios (con paginación)...\n')

    // Obtener TODOS los usuarios con paginación
    let allUsers = []
    let page = 1
    let perPage = 1000 // Máximo por página
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage
      })

      if (error) {
        console.error('❌ ERROR obteniendo usuarios:', error.message)
        process.exit(1)
      }

      allUsers = allUsers.concat(data.users)
      console.log(`   📄 Página ${page}: ${data.users.length} usuarios`)

      // Si recibimos menos usuarios que perPage, no hay más páginas
      hasMore = data.users.length === perPage
      page++
    }

    const users = allUsers
    console.log(`\n   ✅ Total obtenido: ${users.length} usuarios\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📈 RESULTADOS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log(`   👥 TOTAL DE USUARIOS: ${users.length}\n`)

    // Contar usuarios confirmados
    const confirmados = users.filter(u => u.confirmed_at).length
    const pendientes = users.length - confirmados

    console.log(`   ✅ Confirmados: ${confirmados}`)
    console.log(`   ⏳ Pendientes de confirmación: ${pendientes}\n`)

    // Contar administradores
    const admins = users.filter(u => u.user_metadata?.is_admin).length
    const regularUsers = users.length - admins

    console.log(`   👑 Administradores: ${admins}`)
    console.log(`   👤 Usuarios regulares: ${regularUsers}\n`)

    // Contar usuarios con último acceso
    const conAcceso = users.filter(u => u.last_sign_in_at).length
    const sinAcceso = users.length - conAcceso

    console.log(`   🔐 Han iniciado sesión: ${conAcceso}`)
    console.log(`   🚫 Nunca han iniciado sesión: ${sinAcceso}\n`)

    // Mostrar los primeros 5 usuarios como ejemplo
    if (users.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📋 PRIMEROS 5 USUARIOS (MUESTRA):')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      users.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Registrado: ${new Date(user.created_at).toLocaleDateString('es-ES')}`)
        console.log(`   Confirmado: ${user.confirmed_at ? '✅ Sí' : '❌ No'}`)
        console.log(`   Admin: ${user.user_metadata?.is_admin ? '👑 Sí' : '👤 No'}`)
        console.log(`   Último acceso: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES') : '❌ Nunca'}`)
        console.log()
      })
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ VERIFICACIÓN COMPLETADA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌ ERROR INESPERADO:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar script
checkUsersCount()

