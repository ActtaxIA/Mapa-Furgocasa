-- ============================================================================
-- SCRIPT: Normalizar campo "pais" en tabla areas
-- ============================================================================
-- PROBLEMA: Hay provincias españolas (Alicante, Almería, etc.) en el campo 
--           "pais" cuando deberían estar solo en "provincia"
-- 
-- SOLUCIÓN: Este script:
--   1. Identifica provincias españolas mal clasificadas como países
--   2. Las mueve al campo "provincia" si está vacío
--   3. Actualiza el campo "pais" a "España"
--   4. Normaliza variaciones de nombres de países (España/Spain, etc.)
--   5. Verifica y reporta la limpieza
-- 
-- FECHA: 6 de Noviembre, 2025
-- AUTOR: Claude AI + Narciso
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASO 1: Backup de seguridad (crear vista temporal)
-- ============================================================================
CREATE TEMP TABLE areas_backup_paises AS
SELECT id, nombre, pais, provincia, ciudad
FROM areas
WHERE pais IN (
  'Alicante', 'Almería', 'Almeria', 'Badajoz', 'Barcelona', 'Bélgica',
  'Cantabria', 'Chequia', 'Cádiz', 'Dinamarca', 'Eslovenia',
  'Girona', 'Huelva', 'A Coruña', 'Murcia', 'Valencia',
  -- Códigos postales que aparecen como países
  '04150 Almería', '30110 Murcia', '46012 Valencia'
);

-- ============================================================================
-- PASO 2: Provincias españolas mal clasificadas como países
-- ============================================================================

-- Lista completa de provincias españolas que pueden aparecer como "pais"
UPDATE areas
SET 
  provincia = CASE 
    WHEN provincia IS NULL OR provincia = '' THEN pais
    ELSE provincia
  END,
  pais = 'España'
WHERE pais IN (
  -- Provincias españolas comunes
  'Alicante', 'Almería', 'Almeria', 'Asturias', 'Ávila', 'Avila',
  'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Caceres', 'Cádiz', 'Cadiz',
  'Cantabria', 'Castellón', 'Castellon', 'Ciudad Real', 'Córdoba', 'Cordoba',
  'A Coruña', 'La Coruña', 'Coruña', 'Cuenca', 'Girona', 'Granada',
  'Guadalajara', 'Gipuzkoa', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén', 'Jaen',
  'León', 'Leon', 'Lleida', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Malaga',
  'Murcia', 'Navarra', 'Ourense', 'Orense', 'Palencia', 'Las Palmas',
  'Pontevedra', 'Salamanca', 'Segovia', 'Sevilla', 'Soria', 'Tarragona',
  'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Bizkaia', 'Vizcaya',
  'Zamora', 'Zaragoza',
  -- Comunidades autónomas que pueden aparecer
  'Andalucía', 'Andalucia', 'Aragón', 'Aragon', 'Cataluña', 'Catalunya',
  'Castilla y León', 'Castilla-La Mancha', 'Comunidad Valenciana',
  'Extremadura', 'Galicia', 'Islas Baleares', 'Baleares', 'Islas Canarias',
  'Canarias', 'La Rioja', 'País Vasco', 'Pais Vasco', 'Euskadi'
);

-- ============================================================================
-- PASO 3: Limpiar códigos postales que aparecen como países
-- ============================================================================

-- Eliminar códigos postales del campo "pais" (formato: "04150 Almería")
UPDATE areas
SET 
  provincia = CASE
    WHEN provincia IS NULL OR provincia = '' THEN 
      TRIM(SUBSTRING(pais FROM '[A-Za-zÀ-ÿ\s]+$')) -- Extraer solo el nombre de provincia
    ELSE provincia
  END,
  pais = 'España'
WHERE pais ~ '^\d{5}\s+[A-Za-zÀ-ÿ\s]+$'; -- Regex: código postal + espacio + texto

-- ============================================================================
-- PASO 4: Normalizar nombres de países (variaciones)
-- ============================================================================

-- España / Spain / Espana → España
UPDATE areas
SET pais = 'España'
WHERE pais IN ('Spain', 'Espana', 'spain', 'ESPAÑA', 'SPAIN');

-- Portugal
UPDATE areas
SET pais = 'Portugal'
WHERE pais IN ('portugal', 'PORTUGAL');

-- Francia / France
UPDATE areas
SET pais = 'Francia'
WHERE pais IN ('France', 'france', 'FRANCE', 'FRANCIA');

-- Italia / Italy
UPDATE areas
SET pais = 'Italia'
WHERE pais IN ('Italy', 'italy', 'ITALY', 'ITALIA');

-- Alemania / Germany
UPDATE areas
SET pais = 'Alemania'
WHERE pais IN ('Germany', 'germany', 'GERMANY', 'ALEMANIA', 'Deutschland');

-- Países Bajos / Netherlands / Holanda
UPDATE areas
SET pais = 'Países Bajos'
WHERE pais IN ('Netherlands', 'netherlands', 'Holanda', 'Holland', 'Nederland');

