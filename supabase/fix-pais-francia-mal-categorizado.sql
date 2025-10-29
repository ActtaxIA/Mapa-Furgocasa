-- ============================================================================
-- Script: Corregir áreas francesas categorizadas como España
-- Descripción: Detecta códigos postales franceses y corrige el país
-- Fecha: 2025-10-29
-- ============================================================================

-- Ver cuántas áreas están mal
SELECT 
  COUNT(*) as areas_francia_como_espana,
  MIN(provincia) as ejemplo_1,
  MAX(provincia) as ejemplo_2
FROM areas
WHERE pais = 'España'
  AND activo = true
  AND (provincia ~ '^[0-9]{5}' OR provincia LIKE '%-%');

-- ============================================================================
-- CORRECCIÓN: Cambiar país de España → Francia
-- ============================================================================

-- Códigos postales franceses empiezan con números de 5 dígitos
-- y pueden tener guiones (ej: 44770 La Plaine-sur-Mer)
UPDATE areas
SET 
  pais = 'Francia',
  updated_at = NOW()
WHERE pais = 'España'
  AND activo = true
  AND (
    provincia ~ '^[0-9]{5}' -- Empieza con 5 números (código postal francés)
    OR provincia LIKE '%-%' -- Contiene guion (típico de Francia)
  );

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver cuántas se corrigieron
SELECT 
  pais,
  COUNT(*) as total_areas
FROM areas
WHERE activo = true
  AND pais IN ('España', 'Francia')
GROUP BY pais
ORDER BY pais;

-- Ver provincias de España que quedaron sin CCAA después de la corrección
SELECT 
  provincia,
  COUNT(*) as areas
FROM areas
WHERE pais = 'España' 
  AND activo = true
  AND comunidad_autonoma IS NULL
GROUP BY provincia
ORDER BY areas DESC
LIMIT 20;

-- Resumen final de España
SELECT 
  COUNT(DISTINCT comunidad_autonoma) as total_ccaa,
  COUNT(DISTINCT provincia) as total_provincias,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN comunidad_autonoma IS NOT NULL THEN 1 END) as areas_con_ccaa,
  COUNT(CASE WHEN comunidad_autonoma IS NULL THEN 1 END) as areas_sin_ccaa
FROM areas
WHERE pais = 'España' AND activo = true;

