-- ============================================================================
-- Script: Limpiar descripciones placeholder de Google Maps
-- Descripción: Convierte a NULL las descripciones que son solo placeholders
-- Fecha: 2025-10-29
-- ============================================================================

-- Ver cuántas áreas tienen el placeholder
SELECT 
  COUNT(*) as total_con_placeholder,
  pais,
  COUNT(*) as cantidad
FROM areas
WHERE descripcion = 'Área encontrada mediante búsqueda en Google Maps. Requiere verificación y enriquecimiento.'
   OR descripcion LIKE '%Requiere verificación y enriquecimiento%'
GROUP BY pais
ORDER BY cantidad DESC;

-- Ver el total general
SELECT COUNT(*) as total_con_placeholder
FROM areas
WHERE descripcion = 'Área encontrada mediante búsqueda en Google Maps. Requiere verificación y enriquecimiento.'
   OR descripcion LIKE '%Requiere verificación y enriquecimiento%';

-- ============================================================================
-- EJECUTAR ESTE UPDATE PARA LIMPIAR LOS PLACEHOLDERS
-- ============================================================================

-- Actualizar a NULL las descripciones que son placeholders
UPDATE areas
SET 
  descripcion = NULL,
  updated_at = NOW()
WHERE descripcion = 'Área encontrada mediante búsqueda en Google Maps. Requiere verificación y enriquecimiento.'
   OR descripcion LIKE '%Requiere verificación y enriquecimiento%';

-- Verificar el resultado
SELECT 
  COUNT(*) as total_sin_descripcion
FROM areas
WHERE descripcion IS NULL;

SELECT 
  COUNT(*) as total_con_descripcion_corta
FROM areas
WHERE descripcion IS NOT NULL 
  AND LENGTH(TRIM(descripcion)) < 200;

SELECT 
  COUNT(*) as total_con_descripcion_completa
FROM areas
WHERE descripcion IS NOT NULL 
  AND LENGTH(TRIM(descripcion)) >= 200;

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
SELECT 
  CASE 
    WHEN descripcion IS NULL THEN 'Sin descripción (NULL)'
    WHEN LENGTH(TRIM(descripcion)) < 200 THEN 'Descripción corta (<200 chars)'
    ELSE 'Descripción completa (>=200 chars)'
  END as tipo_descripcion,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM areas
WHERE activo = true
GROUP BY tipo_descripcion
ORDER BY cantidad DESC;

