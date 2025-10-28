// Script para inspeccionar la estructura de las bases de datos SQLite
const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 Inspeccionando bases de datos SQLite...\n');

// Inspeccionar base de datos de áreas
try {
  const areasDbPath = path.join(__dirname, '../data/areas/datos_areas.db');
  const areasDb = new Database(areasDbPath, { readonly: true });
  
  console.log('📍 BASE DE DATOS: ÁREAS');
  console.log('=' .repeat(50));
  
  // Obtener lista de tablas
  const tables = areasDb.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log('\n📊 Tablas encontradas:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
    
    // Obtener estructura de la tabla
    const columns = areasDb.pragma(`table_info(${table.name})`);
    console.log(`    Columnas (${columns.length}):`);
    columns.forEach(col => {
      console.log(`      • ${col.name} (${col.type})`);
    });
    
    // Contar registros
    const count = areasDb.prepare(`SELECT COUNT(*) as total FROM ${table.name}`).get();
    console.log(`    Total registros: ${count.total}\n`);
  });
  
  areasDb.close();
} catch (error) {
  console.error('❌ Error al inspeccionar base de datos de áreas:', error.message);
}

console.log('\n');

// Inspeccionar base de datos de usuarios
try {
  const usersDbPath = path.join(__dirname, '../data/users/datos_users.db');
  const usersDb = new Database(usersDbPath, { readonly: true });
  
  console.log('👥 BASE DE DATOS: USUARIOS');
  console.log('=' .repeat(50));
  
  // Obtener lista de tablas
  const tables = usersDb.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log('\n📊 Tablas encontradas:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
    
    // Obtener estructura de la tabla
    const columns = usersDb.pragma(`table_info(${table.name})`);
    console.log(`    Columnas (${columns.length}):`);
    columns.forEach(col => {
      console.log(`      • ${col.name} (${col.type})`);
    });
    
    // Contar registros
    const count = usersDb.prepare(`SELECT COUNT(*) as total FROM ${table.name}`).get();
    console.log(`    Total registros: ${count.total}\n`);
  });
  
  usersDb.close();
} catch (error) {
  console.error('❌ Error al inspeccionar base de datos de usuarios:', error.message);
}

console.log('\n✅ Inspección completada');

