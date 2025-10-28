require('dotenv').config({ path: '.env.local' })
const Database = require('better-sqlite3')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las credenciales de Supabase en .env.local')
  console.error('   Se requieren: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const dbPath = path.join(__dirname, '..', 'data', 'users', 'datos_users.db')

async function migrateUsers() {
  console.log('🚀 INICIANDO MIGRACIÓN DE USUARIOS A SUPABASE AUTH')
  console.log('=' .repeat(60))
  console.log('')

  try {
    const db = new Database(dbPath, { readonly: true })
    
    // Obtener todos los usuarios
    const users = db.prepare('SELECT * FROM users').all()
    console.log(`📊 Total de usuarios a migrar: ${users.length}\n`)

    let migrados = 0
    let errores = 0
    const erroresDetalle = []

    for (const user of users) {
      try {
        // Crear usuario en Supabase Auth
        // IMPORTANTE: Supabase Auth requiere una contraseña, pero no podemos recuperar
        // las contraseñas hasheadas. Generaremos contraseñas temporales seguras.
        const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!${Date.now()}`
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirmar email
          user_metadata: {
            username: user.username,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            full_name: [user.first_name, user.last_name].filter(Boolean).join(' '),
            profile_photo: user.profile_photo || 'default_profile.png',
            original_created_at: user.created_at,
            migrated_from_sqlite: true,
            migrated_at: new Date().toISOString(),
            // Campos administrativos
            is_admin: user.is_admin === 1,
            is_active: user.is_active === 1,
            is_banned: user.is_banned === 1,
            ban_reason: user.ban_reason,
            ban_date: user.ban_date,
            last_login: user.last_login,
          }
        })

        if (authError) {
          // Si el usuario ya existe, es posible que ya se haya migrado
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            console.log(`  ⚠️  Usuario ya existe: ${user.email}`)
          } else {
            throw authError
          }
        } else {
          migrados++
          console.log(`  ✅ Usuario migrado: ${user.email} (${user.username})`)
        }

        // Pequeña pausa para no saturar la API
        if (migrados % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        errores++
        erroresDetalle.push({ email: user.email, error: error.message })
        console.log(`  ❌ Error al migrar ${user.email}: ${error.message}`)
      }
    }

    db.close()

    console.log('\n')
    console.log('=' .repeat(60))
    console.log('📈 RESUMEN DE MIGRACIÓN')
    console.log('=' .repeat(60))
    console.log(`✅ Usuarios migrados: ${migrados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log('')
    
    if (erroresDetalle.length > 0 && erroresDetalle.length <= 10) {
      console.log('📋 Detalles de errores:')
      erroresDetalle.forEach(({ email, error }) => {
        console.log(`   - ${email}: ${error}`)
      })
    }

    console.log('\n⚠️  IMPORTANTE: ')
    console.log('   Los usuarios se han migrado con contraseñas temporales.')
    console.log('   Deberás implementar un sistema de recuperación de contraseña')
    console.log('   para que los usuarios puedan establecer nuevas contraseñas.')
    console.log('')
    console.log('💡 Los metadatos del usuario (nombre, username, etc.) están')
    console.log('   almacenados en user_metadata y podrás acceder a ellos.')

  } catch (error) {
    console.error('❌ Error general en la migración:', error.message)
    process.exit(1)
  }
}

// Ejecutar migración
migrateUsers()

