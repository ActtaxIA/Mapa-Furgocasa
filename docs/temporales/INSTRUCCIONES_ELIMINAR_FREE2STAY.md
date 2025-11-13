# 🚨 ELIMINAR IMÁGENES DE FREE2STAY.EU

## Problema Detectado

Norton está bloqueando imágenes alojadas en `free2stay.eu` clasificándolas como **URL:Phishing**.

URL problemática detectada:
```
https://free2stay.eu/wp-content/uploads/2024/02/IMG-20240228-WA0006-1-1024x577.jpg
```

---

## 🔍 PASO 1: Identificar Áreas Afectadas

Ejecuta esta query en **Supabase SQL Editor** para ver qué áreas tienen imágenes de free2stay:

```sql
SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  fotos_urls
FROM areas
WHERE 
  foto_principal LIKE '%free2stay%' 
  OR fotos_urls::text LIKE '%free2stay%';
```

Esto te mostrará todas las áreas que tienen imágenes de ese dominio.

---

## 💾 PASO 2: Hacer Backup (IMPORTANTE)

Antes de eliminar, guarda un backup de las áreas afectadas:

```sql
-- Crear tabla temporal con backup
CREATE TABLE IF NOT EXISTS areas_backup_free2stay AS
SELECT *
FROM areas
WHERE 
  foto_principal LIKE '%free2stay%' 
  OR fotos_urls::text LIKE '%free2stay%';

-- Verificar backup
SELECT COUNT(*) as areas_en_backup FROM areas_backup_free2stay;
```

---

## 🧹 PASO 3: Limpiar las Imágenes

### Opción A: Script Completo (Recomendado)

Ejecuta el script completo:

```sql
-- Ver archivo: supabase/migrations/eliminar_imagenes_free2stay.sql
```

O copia y pega esto en el SQL Editor:

```sql
-- 1. Eliminar foto_principal si contiene free2stay
UPDATE areas
SET 
  foto_principal = NULL,
  updated_at = NOW()
WHERE foto_principal LIKE '%free2stay%';

-- 2. Eliminar URLs de free2stay del array fotos_urls
UPDATE areas
SET 
  fotos_urls = (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements_text(fotos_urls::jsonb) AS elem
    WHERE elem NOT LIKE '%free2stay%'
  ),
  updated_at = NOW()
WHERE fotos_urls::text LIKE '%free2stay%';

-- 3. Limpiar arrays vacíos
UPDATE areas
SET fotos_urls = '[]'::jsonb
WHERE fotos_urls IS NOT NULL 
  AND jsonb_array_length(fotos_urls::jsonb) = 0;
```

### Opción B: Limpiar Manualmente Área por Área

Si prefieres mayor control, puedes limpiar cada área individualmente:

```sql
-- Ejemplo: Limpiar área específica por ID
UPDATE areas
SET 
  foto_principal = NULL,
  fotos_urls = '[]'::jsonb,
  updated_at = NOW()
WHERE id = 'EL_ID_DEL_AREA';
```

---

## ✅ PASO 4: Verificar Limpieza

Confirma que se eliminaron todas las referencias:

```sql
-- Esta query NO debería devolver resultados
SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  fotos_urls
FROM areas
WHERE 
  foto_principal LIKE '%free2stay%' 
  OR fotos_urls::text LIKE '%free2stay%';
```

Si devuelve 0 filas = ✅ **Limpieza exitosa**

---

## 📊 PASO 5: Ver Estadísticas

```sql
-- Áreas afectadas y limpiadas
SELECT 
  COUNT(*) as total_areas_limpiadas,
  MIN(updated_at) as primera_limpieza,
  MAX(updated_at) as ultima_limpieza
FROM areas
WHERE updated_at > NOW() - INTERVAL '10 minutes';

-- Ver áreas que quedaron sin imágenes
SELECT 
  id,
  nombre,
  ciudad,
  (fotos_urls IS NULL OR jsonb_array_length(fotos_urls::jsonb) = 0) as sin_imagenes
FROM areas
WHERE 
  (foto_principal IS NULL)
  AND (fotos_urls IS NULL OR jsonb_array_length(fotos_urls::jsonb) = 0);
```

