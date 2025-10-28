# 🚀 Scripts de Migración a Supabase

Este directorio contiene scripts para migrar datos desde las bases de datos SQLite locales a Supabase.

## 📋 Scripts Disponibles

### 1. `inspect-sqlite.js`
Inspecciona la estructura de las bases de datos SQLite locales.

```bash
npm run db:inspect
```

**Muestra:**
- Tablas disponibles
- Columnas de cada tabla
- Número de registros
- Estructura de datos

---

### 2. `migrate-to-supabase.js`
Migra los datos desde SQLite a Supabase.

#### Migrar solo áreas:
```bash
npm run db:migrate:areas
```

#### Migrar áreas y usuarios:
```bash
npm run db:migrate:all
```

---

### 3. `actualizar-websites-google.js` ⭐ NUEVO
Actualiza `website`, `telefono` y `google_rating` de áreas existentes que tienen `google_place_id` pero les faltan estos datos.

```bash
node scripts/actualizar-websites-google.js
```

**Funcionalidad:**
- Busca áreas con `google_place_id` pero sin `website`, `telefono` o `google_rating`
- Obtiene los datos desde Google Places Details API
- Actualiza solo los campos que faltan (no sobrescribe datos existentes)
- Muestra progreso en tiempo real
- Incluye delays para no saturar la API de Google

**Cuándo usar:**
- ✅ Después de importar áreas desde búsqueda masiva (versiones antiguas sin website)
- ✅ Para completar datos de áreas existentes
- ✅ Antes de usar "Actualizar Servicios" (necesita websites para scraping)

**Requisitos:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configurada en `.env.local`
- Areas con `google_place_id` en la base de datos

---

## 📊 Datos a Migrar

### Áreas (507 registros)
- ✅ Información básica (nombre, descripción, ubicación)
- ✅ Servicios (agua, electricidad, etc.)
- ✅ Precios y tipo de área
- ✅ Estado (activo, verificado)
- ✅ Fechas de creación y actualización

### Usuarios (382 registros activos)
- ✅ Email y nombre de usuario
- ✅ Nombre y apellidos
- ✅ Rol (admin/usuario)
- ✅ Estado de cuenta
- ⚠️ **IMPORTANTE**: Las contraseñas NO se migran por seguridad

---

## ⚠️ IMPORTANTE - Usuarios

### ¿Qué pasa con las contraseñas?

Las contraseñas **NO se pueden migrar** directamente porque:
1. SQLite tiene hashes de contraseña en un formato
2. Supabase Auth usa su propio sistema de seguridad
3. Es imposible "descifrar" las contraseñas hasheadas

### Solución para usuarios

Los usuarios migrados deberán:
1. Ir a la página de login
2. Hacer clic en **"Olvidé mi contraseña"**
3. Recibir un email con enlace de restablecimiento
4. Crear una nueva contraseña

**Opción alternativa:**
- Enviar un email masivo a todos los usuarios explicando el proceso
- Incluir enlace directo para restablecer contraseña

---

## 🔄 Proceso de Migración

### Paso 1: Inspeccionar datos
```bash
npm run db:inspect
```

Verifica que los datos se pueden leer correctamente.

### Paso 2: Migrar áreas
```bash
npm run db:migrate:areas
```

Esto migrará:
- 507 áreas de autocaravanas
- Con todos sus datos (ubicación, servicios, precios)
- Creará slugs únicos automáticamente
- Parseará los servicios a formato JSON

### Paso 3: Verificar en Supabase
1. Ve a tu proyecto en Supabase
2. Table Editor → `areas`
3. Verifica que los datos se hayan migrado correctamente

### Paso 4: Migrar usuarios (opcional)
```bash
npm run db:migrate:all
```

**⚠️ Solo ejecuta esto si estás seguro**

Los usuarios se crearán en Supabase Auth con:
- Email verificado automáticamente
- Metadata con nombre de usuario, nombre completo, etc.
- **Contraseñas temporales** (que no funcionarán - deben restablecerlas)

---

## 🛠️ Mapeo de Datos

### SQLite → Supabase (Áreas)

| SQLite | Supabase | Notas |
|--------|----------|-------|
| `name` | `nombre` | Texto |
| `description` | `descripcion` | Texto |
| `latitude` | `latitud` | Decimal |
| `longitude` | `longitud` | Decimal |
| `address` | `direccion` | Texto |
| `city` | `ciudad` | Texto |
| `province` | `provincia` | Texto |
| `region` | `comunidad` | Texto |
| `country` | `pais` | Texto (default: España) |
| `services` | `servicios` | JSON parseado |
| `price_type` | `tipo_area` | Mapeado a: publica/privada/camping/parking |
| `price_value` | `precio_noche` | Decimal |
| `is_verified` | `verificado` | Boolean |
| `is_active` | `activo` | Boolean |
| - | `slug` | Generado automáticamente |

### SQLite → Supabase Auth (Usuarios)

| SQLite | Supabase Auth | Notas |
|--------|---------------|-------|
| `email` | `email` | Identidad principal |
| `username` | `user_metadata.username` | Metadata |
| `first_name` | `user_metadata.first_name` | Metadata |
| `last_name` | `user_metadata.last_name` | Metadata |
| `is_admin` | `user_metadata.is_admin` | Metadata |
| `password_hash` | ❌ | NO SE MIGRA |

---

## 🐛 Solución de Problemas

### Error: "No se pueden leer las variables de entorno"
Asegúrate de que el archivo `.env.local` existe y tiene:
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Error: "Duplicate key value violates unique constraint"
El registro ya existe en Supabase. El script intentará actualizarlo automáticamente.

### Error: "User already registered"
El usuario con ese email ya existe en Supabase Auth. Se saltará automáticamente.

---

## 📝 Logs y Seguimiento

El script mostrará en tiempo real:
- ✅ Registros migrados exitosamente
- ⏭️ Registros saltados (duplicados o inválidos)
- ❌ Errores encontrados
- 📊 Resumen final con estadísticas

---

## ✅ Post-Migración

Después de migrar:

1. **Verifica los datos en Supabase**
   - Table Editor → `areas`
   - Authentication → Users

2. **Prueba la aplicación**
   - Abre http://localhost:3000/mapa
   - Verifica que las áreas se muestran correctamente

3. **Notifica a los usuarios**
   - Si migraste usuarios, envía un email explicando cómo restablecer contraseña

4. **Actualiza el código**
   - Reemplaza referencias a SQLite por Supabase
   - Elimina archivos `.db` locales (después de backup)

---

## 🔒 Seguridad

- ✅ Usa `SUPABASE_SERVICE_ROLE_KEY` (con permisos de admin)
- ✅ Las contraseñas nunca se exponen
- ✅ Los emails se validan antes de migrar
- ✅ Row Level Security (RLS) está habilitado en Supabase

---

## 📞 Soporte

Si tienes problemas con la migración:
1. Revisa los logs del script
2. Verifica las credenciales en `.env.local`
3. Comprueba que el schema de Supabase está ejecutado
4. Contacta al equipo de desarrollo

---

✨ **¡Buena suerte con la migración!** 🚐

