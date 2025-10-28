// Script para migrar datos desde SQLite a Supabase
require('dotenv').config({ path: '.env.local' });
const Database = require('better-sqlite3');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para crear slug
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con -
    .replace(/^-+|-+$/g, ''); // Remover - al inicio y final
}

// Función para parsear servicios
function parseServices(servicesText) {
  const defaultServices = {
    agua: false,
    electricidad: false,
    vaciado_aguas_negras: false,
    vaciado_aguas_grises: false,
    wifi: false,
    duchas: false,
    wc: false,
    lavanderia: false,
    restaurante: false,
    supermercado: false,
    zona_mascotas: false
  };

  if (!servicesText) return defaultServices;

  // Intentar parsear como JSON
  try {
    const parsed = JSON.parse(servicesText);
    return { ...defaultServices, ...parsed };
  } catch {
    // Si no es JSON, intentar parsear como texto
    const services = { ...defaultServices };
    const lowerText = servicesText.toLowerCase();
    
    if (lowerText.includes('agua')) services.agua = true;
    if (lowerText.includes('electricidad') || lowerText.includes('luz')) services.electricidad = true;
    if (lowerText.includes('aguas negras') || lowerText.includes('wc')) services.vaciado_aguas_negras = true;
    if (lowerText.includes('aguas grises')) services.vaciado_aguas_grises = true;
    if (lowerText.includes('wifi') || lowerText.includes('internet')) services.wifi = true;
    if (lowerText.includes('ducha')) services.duchas = true;
    if (lowerText.includes('wc') || lowerText.includes('baño')) services.wc = true;
    if (lowerText.includes('lavanderia') || lowerText.includes('lavadora')) services.lavanderia = true;
    if (lowerText.includes('restaurante') || lowerText.includes('comida')) services.restaurante = true;
    if (lowerText.includes('supermercado') || lowerText.includes('tienda')) services.supermercado = true;
    if (lowerText.includes('mascota') || lowerText.includes('perro')) services.zona_mascotas = true;
    
    return services;
  }
}

// Función para determinar tipo de área
function getTipoArea(priceType) {
  if (!priceType) return 'publica';
  
  const type = priceType.toLowerCase();
  if (type.includes('free') || type.includes('gratis')) return 'publica';
  if (type.includes('private') || type.includes('privada')) return 'privada';
  if (type.includes('camping')) return 'camping';
  if (type.includes('parking')) return 'parking';
  
  return 'publica';
}