-- Bélgica / Belgium
UPDATE areas
SET pais = 'Bélgica'
WHERE pais IN ('Belgium', 'belgium', 'BELGIUM', 'Belgica', 'België');

-- Reino Unido / United Kingdom / UK
UPDATE areas
SET pais = 'Reino Unido'
WHERE pais IN ('United Kingdom', 'UK', 'Great Britain', 'Inglaterra', 'England');

-- Suiza / Switzerland
UPDATE areas
SET pais = 'Suiza'
WHERE pais IN ('Switzerland', 'switzerland', 'Schweiz', 'Suisse');

-- Austria / Österreich
UPDATE areas
SET pais = 'Austria'
WHERE pais IN ('austria', 'AUSTRIA', 'Österreich');

-- República Checa / Chequia / Czech Republic
UPDATE areas
SET pais = 'República Checa'
WHERE pais IN ('Chequia', 'Czech Republic', 'Czechia', 'Česko');

-- Dinamarca / Denmark
UPDATE areas
SET pais = 'Dinamarca'
WHERE pais IN ('Denmark', 'denmark', 'Danmark');

-- Eslovenia / Slovenia
UPDATE areas
SET pais = 'Eslovenia'
WHERE pais IN ('Slovenia', 'slovenia', 'Slovenija');

-- Noruega / Norway
UPDATE areas
SET pais = 'Noruega'
WHERE pais IN ('Norway', 'norway', 'Norge');

-- Suecia / Sweden
UPDATE areas
SET pais = 'Suecia'
WHERE pais IN ('Sweden', 'sweden', 'Sverige');

-- Finlandia / Finland
UPDATE areas
SET pais = 'Finlandia'
WHERE pais IN ('Finland', 'finland', 'Suomi');

-- Polonia / Poland
UPDATE areas
SET pais = 'Polonia'
WHERE pais IN ('Poland', 'poland', 'Polska');

-- Grecia / Greece
UPDATE areas
SET pais = 'Grecia'
WHERE pais IN ('Greece', 'greece', 'Hellas');

-- Croacia / Croatia
UPDATE areas
SET pais = 'Croacia'
WHERE pais IN ('Croatia', 'croatia', 'Hrvatska');

-- Irlanda / Ireland
UPDATE areas
SET pais = 'Irlanda'
WHERE pais IN ('Ireland', 'ireland', 'Éire');

-- Islandia / Iceland
UPDATE areas
SET pais = 'Islandia'
WHERE pais IN ('Iceland', 'iceland', 'Ísland');

-- Marruecos / Morocco / Maroc
UPDATE areas
SET pais = 'Marruecos'
WHERE pais IN ('Morocco', 'morocco', 'Maroc', 'Al-Maghrib');

-- ============================================================================
-- PASO 5: Limpiar espacios en blanco y normalizar capitalización
-- ============================================================================

UPDATE areas
SET 
  pais = TRIM(pais),
  provincia = TRIM(provincia),
  ciudad = TRIM(ciudad)
WHERE 
  pais LIKE ' %' OR pais LIKE '% ' OR
  provincia LIKE ' %' OR provincia LIKE '% ' OR
  ciudad LIKE ' %' OR ciudad LIKE '% ';

-- ============================================================================
-- PASO 6: Reportes de verificación
-- ============================================================================

-- Ver cuántos registros fueron actualizados
DO $$
DECLARE
  total_actualizado INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_actualizado
  FROM areas_backup_paises;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'LIMPIEZA COMPLETADA';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total de áreas con países corregidos: %', total_actualizado;
END $$;

-- Mostrar lista de países únicos DESPUÉS de la limpieza
SELECT 
  pais,
  COUNT(*) as total_areas,
  COUNT(DISTINCT provincia) as provincias_unicas,
  COUNT(DISTINCT ciudad) as ciudades_unicas
FROM areas
WHERE activo = true
GROUP BY pais
ORDER BY total_areas DESC;

COMMIT;

-- ============================================================================
-- VERIFICACIÓN POST-LIMPIEZA (ejecutar después del script principal)
-- ============================================================================

-- Ver si quedan provincias españolas en el campo "pais"
SELECT DISTINCT pais, COUNT(*) as total
FROM areas
WHERE pais IN (
  'Alicante', 'Almería', 'Almeria', 'Badajoz', 'Barcelona', 'Cantabria',
  'Cádiz', 'Cadiz', 'Girona', 'Huelva', 'Murcia', 'Valencia',
  'A Coruña', 'La Coruña'
)
GROUP BY pais;

-- Si devuelve 0 filas → ✅ Limpieza exitosa

-- ============================================================================
-- ROLLBACK (si algo sale mal, ejecutar esto)
-- ============================================================================
-- 
-- BEGIN;
-- UPDATE areas a
-- SET 
--   pais = b.pais,
--   provincia = b.provincia
-- FROM areas_backup_paises b
-- WHERE a.id = b.id;
-- COMMIT;
--
-- ============================================================================




