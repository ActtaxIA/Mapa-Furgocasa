-- ============================================
-- SCRIPT SIMPLE: ELIMINAR FREE2STAY.EU
-- ============================================
-- Versión simplificada sin bloques complejos
-- ============================================

-- PASO 1: Ver áreas afectadas
SELECT 
  '=== ÁREAS AFECTADAS ===' as info,
  COUNT(*) as total_areas
FROM areas 
WHERE foto_principal LIKE '%free2stay%' 
   OR array_to_string(fotos_urls, ',') LIKE '%free2stay%';

-- Mostrar detalles de las áreas afectadas
SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  array_length(fotos_urls, 1) as num_fotos
FROM areas 
WHERE foto_principal LIKE '%free2stay%' 
   OR array_to_string(fotos_urls, ',') LIKE '%free2stay%';

-- ============================================
-- PASO 2: LIMPIEZA
-- ============================================

-- Limpiar foto_principal
UPDATE areas
SET 
  foto_principal = NULL,
  updated_at = NOW()
WHERE foto_principal LIKE '%free2stay%';

-- Limpiar fotos_urls (eliminar URLs con free2stay del array)
UPDATE areas
SET 
  fotos_urls = (
    SELECT array_agg(elem)
    FROM unnest(fotos_urls) AS elem
    WHERE elem NOT LIKE '%free2stay%'
  ),
  updated_at = NOW()
WHERE array_to_string(fotos_urls, ',') LIKE '%free2stay%';

-- Limpiar arrays vacíos
UPDATE areas
SET fotos_urls = NULL
WHERE fotos_urls IS NOT NULL 
  AND (array_length(fotos_urls, 1) IS NULL OR array_length(fotos_urls, 1) = 0);

-- ============================================
-- PASO 3: VERIFICACIÓN
-- ============================================

-- Verificar que no quedan referencias
SELECT 
  '=== VERIFICACIÓN FINAL ===' as info,
  COUNT(*) as referencias_restantes
FROM areas 
WHERE foto_principal LIKE '%free2stay%' 
   OR array_to_string(fotos_urls, ',') LIKE '%free2stay%';

-- Si el resultado es 0, la limpieza fue exitosa ✅

-- Mostrar áreas que quedaron sin imágenes
SELECT 
  '=== ÁREAS SIN IMÁGENES (Considerar re-enriquecer) ===' as info;

SELECT 
  id,
  nombre,
  ciudad,
  foto_principal,
  array_length(fotos_urls, 1) as num_fotos_restantes
FROM areas
WHERE 
  updated_at > NOW() - INTERVAL '5 minutes'
  AND foto_principal IS NULL
  AND (fotos_urls IS NULL OR array_length(fotos_urls, 1) IS NULL OR array_length(fotos_urls, 1) = 0)
ORDER BY nombre;

-- ============================================
-- RESUMEN
-- ============================================
SELECT 
  '=== RESUMEN DE LIMPIEZA ===' as info,
  COUNT(*) as areas_modificadas
FROM areas
WHERE updated_at > NOW() - INTERVAL '5 minutes';