// MIGRACIÓN DE ÁREAS
async function migrateAreas() {
  console.log('\n📍 Iniciando migración de ÁREAS...\n');
  
  try {
    const areasDbPath = path.join(__dirname, '../data/areas/datos_areas.db');
    const areasDb = new Database(areasDbPath, { readonly: true });
    
    // Obtener todas las áreas
    const areas = areasDb.prepare('SELECT * FROM areas').all();
    console.log(`📊 Total áreas a migrar: ${areas.length}\n`);
    
    let migradas = 0;
    let errores = 0;
    
    for (const area of areas) {
      try {
        const slug = createSlug(`${area.name}-${area.city || area.province || ''}`);
        
        const areaData = {
          nombre: area.name,
          slug: slug,
          descripcion: area.description || null,
          latitud: area.latitude,
          longitud: area.longitude,
          direccion: area.address || null,
          ciudad: area.city || null,
          provincia: area.province || null,
          comunidad: area.region || null,
          pais: area.country || 'España',
          servicios: parseServices(area.services),
          tipo_area: getTipoArea(area.price_type),
          precio_noche: area.price_value || null,
          verificado: area.is_verified || false,
          activo: area.is_active !== false,
          created_at: area.created_at || new Date().toISOString(),
          updated_at: area.updated_at || new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('areas')
          .insert(areaData);
        
        if (error) {
          // Si es error de duplicado, intentar actualizar
          if (error.code === '23505') {
            const { error: updateError } = await supabase
              .from('areas')
              .update(areaData)
              .eq('slug', slug);
            
            if (updateError) {
              console.error(`  ❌ Error actualizando ${area.name}: ${updateError.message}`);
              errores++;
            } else {
              migradas++;
              if (migradas % 50 === 0) {
                console.log(`  ✅ ${migradas} áreas migradas...`);
              }
            }
          } else {
            console.error(`  ❌ Error migrando ${area.name}: ${error.message}`);
            errores++;
          }
        } else {
          migradas++;
          if (migradas % 50 === 0) {
            console.log(`  ✅ ${migradas} áreas migradas...`);
          }
        }
      } catch (err) {
        console.error(`  ❌ Error procesando ${area.name}:`, err.message);
        errores++;
      }
    }
    
    areasDb.close();
    
    console.log(`\n✅ Migración de áreas completada:`);
    console.log(`   - Migradas: ${migradas}`);
    console.log(`   - Errores: ${errores}`);
    
  } catch (error) {
    console.error('❌ Error en migración de áreas:', error.message);
    throw error;
  }
}

// MIGRACIÓN DE USUARIOS A SUPABASE AUTH
async function migrateUsers() {
  console.log('\n👥 Iniciando migración de USUARIOS...\n');
  console.log('⚠️  NOTA: Los usuarios necesitarán restablecer sus contraseñas.');
  console.log('   Supabase Auth requiere que los usuarios verifiquen su email.\n');
  
  try {
    const usersDbPath = path.join(__dirname, '../data/users/datos_users.db');
    const usersDb = new Database(usersDbPath, { readonly: true });
    
    // Obtener todos los usuarios
    const users = usersDb.prepare('SELECT * FROM users WHERE is_active = 1').all();
    console.log(`📊 Total usuarios activos a migrar: ${users.length}\n`);
    
    let migrados = 0;
    let errores = 0;
    let saltados = 0;
    
    for (const user of users) {
      try {
        // Validar email
        if (!user.email || !user.email.includes('@')) {
          console.log(`  ⏭️  Saltando usuario sin email válido: ${user.username}`);
          saltados++;
          continue;
        }
        
        // Crear usuario en Supabase Auth con contraseña temporal
        const tempPassword = `TempPass${Math.random().toString(36).substring(2, 10)}!`;
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirmar email
          user_metadata: {
            username: user.username,
            first_name: user.first_name || null,
            last_name: user.last_name || null,
            is_admin: user.is_admin || false,
            migrated_from_sqlite: true,
            original_id: user.id,
          }
        });
        
        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`  ⏭️  Usuario ya existe: ${user.email}`);
            saltados++;
          } else {
            console.error(`  ❌ Error creando usuario ${user.email}: ${authError.message}`);
            errores++;
          }
        } else {
          migrados++;
          if (migrados % 50 === 0) {
            console.log(`  ✅ ${migrados} usuarios migrados...`);
          }
        }
      } catch (err) {
        console.error(`  ❌ Error procesando usuario ${user.email}:`, err.message);
        errores++;
      }
    }
    
    usersDb.close();
    
    console.log(`\n✅ Migración de usuarios completada:`);
    console.log(`   - Migrados: ${migrados}`);
    console.log(`   - Saltados: ${saltados}`);
    console.log(`   - Errores: ${errores}`);
    console.log(`\n⚠️  IMPORTANTE: Los usuarios deberán usar "Olvidé mi contraseña" para establecer una nueva.`);
    
  } catch (error) {
    console.error('❌ Error en migración de usuarios:', error.message);
    throw error;
  }
}

// EJECUTAR MIGRACIÓN
async function main() {
  console.log('🚀 INICIANDO MIGRACIÓN A SUPABASE');
  console.log('=' .repeat(60));
  
  try {
    // Migrar áreas
    await migrateAreas();
    
    // Preguntar si migrar usuarios
    console.log('\n' + '='.repeat(60));
    console.log('\n¿Deseas migrar los usuarios también?');
    console.log('Los usuarios necesitarán restablecer sus contraseñas.\n');
    
    // Por ahora solo migramos áreas, para usuarios necesitamos confirmación
    // await migrateUsers();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRACIÓN COMPLETADA\n');
    console.log('📊 Próximos pasos:');
    console.log('   1. Verifica las áreas en Supabase');
    console.log('   2. Si todo está correcto, ejecuta con --users para migrar usuarios');
    console.log('   3. Actualiza la aplicación para usar Supabase\n');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error.message);
    process.exit(1);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--users')) {
  // Si se pasa --users, migrar usuarios también
  main().then(async () => {
    await migrateUsers();
    process.exit(0);
  });
} else {
  main().then(() => process.exit(0));
}

