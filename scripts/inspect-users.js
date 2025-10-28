const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'data', 'users', 'datos_users.db')

console.log('📂 Inspeccionando base de datos de usuarios...\n')
console.log(`Ruta: ${dbPath}\n`)

try {
  const db = new Database(dbPath, { readonly: true })

  // Obtener todas las tablas
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%'
  `).all()

  console.log('📊 TABLAS ENCONTRADAS:')
  console.log('═'.repeat(60))
  
  tables.forEach(({ name }) => {
    console.log(`\n🔷 Tabla: ${name}`)
    console.log('─'.repeat(60))
    
    // Obtener info de la tabla
    const tableInfo = db.prepare(`PRAGMA table_info(${name})`).all()
    console.log('\nEstructura:')
    tableInfo.forEach(col => {
      console.log(`  - ${col.name} (${col.type})${col.pk ? ' [PRIMARY KEY]' : ''}${col.notnull ? ' [NOT NULL]' : ''}`)
    })
    
    // Contar registros
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get()
    console.log(`\n📈 Total registros: ${count.count}`)
    
    // Mostrar algunos registros de ejemplo
    if (count.count > 0) {
      const samples = db.prepare(`SELECT * FROM ${name} LIMIT 3`).all()
      console.log('\n📋 Ejemplos de registros:')
      samples.forEach((record, i) => {
        console.log(`\n  Registro ${i + 1}:`)
        Object.entries(record).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 50 
            ? value.substring(0, 50) + '...' 
            : value
          console.log(`    ${key}: ${displayValue}`)
        })
      })
    }
  })

  db.close()
  console.log('\n\n✅ Inspección completada')

} catch (error) {
  console.error('❌ Error al inspeccionar la base de datos:', error.message)
  process.exit(1)
}

