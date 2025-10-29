-- ============================================================================
-- Script: Corregir mapeo comunidad_autonoma (versión SIN TILDES)
-- Descripción: Mapea provincias a CCAA considerando nombres sin tildes
-- Fecha: 2025-10-29
-- ============================================================================

-- Limpiar mapeo anterior (opcional)
-- UPDATE areas SET comunidad_autonoma = NULL WHERE activo = true;

-- ============================================================================
-- MAPEO ESPAÑA: Provincia → Comunidad Autónoma (SIN TILDES)
-- ============================================================================

-- Andalucía
UPDATE areas SET comunidad_autonoma = 'Andalucía', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Almeria', 'Almería', 'Cadiz', 'Cádiz', 'Cordoba', 'Córdoba', 'Granada', 'Huelva', 'Jaen', 'Jaén', 'Malaga', 'Málaga', 'Sevilla');

-- Aragón
UPDATE areas SET comunidad_autonoma = 'Aragón', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Huesca', 'Teruel', 'Zaragoza');

-- Asturias
UPDATE areas SET comunidad_autonoma = 'Asturias', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Asturias', 'Principado de Asturias');

-- Islas Baleares
UPDATE areas SET comunidad_autonoma = 'Islas Baleares', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Baleares', 'Islas Baleares', 'Illes Balears');

-- Canarias
UPDATE areas SET comunidad_autonoma = 'Canarias', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Las Palmas', 'Santa Cruz de Tenerife', 'Tenerife');

-- Cantabria
UPDATE areas SET comunidad_autonoma = 'Cantabria', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Cantabria';

-- Castilla y León
UPDATE areas SET comunidad_autonoma = 'Castilla y León', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Avila', 'Ávila', 'Burgos', 'Leon', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora');

-- Castilla-La Mancha
UPDATE areas SET comunidad_autonoma = 'Castilla-La Mancha', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo');

-- Cataluña
UPDATE areas SET comunidad_autonoma = 'Cataluña', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Barcelona', 'Girona', 'Gerona', 'Lerida', 'Lérida', 'Lleida', 'Tarragona');

-- Comunidad Valenciana
UPDATE areas SET comunidad_autonoma = 'Comunidad Valenciana', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Alicante', 'Castellon', 'Castellón', 'Valencia');

-- Extremadura
UPDATE areas SET comunidad_autonoma = 'Extremadura', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Badajoz', 'Caceres', 'Cáceres');

-- Galicia
UPDATE areas SET comunidad_autonoma = 'Galicia', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('La Coruña', 'A Coruña', 'Lugo', 'Ourense', 'Orense', 'Pontevedra');

-- Comunidad de Madrid
UPDATE areas SET comunidad_autonoma = 'Comunidad de Madrid', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Madrid';

-- Región de Murcia
UPDATE areas SET comunidad_autonoma = 'Región de Murcia', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Murcia';

-- Comunidad Foral de Navarra
UPDATE areas SET comunidad_autonoma = 'Navarra', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Navarra';

-- País Vasco
UPDATE areas SET comunidad_autonoma = 'País Vasco', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Alava', 'Álava', 'Araba', 'Guipuzcoa', 'Guipúzcoa', 'Gipuzkoa', 'Vizcaya', 'Bizkaia');

-- La Rioja
UPDATE areas SET comunidad_autonoma = 'La Rioja', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'La Rioja';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver cuántas áreas se mapearon por CCAA
SELECT 
  comunidad_autonoma,
  COUNT(*) as areas
FROM areas
WHERE pais = 'España' AND activo = true
GROUP BY comunidad_autonoma
ORDER BY areas DESC;

-- Ver áreas de España que AÚN no tienen CCAA
SELECT 
  provincia,
  COUNT(*) as areas_sin_ccaa
FROM areas
WHERE pais = 'España' 
  AND activo = true
  AND comunidad_autonoma IS NULL
GROUP BY provincia
ORDER BY areas_sin_ccaa DESC;

-- Resumen final de España
SELECT 
  COUNT(DISTINCT comunidad_autonoma) as total_ccaa,
  COUNT(DISTINCT provincia) as total_provincias,
  COUNT(*) as total_areas,
  COUNT(CASE WHEN comunidad_autonoma IS NOT NULL THEN 1 END) as areas_con_ccaa,
  COUNT(CASE WHEN comunidad_autonoma IS NULL THEN 1 END) as areas_sin_ccaa
FROM areas
WHERE pais = 'España' AND activo = true;