---

## 🔄 PASO 6: Re-enriquecer Imágenes (Opcional)

Las áreas limpiadas quedarán sin imágenes. Puedes volver a buscar imágenes limpias usando la herramienta de administración:

1. Ve a: `https://www.mapafurgocasa.com/admin/areas/enriquecer-imagenes`
2. Selecciona las áreas que quedaron sin imágenes
3. Ejecuta "Enriquecer imágenes"
4. El sistema buscará imágenes en fuentes limpias:
   - Google Images
   - Web oficial del área
   - Park4night

---

## 🛡️ PREVENCIÓN FUTURA

### Agregar free2stay.eu a la Lista Negra

Edita el archivo de configuración para evitar que se vuelvan a agregar imágenes de este dominio:

```typescript
// app/api/admin/scrape-images/route.ts
function esImagenValida(url: string): boolean {
  if (!url) return false
  
  // Lista negra de dominios
  const dominiosProhibidos = [
    'free2stay.eu',  // ⬅️ AÑADIR ESTA LÍNEA
    'spam.com',
    // ... otros dominios problemáticos
  ]
  
  const urlLower = url.toLowerCase()
  
  // Verificar dominios prohibidos
  if (dominiosProhibidos.some(dominio => urlLower.includes(dominio))) {
    return false
  }
  
  // ... resto del código
}
```

---

## 🚨 SI ALGO SALE MAL

### Restaurar desde Backup

Si necesitas restaurar los datos originales:

```sql
-- Ver backup
SELECT * FROM areas_backup_free2stay;

-- Restaurar un área específica
UPDATE areas
SET 
  foto_principal = backup.foto_principal,
  fotos_urls = backup.fotos_urls,
  updated_at = NOW()
FROM areas_backup_free2stay backup
WHERE areas.id = backup.id
  AND areas.id = 'ID_DEL_AREA_A_RESTAURAR';

-- Restaurar todas (usar con precaución)
UPDATE areas
SET 
  foto_principal = backup.foto_principal,
  fotos_urls = backup.fotos_urls,
  updated_at = NOW()
FROM areas_backup_free2stay backup
WHERE areas.id = backup.id;
```

### Eliminar Tabla de Backup

Cuando estés seguro de que todo está bien:

```sql
DROP TABLE IF EXISTS areas_backup_free2stay;
```

---

## 📝 RESUMEN DE COMANDOS RÁPIDOS

```sql
-- 1. Ver afectadas
SELECT id, nombre FROM areas WHERE foto_principal LIKE '%free2stay%' OR fotos_urls::text LIKE '%free2stay%';

-- 2. Hacer backup
CREATE TABLE areas_backup_free2stay AS SELECT * FROM areas WHERE foto_principal LIKE '%free2stay%' OR fotos_urls::text LIKE '%free2stay%';

-- 3. Limpiar
UPDATE areas SET foto_principal = NULL WHERE foto_principal LIKE '%free2stay%';
UPDATE areas SET fotos_urls = (SELECT jsonb_agg(elem) FROM jsonb_array_elements_text(fotos_urls::jsonb) AS elem WHERE elem NOT LIKE '%free2stay%') WHERE fotos_urls::text LIKE '%free2stay%';

-- 4. Verificar
SELECT COUNT(*) FROM areas WHERE foto_principal LIKE '%free2stay%' OR fotos_urls::text LIKE '%free2stay%';
```

---

## ✅ CHECKLIST

- [ ] Ejecutar query de identificación
- [ ] Hacer backup de áreas afectadas
- [ ] Ejecutar script de limpieza
- [ ] Verificar que no quedan referencias a free2stay
- [ ] (Opcional) Re-enriquecer imágenes de áreas limpias
- [ ] Agregar free2stay.eu a lista negra en el código
- [ ] Eliminar tabla de backup después de confirmar

---

**Fecha**: 30 de Octubre, 2025  
**Motivo**: Norton detecta free2stay.eu como URL:Phishing  
**Acción**: Eliminación completa de referencias al dominio

