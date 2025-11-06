-- ============================================================================
-- SCRIPT SIMPLE: Corregir provincias españolas en campo "pais"
-- ============================================================================
-- Este script solo corrige las provincias españolas más comunes
-- que aparecen incorrectamente como países
-- 
-- USO: Ejecutar en Supabase SQL Editor
-- FECHA: 6 de Noviembre, 2025
-- ============================================================================

-- Ver ANTES de ejecutar: qué provincias están mal clasificadas
SELECT DISTINCT pais, COUNT(*) as total
FROM areas
WHERE pais IN (
  'Alicante', 'Almería', 'Almeria', 'Badajoz', 'Barcelona', 
  'Cantabria', 'Cádiz', 'Cadiz', 'Girona', 'Huelva', 
  'Murcia', 'Valencia', 'A Coruña', 'La Coruña',
  '04150 Almería', '30110 Murcia', '46012 Valencia'
)
GROUP BY pais
ORDER BY total DESC;

-- ============================================================================
-- CORRECCIÓN PRINCIPAL
-- ============================================================================

BEGIN;

-- 1. Mover provincias españolas de "pais" a "provincia" (si provincia está vacía)
UPDATE areas
SET 
  provincia = COALESCE(NULLIF(provincia, ''), pais),
  pais = 'España'
WHERE pais IN (
  'Alicante', 'Almería', 'Almeria', 'Badajoz', 'Barcelona', 
  'Cantabria', 'Cádiz', 'Cadiz', 'Girona', 'Huelva', 
  'Murcia', 'Valencia', 'A Coruña', 'La Coruña'
);

-- 2. Limpiar códigos postales que aparecen como países (ej: "04150 Almería")
UPDATE areas
SET 
  provincia = COALESCE(
    NULLIF(provincia, ''), 
    TRIM(REGEXP_REPLACE(pais, '^\d{5}\s+', '', 'g'))
  ),
  pais = 'España'
WHERE pais ~ '^\d{5}\s+'; -- Empieza con código postal

-- 3. Normalizar "Spain" → "España"
UPDATE areas
SET pais = 'España'
WHERE pais IN ('Spain', 'Espana', 'spain', 'ESPAÑA');

COMMIT;

-- ============================================================================
-- VERIFICACIÓN POST-LIMPIEZA
-- ============================================================================

-- Ver países únicos DESPUÉS de la corrección
SELECT DISTINCT pais, COUNT(*) as total_areas
FROM areas
WHERE activo = true
GROUP BY pais
ORDER BY total_areas DESC;

-- Verificar que NO quedan provincias en el campo "pais"
SELECT DISTINCT pais, COUNT(*) as total
FROM areas
WHERE pais IN (
  'Alicante', 'Almería', 'Almeria', 'Badajoz', 'Barcelona', 
  'Cantabria', 'Cádiz', 'Cadiz', 'Girona', 'Huelva', 
  'Murcia', 'Valencia'
)
GROUP BY pais;

-- Si esta última query devuelve 0 filas → ✅ Limpieza exitosa

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Países válidos en el dropdown:
--   España, Portugal, Francia, Italia, Alemania, etc.
-- 
-- Provincias españolas ahora en campo "provincia":
--   Alicante, Almería, Badajoz, etc.
-- ============================================================================





