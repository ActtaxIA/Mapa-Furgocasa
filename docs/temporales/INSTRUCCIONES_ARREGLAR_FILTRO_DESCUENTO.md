# 🔧 Instrucciones para Arreglar el Filtro de Descuento FURGOCASA

## Problema Identificado

El filtro "Con descuento FURGOCASA" mostraba todas las 503 áreas en lugar de filtrar correctamente porque:

1. ❌ El campo `con_descuento_furgocasa` NO existía en la base de datos
2. ❌ La lógica del filtro no estaba implementada en el código

## Solución Aplicada

### ✅ 1. Archivos Actualizados

- `types/database.types.ts` - Añadido el campo `con_descuento_furgocasa: boolean`
- `app/(public)/mapa/page.tsx` - Implementada la lógica del filtro
- `supabase/add-descuento-furgocasa.sql` - Script SQL para añadir el campo

### ✅ 2. Ejecutar la Migración SQL

**DEBES ejecutar este SQL en tu base de datos Supabase:**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Haz clic en "SQL Editor" en el menú lateral
3. Crea una nueva query
4. Copia y pega este código:

```sql
-- Añadir campo con_descuento_furgocasa a la tabla areas
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS con_descuento_furgocasa BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_areas_con_descuento_furgocasa 
ON areas(con_descuento_furgocasa) 
WHERE con_descuento_furgocasa = TRUE;

-- Comentario de la columna
COMMENT ON COLUMN areas.con_descuento_furgocasa IS 'Indica si el área ofrece descuento especial para miembros de FURGOCASA';
```

5. Haz clic en "Run" (ejecutar)
6. Deberías ver un mensaje de éxito

### ✅ 3. Verificar que Funciona

Después de ejecutar el SQL:

1. Recarga la página del mapa: http://localhost:3001/mapa
2. Abre los filtros
3. Marca "Con descuento FURGOCASA"
4. Ahora debería mostrar **0 resultados** (correcto, ya que ninguna área tiene descuento aún)

## Cómo Añadir Descuentos a las Áreas

Para que las áreas aparezcan cuando actives el filtro, debes marcarlas como áreas con descuento:

### Opción A: Desde el Panel de Administración

1. Ve a `/admin/areas`
2. Edita un área
3. En el futuro, añadiremos un checkbox "Con descuento FURGOCASA" en el formulario de edición

### Opción B: Desde SQL Editor (rápido para múltiples áreas)

```sql
-- Marcar un área específica con descuento
UPDATE areas 
SET con_descuento_furgocasa = TRUE 
WHERE slug = 'nombre-del-area';

-- Marcar varias áreas con descuento
UPDATE areas 
SET con_descuento_furgocasa = TRUE 
WHERE id IN ('id1', 'id2', 'id3');

-- Ver cuántas áreas tienen descuento
SELECT COUNT(*) FROM areas WHERE con_descuento_furgocasa = TRUE;
```

## Comportamiento Esperado

### Antes del Arreglo ❌
- Filtro activado → Muestra todas las 503 áreas (incorrecto)

### Después del Arreglo ✅
- Filtro activado → Muestra solo áreas donde `con_descuento_furgocasa = TRUE`
- Si ninguna tiene descuento → Muestra 0 resultados (correcto)
- Cuando marques áreas con descuento → Aparecerán en el filtro

## Próximos Pasos Recomendados

1. **Ejecutar el SQL en Supabase** (obligatorio)
2. **Probar el filtro** en el mapa
3. **Añadir checkbox en el formulario de edición** de áreas para poder activar/desactivar descuentos fácilmente
4. **Decidir qué áreas tienen descuento** y marcarlas

## Código del Filtro (Ya Implementado)

```typescript
// En app/(public)/mapa/page.tsx línea 136-138
if (filtros.caracteristicas.includes('con_descuento_furgocasa') && !area.con_descuento_furgocasa) {
  return false
}
```

Esto comprueba si el filtro está activo y si el área tiene el campo en `true`.

---

**Estado:** ✅ Código arreglado, falta ejecutar SQL en Supabase

