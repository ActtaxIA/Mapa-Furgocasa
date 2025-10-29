-- ============================================================================
-- Script: Normalizar y limpiar países en la tabla areas
-- Descripción: Elimina códigos postales y datos incorrectos del campo país
-- Fecha: 2025-10-29
-- ============================================================================

-- 1. Ver el estado actual de países (identificar el desastre)
SELECT 
  pais,
  COUNT(*) as cantidad_areas
FROM areas
WHERE activo = true
GROUP BY pais
ORDER BY pais;

-- 2. Identificar países que son códigos postales o datos incorrectos
-- (Códigos postales suelen tener números o ser muy cortos)
SELECT 
  pais,
  COUNT(*) as cantidad,
  MIN(ciudad) as ejemplo_ciudad,
  MIN(provincia) as ejemplo_provincia
FROM areas
WHERE activo = true
  AND (
    pais ~ '^[0-9]' -- Empieza con número
    OR LENGTH(pais) < 4 -- Muy corto
    OR pais LIKE '%[0-9][0-9][0-9][0-9]%' -- Contiene 4 números seguidos
  )
GROUP BY pais
ORDER BY cantidad DESC;

-- ============================================================================
-- LIMPIEZA AUTOMÁTICA
-- ============================================================================

-- 3. Detectar el país correcto desde provincia/ciudad para España
UPDATE areas
SET 
  pais = 'España',
  updated_at = NOW()
WHERE activo = true
  AND (
    -- Provincia es española
    provincia IN (
      'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
      'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
      'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada',
      'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén', 'La Coruña',
      'La Rioja', 'Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga',
      'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca',
      'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Tenerife', 'Teruel',
      'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
    )
    -- País es una provincia española (error común)
    OR pais IN (
      'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
      'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
      'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada',
      'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén', 'La Coruña',
      'La Rioja', 'Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga',
      'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca',
      'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Tenerife', 'Teruel',
      'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
    )
    -- País es código postal
    OR pais ~ '^[0-9]'
    -- País contiene nombre de ciudad/provincia española
    OR pais LIKE '%Barcelona%'
    OR pais LIKE '%Madrid%'
    OR pais LIKE '%Valencia%'
    OR pais LIKE '%Ciudad Real%'
  );

-- 4. Limpiar países que son códigos postales para Francia
UPDATE areas
SET 
  pais = 'Francia',
  updated_at = NOW()
WHERE activo = true
  AND pais ~ '^[0-9]{5}\s' -- Formato código postal francés
  AND (
    provincia LIKE '%France%' 
    OR ciudad IN (SELECT ciudad FROM areas WHERE pais = 'Francia' AND activo = true)
  );

-- 5. Limpiar países que son códigos postales para Portugal
UPDATE areas
SET 
  pais = 'Portugal',
  updated_at = NOW()
WHERE activo = true
  AND pais ~ '^[0-9]{4}-[0-9]{3}'
  AND provincia LIKE '%Portugal%';

-- 6. Limpiar países que son códigos postales para Alemania
UPDATE areas
SET 
  pais = 'Alemania',
  updated_at = NOW()
WHERE activo = true
  AND pais ~ '^[0-9]{5}\s'
  AND provincia LIKE '%Alemania%';

-- ============================================================================
-- NORMALIZACIÓN DE NOMBRES DE PAÍSES
-- ============================================================================

-- 7. Normalizar nombres de países comunes
UPDATE areas SET pais = 'España', updated_at = NOW() 
WHERE pais IN ('Spain', 'ESPAÑA', 'spain', 'Espana', 'ES') AND activo = true;

UPDATE areas SET pais = 'Francia', updated_at = NOW() 
WHERE pais IN ('France', 'FRANCIA', 'france', 'FR') AND activo = true;

UPDATE areas SET pais = 'Portugal', updated_at = NOW() 
WHERE pais IN ('PORTUGAL', 'portugal', 'PT') AND activo = true;

UPDATE areas SET pais = 'Italia', updated_at = NOW() 
WHERE pais IN ('Italy', 'ITALIA', 'italy', 'IT') AND activo = true;

UPDATE areas SET pais = 'Alemania', updated_at = NOW() 
WHERE pais IN ('Germany', 'ALEMANIA', 'germany', 'Deutschland', 'DE') AND activo = true;

UPDATE areas SET pais = 'Reino Unido', updated_at = NOW() 
WHERE pais IN ('United Kingdom', 'UK', 'England', 'Great Britain', 'GB') AND activo = true;

UPDATE areas SET pais = 'Países Bajos', updated_at = NOW() 
WHERE pais IN ('Netherlands', 'Holland', 'NL', 'Holanda') AND activo = true;

UPDATE areas SET pais = 'Bélgica', updated_at = NOW() 
WHERE pais IN ('Belgium', 'BÉLGICA', 'Belgica', 'BE') AND activo = true;

UPDATE areas SET pais = 'Suiza', updated_at = NOW() 
WHERE pais IN ('Switzerland', 'Schweiz', 'Suisse', 'CH') AND activo = true;

UPDATE areas SET pais = 'Austria', updated_at = NOW() 
WHERE pais IN ('Österreich', 'AT') AND activo = true;

UPDATE areas SET pais = 'Noruega', updated_at = NOW() 
WHERE pais IN ('Norway', 'NO') AND activo = true;

UPDATE areas SET pais = 'Suecia', updated_at = NOW() 
WHERE pais IN ('Sweden', 'SE') AND activo = true;

UPDATE areas SET pais = 'Dinamarca', updated_at = NOW() 
WHERE pais IN ('Denmark', 'DK') AND activo = true;

UPDATE areas SET pais = 'Polonia', updated_at = NOW() 
WHERE pais IN ('Poland', 'PL') AND activo = true;

UPDATE areas SET pais = 'República Checa', updated_at = NOW() 
WHERE pais IN ('Czech Republic', 'Czechia', 'CZ') AND activo = true;

UPDATE areas SET pais = 'Croacia', updated_at = NOW() 
WHERE pais IN ('Croatia', 'HR') AND activo = true;

UPDATE areas SET pais = 'Grecia', updated_at = NOW() 
WHERE pais IN ('Greece', 'GR') AND activo = true;

UPDATE areas SET pais = 'Irlanda', updated_at = NOW() 
WHERE pais IN ('Ireland', 'IE') AND activo = true;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- 8. Ver países limpios y organizados
SELECT 
  pais,
  COUNT(*) as total_areas,
  COUNT(DISTINCT provincia) as provincias_unicas,
  COUNT(DISTINCT ciudad) as ciudades_unicas
FROM areas
WHERE activo = true
GROUP BY pais
ORDER BY total_areas DESC;

-- 9. Identificar áreas que aún tienen países sospechosos
SELECT 
  id,
  nombre,
  pais,
  provincia,
  ciudad,
  direccion
FROM areas
WHERE activo = true
  AND (
    pais ~ '^[0-9]' -- Aún empieza con número
    OR LENGTH(pais) < 4 -- Aún muy corto
  )
LIMIT 50;

-- 10. Resumen final por país
SELECT 
  pais,
  COUNT(*) as areas,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM areas
WHERE activo = true
GROUP BY pais
ORDER BY areas DESC;

